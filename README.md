# @wmhilton/beautify
Parses and rewrites your HTML/CSS/JS to be beautiful and readable

#### *Why would I want this?*

Maybe you just inherited a PHP codebase from the 90s that is a total mess - a mix of random indentation, parentheses, bracket styles that makes reading or making changes to the code a Herculean feat. After running it through **beautify**, it'll look stunning, have a consistent style, and be a delight to read!

Maybe you work with several people on a project and want the code to adhere to a consistent style, but your coworkers object to adding a "linting" step because it's extra work, or they see it as bikeshedding over style issues. You can add **beautify** as a precommit hook - or better yet as a bot in your CI pipeline to automatically format pull requests.

How you *write* code shouldn't limit how you *read* code. **beautify** frees you to write it however you want and end up with a consistent pretty standard-adhering code when you need to read it.

#### *How is this different from* jsbeautify, eslint, *etc?*

**beautify** goes further. It completely parses your files, transforming them into an Abstract Syntax Tree, and then renders that tree back into text. This results in cleaner looking code with fewer quirks and artifacts from the original text.

**beautify** doesn't reinvent the wheel. Instead, it combines several existing excellent code formatting libraries:

- [`php-unparser`] for PHP (adheres to PSR-1 and PSR-2)
  - `.php` files
- [`posthtml`] and a [`custom renderer`]\* for HTML
  - `.htm`, `.html` files
  - inline HTML in PHP content
- [`postcss`] with [`perfectionist`] for CSS
  - `.css` files
  - inline styles in HTML content
- [`prettier`] for JS
  - `.js` files
  - inline scripts in HTML content

\*Notes on custom posthtml renderer (which I'll probably move to its own repo):

- makes all `<tags>` lowercase
- re-indents everything consistently
- attributes
  - formats `style`
  - sorts (`id`, then `class`, etc)


## Installation

```
npm install @wmhilton/beautify --global
```

## Usage

**beautify** (the CLI program) let you mass edit hordes of files at once.
It accepts glob arguments, and uses file extensions to determine what
beautifying engine to use.

Overwrite original file:

    beautify input.html

Save beautified version under a new name:

    beautify input.html -o output.html

### CLI Options

    -h, --help               Display this help message
    -o, --output NAME        Output filename or directory
    --html EXT [EXT ...]     File extensions to treat as HTML [default: .html .htm]
    --style EXT [EXT ...]    File extensions to treat as CSS  [default: .css]
    --script EXT [EXT ...]   File extensions to treat as JS   [default: .js]
    --dryrun                 Do a dry run (don't save changes)

### Usage Examples

Beautify all the `.html` files, save them in `output`:

    beautify *.html -o output

Beautify all the files in `components`, treating `.vue` files as HTML:

    beautify components/* --html .vue

Beautify all the `.css` and `.less` files:

    beautify **/*.css **/*.less --style .less .css

Beautify all the files in src, treating `.es6` as JavaScript, and save results in `lib`:

    beautify src/**/* --script .es6 --output lib


## JavaScript API

It is pretty simple. You give it text, it returns prettier text. It is async however! The options object passed to each function is the exact same format (see below), because the HTML formatter might use style and script options for inline styles and scripts.

#### beautify.php(text, options) :`(string, object={}) ⇒ Promise<string>`
#### beautify.html(text, options) :`(string, object={}) ⇒ Promise<string>`
#### beautify.style(text, options) :`(string, object={}) ⇒ Promise<string>`
#### beautify.script(text, options) :`(string, object={}) ⇒ Promise<string>`

### Options

**beautify** (the library) lets you pass in the options for each component so you can customize like crazy:

```js
var defaultOptions = {
  phpUnparser: {
  },
  posthtml: {
    render: prettyrender   // a posthtml-render compatible function
  },
  perfectionist: {
    indentSize: 4
  },
  prettier: {
    printWidth: 1000,
    tabWidth: 4,
    singleQuote: true
  },
  render: {
    indentString: '    ',
    closeVoidTags: true
  }
}
```

### Code Examples

```js
// The ES6 module, async / await version
import fs from 'mz/fs'
import {html, style, script} from 'beautify'

async function main () {
  var text = await fs.readFile('index.php', 'utf8')
  let php = await beautify.php(text, options)
  fs.writeFile(php, 'index.php', 'utf8')
  
  var text = await fs.readFile('index.html', 'utf8')
  let html = await beautify.html(text, options)
  fs.writeFile(html, 'index.html', 'utf8')

  var text = await fs.readFile('index.css', 'utf8')
  let css = await style(text, options)
  fs.writeFile(css, 'index.css', 'utf8')
  
  var text = await fs.readFile('index.js', 'utf8')
  let js = await script(text, options)
  fs.writeFile(js, 'index.js', 'utf8')
}
main()
```

```js
// The Promise version
var fs = require('fs')
var beautify = require('beautify')

var text = fs.readFileSync('index.php', 'utf8')
beautify.php(text, options).then(php => {
  fs.writeFileSync(php, 'index.php', 'utf8')
})

var text = fs.readFileSync('index.html', 'utf8')
beautify.html(text, options).then(html => {
  fs.writeFileSync(html, 'index.html', 'utf8')
})

var text = fs.readFileSync('index.css', 'utf8')
beautify.style(text, options).then(css => {
  fs.writeFileSync(css, 'index.css', 'utf8')
})

var text = fs.readFileSync('index.js', 'utf8')
beautify.script(text, options).then(js => {
  fs.writeFileSync(js, 'index.js', 'utf8')
})
```

## License

Copyright 2017 William Hilton.
Licensed under [The Unlicense](http://unlicense.org/).

[`postcss`]: http://postcss.org
[`perfectionist`]: https://npmjs.org/package/perfectionist
[`posthtml`]: https://github.com/posthtml/posthtml
[`prettier`]: https://npmjs.org/package/prettier
[`custom renderer`]: https://github.com/wmhilton/beautify/tree/master/src/render-html/index.js
[`php-unparser`]: https://chris-l.github.io/php-unparser/