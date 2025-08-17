"use client"

import { useState, useEffect } from "react"

interface WalletState {
  isConnected: boolean
  address: string | null
  isConnecting: boolean
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    isConnecting: false,
  })

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setWallet({
            isConnected: true,
            address: accounts[0],
            isConnecting: false,
          })
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
      }
    }
  }

  const connect = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet")
      return
    }

    setWallet((prev) => ({ ...prev, isConnecting: true }))

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setWallet({
          isConnected: true,
          address: accounts[0],
          isConnecting: false,
        })
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      setWallet((prev) => ({ ...prev, isConnecting: false }))
    }
  }

  const disconnect = () => {
    setWallet({
      isConnected: false,
      address: null,
      isConnecting: false,
    })
  }

  return {
    ...wallet,
    connect,
    disconnect,
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
