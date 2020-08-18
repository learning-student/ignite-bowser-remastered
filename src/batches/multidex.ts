import { IgniteToolbox } from "../types"
import { TemplateProps } from "../boilerplate"

// this batch enabled multiDex by default
// this is required because when firebase or fbsdk have installed they broke the build
export default async function install(toolbox: IgniteToolbox, templateProps: TemplateProps) {
  const { ignite } = toolbox

  ignite.patchInFile({
    before: "versionName \"1.0\"",
    insert: "multiDexEnabled true"
  })
}
