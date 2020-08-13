import { IgniteToolbox } from "../types"
import { TemplateProps } from "../boilerplate"

export default async function runBatches(batches: Array<(toolbox: IgniteToolbox, templateProps: TemplateProps) => Promise<boolean>>, toolbox: IgniteToolbox, templateProps: TemplateProps) {
  for (let batch of batches) {
    // execute batch
     await batch(toolbox, templateProps)
  }
}
