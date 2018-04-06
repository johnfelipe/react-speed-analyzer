interface Credentials {
  wpt_dns: string
  wpt_api_key: string
  makefast_ip: string
  app: string
  google_api_key: string
  delete_cronjob_user: string
  delete_cronjob_password: string
}

declare const credentials: Credentials

export default credentials
