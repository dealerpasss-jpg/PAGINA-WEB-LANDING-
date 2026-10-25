import Link from "next/link";
import ArrowIcon from "@/components/ArrowIcon";
import styles from "./AcademyPresentation.module.css";

// Set this to the approved MP4 URL when the founders' recording is ready.
const presentationVideoUrl = "";

export default function AcademyPresentation({ plansPage = false }: { plansPage?: boolean }) {
  return (
    <section id="presentacion" className={`wrap ${styles.section}`} aria-labelledby="presentation-title">
      <div className={styles.heading}>
        <span className="kicker"><i /> CONOCE DEALERPASS</span>
        <h2 id="presentation-title">Entiende el camino antes de elegir tu plan.</h2>
        <p>Jota y Sebastián te presentarán la academia, su enfoque y las opciones de formación para dar tu próximo paso.</p>
      </div>
      {presentationVideoUrl ? (
        <video className={styles.video} controls playsInline preload="metadata" aria-label="Presentación de DealerPass con Jota y Sebastián">
          <source src={presentationVideoUrl} type="video/mp4" />
          Tu navegador no admite este video.
        </video>
      ) : (
        <div className={styles.placeholder} role="img" aria-label="Espacio reservado para el video de presentación de DealerPass. Próximamente disponible.">
          <span className={styles.brand}>DEALERPASS</span>
          <strong>Video de presentación próximamente</strong>
          <span>Con Jota y Sebastián</span>
        </div>
      )}
      <ul className={styles.topics} aria-label="Áreas de formación">
        <li><strong>Subastas en Estados Unidos</strong><span>Análisis de vehículos, costos y proceso de compra.</span></li>
        <li><strong>Exportación de vehículos</strong><span>Una visión del proceso, la logística y los costos.</span></li>
        <li><strong>Empresa en Estados Unidos</strong><span>Formación para quienes buscan emprender desde otro país.</span></li>
      </ul>
      <div className={styles.footer}>
        <p>Consulta el temario, la disponibilidad y el acompañamiento de cada plan antes de elegir.</p>
        <Link className="button" href={plansPage ? "#planes" : "/planes#planes"}>Comparar planes <ArrowIcon /></Link>
      </div>
    </section>
  );
}
