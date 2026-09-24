import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import WebcamCapture from '../components/WebcamCapture'
import './Questionnaire.css'

const PHQ9_QUESTIONS = [
    'Little interest or pleasure in doing things?',
    'Feeling down, depressed, or hopeless?',
    'Trouble falling or staying asleep, or sleeping too much?',
    'Feeling tired or having little energy?',
    'Poor appetite or overeating?',
    'Feeling bad about yourself — or that you are a failure or let family down?',
    'Trouble concentrating on things such as reading or watching television?',
    'Moving or speaking so slowly others noticed? Or being fidgety and restless?',
    'Thoughts that you would be better off dead or of hurting yourself?',
]

const OPTIONS = [
    { label: 'Not at All', score: 0 },
    { label: 'Several Days', score: 1 },
    { label: 'More than Half', score: 2 },
    { label: 'Nearly Every Day', score: 3 },
]

export default function Questionnaire() {
    const navigate = useNavigate()
    const [current, setCurrent] = useState(0)
    const [answers, setAnswers] = useState(Array(9).fill(null))
    const facialFramesRef = useRef([])

    const selected = answers[current]
    const progress = Math.round((current / PHQ9_QUESTIONS.length) * 100)
    const isLast = current === PHQ9_QUESTIONS.length - 1

    const handleSelect = (score) => {
        const updated = [...answers]
        updated[current] = score
        setAnswers(updated)
    }

    const handleNext = () => {
        if (selected === null) return
        if (isLast) {
            sessionStorage.setItem('phq9_answers', JSON.stringify(answers))
            sessionStorage.setItem('facial_frames', JSON.stringify(facialFramesRef.current.slice(-20)))
            navigate('/processing')
        } else {
            setCurrent(c => c + 1)
        }
    }

    const handleBack = () => { if (current > 0) setCurrent(c => c - 1) }

    const onFrameCaptured = (frame) => {
        facialFramesRef.current.push(frame)
        if (facialFramesRef.current.length > 60) facialFramesRef.current.shift()
    }

    return (
        <div className="page questionnaire-page">
            <div className="blob blob-1" />

            {/* Header */}
            <header className="q-header">
                <span className="q-logo">MindScan</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <span className="q-progress-label">Question {current + 1} / {PHQ9_QUESTIONS.length}</span>
                    <div className="q-progress-bar">
                        <div className="q-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </header>

            {/* Body */}
            <div className="q-body">
                {/* Left: Question Panel */}
                <div className="q-panel-left">
                    <div className="q-step-tag">Clinical Assessment — Step {current + 1} of {PHQ9_QUESTIONS.length}</div>
                    <p className="q-question-text">{PHQ9_QUESTIONS[current]}</p>
                    <p className="q-freq-label">Over the last 2 weeks, how often have you been bothered by this?</p>

                    <div className="q-options">
                        {OPTIONS.map(opt => (
                            <button
                                key={opt.score}
                                className={`q-option${selected === opt.score ? ' selected' : ''}`}
                                onClick={() => handleSelect(opt.score)}
                            >
                                <span>{opt.label}</span>
                                <span className="q-option-score">{opt.score} / 3</span>
                            </button>
                        ))}
                    </div>

                    <div className="q-nav">
                        <button className="btn-ghost" onClick={handleBack} disabled={current === 0}>
                            ← Back
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleNext}
                            disabled={selected === null}
                            style={{ flex: 1 }}
                        >
                            {isLast ? 'Submit & Analyse' : 'Next →'}
                        </button>
                    </div>
                </div>

                {/* Right: Webcam Panel */}
                <div className="q-panel-right">
                    <span className="q-cam-label">Live Facial Analysis</span>

                    <div className="q-cam-box">
                        <div className="q-live-badge">
                            <span className="live-dot" />
                            Recording
                        </div>
                        <WebcamCapture onFrame={onFrameCaptured} />
                    </div>

                    <div className="q-notes">
                        <div className="q-note">
                            <span className="q-note-label">Status</span>
                            <span className="q-note-val" style={{ color: '#e53935' }}>● Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
