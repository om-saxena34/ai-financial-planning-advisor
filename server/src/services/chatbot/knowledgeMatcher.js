const knowledgeBase = require('./knowledge_base.json');
const { normalizeText } = require('./entityExtractor');

/**
 * Searches the 85+ knowledge base questions and keywords.
 * Returns the best match if score exceeds threshold.
 */
function findBestMatch(userQuery, threshold = 0.35) {
  const normQuery = normalizeText(userQuery);
  const queryTokens = normQuery.split(/\s+/).filter((t) => t.length > 2);

  if (queryTokens.length === 0) return null;

  let bestMatch = null;
  let highestScore = 0;

  for (const entry of knowledgeBase) {
    let score = 0;
    const normQuestion = normalizeText(entry.question);

    // Exact question match
    if (normQuery === normQuestion || normQuestion.includes(normQuery) || normQuery.includes(normQuestion)) {
      score += 15.0;
    }

    // Direct phrase match in keywords
    for (const kw of entry.keywords) {
      const normKw = normalizeText(kw);
      if (normQuery === normKw) {
        score += 12.0;
      } else if (normQuery.includes(normKw)) {
        score += 5.0 + normKw.length * 0.2;
      } else {
        // Token overlap
        const kwTokens = normKw.split(/\s+/);
        let tokenMatches = 0;
        for (const qt of queryTokens) {
          if (kwTokens.includes(qt)) {
            tokenMatches++;
          }
        }
        if (tokenMatches > 0 && tokenMatches === kwTokens.length) {
          score += 4.0;
        } else {
          score += tokenMatches * 1.0;
        }
      }
    }

    // Token overlap in question text
    const questionTokens = normQuestion
      .split(/\s+/)
      .filter((t) => t.length > 2);
    for (const qt of queryTokens) {
      if (questionTokens.includes(qt)) {
        score += 1.0;
      }
    }

    // Normalize by query length
    const normalizedScore = score / (queryTokens.length * 1.2 + 1);

    if (normalizedScore > highestScore) {
      highestScore = normalizedScore;
      bestMatch = { ...entry, confidence: Math.min(1.0, normalizedScore) };
    }
  }

  if (highestScore >= threshold && bestMatch) {
    return bestMatch;
  }

  return null;
}

module.exports = { findBestMatch, knowledgeBase };
