// The Font object

import { DefaultEncoding } from './encoding'
import glyphset from './glyphset'
import Substitution from './substitution'

/**
 * @typedef FontOptions
 * @type Object
 * @property {Boolean} empty - whether to create a new empty font
 * @property {string} familyName
 * @property {string} styleName
 * @property {string=} fullName
 * @property {string=} postScriptName
 * @property {string=} designer
 * @property {string=} designerURL
 * @property {string=} manufacturer
 * @property {string=} manufacturerURL
 * @property {string=} license
 * @property {string=} licenseURL
 * @property {string=} version
 * @property {string=} description
 * @property {string=} copyright
 * @property {string=} trademark
 * @property {Number} unitsPerEm
 * @property {Number} ascender
 * @property {Number} descender
 * @property {Number} createdTimestamp
 * @property {string=} weightClass
 * @property {string=} widthClass
 * @property {string=} fsSelection
 */

/**
 * A Font represents a loaded OpenType font file.
 * It contains a set of glyphs and methods to draw text on a drawing context,
 * or to get a path representing the text.
 * @exports opentype.Font
 * @class
 * @param {FontOptions}
 * @constructor
 */
function Font (options) {
  options = options || {}

  if (!options.empty) {
        // Check that we've provided the minimum set of names.
    // checkArgument(options.familyName, 'When creating a new Font object, familyName is required.')
    // checkArgument(options.styleName, 'When creating a new Font object, styleName is required.')
    // checkArgument(options.unitsPerEm, 'When creating a new Font object, unitsPerEm is required.')
    // checkArgument(options.ascender, 'When creating a new Font object, ascender is required.')
    // checkArgument(options.descender, 'When creating a new Font object, descender is required.')
    // checkArgument(options.descender < 0, 'Descender should be negative (e.g. -512).')

        // OS X will complain if the names are empty, so we put a single space everywhere by default.
    this.names = {
      fontFamily: {en: options.familyName || ' '},
      fontSubfamily: {en: options.styleName || ' '},
      fullName: {en: options.fullName || options.familyName + ' ' + options.styleName},
      postScriptName: {en: options.postScriptName || options.familyName + options.styleName},
      designer: {en: options.designer || ' '},
      designerURL: {en: options.designerURL || ' '},
      manufacturer: {en: options.manufacturer || ' '},
      manufacturerURL: {en: options.manufacturerURL || ' '},
      license: {en: options.license || ' '},
      licenseURL: {en: options.licenseURL || ' '},
      version: {en: options.version || 'Version 0.1'},
      description: {en: options.description || ' '},
      copyright: {en: options.copyright || ' '},
      trademark: {en: options.trademark || ' '}
    }
    this.unitsPerEm = options.unitsPerEm || 1000
    this.ascender = options.ascender
    this.descender = options.descender
    this.createdTimestamp = options.createdTimestamp
  }

  this.supported = true // Deprecated: parseBuffer will throw an error if font is not supported.
  this.glyphs = new glyphset.GlyphSet(this, options.glyphs || [])
  this.encoding = new DefaultEncoding(this)
  this.substitution = new Substitution(this)
}

/**
 * Convert the given character to a single glyph index.
 * Note that this function assumes that there is a one-to-one mapping between
 * the given character and a glyph; for complex scripts this might not be the case.
 * @param  {string}
 * @return {Number}
 */
 // NEEDED
Font.prototype.charToGlyphIndex = function (s) {
  return this.encoding.charToGlyphIndex(s)
}

/**
 * Convert the given text to a list of Glyph objects.
 * Note that there is no strict one-to-one mapping between characters and
 * glyphs, so the list of returned glyphs can be larger or smaller than the
 * length of the given string.
 * @param  {string}
 * @param  {GlyphRenderOptions} [options]
 * @return {opentype.Glyph[]}
 */
 // NEEDED
