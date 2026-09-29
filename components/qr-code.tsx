import { useMemo } from 'react'
import Svg, { Path } from 'react-native-svg'
import { encode } from 'uqr'
import { appColors } from '@/constants/app-theme'

/**
 * Renders `value` as a QR code with no quiet zone: one SVG path, one rectangle per horizontal run of dark
 * modules. Each run overlaps the row below by a hair so anti-aliasing never draws seams between rows.
 */
export function QrCode({ size, value }: { size: number; value: string }) {
  const { modules, path } = useMemo(() => {
    const { data, size: modules } = encode(value, { border: 0, ecc: 'M' })
    let path = ''
    data.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        if (!row[x]) {
          continue
        }
        const start = x
        while (row[x + 1]) {
          x++
        }
        const run = x - start + 1
        path += `M${start} ${y}h${run}v${y === modules - 1 ? 1 : 1.05}h-${run}z`
      }
    })
    return { modules, path }
  }, [value])

  return (
    <Svg height={size} viewBox={`0 0 ${modules} ${modules}`} width={size}>
      <Path d={path} fill={appColors.qrForeground} />
    </Svg>
  )
}
