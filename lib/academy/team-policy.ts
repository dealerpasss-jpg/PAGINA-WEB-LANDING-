export function isTeamRole(role: unknown) { return role === "admin" || role === "collaborator"; }
export function isAdminRole(role: unknown) { return role === "admin"; }
export function validRecordId(id: string) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id); }
export function directoryPage(value: unknown) { const n=Number(value); return Number.isSafeInteger(n)&&n>0&&n<=100000?n:1; }