Font.prototype.stringToGlyphs = function (s, options) {
  options = options || this.defaultRenderOptions
    // Get glyph indexes
  const indexes = []
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i]
    indexes.push(this.charToGlyphIndex(c))
  }
  let length = indexes.length

    // Apply substitutions on glyph indexes
  if (options.features) {
    const script = options.script || this.substitution.getDefaultScriptName()
    let manyToOne = []
    if (options.features.liga) manyToOne = manyToOne.concat(this.substitution.getFeature('liga', script, options.language))
    if (options.features.rlig) manyToOne = manyToOne.concat(this.substitution.getFeature('rlig', script, options.language))
    for (let i = 0; i < length; i += 1) {
      for (let j = 0; j < manyToOne.length; j++) {
        const ligature = manyToOne[j]
        const components = ligature.sub
        const compCount = components.length
        let k = 0
        while (k < compCount && components[k] === indexes[i + k]) k++
        if (k === compCount) {
          indexes.splice(i, compCount, ligature.by)
          length = length - compCount + 1
        }
      }
    }
  }

  // convert glyph indexes to glyph objects
  const glyphs = new Array(length)
  const notdef = this.glyphs.get(0)
  for (let i = 0; i < length; i += 1) {
    glyphs[i] = this.glyphs.get(indexes[i]) || notdef
  }
  return glyphs
}

/**
 * Retrieve the value of the kerning pair between the left glyph (or its index)
 * and the right glyph (or its index). If no kerning pair is found, return 0.
 * The kerning value gets added to the advance width when calculating the spacing
 * between glyphs.
 * @param  {opentype.Glyph} leftGlyph
 * @param  {opentype.Glyph} rightGlyph
 * @return {Number}
 */
 // NEEDED
Font.prototype.getKerningValue = function (leftGlyph, rightGlyph) {
  leftGlyph = leftGlyph.index || leftGlyph
  rightGlyph = rightGlyph.index || rightGlyph
  const gposKerning = this.getGposKerningValue
  return gposKerning ? gposKerning(leftGlyph, rightGlyph)
        : (this.kerningPairs[leftGlyph + ',' + rightGlyph] || 0)
}

/**
 * @typedef GlyphRenderOptions
 * @type Object
 * @property {string} [script] - script used to determine which features to apply. By default, 'DFLT' or 'latn' is used.
 *                               See https://www.microsoft.com/typography/otspec/scripttags.htm
 * @property {string} [language='dflt'] - language system used to determine which features to apply.
 *                                        See https://www.microsoft.com/typography/developers/opentype/languagetags.aspx
 * @property {boolean} [kerning=true] - whether to include kerning values
 * @property {object} [features] - OpenType Layout feature tags. Used to enable or disable the features of the given script/language system.
 *                                 See https://www.microsoft.com/typography/otspec/featuretags.htm
 */
 // NEEDED
Font.prototype.defaultRenderOptions = {
  kerning: true,
  features: {
    liga: true,
    rlig: true
  }
}

/**
 * Helper function that invokes the given callback for each glyph in the given text.
 * The callback gets `(glyph, x, y, fontSize, options)`.* @param  {string} text
 * @param {string} text - The text to apply.
 * @param  {number} [x=0] - Horizontal position of the beginning of the text.
 * @param  {number} [y=0] - Vertical position of the *baseline* of the text.
 * @param  {number} [fontSize=72] - Font size in pixels. We scale the glyph units by `1 / unitsPerEm * fontSize`.
 * @param  {GlyphRenderOptions=} options
 * @param  {Function} callback
 */
 // NEEDED
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

/**
 * Returns the advance width of a text.
 *
 * This is something different than Path.getBoundingBox() as for example a
 * suffixed whitespace increases the advanceWidth but not the bounding box
 * or an overhanging letter like a calligraphic 'f' might have a quite larger
 * bounding box than its advance width.
 *
 * This corresponds to canvas2dContext.measureText(text).width
 *
 * @param  {string} text - The text to create.
 * @param  {number} [fontSize=72] - Font size in pixels. We scale the glyph units by `1 / unitsPerEm * fontSize`.
 * @param  {GlyphRenderOptions=} options
 * @return advance width
 */
 // NEEDED
Font.prototype.getAdvanceWidth = function (text, fontSize, options) {
  return this.forEachGlyph(text, 0, 0, fontSize, options, function () {})
}

export default Font
