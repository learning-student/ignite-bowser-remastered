import { TemplateProps } from "../boilerplate"
import { IgniteToolbox } from "../types"

export default async function install(toolbox: IgniteToolbox, templateProps: TemplateProps) {
  const {print, ignite} = toolbox
  const spinner = print.spin('▸ generating files')


  const templates = [
    { template: "index.js.ejs", target:  "index.js" },
    { template: "README.md", target: "README.md" },
    { template: ".gitignore.ejs", target: ".gitignore" },
    { template: ".env.example", target: ".env" },
    { template: ".prettierignore", target: ".prettierignore" },
    { template: ".solidarity", target: ".solidarity" },
    { template: "babel.config.js", target: "babel.config.js" },
    { template: "react-native.config.js", target: "react-native.config.js" },
    { template: "tsconfig.json", target: "tsconfig.json" },
    { template: "app/app.tsx.ejs", target: "app/app.tsx" },
    { template: "app/i18n/i18n.ts.ejs", target: "app/i18n/i18n.ts" },
    { template: "app/services/reactotron/reactotron.ts.ejs", target: "app/services/reactotron/reactotron.ts" },
    { template: "app/utils/storage/storage.ts.ejs", target: "app/utils/storage/storage.ts" },
    { template: "app/utils/storage/storage.test.ts.ejs", target: "app/utils/storage/storage.test.ts", },
    { template: "app/navigation/root-navigator.tsx.ejs", target: "app/navigation/root-navigator.tsx", },
    { template: "app/navigation/primary-navigator.tsx.ejs", target: "app/navigation/primary-navigator.tsx", },
    { template: "storybook/storybook.tsx.ejs", target: "storybook/storybook.tsx" },
    { template: "bin/postInstall", target: "bin/postInstall" },
    { template: "app/theme/color.ts.ejs", target: "app/theme/color.ts" },
    { template: "app/theme/typography.ts.ejs", target: "app/theme/typography.ts" },
    { template: "app/utils/social.ts.ejs", target: "app/utils/social.ts" },
  ]
  await ignite.copyBatch(toolbox, templates, templateProps, {
    quiet: true,
    directory: `${ignite.ignitePluginPath()}/boilerplate`,
  })

  await ignite.setIgniteConfig("navigation", "react-navigation")

  spinner.succeed('files generated')

  return true

}
