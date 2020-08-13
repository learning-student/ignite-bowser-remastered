import { merge, pipe, assoc, omit, __ } from "ramda"
import { getReactNativeVersion } from "./lib/react-native-version"
import { IgniteToolbox, IgniteRNInstallResult } from "./types"
import { GluegunAskResponse } from "gluegun/build/types/toolbox/prompt-types"
import runBatches from "./batches/run_batches"
import gesture_handler from "./batches/gesture_handler"
import splash_screen from "./batches/splash_screen"
import facebook_auth from "./batches/facebook_auth"
import mobx from "./batches/mobx"
import redux from "./batches/redux"
import firebase from "./batches/firebase"

export interface TemplateProps {
  name: string,
  igniteVersion: string | number,
  reactNativeVersion: string | number,
  reactNativeGestureHandlerVersion: string,
  useVectorIcons: boolean,
  animatable: boolean,
  i18n: boolean,
  includeDetox: boolean
  useExpo: boolean,
  useGoogleAuth: boolean,
  useAppleAuth: boolean,
  useFacebookAuth: boolean,
  useOnesignal: boolean,
  oneSignalId: string,
  googleId: string,
  googleIosId: string,
  facebookAndroidId: string,
  facebookIosId: string,
  useSplashScreen: boolean,
  useMobx: boolean,
  useFirebase: boolean,
  useRedux: boolean,
  theme: {
    colors: {},
  },
}


// We need this value here, as well as in our package.json.ejs template
const REACT_NATIVE_GESTURE_HANDLER_VERSION = "^1.5.0"

/**
 * Is Android installed?
 *
 * $ANDROID_HOME/tools folder has to exist.
 */
export const isAndroidInstalled = (toolbox: IgniteToolbox): boolean => {
  const androidHome = process.env.ANDROID_HOME
  const hasAndroidEnv = !toolbox.strings.isBlank(androidHome)
  const hasAndroid = hasAndroidEnv && toolbox.filesystem.exists(`${androidHome}/tools`) === "dir"

  return Boolean(hasAndroid)
}

/**
 * Let's install.
 */
