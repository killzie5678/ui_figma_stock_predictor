import React, { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
  onSearch?: (ticker: string) => void  // Callback function when user searches
}

const Layout: React.FC<LayoutProps> = ({ children, onSearch }) => {
  // State to track the search input value
  const [searchValue, setSearchValue] = useState('')

  /**
   * Handle search form submission
   * Prevents page reload and calls the onSearch callback with the ticker
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()  // Prevent default form submission behavior

    if (searchValue.trim() && onSearch) {
      // Call the parent component's search handler with the uppercase ticker
      onSearch(searchValue.trim().toUpperCase())
    }
  }

  return (
    <div className="min-h-screen w-full relative bg-gradient-to-b from-[#3C24B3] to-[#502D69] text-paper-50">
      {/* Decorative ellipses based on Figma */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-12 h-[220px] w-[560px] rounded-full bg-[#8C8AFD] opacity-20 blur-2xl" />
        <div className="absolute top-[300px] left-[360px] h-[64px] w-[604px] rounded-full bg-[#8C8AFD] opacity-25 blur-xl" />
        <div className="absolute top-[400px] right-[120px] h-[200px] w-[256px] rounded-full bg-[#070606] opacity-10 blur-xl" />
      </div>
      <header className="w-full">
        <div className="mx-auto max-w-7xl px-4 py-6 flex items-center justify-end">
          {/* Search form - allows user to enter stock ticker */}
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search stock ticker (e.g., AAPL, MSFT)"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full rounded-xl bg-[#8C8AFD] placeholder-black/80 text-black px-4 py-3 pr-10 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-black/20 font-condensed"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-3 flex items-center text-black/80 font-icon hover:text-black cursor-pointer"
            >
              🔎
            </button>
          </form>
        </div>
      </header>
      <main className="w-full">
        {children}
      </main>
    </div>
  )
}

export default Layout





