// ── Filler word list ──────────────────────────────────────────────────────────
const FILLERS = [
    'um', 'uh', 'uhh', 'umm', 'hmm', 'hm',
    'like', 'basically', 'literally', 'actually',
    'honestly', 'right', 'okay', 'so', 'well',
    'you know', 'i mean', 'kind of', 'sort of',
    'i guess', 'i think', 'you see',
]

// Common words to ignore in repetition check
const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
    'for', 'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were',
    'be', 'been', 'have', 'had', 'has', 'it', 'this', 'that', 'they',
    'them', 'their', 'i', 'my', 'we', 'our', 'you', 'your', 'he', 'she',
    'his', 'her', 'its', 'not', 'do', 'did', 'can', 'could', 'would',
    'will', 'may', 'might', 'should', 'also', 'just', 'very', 'about',
    'more', 'which', 'what', 'when', 'where', 'how', 'who', 'there',
])

export function analyzeNervousness(transcript, durationSeconds) {
    if (!transcript || transcript.trim().length === 0) {
        return {
            score: null,
            fillerCount: 0,
            foundFillers: [],
            wpm: 0,
            totalWords: 0,
            pace: 'normal',
            repeatedWords: [],
            tips: [],
            label: null,
        }
    }

    const lower = transcript.toLowerCase().trim()
    const words = lower.split(/\s+/).filter(Boolean)
    const totalWords = words.length

    // ── Filler detection ──────────────────────────────────────────────────────
    const fillerCounts = {}

    // Single word fillers
    words.forEach(w => {
        const cleaned = w.replace(/[^a-z]/g, '')
        if (FILLERS.includes(cleaned)) {
            fillerCounts[cleaned] = (fillerCounts[cleaned] || 0) + 1
        }
    })

    // Bigram fillers (e.g. "you know", "i mean")
    for (let i = 0; i < words.length - 1; i++) {
        const bigram = words[i].replace(/[^a-z]/g, '') + ' ' + words[i + 1].replace(/[^a-z]/g, '')
        if (FILLERS.includes(bigram)) {
            fillerCounts[bigram] = (fillerCounts[bigram] || 0) + 1
        }
    }

    const foundFillers = Object.entries(fillerCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([word, count]) => ({ word, count }))
    const fillerCount = foundFillers.reduce((sum, f) => sum + f.count, 0)

    // ── WPM ───────────────────────────────────────────────────────────────────
    const wpm = durationSeconds > 5
        ? Math.round((totalWords / durationSeconds) * 60)
        : 0

    let pace = 'good'
    if (wpm > 195)      pace = 'fast'
    else if (wpm < 85 && wpm > 0) pace = 'slow'

    // ── Word repetition ───────────────────────────────────────────────────────
    const wordFreq = {}
    words.forEach(w => {
        const cleaned = w.replace(/[^a-z]/g, '')
        if (cleaned.length > 4 && !STOP_WORDS.has(cleaned) && !FILLERS.includes(cleaned)) {
            wordFreq[cleaned] = (wordFreq[cleaned] || 0) + 1
        }
    })
    const repeatedWords = Object.entries(wordFreq)
        .filter(([, count]) => count >= 3)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([word]) => word)

    // ── Confidence score (0–100) ──────────────────────────────────────────────
    let score = 100

    // Filler penalty: -6 per filler (max -48)
    score -= Math.min(fillerCount * 6, 48)

    // Pace penalty
    if (pace === 'fast') score -= 15
    if (pace === 'slow') score -= 10

    // Short answer penalty
    if (totalWords < 20) score -= 20
    else if (totalWords < 40) score -= 8

    // Repetition penalty
    score -= Math.min(repeatedWords.length * 5, 15)

    score = Math.max(0, Math.min(100, Math.round(score)))

    // ── Label ─────────────────────────────────────────────────────────────────
    const label = score >= 80 ? 'Confident' : score >= 60 ? 'Moderate' : score >= 40 ? 'Nervous' : 'Very Nervous'

    // ── Tips ──────────────────────────────────────────────────────────────────
    const tips = []

    if (fillerCount >= 3) {
        const topFiller = foundFillers[0]
        tips.push(`Replace "${topFiller.word}" with a short pause — you used it ${topFiller.count}× in this answer`)
    }
    if (pace === 'fast') {
        tips.push(`You spoke at ${wpm} WPM — slow down to 130–160 WPM for clarity and confidence`)
    }
    if (pace === 'slow') {
        tips.push(`Pace was slow (${wpm} WPM) — speak at a steady rhythm to show confidence`)
    }
    if (totalWords < 20) {
        tips.push('Give longer, structured answers — aim for 60+ words using the STAR method')
    }
    if (repeatedWords.length > 0) {
        tips.push(`Vary your vocabulary — "${repeatedWords[0]}" was repeated ${wordFreq[repeatedWords[0]]}× in this answer`)
    }
    if (tips.length === 0) {
        tips.push('Excellent delivery! Confident pace, clear vocabulary, no excessive fillers.')
    }

    return {
        score,
        label,
        fillerCount,
        foundFillers,
        wpm,
        totalWords,
        pace,
        repeatedWords,
        tips,
    }
}
