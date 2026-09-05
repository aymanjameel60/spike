import { defineMiddlewares } from "@medusajs/framework/http"
import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http"

function protectVendorProductsFromAdminEdits(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  const method = String((req as any).method || "GET").toUpperCase()
  if (["POST", "PUT", "PATCH"].includes(method)) {
    return res.status(403).json({
      message: "في Spike لا يملك الأدمن صلاحية إنشاء أو تعديل منتجات التجار. يمكنك المشاهدة أو الحذف أو استخدام مسار الموافقة/الرفض.",
    })
  }
  return next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: /^\/admin\/products(?:\/[^/]+)?$/,
      middlewares: [protectVendorProductsFromAdminEdits],
    },
  ],
})
