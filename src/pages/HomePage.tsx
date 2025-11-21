import React, { useState, useEffect } from 'react'
import ChartPlaceholder from '@/components/ChartPlaceholder'
import StatCard from '@/components/StatCard'
import { api, PredictionResponse } from '@/services/api'

/**
 * Props for HomePage component
 */
interface HomePageProps {
  ticker: string  // Stock ticker passed from App.tsx
  onTickerChange?: (ticker: string) => void  // Optional callback to update ticker
}

const HomePage: React.FC<HomePageProps> = ({ ticker }) => {
  // ========================================================================
  // State Management
  // ========================================================================

  // Prediction data from the ML model
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null)

  // Loading state - true while fetching data from API
  const [loading, setLoading] = useState(false)

  // Error state - stores error message if API call fails
  const [error, setError] = useState<string | null>(null)

  // ========================================================================
  // Data Fetching
  // ========================================================================

  /**
   * Fetch prediction for the current ticker
   * Called on component mount and when ticker changes
   */
  const fetchPrediction = async (stockTicker: string) => {
    setLoading(true)   // Show loading indicator
    setError(null)     // Clear any previous errors

    try {
      // Call the backend API to get prediction
      const data = await api.getPrediction(stockTicker)
      setPrediction(data)  // Store the prediction data

    } catch (err) {
      // Handle errors (network issues, invalid ticker, etc.)
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prediction'
      setError(errorMessage)
      setPrediction(null)  // Clear old prediction on error

    } finally {
      setLoading(false)  // Hide loading indicator
    }
  }

  /**
   * Effect hook - Fetch prediction when ticker changes
   * Runs on component mount and whenever 'ticker' changes
   */
  useEffect(() => {
    fetchPrediction(ticker)
  }, [ticker])  // Dependency array - re-run when ticker changes

  // ========================================================================
  // Helper Functions
  // ========================================================================

  /**
   * Get color class based on prediction decision
   * BUY = green, SELL = red, HOLD = yellow
   */
  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'BUY':
        return 'text-green-400'
      case 'SELL':
        return 'text-red-400'
      case 'HOLD':
        return 'text-yellow-400'
      default:
        return 'text-paper-50'
    }
  }

  /**
   * Format percentage for display
   */
  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  /**
   * Format price with dollar sign
   */
  const formatPrice = (value: number) => {
    return `$${value.toFixed(2)}`
  }

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10">
      {/* Top section: Title + Prediction Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2">
          {/* Stock ticker display */}
          <h1 className="font-display text-[56px] md:text-[80px] leading-tight text-paper-50">
            {ticker}
          </h1>

          {/* Current price and timestamp */}
          {prediction && (
            <div className="mt-2 text-paper-50/70 text-lg">
              {formatPrice(prediction.current_price)} • {new Date(prediction.timestamp).toLocaleString()}
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="mt-4 text-paper-50/70 animate-pulse">
              Loading prediction...
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 text-red-400 bg-red-900/20 rounded-lg p-4 ring-1 ring-red-500/50">
              {error}
            </div>
          )}

          {/* Prediction decision - large display */}
          {prediction && !loading && (
            <div className="mt-6">
              <div className="text-paper-50/70 text-lg mb-2">ML Prediction:</div>
              <div className={`text-[48px] font-bold ${getDecisionColor(prediction.decision)}`}>
                {prediction.decision}
              </div>
              <div className="text-paper-50/70 text-sm">
                Confidence: {formatPercent(prediction.confidence)}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar - Statistics */}
        <div className="lg:col-span-1 space-y-4">
          {prediction ? (
            <>
              {/* Probability of price going UP */}
              <StatCard
                title="Probability Up"
                value={formatPercent(prediction.probabilities.up)}
              />

              {/* Probability of price going DOWN */}
              <StatCard
                title="Probability Down"
                value={formatPercent(prediction.probabilities.down)}
              />

              {/* Current price */}
              <StatCard
                title="Current Price"
                value={formatPrice(prediction.current_price)}
              />
            </>
          ) : (
            // Placeholder stats while loading
            <>
              <StatCard title="Probability Up" value="--" />
              <StatCard title="Probability Down" value="--" />
              <StatCard title="Current Price" value="--" />
            </>
          )}
        </div>
      </div>

      {/* Chart and Details area */}
      <div className="mt-8 lg:mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-ink-800/60 ring-1 ring-white/20 p-6">
            <div className="text-[32px] md:text-[48px] text-paper-50 mb-4 font-sans">
              Price Chart
            </div>
            <ChartPlaceholder />
            <div className="mt-4 text-paper-50/50 text-sm">
              Chart visualization coming soon - will display historical price data
            </div>
          </div>
        </div>

        {/* Technical Indicators Panel */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-paper-50/10 backdrop-blur-[2px] ring-1 ring-white/20 p-6 h-full">
            <div className="text-lg text-paper-50 mb-3 font-heading">
              Technical Indicators
            </div>

            {prediction ? (
              // Display all the features used by the ML model
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-paper-50/20 pb-2">
                  <span className="text-paper-50/70">Momentum (1min):</span>
                  <span className="text-paper-50 font-mono">
                    {formatPercent(prediction.features.momentum_1min)}
                  </span>
                </div>

                <div className="flex justify-between border-b border-paper-50/20 pb-2">
                  <span className="text-paper-50/70">Volatility:</span>
                  <span className="text-paper-50 font-mono">
                    {prediction.features.volatility_1min.toFixed(6)}
                  </span>
                </div>

                <div className="flex justify-between border-b border-paper-50/20 pb-2">
                  <span className="text-paper-50/70">Price Direction:</span>
                  <span className="text-paper-50 font-mono">
                    {prediction.features.price_direction === 1 ? '↑ Up' : '↓ Down'}
                  </span>
                </div>

                <div className="flex justify-between border-b border-paper-50/20 pb-2">
                  <span className="text-paper-50/70">VWAP Deviation:</span>
                  <span className="text-paper-50 font-mono">
                    {formatPercent(prediction.features.vwap_dev)}
                  </span>
                </div>

                <div className="flex justify-between border-b border-paper-50/20 pb-2">
                  <span className="text-paper-50/70">Time:</span>
                  <span className="text-paper-50 font-mono">
                    {String(prediction.features.hour).padStart(2, '0')}:
                    {String(prediction.features.minute).padStart(2, '0')}
                  </span>
                </div>

                {/* Refresh button */}
                <button
                  onClick={() => fetchPrediction(ticker)}
                  disabled={loading}
                  className="mt-4 w-full bg-[#8C8AFD] hover:bg-[#7A78EB] disabled:bg-gray-500 text-black font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Refreshing...' : 'Refresh Prediction'}
                </button>
              </div>
            ) : (
              // Placeholder when no prediction
              <div className="text-paper-50/70">
                Enter a stock ticker in the search bar above to see predictions and technical indicators.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage



