import { statuses } from '@/lib/investments/money';
import styles from './VehicleStatus.module.css';
export default function VehicleStatus({status,dark=false}:{status:keyof typeof statuses;dark?:boolean}) {
  return <span className={styles.badge} data-status={status} data-dark={dark}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {status==='purchased'?<><path d="m4 10 2-5h12l2 5M3 10h18v8H3zM6 18v2m12-2v2M7 14h.01M17 14h.01"/></>:status==='repairing'?<path d="M14.5 6.5 18 3a6 6 0 0 0-7.4 7.4L3 18l3 3 7.6-7.6A6 6 0 0 0 21 6l-3.5 3.5z"/>:status==='listed'?<><path d="M3 3h8l10 10-8 8L3 11z"/><circle cx="7.5" cy="7.5" r="1"/></>:<><circle cx="12" cy="12" r="9"/><path d="m7.5 12 3 3 6-6"/></>}
    </svg><span>{statuses[status]}</span>
  </span>;
}
