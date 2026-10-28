"use client";
import { useState } from "react";
import Image from "next/image";
import styles from "@/app/vehiculos/vehicles.module.css";
const escapePhotos = [["portada", "Portada · fondo de presentación editado"], ["frente", "Vista frontal"], ["diagonal", "Vista delantera en diagonal"], ["lateral", "Vista lateral"], ["trasera-diagonal", "Vista trasera en diagonal"], ["trasera", "Vista trasera"], ["interior", "Asientos e interior"], ["consola", "Consola y transmisión automática"], ["millaje", "Tablero · 72.440 millas"]];
export default function VehicleGallery({photos = escapePhotos, folder = "ford-escape-2016", vehicle = "Ford Escape SE 2016"}: {photos?: string[][]; folder?: string; vehicle?: string}) {
 const [selected, setSelected] = useState(0);
 const [file, label] = photos[selected];
 return <div className={styles.gallery}>
  <div className={styles.mainPhoto}><Image src={`/vehicles/${folder}/${file}.webp`} alt={`${vehicle}: ${label}`} width={1448} height={1086} sizes="(max-width: 900px) 100vw, 65vw" priority={selected === 0} /><button type="button" className={styles.previous} aria-label="Foto anterior" onClick={() => setSelected((selected + photos.length - 1) % photos.length)}>←</button><button type="button" className={styles.next} aria-label="Foto siguiente" onClick={() => setSelected((selected + 1) % photos.length)}>→</button></div>
  <p className={styles.caption} aria-live="polite"><span>{label}</span><span>{selected + 1} / {photos.length}</span></p>
  <div className={styles.thumbnails} aria-label="Seleccionar foto del vehículo">{photos.map(([name, description], index) => <button type="button" key={name} aria-label={`Ver ${description}`} aria-pressed={index === selected} onClick={() => setSelected(index)}><Image src={`/vehicles/${folder}/${name}.webp`} alt={description} width={144} height={108} sizes="110px" /></button>)}</div>
  <p className={styles.note}>La portada tiene el fondo editado para unificar el catálogo. Las demás fotografías muestran el vehículo en su entorno original.</p>
 </div>;
}
