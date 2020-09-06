import { color } from './color'
import {typography} from "./typography"
import {spacing} from "./spacing"
import { configureFonts } from 'react-native-paper';
import borderRadius from "./radius";


declare global {
  namespace ReactNativePaper {
    interface Theme {
      spacing: typeof spacing;
      borderRadius: typeof  borderRadius;
    }
  }
}


export default {
  colors: color,
  fonts: configureFonts(typography),
  spacing
}
