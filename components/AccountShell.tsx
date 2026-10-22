import Link from "next/link";
export default function AccountShell({
  title,
  kicker = "DEALERPASS / MI ESPACIO",
  children,
}: {
  title: string;
  kicker?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="account-shell">
      <div className="account-top">
        <span>{kicker}</span>
        <Link href="/mi-cuenta">Mi cuenta ↗</Link>
      </div>
      <h1>{title}</h1>
      {children}
    </section>
  );
}
