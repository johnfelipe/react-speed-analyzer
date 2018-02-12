import React, { Component } from 'react'
import PropTypes from 'prop-types'

import styles from './ResultScreen.css'

import Result from '../../../components/ResultScreen/Result/Result'

class ResultScreenComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showDetails: props.showDetails,
      showConfig: props.showConfig,
      showAdvancedConfig: props.showAdvancedConfig,
      showModal: false,
      isIFrame: props.isIFrame,
    }
  }

  toggleDetails = () => {
    this.setState({ showDetails: !this.state.showDetails })
  }

  toggleConfig = () => {
    this.setState({ showConfig: !this.state.showConfig })
  }

  toggleModal = () => {
    this.setState({ showModal: !this.state.showModal })
  }

  closeModal = () => {
    this.setState({ showModal: false })
  }

  renderResults() {
    // const competitorData = this.props.competitorTest.firstView
    // const speedKitData = this.props.speedKitTest.firstView
    const { competitorError } = this.props.result
    // const speedKitError = this.props.speedKitError
    // console.log(this.props.competitorTest)
    // const competitorData = null
    // const speedKitData = null
    // const competitorError = true
    // const speedKitError = true

    return (
      <div className={`flex-grow-1 ${styles.results}`}>
        { !competitorError && (
          <div className="container pv2 pa2-ns">
            <div className="box-shadow results__box" style={{ marginTop: '-96px' }}>
              <Result { ...this.props } />
            </div>
          </div>
        )}
      </div>
    )
  }

  render() {
    const { competitorError } = this.props.result
    return (
      <div className="flex results__wrapper pt7">
        <div className="flex-grow-1 flex flex-column">
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
