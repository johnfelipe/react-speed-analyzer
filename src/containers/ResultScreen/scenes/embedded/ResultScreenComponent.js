import React, { Component } from 'react'

import styles from './ResultScreen.css'

import ConfigForm from 'components/ConfigForm/ConfigForm'

import Result from 'containers/ResultScreen/components/Result/Result'
import ResultAction from '../../components/ResultAction/ResultAction'

class ResultScreenComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showDetails: props.showDetails,
      showConfig: props.showConfig,
      showAdvancedConfig: props.showAdvancedConfig,
      isIFrame: props.isIFrame,
    }
  }

  toggleDetails = () => {
    this.setState({ showDetails: !this.state.showDetails })
  }

  toggleConfig = () => {
    this.setState({ showConfig: !this.state.showConfig })
  }

  renderForm() {
    return (
      <div className="container pa2">
        <div className="mb1">
          <ConfigForm
            config={this.props.config}
            showConfig={this.state.showConfig}
            showAdvancedConfig={this.state.showAdvancedConfig}
            onSubmit={this.props.onSubmit}
          />
        </div>
      </div>
    )
  }

  renderResults() {
    const { competitorError } = this.props.result

    return (
      <div className={`flex-grow-1 ${styles.results}`}>
        <div className="container pv2 pa2-ns">
          <div className="box-shadow results__box" style={{ marginTop: '-96px' }}>
            {!competitorError && (
              <Result { ...this.props } />
            )}
          </div>
        </div>

        <div className="container pa2 pt0 pt2-ns pb4 pb6-ns animated slideInUp">
          <ResultAction { ...this.props }/>
        </div>
      </div>
    )
  }

  render() {
    const { competitorError } = this.props.result
    return (
      <div className="flex results__wrapper pt7">
        <div className="flex-grow-1 flex flex-column">
          {this.props.showInput && this.renderForm()}
          <div className="flex-grow-1 flex flex-column results" style={{marginTop: competitorError ? 0 : 80, animationDelay: '0.6s', transition: 'margin 0.5s ease' }}>
            {this.props.result.isFinished && this.renderResults()}
          </div>
        </div>
      </div>
    )
  }
}

ResultScreenComponent.propTypes = {
  // mainMetric: PropTypes.string,
  // speedKitError: PropTypes.bool.isRequired,
  // onSubmit: PropTypes.func.isRequired,
}

export default ResultScreenComponent
