function cleanText(value, label, maxLength = 500) {
  if (typeof value !== 'string' || !value.trim() || value.length > maxLength) throw new Error(`${label} is missing or too long.`);
  return value.trim();
}

export function validateCreatorFit(result, allowedCreatorIds, allowedEvidenceIds = null) {
  if (!result || !allowedCreatorIds.includes(result.creatorId)) throw new Error('Fit result references an unknown creator.');
  if (!Number.isInteger(result.fitScore) || result.fitScore < 0 || result.fitScore > 100) throw new Error('Fit score must be a whole number from 0 to 100.');
  if (!Array.isArray(result.reasons) || result.reasons.length < 1 || result.reasons.length > 4 || !Array.isArray(result.limitations) || result.limitations.length > 3) throw new Error('Fit result contains an invalid explanation.');
  if (!Array.isArray(result.evidenceIds) || result.evidenceIds.length > 8 || (allowedEvidenceIds && result.evidenceIds.some((id) => !allowedEvidenceIds.includes(id)))) throw new Error('Fit result references unknown evidence.');
  return {
    creatorId: result.creatorId,
    fitScore: result.fitScore,
    summary: cleanText(result.summary, 'Summary', 220),
    reasons: result.reasons.map((reason) => cleanText(reason, 'Reason', 180)),
    evidenceIds: [...new Set(result.evidenceIds)],
    recommendation: cleanText(result.recommendation, 'Recommendation', 220),
    limitations: result.limitations.map((item) => cleanText(item, 'Limitation', 180)),
  };
}

export function validateReportInsight(result, evidence) {
  const text = [result?.summary, ...(result?.strengths || []), ...(result?.recommendations || []), ...(result?.limitations || [])].join(' ').toLowerCase();
  const unsupportedRevenueClaim = /\$\s?\d|\b(earned|revenue|income|sales)\b/.test(text);
  if (unsupportedRevenueClaim && !('revenue' in evidence)) throw new Error('Insight contains a revenue claim that is not in the report evidence.');
  if (!Array.isArray(result?.strengths) || result.strengths.length > 3 || !Array.isArray(result?.recommendations) || result.recommendations.length < 1 || result.recommendations.length > 3 || !Array.isArray(result?.limitations) || result.limitations.length > 3) throw new Error('Report insight contains an invalid list.');
  const summary = cleanText(result.summary, 'Summary', 260);
  return {
    summary,
    strengths: result.strengths.map((item) => cleanText(item, 'Strength', 180)),
    recommendations: result.recommendations.map((item) => cleanText(item, 'Recommendation', 180)),
    limitations: result.limitations.map((item) => cleanText(item, 'Limitation', 180)),
  };
}
