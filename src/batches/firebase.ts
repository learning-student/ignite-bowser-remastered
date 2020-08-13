import { IgniteToolbox } from "../types"
import { TemplateProps } from "../boilerplate"



export default async function install(toolbox: IgniteToolbox, templateProps: TemplateProps) {
  let {ignite} = toolbox
  let {useFirebase, name} = templateProps


  // if we'll use firebase in our project we need apply some additional steps
  if (useFirebase) {
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

    ignite.patchInFile(
      `${process.cwd()}/ios/${name}/AppDelegate.m`,
      {
        after: 'launchOptions\n{',
        insert: "if ([FIRApp defaultApp] == nil) {\n" +
          "    [FIRApp configure];\n" +
          "} ",
      }
    )
  }

  return true;
}
