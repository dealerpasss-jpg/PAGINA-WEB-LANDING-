import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { return { rules:{ userAgent:"*", allow:"/", disallow:["/api/","/auth/","/mi-cuenta","/aula","/equipo","/ingresar","/legal/"] }, sitemap:"https://dealerpasss.com/sitemap.xml" }; }
