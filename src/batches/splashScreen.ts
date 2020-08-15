import { IgniteToolbox } from "../types"
import { TemplateProps } from "../boilerplate"

export default async function install(toolbox: IgniteToolbox, templateProps: TemplateProps) {
  const { ignite } = toolbox
  const { name } = templateProps

  if (templateProps.useSplashScreen) {
    ignite.patchInFile(
      `${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`,
      {
        after: "import com.facebook.react.ReactActivity;",
        insert: "import android.os.Bundle;\n" +
          "import org.devio.rn.splashscreen.SplashScreen; \n",
      },
    )

    ignite.patchInFile(
      `${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`,
      {
        after: `public class MainActivity extends ReactActivity {`,
        insert: " @Override\n" +
          "  protected void onCreate(Bundle savedInstanceState) {\n" +
          "     SplashScreen.show(this);  // here\n" +
          "     super.onCreate(savedInstanceState);\n" +
          "  }",
      },
    )
  }

  return true
}
