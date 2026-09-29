import Svg, { Path } from 'react-native-svg'
import { appColors } from '@/constants/app-theme'

/** The four accent-coloured corner brackets from the app icon, in a 100x100 box. */
export const SCAN_FRAME_PATH =
  'M8 30V18a10 10 0 0 1 10-10h12M70 8h12a10 10 0 0 1 10 10v12M92 70v12a10 10 0 0 1-10 10H70M30 92H18a10 10 0 0 1-10-10V70'

/** The corner brackets alone, cropped so the lines sit close to the edges of `size`. */
export function ScanFrame({ size, strokeWidth = 1.5 }: { size: number; strokeWidth?: number }) {
  return (
    <Svg height={size} viewBox="6 6 88 88" width={size}>
      <Path d={SCAN_FRAME_PATH} fill="none" stroke={appColors.accent} strokeLinecap="round" strokeWidth={strokeWidth} />
    </Svg>
  )
}
