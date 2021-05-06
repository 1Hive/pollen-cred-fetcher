import { CronJob } from 'cron'

import fetchPollenData from './utils'
import connectDB from './config/db'

import Account from './models/Account'
import CredParticipant from './models/CredParticipant'

const main = async () => {
  await connectDB()

  const pollenUpdateJob = new CronJob(
    // start: true, runOnInit: true
    "0 */6 * * *", () => updatePollenData(), null, true, null, null, true
  )
}

main()

const updatePollenData = async () => {
  try {
    console.log(`${Date.now()}: Fetching data...`)
    const pollenData = await fetchPollenData()
    const { accounts, credParticipants } = pollenData

    console.log(`${Date.now()}: Updating DB entries for ledger accounts...`)
    for (const account of accounts) {
      const { identity } = account
      const aliases = identity.aliases.map(alias => alias.address)

      await Account.findOneAndUpdate(
        { 'identity.id': identity.id },
        { 
          'identity.subtype': identity.subtype,
          'identity.aliases': aliases
        },
        { upsert: true }
      )
    }

    console.log(`${Date.now()}: Updating DB entries for credgraph participants...`)
    for (const participant of credParticipants) {
      if (participant.cred < 1) continue
      const { credPerInterval, cred, id } = participant

      await CredParticipant.findOneAndUpdate(
        { id },
        {
          cred,
          credPerInterval: credPerInterval.slice(-2)
        },
        { upsert: true }
      )
    }

    console.log(`${Date.now()}: DB entries updated.`)
  } catch (err) {
    console.log(err)
  }
}
