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

Font.prototype._forEachGlyph = function (text, fontSize, options, callback) {
  x = 0
  fontSize = fontSize !== undefined ? fontSize : 72
  options = options || this.defaultRenderOptions
  const fontScale = 1 / this.unitsPerEm * fontSize
  const glyphs = this._stringToGlyphs(text)
  for (let i = 0; i < glyphs.length; i += 1) {
    const glyph = glyphs[i]
    if (!callback.call(this, glyph, x)) {
      return
    }
    if (glyph.advanceWidth) {
      x += glyph.advanceWidth * fontScale
    }

    if (options.kerning && i < glyphs.length - 1) {
      const kerningValue = this._getKerningValue(glyph, glyphs[i + 1])
      x += kerningValue * fontScale
    }
  }
  return x
}

Font.prototype.measureText = function (text, fontSize, options) {
  return this._forEachGlyph(text, fontSize, options, function (g, x) {return true})
}

module.exports = Font
