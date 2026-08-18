import Image from "next/image";

export default function Logo({
  className = "",
  variant = "dark",
}: {
  className?: string;
  /** "dark" = on a dark background (cream "Dealer"). "light" = on a cream background (black "Dealer"). */
  variant?: "dark" | "light";
}) {
  return (
    <Image
      src={variant === "light" ? "/logo-black.png" : "/logo-cream.png"}
      alt="DealerPass"
      width={800}
      height={279}
      priority
      className={`h-10 w-auto ${className}`}
    />
  );
}
