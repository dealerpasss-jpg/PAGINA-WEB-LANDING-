import { auth, database, identity, sameOrigin, checked } from '@/lib/academy/server';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
export async function GET(request:Request) {
 const who=await identity();if(!who)return new Response('Unauthorized',{status:401,headers});
 const id=new URL(request.url).searchParams.get('id');if(!id||!/^[0-9a-f-]{36}$/i.test(id))return new Response('Not found',{status:404,headers});
 const db=await auth();const {data:photo,error}=await db.from('investment_photos').select('path,vehicle_id').eq('id',id).maybeSingle();
 if(error||!photo)return new Response('Not found',{status:404,headers});
 if(who.profile.role!=='admin') {
  const {data:membership,error:memberError}=await db.from('investment_members').select('id').eq('vehicle_id',photo.vehicle_id).eq('user_id',who.user.id).is('revoked_at',null).maybeSingle();
  if(memberError||!membership)return new Response('Not found',{status:404,headers});
 }
 const {data,error:downloadError}=await db.storage.from('investment-photos').download(photo.path);
 if(downloadError||!data)return new Response('Not found',{status:404,headers});
 return new Response(data,{headers:{...headers,'Content-Type':'image/jpeg'}});
}
export async function POST(request:Request) {
 if(!sameOrigin(request))return Response.json({error:'Origen inválido.'},{status:403});
 const who=await identity();if(!who||who.profile.role!=='admin')return Response.json({error:'Solo el administrador puede subir fotos.'},{status:403});
 if(Number(request.headers.get('content-length'))>4*1024*1024)return Response.json({error:'Foto demasiado grande.'},{status:413});
 let uploaded='';const db=await auth();
 try {const form=await request.formData();const vehicle=String(form.get('vehicle_id'));const file=form.get('photo');
 if(!/^[0-9a-f-]{36}$/i.test(vehicle)||!(file instanceof File)||file.size>3*1024*1024||file.size<4)throw new Error('Foto inválida.');
 const bytes=new Uint8Array(await file.arrayBuffer());if(bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)throw new Error('Formato inválido.');
 const row=checked(await db.from('investment_vehicles').select('id').eq('id',vehicle).single()).data;if(!row)throw new Error('Vehículo inválido.');
 const path=vehicle+'/'+crypto.randomUUID()+'.jpg';checked(await db.storage.from('investment-photos').upload(path,bytes,{contentType:'image/jpeg',upsert:false}));uploaded=path;
 checked(await db.from('investment_photos').insert({vehicle_id:vehicle,path}));return Response.json({ok:true},{headers});
 }catch {if(uploaded)await database().storage.from('investment-photos').remove([uploaded]);return Response.json({error:'No se pudo guardar la foto. Revisa el archivo e inténtalo de nuevo.'},{status:400,headers});}
}
