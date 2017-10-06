<p align="center">
  <img src="https://raw.githubusercontent.com/lord/img/master/logo-rapidwrap.png" alt="Rapid Wrap: Fast Text Wrapping" width="226">
  <br>
  <code>npm install rapidwrap</code>
  <br><br>
  <a href="https://travis-ci.org/lord/rapidwrap"><img src="https://travis-ci.org/lord/rapidwrap.svg?branch=master" alt="Build Status"></a>
</p>

Imagine you have a canvas, and want to draw wrapped text. You can use `canvas.getContext('2d').measureText(line)`, continuously adding words to `line` until you get to the desired length. But this solution is ~`O(n^2)` to find each line. Instead, thanks to the help of the incredible [opentype.js](https://opentype.js.org/) combined with some custom code, you can use `rapidwrap` to wrap lines in linear time.

<h2>Usage</h2>

Using the rapidwrap command line tool (`npm install -g rapidwrap`), preprocess your text file with:

    rapidwrap /path/to/font/file.otf > output.js
    
Then, in your file:

```js
const Font = require('rapidwrap')
const data = require('./output.js')
let myFont = new Font(data)
let fontSize = 16
let wrapWidth = 300

myFont.measureText("text", fontSize)
// -> pixel width of "text"

myFont.measureText("blah blah very long string that will be wrapped here", fontSize, wrapWidth)
// -> array of wrapped lines as strings
```
