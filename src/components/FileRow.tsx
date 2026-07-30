import type { JSX } from "react";
import { useCallback } from "react";
import {
  Download,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type FileEntry, formatFileSize } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { getMessages } from "@/lib/i18n";

interface FileRowProps {
  entry: FileEntry;
  onRemove: (id: string) => void;
  onDownload: (entry: FileEntry) => void;
}

export function FileRow({ entry, onRemove, onDownload }: FileRowProps): JSX.Element {
  const { lang } = useLanguage();
  const t = getMessages(lang);

  const handleRemove = useCallback(() => {
    onRemove(entry.id);
  }, [onRemove, entry.id]);

  const handleDownload = useCallback(() => {
    onDownload(entry);
  }, [onDownload, entry]);

  const statusLabel = () => {
    switch (entry.status) {
      case "pending": return t.statusPending;
      case "converting": return t.statusConverting;
      case "done": return t.statusDone;
      case "error": return t.statusError;
    }
  };

  const statusIcon = () => {
    switch (entry.status) {
      case "converting":
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card transition-colors",
      )}
    >
      {statusIcon()}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{entry.name}</p>
          <span className="shrink-0 text-[10px] text-muted-foreground/60">{statusLabel()}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(entry.size)}
          {entry.error && (
            <span className="text-red-500 ml-2">{entry.error}</span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {entry.status === "done" && entry.data && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            title={t.download}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          title={t.remove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
