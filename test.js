const Font = require('./index')
const data = require('./testout')

let f = new Font(data)

console.log(f.getAdvanceWidth("text", 10))
require('fs').unlinkSync('./testout.js')