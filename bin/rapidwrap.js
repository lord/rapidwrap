#!/usr/bin/env node

const opentype = require('opentype.js')
if (process.argv.length < 3) {
  console.log('Usage: rapidwrap <PATH TO FONT FILE>')
  process.exit(0)
}
let font = opentype.loadSync(process.argv[2]);
// console.log(font.getAdvanceWidth("foobar", 14, {}))
console.log(font.glyphs)
