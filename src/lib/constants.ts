export type ConversionDirection = "s2t" | "t2s" | "auto";

export type FileStatus = "pending" | "converting" | "done" | "error";

export interface FileEntry {
  id: string;
  name: string;
  size: number;
  status: FileStatus;
  error?: string;
  data?: ArrayBuffer;
}

export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
}

export function generateId(): string {
  return crypto.randomUUID();
}
