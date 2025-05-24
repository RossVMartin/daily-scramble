export function getNowUTC() {
	const now = new Date();
	const utcNow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
	return utcNow.toISOString().split('T')[0];
}
