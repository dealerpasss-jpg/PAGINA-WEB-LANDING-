import type { ExpensePreset } from '@/lib/investments/expense-presets';

const paths: Record<ExpensePreset, React.ReactNode> = {
  mechanical: <><path d="m14 6 4 4 3-3a6 6 0 0 1-8 8l-6 6-4-4 6-6a6 6 0 0 1 8-8z" /></>,
  wash: <><path d="M12 3C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-12Z" /><path d="M9 15a3 3 0 0 0 3 3" /></>,
  parts: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z M4 7.5l8 4.5 8-4.5 M12 12v9 M8 5.3l8 4.5" /></>,
  paint: <><rect x="3" y="3" width="14" height="6" rx="2" /><path d="M17 6h3v7h-8v3" /><rect x="10" y="16" width="4" height="6" rx="1" /></>,
  transport: <><path d="M3 5h11v12H3Z M14 10h4l3 4v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
  auction: <><path d="m5 6 5-4 7 8-5 4Z M12 10l8 9 M3 21h11 M5 18h7v3" /></>,
  dealer: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V4h8v3 M3 12h18 M10 12v3h4v-3" /></>,
  documents: <><path d="M5 3h10l4 4v14H5Z M15 3v5h4 M8 12h8 M8 16h6" /></>,
  other: <><path d="M12 5v14 M5 12h14" /></>,
};
export default function ExpenseIcon({ name }: { name: ExpensePreset }) {
  return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
