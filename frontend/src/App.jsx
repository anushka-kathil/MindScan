import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Questionnaire from './pages/Questionnaire'
import Processing from './pages/Processing'
import Results from './pages/Results'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/questionnaire" element={<Questionnaire />} />
                <Route path="/processing" element={<Processing />} />
                <Route path="/results" element={<Results />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}
