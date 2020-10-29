import React, { useEffect, useState } from "react"
import { getTokenList, TokenItem } from "./config"
import WidgetWrapper from "../../components/WidgetWrapper"
import { Title, Section } from "@gnosis.pm/safe-react-components"
import { List } from "@material-ui/core"
import PoolListItem from "./PoolListItem"
import { useConnection } from "../../web3/ConnectionContext"
import Pool from "./Pool"

const PoolTogetherWidget = () => {
  const { connection } = useConnection()
  const [tokens, setTokens] = useState<Array<TokenItem>>([])
  const [selectedToken, setSelectedToken] = useState<TokenItem | null>()

  useEffect(() => {
    if (connection && !tokens.length) {
      getTokenList(connection).then(setTokens)
    }
  }, [connection, tokens.length])

  return (
    <WidgetWrapper>
      <Title size="xs">PoolTogether</Title>
      <Section>
        {!selectedToken ? (
          <List>
            {tokens.map((token: TokenItem) => (
              <PoolListItem
                token={token}
                key={token.id}
                onClick={() => setSelectedToken(token)}
              />
            ))}
          </List>
        ) : (
          <Pool token={selectedToken} onClose={() => setSelectedToken(null)} />
        )}
      </Section>
    </WidgetWrapper>
  )
}

export default PoolTogetherWidget
