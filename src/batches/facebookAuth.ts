import { IgniteToolbox } from "../types"
import { TemplateProps } from "../boilerplate"

export default async function install(toolbox: IgniteToolbox, templateProps: TemplateProps) {
  const { ignite } = toolbox
  const { name } = templateProps

  if (templateProps.useFacebookAuth) {
    // insert facebook android client id  into strings.xml and AndroidManifest.xml
    if (templateProps.facebookAndroidId && templateProps.facebookAndroidId !== "") {
      ignite.patchInFile(
        `${process.cwd()}/android/app/src/main/res/values/strings.xml`,
        {
          before: "</resources>",
          insert: "    <string name=\"facebook_app_id\">" + templateProps.facebookAndroidId + " </string>\n" +
            "    <string name=\"fb_login_protocol_scheme\">fb" + templateProps.facebookAndroidId + "</string>",
        },
      )

      ignite.patchInFile(
        `${process.cwd()}/android/app/src/main/res/AndroidManifest.xml`,
        {
          before: "<activity",
          insert: "<meta-data android:name=\"com.facebook.sdk.ApplicationId\" android:value=\"@string/facebook_app_id\"/>",
        },
      )
    }

    // insert ios id into Info.plist
    if (templateProps.facebookIosId && templateProps.facebookIosId !== "") {
      ignite.patchInFile(
        `${process.cwd()}/ios/${name}/Info.plist`,
        {
          after: "<dict>",
          insert: "    <key>CFBundleURLTypes</key>\n" +
            "    <array>\n" +
            "      <dict>\n" +
            "      <key>CFBundleURLSchemes</key>\n" +
            "      <array>\n" +
            "        <string>fb" + templateProps.facebookIosId + "</string>\n" +
            "      </array>\n" +
            "      </dict>\n" +
            "    </array>\n" +
            "    <key>FacebookAppID</key>\n" +
            "    <string>" + templateProps.facebookIosId + "</string>\n" +
            "    <key>FacebookDisplayName</key>\n" +
            "    <string>" + name + "</string>\n" +
            "    <key>LSApplicationQueriesSchemes</key>\n" +
            "    <array>\n" +
            "      <string>fbapi</string>\n" +
            "      <string>fb-messenger-api</string>\n" +
            "      <string>fbauth2</string>\n" +
            "      <string>fbshareextension</string>\n" +
            "    </array>",
        },
      )
    }
  }

  return true
}
