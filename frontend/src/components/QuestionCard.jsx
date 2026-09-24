import { useRef, useEffect } from 'react'
import './QuestionCard.css'

export default function QuestionCard({ index, question, value, onChange, onNext, onBack, isFirst, isLast }) {
    const textareaRef = useRef(null)

    useEffect(() => {
        textareaRef.current?.focus()
    }, [index])

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
            e.preventDefault()
            onNext()
        }
    }

    return (
        <div className="question-card glass fade-up">
            <div className="qcard-number">
                <span className="qnum-badge">{String(index + 1).padStart(2, '0')}</span>
                <div className="qnum-track">
                    <div className="qnum-fill" style={{ height: `${((index + 1) / 9) * 100}%` }} />
                </div>
            </div>

            <div className="qcard-body">
                <p className="qcard-hint">PHQ-9 Question</p>
                <h2 className="qcard-question">{question}</h2>

                <div className="qcard-input-wrapper">
                    <textarea
                        ref={textareaRef}
                        id={`q-answer-${index}`}
                        className="qcard-textarea"
                        placeholder="Describe how you've been feeling over the last 2 weeks…"
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={4}
                    />
                    <div className="textarea-hint">Press <kbd>Enter</kbd> to continue</div>
                </div>

                <div className="qcard-actions">
                    {!isFirst && (
                        <button id={`btn-back-q${index}`} className="btn-ghost" onClick={onBack}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                    )}
                    <button
                        id={`btn-next-q${index}`}
                        className="btn-primary"
                        onClick={onNext}
                        disabled={!value.trim()}
                        style={{ marginLeft: isFirst ? 'auto' : '0' }}
                    >
                        {isLast ? 'Submit & Analyse' : 'Next'}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d={isLast ? 'M9 12l2 2 4-4' : 'M5 12h14M12 5l7 7-7 7'} />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}
