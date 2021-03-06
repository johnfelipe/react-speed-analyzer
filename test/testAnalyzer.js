const fetch = require('node-fetch')
const assert = require('assert')
const analyzerAPIUrl = 'https://makefast.app.baqend.com/v1'
const analyzerCodeUrl = `${analyzerAPIUrl}/code`

/**
 * @param {string} siteUrl
 * @param {*} expectedParams
 * @return {Promise<void>}
 */
async function testAnalyzer(siteUrl, expectedParams) {
  const comparisonBody = {
    url: siteUrl,
    location: 'eu-central-1-docker:Chrome.Native',
    mobile: false,
    speedKitConfig: expectedParams.speedKitConfig,
    withPuppeteer: false,
  }

  const startComparisonResponse = await post(`${analyzerCodeUrl}/startComparison`, JSON.stringify(comparisonBody))
  const startComparison = await getResponse(startComparisonResponse, '“startComparison” module')

  writeln('Waiting for Results')
  await waitAndReport(240)

  const comparisonResponse = await fetch(`${analyzerAPIUrl}${startComparison.id}`)
  const comparison = await getResponse(comparisonResponse, 'Comparison')

  // Test analyzeUrl params
  checkPuppeteerResult(comparison, expectedParams)
  writeln('Puppeteer result OK')

  //Test the params to start the test with
  checkTestParams(comparison, expectedParams)
  writeln('Test params OK')

  // Test config analysis if available
  if (expectedParams.configAnalysis) {
    checkConfigAnalysis(comparison, expectedParams)
    writeln('Config analysis OK')
  }

  const ctID = comparison.competitorTestResult
  const skID = comparison.speedKitTestResult

  const ctTestResponse = await fetch(`${analyzerAPIUrl}${ctID}`)
  const ctTest = await getResponse(ctTestResponse, 'Competitor Test')

  const skTestResponse = await fetch(`${analyzerAPIUrl}${skID}`)
  const skTest = await getResponse(skTestResponse, 'Speed Kit Test')

  checkTestResult(ctTest, false)
  writeln('Competitor Test OK')

  checkTestResult(skTest, true)
  writeln('Speed Kit Test OK')

  process.stdout.write(`Test Successful. Speedup: ${(ctTest.firstView.speedIndex - skTest.firstView.speedIndex)}ms SI -- ${(ctTest.firstView.firstMeaningfulPaint - skTest.firstView.firstMeaningfulPaint)}ms FMP\n`)
}

/**
 * @param {string} string
 */
function writeln(string) {
  process.stderr.write(`${string}\n`)
}

/**
 * @param {number} time
 */
async function waitAndReport(time) {
  for (let i = 0; i < time; i += 10) {
    writeln(`${time - i}s to go`)
    await new Promise(resolve => setTimeout(resolve, 10000))
  }
}

/**
 * @param {string} msg
 * @param err
 */
function reportError(msg, err) {
  process.stdout.write(`${msg}\n`)
  throw new Error(msg, err)
}

/**
 * @param {Response} response
 * @param {string} name
 */
async function getResponse(response, name) {
  if (!response.ok) {
    reportError(`${name} request failed with status ${response.status} ${response.statusText}.`)
  }

  const json = await response.json()
  writeln(`${name} response OK`)

  return json
}

function checkPuppeteerResult(result, expectedResult) {
  try {
    assert.strictEqual(result.url, expectedResult.url, 'Attribute "url" not matching')
    assert.strictEqual(result.displayUrl, expectedResult.displayUrl, 'Attribute "displayUrl" not matching')
    assert.strictEqual(result.type, expectedResult.type, 'Attribute "type" not matching')
    assert.strictEqual(result.isSecured, expectedResult.isSecured, 'Attribute "isSecured" not matching')
  } catch (err) {
    writeln(err)
    reportError(`Puppeteer Analysis not valid. ID: ${result.id}`, err)
  }
}

