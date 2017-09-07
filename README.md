# Tagmeme
> Tagged unions

```sh
npm install tagmeme
```

[![npm](https://img.shields.io/npm/v/tagmeme.svg)](https://www.npmjs.com/package/tagmeme)
[![Build Status](https://travis-ci.org/andrejewski/tagmeme.svg?branch=master)](https://travis-ci.org/andrejewski/tagmeme)
[![Greenkeeper badge](https://badges.greenkeeper.io/andrejewski/tagmeme.svg)](https://greenkeeper.io/)

## Usage

```js
import tag from 'tagmeme'
import assert from 'assert'

const Increment = tag()
const Decrement = tag()

const Action = tag.union([
  Increment,
  Decrement
])

const incrementAction = Increment(10)
assert(Increment.is(incrementAction))
assert(!Decrement.is(incrementAction))

Increment.unwrap(incrementAction, n => {
  assert(n === 10)
})

assert(Action.has(incrementAction))

assert(Action.match(incrementAction, [
  Increment, n => n,
  Decrement, n => -n
]) === 10)
```

## Documentation

- `tag([displayName])`: create a **Tag** with an optional name
- `tag.union(tags)`: create a **Union** of an array of Tags

#### Tag
  - `Tag(...args)`: create a tag of type `Tag` with arguments
  - `Tag.is(tag)`: check whether `tag` is of type `Tag`
  - `Tag.unwrap(tag, fn)`: calls `fn` with the arguments passed to `tag`. Throws an error if `tag` is not of type `Tag`.

#### Union
  - `Union.has(tag)`: check whether `tag` is of a Tag type within `Union`
  - `Union.match(tag, [type1, handler1, type2, handler2, ..., catchAll])`: pattern match on `tag`.
    Throws if:
      - `tag` is not of any of the union types
      - `tag` does not match any type and there is no `catchAll`
      - any `typeN` is not a Tag
      - any `handlerN` is not a function
      - if it handles all cases and there is a useless `catchAll`
      - if it does not handle all cases and there is no `catchAll`
      - if there is a Tag handled more than once

## Name

> tagmeme |ˈtaɡmiːm|: a slot in a syntactic frame which may be filled by any member of a set of appropriate linguistic items.

This name is kind of fitting for a tagged union library.
