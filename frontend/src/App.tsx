import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Event Management System</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={
              <div>
                <h2>Welcome to Event Management System</h2>
              </div>
            } />
          </Routes>
        </main>a
      </div>
    </Router>
  )
}

export default App
