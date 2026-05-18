export const DOMAINS = [
  'molecular biology', 'oncology', 'neuroscience', 'cardiology',
  'machine learning', 'epidemiology', 'chemistry', 'ecology',
  'physics', 'clinical trials', 'genomics', 'pharmacology',
]

export async function claudeComplete(system, user, maxTokens = 1500) {
  if (!window.desktop) throw new Error('Must run as desktop app.')
  return window.desktop.claudeComplete(system, user, maxTokens)
}

export function parseJSON(raw) {
  const cleaned = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
}

export async function detectDomain(text) {
  const prompt = `Classify this research paper into one of these domains: ${DOMAINS.join(', ')}.
Also identify the specific subfield, key methodology, and study type (RCT, observational, meta-analysis, computational, etc.).

Return JSON only:
{
  "domain": "one of the domains above",
  "subfield": "specific subfield",
  "methodology": "main method used",
  "study_type": "RCT|observational|meta-analysis|computational|review|other"
}

Paper text: ${text.slice(0, 2000)}`

  const raw = await claudeComplete('You are a scientific classifier.', prompt, 300)
  return parseJSON(raw)
}

export const SUMMARIZE_SYSTEM = `You are an expert scientific communicator. 
Given a research paper or abstract, extract a structured summary.
Always respond with valid JSON only — no markdown, no explanation outside the JSON.`

export function buildSummarizePrompt(text, audience, retrievedChunks = []) {
  const audienceDesc = {
    scientist:     'a scientist familiar with the field',
    nonscientist:  'a curious non-scientist — avoid jargon, use analogies',
    decisionmaker: 'a business or policy decision-maker',
  }[audience]

  const domainContext = retrievedChunks.length > 0
    ? `## Relevant domain knowledge
      Use the following domain knowledge to inform your summary, 
      especially when assessing methodology quality and limitations:

      ${retrievedChunks.map((c, i) => `[${i + 1}] ${c.text}`).join('\n\n')}

      ---`
    : ''

  return `${domainContext}

  Summarize the following research paper for ${audienceDesc}.
  Return JSON only with keys: headline, key_findings, methods, limitations, significance, figure_suggestion.

  Paper text:
  ${text.slice(0, 7000)}`
}


export const TRANSLATE_PROMPT = `You are a professional scientific translator.
  Translate the provided research summary fields into the requested language.
  Preserve scientific meaning precisely. Return valid JSON only.`

export function buildTranslatePrompt(summary, targetLanguage) {
  return `Translate the following research summary fields into ${targetLanguage}.
          Preserve all scientific terminology and meaning. Keep proper nouns and acronyms unchanged.

          Return a JSON object with the same structure as the input — same keys, translated values.
          Translate arrays element by element.

          Summary to translate:
${JSON.stringify(summary, null, 2)}`
}

export async function verifySummary(originalText, summary) {
  const prompt = `You are a fact-checker. Given the original paper text and a summary, 
                  identify any claims in the summary that are NOT supported by the paper text.

                  For each key finding, respond with:
                  - "supported" if the paper text clearly supports it
                  - "unsupported" if the paper text does not support it
                  - "extrapolated" if it's a reasonable inference but not explicitly stated

                  Original paper text:
                  ${originalText.slice(0, 6000)}

                  Summary to verify:
                  ${JSON.stringify(summary, null, 2)}

                  Return JSON: { "findings_check": [{ "claim": "...", "status": "supported|unsupported|extrapolated", "reason": "..." }] }`

  const raw = await claudeComplete('You are a scientific fact-checker.', prompt, 1000)
  return parseJSON(raw)
}