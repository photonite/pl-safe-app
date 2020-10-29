import React, { useState } from "react"
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Input,
} from "@material-ui/core"
import { ArrowRight, ChevronLeft } from "@material-ui/icons"
import { TokenItem } from "./config"
import useContract from "../../hooks/useContract"
import useAsyncMemo from "../../hooks/useAsyncMemo"
import { useConnection } from "../../web3/ConnectionContext"
import PrizePoolAbi from "./abis/PrizePool"
import SingleRandomWinnerAbi from "./abis/SingleRandomWinner"
import TicketAbi from "./abis/Ticket"
import Big from "big.js"
import CErc20 from "./abis/CErc20"
import { ethers } from "ethers"
import useResponse from "../../hooks/useResponse"

const Pool = ({
  token,
  onClose,
}: {
  token: TokenItem
  onClose: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}) => {
  const { safeInfo, appsSdk } = useConnection()
  console.log({ safeInfo })
  const tokenContract = useContract(token.tokenAddr, CErc20)
  const poolContract: any = useContract(token.poolAddr, PrizePoolAbi)
  const strategyContract: any = useContract(
    async () => poolContract?.prizeStrategy(),
    SingleRandomWinnerAbi
  )

  const ticketAddress = useAsyncMemo(
    async () => strategyContract?.ticket(),
    "",
    [strategyContract]
  )
  const ticketContract: any = useContract(ticketAddress, TicketAbi)

  const controlledTokens = useAsyncMemo(
    async () => {
      const tokens = poolContract?.tokens()

      console.log({ poolContract, tokens })
      return tokens
    },
    [],
    [poolContract]
  )

  const [balance, reloadBalance] = useResponse(
    async () => {
      if (ticketContract) {
        return await ticketContract.balanceOf(safeInfo.safeAddress)
      }
    },
    "0",
    [ticketContract, safeInfo.safeAddress]
  )

  const [inputAmount, setInputAmount] = useState<string>("0")

  const handleBuyTickets = async () => {
    const amount = ethers.utils.parseEther(inputAmount)
    const allowance = await tokenContract.allowance(
      safeInfo.safeAddress,
      poolContract.address
    )

    const txs = []

    if (!allowance.gt(amount)) {
      txs.push({
        to: tokenContract.address,
        value: 0,
        data: tokenContract.interface.encodeFunctionData("approve", [
          poolContract.address,
          amount,
        ]),
      })
    }

    txs.push({
      to: poolContract.address,
      value: 0,
      data: poolContract.interface.encodeFunctionData("depositTo", [
        safeInfo.safeAddress,
        amount,
        ticketContract.address,
        ethers.constants.AddressZero,
      ]),
    })

    await appsSdk.sendTransactions(txs)
    reloadBalance()
  }

  console.log({
    inputAmount,
    token,
    controlledTokens,
    ticketAddress,
    balance,
    balancetos: balance?.toString(),
  })

  return (
    <Card>
      <CardHeader
        title={`PoolTogether ${token.id.toLocaleUpperCase()}`}
        avatar={
          <IconButton onClick={onClose}>
            <ChevronLeft />
          </IconButton>
        }
      />
      <CardContent>
        <div>
          Your balance:{" "}
          {!!balance &&
            new Big(balance?.toString())
              .div(`1e${token.decimals}`)
              .toFixed(2)}{" "}
          Tokens
        </div>
        <div>
          <Input
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
          />
        </div>
        <div>
          <Button startIcon={<ArrowRight />} onClick={handleBuyTickets}>
            Buy Tickets
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default Pool
