import  typography  from "./typography"
import {spacing} from "./spacing"
import borderRadius from "./radius"

declare global {
  namespace ReactNativePaper {
    interface Theme {
      spacing: typeof spacing;
      borderRadius: typeof borderRadius;
    }
  }
}
