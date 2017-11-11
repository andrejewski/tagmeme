const assert = require('invariant')

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

  if (displayName) {
    assert(typeof displayName === 'string', 'displayName must be a string if provided')
    Tag.name = displayName
    Tag.displayName = displayName
  }

  return Tag
}

function isTag (type) {
  return !!(type && type.is && type.unwrap)
}

function createTagUnion (types) {
  assert(Array.isArray(types), 'types must be an array')

  const seenTypes = []
  const seenNames = []
  for (let i = 0; i < types.length; i++) {
    const type = types[i]
    assert(isTag(type), `Invalid Tag ${type} at index ${i}`)
    assert(isTag(type), `Invalid Tag ${type} at index ${i}`)
    assert(!seenTypes.includes(type), `Duplicate Tag ${type} at index ${i}`)
    seenTypes.push(type)

    if (type.displayName) {
      assert(!seenNames.includes(type.displayName), `Duplicate Tag display name ${type.displayName}`)
      seenNames.push(type.displayName)
    }
  }

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
    const label = (type && type.displayName) ? `"${type.displayName}"` : 'Unnamed tag'
    assert(isTag(type), `Each type must be a Tag, not ${type} at index ${i}`)
    assert(types.includes(type), `${label} is not in this union; add it to the union or remove this branch.`)
    assert(!matchedTags.includes(type), `Each type can only be covered by one case, duplicate ${label} at index ${i}`)
    matchedTags.push(type)

    assert(typeof handler === 'function', `The handler for ${label} must be a function, not ${handler} at index ${i + 1}`)

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
    assert(!hasCatchAll, 'All cases are covered so the catch all is useless')
  } else {
    assert(hasCatchAll, 'Not all cases are covered so a catch all is needed')
  }

  if (matchedType) {
    return matchedType.unwrap(tag, matchedFn)
  }

  return catchAll()
}

function unionIs (types, type) {
  return types.some(Type => Type.is(type))
}

function createNamedTagUnion (names) {
  assert(Array.isArray(names), 'Names must be an array')
  const len = names.length
  const tags = []
  for (let i = 0; i < len; i++) {
    const name = names[i]
    assert(typeof name === 'string', `Name at index ${i} must be a string, not ${name}`)
    tags.push(createTag(name))
  }
  const union = createTagUnion(tags)
  for (let i = 0; i < len; i++) {
    const name = names[i]
    assert(union[name] === undefined, `Property name "${name}" is reserved on the union.`)
    union[names[i]] = tags[i]
  }
  return union
}

createTag.union = createTagUnion
createTag.namedUnion = createNamedTagUnion
module.exports = createTag
