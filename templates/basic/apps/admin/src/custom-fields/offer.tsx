import { defineCustomFieldsConfig } from "@mercurjs/dashboard-sdk"

function AdditionalValue({ data, field, fallback = "—" }: { data?: any; field: string; fallback?: string }) {
  const value = data?.additional_data?.[field]
  if (typeof value === "boolean") return <span>{value ? "نعم" : "لا"}</span>
  return <span>{value === undefined || value === null || value === "" ? fallback : String(value)}</span>
}

// Offers are the seller-owned commercial layer in Mercur. Spike shows the
// seller-specific return/warranty/delivery terms here instead of putting price
// or seller terms on the shared master product.
export default defineCustomFieldsConfig({
  model: "offer",
  displays: [
    {
      zone: "general",
      fields: [
        { id: "spike_return_eligible", component: (props) => <AdditionalValue {...props} field="return_eligible" /> },
        { id: "spike_warranty", component: (props) => <AdditionalValue {...props} field="warranty" /> },
        { id: "spike_delivery_note", component: (props) => <AdditionalValue {...props} field="delivery_note" /> },
      ],
    },
  ],
})
