import { IgniteToolbox } from "../types"
import { TemplateProps } from "../boilerplate"

// this batch enabled multiDex by default
// this is required because when firebase or fbsdk have installed they broke the build
export default async function install(toolbox: IgniteToolbox, templateProps: TemplateProps) {
  const { ignite } = toolbox

  await ignite.patchInFile(
    `${process.cwd()}/android/app/build.gradle`,
    {
      after: "versionCode 1",
      insert: "multiDexEnabled true",
    })

  return true
}
