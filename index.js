function assert (condition, tag) {
  if (!condition) {
    throw new Error(tag)
  }
}

function createTag (displayName) {
  function Tag () {
    if (!(this instanceof Tag)) {
      const tag = new Tag()
      tag.args = arguments
      return tag
    }

    this.args = arguments
  }

  Tag.is = function is (x) {
    return x instanceof Tag
  }

  Tag.unwrap = function unwrap (tag, fn) {
    assert(Tag.is(tag), 'Cannot unwrap tags using an incorrect type')
    return fn.apply(null, tag.args)
  }

  if (typeof displayName === 'string') {
    Tag.name = displayName
    Tag.displayName = displayName
  }

  return Tag
}

function isTag (type) {
  return !!(type.is && type.unwrap)
}

function createTagUnion (types) {
  assert(Array.isArray(types), 'types must be an array')

  types.reduce((seenTypes, type, index) => {
    assert(isTag(type), `Invalid Tag ${type} at index ${index}`)
    assert(!seenTypes.includes(type), `Duplicate Tag ${type} at index ${index}`)
    seenTypes.push(type)
    return seenTypes
  }, [])

  function UnionTag () {
    throw new Error('Tag unions cannot be created directly')
  }

  UnionTag.has = function is (type) {
    return unionIs(types, type)
  }

  UnionTag.match = function match (type, cases) {
    return unionMatch(types, cases, type)
  }

  return UnionTag
}

function unionMatch (types, cases, tag) {
  assert(unionIs(types, tag), `The tag being matched on should be of a type in the union, not ${tag}`)

  const hasCatchAll = cases.length % 2 === 1
  const catchAll = hasCatchAll && cases[cases.length - 1]
  const casesLen = cases.length - (hasCatchAll ? 1 : 0)

  let matchedType
  let matchedFn
  const matchedTags = []
  for (let i = 0; i < casesLen; i += 2) {
    const type = cases[i]
    const handler = cases[i + 1]
    assert(isTag(type), `Each type must be a Tag, not ${type} at index ${i}`)
    assert(!matchedTags.includes(type), `Each type can only be covered by one case, duplicate at index ${i}`)
    matchedTags.push(type)

    assert(typeof handler === 'function', `Each handler must be a function, not ${type} at index ${i + 1}`)

    if (type.is(tag)) {
      matchedType = type
      matchedFn = handler
    }
  }

  if (hasCatchAll) {
    assert(typeof catchAll === 'function', `The catch-all must be a function, not ${catchAll}`)
  }

  const coversAll = matchedTags.length === types.length
  if (coversAll) {
    assert(!hasCatchAll, 'Not all cases are covered so a catch all is needed')
  } else {
    assert(hasCatchAll, 'All cases are covered so the catch all is useless')
  }

  if (matchedType) {
    return matchedType.unwrap(tag, matchedFn)
  }

  return catchAll()
}

function unionIs (types, type) {
  return types.some(Type => Type.is(type))
}

createTag.union = createTagUnion
module.exports = createTag
