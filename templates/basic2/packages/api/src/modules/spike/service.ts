import { MedusaService } from "@medusajs/framework/utils"
import { SpikeSetting } from "./models/spike-setting"
import { SpikeDeliveryOffice } from "./models/spike-delivery-office"
import { SpikeVendorDeliverySetting } from "./models/spike-vendor-delivery-setting"
import { SpikeSellerCommission } from "./models/spike-seller-commission"
import { SpikeProductDelivery } from "./models/spike-product-delivery"
import { SpikeNotification } from "./models/spike-notification"
import { SpikeProductRevision } from "./models/spike-product-revision"
import { SpikeDiscount } from "./models/spike-discount"
import { SpikePaymentReceipt } from "./models/spike-payment-receipt"
import { SpikeAuditLog } from "./models/spike-audit-log"
import { SpikeReturnRequest } from "./models/spike-return-request"
import { SpikePayable } from "./models/spike-payable"

class SpikeModuleService extends MedusaService({
  SpikeSetting,
  SpikeDeliveryOffice,
  SpikeVendorDeliverySetting,
  SpikeSellerCommission,
  SpikeProductDelivery,
  SpikeNotification,
  SpikeProductRevision,
  SpikeDiscount,
  SpikePaymentReceipt,
  SpikeAuditLog,
  SpikeReturnRequest,
  SpikePayable,
}) {}

export default SpikeModuleService
