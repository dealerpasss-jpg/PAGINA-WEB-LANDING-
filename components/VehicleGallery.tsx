'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from 'react';
import Image from 'next/image';
import ArrowIcon from './ArrowIcon';
import type { CatalogueVehicle } from '@/data/vehicle-catalogue';
import styles from '@/app/vehiculos/vehicles.module.css';

export default function VehicleGallery({ photos, vehicle, notice }: { photos: CatalogueVehicle['photos']; vehicle: string; notice?:string }) {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const thumbnails = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const photo = photos[selected];

  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [expanded]);

  useEffect(() => {
    const strip = thumbnails.current;
    const thumbnail = strip?.children[selected] as HTMLElement | undefined;
    if (!strip || !thumbnail) return;
    const left = thumbnail.offsetLeft;
    const right = left + thumbnail.offsetWidth;
    if (left < strip.scrollLeft) strip.scrollTo({ left, behavior: 'auto' });
    else if (right > strip.scrollLeft + strip.clientWidth) strip.scrollTo({ left: right - strip.clientWidth, behavior: 'auto' });
  }, [selected]);

  function move(delta: number) {
    setSelected(current => (current + delta + photos.length) % photos.length);
  }
  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setSelected(event.key === 'Home' ? 0 : photos.length - 1);
    }
  }
  function onTouchStart(event: TouchEvent) {
    const point = event.changedTouches[0];
    touch.current = { x: point.clientX, y: point.clientY };
    swiped.current = false;
  }
  function onTouchEnd(event: TouchEvent) {
    if (!touch.current) return;
    const point = event.changedTouches[0];
    const dx = point.clientX - touch.current.x;
    const dy = point.clientY - touch.current.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      move(dx > 0 ? -1 : 1);
      swiped.current = true;
    }
    touch.current = null;
  }
  function open() {
    if (swiped.current) { swiped.current = false; return; }
    setExpanded(true);
    dialog.current?.showModal();
  }

  return <div className={styles.gallery} data-provisional={notice ? true : undefined} id="fotografias" role="region" aria-label={`Fotografías de ${vehicle}`}>
    <div className={styles.mainPhoto} onKeyDown={onKeyDown} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <button className={styles.photoExpand} type="button" onClick={open} aria-label={`Ampliar foto ${selected + 1}: ${photo.caption}`}><Image key={photo.src} src={photo.src} alt={`${vehicle}: ${photo.caption}`} width={1448} height={1086} sizes="(max-width: 900px) 100vw, 65vw" priority={selected === 0} /><span className={styles.expandHint}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4" /></svg>Ampliar</span></button>
      {photos.length>1&&<><button type="button" data-dp-button="icon" className={styles.previous} aria-label="Foto anterior" onClick={() => move(-1)}><ArrowIcon direction="left" /></button><button type="button" data-dp-button="icon" className={styles.next} aria-label="Foto siguiente" onClick={() => move(1)}><ArrowIcon direction="right" /></button></>}
    </div>
    <p className={styles.caption} aria-live="polite" aria-atomic="true"><span>{photo.caption}</span><span>{selected + 1} / {photos.length}</span></p>
    {photos.length>1&&<div ref={thumbnails} className={styles.thumbnails} role="group" aria-label="Seleccionar foto del vehículo">{photos.map((item, index) => <button type="button" key={item.src} aria-label={`Foto ${index + 1}: ${item.caption}`} aria-pressed={index === selected} onClick={() => setSelected(index)}><Image src={item.src} alt="" width={144} height={108} sizes="94px" /></button>)}</div>}
    <p className={styles.note}>{notice ?? 'La portada tiene el fondo editado para unificar el catálogo. Las demás fotografías muestran el vehículo en su entorno original.'}</p>
    <dialog ref={dialog} className={styles.photoDialog} aria-label={`Galería ampliada de ${vehicle}`} onClose={() => setExpanded(false)} onKeyDown={onKeyDown} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className={styles.dialogInner}>
        <div className={styles.dialogHeader}><div><strong>{vehicle}</strong><span>{selected + 1} / {photos.length}</span></div><button data-dp-button="inverse" type="button" autoFocus onClick={() => dialog.current?.close()} aria-label="Cerrar galería ampliada">Cerrar <span aria-hidden="true">×</span></button></div>
        {expanded && <div className={styles.expandedPhoto} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}><Image key={photo.src} src={photo.src} alt={`${vehicle}: ${photo.caption}`} width={1448} height={1086} sizes="100vw" />{photos.length>1&&<><button type="button" data-dp-button="icon" className={styles.previous} aria-label="Foto anterior ampliada" onClick={() => move(-1)}><ArrowIcon direction="left" /></button><button type="button" data-dp-button="icon" className={styles.next} aria-label="Foto siguiente ampliada" onClick={() => move(1)}><ArrowIcon direction="right" /></button></>}</div>}
        <p className={styles.dialogCaption} aria-live="polite">{photo.caption}<span>{photos.length>1?'Desliza o usa ← → · ':''}Esc para cerrar</span></p>
      </div>
    </dialog>
  </div>;
}
