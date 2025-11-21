import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import HomePage from './pages/HomePage'
import Layout from './components/Layout'

function App() {
  /**
   * Ticker state - lifted to App level so Layout's search bar can update it
   * This creates a data flow: Layout (search) -> App (state) -> HomePage (display)
   */
  const [ticker, setTicker] = useState('AAPL')  // Default to Apple stock

  /**
   * Handle search submission from Layout component
   * This gets called when user enters a ticker in the search bar
   */
  const handleSearch = (newTicker: string) => {
    setTicker(newTicker)  // Update the ticker, which triggers HomePage to refetch data
  }

  return (
    <Layout onSearch={handleSearch}>
      <Routes>
        {/* Pass ticker and setTicker to HomePage so it can display and update the data */}
        <Route path="/" element={<HomePage ticker={ticker} onTickerChange={setTicker} />} />
        {/* Add more routes here as pages are added */}
      </Routes>
    </Layout>
  )
}

export default App




