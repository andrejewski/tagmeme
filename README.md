# Tagmeme
> Tagged unions

```sh
npm install tagmeme
```

[![npm](https://img.shields.io/npm/v/tagmeme.svg)](https://www.npmjs.com/package/tagmeme)
[![Build Status](https://travis-ci.org/andrejewski/tagmeme.svg?branch=master)](https://travis-ci.org/andrejewski/tagmeme)
[![Greenkeeper badge](https://badges.greenkeeper.io/andrejewski/tagmeme.svg)](https://greenkeeper.io/)

Tagmeme is a library for building tagged unions.
This project offers:

- A concise API for pattern matching and variant constructors
- Data-oriented tags that can be serialized and namespaced
- Errors in development to ensure exhaustive pattern matching
- Small size and zero-dependencies in production using dead code elimination

Let's check it out.

## Examples

```js
import assert from 'assert'
import { union } from 'tagmeme'

const Result = union(['Ok', 'Err'])

const err = Result.Err(new Error('My error'))

const message = Result.match(err, {
  Ok: () => 'No error',
  Err: error => error.message
})

assert(message === 'My error')

const handle = Result.matcher({
  Ok: () => 'No error',
  Err: error => error.message
})

assert(handle(err) === 'My error')

const isError = Result.matches(err, Result.Err)

assert(isError)
```

## Documentation

This package includes:

- [`union(types, options)`](#union)
- [`Union[type](data)`](#uniontype)
- [`Union.match(tag, handlers, catchAll)`](#unionmatch)
- [`Union.matcher(handlers, catchAll)`](#unionmatcher)
- [`Union.matches(tag, variant)`](#unionmatches)
- [`safeUnion(types, options)`](#safeunion)

#### `union`
> `union(types: Array<String>[, options: { prefix: String }]): Union`

Create a tagged union. Throws if:
  - `types` is not an array of unique strings
  - any `types` are named "match", "matcher", or "matches"

See [`safeUnion`](#safeunion) if using arbitrary strings.

#### `Union[type]`
> `Union[type](data: any): ({ type, data })`

Create a tag of the union containing `data` which can be retrieved via `Union.match`.

```js
import assert from 'assert'
import { union } from 'tagmeme'

const Result = union(['Ok', 'Err'])
const result = Result.Ok('good stuff')

assert(result.type === 'Ok')
assert(result.data === 'good stuff')
```

#### `Union.match`
> `Union.match(tag, handlers[, catchAll: function])`

Pattern match on `tag` with a hashmap of `handlers` where keys are kinds and values are functions, with an optional `catchAll` if no handler matches the value.
Throws if:
  - `tag` is not of any of the union types
  - `tag` does not match any type and there is no `catchAll`
  - any `handlers` key is not a kind in the union
  - any `handlers` value is not a function
  - it handles all cases and there is a useless `catchAll`
  - it does not handle all cases and there is no `catchAll`

```js
import assert from 'assert'
import { union } from 'tagmeme'

const Result = union(['Ok', 'Err'])
const result = Result.Err('Request failed')
const status = Result.match(
  result,
  { Err: () => 400 },
  () => 200
})

assert(status === 400)
```

#### `Union.matcher`
> `Union.matcher(handlers[, catchAll: function])`

Create a matching function which will take `tag` and `context` arguments.
This reduces the boilerplate of a function that delegates to `Union.match` with static handlers.
This is also a bit faster than `match` because the handler functions only need to be created once.

Unlike with `match`, the second argument to handlers will be `context` to avoid the need for a closure.

```js
import assert from 'assert'
import { union } from 'tagmeme'

const Result = union(['Ok', 'Err'])
const collectErrors = Result.matcher({
  Ok: (_, errors) => errors,
  Err: (error, errors) => errors.concat(error)
})

const errors = collectErrors(Result.Err('Bad'), [])
assert.deepEqual(errors, ['Bad'])
```

#### `Union.matches`
> `Union.matches(tag, variant: Variant): Boolean`

Determine whether a given `tag` is of `variant`.

```js
import assert from 'assert'
import { union } from 'tagmeme'

const Result = union(['Ok', 'Err'])
const okTag = Result.Ok(1)

assert(Result.matches(okTag, Result.Ok))
```

#### `safeUnion`
> `safeUnion(types: Array<String>[, options: { prefix: String }]): { methods, variants }`

For library authors accepting arbitrary strings for type names, `safeUnion` is `union` but returns distinct collections of methods and type variants.
This will not throw if a type is "match", "matcher", or "matches".

## Name

> tagmeme |ˈtaɡmiːm|: a slot in a syntactic frame which may be filled by any member of a set of appropriate linguistic items.

This name is kind of fitting for a tagged union library.
