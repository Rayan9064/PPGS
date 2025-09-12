import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { NutriGradeFactory, NutriGradeStats, UserStats } from '../contracts/NutriGradeClient'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

interface AppCallsInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const AppCalls = ({ openModal, setModalState }: AppCallsInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [fetching, setFetching] = useState<boolean>(false)
  const [stats, setStats] = useState<NutriGradeStats | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [scanProductId, setScanProductId] = useState<string>('')
  const [appId, setAppId] = useState<string>('')
  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  // Use TestNet configuration
  const algorand = AlgorandClient.fromConfig({
    algodConfig: {
      server: 'https://testnet-api.algonode.cloud',
      port: 443,
      token: '',
    },
    indexerConfig: {
      server: 'https://testnet-idx.algonode.cloud',
      port: 443,
      token: '',
    },
  })
  algorand.setDefaultSigner(transactionSigner)

  const getAppClient = () => {
    if (!appId) return null
    const factory = new NutriGradeFactory({
      defaultSender: activeAddress ?? undefined,
      algorand,
    })
    return factory.getAppClientById({ appId: BigInt(appId) })
  }

  const getExplorerAppUrl = (appId: string | number | bigint | undefined) => {
    if (appId === undefined || appId === null) return undefined
    const id = appId.toString()
    return `https://lora.algokit.io/testnet/application/${id}`
  }

  const fetchStats = async () => {
    if (!activeAddress || !appId) return
    setFetching(true)
    try {
      const client = getAppClient()
      if (!client) return
      const contractStats = await client.state.global.getStats()
      const userContractStats = await client.state.local.getUserStats()
      setStats(contractStats)
      setUserStats(userContractStats)
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      enqueueSnackbar(`Error fetching stats: ${message}`, { variant: 'error' })
    } finally {
      setFetching(false)
    }
  }

  const deployContract = async () => {
    if (!activeAddress) {
      enqueueSnackbar('Please connect a wallet first.', { variant: 'warning' })
      return
    }

    setLoading(true)
    try {
      const factory = new NutriGradeFactory({
        defaultSender: activeAddress,
        algorand,
      })
      
      const appClient = await factory.send.create({})
      const createdAppId = appClient.appId.toString()
      setAppId(createdAppId)
      
      enqueueSnackbar(`Contract deployed! App ID: ${createdAppId}`, { variant: 'success' })
      
      const url = getExplorerAppUrl(createdAppId)
      if (url) {
        enqueueSnackbar(
          <span>
            <a className="link link-primary" href={url} target="_blank" rel="noreferrer">
              View contract on explorer
            </a>
          </span>,
          { variant: 'info', autoHideDuration: 8000 }
        )
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      enqueueSnackbar(`Error deploying contract: ${message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (openModal && appId) {
      void fetchStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal, activeAddress, appId])

  const optInToContract = async () => {
    if (!activeAddress) {
      enqueueSnackbar('Please connect a wallet first.', { variant: 'warning' })
      return
    }

    if (!appId) {
      enqueueSnackbar('Please deploy or enter an App ID first.', { variant: 'warning' })
      return
    }

    setLoading(true)
    try {
      const appClient = getAppClient()
      if (!appClient) return
      const response = await appClient.send.optIn()
      enqueueSnackbar(`Successfully opted in: ${response.return}`, { variant: 'success' })
      await fetchStats()
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      enqueueSnackbar(`Error opting in: ${message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const scanProduct = async () => {
    if (!activeAddress) {
      enqueueSnackbar('Please connect a wallet first.', { variant: 'warning' })
      return
    }

    if (!scanProductId.trim()) {
      enqueueSnackbar('Please enter a product ID to scan.', { variant: 'warning' })
      return
    }

    if (!appId) {
      enqueueSnackbar('Please deploy or enter an App ID first.', { variant: 'warning' })
      return
    }

    setLoading(true)
    try {
      const appClient = getAppClient()
      if (!appClient) return
      const response = await appClient.send.scanProduct(scanProductId)
      enqueueSnackbar(`Product scanned: ${response.return}`, { variant: 'success' })
      await fetchStats()
      setScanProductId('')

      const url = getExplorerAppUrl(appId)
      if (url) {
        enqueueSnackbar(
          <span>
            <a className="link link-primary" href={url} target="_blank" rel="noreferrer">
              View transaction on explorer
            </a>
          </span>,
          { variant: 'info', autoHideDuration: 8000 }
        )
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      enqueueSnackbar(`Error scanning product: ${message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const addDemoProduct = async () => {
    if (!activeAddress) {
      enqueueSnackbar('Please connect a wallet first.', { variant: 'warning' })
      return
    }

    if (!appId) {
      enqueueSnackbar('Please deploy or enter an App ID first.', { variant: 'warning' })
      return
    }

    setLoading(true)
    try {
      const appClient = getAppClient()
      if (!appClient) return
      // Add a demo product with realistic data
      const demoProductId = `DEMO${Date.now()}`
      const demoProductName = "Organic Apple Juice"
      const demoIngredients = "Organic Apple Juice (99%), Vitamin C, Citric Acid"
      
      const response = await appClient.send.addProduct(demoProductId, demoProductName, demoIngredients)
      enqueueSnackbar(`Demo product added successfully!`, { variant: 'success' })
      await fetchStats()
      
      const url = getExplorerAppUrl(appId)
      if (url) {
        enqueueSnackbar(
          <span>
            <a className="link link-primary" href={url} target="_blank" rel="noreferrer">
              View transaction on explorer
            </a>
          </span>,
          { variant: 'info', autoHideDuration: 8000 }
        )
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      enqueueSnackbar(`Error adding demo product: ${message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog id="appcalls_modal" className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}>
      <form method="dialog" className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg">🍎 NutriGrade Smart Contract</h3>
        <p className="text-sm text-gray-600 mb-4">Connected to TestNet via Pera Wallet</p>

        <div className="grid gap-4">
          {/* Contract Setup */}
          {!appId ? (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">Setup Contract</h2>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Enter existing App ID or deploy new contract:</span>
                  </label>
                  <div className="input-group">
                    <input 
                      type="text" 
                      placeholder="App ID (optional)" 
                      className="input input-bordered flex-1"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                    />
                    <button 
                      className={`btn btn-primary ${loading ? 'loading' : ''}`}
                      onClick={(e) => { e.preventDefault(); void deployContract() }}
                      disabled={loading}
                    >
                      {loading ? '' : 'Deploy New'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="alert alert-success">
                <span>✅ Contract Connected: {appId}</span>
                <button 
                  className="btn btn-ghost btn-xs" 
                  onClick={() => setAppId('')}
                >
                  Change
                </button>
              </div>
          {/* Quick Stats */}
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Total Products</div>
              <div className="stat-value text-primary">{stats?.totalProducts?.toString() ?? '—'}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Your Scans</div>
              <div className="stat-value text-secondary">{userStats?.scanCount?.toString() ?? '—'}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">Quick Actions</h2>
              <div className="card-actions justify-center gap-4">
                <button
                  className={`btn btn-primary ${loading ? 'loading' : ''}`}
                  onClick={(e) => { e.preventDefault(); void optInToContract() }}
                  disabled={loading}
                >
                  {loading ? '' : '✅ Opt In to Contract'}
                </button>
                <button
                  className={`btn btn-success ${loading ? 'loading' : ''}`}
                  onClick={(e) => { e.preventDefault(); void addDemoProduct() }}
                  disabled={loading}
                >
                  {loading ? '' : '🍎 Add Demo Product'}
                </button>
              </div>
            </div>
          </div>

          {/* Scan Product */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">🔍 Scan Product</h2>
              <div className="form-control">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Enter product ID or scan barcode"
                    className="input input-bordered flex-1"
                    value={scanProductId}
                    onChange={(e) => setScanProductId(e.target.value)}
                  />
                  <button
                    className={`btn btn-primary ${loading ? 'loading' : ''}`}
                    onClick={(e) => { e.preventDefault(); void scanProduct() }}
                    disabled={loading || !scanProductId.trim()}
                  >
                    {loading ? '' : 'Scan'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="modal-action">
          <button className="btn" onClick={() => setModalState(!openModal)}>
            Close
          </button>
          {appId && (
            <button 
              className={`btn btn-ghost btn-sm ${fetching ? 'loading' : ''}`} 
              onClick={(e) => { e.preventDefault(); void fetchStats() }}
            >
              {fetching ? '' : 'Refresh'}
            </button>
          )}
        </div>
      </form>
    </dialog>
  )
}

export default AppCalls;