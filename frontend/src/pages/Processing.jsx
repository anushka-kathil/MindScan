import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Processing.css'

const STEPS = [
    { icon: '📝', label: 'Reading your PHQ-9 responses…', duration: 1800 },
    { icon: '🤖', label: 'Running RoBERTa text model…', duration: 2200 },
    { icon: '📷', label: 'Processing facial expression data…', duration: 2000 },
    { icon: '🔀', label: 'Fusing text + facial signals…', duration: 1600 },
    { icon: '📊', label: 'Generating your wellbeing report…', duration: 1400 },
]

export default function Processing() {
    const navigate = useNavigate()
    const [stepIndex, setStepIndex] = useState(0)
    const [done, setDone] = useState(false)

    useEffect(() => {
        let elapsed = 0
        STEPS.forEach((step, i) => {
            setTimeout(() => {
                setStepIndex(i)
            }, elapsed)
            elapsed += step.duration
        })

        // After all steps — simulate API call to backend, then navigate
        const totalDuration = STEPS.reduce((s, st) => s + st.duration, 0)
        const timer = setTimeout(async () => {
            await simulateAnalysis()
            setDone(true)
            setTimeout(() => navigate('/results'), 800)
        }, totalDuration + 400)

        return () => clearTimeout(timer)
    }, [])

    async function simulateAnalysis() {
        const answers = JSON.parse(sessionStorage.getItem('phq9_answers') || '[]')
        const frames = JSON.parse(sessionStorage.getItem('facial_frames') || '[]')

        // Use env variable in production (set VITE_API_URL in Vercel dashboard)
        // Falls back to localhost:5000 for local development
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

        try {
            const response = await fetch(`${API_BASE}/api/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers, facial_frames: frames })
            })

            if (response.ok) {
                const data = await response.json()
                // API response already matches webapp schema exactly
                sessionStorage.setItem('results', JSON.stringify(data))
                return
            } else {
                const err = await response.json().catch(() => ({}))
                console.warn('API error:', err)
            }
        } catch (err) {
            console.warn('Could not reach Flask API — using simulation mode.', err)
        }

        // Fallback: derive mock result from PHQ-9 answers
        const phqScore = answers.reduce((s, v) => s + v, 0)
        sessionStorage.setItem('results', JSON.stringify({
            phq9_score: phqScore,
            text_confidence: 0.88,
            facial_confidence: 0.76,
            fusion_score: phqScore,
            severity: getSeverity(phqScore),
            model_severity: getSeverity(phqScore),
            phq_severity: getSeverity(phqScore),
            source: 'simulation',   // flags this as fallback — not the real model
            model_agrees: true,
        }))
    }

    function getSeverity(score) {
        if (score <= 4) return 'minimal'
        if (score <= 9) return 'mild'
        if (score <= 14) return 'moderate'
        if (score <= 19) return 'moderately_severe'
        return 'severe'
    }

    const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100)

    return (
        <div className="page processing-page">
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />

            <div className="proc-card glass fade-up">
                {/* Spinning orb */}
                <div className="proc-orb">
                    <div className="orb-inner">
                        <span className="orb-emoji">🧠</span>
                    </div>
                    <div className="orb-ring ring-1" />
                    <div className="orb-ring ring-2" />
                    <div className="orb-ring ring-3" />
                </div>

                <h1 className="proc-title">
                    {done ? '✅ Analysis Complete!' : 'Analysing…'}
                </h1>
                <p className="proc-subtitle">
                    {done
                        ? 'Redirecting to your results dashboard…'
                        : 'Our AI is combining your answers with facial data to generate insights.'}
                </p>

                {/* Steps list */}
                <div className="proc-steps">
                    {STEPS.map((step, i) => (
                        <div
                            key={i}
                            className={`proc-step ${i < stepIndex ? 'completed' : i === stepIndex ? 'active' : 'pending'}`}
                        >
                            <span className="step-icon">{step.icon}</span>
                            <span className="step-label">{step.label}</span>
                            {i < stepIndex && <span className="step-check">✓</span>}
                            {i === stepIndex && <span className="step-spinner" />}
                        </div>
                    ))}
                </div>

                {/* Progress bar */}
                <div className="proc-progress">
                    <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: `${done ? 100 : progress}%` }} />
                    </div>
                    <span className="proc-pct">{done ? 100 : progress}%</span>
                </div>
            </div>
        </div>
    )
}
