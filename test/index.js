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
  }, /not a tag kind of the union/)
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
