import Image from "next/image";

const instructors = [
  {
    name: "Sebastián",
    role: "Evaluación técnica y logística",
    experience: "8 años de experiencia",
    image: "/team/sebastian.webp",
    photoClass: "instructor-photo-sebastian",
    description:
      "Te enseña a evaluar la condición mecánica, identificar oportunidades y organizar repuestos, transporte con grúa y exportaciones.",
  },
  {
    name: "Juan Esteban",
    role: "Análisis de mercado y marketing",
    experience: "5 años de experiencia",
    image: "/team/juan-esteban.webp",
    photoClass: "instructor-photo-juan",
    description:
      "Especialista en marketing y pionero en integrar inteligencia artificial al mundo de las subastas. Te guía en la selección de vehículos, la investigación de precios y la estrategia de venta digital.",
  },
];

export default function Instructors() {
  return (
    <section className="instructors" aria-labelledby="instructors-heading">
      <div className="wrap">
        <div className="instructors-heading" id="instructores">
          <span className="kicker"><i />EL EQUIPO</span>
          <h2 id="instructors-heading">Conoce a tus instructores.</h2>
          <p>Dos especialidades que conectan la evaluación técnica con la decisión de compra y la venta.</p>
        </div>
        <div className="instructors-grid">
          {instructors.map((instructor) => (
            <article className="instructor" key={instructor.name}>
              <div className={`instructor-photo ${instructor.photoClass}`}>
                <Image
                  src={instructor.image}
                  alt={`${instructor.name}, instructor de DealerPass, junto a un vehículo`}
                  fill
                  sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1000px) 44vw, 580px"
                />
              </div>
              <div className="instructor-copy">
                <p className="instructor-experience">{instructor.experience}</p>
                <h3>{instructor.name}</h3>
                <p className="instructor-role">{instructor.role}</p>
                <p className="instructor-description">{instructor.description}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="instructors-note">Enseñamos lo que aplicamos cada semana.</p>
      </div>
    </section>
  );
}
