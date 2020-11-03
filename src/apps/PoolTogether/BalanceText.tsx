import React from "react"
import Big from "big.js"
import { Loader, Text } from "@gnosis.pm/safe-react-components"
import { ThemeTextSize } from "@gnosis.pm/safe-react-components/dist/theme"

const BalanceText = ({
  decimals = 0,
  amount,
  label = "",
  unit = "",
  precision = 2,
  size = "md",
  loading = false,
  ...props
}: {
  decimals?: number
  amount?: any
  label?: string
  unit?: string
  precision?: number
  size?: ThemeTextSize
  loading?: boolean
}) => {
  return loading ? (
    <Loader size="xs" />
  ) : (
    <Text size={size} {...props}>
      {label && `${label} `}
      {new Big(amount.toString()).div(`1e${decimals}`).toFixed(precision)}
      {unit && ` ${unit}`}
    </Text>
  )
}

export default BalanceText
