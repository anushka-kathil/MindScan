import './ResultsChart.css'

const BANDS = [
    { label: 'Minimal', range: [0, 4], color: '#34d399' },
    { label: 'Mild', range: [5, 9], color: '#fbbf24' },
    { label: 'Moderate', range: [10, 14], color: '#f97316' },
    { label: 'Mod. Severe', range: [15, 19], color: '#ef4444' },
    { label: 'Severe', range: [20, 27], color: '#dc2626' },
]

export default function ResultsChart({ score }) {
    const totalWidth = 27

    return (
        <div className="results-chart">
            {/* Band bar */}
            <div className="band-bar">
                {BANDS.map(band => {
                    const w = ((band.range[1] - band.range[0] + 1) / totalWidth) * 100
                    const isActive = score >= band.range[0] && score <= band.range[1]
                    return (
                        <div
                            key={band.label}
                            className={`band ${isActive ? 'band-active' : ''}`}
                            style={{ width: `${w}%`, background: band.color + (isActive ? '' : '44') }}
                            title={`${band.label}: ${band.range[0]}–${band.range[1]}`}
                        >
                            <span className="band-label">{band.label}</span>
                        </div>
                    )
                })}
            </div>

            {/* Marker */}
            <div className="marker-row">
                <div
                    className="score-marker"
                    style={{ left: `${(score / 27) * 100}%` }}
                >
                    <div className="marker-pin" />
                    <div className="marker-label">{score}</div>
                </div>
            </div>

            {/* Scale labels */}
            <div className="scale-labels">
                <span>0</span>
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
                <span>27</span>
            </div>

            {/* Legend */}
            <div className="band-legend">
                {BANDS.map(band => (
                    <div key={band.label} className="legend-item">
                        <div className="legend-dot" style={{ background: band.color }} />
                        <span>{band.label}</span>
                        <span className="legend-range">{band.range[0]}–{band.range[1]}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
