'use client';
import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
export default function SalesRefresh() {
  const router=useRouter();const [pending,startTransition]=useTransition();
  useEffect(()=>{
    const refresh=()=>{if(document.visibilityState==='visible'&&navigator.onLine&&!pending)startTransition(()=>router.refresh());};
    const interval=window.setInterval(refresh,30000);
    document.addEventListener('visibilitychange',refresh);window.addEventListener('online',refresh);
    return ()=>{window.clearInterval(interval);document.removeEventListener('visibilitychange',refresh);window.removeEventListener('online',refresh);};
  },[router,pending]);
  return <button type="button" className="dashboard-text-link" disabled={pending} onClick={()=>startTransition(()=>router.refresh())}>{pending?'Actualizando…':'Actualizar ahora'}</button>;
}
