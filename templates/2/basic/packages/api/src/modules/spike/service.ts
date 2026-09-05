import { MedusaService } from "@medusajs/framework/utils"
import { SpikeSetting } from "./models/spike-setting"

class SpikeModuleService extends MedusaService({ SpikeSetting }) {}

export default SpikeModuleService
