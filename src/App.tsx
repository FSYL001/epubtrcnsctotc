import type { JSX } from "react";
import { useState, useCallback, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UploadZone } from "@/components/UploadZone";
import { FileList } from "@/components/FileList";
import type { FileEntry, ConversionDirection } from "@/lib/constants";
import { generateId } from "@/lib/constants";
import { useLanguage } from "@/hooks/useLanguage";
import { getMessages } from "@/lib/i18n";

type WorkerOutput =
  | { type: "progress"; fileId: string; phase: string }
  | { type: "complete"; fileId: string; fileData: ArrayBuffer; fileName: string }
  | { type: "error"; fileId: string; error: string };

export default function App(): JSX.Element {
  const { lang } = useLanguage();
  const t = getMessages(lang);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [converting, setConverting] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const queueRef = useRef<Array<{ id: string; data: ArrayBuffer; name: string }>>([]);

  const pendingCount = entries.filter((e) => e.status === "pending").length;
  const hasPending = pendingCount > 0;

  const getWorker = useCallback((): Worker => {
    if (!workerRef.current) {
      const w = new Worker(
        new URL("./workers/converter.worker.ts", import.meta.url),
        { type: "module" },
      );
      workerRef.current = w;
    }
    return workerRef.current;
  }, []);

  const startQueue = useCallback((direction: ConversionDirection): void => {
    const worker = getWorker();
    const resolvedDir = direction === "auto" ? "s2t" : direction;

    worker.onmessage = (e: MessageEvent<WorkerOutput>): void => {
      const msg = e.data;
      if (msg.type === "complete") {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === msg.fileId
              ? { ...e, status: "done", data: msg.fileData, name: msg.fileName }
              : e,
          ),
        );
        queueRef.current.shift();
        processNext();
      } else if (msg.type === "error") {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === msg.fileId
              ? { ...e, status: "error", error: msg.error }
              : e,
          ),
        );
        queueRef.current.shift();
        processNext();
      }
    };

    function processNext(): void {
      if (queueRef.current.length === 0) {
        setConverting(false);
        return;
      }
      const next = queueRef.current[0];
      setEntries((prev) =>
        prev.map((e) =>
          e.id === next.id ? { ...e, status: "converting" } : e,
        ),
      );
      worker.postMessage(
        {
          type: "convert",
          fileId: next.id,
          fileName: next.name,
          fileData: next.data,
          direction: resolvedDir,
        },
        [next.data],
      );
    }

    if (queueRef.current.length > 0) {
      setConverting(true);
      processNext();
    }
  }, [getWorker]);

  const handleConvert = useCallback(
    (direction: ConversionDirection): void => {
      // Collect all pending entries into the queue
      const newQueue: Array<{ id: string; data: ArrayBuffer; name: string }> = [];
      setEntries((prev) => {
        for (const e of prev) {
          if (e.status === "pending" && e.data) {
            newQueue.push({ id: e.id, data: e.data, name: e.name });
          }
        }
        return prev;
      });
      queueRef.current = newQueue;
      if (newQueue.length > 0) {
        startQueue(direction);
      }
    },
    [startQueue],
  );

  const handleFiles = useCallback(
    (files: File[]): void => {
      const newEntries: FileEntry[] = [];
      for (const file of files) {
        const id = generateId();
        const entry: FileEntry = {
          id,
          name: file.name,
          size: file.size,
          status: "pending",
        };
        newEntries.push(entry);
        // Read file and store data
        file.arrayBuffer().then((data) => {
          setEntries((prev) =>
            prev.map((e) => (e.id === id ? { ...e, data } : e)),
          );
        });
      }
      setEntries((prev) => [...prev, ...newEntries]);
    },
    [],
  );

  const handleRemove = useCallback((id: string): void => {
    queueRef.current = queueRef.current.filter((q) => q.id !== id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleDownload = useCallback((entry: FileEntry): void => {
    if (!entry.data) return;
    const blob = new Blob([entry.data], {
      type: "application/epub+zip",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = entry.name;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 max-w-lg mx-auto px-6 py-8 w-full space-y-5">
        <UploadZone onFiles={handleFiles} disabled={converting} />

        {hasPending && !converting && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleConvert("s2t")}
              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            >
              {t.convertS2T}
            </button>
            <button
              onClick={() => handleConvert("t2s")}
              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            >
              {t.convertT2S}
            </button>
            <button
              onClick={() => handleConvert("auto")}
              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            >
              {t.convertAuto}
            </button>
          </div>
        )}

        <FileList
          entries={entries}
          onRemove={handleRemove}
          onDownload={handleDownload}
        />

        <div className="pt-6 space-y-2">
          <h3 className="text-sm font-semibold">{t.introTitle}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
            {t.introText}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
