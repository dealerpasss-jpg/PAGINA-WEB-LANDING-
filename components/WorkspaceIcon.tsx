export type WorkspaceIconName = "home" | "learn" | "calculator" | "car" | "profile" | "team";
const paths: Record<WorkspaceIconName, string> = {
  home: "M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  learn: "m2 8 10-5 10 5-10 5Zm4 3v6l6 4 6-4v-6M22 8v8",
  calculator: "M6 3h12v18H6ZM9 7h6M9 11h1m4 0h1m-6 4h1m4 0h1m-6 3h1m4 0h1",
  car: "m5 7 2-4h10l2 4 2 3v8H3v-8Zm0 0h14M6 12h2m8 0h2M6 18v3m12-3v3",
  profile: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-3a8 8 0 0 1 16 0v3",
  team: "M14 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM3 21v-3a7 7 0 0 1 14 0v3M17 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3",
};
export default function WorkspaceIcon({ name }: { name: WorkspaceIconName }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
