import { TemplateProps } from "../boilerplate"
import { createPath } from "../lib/filesystem"
import { GluegunToolbox } from "gluegun"

export default async function install(toolbox: GluegunToolbox, templateProps: TemplateProps) {
  const { filesystem } = toolbox
  const { copyAdditionalDirs, copyAdditionalFiles, initialWorkingDir } = templateProps

  // let's copy all the directories and files
  copyAdditionalDirs.concat(copyAdditionalFiles).forEach(dir => {
    filesystem.copy(
      createPath(dir.from, initialWorkingDir),
      createPath(dir.to, initialWorkingDir), { overwrite: true },
    )
  })
}
