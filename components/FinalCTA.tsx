import ArrowIcon from "@/components/ArrowIcon";
import Link from "next/link";
export default function FinalCTA() {
  return (
    <section className="section wrap final-cta">
      <div>
        <span className="kicker">
          <i />
          TU SIGUIENTE PASO
        </span>
        <h2>
          Empieza con una
          <br />
          visión más clara.
        </h2>
      </div>
      <Link className="button" href="/planes">
        Explorar los planes{" "}
        <span aria-hidden>
          <ArrowIcon />
        </span>
      </Link>
    </section>
  );
}
