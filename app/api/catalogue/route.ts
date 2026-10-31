import { readPublicCatalogue } from '@/lib/vehicles/publication-server';
export async function GET() {
 return Response.json(await readPublicCatalogue(),{headers:{'Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff'}});
}
