import ArrowIcon from "@/components/ArrowIcon";
import Link from "next/link";
const modules = [
  "Cómo funciona el negocio",
  "Plataformas y tipos de subastas",
  "Licencias, brokers y responsabilidades",
  "Lectura de lotes",
  "Títulos e historiales",
  "Evaluación de daños",
  "Costos y oferta máxima",
  "Estrategias de puja",
  "Pago, transporte y documentación",
  "Reparación y preparación",
  "Publicación y comercialización",
  "Control de capital, margen e inventario",
];
export default function AcademySection() {
  return (
    <section className="section wrap syllabus">
      <div>
        <span className="kicker">
          <i />
          LA RUTA DE APRENDIZAJE
        </span>
        <h2>
          Una visión
          <br />
          del proceso completo.
        </h2>
        <p>
          Estos son los ejes de la formación. La disponibilidad de las lecciones
          y los recursos se confirma para cada plan.
        </p>
        <Link href="#academy-oferta" className="text-link">
          Ver qué incluye Academy <ArrowIcon />
        </Link>
      </div>
      <div>
        {modules.map((m, i) => (
          <div className="syllabus-row" key={m}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <h3>{m}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}