function checkTestParams(result, expectedResult) {
  try {
    if (expectedResult.speedKitConfig) {
      assert.equal(result.speedKitConfig, expectedResult.speedKitConfig, 'Attribute "speedKitConfig" not matching')
    }

    assert.strictEqual(result.mobile, expectedResult.mobile, 'Attribute "mobile" not matching')
    assert.strictEqual(result.isSpeedKitComparison, expectedResult.isSpeedKitComparison, 'Attribute "isSpeedKitComparison" not matching')
    assert.strictEqual(result.speedKitVersion, expectedResult.speedKitVersion, 'Attribute "speedKitVersion" not matching')
  } catch (err) {
    writeln(err)
    reportError(`Test params not valid. ID: ${result.id}`, err)
  }
}

function checkConfigAnalysis(result, expectedResult) {
  try{
    assert.strictEqual(result.configAnalysis.configMissing, expectedResult.configAnalysis.configMissing, 'Attribute "configMissing" not matching')
    assert.strictEqual(result.configAnalysis.swPath, expectedResult.configAnalysis.swPath, 'Attribute "swPath" not matching')
    assert.strictEqual(result.configAnalysis.isDisabled, expectedResult.configAnalysis.isDisabled, 'Attribute "isDisabled" not matching')
    assert.strictEqual(result.configAnalysis.swPathMatches, expectedResult.configAnalysis.swPathMatches, 'Attribute "swPathMatching" not matching')
  } catch(err) {
    writeln(err)
    reportError(`Config analysis not valid. ID: ${result.id}`, err)
  }
}

/**
 * @param {*} result
 * @param {boolean} speedKit
 */
function checkTestResult(result, speedKit) {
  try {
    assert.ok(result.firstView, 'First View missing')
    assert.ok(result.firstView.speedIndex, 'Speed Index missing')
    assert.ok(result.firstView.firstMeaningfulPaint, 'First Meaningful Paint missing')
    assert.ok(result.url, 'Url missing')
    assert.ok(result.summaryUrl, 'Summary Link missing')
    assert.ok(result.videoFileFirstView, 'Video File missing')
    assert.ok(!result.testDataMissing, 'Test Data missing')
    assert.ok(result.hasFinished, 'Test not finished')
    assert.ok(!result.isWordPress, 'Testpage wrongly categoriezed as WordPress')
    assert.strictEqual(0, result.priority, 'Priority not 0')
  } catch(err) {
    writeln(err)
    reportError(`Test result for ${speedKit? 'Speed Kit' : 'Competitor'} not valid. ID: ${result.id}`, err)
  }
}

/**
 * @param {string} url
 * @param {*} body
 * @return {Promise<Response>}
 */
async function post(url, body) {
  const headers = {}
  headers['content-type'] = 'application/json; charset=UTF-8'

  return fetch(url, { method: 'POST', headers, body})
}

async function executeAnalyzerTest() {
  try {
    writeln('Testing kicker.de (no Speed Kit installed)')
    await execNonSpeedKit()
    writeln('Testing fussballdaten.de (with Speed Kit installed)')
    await execSpeedKit()
  } catch(err) {
    writeln(err.stack)
    process.exit(1)
  }
}

async function execNonSpeedKit() {
  const url = 'kicker.de'
  const speedKitConfigString = '{"appName": "makefast", "whitelist": [{ "host": [ /.*kicker\\.de/ ] }], "userAgentDetection": false }'
  const expectedParams = {
    url: 'http://www.kicker.de/',
    displayUrl: 'http://www.kicker.de/',
    mobile: false,
    isSpeedKitComparison: false,
    speedKitVersion: null,
    speedKitConfig: speedKitConfigString,
    configAnalysis: null,
    isSecured: false,
    type: null
  }

  return testAnalyzer(url, expectedParams)
}

async function execSpeedKit() {
  const url = 'https://www.fussballdaten.de/bundesliga/ewige-tabelle/'
  const expectedParams = {
    url: 'https://www.fussballdaten.de/bundesliga/ewige-tabelle/',
    displayUrl: 'https://www.fussballdaten.de/bundesliga/ewige-tabelle/',
    mobile: false,
    isSpeedKitComparison: true,
    speedKitVersion: '1.6.0',
    speedKitConfig: null,
    configAnalysis: {
      configMissing: false,
      swPath: 'https://www.fussballdaten.de/sw.js',
      swPathMatches: true,
      isDisabled: false
    },
    isSecured: true,
    type: null
  }

  return testAnalyzer(url, expectedParams)
}

executeAnalyzerTest().catch(console.error)
