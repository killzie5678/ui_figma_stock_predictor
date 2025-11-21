/**
 * API Service - Handles all communication with the backend
 * ========================================================
 * This file provides typed functions to interact with the FastAPI backend.
 * It handles HTTP requests, error handling, and data transformation.
 */

// Get API URL from environment variable (defined in .env)
// Vite exposes env vars prefixed with VITE_ as import.meta.env.VITE_*
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ============================================================================
// Type Definitions - Match the backend Pydantic models
// ============================================================================

/**
 * Prediction response from the backend
 */
export interface PredictionResponse {
  ticker: string
  decision: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  timestamp: string
  current_price: number
  features: {
    momentum_1min: number
    volatility_1min: number
    price_direction: number
    vwap_dev: number
    hour: number
    minute: number
  }
  probabilities: {
    down: number
    up: number
  }
}

/**
 * Stock data point (OHLCV bar)
 */
export interface StockDataPoint {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/**
 * Stock data response from the backend
 */
export interface StockDataResponse {
  ticker: string
  data: StockDataPoint[]
  count: number
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: string
  model_loaded: boolean
  api_key_configured: boolean
}

// ============================================================================
// API Client Class
// ============================================================================

class StockPredictionAPI {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  /**
   * Generic fetch wrapper with error handling
   * Handles network errors, HTTP errors, and JSON parsing
   */
  private async fetchWithErrorHandling<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      // Make HTTP request
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      // Check if response is OK (status 200-299)
      if (!response.ok) {
        // Try to parse error message from response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorMessage
        } catch {
          // If parsing fails, use default error message
        }
        throw new Error(errorMessage)
      }

      // Parse and return JSON response
      const data = await response.json()
      return data as T
    } catch (error) {
      // Handle network errors or other exceptions
      if (error instanceof Error) {
        throw new Error(`API Error: ${error.message}`)
      }
      throw new Error('Unknown API error occurred')
    }
  }

  /**
   * Health check - Verify backend is running
   *
   * @returns Health status of the API
   *
   * @example
   * const health = await api.checkHealth()
   * console.log('Model loaded:', health.model_loaded)
   */
  async checkHealth(): Promise<HealthResponse> {
    return this.fetchWithErrorHandling<HealthResponse>('/')
  }

  /**
   * Get stock prediction - BUY/SELL/HOLD decision
   *
   * @param ticker - Stock symbol (e.g., 'AAPL', 'MSFT')
   * @param probThreshold - Confidence threshold for signals (0.5-1.0, default: 0.55)
   * @returns Prediction with decision, confidence, and features
   *
   * @example
   * const prediction = await api.getPrediction('AAPL')
   * console.log('Decision:', prediction.decision)
   * console.log('Confidence:', prediction.confidence)
   */
  async getPrediction(
    ticker: string,
    probThreshold: number = 0.55
  ): Promise<PredictionResponse> {
    // Validate ticker
    const cleanTicker = ticker.trim().toUpperCase()
    if (!cleanTicker) {
      throw new Error('Ticker symbol is required')
    }

    // Build URL with optional query parameter
    const url = probThreshold !== 0.55
      ? `/api/predict/${cleanTicker}?prob_threshold=${probThreshold}`
      : `/api/predict/${cleanTicker}`

    return this.fetchWithErrorHandling<PredictionResponse>(url)
  }

  /**
   * Get historical stock data - OHLCV bars
   *
   * @param ticker - Stock symbol
   * @param days - Number of days of history (1-30, default: 1)
   * @returns Stock data with OHLCV bars
   *
   * @example
   * const data = await api.getStockData('AAPL', 5)
   * console.log('Got', data.count, 'data points')
   */
  async getStockData(
    ticker: string,
    days: number = 1
  ): Promise<StockDataResponse> {
    // Validate inputs
    const cleanTicker = ticker.trim().toUpperCase()
    if (!cleanTicker) {
      throw new Error('Ticker symbol is required')
    }
    if (days < 1 || days > 30) {
      throw new Error('Days must be between 1 and 30')
    }

    // Build URL with query parameter
    const url = days !== 1
      ? `/api/data/${cleanTicker}?days=${days}`
      : `/api/data/${cleanTicker}`

    return this.fetchWithErrorHandling<StockDataResponse>(url)
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

// Create a single instance of the API client to be used throughout the app
// This ensures we reuse the same configuration and connection
export const api = new StockPredictionAPI(API_URL)

// Also export the class in case custom instances are needed
export default StockPredictionAPI
