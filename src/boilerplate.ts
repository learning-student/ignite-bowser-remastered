import { merge, pipe, assoc, omit, __ } from "ramda"
import { getReactNativeVersion } from "./lib/react-native-version"
import { IgniteToolbox, IgniteRNInstallResult } from "./types"
import runBatches from "./batches/runBatches"
import gestureHandler from "./batches/gestureHandler"
import splashScreen from "./batches/splashScreen"
import facebookAuth from "./batches/facebookAuth"
import mobx from "./batches/mobx"
import redux from "./batches/redux"
import firebase from "./batches/firebase"
import onesignal from "./batches/onesignal"
import { createPath } from "./lib/filesystem"
import copy from "./batches/copy"
import templating from "./batches/templating"
import multidex from "./batches/multidex"
import config from "./batches/config"
const path = require('path')

const initialWorkingDir = path.dirname(process.cwd())

export interface TemplateProps {
  name: string,
  initialWorkingDir: string,
  igniteVersion: string | number,
  reactNativeVersion: string | number,
  reactNativeGestureHandlerVersion: string,
  useVectorIcons: boolean,
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
  usePaper: boolean,
  useRestyle: boolean,
  screens: Array<string>,
  useConfig: boolean,
  copyAdditionalDirs: Array<{ from: string, to: string }>,
  copyAdditionalFiles: Array<{ from: string, to: string }>
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
    .spin(`using the ${red("Infinite Red")} Bowser Ultimate Boilerplate`)
    .succeed()

  const templatePath = parameters.options["template-path"] ? parameters.options : await prompt.ask<Promise<{ templatePath: string }>>({
    type: "input",
    name: "templatePath",
    message: "Input path of your template file",
  })

  let optionsFromFile = {}

  if (templatePath.templatePath !== "") {
    const path = createPath(templatePath.templatePath, initialWorkingDir)
    const exists = filesystem.exists(path)

    if (!exists) {
      print.error("Given template path(" + path + ") could not found")
      process.exit(1)
    }

    const content = await filesystem.readAsync(path, "json")

    if (!content) {
      print.error("Given template path could not read")
      process.exit(1)
    }

    optionsFromFile = content
  }

  const useExpo = false
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
  const rnInstall: IgniteRNInstallResult = await reactNative.install({
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

  const templateProps: TemplateProps = {
    name,
    initialWorkingDir,
    igniteVersion: meta.version(),
    reactNativeVersion: rnInstall.version,
    reactNativeGestureHandlerVersion: REACT_NATIVE_GESTURE_HANDLER_VERSION,
    useVectorIcons: false,
    i18n: false,
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
    useFirebase: false,
    facebookAndroidId: "",
    useSplashScreen: false,
    useRedux: false,
    useMobx: false,
    usePaper: false,
    useRestyle: false,
    copyAdditionalDirs: [],
    copyAdditionalFiles: [],
    useConfig: true,
    screens: [],
    ...optionsFromFile,
  }

  // run templating
  await templating(toolbox, templateProps)

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
    spinner.text = 'Installing dependencies this might take a few minutes'
    spinner.start()

    ignite.log("adding boilerplate to project for generator commands")

    const boilerplate = parameters.options.b || parameters.options.boilerplate || "ignite-bowser-ultimate"
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
    const batches = [
      config,
      firebase,
      gestureHandler,
      splashScreen,
      facebookAuth,
      mobx,
      onesignal,
      redux,
      copy,
      multidex
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

  spinner.succeed('Dependencies installed')

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
