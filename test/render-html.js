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

// Format of comments
test(t => {
  let ast = parse(`<head><!-- This is a comment --><!-- This is a comment --><script src="jquery.js"></script></head>`)
  let res = render(ast)
  console.log('--------res--------')
  console.log(res)
  t.is(res, `<head>
  <!-- This is a comment -->
  <!-- This is a comment -->
  <script src="jquery.js"></script>
</head>
`)
})

// Format without extra newlines
test(t => {
  let ast = parse(`<!DOCTYPE html>
<html>

<head>
    <title>McCluskey</title>
    <meta charset="UTF-8" />
    <meta name="format-detection" content="telephone=yes">
    <script src="cordova.js" type="text/javascript"></script>

    <link href="jquery-mobile/jquery.mobile.structure-1.3.2.min.css" rel="stylesheet" type="text/css" />
    <link href="styles/responsive_table.css" rel="stylesheet" type="text/css" />

     <link href="jquery-mobile/ff_theme.css" rel="stylesheet" type="text/css" />
    <!-- uncoment viewport meta tag, if targeting Android 4.x.x devices -->
    <!-- <meta name="viewport" content="width=device-width, initial-scale=1"> -->
</head>
`)
  let res = render(ast)
  console.log('--------res--------')
  console.log(res)
  t.is(res, `<!DOCTYPE html>
<html>
  <head>
    <title>McCluskey</title>
    <meta charset="UTF-8">
    <meta name="format-detection" content="telephone=yes">
    <script type="text/javascript" src="cordova.js"></script>
    <link type="text/css" rel="stylesheet" href="jquery-mobile/jquery.mobile.structure-1.3.2.min.css">
    <link type="text/css" rel="stylesheet" href="styles/responsive_table.css">
    <link type="text/css" rel="stylesheet" href="jquery-mobile/ff_theme.css">
    <!-- uncoment viewport meta tag, if targeting Android 4.x.x devices -->
    <!-- <meta name="viewport" content="width=device-width, initial-scale=1"> -->
  </head>
</html>
`)
})
