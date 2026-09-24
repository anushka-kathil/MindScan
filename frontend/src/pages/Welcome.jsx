import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './Welcome.css'

import { createPortal } from 'react-dom'

// Terms & Privacy modal component
function TermsModal({ onClose }) {
    return createPortal(
        <div className="terms-overlay" onClick={onClose}>
            <div className="terms-modal" onClick={e => e.stopPropagation()}>
                <div className="terms-header">
                    <h2 className="terms-title">Privacy & Clinical Terms</h2>
                    <button className="terms-close" onClick={onClose}>✕</button>
                </div>
                <div className="terms-body">
                    <section className="terms-section">
                        <h3>1. Not a Medical Diagnosis</h3>
                        <p>MindScan is a <strong>screening tool only</strong>. It does not constitute a clinical diagnosis, medical advice, or a substitute for professional mental health evaluation. Always consult a qualified healthcare provider.</p>
                    </section>
                    <section className="terms-section">
                        <h3>2. Webcam & Facial Data</h3>
                        <p>Your webcam feed is processed <strong>entirely within your browser</strong> using local AI inference. No video frames are ever uploaded, recorded, or stored on any server. Facial data is discarded immediately after analysis.</p>
                    </section>
                    <section className="terms-section">
                        <h3>3. Questionnaire Responses</h3>
                        <p>Your PHQ-9 answers are sent to a locally-running model for analysis. <strong>No personally identifiable information is stored.</strong> Session data is cleared when you close the browser tab.</p>
                    </section>
                    <section className="terms-section">
                        <h3>4. Crisis Resources</h3>
                        <p>If you are experiencing a mental health crisis, please contact a professional immediately. <strong>India:</strong> iCall – 9152987821 | Vandrevala Foundation – 1860-2662-345 | <strong>International:</strong> findahelpline.com</p>
                    </section>
                    <section className="terms-section">
                        <h3>5. Voluntary Participation</h3>
                        <p>Participation is entirely voluntary. You may stop the assessment at any time by closing the browser tab. No data is retained between sessions.</p>
                    </section>
                    <section className="terms-section">
                        <h3>6. Research & Academic Use</h3>
                        <p>MindScan is developed for academic and research purposes. Results should not be used as a sole basis for any clinical decision-making.</p>
                    </section>
                </div>
                <div className="terms-footer">
                    <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>
                        I Have Read the Terms ✓
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default function Welcome() {
    const navigate = useNavigate()
    const [consented, setConsented] = useState(false)
    const [showTerms, setShowTerms] = useState(false)

    return (
        <div className="page welcome-page">
            <div className="blob blob-1" />

            {/* Terms Modal */}
            {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

            {/* ── Top Nav ── */}
            <nav className="w-nav fade-up">
                <span className="w-nav-brand">MindScan</span>
                <span className="w-nav-tag">PHQ-9 × AI Facial Analysis</span>
                <span className="w-nav-year">2026</span>
            </nav>

            {/* ── Hero Stage ── */}
            <section className="w-stage fade-up fade-up-delay-1">

                {/* Left word */}
                <div className="w-word w-word-left">
                    <span>MIND</span>
                </div>

                {/* Centre: Girl Illustration */}
                <div className="w-centre">
                    {/* Decorative flowing line — top-right */}
                    <svg className="deco-line deco-top" viewBox="0 0 140 60" fill="none">
                        <path d="M5 50 C40 50, 40 10, 75 10 S130 40 140 5" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" fill="none" />
                    </svg>

                    {/* Gold halo + girl illustration */}
                    <div className="w-halo">
                        <img
                            src="/girl.png"
                            alt="MindScan Illustration"
                            className="w-girl-img"
                        />
                    </div>

                    {/* Script subtitle */}
                    <div className="w-script">
                        <svg viewBox="0 0 200 52" fill="none" className="script-svg">
                            <text x="10" y="22" fontFamily="Georgia,serif" fontSize="13" fontStyle="italic" fill="#0D0D0D" opacity="0.65">Symptoms, Patterns,</text>
                            <text x="22" y="42" fontFamily="Georgia,serif" fontSize="13" fontStyle="italic" fill="#0D0D0D" opacity="0.65">and Treatment</text>
                        </svg>
                    </div>

                    {/* Decorative flowing line — bottom-left */}
                    <svg className="deco-line deco-bottom" viewBox="0 0 140 60" fill="none">
                        <path d="M0 5 C20 30, 50 40, 70 45 S120 50, 140 35" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" fill="none" />
                    </svg>
                </div>

                {/* Right word */}
                <div className="w-word w-word-right">
                    <span>SCAN</span>
                </div>
            </section>

            {/* ── Bottom Footer Row ── */}
            <footer className="w-bottom fade-up fade-up-delay-3">
                <div className="w-bottom-left">
                    <span className="w-bottom-label">Mode :</span>
                    <span className="w-bottom-val">Clinical Assessment</span>
                </div>

                <div className="w-consent-inline">
                    <label className="w-checkbox-inline">
                        <input
                            type="checkbox"
                            checked={consented}
                            onChange={e => setConsented(e.target.checked)}
                        />
                        <span className="w-checkmark-inline">
                            {consented && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 5l2.5 2.5 5-5" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" /></svg>}
                        </span>
                        <span>
                            I agree to the{' '}
                            <button className="terms-link" onClick={(e) => { e.preventDefault(); setShowTerms(true) }}>
                                privacy & clinical terms
                            </button>
                        </span>
                    </label>

                    <button
                        id="start-screening-btn"
                        className="btn-primary w-cta"
                        disabled={!consented}
                        onClick={() => navigate('/questionnaire')}
                    >
                        Begin Screening
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className="w-bottom-right">
                    <span className="w-bottom-label">Duration :</span>
                    <span className="w-bottom-val">~5 Minutes</span>
                </div>
            </footer>
        </div>
    )
}
