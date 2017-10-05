import glyphset from './glyphset'

// TO SAVE FROM FONT

// this.unitsPerEm
// this.glyphs
    // index
    // unicode
    // advancedWidth
// this.getGposKerningValue
// this.kerningPairs


function Font (options) {
  options = options || {}

  if (!options.empty) {
    this.unitsPerEm = options.unitsPerEm || 1000
  }

  this.unitsPerEm = 1000
  this.glyphs = new glyphset.GlyphSet(this, options.glyphs || [])
}

Font.prototype.charToGlyphIndex = function(c) {
    const code = c.charCodeAt(0);
    const glyphs = this.glyphs;
    if (glyphs) {
        for (let i = 0; i < glyphs.length; i += 1) {
            const glyph = glyphs.get(i);
            for (let j = 0; j < glyph.unicodes.length; j += 1) {
                if (glyph.unicodes[j] === code) {
                    return i;
                }
            }
        }
    }
    return null;
}

Font.prototype.stringToGlyphs = function (s, options) {
  options = options || this.defaultRenderOptions
    // Get glyph indexes
  const indexes = []
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i]
    indexes.push(this.charToGlyphIndex(c))
  }
  let length = indexes.length

  // convert glyph indexes to glyph objects
  const glyphs = new Array(length)
  const notdef = this.glyphs.get(0)
  for (let i = 0; i < length; i += 1) {
    glyphs[i] = this.glyphs.get(indexes[i]) || notdef
  }
  return glyphs
}

Font.prototype.getKerningValue = function (leftGlyph, rightGlyph) {
  leftGlyph = leftGlyph.index || leftGlyph
  rightGlyph = rightGlyph.index || rightGlyph
  const gposKerning = this.getGposKerningValue
  return gposKerning ? gposKerning(leftGlyph, rightGlyph)
        : (this.kerningPairs[leftGlyph + ',' + rightGlyph] || 0)
}

Font.prototype.defaultRenderOptions = {
  kerning: true,
  features: {
    liga: true,
    rlig: true
  }
}

Font.prototype.forEachGlyph = function (text, x, y, fontSize, options, callback) {
  x = x !== undefined ? x : 0
  y = y !== undefined ? y : 0
  fontSize = fontSize !== undefined ? fontSize : 72
  options = options || this.defaultRenderOptions
  const fontScale = 1 / this.unitsPerEm * fontSize
  const glyphs = this.stringToGlyphs(text, options)
  for (let i = 0; i < glyphs.length; i += 1) {
    const glyph = glyphs[i]
    callback.call(this, glyph, x, y, fontSize, options)
    if (glyph.advanceWidth) {
      x += glyph.advanceWidth * fontScale
    }

    if (options.kerning && i < glyphs.length - 1) {
      const kerningValue = this.getKerningValue(glyph, glyphs[i + 1])
      x += kerningValue * fontScale
    }

    if (options.letterSpacing) {
      x += options.letterSpacing * fontSize
    } else if (options.tracking) {
      x += (options.tracking / 1000) * fontSize
    }
  }
  return x
}

Font.prototype.getAdvanceWidth = function (text, fontSize, options) {
  return this.forEachGlyph(text, 0, 0, fontSize, options, function () {})
}

export default Font
