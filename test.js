const Font = require('./index')
const data = require('./testout')
require('fs').unlinkSync('./testout.js')

let f = new Font(data)
let w = f.measureText("text", 10)
if (!w) {
  console.log('Size not returned')
  process.exit(1)
}
if (w < 17.42 || w > 17.43) {
  console.log('Incorrect size detected: expected ~17.42, got ', w)
  process.exit(1)
}
console.log(
  f.wrapText("meown utesaotuhes oanthunes thaunsth uetnoh untehnatuhensothunsethoaunsetohunstheoas ntuhens hnsth ansth nst hont ehnot hantu heonta hunte hoasu hensoat hunetsoahunstehoasnutheonsatuhnseotahunstehoansutheoansuthensotauhenstoahunseothansuthnst", 16, 400)
)

