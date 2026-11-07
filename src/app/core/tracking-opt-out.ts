/**
 * "Don't count me": a flag kept in this browser only. When set, neither the
 * self-hosted tracking nor Google Analytics records anything for this
 * browser — meant for the site owner, so their own visits do not skew the
 * numbers. Set automatically when the owner logs in, or by visiting
 * `/?notrack=1` (and cleared with `/?notrack=0`).
 */
const OPT_OUT_KEY = 'sn8w-no-track';

export function isTrackingOptedOut(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(OPT_OUT_KEY) === '1';
  } catch {
    return false;
  }
}

export function setTrackingOptOut(optedOut: boolean): void {
  try {
    if (optedOut) localStorage.setItem(OPT_OUT_KEY, '1');
    else localStorage.removeItem(OPT_OUT_KEY);
  } catch {
    // Storage unavailable (private mode, blocked): nothing to remember, nothing to break.
  }
}
