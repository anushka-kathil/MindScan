import { useEffect, useRef } from 'react'
import './WebcamCapture.css'

export default function WebcamCapture({ onFrame }) {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const streamRef = useRef(null)

    useEffect(() => {
        let intervalId

        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 320, height: 240, facingMode: 'user' },
                    audio: false,
                })
                streamRef.current = stream
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                }

                // Capture frame every 2s
                intervalId = setInterval(() => {
                    if (!canvasRef.current || !videoRef.current) return
                    const ctx = canvasRef.current.getContext('2d')
                    ctx.drawImage(videoRef.current, 0, 0, 320, 240)
                    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.6)
                    if (onFrame) onFrame(dataUrl)
                }, 2000)
            } catch (err) {
                console.warn('Webcam access denied or unavailable:', err)
            }
        }

        startCamera()

        return () => {
            clearInterval(intervalId)
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop())
            }
        }
    }, [])

    return (
        <div className="webcam-wrapper">
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="webcam-video"
            />
            <canvas ref={canvasRef} width={320} height={240} style={{ display: 'none' }} />

            {/* Overlay corners */}
            <div className="corner corner-tl" />
            <div className="corner corner-tr" />
            <div className="corner corner-bl" />
            <div className="corner corner-br" />

            {/* Scan line */}
            <div className="scan-line" />
        </div>
    )
}
