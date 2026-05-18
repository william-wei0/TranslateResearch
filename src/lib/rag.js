import { DOMAINS } from './anthropic.js'

let index      = null
let indexHash  = null
let cachedKB   = null

function cosineSimilarity(a, b) {
  const dot  = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dot / (magA * magB)
}

function hashKB(kb) {
  return kb
    .map(c => `${c.id}::${c.text.length}::${c.text.slice(0, 40)}`)
    .sort()
    .join('|')
}

async function embed(text) {
  if (!window.desktop) throw new Error('Must run as desktop app.')
  const result = await window.desktop.openaiEmbed(text)
  if (!result) throw new Error('No OpenAI key saved — add one in Settings to enable semantic search.')
  return result
}

async function buildIndex(kb) {
  const hash = hashKB(kb)
  if (index && indexHash === hash) return index

  const diskCache = await window.desktop.embedCacheLoad()

  let embeddingMap = {}  

  if (diskCache && diskCache.hash === hash) {
    embeddingMap = diskCache.embeddings
  } else {
    const existingEmbeddings = diskCache?.embeddings || {}
    const chunksToEmbed = []
    const chunksToReuse = []

    for (const chunk of kb) {
      const chunkHash = `${chunk.id}::${chunk.text.length}::${chunk.text.slice(0, 40)}`
      const cachedKey = Object.keys(existingEmbeddings).find(k => k === chunk.id)

      if (
        cachedKey &&
        diskCache?.chunkHashes?.[chunk.id] === chunkHash
      ) {
        chunksToReuse.push(chunk)
        embeddingMap[chunk.id] = existingEmbeddings[chunk.id]
      } else {
        chunksToEmbed.push(chunk)
      }
    }

    if (chunksToEmbed.length > 0) {
      const newEmbeddings = await Promise.all(
        chunksToEmbed.map(chunk => embed(chunk.text))
      )
      chunksToEmbed.forEach((chunk, i) => {
        embeddingMap[chunk.id] = newEmbeddings[i]
      })
    }

    const chunkHashes = {}
    for (const chunk of kb) {
      chunkHashes[chunk.id] = `${chunk.id}::${chunk.text.length}::${chunk.text.slice(0, 40)}`
    }

    await window.desktop.embedCacheSave({
      hash,
      embeddings: embeddingMap,
      chunkHashes,
    })
  }

  index = kb.map(chunk => ({
    ...chunk,
    embedding: embeddingMap[chunk.id],
  })).filter(c => c.embedding)

  indexHash = hash
  return index
}

async function getKnowledgeBase() {
  if (cachedKB) return cachedKB
  cachedKB = await window.desktop.kbLoad()
  return cachedKB
}

export function invalidateKBCache() {
  index     = null
  indexHash = null
  cachedKB  = null
}

export async function retrieve(query, topK = 3) {
  const kb             = await getKnowledgeBase()
  const idx            = await buildIndex(kb)
  const queryEmbedding = await embed(query)

  return idx
    .map(chunk => ({ ...chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}

export async function retrieveByKeyword(query, domain, topK = 3) {
  const kb         = await getKnowledgeBase()
  const queryWords = query.toLowerCase().split(/\W+/)

  return kb
    .filter(chunk => !domain || chunk.domain === domain)
    .map(chunk => {
      const chunkWords = chunk.text.toLowerCase().split(/\W+/)
      const overlap    = queryWords.filter(w => w.length > 4 && chunkWords.includes(w)).length
      const tagMatch   = chunk.tags.filter(t => queryWords.some(w => t.includes(w))).length
      return { ...chunk, score: overlap + tagMatch * 2 }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}