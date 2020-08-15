import { IgniteToolbox } from "../types"
import { TemplateProps } from "../boilerplate"

export default async function install(toolbox: IgniteToolbox, templateProps: TemplateProps) {
  const { ignite } = toolbox
  const { useOnesignal } = templateProps

  if (useOnesignal) {
    ignite.patchInFile(
      `${process.cwd()}/android/app/build.gradle`,
      {
        before: "apply plugin: \"com.android.application\"",
        after: "buildscript {\n" +
          "    repositories {\n" +
          "        maven { url 'https://plugins.gradle.org/m2/' } // Gradle Plugin Portal \n" +
          "    }\n" +
          "    dependencies {\n" +
          "        classpath 'gradle.plugin.com.onesignal:onesignal-gradle-plugin:[0.12.6, 0.99.99]'\n" +
          "    }\n" +
          "}\n" +
          "\n" +
          "apply plugin: 'com.onesignal.androidsdk.onesignal-gradle-plugin'"
      }
    )
  }

  return true
}
