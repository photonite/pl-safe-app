import React, { useCallback, useContext, useEffect, useState } from "react"
import initSdk, { SafeInfo } from "@gnosis.pm/safe-apps-sdk"
import Web3 from "web3"
import { ethers } from "ethers"

type NetworkId = 1 | 4
const networks = {
  1: "mainnet",
  4: "rinkeby",
}

const appsSdk = initSdk()

const ConnectionContext = React.createContext<any>(null)

export const Connector = ({ children }: { children: any }) => {
  const [safeInfo, setSafeInfo] = useState<SafeInfo>()
  const [connection, setConnection] = useState<any>()
  const [networkId, setNetworkId] = useState<NetworkId>()
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>()

  const getContract = useCallback(
    (address: string, abi: any) => {
      if (provider && networkId && address && abi) {
        const signer: any = provider?.getSigner?.()
        if (signer) {
          return new ethers.Contract(address, abi, provider).connect(signer)
        }
        return new ethers.Contract(address, abi, provider)
      }
    },
    [networkId, provider]
  )

  useEffect(() => {
    if (true && process.env.REACT_APP_LOCAL_WEB3_PROVIDER) {
      console.log("PoolTogether APP: you are using a local web3 provider")
      const w: any = window
      w.web3 = new Web3(w.ethereum)
      setProvider(new ethers.providers.Web3Provider(w.ethereum))
      w.ethereum.enable()

      w.web3.eth.getAccounts().then((addresses: Array<string>) => {
        setSafeInfo({
          safeAddress: addresses[0],
          network: "rinkeby",
          ethBalance: "0.99",
        })
      })
      setConnection(w.web3)
      w.web3.eth.net.getId().then((id: NetworkId) => setNetworkId(id))
    } else {
      const web3 = new Web3(
        "https://rinkeby.infura.io/v3/c6b741d4895e44b9918bb1c4ea0b8c0a"
      )
      setConnection(web3)
      web3.eth.net.getId().then((id: number) => {
        if ([1, 4].includes(id)) {
          setNetworkId(id as NetworkId)
          setProvider(
            ethers.getDefaultProvider(
              networks[id as NetworkId]
            ) as ethers.providers.Web3Provider
          )
        }
      })
    }
  }, [])

  // config safe connector
  useEffect(() => {
    appsSdk.addListeners({
      onSafeInfo: setSafeInfo,
      onTransactionConfirmation: () => {},
    })

    return () => appsSdk.removeListeners()
  }, [])

  return (
    <ConnectionContext.Provider
      value={{
        safeInfo,
        connection,
        provider,
        networkId,
        network:
          typeof networkId !== "undefined" ? networks[networkId] : undefined,
        getContract,
        appsSdk,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  )
}

export const useConnection = (): any => {
  const context = useContext(ConnectionContext)

  if (!context) {
    throw new Error("Component rendered outside the provider tree")
  }
  return context
}

export default ConnectionContext
