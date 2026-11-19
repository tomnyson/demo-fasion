/**
 * Full page load. Used after sign-in/sign-out so every server component and the client header
 * re-read the session cookie instead of keeping a stale client-side view.
 */
export function hardNavigate(url: string): void {
  window.location.assign(url)
}
