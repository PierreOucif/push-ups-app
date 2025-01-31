import { ThemeProvider } from "../components/theme-provider"
import { Inter } from "next/font/google"
import "./globals.css"
import { ModeToggle } from "../components/mode-toggle"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="mx-auto max-w-2xl px-4 py-8">
            <header className="mb-8">
              <nav className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">PushUp Tracker</h1>
                <ModeToggle />
              </nav>
            </header>
            <main>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
} 