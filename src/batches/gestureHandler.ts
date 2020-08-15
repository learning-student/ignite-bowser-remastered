import { IgniteToolbox } from "../types"
import { TemplateProps } from "../boilerplate"

export default async function install(toolbox: IgniteToolbox, templateProps: TemplateProps) {
  const { ignite, print } = toolbox
  const { name, reactNativeGestureHandlerVersion } = templateProps

  const spinner = print.spin('Installing Gesture Handler')

  ignite.log("adding react-native-gesture-handler")
  await ignite.addModule("react-native-gesture-handler", {
    version: reactNativeGestureHandlerVersion,
  })

  ignite.log("patching MainActivity.java to add RNGestureHandler")

  ignite.patchInFile(
    `${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`,
    {
      after: "import com.facebook.react.ReactActivity;",
      insert: "import com.facebook.react.ReactActivityDelegate;\n" +
        "import com.facebook.react.ReactRootView;\n" +
        "import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;",
    },
  )
  ignite.patchInFile(
    `${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`,
    {
      after: `public class MainActivity extends ReactActivity {`,
      insert:
        "\n  @Override\n" +
        "  protected ReactActivityDelegate createReactActivityDelegate() {\n" +
        "    return new ReactActivityDelegate(this, getMainComponentName()) {\n" +
        "      @Override\n" +
        "      protected ReactRootView createRootView() {\n" +
        "       return new RNGestureHandlerEnabledRootView(MainActivity.this);\n" +
        "      }\n" +
        "    };\n" +
        "  }",
    },
  )

  spinner.succeed('Installed Gesture Handler')

  return true
}
