import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CardsPage } from './pages/CardsPage'
import { SentencesPage } from './pages/SentencesPage'
import { GamesPage } from './pages/GamesPage'
import { ReviewPage } from './pages/ReviewPage'
import { ProgressPage } from './pages/ProgressPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<CardsPage />} />
          <Route path="/sentences" element={<SentencesPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/progress" element={<ProgressPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
