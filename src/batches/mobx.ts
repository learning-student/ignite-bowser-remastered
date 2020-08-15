import { IgniteToolbox } from "../types"
import { TemplateProps } from "../boilerplate"

export default async function install(toolbox: IgniteToolbox, templateProps: TemplateProps) {
  const { filesystem } = toolbox

  // remove models folder if we don't use mobs
  if (templateProps.useMobx === false) {
    filesystem.remove(`${process.cwd()}/app/models`)
  }

  return true
}
