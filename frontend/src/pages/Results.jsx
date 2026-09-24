import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ResultsChart from '../components/ResultsChart'
import './Results.css'

const SEVERITY_INFO = {
    minimal: {
        label: 'Minimal Depression',
        color: '#34d399',
        bg: 'rgba(52,211,153,0.08)',
        border: 'rgba(52,211,153,0.25)',
        emoji: '😊',
        advice: [
            'Maintain your healthy routines — sleep, exercise, and social connection are protective.',
            'Continue practising mindfulness or relaxation techniques you may already have.',
            'Consider keeping a gratitude journal to reinforce positive thought patterns.',
            'No clinical intervention currently indicated, but do check in with yourself regularly.',
        ],
    },
    mild: {
        label: 'Mild Depression',
        color: '#fbbf24',
        bg: 'rgba(251,191,36,0.08)',
        border: 'rgba(251,191,36,0.25)',
        emoji: '😐',
        advice: [
            'Talk to someone you trust about how you\'re feeling — even a brief conversation helps.',
            'Light to moderate daily exercise (30 min walks) can meaningfully lift mood.',
            'Reduce alcohol intake and improve sleep hygiene — both amplify low mood.',
            'If symptoms persist for more than two weeks, consult a GP or counsellor.',
        ],
    },
    moderate: {
        label: 'Moderate Depression',
        color: '#f97316',
        bg: 'rgba(249,115,22,0.08)',
        border: 'rgba(249,115,22,0.25)',
        emoji: '😔',
        advice: [
            'Please reach out to a mental health professional — a GP can be a great first step.',
            'Cognitive Behavioural Therapy (CBT) has strong evidence for this level of depression.',
            'Avoid isolating yourself; stay connected with supportive people in your life.',
            'Limit screen time and set a consistent sleep schedule.',
        ],
    },
    moderately_severe: {
        label: 'Moderately Severe Depression',
        color: '#ef4444',
        bg: 'rgba(239,68,68,0.08)',
        border: 'rgba(239,68,68,0.25)',
        emoji: '😞',
        advice: [
            'We strongly encourage you to speak with a GP or psychiatrist as soon as possible.',
            'Treatment with therapy (CBT/IPT) and/or medication is very effective at this level.',
            'Let someone close know how you\'re feeling — you don\'t have to go through this alone.',
            'Crisis line (India): iCall – 9152987821 | International: findahelpline.com',
        ],
    },
    severe: {
        label: 'Severe Depression',
        color: '#dc2626',
        bg: 'rgba(220,38,38,0.1)',
        border: 'rgba(220,38,38,0.4)',
        emoji: '🆘',
        advice: [
            '🚨 Please seek immediate support from a healthcare professional or crisis service.',
            'Vandrevala Foundation Helpline (24/7, India): 1860-2662-345',
            'iCall (India): 9152987821 | Samaritans (UK): 116 123 | US: 988',
            'If you are in immediate danger, please call emergency services (112 / 911).',
        ],
    },
}

