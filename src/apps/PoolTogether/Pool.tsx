import React, { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Button as MuiButton,
} from "@material-ui/core"
import { TokenItem } from "./config"
import useAsyncMemo from "../../hooks/useAsyncMemo"
import { useConnection } from "../../web3/ConnectionContext"
import TicketAbi from "./abis/Ticket"
import CErc20Abi from "./abis/CErc20"
import { BigNumber, ethers } from "ethers"
import useResponse from "../../hooks/useResponse"
import { Button, Text, TextField } from "@gnosis.pm/safe-react-components"
import { estimatePrize } from "./utils"
import BalanceText from "./BalanceText"
import { BigNumberInput } from "big-number-input"
import Big from "big.js"
import useStyles from "./useStyles"

export type PoolPropType = {
  token: TokenItem
  pool: any
}

const Pool = ({ token, pool }: PoolPropType) => {
  const { safeInfo, appsSdk, getContract } = useConnection()

  // Contracts
  const ticketContract = useAsyncMemo(
    async () =>
      !!pool.strategyContract &&
      getContract(await pool.strategyContract?.ticket(), TicketAbi),
    null,
    [pool.strategyContract]
  )

  const cTokenContract = useAsyncMemo(
    async () =>
      !!pool.poolContract &&
      getContract(await pool.poolContract?.cToken(), CErc20Abi),
    null,
    [pool.poolContract]
  )

  const [balance, reloadBalance] = useResponse(
    async () =>
      !!ticketContract &&
      !!safeInfo &&
      ticketContract?.balanceOf?.(safeInfo.safeAddress),
    null,
    [ticketContract, safeInfo.safeAddress]
  )

  const [estimatedPrize] = useResponse(
    async () => {
      return estimatePrize(
        token,
        pool.poolContract,
        pool.strategyContract,
        cTokenContract
      )
    },
    null,
    [token, pool.poolContract, pool.strategyContract, cTokenContract]
  )

  const [inputAmount, setInputAmount] = useState<string>(
    new Big(1).times(`1e${token.decimals}`).toString()
  )

  useEffect(() => {
    setInputAmount(new Big(1).times(`1e${token.decimals}`).toString())
  }, [token.decimals])

  const handleBuyTickets = async () => {
    const amount = BigNumber.from(inputAmount || "0")

    const allowance = await pool.tokenContract.allowance(
      safeInfo.safeAddress,
      pool.poolContract.address
    )

    const txs = []

    if (!allowance.gt(amount)) {
      txs.push({
        to: pool.tokenContract.address,
        value: 0,
        data: pool.tokenContract.interface.encodeFunctionData("approve", [
          pool.poolContract.address,
          amount,
        ]),
      })
    }

    txs.push({
      to: pool.poolContract.address,
      value: 0,
      data: pool.poolContract.interface.encodeFunctionData("depositTo", [
        safeInfo.safeAddress,
        amount,
        ticketContract.address,
        ethers.constants.AddressZero,
      ]),
    })

    await appsSdk.sendTransactions(txs)
    setInputAmount(new Big(1).times(`1e${token.decimals}`).toString())
    await reloadBalance()
  }

  const insufficientBalance: boolean =
    !balance || balance?.lt?.(inputAmount || "0")
  const buyButtonEnabled =
    !!pool.poolContract &&
    !!pool.tokenContract &&
    !!estimatedPrize &&
    !!Number(inputAmount) &&
    !insufficientBalance

  const classes = useStyles()

  return (
    <Card>
      <CardHeader title={`PoolTogether ${token.id.toLocaleUpperCase()}`} />
      <CardContent>
        <Grid className={classes.row}>
          <Text size="xl">Estimated Prize</Text>
          <BalanceText
            amount={estimatedPrize}
            unit={token.id.toLocaleUpperCase()}
            loading={!estimatedPrize}
            size="xl"
          />
        </Grid>
        <Grid className={classes.row}>
          <Text size="xl">Your Balance </Text>
          <BalanceText
            size="xl"
            decimals={token.decimals}
            amount={balance}
            unit={`${token.label} Tickets`}
            loading={!balance}
          />
        </Grid>
        <Grid className={classes.row}>
          <BigNumberInput
            decimals={token.decimals}
            onChange={setInputAmount}
            value={inputAmount}
            renderInput={(props: any) => (
              <TextField
                label="Amount"
                meta={{ error: insufficientBalance && "Insufficient balance" }}
                {...props}
                endAdornment={
                  <MuiButton
                    onClick={() => setInputAmount(balance.toString())}
                    variant="text"
                    disabled={!balance}
                  >
                    Max
                  </MuiButton>
                }
              />
            )}
          />
        </Grid>
        <Grid className={classes.controls}>
          <Button
            size="lg"
            onClick={handleBuyTickets}
            disabled={!buyButtonEnabled}
            variant="contained"
            color="primary"
          >
            Buy Tickets
          </Button>
          <Button size="lg" disabled variant="contained" color="secondary">
            Withdraw
          </Button>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default Pool
