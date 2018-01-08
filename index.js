const invariant = require('invariant')

function checkKinds (kinds) {
  invariant(Array.isArray(kinds), 'kinds must be an array')

  const seen = {}
  for (let i = 0; i < kinds.length; i++) {
    const kind = kinds[i]
    invariant(typeof kind === 'string', 'Tag kind must be a string')
    invariant(kind !== 'match', 'Tag kind cannot be "match"')
    invariant(!seen[kind], `Duplicate tag kind "${kind}". Kinds must be unique`)
    seen[kind] = true
  }
}

function checkMatch (tag, handlers, catchAll, kinds, Tag) {
  invariant(tag instanceof Tag, 'Value must be a tag of the union')

  const seenKinds = []
  for (let key in handlers) {
    invariant(
      kinds.includes(key),
      `Key "${key}" is not a tag kind of the union`
    )
    const handler = handlers[key]
    invariant(
      typeof handler === 'function',
      `Key "${key}" value must be a function`
    )
    seenKinds.push(key)
  }

  if (catchAll) {
    invariant(
      kinds.length !== seenKinds.length,
      'All kinds are handled; remove unnecessary catch-all'
    )
    invariant(typeof catchAll === 'function', 'catch-all must be a function')
  } else {
    const missingKinds = kinds.filter(kind => !seenKinds.includes(kind))
    invariant(
      kinds.length === seenKinds.length,
      `All kinds are not handled; add a catch-all. Missing kinds: ${missingKinds.join(', ')}`
    )
  }
}

function union (kinds) {
  if (process.env.NODE_ENV !== 'production') {
    checkKinds(kinds)
  }

  function Tag (kind, data) {
    this._kind = kind
    this._data = data
  }

  const tagUnion = {
    match (tag, handlers, catchAll) {
      if (process.env.NODE_ENV !== 'production') {
        checkMatch(tag, handlers, catchAll, kinds, Tag)
      }

      const match = handlers[tag._kind]
      return match ? match(tag._data) : catchAll()
    }
  }

  for (let i = 0; i < kinds.length; i++) {
    const kind = kinds[i]
    tagUnion[kind] = data => new Tag(kind, data)
  }

  return tagUnion
}

exports.union = union
