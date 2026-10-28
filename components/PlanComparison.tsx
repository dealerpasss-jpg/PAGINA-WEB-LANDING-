import ArrowIcon from "@/components/ArrowIcon";
import Link from "next/link";
import { comparisonRows, plans } from "@/data/plans";

const mainPlans = plans.filter((plan) => plan.id !== "elite");
const rows = comparisonRows.filter((row) => !["Tarifa por vehículo", "Duración del acceso"].includes(row.label));

export default function PlanComparison() {
  return (
    <div className="plan-compare" aria-labelledby="plan-compare-title">
      <div className="plan-compare-intro">
        <span className="kicker"><i /> TUS OPCIONES, DE UN VISTAZO</span>
        <h2 id="plan-compare-title">Compara. Elige. Empieza.</h2>
        <p>Tres formas de avanzar. Mira qué incluye cada plan y encuentra el que encaja contigo.</p>
      </div>
      <div className="plan-compare-frame">
        <table className="plan-compare-table">
          <caption className="sr-only">Comparación de Starter, Academy y Pro. Precios de referencia en revisión.</caption>
          <colgroup><col className="plan-compare-label-col" />{mainPlans.map(plan => <col key={plan.id} />)}</colgroup>
          <thead><tr>
            <th scope="col" className="plan-compare-feature-heading">Tu plan<br /><span>Qué incluye</span></th>
            {mainPlans.map(plan => <th scope="col" key={plan.id} className={plan.id === "academy" ? "plan-compare-academy" : undefined}>
              <span className="plan-compare-name">{plan.name.replace("DealerPass ", "")}</span>
              <span className="plan-compare-purpose">{plan.id === "starter" ? "Empezar a comprar" : plan.id === "academy" ? "Aprender el proceso" : "Comprar acompañado"}</span>
              <strong className="plan-compare-price">{plan.price.replace("USD ", "$")}</strong>
              <span className="plan-compare-period">USD · {plan.priceSuffix}</span>
              <Link className="plan-compare-button" href={`/mi-cuenta?plan=${plan.id}`} aria-label={`Elegir DealerPass ${plan.id}`}>Elegir<span className="plan-compare-button-name"> {plan.name.replace("DealerPass ", "")}</span></Link>
            </th>)}
          </tr></thead>
          <tbody>{rows.map(row => <tr key={row.label}>
            <th scope="row">{row.label}</th>
            {mainPlans.map(plan => {
              const value = row[plan.id];
              const included = !["No", "No incluida", "—", "N/A"].includes(value);
              const simple = ["Sí", "Incluida", "Incluidas"].includes(value);
              return <td key={plan.id} className={plan.id === "academy" ? "plan-compare-academy" : undefined}>
                <span className={included ? "plan-compare-check" : "plan-compare-no"} aria-hidden="true">{included ? "✓" : "—"}</span>
                <span className="sr-only">{included ? "Incluido" : "No incluido"}</span>
                {included && !simple && <span className="plan-compare-detail">{value}</span>}
              </td>;
            })}
          </tr>)}</tbody>
        </table>
      </div>
      <p className="plan-compare-note">✓ Incluido con el alcance indicado · — No incluido. Precios de referencia en revisión; pagos en preparación. Plataformas sujetas a disponibilidad y condiciones de acceso. Consulta los detalles de cada plan abajo.</p>
      <div className="plan-compare-elite"><span>¿Buscas una opción anual? <strong>Elite requiere entrevista y aprobación.</strong></span><Link href="/vip">Conocer Elite <span aria-hidden="true"><ArrowIcon direction="up-right" /></span></Link></div>
      <div className="plan-compare-divider"><span>CONOCE EL ENFOQUE Y LOS DETALLES</span><span aria-hidden="true"><ArrowIcon direction="down" /></span></div>
    </div>
  );
}
