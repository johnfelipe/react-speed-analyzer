import React, { Component } from 'react'

import { Provider } from 'react-redux'

import createStore from '../store/store'

import './index.css'

import ResultScreen from './screens/ResultScreen/ResultScreen'

const store = createStore()

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div id="wrapper">
          <div id="main">
            <div className="content">
              <ResultScreen { ...this.props } />
            </div>
          </div>
        </div>
      </Provider>
    )
  }
}

export default App
