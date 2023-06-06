interface Color {
  r: number
  g: number
  b: number
}

export function rgbFromHex(hex: string): Color {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!
  return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
  }
}


function mapColorToPalette(red: number, green: number, blue: number, palette: Color[]) {
  let color, diffR, diffG, diffB, diffDistance, mappedColor
  let distance = 25000
  for (var i = 0; i < palette.length; i++) {
      color = palette[i]
      diffR = color.r - red
      diffG = color.g - green
      diffB = color.b - blue
      diffDistance = diffR * diffR + diffG * diffG + diffB * diffB
      if (diffDistance < distance) {
          distance = diffDistance
          mappedColor = palette[i]
      }
  }

  return mappedColor
}

export function getClosestColor(color: Color, palette: Color[]) {
  return mapColorToPalette(
      color.r,
      color.b,
      color.g,
      palette
  )
}
