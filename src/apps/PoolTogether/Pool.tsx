import React from "react"
import ListItem from "@material-ui/core/ListItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import { TokenItem } from "./config"
import useContract from "../../hooks/useContract"
import PrizePoolAbi from "./abis/PrizePool"
import Big from "big.js"
import SingleRandomWinnerAbi from "./abis/SingleRandomWinner"
import CErc20 from "./abis/CErc20"
import useAsyncMemo from "../../hooks/useAsyncMemo"
const SECONDS_PER_BLOCK = 14

const Pool = ({ token }: { token: TokenItem }) => {
  const poolContract: any = useContract(token.poolAddr, PrizePoolAbi)

  const strategyContract: any = useContract(
    async () => poolContract?.prizeStrategy(),
    SingleRandomWinnerAbi
  )

  const cTokenContract: any = useContract(
    async () => poolContract?.cToken(),
    CErc20
  )

  const prize = useAsyncMemo(
    async () => {
      if (poolContract && strategyContract && cTokenContract) {
        const [
          supplyRateByBlock,
          awardBalance,
          balance,
          periodEndAt,
        ] = await Promise.all([
          cTokenContract.supplyRatePerBlock(),
          poolContract.callStatic.captureAwardBalance(),
          poolContract.callStatic.balance(),
          strategyContract?.prizePeriodEndAt(),
        ])

        const numberOfBlocks = new Big(periodEndAt)
          .minus(Date.now() / 1000)
          .div(SECONDS_PER_BLOCK)

        const scaledBalance = new Big(balance).div(10 ** token.decimals)
        const scaledAwardBalance = new Big(awardBalance).div(
          10 ** token.decimals
        )
        const scaledSupplyRatePerBlock = new Big(supplyRateByBlock).div(
          10 ** 18
        )

        const prize = scaledBalance
          .times(numberOfBlocks)
          .times(scaledSupplyRatePerBlock)
          .plus(scaledAwardBalance)

        return prize.toFixed(2)
      }
      return "-"
    },
    "-",
    [poolContract, strategyContract, cTokenContract, token.decimals]
  )

  return (
    <ListItem button component="ul">
      <ListItemIcon>
        <img src={token?.iconUrl} alt={token?.label} height="36" />
      </ListItemIcon>
      <ListItemText primary={`${prize} DAI`} />
    </ListItem>
  )
}

export default Pool
