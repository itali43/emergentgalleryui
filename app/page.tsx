"use client"

import { Button } from "@/components/ui/button"
import { Wallet, Palette, ImageIcon, Upload, Eraser, Download, RotateCcw } from "lucide-react"
import { ReactSketchCanvas, type ReactSketchCanvasRef } from "react-sketch-canvas"
import { useRef, useState } from "react"

export default function HomePage() {
  const canvasRef = useRef<ReactSketchCanvasRef>(null)
  const [strokeColor, setStrokeColor] = useState("#ff00ff")
  const [strokeWidth, setStrokeWidth] = useState(4)

  const handleClear = () => {
    canvasRef.current?.clearCanvas()
  }

  const handleEraser = () => {
    canvasRef.current?.eraseMode(true)
  }

  const handlePen = () => {
    canvasRef.current?.eraseMode(false)
  }

  const handleDownload = () => {
    canvasRef.current?.exportImage("png").then((data) => {
      const link = document.createElement("a")
      link.download = "neon-art.png"
      link.href = data
      link.click()
    })
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="retro-grid absolute inset-0 opacity-40" />

      <header className="relative z-10 p-6 flex justify-between items-center">
        <div></div>
        <Button className="retro-button">
          <Wallet className="w-4 h-4 mr-2" />
          CONNECT WALLET
        </Button>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-2 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif font-bold text-4xl md:text-5xl mb-4 neon-glow text-primary leading-tight">
            DIGITAL <span className="text-secondary">CANVAS</span>
          </h2>

          {/* Drawing Controls */}
          <div className="retro-border bg-white/95 backdrop-blur-sm rounded-lg max-w-2xl mx-auto mb-6 shadow-2xl shadow-primary/20">
            <div className="p-3">
              {/* Drawing Controls */}
              <div className="flex flex-wrap justify-center gap-2 mb-3 p-2 bg-gray-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-mono text-gray-700">COLOR:</label>
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-mono text-gray-700">SIZE:</label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm font-mono text-gray-700 w-6">{strokeWidth}</span>
                </div>

                <Button onClick={handlePen} size="sm" variant="outline" className="font-mono bg-transparent">
                  <Palette className="w-4 h-4 mr-1" />
                  PEN
                </Button>

                <Button onClick={handleEraser} size="sm" variant="outline" className="font-mono bg-transparent">
                  <Eraser className="w-4 h-4 mr-1" />
                  ERASE
                </Button>

                <Button onClick={handleClear} size="sm" variant="outline" className="font-mono bg-transparent">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  CLEAR
                </Button>

                <Button onClick={handleDownload} size="sm" variant="outline" className="font-mono bg-transparent">
                  <Download className="w-4 h-4 mr-1" />
                  SAVE
                </Button>
              </div>

              {/* Canvas */}
              <div className="aspect-[3/2] bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                <ReactSketchCanvas
                  ref={canvasRef}
                  strokeWidth={strokeWidth}
                  strokeColor={strokeColor}
                  canvasColor="white"
                  style={{
                    border: "none",
                    borderRadius: "0.5rem",
                  }}
                  width="100%"
                  height="100%"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-card/90 backdrop-blur-md border-t-2 border-primary/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-center gap-8">
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-2 text-foreground hover:text-primary hover:bg-primary/10 p-4 font-mono"
            >
              <Palette className="w-6 h-6" />
              <span className="text-sm font-bold">MY ART</span>
            </Button>

            <Button
              variant="ghost"
              className="flex flex-col items-center gap-2 text-foreground hover:text-secondary hover:bg-secondary/10 p-4 font-mono"
            >
              <ImageIcon className="w-6 h-6" />
              <span className="text-sm font-bold">GALLERY</span>
            </Button>

            <Button
              variant="ghost"
              className="flex flex-col items-center gap-2 text-foreground hover:text-accent hover:bg-accent/10 p-4 font-mono"
            >
              <Upload className="w-6 h-6" />
              <span className="text-sm font-bold">SUBMIT</span>
            </Button>
          </div>
        </div>
      </nav>
    </div>
  )
}
