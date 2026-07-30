import type { JSX } from "react";
import { useState, useRef, useCallback, type DragEvent } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { getMessages } from "@/lib/i18n";

interface UploadZoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export function UploadZone({ onFiles, disabled }: UploadZoneProps): JSX.Element {
  const { lang } = useLanguage();
  const t = getMessages(lang);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      if (disabled) return;
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.name.toLowerCase().endsWith(".epub"),
      );
      if (files.length > 0) {
        onFiles(files);
      }
    },
    [onFiles, disabled],
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []).filter((f) =>
        f.name.toLowerCase().endsWith(".epub"),
      );
      if (files.length > 0) {
        onFiles(files);
      }
      e.target.value = "";
    },
    [onFiles],
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-12 transition-colors cursor-pointer",
        dragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/30",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".epub"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary">
        <Upload className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">{t.dropHint}</p>
        <p className="text-xs text-muted-foreground mt-1">{t.clickBrowse}</p>
      </div>
    </div>
  );
}
