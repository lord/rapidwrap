function Font (fontJson) {
  this.unitsPerEm = fontJson.unitsPerEm
  this.unicodeMap = {}
  for (let i = 0; i < fontJson.glyphData.length; i++) {
    let glyph = fontJson.glyphData[i]
    let unicodes = glyph.slice(1)
    let glyphObj = {
      index: i,
      advanceWidth: glyph[0],
      unicodes: unicodes
    }
    for (let j = 0; j < unicodes.length; j++) {
      this.unicodeMap[unicodes[j]] = glyphObj
    }
  }
  this.getGposKerningValue = null // TODO LOAD PROPERLY
  this.kerningPairs = fontJson.kerningPairs
}

Font.prototype._stringToGlyphs = function (s) {
  const glyphs = new Array(s.length)
  for (let i = 0; i < s.length; i += 1) {
    const code = s[i].charCodeAt(0)
    glyphs[i] = this.unicodeMap[code]
  }
  return glyphs
}

Font.prototype._getKerningValue = function (leftGlyph, rightGlyph) {
  leftGlyph = leftGlyph.index || leftGlyph
  rightGlyph = rightGlyph.index || rightGlyph
  const gposKerning = this.getGposKerningValue
  return gposKerning ? gposKerning(leftGlyph, rightGlyph)
        : (this.kerningPairs[leftGlyph + ',' + rightGlyph] || 0)
}

Font.prototype.defaultRenderOptions = {
  kerning: true
}

Font.prototype._advance = function (fontScale, glyphs, i, options) {
  const glyph = glyphs[i]
  let x = 0
  if (glyph.advanceWidth) {
    x += glyph.advanceWidth * fontScale
  }
  if (options.kerning && i < glyphs.length - 1) {
    const kerningValue = this._getKerningValue(glyph, glyphs[i + 1])
    x += kerningValue * fontScale
  }
  return x
}

Font.prototype.measureText = function (text, fontSize, options) {
  let x = 0
  fontSize = fontSize !== undefined ? fontSize : 72
  options = options || this.defaultRenderOptions
  const fontScale = 1 / this.unitsPerEm * fontSize
  const glyphs = this._stringToGlyphs(text)

  for (let i = 0; i < glyphs.length; i += 1) {
    x += this._advance(fontScale, glyphs, i, options)
  }
  return x
}

Font.prototype.wrapText = function (text, fontSize, width, options) {
  fontSize = fontSize !== undefined ? fontSize : 72
  options = options || this.defaultRenderOptions
  const fontScale = 1 / this.unitsPerEm * fontSize
  const glyphs = this._stringToGlyphs(text)

  let lines = []
  let x = 0
  let wordX = 0
  let line = ""
  let word = ""
  for (let i = 0; i < glyphs.length; i += 1) {
    let delta = this._advance(fontScale, glyphs, i, options)
    if (text[i] === " ") {
      // MOVE WORD TO LINE
      console.log(`word to line: ${word}`)
      line += word + text[i]
      word = ""
      wordX = x + delta
    } else {
      if (delta + x > width) {
        // TOO LONG!
        if (line.length > 0) {
          x = Math.max(x-wordX,0)
          wordX = 0
          console.log('line done: ', line, x)
          lines.push(line)
          line = ""
        } else {
          // TOO LONG, and we haven't finished a word yet so we have to hard start a new one
          x = 0
          wordX = 0
          console.log('word too long: ', word)
          lines.push(word)
          word = ""
        }
      }
      word += text[i]
      x += delta
    }

  }
  line += word
  if (line.length > 0) {
    lines.push(line)
  }
  return lines
}

module.exports = Font
