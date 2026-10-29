import ArrowIcon from "@/components/ArrowIcon";
import Link from "next/link";
import Image from "next/image";
export function LearningPreview({ inspection = false }: { inspection?: boolean }) {
  const content = <>
    <span className="kicker" id="enfoque"><i /> ASÍ EMPIEZA EL ANÁLISIS</span><h2>El precio de puja es solo el comienzo.</h2>
    <p>Antes de elegir un carro, necesitas conectar tres preguntas. Este es un ejemplo del enfoque educativo de DealerPass.</p>
    <div className="sales-three"><article><span>01</span><h3>¿Qué estoy comprando?</h3><p>Revisar fotos, historial, título y condición. Identificar qué falta por comprobar.</p></article><article><span>02</span><h3>¿Cuánto costará en total?</h3><p>Sumar puja, cargos de subasta, transporte, documentación y una estimación de reparación.</p></article><article><span>03</span><h3>¿Hasta dónde puedo pujar?</h3><p>Contrastar el costo total con el mercado y el objetivo de la compra, considerando imprevistos.</p></article></div>
    <Link className="text-link" href="/metodo-margen">Explorar el Método MARGEN <ArrowIcon direction="up-right" /></Link>
  </>;
  return <section className={`section wrap sales-preview${inspection ? ' sales-preview-with-image' : ''}`}>
    {inspection ? <div className="sales-preview-layout"><div className="sales-preview-copy">{content}</div><figure className="sales-inspection-image"><Image src="/brand/academy-inspection-scene.webp" alt="Escena generada con IA: una persona revisa la rueda de un vehículo en un lote." width={864} height={1536} sizes="240px" /><figcaption><span aria-hidden="true" />Aprende qué revisar antes de comprar.</figcaption></figure></div> : content}
  </section>;
}
export function PurchaseGuide() {
  return <section className="section wrap sales-guide"><span className="kicker"><i /> ANTES DE CONTINUAR</span><h2>Tu elección, paso a paso.</h2>
    <ol className="sales-three"><li><h3>1. Elige tu plan</h3><p>Compara el alcance y la modalidad de pago. Conservamos tu elección al iniciar sesión o crear tu cuenta.</p></li><li><h3>2. Revisa los detalles</h3><p>Confirma qué incluye, el precio y las condiciones. Crear una cuenta no activa ni cobra una membresía.</p></li><li><h3>3. Confirma y accede</h3><p>Cuando los pagos estén habilitados, podrás continuar. El acceso se activa después de verificar el pago.</p></li></ol>
    <div className="sales-conditions"><h3>Qué debes tener claro</h3><p>Los cargos de subasta, impuestos, transporte y costos de terceros no están incluidos salvo indicación expresa. El acceso a plataformas depende del plan y de sus condiciones. La formación no garantiza resultados.</p><nav aria-label="Condiciones de compra"><Link href="/legal/membresias">Membresías y cancelación</Link><Link href="/legal/reembolsos">Reembolsos</Link><Link href="/legal/terminos">Términos</Link></nav></div>
  </section>;
}
export function SalesClose({ academy = false }: { academy?: boolean }) {
  return <section className="section wrap sales-close"><h2>{academy ? "Tu siguiente paso empieza por aprender." : "Elige el acompañamiento que necesitas."}</h2><p>Revisa el alcance de tu plan. Si tienes dudas, habla con el equipo antes de decidir.</p><div className="plans-actions"><Link className="button" href={academy ? "/mi-cuenta?plan=academy" : "#comparar"}>{academy ? "Elegir Academy" : "Elegir mi plan"} <ArrowIcon direction="right" /></Link><Link className="text-link" href="/contacto">Resolver mis dudas <ArrowIcon direction="up-right" /></Link></div></section>;
}
