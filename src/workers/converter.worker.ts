import JSZip from "jszip";
import OpenCC from "opencc-js";
import type { ConverterFunction } from "opencc-js";
import { XMLParser, XMLBuilder } from "fast-xml-parser";

interface ConvertMessage {
  type: "convert";
  fileId: string;
  fileName: string;
  fileData: ArrayBuffer;
  direction: "s2t" | "t2s";
}

interface ProgressPayload {
  type: "progress";
  fileId: string;
  phase: string;
}

interface CompletePayload {
  type: "complete";
  fileId: string;
  fileData: ArrayBuffer;
  fileName: string;
}

interface ErrorPayload {
  type: "error";
  fileId: string;
  error: string;
}

type WorkerOutput = ProgressPayload | CompletePayload | ErrorPayload;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
});

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  format: false,
  suppressEmptyNode: true,
  suppressBooleanAttributes: false,
});

function post(msg: WorkerOutput): void {
  self.postMessage(msg);
}

function walkAndConvert(
  obj: unknown,
  converter: ConverterFunction,
): void {
  if (obj === null || obj === undefined) return;
  if (typeof obj !== "object") return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      walkAndConvert(item, converter);
    }
    return;
  }

  const record = obj as Record<string, unknown>;
  for (const [key, value] of Object.entries(record)) {
    if (key === "#text" && typeof value === "string") {
      record[key] = converter(value);
    } else {
      walkAndConvert(value, converter);
    }
  }
}

function convertXhtmlContent(
  xhtml: string,
  converter: ConverterFunction,
): string {
  const parts: string[] = [];
  let textStart = -1;
  let inScriptOrStyle = false;

  for (let i = 0; i < xhtml.length; i++) {
    if (xhtml[i] === "<") {
      if (textStart >= 0) {
        const text = xhtml.slice(textStart, i);
        if (text.trim() && !inScriptOrStyle) {
          parts.push(converter(text));
        } else {
          parts.push(text);
        }
        textStart = -1;
      }

      const tagEnd = xhtml.indexOf(">", i);
      if (tagEnd === -1) {
        parts.push(xhtml.slice(i));
        break;
      }

      const tag = xhtml.slice(i, tagEnd + 1);
      const lowerTag = tag.toLowerCase();

      if (
        (lowerTag.startsWith("<script") && !lowerTag.startsWith("</script")) ||
        (lowerTag.startsWith("<style") && !lowerTag.startsWith("</style"))
      ) {
        inScriptOrStyle = true;
      } else if (
        lowerTag.startsWith("</script") ||
        lowerTag.startsWith("</style")
      ) {
        inScriptOrStyle = false;
      }

      parts.push(tag);
      i = tagEnd;
    } else if (textStart < 0) {
      textStart = i;
    }
  }

  if (textStart >= 0) {
    const text = xhtml.slice(textStart);
    if (text.trim()) {
      parts.push(converter(text));
    } else {
      parts.push(text);
    }
  }

  return parts.join("");
}

async function convertEpub(
  fileId: string,
  fileName: string,
  fileData: ArrayBuffer,
  converter: ConverterFunction,
): Promise<void> {
  post({ type: "progress", fileId, phase: "Reading EPUB archive" });

  const zip = await JSZip.loadAsync(fileData);

  post({ type: "progress", fileId, phase: "Parsing container" });

  // Read META-INF/container.xml
  const containerEntry = zip.file("META-INF/container.xml");
  if (!containerEntry) {
    throw new Error("Invalid EPUB: missing META-INF/container.xml");
  }
  const containerXml = await containerEntry.async("string");
  const container = parser.parse(containerXml);

  const rootfiles = container?.container?.rootfiles?.rootfile;
  const opfPath = Array.isArray(rootfiles)
    ? rootfiles[0]?.["@_full-path"] ?? ""
    : rootfiles?.["@_full-path"] ?? "";
  if (!opfPath) {
    throw new Error("Invalid EPUB: no rootfile found");
  }
  const opfDir = opfPath.includes("/")
    ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1)
    : "";

  post({ type: "progress", fileId, phase: "Converting metadata" });

  // Parse OPF
  const opfEntry = zip.file(opfPath);
  if (!opfEntry) {
    throw new Error("Invalid EPUB: OPF file not found");
  }
  const opfContent = await opfEntry.async("string");
  const opf = parser.parse(opfContent);

  // Convert metadata
  const metadata = opf?.package?.metadata;
  if (metadata) {
    walkAndConvert(metadata, converter);
  }

  // Serialize updated OPF
  const updatedOpf = builder.build(opf);
  zip.file(opfPath, updatedOpf);

  post({ type: "progress", fileId, phase: "Converting content files" });

  // Collect content entries from manifest
  const manifest = opf?.package?.manifest?.item;
  const manifestItems = manifest ? (Array.isArray(manifest) ? manifest : [manifest]) : [];
  const contentEntries: Array<{ href: string; mediaType: string }> = [];
  for (const item of manifestItems) {
    const href = item["@_href"] ?? "";
    const mediaType = item["@_media-type"] ?? "";
    contentEntries.push({ href, mediaType });
  }

  // Convert each XHTML/HTML file
  let convertedCount = 0;
  const totalContent = contentEntries.length;

  for (const entry of contentEntries) {
    const isXhtml =
      entry.mediaType === "application/xhtml+xml" ||
      entry.href.endsWith(".xhtml") ||
      entry.href.endsWith(".html") ||
      entry.mediaType === "text/html";

    if (!isXhtml) continue;

    const filePath = opfDir + entry.href;
    const fileEntry = zip.file(filePath);
    if (!fileEntry) continue;

    const content = await fileEntry.async("string");
    if (!content) continue;

    const updatedContent = convertXhtmlContent(content, converter);
    zip.file(filePath, updatedContent);

    convertedCount++;
    if (convertedCount % 5 === 0) {
      post({
        type: "progress",
        fileId,
        phase: `Converted ${convertedCount} of ${totalContent} files`,
      });
    }
  }

  // Convert NCX (toc)
  const ncxItem = manifestItems.find(
    (item: Record<string, unknown>) =>
      item["@_media-type"] === "application/x-dtbncx+xml",
  );
  if (ncxItem) {
    const ncxHref = ncxItem["@_href"] as string | undefined;
    if (ncxHref) {
      const ncxPath = opfDir + ncxHref;
      const ncxFile = zip.file(ncxPath);
      if (ncxFile) {
        const ncxContent = await ncxFile.async("string");
        const ncx = parser.parse(ncxContent);
        walkAndConvert(ncx, converter);
        zip.file(ncxPath, builder.build(ncx));
      }
    }
  }

  post({ type: "progress", fileId, phase: "Generating EPUB file" });

  // Generate new EPUB
  const newZipData = await zip.generateAsync({
    type: "arraybuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const outName = fileName.replace(/\.epub$/i, "") + "_converted.epub";

  post({
    type: "complete",
    fileId,
    fileData: newZipData,
    fileName: outName,
  });
}

self.onmessage = async (e: MessageEvent<ConvertMessage>): Promise<void> => {
  const { fileId, fileName, fileData, direction } = e.data;

  try {
    const from = direction === "s2t" ? "cn" : "tw";
    const to = direction === "s2t" ? "tw" : "cn";
    const converter = OpenCC.Converter({ from, to });

    await convertEpub(fileId, fileName, fileData, converter);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown conversion error";
    post({ type: "error", fileId, error: errorMessage });
  }
};
