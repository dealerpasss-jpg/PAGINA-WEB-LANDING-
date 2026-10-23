import ArrowIcon from "@/components/ArrowIcon";
import Link from "next/link";
export default function AccountShell({
  title,
  kicker = "DEALERPASS / MI ESPACIO",
  compact = false,
  children,
}: {
  title: string;
  kicker?: string;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`account-shell${compact ? " account-shell-compact" : ""}`}
    >
      <div className="account-top">
        <span>{kicker}</span>
        <Link href={compact ? "/" : "/mi-cuenta"}>
          {compact ? "Volver al inicio" : "Mi cuenta"} <ArrowIcon />
        </Link>
      </div>
      <h1>{title}</h1>
      {children}
    </section>
  );
}
