import { availabilityCopy, type Availability } from '@/lib/vehicles/publication';
import styles from '@/app/vehiculos/vehicles.module.css';
export default function CatalogueAvailability({status='unverified'}:{status?:Availability}) {
 return <span className={styles.availability} data-availability={status}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">{status==='not-for-sale'?<><path d="M5 10h14l2 7v3h-3v-3H6v3H3v-3Z M7 10l2-5h6l2 5"/><path d="M7 14h2m6 0h2"/></>:status==='sold'?<><circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/></>:status==='available'?<><path d="M3 3h8l10 10-8 8L3 11Z"/><circle cx="7.5" cy="7.5" r="1"/></>:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>}</svg>{availabilityCopy[status].label}</span>;
}
