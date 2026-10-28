import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { return ["","/academy","/planes","/metodo-margen","/vehiculos","/vehiculos/ford-escape-se-2016","/contacto","/vip"].map(path=>({url:`https://dealerpasss.com${path}`, changeFrequency:"weekly", priority:path ? .7 : 1})); }
