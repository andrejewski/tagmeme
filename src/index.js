const invariant = require('invariant')
const hasOwnProperty = Object.prototype.hasOwnProperty

function checkTypes (types) {
  invariant(Array.isArray(types), 'types must be an array')

  const seen = Object.create(null)
  for (let i = 0; i < types.length; i++) {
    const type = types[i]
    invariant(typeof type === 'string', 'Tag type must be a string')
    invariant(!seen[type], `Duplicate tag type "${type}". Types must be unique`)
    seen[type] = true
  }
}

function checkMatch (handlers, catchAll, types) {
  const seenTypes = []
  for (const key in handlers) {
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
  invariant(typeof tagType === 'string', 'Tag type must be prefixed')
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

function safeUnion (types, options) {
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

  const matcher = (handlers, catchAll) => {
    if (process.env.NODE_ENV !== 'production') {
      checkMatch(handlers, catchAll, types)
    }

    return function _matcher (tag, context) {
      const tagType = stripPrefix(tag)
      if (process.env.NODE_ENV !== 'production') {
        checkTag(tag, tagType, types)
      }

      const match = hasOwnProperty.call(handlers, tagType) && handlers[tagType]
      return match ? match(tag.data, context) : catchAll(context)
    }
  }

  const methods = {
    match (tag, handlers, catchAll) {
      return matcher(handlers, catchAll)(tag)
    },
    matcher,
    matches (tag, type) {
      const tagType = stripPrefix(tag)
      if (process.env.NODE_ENV !== 'production') {
        checkTag(tag, tagType, types)
        checkType(type, variants)
      }

      return !!(typeof tagType === 'string' && variants[tagType] === type)
    }
  }

  const variants = Object.create(null)
  for (let i = 0; i < types.length; i++) {
    const type = types[i]
    const prefixedType = prefix + type
    variants[type] = data => ({ type: prefixedType, data })
  }

  return { variants, methods }
}

function union (types, options) {
  const { variants, methods } = safeUnion(types, options)
  for (const key in methods) {
    if (process.env.NODE_ENV !== 'production') {
      invariant(
        !hasOwnProperty.call(variants, key),
        `Tag type cannot be "${key}"`
      )
    }
    variants[key] = methods[key]
  }
  return variants
}

exports.union = union
exports.safeUnion = safeUnion
