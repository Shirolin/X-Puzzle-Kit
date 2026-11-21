const POST_PATH = "/compose/post";
const POST_LINK = `a[data-testid="SideNav_NewTweet_Button"][href="${POST_PATH}"]`;
const POST_EDITOR = '[contenteditable="true"][data-testid="tweetTextarea_0"]';
const MEDIA_INPUT = 'input[type="file"][data-testid="fileInput"][multiple]';
const ATTACHMENTS = '[data-testid="attachments"]';

function waitForPage<T>(
  read: () => T | undefined,
  timeout: number,
  signal: AbortSignal,
): Promise<T | undefined> {
  return new Promise((resolve) => {
    const observer = new MutationObserver(check);
    const timer = window.setTimeout(finish, timeout);

    function finish(value?: T) {
      observer.disconnect();
      window.clearTimeout(timer);
      signal.removeEventListener("abort", finishOnAbort);
      resolve(value);
    }

    function finishOnAbort() {
      finish();
    }

    function check() {
      const value = read();
      if (value !== undefined) finish(value);
    }

    if (signal.aborted) {
      finish();
      return;
    }
    signal.addEventListener("abort", finishOnAbort, { once: true });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
    check();
  });
}

function findComposer() {
  const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"]');
  for (const dialog of Array.from(dialogs).reverse()) {
    const editor = dialog.querySelector<HTMLElement>(POST_EDITOR);
    if (editor && editor.getClientRects().length) {
      return { dialog, editor };
    }
  }
}

export async function fillXComposer(files: File[], signal: AbortSignal) {
  const onPostPage = location.pathname === POST_PATH;
  const existing = findComposer();
  if (
    (!onPostPage && (existing || location.pathname.startsWith("/compose/"))) ||
    (onPostPage &&
      existing &&
      (existing.editor.textContent?.trim() ||
        existing.dialog.querySelector(ATTACHMENTS)))
  ) {
    return "postComposerDraft";
  }

  if (!onPostPage) {
    const link = document.querySelector<HTMLAnchorElement>(POST_LINK);
    if (!link) return "postComposerUnavailable";
    link.click();
  }
  const composer = await waitForPage(
    () => {
      if (location.pathname !== POST_PATH) return;
      const current = findComposer();
      const input =
        current?.dialog.querySelector<HTMLInputElement>(MEDIA_INPUT);
      if (current && input) return { ...current, input };
    },
    5_000,
    signal,
  );
  if (
    !composer ||
    signal.aborted ||
    !composer.input.isConnected ||
    location.pathname !== POST_PATH
  ) {
    return "postComposerUnavailable";
  }
  const { dialog, editor, input } = composer;
  if (editor.textContent?.trim() || dialog.querySelector(ATTACHMENTS)) {
    return "postComposerDraft";
  }

  const transfer = new DataTransfer();
  files.forEach((file) => transfer.items.add(file));
  input.files = transfer.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));

  const readyEditor = await waitForPage(
    () => {
      if (location.pathname !== POST_PATH) return;
      const current = findComposer();
      const previews = current?.dialog.querySelectorAll(
        `${ATTACHMENTS} img[src]`,
      );
      if (previews?.length === files.length) return current?.editor;
    },
    12_000,
    signal,
  );
  if (!readyEditor) return "postComposerAttachments";
  readyEditor.focus();
}