export default function Results() {
    const navigate = useNavigate()
    const [results, setResults] = useState(null)

    useEffect(() => {
        const stored = sessionStorage.getItem('results')
        if (stored) {
            setResults(JSON.parse(stored))
        } else {
            // No results — redirect back
            navigate('/')
        }
    }, [])

    if (!results) return null

    const info = SEVERITY_INFO[results.severity] || SEVERITY_INFO.minimal
    const scorePercent = Math.round((results.phq9_score / 27) * 100)

    return (
        <div className="page results-page">
            <div className="blob blob-1" />
            <div className="blob blob-2" />

            <div className="results-wrapper">
                {/* Header */}
                <div className="results-header fade-up">
                    <button className="btn-ghost" id="btn-retake" onClick={() => { sessionStorage.clear(); navigate('/') }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M1 4v6h6M23 20v-6h-6" />
                            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                        </svg>
                        Retake Assessment
                    </button>
                    <div className="res-logo">
                        <span>🧬</span>
                        <span className="gradient-text" style={{ fontFamily: 'var(--ff-heading)', fontWeight: 700 }}>MindScan</span>
                    </div>
                    <div style={{ width: 140 }} /> {/* spacer */}
                </div>

                {/* AI Model Source Badge */}
                <div style={{
                    display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20,
                    flexWrap: 'wrap'
                }}>
                    {results.source === 'model' ? (
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.35)',
                            borderRadius: 999, padding: '6px 16px', fontSize: 13, fontWeight: 600,
                            color: '#34d399'
                        }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 8px #34d399' }} />
                            AI Model Active — Real predictions from SVM + RoBERTa + BiLSTM
                        </div>
                    ) : (
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.35)',
                            borderRadius: 999, padding: '6px 16px', fontSize: 13, fontWeight: 600,
                            color: '#fbbf24'
                        }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24', display: 'inline-block' }} />
                            Simulation Mode — API not reachable, using score-based fallback
                        </div>
                    )}
                    {results.source === 'model' && !results.model_agrees && (
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.35)',
                            borderRadius: 999, padding: '6px 16px', fontSize: 13, fontWeight: 600,
                            color: '#a78bfa'
                        }}>
                            Model diverged: PHQ suggests "{results.phq_severity}" but AI predicts "{results.severity}"
                        </div>
                    )}
                </div>

                <div className="score-hero glass fade-up fade-up-delay-1"
                    style={{ background: info.bg, borderColor: info.border }}>
                    <div className="score-emoji">{info.emoji}</div>
                    <div className="score-details">
                        <p className="score-label" style={{ color: info.color }}>Your Result</p>
                        <h1 className="score-number">
                            <span style={{ color: info.color }}>{results.phq9_score}</span>
                            <span className="score-of">/27</span>
                        </h1>
                        <p className="score-severity" style={{ color: info.color }}>{info.label}</p>
                    </div>
                    <div className="score-donut-wrapper">
                        <DonutGauge score={results.phq9_score} color={info.color} />
                    </div>
                </div>

                {/* Confidence meters */}
                <div className="confidence-row fade-up fade-up-delay-2">
                    <ConfidenceCard
                        icon="📝"
                        label="Text Analysis"
                        value={results.text_confidence}
                        color="var(--clr-primary)"
                        sub={`PHQ-9 score: ${results.phq9_score}/27`}
                    />
                    <ConfidenceCard
                        icon="📷"
                        label="Facial Analysis"
                        value={results.facial_available ? results.facial_confidence : null}
                        color="var(--clr-accent)"
                        sub={results.facial_available
                            ? `Dominant: ${results.dominant_emotion || '—'}`
                            : 'No face detected'}
                    />
                    <ConfidenceCard
                        icon="🔀"
                        label="Fusion Score"
                        value={results.facial_available
                            ? (results.text_confidence * 0.6 + results.facial_confidence * 0.4)
                            : results.text_confidence}
                        color={info.color}
                        sub={results.facial_available ? '60% PHQ + 40% Face' : 'PHQ-9 only'}
                    />
                </div>

                {/* Facial emotion detail card */}
                {results.source === 'model' && (
                    <div className="glass fade-up fade-up-delay-2" style={{
                        borderRadius: 16, padding: '16px 20px', marginBottom: 20,
                        display: 'flex', alignItems: 'flex-start', gap: 14,
                        borderLeft: `3px solid ${results.facial_available ? '#818cf8' : '#475569'}`,
                        fontSize: 13, color: 'var(--clr-text-muted, #94a3b8)'
                    }}>
                        <span style={{ fontSize: 22 }}>{results.facial_available ? '📷' : '⚠️'}</span>
                        <div>
                            <p style={{ fontWeight: 600, color: results.facial_available ? '#818cf8' : '#64748b', marginBottom: 4 }}>
                                {results.facial_available
                                    ? `Face detected — dominant expression: ${results.dominant_emotion}`
                                    : 'Facial analysis not available'}
                            </p>
                            <p style={{ fontSize: 12, lineHeight: 1.5 }}>
                                {results.facial_note}
                            </p>
                            {results.fusion_note && (
                                <p style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>
                                    Fusion: {results.fusion_note}
                                </p>
                            )}
                        </div>
                    </div>
                )}
                <div className="glass results-chart-card fade-up fade-up-delay-3">
                    <h2 className="section-title">Severity Scale</h2>
                    <ResultsChart score={results.phq9_score} />
                </div>

                {/* Advice */}
                <div className="advice-card glass fade-up fade-up-delay-4"
                    style={{ borderColor: info.border }}>
                    <h2 className="section-title">Personalised Recommendations</h2>
                    <div className="advice-list">
                        {info.advice.map((tip, i) => (
                            <div key={i} className="advice-item">
                                <div className="advice-dot" style={{ background: info.color }} />
                                <p>{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="disclaimer fade-up fade-up-delay-5">
                    <span>⚕️</span>
                    <p>
                        This screening tool is for informational purposes only and does <strong>not</strong> constitute
                        a clinical diagnosis. Always consult a qualified healthcare professional.
                    </p>
                </div>
            </div>
        </div>
    )
}

/* ---- Sub-components ---- */

function ConfidenceCard({ icon, label, value, color, sub }) {
    const unavailable = value === null || value === undefined
    const pct = unavailable ? 0 : Math.round(Math.min(1, Math.max(0, value)) * 100)
    return (
        <div className="conf-card glass">
            <span className="conf-icon">{icon}</span>
            <p className="conf-label">{label}</p>
            <p className="conf-value" style={{ color: unavailable ? '#475569' : color }}>
                {unavailable ? '—' : `${pct}%`}
            </p>
            <div className="progress-bar-track" style={{ marginTop: 8 }}>
                <div className="progress-bar-fill"
                    style={{ width: `${pct}%`, background: unavailable ? '#475569' : color }} />
            </div>
            {sub && <p style={{ fontSize: 11, marginTop: 6, opacity: 0.6, textAlign: 'center' }}>{sub}</p>}
        </div>
    )
}

function DonutGauge({ score, color }) {
    const r = 42
    const circ = 2 * Math.PI * r
    const pct = score / 27
    const dash = circ * pct
    const gap = circ - dash

    return (
        <svg width="100" height="100" viewBox="0 0 100 100" className="donut-svg">
            <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
            <circle
                cx="50" cy="50" r={r}
                fill="none"
                stroke={color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={circ * 0.25}
                style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 8px ${color})` }}
            />
            <text x="50" y="55" textAnchor="middle" fill={color} fontSize="16" fontWeight="700" fontFamily="Outfit, sans-serif">
                {score}
            </text>
        </svg>
    )
}
