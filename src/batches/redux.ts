import { IgniteToolbox } from "../types"
import { TemplateProps } from "../boilerplate"

export default async function install(toolbox: IgniteToolbox, templateProps: TemplateProps) {
  const { filesystem } = toolbox

  // remove models folder if we don't use mobs
  if (templateProps.useRedux === false) {
    filesystem.remove(`${process.cwd()}/app/Redux`)
    filesystem.remove(`${process.cwd()}/app/Sagas`)
  }

  return true
}
