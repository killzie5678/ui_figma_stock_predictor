import React from 'react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#3C24B3] to-[#502D69] text-paper-50">
      <header className="w-full">
        <div className="mx-auto max-w-7xl px-4 py-6 flex items-center justify-end">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Feature search"
              className="w-full rounded-xl bg-paper-50/10 placeholder-white/70 text-paper-50 px-4 py-3 pr-10 outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-white/40"
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-paper-50/80">
              🔎
            </span>
          </div>
        </div>
      </header>
      <main className="w-full">
        {children}
      </main>
    </div>
  )
}

export default Layout





