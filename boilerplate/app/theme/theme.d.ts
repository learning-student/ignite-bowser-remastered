import { SpacingInterface } from "./spacing"

declare global {
  namespace ReactNativePaper {
    interface ThemeColors {
      line: string;
      transparent: string;
      primaryDarker: string,
      error: string,
      success: string
    }

    interface Theme {
      spacing: SpacingInterface
      //myOwnProperty: boolean;
    }
  }
}
