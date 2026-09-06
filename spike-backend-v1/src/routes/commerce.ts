import { Hono } from "hono";
import { db } from "../db";
import { allowRoles, authRequired } from "../auth";
export const commerce=new Hono();

commerce.get('/currencies',async c=>c.json({currencies:(await db.query('select * from currencies where enabled=true order by sort_order,name')).rows}));
commerce.get('/cities',async c=>c.json({cities:(await db.query('select * from cities where enabled=true order by name')).rows}));

commerce.use('/addresses/*',authRequired);
commerce.get('/addresses',async c=>{const a=c.get('auth') as {id:string};return c.json({addresses:(await db.query('select a.*,c.name city_name from addresses a join cities c on c.id=a.city_id where a.user_id=$1 order by a.is_active desc,a.created_at desc',[a.id])).rows})});
commerce.post('/addresses',async c=>{const a=c.get('auth') as {id:string};const b=await c.req.json();const client=await db.connect();try{await client.query('begin');if(b.is_active)await client.query('update addresses set is_active=false where user_id=$1',[a.id]);const r=await client.query(`insert into addresses(user_id,city_id,label,recipient_name,phone,address_line,latitude,longitude,is_active) values($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *`,[a.id,b.city_id,b.label||null,b.recipient_name,b.phone,b.address_line,b.latitude||null,b.longitude||null,!!b.is_active]);await client.query('commit');return c.json({address:r.rows[0]},201)}catch(e){await client.query('rollback');throw e}finally{client.release()}});

commerce.use('/admin/*',authRequired,allowRoles('admin'));
commerce.post('/admin/currencies',async c=>{const b=await c.req.json();const r=await db.query(`insert into currencies(code,name,symbol,rate_from_usd,enabled,sort_order) values(upper($1),$2,$3,$4,$5,$6) returning *`,[b.code,b.name,b.symbol,Number(b.rate_from_usd),b.enabled!==false,Number(b.sort_order||0)]);return c.json({currency:r.rows[0]},201)});
commerce.post('/admin/cities',async c=>{const b=await c.req.json();const r=await db.query('insert into cities(name,enabled) values($1,$2) returning *',[b.name,b.enabled!==false]);return c.json({city:r.rows[0]},201)});
commerce.post('/admin/delivery-offices',async c=>{const b=await c.req.json();const client=await db.connect();try{await client.query('begin');const o=(await client.query(`insert into delivery_offices(name,phone,address,latitude,longitude,enabled) values($1,$2,$3,$4,$5,$6) returning *`,[b.name,b.phone,b.address,b.latitude||null,b.longitude||null,b.enabled!==false])).rows[0];for(const city of b.city_ids||[])await client.query('insert into delivery_office_cities(office_id,city_id) values($1,$2) on conflict do nothing',[o.id,city]);await client.query('commit');return c.json({delivery_office:o},201)}catch(e){await client.query('rollback');throw e}finally{client.release()}});

commerce.post('/shipping/quote',async c=>{const b=await c.req.json();const toRad=(n:number)=>n*Math.PI/180;const lat1=Number(b.store_latitude),lon1=Number(b.store_longitude),lat2=Number(b.buyer_latitude),lon2=Number(b.buyer_longitude);const dlat=toRad(lat2-lat1),dlon=toRad(lon2-lon1);const h=Math.sin(dlat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dlon/2)**2;const km=6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));return c.json({distance_km:Number(km.toFixed(2)),shipping_yer_old:Math.ceil(km)*10,rate_per_km_yer_old:10})});
