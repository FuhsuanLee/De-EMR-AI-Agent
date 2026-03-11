import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Error from './pages/Error'
import Session from './pages/Session'
import './index.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/session/:session_id" element={<Session />} />
      <Route path="*" element={<Error />} />
    </Routes>
  )
}

export default App;
