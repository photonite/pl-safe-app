import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom"

import Compound from "./apps/Compound"
import WalletConnect from "./apps/WalletConnect"
import TxBuilder from "./apps/TxBuilder"
import PoolTogether from "./apps/PoolTogether"
import GlobalStyles from "./global"

import * as serviceWorker from "./serviceWorker"

ReactDOM.render(
  <>
    <GlobalStyles />
    <Router>
      <Switch>
        <Route path="/compound">
          <Compound />
        </Route>
        <Route path="/tx-builder">
          <TxBuilder />
        </Route>
        <Route path="/walletConnect">
          <WalletConnect />
        </Route>
        <Route path="/poolTogether">
          <PoolTogether />
        </Route>
        <Route
          path="/"
          render={() => {
            return (
              <>
                <div>
                  <Link to="/compound">Compound</Link>
                </div>
                <div>
                  <Link to="/tx-builder">Tx Builder</Link>
                </div>
                <div>
                  <Link to="/walletConnect">Wallet Connect</Link>
                </div>
                <div>
                  <Link to="/poolTogether">PoolTogether</Link>
                </div>
              </>
            )
          }}
        />
      </Switch>
    </Router>
  </>,
  document.getElementById("root")
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
