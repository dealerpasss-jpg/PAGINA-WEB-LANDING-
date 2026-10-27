import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { return ["","/academy","/planes","/metodo-margen","/vehiculos","/contacto","/vip"].map(path=>({url:`https://dealerpasss.com${path}`, changeFrequency:"weekly", priority:path ? .7 : 1})); }
