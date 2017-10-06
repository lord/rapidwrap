#!/usr/bin/env node

const opentype = require('opentype.js')
if (process.argv.length < 3) {
  console.log('Usage: rapidwrap <PATH TO FONT FILE>')
  process.exit(0)
}
let font = opentype.loadSync(process.argv[2])
let maxIdx = -1
for (let idx in font.glyphs.glyphs) {
  maxIdx = Math.max(maxIdx, idx)
}
let glyphs = []
for (let i = 0; i < maxIdx; i++) {
  let glyph = font.glyphs.glyphs[i]
  if (glyph) {
    if (typeof glyph === 'function') {
      glyph = glyph()
    }
    glyphs.push([glyph.advanceWidth].concat(glyph.unicodes))
  } else {
    glyphs.push([0])
  }
}
let output = {
  unitsPerEm: font.unitsPerEm,
  glyphData: glyphs,
  getGposKerningValue: null,
  kerningPairs: font.kerningPairs
}

console.log(`module.exports = ${JSON.stringify(output)}`)
