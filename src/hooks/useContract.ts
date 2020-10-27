import { useEffect, useState } from "react"
import { useConnection } from "../web3/ConnectionContext"
import ethers from 'ethers'

const getContact = ((networkId: any, address: string, abi: any) => {
  if (networkId && address && abi) {
    return new ethers.Contract(address, abi, ethers.getDefaultProvider(networkId))
  }
  return null
})

const useContract = (addressRetriever: string | Function, abi: any) => {
  const { networkId } = useConnection()
  const [contract, setContract] = useState<any>()

  useEffect(() => {
    if (contract) return
    if (typeof addressRetriever === 'string') {
      setContract(getContact(networkId, addressRetriever, abi))
    } else if (addressRetriever instanceof Function) {
      addressRetriever().then((address: string) => {
        if (address) {
          setContract(getContact(networkId, address, abi))
        }
      })
    }
  }, [addressRetriever, abi, networkId, contract])


  return contract
} 

export default useContract