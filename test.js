const Font = require('./index')
const data = require('./foobar')

let f = new Font(data)

console.log(f.getAdvanceWidth("text", 10))