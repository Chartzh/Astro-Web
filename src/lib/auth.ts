// Mock authentication gate for the /admin tower.
//
// PHASE-3 MOCK: the passphrase is checked entirely on the client. This is a UI
// spine for the simulator bench — it is NOT a real security boundary. Swap it
// for a real session (cookie + server-side check, OAuth, etc.) before exposing
// /admin on a public deployment.
export const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'ASTRO_ADMIN';
export const ADMIN_SESSION_KEY = 'astro.admin.session';

export function readSession(): boolean {
	if (typeof window === 'undefined') return false;
	return window.localStorage.getItem(ADMIN_SESSION_KEY) === 'granted';
}

export function grantSession(): void {
	if (typeof window === 'undefined') return;
	window.localStorage.setItem(ADMIN_SESSION_KEY, 'granted');
}

export function revokeSession(): void {
	if (typeof window === 'undefined') return;
	window.localStorage.removeItem(ADMIN_SESSION_KEY);
}