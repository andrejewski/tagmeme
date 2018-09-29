const invariant = require('invariant')

function checkTypes (types) {
  invariant(Array.isArray(types), 'types must be an array')

  const seen = {}
  for (let i = 0; i < types.length; i++) {
    const type = types[i]
    invariant(typeof type === 'string', 'Tag type must be a string')
    invariant(type !== 'match', 'Tag type cannot be "match"')
    invariant(type !== 'matches', 'Tag type cannot be "matches"')
    invariant(!seen[type], `Duplicate tag type "${type}". Types must be unique`)
    seen[type] = true
  }
}

function checkMatch (handlers, catchAll, types) {
  const seenTypes = []
  for (let key in handlers) {
    invariant(
      types.includes(key),
      `Key "${key}" is not a tag type of the union`
    )
    const handler = handlers[key]
    invariant(
      typeof handler === 'function',
      `Key "${key}" value must be a function`
    )
    seenTypes.push(key)
  }

  if (catchAll) {
    invariant(
      types.length !== seenTypes.length,
      'All types are handled; remove unnecessary catch-all'
    )
    invariant(typeof catchAll === 'function', 'catch-all must be a function')
  } else {
    const missingTypes = types.filter(type => !seenTypes.includes(type))
    invariant(
      types.length === seenTypes.length,
      `All types are not handled; add a catch-all. Missing types: ${missingTypes.join(', ')}`
    )
  }
}

function checkTag (tag, tagType, types) {
  invariant(typeof tag === 'object', 'Tag must be an object')
  invariant(typeof tag.type === 'string', 'Tag type must be a string')
  invariant(tagType, 'Tag type must be prefixed')
  invariant(types.includes(tagType), `Tag must be a tag of the union`)
}

function checkType (type, tagUnion) {
  invariant(type, 'Type must be provided')

  for (const key in tagUnion) {
    if (tagUnion[key] === type) {
      return
    }
  }

  invariant(false, `Type must be a type of the union`)
}

function union (types, options) {
  if (process.env.NODE_ENV !== 'production') {
    checkTypes(types)
  }

  const prefix = (options && options.prefix) || ''
  const prefixSize = prefix.length
  const stripPrefix = prefixSize
    ? tag =>
      tag &&
        tag.type &&
        tag.type.startsWith(prefix) &&
        tag.type.slice(prefixSize)
    : x => x && x.type

  const tagUnion = {
    match (tag, handlers, catchAll) {
      const tagType = stripPrefix(tag)
      if (process.env.NODE_ENV !== 'production') {
        checkTag(tag, tagType, types)
        checkMatch(handlers, catchAll, types)
      }

      const match = tagType && handlers[tagType]
      return match ? match(tag.data) : catchAll()
    },
    matches (tag, type) {
      const tagType = stripPrefix(tag)
      if (process.env.NODE_ENV !== 'production') {
        checkTag(tag, tagType, types)
        checkType(type, tagUnion)
      }

      return !!(tagType && tagUnion[tagType] === type)
    }
  }

  for (let i = 0; i < types.length; i++) {
    const type = types[i]
    const prefixedType = prefix + type
    tagUnion[type] = data => ({ type: prefixedType, data })
  }

  return tagUnion
}

exports.union = union
