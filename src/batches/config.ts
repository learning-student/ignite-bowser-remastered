import { GluegunToolbox } from "gluegun"
import { TemplateProps } from "../boilerplate"

export default async function install(toolbox: GluegunToolbox, templateProps: TemplateProps) {
  const { ignite, print } = toolbox
  const { useConfig } = templateProps

  if (useConfig) {
    const spinner = print.spin('Installing react-native-config')

    ignite.patchInFile(
      `${process.cwd()}/android/app/build.gradle`,
      {
        after: 'apply plugin: "com.android.application"',
        insert: 'apply from: project(\':react-native-config\').projectDir.getPath() + "/dotenv.gradle"'
      })

    spinner.succeed('Firebase installed')
    print.info('react-native-config has been installed update .env file')
  }

  return true
}
