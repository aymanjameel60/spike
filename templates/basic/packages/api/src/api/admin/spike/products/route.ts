import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Admin product overview for Spike.
 * Products are created by vendors only. This endpoint intentionally returns
 * all vendor products (not only proposed ones) and includes inventory data
 * whenever it is available through the product graph.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as any

  const fields = [
    "id",
    "title",
    "status",
    "thumbnail",
    "created_at",
    "updated_at",
    "metadata",
    "seller.id",
    "seller.name",
    "seller.email",
    "variants.id",
    "variants.title",
    "variants.sku",
    "variants.manage_inventory",
    "variants.inventory_quantity",
    "variants.inventory_items.id",
    "variants.inventory_items.inventory_item_id",
    "variants.inventory_items.inventory.id",
    "variants.inventory_items.inventory.title",
    "variants.inventory_items.inventory.sku",
    "variants.inventory_items.inventory.location_levels.id",
    "variants.inventory_items.inventory.location_levels.location_id",
    "variants.inventory_items.inventory.location_levels.stocked_quantity",
    "variants.inventory_items.inventory.location_levels.reserved_quantity",
    "variants.inventory_items.inventory.location_levels.available_quantity",
  ]

  // Some Medusa/Mercur installations expose only a subset of the inventory
  // graph fields. Fall back progressively so the products page itself never
  // breaks just because a computed inventory field is unavailable.
  let data: any[] = []
  try {
    const result = await query.graph({
      entity: "product",
      fields,
      pagination: { take: 500, order: { created_at: "DESC" } },
    })
    data = result?.data || []
  } catch {
    const result = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "status",
        "thumbnail",
        "created_at",
        "metadata",
        "seller.id",
        "seller.name",
        "seller.email",
        "variants.id",
        "variants.title",
        "variants.sku",
        "variants.manage_inventory",
        "variants.inventory_quantity",
      ],
      pagination: { take: 500, order: { created_at: "DESC" } },
    })
    data = result?.data || []
  }

  const products = data.filter((product: any) => !product?.metadata?.spike_archived)
  res.json({ products })
}
