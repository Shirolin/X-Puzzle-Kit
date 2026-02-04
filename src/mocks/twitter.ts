export const DEFAULT_WORKER_URL = "";

export interface ParsedTwitterData {
  images: string[];
  error?: string;
}

export function extractTwitterUrl(_text: string): string | null {
  return null;
}

export function cleanTwitterUrl(url: string): string {
  return url;
}

export async function parseTwitterMetadata(
  _tweetUrl: string,
  _workerUrl: string = DEFAULT_WORKER_URL,
): Promise<string[]> {
  throw new Error("Twitter parsing is not supported in extension mode");
}

export async function fetchTwitterImageBlob(
  _imageUrl: string,
  _workerUrl: string = DEFAULT_WORKER_URL,
  _onProgress?: (loaded: number, total: number) => void,
): Promise<Blob> {
  throw new Error("Twitter image fetching is not supported in extension mode");
}
