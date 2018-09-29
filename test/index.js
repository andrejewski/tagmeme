import test from 'ava'
import { union } from '../src/'

test('union() should return an object with match method', t => {
  const Msg = union([])
  t.is(typeof Msg.match, 'function')
})

test('union() should return an object with [kind] constructors', t => {
  const Msg = union(['Foo'])
  t.is(typeof Msg.Foo, 'function')
})

test('union() should throw if kinds if not an array', t => {
  t.throws(() => union(4), /must be an array/)
})

test('union() should throw if kinds is not all strings', t => {
  t.throws(() => union(['A', 4]), /must be a string/)
})

test('union() should throw if there are duplicate kinds', t => {
  t.throws(() => union(['A', 'A']), /must be unique/)
})

test('union() should throw if there is a kind "match"', t => {
  t.throws(() => union(['match']), /cannot be "match"/)
})

test('union() should throw if there is a kind "matches"', t => {
  t.throws(() => union(['matches']), /cannot be "matches"/)
})

test('union() prefix should be added to types', t => {
  const A = union(['Foo'], { prefix: 'a/' })
  t.is(A.Foo().type, 'a/Foo')
})

test('union() prefix should prevent name conflicts', t => {
  const A = union(['Foo'], { prefix: 'a/' })
  const B = union(['Foo'], { prefix: 'b/' })

  t.notDeepEqual(A.Foo(), B.Foo())
})

test('match() should return the handler return value', t => {
  const Msg = union(['Foo'])
  const val = Msg.Foo()

  t.is(Msg.match(val, { Foo: () => 1 }), 1)
})

test('match() should call catchAll if a handler is not found', t => {
  const Msg = union(['Foo', 'Bar'])
  const val = Msg.Bar()

  t.is(
    Msg.match(
      val,
      {
        Foo: () => 1
      },
      () => 2
    ),
    2
  )
})

test('match() should throw if tag if not of the union', t => {
  const A = union(['Foo'])
  const B = union(['Bar'])

  const tag = B.Bar()

  t.throws(() => {
    A.match(tag, {}, () => {})
  }, /must be a tag of the union/)
})

test('match() should throw if handler[kind] is not of the union', t => {
  const Msg = union(['Foo'])
  const val = Msg.Foo()

  t.throws(() => {
    Msg.match(val, { Bar: () => 1 })
  }, /not a tag type of the union/)
})

test('match() should throw if handler[kind] is not a function', t => {
  const Msg = union(['Foo'])
  const val = Msg.Foo()

  t.throws(() => {
    Msg.match(val, { Foo: 4 })
  }, /must be a function/)
})

test('match() should throw if a provided catchAll is not a function', t => {
  const Msg = union(['Foo', 'Bar'])
  const val = Msg.Foo()

  t.throws(() => {
    Msg.match(val, { Foo: () => {} }, 4)
  }, /must be a function/)
})

test('match() should throw if a catch-all is needed', t => {
  const Msg = union(['Foo', 'Bar'])
  const val = Msg.Foo()

  t.throws(() => {
    Msg.match(val, { Foo: () => {} })
  }, /add a catch-all/)
})

test('match() should throw if a catch-all is not needed', t => {
  const Msg = union(['Foo'])
  const val = Msg.Foo()

  t.throws(() => {
    Msg.match(val, { Foo: () => {} }, () => {})
  }, /remove unnecessary catch-all/)
})

test('matches() should return whether the tag matches type', t => {
  const Msg = union(['Foo', 'Bar'])
  t.true(Msg.matches(Msg.Foo(), Msg.Foo))
  t.true(Msg.matches(Msg.Bar(), Msg.Bar))

  t.false(Msg.matches(Msg.Foo(), Msg.Bar))
  t.false(Msg.matches(Msg.Bar(), Msg.Foo))
})

test('matches() should throw if tag is not an object', t => {
  const A = union(['Foo'])

  t.throws(() => {
    A.matches(8, A.Foo)
  }, /must be an object/)
})

test('matches() should throw if tag type is not a string', t => {
  const A = union(['Foo'])

  t.throws(() => {
    A.matches({ type: 8 }, A.Foo)
  }, /type must be a string/)
})

test('matches() should throw if tag is not of the union', t => {
  const A = union(['Foo'])
  const B = union(['Bar'])

  t.throws(() => {
    A.matches(B.Bar(), A.Foo)
  }, /must be a tag of the union/)
})

test('matches() should throw if type is not provided', t => {
  const A = union(['Foo'])

  t.throws(() => {
    A.matches(A.Foo())
  }, /must be provided/)
})

test('matches() should throw if type is not of the union', t => {
  const A = union(['Foo'])
  const B = union(['Bar'])

  t.throws(() => {
    A.matches(A.Foo(), B.Bar)
  }, /must be a type of the union/)
})

test('tags should be de/serialize-able', t => {
  const Msg = union(['Foo'])
  const tag = Msg.Foo('cake')
  const tagCopy = JSON.parse(JSON.stringify(tag))

  t.true(
    Msg.match(tagCopy, {
      Foo: () => true
    })
  )

  t.true(Msg.matches(tagCopy, Msg.Foo))
})

test('tags should be de/serialize-able with prefixes', t => {
  const Msg = union(['Foo'], { prefix: 'a/' })
  const tag = Msg.Foo('cake')
  const tagCopy = JSON.parse(JSON.stringify(tag))

  t.true(
    Msg.match(tagCopy, {
      Foo: () => true
    })
  )

  t.true(Msg.matches(tagCopy, Msg.Foo))
})
