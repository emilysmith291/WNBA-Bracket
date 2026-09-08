const KEY = "wnba-predictor:session-id";

/** A random id kept in localStorage that identifies this browser's picks — no login required. */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";

  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // Storage disabled (private mode, etc.) — fall back to an in-memory id
    // for the lifetime of the page.
    return crypto.randomUUID();
  }
}

const NAME_KEY = "wnba-predictor:display-name";

export function getSavedDisplayName(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveDisplayName(name: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NAME_KEY, name);
  } catch {
    // ignore
  }
}
