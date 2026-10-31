'use client';
import { useEffect } from 'react';
import { revealInvestmentSection } from '@/lib/investments/sections';
import ArrowIcon from '@/components/ArrowIcon';

export default function VehicleActions({admin,sold}:{admin:boolean;sold:boolean}) {
 useEffect(()=>{
  const reveal=()=>revealInvestmentSection(window.location.hash,document);
  reveal();window.addEventListener('hashchange',reveal);
  return ()=>window.removeEventListener('hashchange',reveal);
 },[]);
 const open=(id:string)=>()=>{revealInvestmentSection(id,document);};
 return <div className="vehicle-taskbar">
  {admin&&<div className="vehicle-primary-actions"><a data-dp-button="primary" href="#nuevo-gasto" onClick={open('nuevo-gasto')}>Añadir gasto <ArrowIcon direction="right"/></a><a data-dp-button="secondary" href="#venta-cierre" onClick={open('venta-cierre')}>{sold?'Revisar cierre':'Registrar venta'} <ArrowIcon direction="right"/></a></div>}
  <nav aria-label="Secciones de la ficha"><a href="#resumen-vehiculo" onClick={open('resumen-vehiculo')}>Resumen</a>{admin&&<><a href="#editar-compra" onClick={open('editar-compra')}>Compra y cierre</a><a href="#gastos-vehiculo" onClick={open('gastos-vehiculo')}>Gastos</a></>}<a href="#fotos-vehiculo" onClick={open('fotos-vehiculo')}>Fotos</a><a href="#participantes-vehiculo" onClick={open('participantes-vehiculo')}>{admin?'Participantes':'Mi participación'}</a></nav>
 </div>;
}
