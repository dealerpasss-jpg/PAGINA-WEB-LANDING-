'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function PhotoUpload({vehicleId}:{vehicleId:string}) {
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');const router=useRouter();
 async function upload(e:React.FormEvent<HTMLFormElement>) {
 e.preventDefault();const form=e.currentTarget;const file=(form.elements.namedItem('photo') as HTMLInputElement).files?.[0];if(!file)return;
 setBusy(true);setMessage('Preparando foto…');let url='';
 try {if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Selecciona una foto JPG, PNG o WebP. Exporta HEIC como JPG.');if(file.size>25*1024*1024)throw new Error('La foto supera 25 MB. Elige una versión más pequeña.');
 url=URL.createObjectURL(file);const img=new Image();img.src=url;await img.decode();const scale=Math.min(1,1800/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);const ctx=canvas.getContext('2d');if(!ctx)throw new Error('No se pudo preparar la imagen.');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
 const blob=await new Promise<Blob|null>(r=>canvas.toBlob(r,'image/jpeg',.85));if(!blob||blob.size>3*1024*1024)throw new Error('No se pudo reducir la foto a 3 MB.');const data=new FormData();data.set('vehicle_id',vehicleId);data.set('photo',blob,'vehiculo.jpg');setMessage('Subiendo foto…');const res=await fetch('/api/investments/photo',{method:'POST',body:data});const body=await res.json();if(!res.ok)throw new Error(body.error||'No se pudo subir la foto.');form.reset();setMessage('Foto guardada.');router.refresh();
 }catch(e){setMessage(e instanceof Error?e.message:'No se pudo subir la foto.');}finally{if(url)URL.revokeObjectURL(url);setBusy(false);}
 }
 return <form onSubmit={upload} className="investment-form"><label>Añadir foto privada<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" required disabled={busy}/></label><small>JPG, PNG o WebP. Se optimiza antes de guardar. Solo los participantes autorizados pueden verla.</small><button className="btn-primary" disabled={busy}>{busy?'Subiendo…':'Guardar foto'}</button>{message&&<p role="status">{message}</p>}</form>;
}
