import Link from 'next/link';
import ArrowIcon from './ArrowIcon';
import styles from '@/app/academy/academy.module.css';

const stages = [
  { title: 'Entiende el terreno.', label: 'EL PUNTO DE PARTIDA', topics: ['Cómo funciona el negocio', 'Plataformas y tipos de subastas', 'Licencias, brokers y responsabilidades'] },
  { title: 'Aprende a evaluar.', label: 'ANTES DE ELEGIR', topics: ['Lectura de lotes', 'Títulos e historiales', 'Evaluación de daños'] },
  { title: 'Decide con números.', label: 'DE LA OFERTA A LA COMPRA', topics: ['Costos y oferta máxima', 'Estrategias de puja', 'Pago, transporte y documentación'] },
  { title: 'Prepara el siguiente paso.', label: 'DESPUÉS DE COMPRAR', topics: ['Reparación y preparación', 'Publicación y comercialización', 'Control de capital, margen e inventario'] },
];

export default function AcademySection() {
  return <section className={`wrap ${styles.curriculum}`} aria-labelledby="curriculum-title">
    <div className={styles.curriculumIntro} id="temario"><div><span className="kicker"><i /> LA RUTA DE APRENDIZAJE</span><h2 id="curriculum-title">Una visión del<br /><span>proceso completo.</span></h2></div><div><p>Doce ejes de formación, organizados en cuatro etapas. Desde entender una subasta hasta llevar el control de tu operación.</p><Link href="#academy-oferta" className="text-link">Ver qué incluye Academy <ArrowIcon direction="down" /></Link></div></div>
    <ol className={styles.curriculumGrid}>{stages.map((stage, index) => <li className={styles.curriculumStage} key={stage.title}><div className={styles.stageHeading}><span className={styles.stageNumber}>0{index + 1}</span><div><span className={styles.stageLabel}>{stage.label}</span><h3>{stage.title}</h3></div></div><ul>{stage.topics.map((topic, topicIndex) => <li key={topic}><span>{String(index * 3 + topicIndex + 1).padStart(2, '0')}</span>{topic}</li>)}</ul></li>)}</ol>
    <p className={styles.curriculumNote}><span aria-hidden="true">i</span>Temario de referencia. La disponibilidad de las lecciones y los recursos se confirma para cada plan antes de habilitar la compra.</p>
  </section>;
}
