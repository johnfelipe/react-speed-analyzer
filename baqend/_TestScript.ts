/**
 * Crates a test script.
 *
 * @return
 */
export function testScript(): TestScript {
  return new TestScript()
}

/**
 * TestScript abstraction class
 */
export class TestScript {
  private lines: string[]

  constructor() {
    this.lines = []
  }

  /**
   * Dump the script as string.
   */
  toString(): string {
    return this.lines.join('\n')
  }

  /**
   * Sets the blockDomains in the script.
   *
   * @return This is a chainable method.
   */
  blockDomains(...domains: string[]): this {
    if (domains.length) {
      return this.push(`blockDomains ${domains.join(' ')}`)
    }

    return this
  }

  /**
   * Sets the setActivityTimeout in the script.
   *
   * @param seconds The timeout value in seconds.
   * @return This is a chainable method.
   */
  setActivityTimeout(seconds: number): this {
    return this.push(`setActivityTimeout ${seconds}`)
  }

  /**
   * Sets the setTimeout in the script.
   *
   * @param seconds The timeout value in seconds.
   * @return This is a chainable method.
   */
  setTimeout(seconds: number): this {
    return this.push(`setTimeout ${seconds}`)
  }

  /**
   * Sets the viewport size of the captured screen.
   * @param {number} width The width of the viewport.
   * @param {number} height The height of the viewport.
   * @return {this} This is a chainable method.
   */
  setViewport(width: number, height: number) {
    return this.push(`setViewportSize ${width} ${height}`)
  }

  /**
   * Sets the navigate in the script.
   *
   * @return This is a chainable method.
   */
  navigate(url: string): this {
    return this.push(`navigate ${url}`)
  }

  /**
   * Sets the exec in the script.
   *
   * @param jsCode The JavaScript code to execute in the browser.
   * @return This is a chainable method.
   */
  exec(jsCode: string): this {
    return this.push(`exec ${jsCode}`)
  }

  /**
   * Sets the logData in the script.
   *
   * @return This is a chainable method.
   */
  logData(value: boolean): this {
    return this.push(`logData ${value ? 1 : 0}`)
  }

  /**
   * Sets the setDns in the script.
   *
   * @param hostname  The hostname to change the DNS of.
   * @param ip        The new IP to resolve to.
   * @return This is a chainable method.
   */
  setDns(hostname: string, ip: string): this {
    return this.push(`setDns ${hostname} ${ip}`)
  }

  /**
   * Sleeps for the given amount of seconds
   *
   * @param seconds The sleep time to pause the test in seconds.
   * @return This is a chainable method.
   */
  sleep(seconds: number): this {
    return this.push(`sleep ${seconds}`)
  }

  private push(line: string): this {
    this.lines.push(line)
    return this
  }
}
