import Image from "next/image";
export default function Logo({
  className = "",
  variant = "light",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  return (
    <span
      className={`brand-logo ${variant === "dark" ? "brand-logo-inverse" : ""} ${className}`}
    >
      <Image
        src="/brand/dealerpass-lockup.png"
        alt="DealerPass"
        width={2048}
        height={683}
        priority
      />
    </span>
  );
}
