import WorkspaceFrame from "./WorkspaceFrame";
import ArrowIcon from "@/components/ArrowIcon";
import Link from "next/link";
export default function AccountShell({
  title,
  kicker = "DEALERPASS / MI ESPACIO",
  compact = false,
  team = false,
  children,
}: {
  title: string;
  kicker?: string;
  compact?: boolean;
  team?: boolean;
  children: React.ReactNode;
}) {
  return (
    <WorkspaceFrame team={team}><section
      className={`account-shell${compact ? " account-shell-compact" : ""}`}
    >
      <header className="account-heading">
      <div className="account-top">
        <span>{kicker}</span>
        <Link href={compact ? "/" : "/mi-cuenta"}>
          {compact ? "Volver al inicio" : "Mi cuenta"} <ArrowIcon />
        </Link>
      </div>
      <h1>{title}</h1>
      </header>
      {children}
    </section></WorkspaceFrame>
  );
}
