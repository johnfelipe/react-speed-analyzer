import { baqend, model } from 'baqend'
import { ComparisonListener, ComparisonWorker } from './_ComparisonWorker'
import { ComparisonFactory } from './_ComparisonFactory'
import { updateMultiComparison } from './_updateMultiComparison'

export interface MultiComparisonListener {
  handleMultiComparisonFinished(multiComparison: model.BulkTest): any
}

export class MultiComparisonWorker implements ComparisonListener {
  constructor(
    private db: baqend,
    private comparisonFactory: ComparisonFactory,
    private comparisonWorker: ComparisonWorker,
    private listener?: MultiComparisonListener) {
    this.comparisonWorker.setListener(this)
  }

  setListener(value: MultiComparisonListener) {
    this.listener = value
  }

  async next(multiComparison: model.BulkTest) {
    this.db.log.debug(`MultiComparisonWorker.next("${multiComparison.key}")`)
    try {
      // Ensure multi comparison is loaded with depth 1
      await multiComparison.load({ depth: 1 })

      // Is this multi comparison already finished?
      if (multiComparison.hasFinished || multiComparison.status === 'CANCELED') {
        return
      }

      // Set multi comparison to running
      if (multiComparison.status !== 'RUNNING') {
        await multiComparison.optimisticSave(() => multiComparison.status = 'RUNNING')
      }

      const { testOverviews, runs } = multiComparison

      // Are all comparisons finished?
      const currentComparison = testOverviews[testOverviews.length - 1]
      if (currentComparison && !currentComparison.hasFinished) {
        return
      }

      // Are all planned comparisons finished?
      if (testOverviews.length >= runs) {
        this.db.log.info(`MultiComparison ${multiComparison.key} is finished.`, { multiComparison })
        if (multiComparison.hasFinished) {
          this.db.log.warn(`MultiComparison ${multiComparison.key} was already finished.`, { multiComparison })
          return
        }

        // Save is finished state
        await multiComparison.ready()
        await multiComparison.optimisticSave((it: model.BulkTest) => {
          it.status = 'SUCCESS'
          it.hasFinished = true
        })

        // Inform the listener that this multi comparison has finished
        this.listener && this.listener.handleMultiComparisonFinished(multiComparison)

        return
      }

      // Make the prewarm only on the first run
      const testParams = Object.assign(multiComparison.params, { skipPrewarm: !!currentComparison })

      // Start next comparison
      const comparison = await this.comparisonFactory.create(multiComparison.puppeteer!, testParams, true)
      await multiComparison.ready()
      await multiComparison.optimisticSave((it: model.BulkTest) => {
        it.testOverviews.push(comparison)
      })

      this.comparisonWorker.next(comparison)
    } catch (error) {
      this.db.log.warn(`Error while next iteration`, { id: multiComparison.id, error: error.stack })
    }
  }

  /**
   * Cancels the given multi comparison.
   */
  async cancel(multiComparison: model.BulkTest): Promise<boolean> {
    if (multiComparison.hasFinished || multiComparison.status === 'CANCELED') {
      return false
    }

    for (const comparison of multiComparison.testOverviews) {
      if (!comparison.hasFinished) {
        if (!await this.comparisonWorker.cancel(comparison)) {
          return false
        }
      }
    }

    await multiComparison.optimisticSave(() => multiComparison.status = 'CANCELED')
    return true
  }

  async handleComparisonFinished(comparison: model.TestOverview): Promise<void> {
    const multiComparison = await this.db.BulkTest.find().in('testOverviews', comparison.id).singleResult()
    if (multiComparison) {
      console.log(`Comparison finished: ${comparison.id}`)

      await updateMultiComparison(this.db, multiComparison)

      this.next(multiComparison)
    }
  }
}
