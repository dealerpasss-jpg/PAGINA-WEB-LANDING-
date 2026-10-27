'use client';
import { useFormStatus } from 'react-dom';
export default function Submit({children}:{children:React.ReactNode}) { const {pending}=useFormStatus();return <button className="btn-primary" disabled={pending}>{pending?'Guardando…':children}</button>; }
