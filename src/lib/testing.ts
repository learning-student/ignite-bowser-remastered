import { TemplateProps } from "../boilerplate"

export const mockTemplateProps = (): TemplateProps => ({
  name: "testing",
  initialWorkingDir: process.cwd(),
  igniteVersion: 1,
  reactNativeVersion: '0.63.0',
  reactNativeGestureHandlerVersion: '1.0.0',
  useVectorIcons: false,
  i18n: false,
  includeDetox: false,
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
  copyAdditionalDirs: [],
  copyAdditionalFiles: []
})
