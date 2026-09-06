import { Hono } from "hono";
import { db } from "../db";
import { allowRoles, authRequired } from "../auth";

export const catalog = new Hono();

catalog.get("/categories", async (c) => {
  const { rows } = await db.query("select * from categories where enabled=true order by sort_order asc, created_at asc");
  return c.json({ categories: rows });
});

catalog.get("/stores", async (c) => {
  const { rows } = await db.query("select id,name,slug,logo_url,status,created_at from stores where status='active' order by created_at desc");
  return c.json({ stores: rows });
});

catalog.get("/products", async (c) => {
  const { rows } = await db.query(`select p.*, s.name store_name, s.slug store_slug,
    coalesce(json_agg(json_build_object('id',v.id,'sku',v.sku,'title',v.title,'price_usd',v.price_usd,'stock',v.stock,'options',v.options)) filter (where v.id is not null),'[]') variants
    from products p join stores s on s.id=p.store_id left join product_variants v on v.product_id=p.id
    where p.status='active' and s.status='active' group by p.id,s.name,s.slug order by p.created_at desc`);
  return c.json({ products: rows });
});

catalog.use("/admin/*", authRequired, allowRoles("admin"));
catalog.post("/admin/categories", async (c) => {
  const b = await c.req.json();
  const { rows } = await db.query(`insert into categories(name,slug,image_url,parent_id,enabled,sort_order)
    values($1,$2,$3,$4,$5,$6) returning *`, [b.name,b.slug,b.image_url||null,b.parent_id||null,b.enabled!==false,Number(b.sort_order||0)]);
  return c.json({ category: rows[0] }, 201);
});

catalog.post("/admin/stores", async (c) => {
  const b = await c.req.json();
  const { rows } = await db.query(`insert into stores(owner_id,name,slug,logo_url,status)
    values($1,$2,$3,$4,$5) returning *`, [b.owner_id,b.name,b.slug,b.logo_url||null,b.status||'pending']);
  return c.json({ store: rows[0] }, 201);
});

catalog.use("/vendor/*", authRequired, allowRoles("vendor","admin"));
catalog.post("/vendor/products", async (c) => {
  const b = await c.req.json();
  const client = await db.connect();
  try {
    await client.query("begin");
    const product = (await client.query(`insert into products(store_id,category_id,name,slug,description,status,returnable)
      values($1,$2,$3,$4,$5,$6,$7) returning *`, [b.store_id,b.category_id||null,b.name,b.slug,b.description||null,b.status||'draft',!!b.returnable])).rows[0];
    const variants=[];
    for (const v of b.variants||[]) {
      variants.push((await client.query(`insert into product_variants(product_id,sku,title,price_usd,stock,options)
        values($1,$2,$3,$4,$5,$6) returning *`, [product.id,v.sku||null,v.title||'Default',Number(v.price_usd||0),Number(v.stock||0),v.options||{}])).rows[0]);
    }
    await client.query("commit");
    return c.json({ product, variants }, 201);
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally { client.release(); }
});
