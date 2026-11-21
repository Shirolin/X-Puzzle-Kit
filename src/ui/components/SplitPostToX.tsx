import { Send } from "lucide-preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import JSZip from "jszip";
import { t } from "../../core/i18n";
import { getPlatformEnv, platformCanvas } from "../../core/platform";
import { getSplitFilename } from "../../core/splitLayout";

const X_COMPOSER = "https://x.com/compose/post";
const CHROMIUM_SHARE_MAX_FILES = 10;
const CHROMIUM_SHARE_MAX_BYTES = 50 * 1024 * 1024;

async function asPng(blob: Blob): Promise<Blob> {
  if (blob.type === "image/png") return blob;

  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = platformCanvas.create(bitmap.width, bitmap.height);
    try {
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas 2D unavailable");
      context.drawImage(bitmap, 0, 0);
      const png = await platformCanvas.toBlob(canvas);
      if (!png) throw new Error("PNG encode failed");
      return png;
    } finally {
      platformCanvas.dispose(canvas);
    }
  } finally {
    bitmap.close();
  }
}

interface SplitPostToXProps {
  blobs: Blob[];
  download: (blob: Blob, filename: string) => void;
  onPostToX?: (
    files: File[],
    signal: AbortSignal,
  ) => Promise<string | undefined>;
}

export function SplitPostToX({
  blobs,
  download,
  onPostToX,
}: SplitPostToXProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const posting = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);
  const [shareFailed, setShareFailed] = useState(false);
  const [composerError, setComposerError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setShareFailed(false);
    setComposerError("");
    setNotice("");
    return () => posting.current?.abort();
  }, [blobs]);

  const files = useMemo(
    () =>
      blobs.map((blob, index) => {
        const name = getSplitFilename(blob, index, blobs.length);
        return new File([blob], name, { type: blob.type });
      }),
    [blobs],
  );
  const tooManyFiles = files.length > CHROMIUM_SHARE_MAX_FILES;
  const browserCanShareFiles =
    !onPostToX &&
    typeof navigator.share === "function" &&
    Boolean(navigator.canShare?.({ files }));
  const exceedsChromiumShareLimits =
    browserCanShareFiles &&
    navigator.userAgent.includes("Chrome/") &&
    (tooManyFiles ||
      files.reduce((bytes, file) => bytes + file.size, 0) >
        CHROMIUM_SHARE_MAX_BYTES);
  const canShare =
    browserCanShareFiles && !shareFailed && !exceedsChromiumShareLimits;
  const { isIOS, isAndroid } = getPlatformEnv();
  const shareFromEntry = canShare && (isIOS || isAndroid);
  let fallbackHint = "";
  if (onPostToX) {
    fallbackHint = composerError && t(composerError);
  } else if (shareFailed) {
    fallbackHint = t("postShareFailed");
  } else if (exceedsChromiumShareLimits) {
    fallbackHint = tooManyFiles
      ? t("postShareCountLimit", [
          String(files.length),
          String(CHROMIUM_SHARE_MAX_FILES),
        ])
      : t("postShareSizeLimit");
  } else if (!canShare) {
    fallbackHint = t("postShareUnavailable");
  }
  const canCopy =
    files.length === 1 &&
    typeof ClipboardItem !== "undefined" &&
    typeof navigator.clipboard?.write === "function";

  async function postToComposer() {
    if (!onPostToX || (posting.current && !posting.current.signal.aborted))
      return;
    const request = new AbortController();
    posting.current = request;
    setBusy(true);
    setComposerError("");
    setNotice("");
    let error: string | undefined;
    try {
      error = await onPostToX(files, request.signal);
    } catch {
      error = "postComposerAttachments";
    } finally {
      if (posting.current === request) {
        posting.current = null;
        setBusy(false);
        if (!request.signal.aborted && error) {
          setComposerError(error);
          dialog.current?.showModal();
        }
      }
    }
  }

  async function share(fromEntry: boolean) {
    setBusy(true);
    setNotice("");
    try {
      await navigator.share({ files });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setShareFailed(true);
      }
      if (fromEntry) dialog.current?.showModal();
    } finally {
      setBusy(false);
    }
  }

  async function copyImage() {
    setBusy(true);
    setNotice("");
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": asPng(files[0]) }),
      ]);
      setNotice("postCopied");
    } catch {
      setNotice("postCopyFailed");
    } finally {
      setBusy(false);
    }
  }

  async function downloadImages() {
    setBusy(true);
    setNotice("");
    try {
      if (files.length === 1) {
        download(files[0], files[0].name);
      } else {
        const zip = new JSZip();
        files.forEach((file) => zip.file(file.name, file));
        const archive = await zip.generateAsync({ type: "blob" });
        download(archive, "split_images.zip");
      }
    } catch {
      setNotice("postDownloadFailed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-secondary post-to-x-button"
        disabled={busy}
        onClick={() => {
          if (onPostToX) {
            void postToComposer();
          } else if (shareFromEntry) {
            void share(true);
          } else {
            setNotice("");
            dialog.current?.showModal();
          }
        }}
      >
        <Send aria-hidden="true" />
        {t(onPostToX && busy ? "processing" : "postToX")}
      </button>
      <dialog
        ref={dialog}
        className="post-to-x-dialog"
        aria-labelledby="post-to-x-title"
        aria-describedby={
          fallbackHint
            ? "post-to-x-fallback-hint post-to-x-download-hint"
            : "post-to-x-download-hint"
        }
      >
        <div className="post-to-x-content">
          <h2 id="post-to-x-title">{t("postToX")}</h2>
          {fallbackHint && <p id="post-to-x-fallback-hint">{fallbackHint}</p>}
          <p className="post-to-x-feedback" role="status">
            {busy ? t("processing") : notice && t(notice)}
          </p>
          <p id="post-to-x-download-hint">
            {t(files.length > 1 ? "postDownloadZipHint" : "postDownloadHint")}
          </p>
          <div className="post-to-x-actions">
            {canCopy && (
              <button
                type="button"
                className="btn btn-secondary"
                disabled={busy}
                onClick={() => void copyImage()}
              >
                {t("postCopyImage")}
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() => void downloadImages()}
            >
              {t(files.length > 1 ? "zipLabel" : "postDownloadImage")}
            </button>
            <a
              className="btn btn-secondary"
              href={X_COMPOSER}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("postOpenX")}
            </a>
          </div>
          {canShare && (
            <>
              <p id="post-to-x-share-hint">{t("postShareHint")}</p>
              <button
                type="button"
                className="btn btn-secondary"
                aria-describedby="post-to-x-share-hint"
                disabled={busy}
                onClick={() => void share(false)}
              >
                {t("postShareFiles")}
              </button>
            </>
          )}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => dialog.current?.close()}
          >
            {t("close")}
          </button>
        </div>
      </dialog>
    </>
  );
}
