"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const EGGMAN_API_URL = process.env.NEXT_PUBLIC_EGGMAN_API_URL || "http://localhost:3005"

const mockPaintings = [
  {
    tokenId: 1001,
    imageUrl: "/abstract-digital-art.png",
    owner: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
  },
  {
    tokenId: 1002,
    imageUrl: "/colorful-modern-art.png",
    owner: "0x8ba1f109551bD432803012645Hac136c0532925a",
  },
  {
    tokenId: 1003,
    imageUrl: "/geometric-abstract.png",
    owner: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  },
  {
    tokenId: 1004,
    imageUrl: "/surreal-digital-artwork.png",
    owner: "0xA0b86a33E6441b8dB2B2B0532925a3b8D4C0532925",
  },
  {
    tokenId: 1005,
    imageUrl: "/minimalist-art.png",
    owner: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  },
  {
    tokenId: 1006,
    imageUrl: "/vibrant-digital-art.png",
    owner: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
]

export default function GalleryPage() {
  const [paintings, setPaintings] = useState(mockPaintings)
  const [loading, setLoading] = useState(false)
  const [forgingTokens, setForgingTokens] = useState<Set<number>>(new Set())
  const [forgeResults, setForgeResults] = useState<Map<number, string>>(new Map())

  useEffect(() => {
    const fetchPaintings = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${EGGMAN_API_URL}/images`)
        if (!response.ok) {
          throw new Error('Failed to fetch images')
        }
        const data = await response.json()
        
        if (data.images && Array.isArray(data.images)) {
          const length = data.images.length;
          setPaintings(data.images.map((item: any, index: number) => ({
            tokenId: length - index,
            imageUrl: `${EGGMAN_API_URL}${item.url}`,
            owner: item.owner
          })))
        } else {
          setPaintings(mockPaintings)
        }
      } catch (error) {
        console.error('Error fetching paintings:', error)
        setPaintings(mockPaintings)
      } finally {
        setLoading(false)
      }
    }
    fetchPaintings()
  }, [])

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleForgeToken = async (tokenId: number) => {
    setForgingTokens(prev => new Set(prev).add(tokenId))
    
    try {
      // TODO: Implement actual cross-chain forging logic
      const txnHash = await simulateCrossChainAction(tokenId)
      setForgeResults(prev => new Map(prev).set(tokenId, txnHash))
      console.log(`Successfully forged token ${tokenId}, txn: ${txnHash}`)
    } catch (error) {
      console.error(`Failed to forge token ${tokenId}:`, error)
    } finally {
      setForgingTokens(prev => {
        const newSet = new Set(prev)
        newSet.delete(tokenId)
        return newSet
      })
    }
  }

  const simulateCrossChainAction = async (tokenId: number): Promise<string> => {
    // Simulate cross-chain transaction delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate a mock transaction hash
        const mockTxnHash = `0x${Math.random().toString(16).substr(2, 64)}`
        resolve(mockTxnHash)
      }, 3000) // 3 second delay to simulate cross-chain action
    })
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url(/gallery-background.png)" }}
    >
      {/* Header with back button */}
      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button
              variant="outline"
              className="bg-amber-900/80 border-amber-700 text-amber-100 hover:bg-amber-800/90 backdrop-blur-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Canvas
            </Button>
          </Link>

          {/* Title with black background band */}
          <div className="relative">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm border-t-2 border-r-2 border-b-2 border-white/60"
              style={{
                clipPath: "polygon(0 0, calc(100% - 2rem) 0, 100% 100%, 0 100%)",
                marginRight: "-4rem",
              }}
            />
            <h1 className="relative z-10 text-2xl font-bold text-white px-6 py-3">
              welcome to the <span className="text-cyan-400 font-bold">Emergent Gallery</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Gallery Grid */}
      <main className="relative z-10 px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-white text-lg">Loading masterpieces...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paintings.map((painting) => (
                <div
                  key={painting.tokenId}
                  className="bg-amber-900 backdrop-blur-sm border border-amber-700/30 rounded-lg overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                >
                  {/* Painting Image */}
                  <div className="aspect-square bg-white p-4">
                    <img
                      src={painting.imageUrl || "/placeholder.svg"}
                      alt={`Token ${painting.tokenId}`}
                      className="w-full h-full object-cover rounded shadow-lg"
                    />
                  </div>

                  {/* Painting Info */}
                  <div className="p-4 space-y-3">
                    <div className="text-yellow-300 font-bold text-lg">Token #{painting.tokenId}</div>

                    <div className="text-amber-200 text-sm">
                      <span className="opacity-75">Owner:</span>
                      <div className="font-mono text-xs mt-1 bg-black/30 px-2 py-1 rounded">
                        {truncateAddress(painting.owner)}
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleForgeToken(painting.tokenId)}
                      disabled={forgingTokens.has(painting.tokenId)}
                    >
                      {forgingTokens.has(painting.tokenId) ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Forging...
                        </>
                      ) : (
                        "Forge This Masterpiece!"
                      )}
                    </Button>

                    {forgeResults.has(painting.tokenId) && (
                      <div className="mt-3 p-3 bg-green-900/90 backdrop-blur-sm rounded-lg border border-green-600 shadow-lg">
                        <h4 className="text-green-100 font-medium text-sm mb-2">🎉 Forged Successfully!</h4>
                        <div className="text-green-200 text-xs">
                          <span className="font-medium">Transaction Hash:</span>
                          <div className="mt-1 p-2 bg-black/30 rounded font-mono text-xs break-all">
                            {forgeResults.get(painting.tokenId)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
