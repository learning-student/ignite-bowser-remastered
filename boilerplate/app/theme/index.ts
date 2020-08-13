import { color } from './color'
import {typography} from "./typography"
import {spacing} from "./spacing"
import { configureFonts } from 'react-native-paper';

export const theme = {
  colors: color,
  fonts: configureFonts(typography),
  spacing
}
