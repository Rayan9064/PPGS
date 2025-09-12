// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import AppCalls from './components/AppCalls'

interface HomeProps { }

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openNutriGradeModal, setOpenNutriGradeModal] = useState<boolean>(false)
  const { activeAddress } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  const toggleNutriGradeModal = () => {
    setOpenNutriGradeModal(!openNutriGradeModal)
  }

  return (
    <div className="hero min-h-screen bg-teal-400">
      <div className="hero-content text-center rounded-lg p-6 max-w-md bg-white mx-auto">
        <div className="max-w-md">
          <h1 className="text-4xl">
            Welcome to <div className="font-bold">NutriGrade 🍎</div>
          </h1>
          <p className="py-6">
            Connect your Pera Wallet and interact with the NutriGrade smart contract.
          </p>

          <div className="grid gap-4">
            {!activeAddress ? (
              <button
                data-test-id="connect-wallet"
                className="btn btn-primary btn-lg"
                onClick={toggleWalletModal}
              >
                🔗 Connect Pera Wallet
              </button>
            ) : (
              <>
                <div className="alert alert-success">
                  <span>✅ Wallet Connected: {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}</span>
                </div>
                <button
                  data-test-id="nutrigrade-demo"
                  className="btn btn-success btn-lg"
                  onClick={toggleNutriGradeModal}
                >
                  🍎 NutriGrade Contract
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={toggleWalletModal}
                >
                  Switch Wallet
                </button>
              </>
            )}
          </div>

          <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
          <AppCalls openModal={openNutriGradeModal} setModalState={setOpenNutriGradeModal} />
        </div>
      </div>
    </div>
  )
}

export default Home
