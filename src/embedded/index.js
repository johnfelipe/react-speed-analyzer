import React from 'react'
import ReactDOM from 'react-dom'
import Result from './Result'

import 'promise-polyfill'
import 'whatwg-fetch'

window.speedKitAnalyzer = {
  renderTestResult: (testId) => {
    ReactDOM.render(<Result testId={testId} />, document.getElementById('speed-kit-analyzer'))
  }
}

// window.speedKitAnalyzer.renderTestResult('gaNDEbalibaba')
