import { IgniteToolbox } from "../types"
import { TemplateProps } from "../boilerplate"

export default async function install(toolbox: IgniteToolbox, templateProps: TemplateProps) {
  const { ignite, print } = toolbox
  const { useFirebase, name } = templateProps


  // if we'll use firebase in our project we need apply some additional steps
  if (useFirebase) {
    const spinner = print.spin('Installing firebase')
    // first add google services into android/build.gradle file
    ignite.patchInFile(
      `${process.cwd()}/android/build.gradle`, {
        after: 'dependencies {',
        insert: "    classpath 'com.google.gms:google-services:4.2.0'"
      }
    )

    // then add play services into android/app/build.gradle
    ignite.patchInFile(
      `${process.cwd()}/android/app/build.gradle`, {
        after: "apply plugin: \"com.android.application\"",
        insert: "apply plugin: 'com.google.gms.google-services'"
      }
    )

    // import firebase header file in AppDelegate.m
    ignite.patchInFile(
      `${process.cwd()}/ios/${name}/AppDelegate.m`,
      {
        after: '#import "AppDelegate.h"',
        insert: '#import <Firebase.h>'
      }
    )

    // add firebase configure command as the first line of launchOptions
    ignite.patchInFile(
      `${process.cwd()}/ios/${name}/AppDelegate.m`,
      {
        after: 'launchOptions\n{',
        insert: "if ([FIRApp defaultApp] == nil) {\n" +
          "    [FIRApp configure];\n" +
          "} ",
      }
    )

    spinner.succeed('Firebase installed')
    print.info('after installation completed you have to copy your google-services.json file into android/app directory')
  }

  return true
}
