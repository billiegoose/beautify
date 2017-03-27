import test from 'ava'
import render from '../dist/render-html'
import parse from 'posthtml-parser'

test(t => {
  let ast = parse(`<!DOCTYPE html><head><title>Hello World</title><link rel="stylesheet" href="style.css"></head>`)
  let res = render(ast)
  console.log('--------res--------')
  console.log(res)
  t.is(res, `<!DOCTYPE html>
<head>
  <title>Hello World</title>
  <link rel="stylesheet" href="style.css">
</head>
`)
})

// Trim the contents of block nodes
test(t => {
  let ast = parse(`<body><div><div> Hello </div></div></body>`)
  let res = render(ast)
  console.log('--------res--------')
  console.log(res)
  t.is(res, `<body>
  <div>
    <div>Hello</div>
  </div>
</body>
`)
})
// Trim the contents of block nodes
test(t => {
  let ast = parse(`<body><div><p> <span>Hello </span></p></div></body>`)
  let res = render(ast)
  console.log('--------res--------')
  console.log(res)
  t.is(res, `<body>
  <div>
    <p>
      <span>Hello</span>
    </p>
  </div>
</body>
`)
})
// Collapse whitespace
test(t => {
  let ast = parse(`<div><b> Hello </b> world <i> ! </i><br></div>`)
  let res = render(ast)
  console.log('--------res--------')
  console.log(res)
  t.is(res, `<div>
  <b>Hello </b>world <i>!</i>
  <br>
</div>
`)
})
// Format of bulletted lists
test(t => {
  let ast = parse(`<div class="list"><ul><li><a href="#">One</a></li><li>Two</li><li><a href="#">Three</a><ul><li><a href="#">3.1</a></li></ul></li></ul></div>`)
  let res = render(ast)
  console.log('--------res--------')
  console.log(res)
  t.is(res, `<div class="list">
  <ul>
    <li><a href="#">One</a></li>
    <li>Two</li>
    <li>
      <a href="#">Three</a>
      <ul>
        <li><a href="#">3.1</a></li>
      </ul>
    </li>
  </ul>
</div>
`)
})
