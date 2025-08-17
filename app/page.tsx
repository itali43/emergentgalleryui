"use client"

import { Button } from "@/components/ui/button"
import { ReactSketchCanvas, type ReactSketchCanvasRef } from "react-sketch-canvas"
import { useRef, useState } from "react"
import { useWallet } from "@/hooks/useWallet"
import Link from "next/link"

export default function HomePage() {
  const canvasRef = useRef<ReactSketchCanvasRef>(null)
  const [strokeColor, setStrokeColor] = useState("#164e63")
  const [strokeWidth, setStrokeWidth] = useState(4)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)

  // Configure your eggman API URL here
  const EGGMAN_API_URL = process.env.NEXT_PUBLIC_EGGMAN_API_URL || "http://localhost:3005"

  const { isConnected, address, connect, disconnect, isConnecting } = useWallet()

  const handleClear = () => {
    canvasRef.current?.clearCanvas()
    setUploadResult(null)
  }

  const handleEraser = () => {
    canvasRef.current?.eraseMode(true)
  }

  const handlePen = () => {
    canvasRef.current?.eraseMode(false)
  }

  const handleWalletAction = () => {
    if (isConnected) {
      disconnect()
    } else {
      connect()
    }
  }

  const handlePay = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }

    if (!canvasRef.current) {
      return
    }

    setIsSubmitting(true)

    try {
      // Export canvas as data URL
      const dataUrl = await canvasRef.current.exportImage("jpeg")

      // Convert data URL to blob for file upload
      const response = await fetch(dataUrl)
      const blob = await response.blob()

      // Check if blob is too small (empty canvas)
      if (blob.size < 1000) {
        alert("Please draw something on the canvas first!")
        setIsSubmitting(false)
        return
      }

      // Create a file object from the blob
      const file = new File([blob], `artwork-${Date.now()}.jpeg`, { type: "image/jpeg" })

      // Demo: Open payment popup
      const paymentUrl = `${EGGMAN_API_URL}/pay`
      window.open(paymentUrl, "x402Payment", "width=600,height=800,scrollbars=yes,resizable=yes")

      const formData = new FormData()
      formData.append("file", file)
      formData.append("walletAddress", address || "")

      const uploadResponse = await fetch(`${EGGMAN_API_URL}/store`, {
        method: "POST",
        body: formData,
      })
      console.log(uploadResponse)
      if (uploadResponse.ok) {
        const result = await uploadResponse.json()
        setUploadResult(result)
        console.log("Upload successful:", result)
      } else {
        console.error("Upload failed")
      }

      setIsSubmitting(false)
      // Show a message to the user that the upload is complete
      alert("Upload complete! Your artwork has been uploaded.")
    } catch (error) {
      console.error("Error:", error)
      setIsSubmitting(false)
    }
  }

  const WalletIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  )

  const PaletteIcon = () => (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 3c-4.97 0-9 4.03-9 9 0 3.9 2.51 7.24 6 8.48.35-.66.54-1.43.54-2.48 0-.83-.67-1.5-1.5-1.5S6.5 16.17 6.5 17c0 .28.22.5.5.5.83 0 1.5.67 1.5 1.5S7.83 20.5 7 20.5c-3.31 0-6-2.69-6-6 0-4.42 3.58-8 8-8s8 3.58 8 8c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-3.86-3.14-7-7-7z" />
    </svg>
  )

  const ImageIcon = () => (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
    </svg>
  )

  const UploadIcon = () => (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
    </svg>
  )

  const EraserIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0M4.22 15.58l3.54 3.53c.78.79 2.04.79 2.83 0l3.53-3.53-6.36-6.36-3.54 3.36Z" />
    </svg>
  )

  const RotateIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12,6V9L16,5L12,1V4A8,8 0 0,0 4,12C4,13.57 4.46,15.03 5.24,16.26L6.7,14.8C6.25,13.97 6,13 6,12A6,6 0 0,1 12,6M18.76,7.74L17.3,9.2C17.74,10.04 18,11 18,12A6,6 0 0,1 12,18V15L8,19L12,23V20A8,8 0 0,0 20,12C20,10.43 19.54,8.97 18.76,7.74Z" />
    </svg>
  )

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
          <div className="relative">
            <div
              className="absolute inset-0 bg-white/20"
              style={{
                clipPath: "polygon(0 0, calc(100% - 60px) 0, calc(100% - 20px) 100%, 0 100%)",
                left: "-1.5rem",
                right: "-4rem",
                top: "-0.5rem",
                bottom: "-0.5rem",
              }}
            />
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm border-t-2 border-r-2 border-b-2 border-white/60"
              style={{
                clipPath: "polygon(0 0, calc(100% - 60px) 0, calc(100% - 20px) 100%, 0 100%)",
                left: "-1.5rem",
                right: "-4rem",
                top: "-0.5rem",
                bottom: "-0.5rem",
              }}
            />
            <h1 className="relative font-sans font-light text-3xl md:text-4xl text-white drop-shadow-lg tracking-wide">
              welcome to the <span className="font-bold text-cyan-400">Emergent Gallery</span>
            </h1>
          </div>
          <Button
            className="bg-amber-900/90 backdrop-blur-sm hover:bg-amber-800 text-amber-100 border border-amber-700 font-medium px-6 shadow-lg"
            onClick={handleWalletAction}
            disabled={isConnecting}
          >
            <WalletIcon />
            <span className="ml-2">
              {isConnecting
                ? "Connecting..."
                : isConnected
                  ? `Disconnect (${address?.slice(0, 6)}...${address?.slice(-4)})`
                  : "Connect Wallet"}
            </span>
          </Button>
        </div>

        <div className="flex justify-end">
          <div className="flex flex-col gap-2">
            <Link href="/gallery">
              <Button
                size="sm"
                className="bg-amber-900/90 backdrop-blur-sm hover:bg-amber-800 text-amber-100 border border-amber-700 shadow-lg px-3 py-1.5 w-full"
              >
                <ImageIcon />
                <span className="text-xs ml-1">Gallery</span>
              </Button>
            </Link>

            <Button
              size="sm"
              className="bg-green-700/90 hover:bg-green-600 text-white border border-green-600 font-medium px-3 py-1.5 shadow-lg"
              onClick={handlePay}
              disabled={isSubmitting || !isConnected}
            >
              <UploadIcon />
              <span className="text-xs ml-1">{isSubmitting ? "Processing..." : "Pay & Upload ($0.10)"}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full">
          <div
            className={`aspect-[4/3] bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-2xl ${isSubmitting ? "opacity-50 pointer-events-none" : ""}`}
          >
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

          {isSubmitting && (
            <div className="mt-4 p-4 bg-blue-900/90 backdrop-blur-sm rounded-xl border border-blue-600 shadow-lg animate-pulse">
              <h3 className="text-blue-100 font-medium mb-2">💳 Processing Payment & Upload...</h3>
              <div className="text-blue-200 text-sm">Please complete the x402 checkout in the popup window.</div>
            </div>
          )}

          {uploadResult && (
            <div className="mt-4 p-4 bg-green-900/90 backdrop-blur-sm rounded-xl border border-green-600 shadow-lg">
              <h3 className="text-green-100 font-medium mb-2">🎉 Upload Successful!</h3>
              <div className="space-y-2 text-sm">
                {uploadResult.blobId && (
                  <div className="text-green-200">
                    <span className="font-medium">Blob ID:</span>
                    <div className="mt-1 p-2 bg-black/30 rounded font-mono text-xs break-all">
                      {uploadResult.blobId}
                    </div>
                  </div>
                )}
                {uploadResult.blobObjectId && (
                  <div className="text-green-200">
                    <span className="font-medium">Object ID:</span>
                    <div className="mt-1 p-2 bg-black/30 rounded font-mono text-xs break-all">
                      {uploadResult.blobObjectId}
                    </div>
                  </div>
                )}
                {uploadResult.mintTransactionHash && (
                  <div className="text-green-200">
                    <span className="font-medium">NFT Transaction:</span>
                    <div className="mt-1">
                      <a
                        href={uploadResult.mintTransactionUrl || `https://sepolia.basescan.org/tx/${uploadResult.mintTransactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 p-2 bg-black/30 hover:bg-black/40 rounded text-cyan-400 hover:text-cyan-300 font-mono text-xs transition-colors"
                      >
                        <span className="break-all">{uploadResult.mintTransactionHash}</span>
                        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
                <div className="text-green-300 text-xs">
                  {uploadResult.message || "Your artwork has been stored on the Walrus network"}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="relative z-20 pb-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center">
            <div
              className={`inline-flex items-center gap-3 p-3 bg-amber-900/90 backdrop-blur-sm rounded-xl shadow-2xl ${isSubmitting ? "opacity-50 pointer-events-none" : ""}`}
            >
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-amber-100">Color</label>
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-8 h-8 rounded border border-amber-700 cursor-pointer bg-white"
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
                <span className="text-xs font-medium text-amber-100 w-4">{strokeWidth}</span>
              </div>

              <div className="flex gap-1">
                <Button
                  onClick={handlePen}
                  size="sm"
                  className="bg-amber-800 hover:bg-amber-700 text-amber-100 border-amber-600 px-2 py-1"
                  disabled={isSubmitting}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z" />
                  </svg>
                </Button>

                <Button
                  onClick={handleEraser}
                  size="sm"
                  className="bg-amber-800 hover:bg-amber-700 text-amber-100 border-amber-600 px-2 py-1"
                  disabled={isSubmitting}
                >
                  <EraserIcon />
                </Button>

                <Button
                  onClick={handleClear}
                  size="sm"
                  className="bg-amber-800 hover:bg-amber-700 text-amber-100 border-amber-600 px-2 py-1"
                  disabled={isSubmitting}
                >
                  <RotateIcon />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
