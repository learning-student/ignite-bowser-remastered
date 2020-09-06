import color  from './color'
import typographg from "./typography"
import {spacing} from "./spacing"
import { configureFonts } from 'react-native-paper';
import borderRadius from "./radius";

export default {
  colors: color,
  fonts: configureFonts(typography),
  spacing,
  borderRadius,
  roundness: 0,
  dark: false,
  animation: { scale: 3} as ReactNativePaper.ThemeAnimation
}
