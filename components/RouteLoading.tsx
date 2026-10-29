import WorkspaceFrame from './WorkspaceFrame';
import styles from './RouteLoading.module.css';

type Variant = 'page' | 'catalogue' | 'vehicle' | 'workspace' | 'investments' | 'learning';
const messages: Record<Variant, string> = { page: 'Preparando la página', catalogue: 'Cargando el inventario', vehicle: 'Preparando la ficha del vehículo', workspace: 'Preparando tu espacio', investments: 'Cargando tus vehículos', learning: 'Preparando tu formación' };

export default function RouteLoading({ workspace = false, inventory = false, variant }: { workspace?: boolean; inventory?: boolean; variant?: Variant }) {
  const mode = variant || (inventory ? 'investments' : workspace ? 'workspace' : 'page');
  const privateView = workspace || ['workspace', 'investments', 'learning'].includes(mode);
  const cards = mode === 'catalogue' || mode === 'investments';
  const content = <section className={`${styles.loading} ${privateView ? styles.workspace : ''}`} aria-busy="true" aria-label={messages[mode]}>
    <div className={styles.status} role="status"><span aria-hidden="true" />{messages[mode]}</div>
    <div className={styles.structure} aria-hidden="true">
      <div className={styles.heading}><div className={styles.eyebrow} /><div className={styles.title} /><div className={styles.subtitle} /></div>
      {(mode === 'workspace' || mode === 'investments') && <div className={styles.metrics}>{[0, 1, 2].map(i => <div className={styles.metric} key={i}><div className={styles.label} /><div className={styles.value} /></div>)}</div>}
      {mode === 'catalogue' && <div className={styles.filterBar}><div className={styles.search} /><div className={styles.sort} /></div>}
      {mode === 'vehicle' ? <div className={styles.vehicleLayout}><div><div className={styles.vehicleImage} /><div className={styles.thumbs}>{[0, 1, 2, 3].map(i => <div key={i} />)}</div></div><div className={styles.panel}><div className={styles.label} /><div className={styles.price} /><div className={styles.line} /><div className={styles.line} /><div className={styles.line} /><div className={styles.action} /></div></div>
        : mode === 'learning' ? <div className={styles.lessonList}>{[0, 1, 2].map(i => <div className={styles.lesson} key={i}><div className={styles.lessonMark} /><div><div className={styles.label} /><div className={styles.line} /></div></div>)}</div>
          : <div className={`${styles.panels} ${cards ? styles.cards : ''} ${mode === 'page' ? styles.editorial : ''}`}>{Array.from({ length: cards ? 3 : 2 }, (_, i) => <div className={styles.panel} key={i}><div className={`${styles.media} ${cards ? styles.cardMedia : ''}`} /><div className={styles.label} /><div className={styles.line} /><div className={styles.line} />{cards && <div className={styles.action} />}</div>)}</div>}
    </div>
  </section>;
  return privateView ? <WorkspaceFrame>{content}</WorkspaceFrame> : content;
}
