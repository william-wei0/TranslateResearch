import workerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url'
import * as pdfjsLib from 'pdfjs-dist'

/**
 * Extract text from a PDF File object.
 * Returns the combined text of all pages (up to maxPages).
 * @param {File} file
 * @param {number} maxPages - cap to avoid huge tokens
 */

export async function extractTextFromPDF(file, maxPages = 15) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const pageCount = Math.min(pdf.numPages, maxPages)
  const pageTexts = []

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map(item => item.str).join(' ')
    pageTexts.push(pageText)
  }

  return pageTexts.join('\n\n').trim()
}
