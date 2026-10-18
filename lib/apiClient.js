/**
 * Client-side helper for talking to ToolsTrek's own JSON Route Handlers.
 *
 * Why this exists
 * ---------------
 * Route Handlers run on the deployment platform, not in the browser. When a
 * function crashes, is not deployed correctly, or exceeds the platform's
 * execution limit, the platform responds with an **HTML** error page instead of
 * JSON. A naive `await response.json()` then throws the famously cryptic
 * `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`, which tells the
 * user nothing useful.
 *
 * `apiFetch` centralises all of that so every tool degrades gracefully:
 *   • always sends/parses JSON safely, even if the server returns HTML,
 *   • hides raw platform noise behind friendly, actionable copy,
 *   • applies a timeout so a hung function can never freeze the UI forever,
 *   • preserves user-initiated cancellations as `AbortError`.
 */

/** Timeout applied when a tool does not specify one. */
const DEFAULT_TIMEOUT_MS = 45_000;

/**
 * Error thrown by {@link apiFetch} for every non-success outcome.
 * Carries the HTTP `status` (when there was a response) and a stable `code`.
 */
export class ApiError extends Error {
  constructor(message, { status = 0, code = "request_failed", details = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** Map an HTTP status to a sentence a normal person can act on. */
function friendlyStatusMessage(status) {
  if (status === 400) return "That request was not valid. Please double-check your input and try again.";
  if (status === 401 || status === 403) return "This lookup was refused by the remote server.";
  if (status === 404) return "We could not find what you were looking for.";
  if (status === 408 || status === 504) return "The lookup took too long and timed out. Please try again.";
  if (status === 429) return "Too many requests right now. Please wait a moment and try again.";
  if (status >= 500) return "The server hit a temporary problem. Please try again in a moment.";
  return `The request failed (HTTP ${status}). Please try again.`;
}

/** Best-effort extraction of an error string from a parsed payload. */
function extractServerMessage(payload) {
  if (!payload || typeof payload !== "object") return null;
  if (typeof payload.error === "string" && payload.error.trim()) return payload.error.trim();
  if (typeof payload.message === "string" && payload.message.trim()) return payload.message.trim();
  return null;
}

/**
 * Fetch a JSON endpoint and always resolve to the parsed payload or throw an
 * {@link ApiError} with a human-friendly `message`.
 *
 * @param {string} path  Relative path, e.g. `/api/check-ssl`.
 * @param {object} [options]
 * @param {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"} [options.method="POST"]
 * @param {unknown} [options.body]        Serialised as JSON when provided.
 * @param {AbortSignal} [options.signal]  Caller-owned signal (e.g. cancel button).
 * @param {number} [options.timeoutMs]    Hard timeout for the whole request.
 * @param {Record<string,string>} [options.headers]
 * @returns {Promise<any>}
 */
export async function apiFetch(path, options = {}) {
  const {
    method = "POST",
    body,
    signal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers = {},
  } = options;

  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const onExternalAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onExternalAbort, { once: true });
  }

  const requestHeaders = { ...headers };
  let requestBody;
  if (body !== undefined) {
    requestHeaders["Content-Type"] = requestHeaders["Content-Type"] ?? "application/json";
    requestBody = typeof body === "string" ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(path, {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") || "";
    let payload = null;

    if (contentType.includes("application/json")) {
      payload = await response.json().catch(() => null);
    } else {
      // Platform error pages, proxies and CDNs sometimes mislabel JSON or return
      // HTML. Read the body once and try to salvage JSON from it.
      const raw = await response.text().catch(() => "");
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      throw new ApiError(
        extractServerMessage(payload) || friendlyStatusMessage(response.status),
        { status: response.status, code: response.status >= 500 ? "server_error" : "bad_response", details: payload }
      );
    }

    if (payload === null) {
      throw new ApiError(
        "The server returned an unexpected response. Please try again.",
        { status: response.status, code: "invalid_response" }
      );
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error?.name === "AbortError") {
      if (!timedOut) throw error; // caller cancelled — let UI ignore it
      throw new ApiError(
        "The lookup took too long to respond. Please try again.",
        { code: "timeout" }
      );
    }

    throw new ApiError(
      "Could not reach the server. Please check your connection and try again.",
      { code: "network", details: error }
    );
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onExternalAbort);
  }
}

/** True when the error means the user intentionally cancelled the request. */
export function isAbortError(error) {
  return error?.name === "AbortError";
}
