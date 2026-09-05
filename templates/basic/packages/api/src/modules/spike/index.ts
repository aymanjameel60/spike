import { Module } from "@medusajs/framework/utils"
import SpikeModuleService from "./service"

export const SPIKE_MODULE = "spike"

export default Module(SPIKE_MODULE, {
  service: SpikeModuleService,
})
