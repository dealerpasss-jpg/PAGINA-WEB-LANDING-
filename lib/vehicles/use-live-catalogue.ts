'use client';
import { useEffect, useState } from 'react';
import type { CatalogueVehicle } from '@/data/vehicle-catalogue';
import { unverifiedCatalogue, validCatalogueResponse } from '@/lib/vehicles/publication';

// Refresh visible pages only; unknown/network errors never retain an old price or
// an available CTA. No background polling of hidden tabs, private IDs or data.
export function useLiveCatalogue(initial:CatalogueVehicle[]) {
 const [snapshot,setSnapshot]=useState({source:initial,values:initial});
 const vehicles=snapshot.source===initial?snapshot.values:initial;
 useEffect(()=>{
  let stopped=false;let pending:AbortController|null=null;let last=0;
  const refresh=async()=>{
   if(stopped||document.visibilityState==='hidden'||pending||Date.now()-last<1000)return;
   const controller=new AbortController();pending=controller;last=Date.now();
   const timeout=setTimeout(()=>controller.abort(),8000);
   try {const r=await fetch('/api/catalogue',{cache:'no-store',signal:controller.signal});if(!r.ok)throw new Error('Unavailable');const data:unknown=await r.json();if(!validCatalogueResponse(data))throw new Error('Invalid catalogue');if(!stopped)setSnapshot({source:initial,values:data});}
   catch {if(!stopped)setSnapshot(previous=>({source:initial,values:unverifiedCatalogue(previous.source===initial?previous.values:initial)}));}
   finally {clearTimeout(timeout);pending=null;}
  };
  const visible=()=>{if(document.visibilityState==='visible')void refresh();};
  void refresh();const timer=setInterval(()=>void refresh(),60000);
  window.addEventListener('focus',visible);window.addEventListener('pageshow',visible);document.addEventListener('visibilitychange',visible);
  return()=>{stopped=true;clearInterval(timer);pending?.abort();window.removeEventListener('focus',visible);window.removeEventListener('pageshow',visible);document.removeEventListener('visibilitychange',visible);};
 },[initial]);
 return vehicles;
}
