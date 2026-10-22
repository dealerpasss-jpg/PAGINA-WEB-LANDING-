import { faqs } from "@/data/faq";
export default function FAQ({ compact = false }: { compact?: boolean }) {
  return (
    <section id="faq" className="section wrap faq-grid">
      <div>
        <span className="kicker">
          <i />
          ANTES DE EMPEZAR
        </span>
        <h2>
          Buenas preguntas.
          <br />
          Respuestas claras.
        </h2>
        <p className="muted">
          Conoce los detalles antes de dar el siguiente paso.
        </p>
      </div>
      <div className="faq-list">
        {(compact
          ? [faqs[0], faqs[2], faqs[5], faqs[10], faqs[13], faqs[14]]
          : faqs
        ).map((item) => (
          <details key={item.q}>
            <summary>
              {item.q}
              <span aria-hidden>+</span>
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
