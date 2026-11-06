import type { MetadataRoute } from "next";
import { publicCatalogueFallback } from "@/lib/vehicles/publication-server";
export default function sitemap(): MetadataRoute.Sitemap { return ["","/academy","/planes","/metodo-margen","/vehiculos",...publicCatalogueFallback().map(v=>`/vehiculos/${v.slug}`),"/contacto","/vip"].map(path=>({url:`https://dealerpasss.com${path}`, changeFrequency:"weekly", priority:path ? .7 : 1})); }
