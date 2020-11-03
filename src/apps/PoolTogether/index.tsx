import React from "react"
import { ThemeProvider } from "styled-components"
import { Loader, theme, Title } from "@gnosis.pm/safe-react-components"
import App from "./App"
import { Connector } from "../../web3/ConnectionContext"
import SafeProvider from "@rmeissner/safe-apps-react-sdk"

const PoolTogether = () => {
  return (
    <ThemeProvider theme={theme}>
      <SafeProvider
        loading={
          <>
            <Title size="md">Waiting for Safe...</Title>
            <Loader size="md" />
          </>
        }
      >
        <Connector>
          <App />
        </Connector>
      </SafeProvider>
    </ThemeProvider>
  )
}

export default PoolTogether
