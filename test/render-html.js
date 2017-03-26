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
