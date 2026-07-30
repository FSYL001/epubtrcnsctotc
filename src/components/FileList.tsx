import type { JSX } from "react";
import { type FileEntry } from "@/lib/constants";
import { FileRow } from "@/components/FileRow";
import { useLanguage } from "@/hooks/useLanguage";
import { getMessages } from "@/lib/i18n";

interface FileListProps {
  entries: FileEntry[];
  onRemove: (id: string) => void;
  onDownload: (entry: FileEntry) => void;
}

export function FileList({
  entries,
  onRemove,
  onDownload,
}: FileListProps): JSX.Element {
  const { lang } = useLanguage();
  const t = getMessages(lang);

  if (entries.length === 0) {
    return <></>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {t.files} ({entries.length})
        </p>
      </div>
      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {entries.map((entry) => (
          <FileRow
            key={entry.id}
            entry={entry}
            onRemove={onRemove}
            onDownload={onDownload}
          />
        ))}
      </div>
    </div>
  );
}
