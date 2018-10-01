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
import assert from 'assert'
import { union } from 'tagmeme'

const Result = union(['Ok', 'Err'])

const err = Result.Err(new Error('My error'))

const message = Result.match(err, {
  Ok: () => 'No error',
  Err: error => error.message
})

assert(message === 'My error')

const isError = Result.matches(err, Result.Err)

assert(isError)
```

## Documentation

This package includes:

- [`union(types, options)`](#union)
- [`Union[type](data)`](#uniontype)
- [`Union.match(tag, handlers, catchAll)`](#unionmatch)
- [`Union.matches(tag, variant)`](#unionmatches)
- [`safeUnion(types, options)`](#safeunion)

#### `union`
> `union(types: Array<String>[, options: { prefix: String }]): Union`

Create a tagged union. Throws if:
  - `types` is not an array of unique strings
  - any `types` are named "match" or "matches"

See [`safeUnion`](#safeunion) if using arbitrary strings.

#### `Union[type]`
> `Union[type](data: any): ({ type, data })`

Create a tag of the union containing `data` which can be retrieved via `Union.match`.

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

#### `Union.matches`
> `Union.matches(tag, variant: Variant): boolean`

Determine whether a given `tag` is of `Type`.

#### `safeUnion`
> `safeUnion(types: Array<String>[, options: { prefix: String }]): { methods, variants }`

For library authors accepting arbitrary strings for type names, `safeUnion` is `union` but returns distinct collections of methods and type variants.
This will not throw if a type is "match" or "matches".

## Name

> tagmeme |ˈtaɡmiːm|: a slot in a syntactic frame which may be filled by any member of a set of appropriate linguistic items.

This name is kind of fitting for a tagged union library.
