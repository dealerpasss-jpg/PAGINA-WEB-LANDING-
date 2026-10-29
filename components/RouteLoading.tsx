import WorkspaceFrame from './WorkspaceFrame';
import styles from './RouteLoading.module.css';

export default function RouteLoading({ workspace = false, inventory = false }: { workspace?: boolean; inventory?: boolean }) {
  const content = <section className={`${styles.loading} ${workspace ? styles.workspace : ''}`} aria-busy="true" aria-label={inventory ? 'Cargando inversiones' : 'Cargando página'}>
    <div className={styles.status} role="status"><span aria-hidden="true" />{workspace ? 'Preparando tu espacio' : 'Un momento, estamos cargando'}</div>
    <div className={styles.structure} aria-hidden="true">
      <div className={styles.heading}><div className={styles.eyebrow} /><div className={styles.title} /><div className={styles.subtitle} /></div>
      <div className={styles.metrics}>{[0, 1, 2].map(i => <div className={styles.metric} key={i}><div className={styles.label} /><div className={styles.value} /></div>)}</div>
      <div className={`${styles.panels} ${inventory ? styles.inventory : ''}`}>
        {[0, 1].map(i => <div className={styles.panel} key={i}><div className={styles.media} /><div className={styles.label} /><div className={styles.line} /><div className={styles.line} /></div>)}
      </div>
    </div>
  </section>;
  return workspace ? <WorkspaceFrame>{content}</WorkspaceFrame> : content;
}
