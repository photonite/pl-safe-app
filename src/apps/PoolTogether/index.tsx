import React from "react"
import { ThemeProvider } from "styled-components"
import { theme } from "@gnosis.pm/safe-react-components"
import App from "./App"
import { Connector } from "../../web3/ConnectionContext"

const PoolTogether = () => {
  return (
    <ThemeProvider theme={theme}>
      <Connector>
        <App />
      </Connector>
    </ThemeProvider>
  )
}

export default PoolTogether
