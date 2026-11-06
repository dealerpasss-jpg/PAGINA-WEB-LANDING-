// Publish only confirmed sessions and final resources. Never put private Meet
// or download links here: this repository is public. Use authenticated pages.
export const studentSessions: {id:string; title:string; startsAt:string; timeZone:string; allowedPlans:string[]; path:string}[] = [];
export const studentDownloads: {id:string; title:string; description:string; allowedPlans:string[]; path:string}[] = [];
