#!/usr/bin/env node

const opentype = require('opentype.js')
if (process.argv.length < 3) {
  console.log('Usage: rapidwrap <PATH TO FONT FILE>')
  process.exit(0)
}
let font = opentype.loadSync(process.argv[2]);
// console.log(font.getAdvanceWidth("foobar", 14, {}))
let glyphs = []
for (let idx in font.glyphs.glyphs) {
  let glyph = font.glyphs.glyphs[idx]
  if (typeof glyph === 'function') {
      glyph = glyph();
  }
  glyphs.push([glyph.index, glyph.advanceWidth].concat(glyph.unicodes))
}
let output = {
  unitsPerEm: font.unitsPerEm,
  glyphData: glyphs,
  getGposKerningValue: null,
  kerningPairs: font.kerningPairs,
}

console.log(`module.exports = ${JSON.stringify(output)}`)
