export type BadgeTone = 'green' | 'blue' | 'yellow' | 'red' | 'gray' | 'purple'

const TONE_CLASSES: Record<BadgeTone, string> = {
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
}

export function useInsightBadge() {
  const badgeClass = (tone: BadgeTone): string =>
    `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`

  const healthTone = (status: string): BadgeTone => {
    switch (status) {
      case 'Strong': return 'green'
      case 'Positive': return 'green'
      case 'Healthy': return 'blue'
      case 'Mixed': return 'yellow'
      case 'Needs Attention': return 'red'
      case 'Insufficient Data': return 'gray'
      default: return 'gray'
    }
  }

  const coverageTone = (coverageStatus: string): BadgeTone => {
    switch (coverageStatus) {
      case 'Representative': return 'green'
      case 'Partial': return 'yellow'
      case 'Very Limited': return 'red'
      default: return 'gray'
    }
  }

  const confidenceTone = (confidence: string): BadgeTone => {
    switch (confidence) {
      case 'High': return 'green'
      case 'Medium': return 'yellow'
      case 'Low': return 'red'
      default: return 'gray'
    }
  }

  const concentrationTone = (assessment: string): BadgeTone => {
    switch (assessment) {
      case 'Diversified': return 'green'
      case 'Moderately concentrated': return 'yellow'
      case 'Highly concentrated': return 'red'
      default: return 'gray'
    }
  }

  const dataQualityTone = (status: string): BadgeTone => {
    switch (status) {
      case 'Clean': return 'green'
      case 'Minor Issues': return 'yellow'
      case 'Material Issues': return 'red'
      default: return 'gray'
    }
  }

  const severityTone = (severity: string): BadgeTone => {
    switch (severity) {
      case 'High': return 'red'
      case 'Medium': return 'yellow'
      case 'Low': return 'gray'
      default: return 'gray'
    }
  }

  const priorityTone = (priority: string): BadgeTone => {
    switch (priority) {
      case 'P1': return 'red'
      case 'P2': return 'yellow'
      case 'P3': return 'blue'
      default: return 'gray'
    }
  }

  const classificationTone = (classification: string): BadgeTone =>
    classification === 'Proven performer' ? 'green' : 'blue'

  return {
    badgeClass,
    healthTone,
    confidenceTone,
    concentrationTone,
    dataQualityTone,
    severityTone,
    priorityTone,
    classificationTone,
    coverageTone,
  }
}
