"use client"

import { Button } from "@/components/ui/button"
import { ReactSketchCanvas, type ReactSketchCanvasRef } from "react-sketch-canvas"
import { useRef, useState, useEffect } from "react"
import { useWallet } from "@/hooks/useWallet"

export default function HomePage() {
  const canvasRef = useRef<ReactSketchCanvasRef>(null)
  const [strokeColor, setStrokeColor] = useState("#164e63")
  const [strokeWidth, setStrokeWidth] = useState(4)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'unpaid' | 'pending' | 'paid' | 'expired'>('unpaid')
  const [transactionString, setTransactionString] = useState<string | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Configure your eggman API URL here
  const EGGMAN_API_URL = process.env.NEXT_PUBLIC_EGGMAN_API_URL || 'http://localhost:3005'

  const { isConnected, address, connect, disconnect, isConnecting } = useWallet()

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
      disconnect()
    } else {
      connect()
    }
  }

  const handlePayment = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = (newTransactionString: string) => {
    setTransactionString(newTransactionString)
    setPaymentStatus('paid')
    setShowPaymentModal(false)
    setIsProcessingPayment(false)
  }

  const handlePaymentClose = () => {
    setShowPaymentModal(false)
    if (paymentStatus === 'pending') {
      setPaymentStatus('unpaid')
    }
  }

  // Function to check payment status
  const checkPaymentStatus = async () => {
    if (paymentStatus !== 'pending') return

    try {
      const response = await fetch(`${EGGMAN_API_URL}/admin/transactions`)
      if (response.ok) {
        const data = await response.json()
        // Look for the most recent unused transaction
        const recentTransaction = data.transactions
          .filter((t: any) => !t.used && t.createdAt)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        
        if (recentTransaction) {
          setTransactionString(recentTransaction.transactionString)
          setPaymentStatus('paid')
          setShowPaymentModal(false)
          setIsProcessingPayment(false)
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
    }
  }

  // Check payment status every 5 seconds when pending
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (paymentStatus === 'pending') {
      interval = setInterval(checkPaymentStatus, 5000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [paymentStatus])

  const handleSubmit = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }

    if (!canvasRef.current) {
      alert("Canvas not available")
      return
    }

    if (paymentStatus !== 'paid' || !transactionString) {
      alert("Please complete payment first")
      return
    }

    setIsSubmitting(true)
    
    try {
      // Export canvas as data URL
      const dataUrl = await canvasRef.current.exportImage("jpeg")
      
      // Convert data URL to blob for file upload
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      
      // Create a file object from the blob
      const file = new File([blob], `artwork-${Date.now()}.png`, { type: 'image/jpeg' })
      
      // Use the transaction string from successful payment
      const currentTransactionString = transactionString
      
      // Prepare form data for file upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('transactionString', currentTransactionString)
      
      // Make API call to your external eggman API
      const apiResponse = await fetch(`${EGGMAN_API_URL}/store`, {
        method: 'POST',
        body: formData,
      })

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json()
        throw new Error(errorData.error || `HTTP error! status: ${apiResponse.status}`)
      }

      const result = await apiResponse.json()
      console.log('Submission successful:', result)
      
      // Clear canvas after successful submission
      handleClear()
      // Reset payment status after successful submission
      setPaymentStatus('unpaid')
      setTransactionString(null)
      alert(`Art submitted successfully! Blob ID: ${result.blobId || 'N/A'}`)
      
    } catch (error) {
      console.error('Error submitting art:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to submit art: ${errorMessage}`)
    } finally {
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
            <Button
              size="sm"
              className="bg-amber-900/90 backdrop-blur-sm hover:bg-amber-800 text-amber-100 border border-amber-700 shadow-lg px-3 py-1.5"
            >
              <PaletteIcon />
              <span className="text-xs ml-1">My Art</span>
            </Button>

            <Button
              size="sm"
              className="bg-amber-900/90 backdrop-blur-sm hover:bg-amber-800 text-amber-100 border border-amber-700 shadow-lg px-3 py-1.5"
            >
              <ImageIcon />
              <span className="text-xs ml-1">Gallery</span>
            </Button>

            <Button
              size="sm"
              className={`backdrop-blur-sm text-amber-100 border font-medium px-3 py-1.5 shadow-lg ${
                paymentStatus === 'paid' 
                  ? 'bg-green-700/90 hover:bg-green-600 border-green-600' 
                  : paymentStatus === 'pending'
                    ? 'bg-yellow-700/90 hover:bg-yellow-600 border-yellow-600'
                    : paymentStatus === 'expired'
                      ? 'bg-red-700/90 hover:bg-red-600 border-red-600'
                      : 'bg-amber-900/90 hover:bg-amber-800 border-amber-700'
              }`}
              onClick={handlePayment}
              disabled={isProcessingPayment || !isConnected || paymentStatus === 'paid'}
            >
              <UploadIcon />
              <span className="text-xs ml-1">
                {isProcessingPayment 
                  ? "Processing..." 
                  : paymentStatus === 'paid' 
                    ? "Paid ✓" 
                    : paymentStatus === 'pending'
                      ? "Pending..."
                      : paymentStatus === 'expired'
                        ? "Expired"
                        : "Pay $0.10"}
              </span>
            </Button>

            <Button
              size="sm"
              className="bg-amber-900/90 backdrop-blur-sm hover:bg-amber-800 text-amber-100 border border-amber-700 shadow-lg px-3 py-1.5"
              onClick={handleSubmit}
              disabled={isSubmitting || !isConnected || paymentStatus !== 'paid'}
            >
              <UploadIcon />
              <span className="text-xs ml-1">
                {isSubmitting ? "Submitting..." : "Submit"}
              </span>
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
                  <EraserIcon />
                </Button>

                <Button
                  onClick={handleClear}
                  size="sm"
                  className="bg-amber-800 hover:bg-amber-700 text-amber-100 border-amber-600 px-2 py-1"
                >
                  <RotateIcon />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-amber-900/95 backdrop-blur-md border-2 border-amber-600 rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-amber-100">Complete Payment</h3>
              <Button
                onClick={handlePaymentClose}
                size="sm"
                className="bg-amber-800 hover:bg-amber-700 text-amber-100 border-amber-600"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-amber-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-amber-100 mb-2">Payment Details</h4>
                <p className="text-amber-200 text-sm">
                  • Amount: $0.10 USD<br/>
                  • Network: Base Sepolia<br/>
                  • Description: Payment for file storage<br/>
                  • Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>

              <div className="bg-amber-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-amber-100 mb-2">How to Pay</h4>
                <ol className="text-amber-200 text-sm space-y-1">
                  <li>1. Click the "Pay $0.10 Now" button below</li>
                  <li>2. Your connected wallet will prompt for payment approval</li>
                  <li>3. Complete the transaction in your wallet</li>
                  <li>4. Payment will be verified automatically</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={async () => {
                    setIsProcessingPayment(true)
                    setPaymentStatus('pending')
                    
                    try {
                      // Make direct payment request to x402 endpoint
                      // This should trigger the x402 middleware to handle the payment
                      const response = await fetch(`${EGGMAN_API_URL}/pay`, {
                        method: 'GET',
                        credentials: 'include', // Include cookies/auth
                        headers: {
                          'Accept': 'application/json',
                          'Content-Type': 'application/json',
                        },
                      })
                      
                      console.log('Payment response:', response.status, response.headers)
                      
                      if (response.ok) {
                        const result = await response.json()
                        console.log('Payment result:', result)
                        
                        if (result.transactionString) {
                          // Payment successful
                          setTransactionString(result.transactionString)
                          setPaymentStatus('paid')
                          setShowPaymentModal(false)
                          setIsProcessingPayment(false)
                        } else {
                          throw new Error('No transaction string received')
                        }
                      } else {
                        // If not OK, the x402 middleware might be redirecting
                        // Check if we got redirected to a payment page
                        const responseText = await response.text()
                        console.log('Payment response text:', responseText)
                        
                        if (responseText.includes('x402') || responseText.includes('payment')) {
                          // x402 is handling the payment, let's wait for completion
                          // Set up polling to check for payment completion
                          const checkInterval = setInterval(async () => {
                            try {
                              const statusResponse = await fetch(`${EGGMAN_API_URL}/admin/transactions`)
                              if (statusResponse.ok) {
                                const data = await statusResponse.json()
                                const recentTransaction = data.transactions
                                  .filter((t: any) => !t.used && t.createdAt)
                                  .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
                                
                                if (recentTransaction) {
                                  setTransactionString(recentTransaction.transactionString)
                                  setPaymentStatus('paid')
                                  setShowPaymentModal(false)
                                  setIsProcessingPayment(false)
                                  clearInterval(checkInterval)
                                }
                              }
                            } catch (error) {
                              console.error('Error checking payment status:', error)
                            }
                          }, 2000) // Check every 2 seconds
                          
                          // Cleanup after 10 minutes
                          setTimeout(() => {
                            clearInterval(checkInterval)
                            if (paymentStatus === 'pending') {
                              setPaymentStatus('expired')
                              setIsProcessingPayment(false)
                            }
                          }, 10 * 60 * 1000)
                        } else {
                          throw new Error('Payment failed - unexpected response')
                        }
                      }
                    } catch (error) {
                      console.error('Payment error:', error)
                      setPaymentStatus('unpaid')
                      setIsProcessingPayment(false)
                      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
                    }
                  }}
                  className="flex-1 bg-green-700 hover:bg-green-600 text-white font-medium py-3"
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? "Processing..." : "Pay $0.10 Now"}
                </Button>
                
                <Button
                  onClick={handlePaymentClose}
                  className="bg-amber-800 hover:bg-amber-700 text-amber-100 border-amber-600"
                >
                  Cancel
                </Button>
              </div>

              {paymentStatus === 'pending' && (
                <div className="bg-yellow-700/50 rounded-lg p-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-300 mx-auto mb-2"></div>
                  <p className="text-yellow-200 text-sm">
                    Payment processing... Please complete the payment in the x402 window and return here.
                  </p>
                  <p className="text-yellow-300 text-xs mt-2">
                    This modal will close automatically when payment is confirmed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