export const install = async (toolbox: IgniteToolbox) => {
  const {
    filesystem,
    parameters,
    ignite,
    reactNative,
    print,
    system,
    template,
    prompt,
    patching,
    strings,
    meta,
  } = toolbox
  const { colors } = print
  const { red, yellow, bold, gray, cyan } = colors
  const isWindows = process.platform === "win32"
  const isMac = process.platform === "darwin"
  const reactNativeVersion = getReactNativeVersion(toolbox)

  if (parameters.options["dry-run"]) return

  const perfStart = new Date().getTime()

  // prints info in gray, indenting 2 spaces
  const printInfo = info =>
    print.info(
      gray(
        "  " +
        info
          .split("\n")
          .map(s => s.trim())
          .join("\n  "),
      ),
    )

  const name = parameters.first
  const spinner = print
    .spin(`using the ${red("Infinite Red")} Bowser Remasted Boilerplate`)
    .succeed()

  let useExpo = false

  let includeDetox = false
  if (isMac) {
    const isCocoapodsInstalled = await system.which(`pod`)
    if (!isCocoapodsInstalled && reactNativeVersion >= "0.60") {
      print.error(`
Error: Cocoapods is not installed, but is required for React Native
0.60 or later, when not using Expo.

More info here: https://reactnative.dev/docs/environment-setup
And here: https://guides.cocoapods.org/using/getting-started.html
      `)
      process.exit(1)
    }

    const askAboutDetox = parameters.options.detox === undefined
    includeDetox = askAboutDetox
      ? await prompt.confirm("Would you like to include Detox end-to-end tests?")
      : parameters.options.detox === true

    if (includeDetox) {
      // prettier-ignore
      printInfo(`
          You'll love Detox for testing your app! There are some additional requirements to
          install, so make sure to check out ${cyan("e2e/README.md")} in your generated app!
        `)
    }
  }
  // attempt to install React Native or die trying
  let rnInstall: IgniteRNInstallResult

  rnInstall = await reactNative.install({
    name,
    version: reactNativeVersion,
    useNpm: !ignite.useYarn,
  })

  if (rnInstall.exitCode > 0) process.exit(rnInstall.exitCode)


  // remove the __tests__ directory, App.js, and unnecessary config files that come with React Native
  const filesToRemove = [
    ".babelrc",
    "babel.config.js",
    ".buckconfig",
    ".eslintrc.js",
    ".prettierrc.js",
    ".flowconfig",
    "App.js",
    "__tests__",
  ]
  filesToRemove.map(filesystem.remove)

  // copy our App, Tests & storybook directories
  spinner.text = "▸ copying files"
  spinner.start()
  const boilerplatePath = `${__dirname}/../boilerplate`
  const copyOpts = { overwrite: true, matching: "!*.ejs" }
  filesystem.copy(`${boilerplatePath}/app`, `${process.cwd()}/app`, copyOpts)
  filesystem.copy(`${boilerplatePath}/assets`, `${process.cwd()}/assets`, copyOpts)
  filesystem.copy(`${boilerplatePath}/test`, `${process.cwd()}/test`, copyOpts)
  filesystem.copy(`${boilerplatePath}/storybook`, `${process.cwd()}/storybook`, copyOpts)
  filesystem.copy(`${boilerplatePath}/bin`, `${process.cwd()}/bin`, copyOpts)
  includeDetox && filesystem.copy(`${boilerplatePath}/e2e`, `${process.cwd()}/e2e`, copyOpts)
  if (!useExpo) {
    filesystem.remove(`${process.cwd()}/app/theme/fonts/index.ts`)
  } else {
    const mocksToRemove = [
      "__snapshots__",
      "mock-async-storage.ts",
      "mock-i18n.ts",
      "mock-react-native-localize.ts",
      "mock-reactotron.ts",
      "setup.ts",
    ]
    mocksToRemove.map(mock => filesystem.remove(`${process.cwd()}/test/${mock}`))
  }
  spinner.stop()

  // generate some templates
  spinner.text = "▸ generating files"

  const templates = [
    { template: "index.js.ejs", target: useExpo ? "App.js" : "index.js" },
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
    {
      template: "app/services/reactotron/reactotron.ts.ejs",
      target: "app/services/reactotron/reactotron.ts",
    },
    { template: "app/utils/storage/storage.ts.ejs", target: "app/utils/storage/storage.ts" },
    {
      template: "app/utils/storage/storage.test.ts.ejs",
      target: "app/utils/storage/storage.test.ts",
    },
    {
      template: "app/navigation/root-navigator.tsx.ejs",
      target: "app/navigation/root-navigator.tsx",
    },
    {
      template: "app/navigation/primary-navigator.tsx.ejs",
      target: "app/navigation/primary-navigator.tsx",
    },
    { template: "storybook/storybook.tsx.ejs", target: "storybook/storybook.tsx" },
    { template: "bin/postInstall", target: "bin/postInstall" },
    {
      template: "app/theme/color.ts.ejs", target: "app/theme/color.ts",
    },
    {
      template: "app/theme/typography.ts.ejs", target: "app/theme/typography.ts",
    },
  ]


  let templatePath = await prompt.ask<GluegunAskResponse>({
    type: "input",
    name: "templatePath",
    message: "Input absolute path of your template file",
  })

  let optionsFromFile = {}


  if (templatePath.templatePath !== "") {
    let path = templatePath.templatePath

    let exists = filesystem.exists(path)

    if (!exists) {
      print.error("Given template path could not found")
      process.exit(1)

    }

    let content = await filesystem.readAsync(path, "json")


    if (!content) {
      print.error("Given template path could not read")
      process.exit(1)
    }

    optionsFromFile = content
  }


  const templateProps: TemplateProps = {
    name,
    igniteVersion: meta.version(),
    reactNativeVersion: rnInstall.version,
    reactNativeGestureHandlerVersion: REACT_NATIVE_GESTURE_HANDLER_VERSION,
    useVectorIcons: true,
    animatable: false,
    i18n: true,
    includeDetox,
    useExpo: false,
    useGoogleAuth: false,
    useAppleAuth: false,
    useFacebookAuth: false,
    useOnesignal: false,
    oneSignalId: "",
    googleId: "",
    googleIosId: "",
    facebookIosId: "",
    useFirebase: true,
    facebookAndroidId: "",
    useSplashScreen: false,
    useRedux: true,
    useMobx: true,
    theme: {
      colors: {},
    },
    ...optionsFromFile,
  }

  !


    await ignite.copyBatch(toolbox, templates, templateProps, {
      quiet: true,
      directory: `${ignite.ignitePluginPath()}/boilerplate`,
    })

  await ignite.setIgniteConfig("navigation", "react-navigation")

  /**
   * Because of https://github.com/react-native-community/cli/issues/462,
   * we can't detox-test the release configuration. Turn on dead-code stripping
   * to fix this.
   */
  if (!useExpo && includeDetox) {
    await ignite.patchInFile(`ios/${name}.xcodeproj/xcshareddata/xcschemes/${name}.xcscheme`, {
      replace: "buildForRunning = \"YES\"\n            buildForProfiling = \"NO\"",
      insert: "buildForRunning = \"NO\"\n            buildForProfiling = \"NO\"",
    })
  }

  /**
   * Append to files
   */
  // https://github.com/facebook/react-native/issues/12724
  await filesystem.appendAsync(".gitattributes", "*.bat text eol=crlf")

  /**
   * Merge the package.json from our template into the one provided from react-native init.
   */
  async function mergePackageJsons() {
    // transform our package.json so we can replace variables
    ignite.log("merging Bowser package.json with React Native package.json")
    const rawJson = await template.generate({
      directory: `${ignite.ignitePluginPath()}/boilerplate`,
      template: "package.json.ejs",
      props: { ...templateProps, kebabName: strings.kebabCase(templateProps.name) },
    })
    const newPackageJson = JSON.parse(rawJson)

    // read in the react-native created package.json
    const currentPackage = filesystem.read("package.json", "json")

    // deep merge
    const newPackage = pipe(
      assoc("dependencies", merge(currentPackage.dependencies, newPackageJson.dependencies)),
      assoc(
        "devDependencies",
        merge(
          omit(["@react-native-community/eslint-config"], currentPackage.devDependencies),
          newPackageJson.devDependencies,
        ),
      ),
      assoc("scripts", merge(currentPackage.scripts, newPackageJson.scripts)),
      merge(__, omit(["dependencies", "devDependencies", "scripts"], newPackageJson)),
    )(currentPackage)

    // write this out
    ignite.log("writing newly merged package.json")
    filesystem.write("package.json", newPackage, { jsonIndent: 2 })
  }

  await mergePackageJsons()

  // pass long the debug flag if we're running in that mode
  const debugFlag = parameters.options.debug ? "--debug" : ""

  try {
    // boilerplate adds itself to get plugin.js/generators etc
    // Could be directory, npm@version, or just npm name.  Default to passed in values
    spinner.stop()

    ignite.log("adding boilerplate to project for generator commands")

    const boilerplate = parameters.options.b || parameters.options.boilerplate || "ignite-bowser"
    const isIgniteInstalled = await system.which(`ignite`)
    const igniteCommand = isIgniteInstalled ? "ignite" : "npx ignite-cli"
    await system.exec(`${igniteCommand} add ${boilerplate} ${debugFlag}`)


    if (!useExpo) {
      ignite.log("patching package.json to add solidarity postInstall")
      ignite.patchInFile(`${process.cwd()}/package.json`, {
        replace: `"postinstall": "solidarity",`,
        insert: `"postinstall": "node ./bin/postInstall",`,
      })
    } else {
      filesystem.remove(`${process.cwd()}/bin/postInstall`)
    }

  // run through some additional installation process
  let batches = [
    firebase,
    gesture_handler,
    splash_screen,
    facebook_auth,
    mobx,
    redux
  ]


  await runBatches(batches, toolbox, templateProps)

  } catch (e) {
    ignite.log(e)
    print.error(`
      There were errors while generating the project. Run with --debug to see verbose output.
    `)
    throw e
  }

  // re-run yarn; will also install pods, because of our postInstall script.
  const installDeps = ignite.useYarn ? "yarn" : "npm install"
  await system.run(installDeps)


  spinner.text = "linking assets"
  spinner.start()
  await system.exec("npx react-native link")
  spinner.succeed(`Linked assets`)


  // for Windows, fix the settings.gradle file. Ref: https://github.com/oblador/react-native-vector-icons/issues/938#issuecomment-463296401
  // for ease of use, just replace any backslashes with forward slashes
  if (!useExpo && isWindows) {
    ignite.log("patching Android settings.gradle file for running on Windows")
    await patching.update(`${process.cwd()}/android/settings.gradle`, contents => {
      return contents.split("\\").join("/")
    })
  }

  // let eslint and prettier clean things up
  ignite.log("linting")
  spinner.text = "linting"
  await system.spawn(`${ignite.useYarn ? "yarn" : "npm run"} lint`)
  ignite.log("formatting")
  spinner.text = "formatting"
  await system.spawn(`${ignite.useYarn ? "yarn" : "npm run"} format`)
  spinner.succeed("Linted and formatted")

  const perfDuration = (new Date().getTime() - perfStart) / 10 / 100
  spinner.succeed(`ignited ${yellow(name)} in ${perfDuration}s`)

  const androidInfo = isAndroidInstalled(toolbox)
    ? ""
    : `\n\nTo run in Android, make sure you've followed the latest react-native setup instructions at https://facebook.github.io/react-native/docs/getting-started.html before using ignite.\nYou won't be able to run ${bold(
      "react-native run-android",
    )} successfully until you have.`

  const runInfo = `react-native run-ios\nreact-native run-android${androidInfo}`

  const successMessage = `
    ${red("Ignite CLI")} ignited ${yellow(name)} in ${gray(`${perfDuration}s`)}

    To get started:

      cd ${name}
      ${runInfo}
      npx ignite-cli --help
      npx ignite-cli doctor

    ${cyan("Need additional help? Join our Slack community at http://community.infinite.red.")}

    ${bold("Now get cooking! 🍽")}

    ${gray(
    "(Running yarn install one last time to make sure everything is installed -- please be patient!)",
  )}
  `

  print.info(successMessage)
}
