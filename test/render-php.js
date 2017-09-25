import test from 'ava'
import render from '../dist/render-php'

test(t => {
  let source = `<?php
class FooBar
extends Baz
{
        const FOO      = 1;
      /**
  *    @return Foo
    */
    public static final function bar() {
  if (  $foo )
  {
      return TRUE;
  }
    }
}`
  let res = render(source)
  console.log('--------res--------')
  console.log(res)
  t.is(res, `<?php
class FooBar extends Baz
{
    public const FOO = 1;
    
    /** 
     * @return Foo
     */
    final static public function bar()
    {
        if ($foo) {
            return true;
        }
    }
}`)
})
