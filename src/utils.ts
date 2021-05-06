import { sourcecred } from 'sourcecred'
import { config } from 'dotenv'
import fetch from 'node-fetch'

import { PollenData } from './types'

config()

const loadLedger = async (): Promise<any> => {
  try {
    const ledgerFileURI = process.env.REPO_AND_BRANCH + 'data/ledger.json'
    const ledgerFileResponse = await fetch(ledgerFileURI);

    if (!ledgerFileResponse.ok)
      throw new Error(`An error has occurred: ${ledgerFileResponse.status}`)

    const ledgerRaw = await ledgerFileResponse.text()
    return sourcecred.ledger.ledger.Ledger.parse(ledgerRaw)
  } catch (err) {
    console.log(err)
    return null
  }
}

const loadCredGraph = async (): Promise<any> => {
  try {
    const instance = sourcecred.instance.readInstance.getNetworkReadInstance(
      process.env.REPO_AND_BRANCH
    )
    return instance.readCredGraph()
  } catch (err) {
    console.log(err)
    return null
  }
}

export default async function fetchPollenData(): Promise<PollenData> {
  const ledger = await loadLedger()
  const accounts = ledger.accounts()

  const credGraph = await loadCredGraph()
  const credParticipants = Array.from(credGraph.participants())

  return { accounts, credParticipants }
}
