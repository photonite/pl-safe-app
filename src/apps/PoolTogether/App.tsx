import React, { useEffect, useState } from "react"
import { getTokenList, TokenItem } from "./config"
import WidgetWrapper from "../../components/WidgetWrapper"
import { Title, Section } from "@gnosis.pm/safe-react-components"
import { List } from "@material-ui/core"
import Pool from "./Pool"
import { useConnection } from "../../web3/ConnectionContext"

const PoolTogetherWidget = () => {
  const [tokens, setTokens] = useState<Array<TokenItem>>([])
  const { connection } = useConnection()

  useEffect(() => {
    if (connection && !tokens.length) {
      getTokenList(connection).then(setTokens)
    }
  }, [connection, tokens.length])

  return (
    <WidgetWrapper>
      <Title size="xs">PoolTogether</Title>
      <Section>
        <List>
          {tokens.map((token: TokenItem) => (
            <Pool token={token} key={token.id} />
          ))}
        </List>
      </Section>
    </WidgetWrapper>
  )
}

export default PoolTogetherWidget
