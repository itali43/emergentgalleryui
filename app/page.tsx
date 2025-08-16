"use client"

import { Button } from "@/components/ui/button"
import { Wallet, Palette, ImageIcon, Upload, Eraser, RotateCcw } from "lucide-react"
import { ReactSketchCanvas, type ReactSketchCanvasRef } from "react-sketch-canvas"
import { useRef, useState } from "react"

export default function HomePage() {
  const canvasRef = useRef<ReactSketchCanvasRef>(null)
  const [strokeColor, setStrokeColor] = useState("#164e63")
  const [strokeWidth, setStrokeWidth] = useState(4)

  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")

  const handleClear = () => {
    canvasRef.current?.clearCanvas()
  }

  const handleEraser = () => {
    canvasRef.current?.eraseMode(true)
  }

  const handlePen = () => {
    canvasRef.current?.eraseMode(false)
  }

  const handleWalletAction = () => {
    if (isConnected) {
      setIsConnected(false)
      setWalletAddress("")
    } else {
      // Simulate wallet connection
      setIsConnected(true)
      setWalletAddress("0x1234...5678")
    }
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{
        backgroundImage: "url(/gallery-background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <header className="relative z-10 p-6">
        <div className="flex justify-between items-center mb-3">
          <h1 className="font-sans font-light text-3xl md:text-4xl text-white drop-shadow-lg tracking-wide">
            welcome to the <span className="font-bold text-cyan-400">Emergent Gallery</span>
          </h1>
          <Button
            className="bg-amber-900/90 backdrop-blur-sm hover:bg-amber-800 text-amber-100 border border-amber-700 font-medium px-6 shadow-lg"
            onClick={handleWalletAction}
          >
            <Wallet className="w-4 h-4 mr-2" />
            {isConnected ? `Disconnect (${walletAddress})` : "Connect Wallet"}
          </Button>
        </div>

        <div className="flex justify-end">
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              className="bg-amber-900/90 backdrop-blur-sm hover:bg-amber-800 text-amber-100 border border-amber-700 shadow-lg px-3 py-1.5"
            >
              <Palette className="w-3 h-3 mr-1" />
              <span className="text-xs">My Art</span>
            </Button>

            <Button
              size="sm"
              className="bg-amber-900/90 backdrop-blur-sm hover:bg-amber-800 text-amber-100 border border-amber-700 shadow-lg px-3 py-1.5"
            >
              <ImageIcon className="w-3 h-3 mr-1" />
              <span className="text-xs">Gallery</span>
            </Button>

            <Button
              size="sm"
              className="bg-amber-900/90 backdrop-blur-sm hover:bg-amber-800 text-amber-100 border border-amber-700 shadow-lg px-3 py-1.5"
            >
              <Upload className="w-3 h-3 mr-1" />
              <span className="text-xs">Submit</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full">
          <div className="aspect-[4/3] bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-2xl">
            <ReactSketchCanvas
              ref={canvasRef}
              strokeWidth={strokeWidth}
              strokeColor={strokeColor}
              canvasColor="white"
              style={{
                border: "none",
                borderRadius: "0.75rem",
              }}
              width="100%"
              height="100%"
            />
          </div>
        </div>
      </main>

      <div className="relative z-20 pb-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-3 p-3 bg-amber-900/90 backdrop-blur-sm rounded-xl shadow-2xl">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-amber-100">Color</label>
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-8 h-8 rounded border border-amber-700 cursor-pointer bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-amber-100">Brush</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="w-16 accent-cyan-400"
                />
                <span className="text-xs font-medium text-amber-100 w-4">{strokeWidth}</span>
              </div>

              <div className="flex gap-1">
                <Button
                  onClick={handlePen}
                  size="sm"
                  className="bg-amber-800 hover:bg-amber-700 text-amber-100 border-amber-600 px-2 py-1"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z" />
                  </svg>
                </Button>

                <Button
                  onClick={handleEraser}
                  size="sm"
                  className="bg-amber-800 hover:bg-amber-700 text-amber-100 border-amber-600 px-2 py-1"
                >
                  <Eraser className="w-4 h-4" />
                </Button>

                <Button
                  onClick={handleClear}
                  size="sm"
                  className="bg-amber-800 hover:bg-amber-700 text-amber-100 border-amber-600 px-2 py-1"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
