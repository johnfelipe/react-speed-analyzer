import { baqend, model } from 'baqend'
import { Request, Response } from 'express'
import { bootstrap } from './_compositionRoot'
import { TestParams } from './_TestParams'

const MAX_PUPPETEER_RETRIES = 2;

async function updateWithPuppeteer(
  db: baqend,
  params: TestParams,
  comparison: model.TestOverview,
  retries: number = 0,
): Promise<model.TestOverview> {
  const { comparisonWorker, comparisonFactory, puppeteer } = bootstrap(db)

  try {
    const puppeteerInfo = await puppeteer.analyze(params.url, params.mobile, params.location)
    // Retry Puppeteer analysis if Speed Kit is excepted to be installed but no installation was found.
    if (params.speedKitExpected && !puppeteerInfo.speedKit && retries <= MAX_PUPPETEER_RETRIES) {
      return updateWithPuppeteer(db, params, comparison, retries + 1)
    }

    const updatedComparison = await comparisonFactory.updateComparison(comparison, puppeteerInfo, params)
    comparisonWorker.next(updatedComparison).catch((err) => db.log.error(err.message, err))

    return updatedComparison
  } catch ({ message, stack, status = 500 }) {
    return comparisonFactory.updateComparisonWithError(comparison)
  }
}

/**
 * Baqend code API call.
 */
export async function post(db: baqend, req: Request, res: Response) {
  const { comparisonFactory } = bootstrap(db)

  let withPuppeteer = true
  if (req.body.hasOwnProperty('withPuppeteer')) {
    withPuppeteer = req.body.withPuppeteer
    delete req.body.withPuppeteer
  }

  // Get necessary options
  const params = req.body as TestParams

  const comparison = await comparisonFactory.createComparison(params.url)

  if (withPuppeteer) {
    const updatedComparison = await updateWithPuppeteer(db, params, comparison)

    res.status(200)
    res.send(updatedComparison)
    return
  }

  // async call to update the testOverview with the puppeteer data
  updateWithPuppeteer(db, params, comparison)

  res.status(200)
  res.send(comparison)
}
