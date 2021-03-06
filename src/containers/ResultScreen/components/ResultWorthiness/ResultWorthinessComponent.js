import React, { Component } from 'react'
import './ResultWorthiness.css'

import { calculateFactor } from 'helper/resultHelper'

import doubleClickLogo from 'assets/doubleClick.png'
import amazonLogo from 'assets/amazon.png'

class ResultWorthinessComponent extends Component {
  render() {
    const competitorData = this.props.competitorTest.firstView
    const speedKitData = this.props.speedKitTest.firstView

    const factor = calculateFactor(competitorData[this.props.mainMetric], speedKitData[this.props.mainMetric])

    const publisherRevenue =
      Math.round(((competitorData[this.props.mainMetric] - speedKitData[this.props.mainMetric]) / (19000 - 5000)) * 100)

    const eCommerceRevenue =
      Math.round((competitorData[this.props.mainMetric]  - speedKitData[this.props.mainMetric]) * 0.01)

    return (
      <div>
        <div className="flex">
          <div className="w-100 text-center mb4 mt4 animated slideInUp">
            <h2 className="dn db-ns mt0" style={{ maxWidth: 768, marginLeft: 'auto', marginRight: 'auto' }}>
              How much is the <span style={{ color: '#F27354' }}>{factor}x</span> performance boost worth?
            </h2>
            <h3 className="dn-ns mt0" style={{ maxWidth: 768, marginLeft: 'auto', marginRight: 'auto' }}>
              How much is the <span style={{ color: '#F27354' }}>{factor}x</span> performance boost worth?
            </h3>
            <h4 className="faded" style={{ maxWidth: 530, margin: '0 auto' }}>
              Here is the impact Google and Amazon research predicts for this uplift.
            </h4>
          </div>
        </div>

        <div className="flex flex-wrap flex-nowrap-ns text-center" style={{ margin: -16 }}>
          <div className="w-100 w-50-ns pr6 pl6 ma2" style={{ padding: '64px 16px', background: '#f8f8f8' }}>
            <h5 className="mt0 mb1">Publishers and Ad-driven Businesses</h5>
            <h2 className="mb0"><span className="lightGreen">+{publisherRevenue}%</span> Revenue</h2>
            <small className="faded">(PLT Original - PLT Speed Kit) / (19000 - 5000)</small>
            <div className="pa1 mt2" style={{ maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>
              <span>
                <a href="https://storage.googleapis.com/doubleclick-prod/documents/The_Need_for_Mobile_Speed_-_FINAL.pdf#page=3"
                  target="_blank" rel="noopener noreferrer">DoubleClick study (p. 3)
                </a> "The Need for Mobile Speed" based on 4,500 real websites
              </span>
            </div>
            <div className="img-container pa1">
              <img src={doubleClickLogo} alt="DoubleClick logo" style={{ maxWidth: '150px'}}/>
            </div>
          </div>
          <div className="w-100 w-50-ns pr6 pl6 ma2" style={{ padding: '64px 32px', background: '#f8f8f8' }}>
            <h5 className="mt0 mb1">E-Commerce</h5>
            <h2 className="mb0"><span className="lightGreen">+{eCommerceRevenue}%</span> Revenue</h2>
            <small className="faded">(PLT Original - PLT Speed Kit) * (1 / 100)</small>
            <div className="pa1 mt2" style={{ maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>
              <span>
                <a href="http://sites.google.com/site/glinden/Home/StanfordDataMining.2006-11-28.ppt?attredirects=0"
                  target="_blank" rel="noopener noreferrer">Amazon study (p. 10)
                </a> "Make Data Useful" using A/B tests on the Amazon shop
              </span>
            </div>
            <div className="img-container pa1">
              <img src={amazonLogo} alt="Amazon logo" style={{ maxWidth: '120px'}}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ResultWorthinessComponent
