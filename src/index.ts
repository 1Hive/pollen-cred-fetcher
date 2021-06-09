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

      const foundAccount = await Account.findOne({ 'identity.id': identity.id })

      if (!foundAccount) {
        Account.create({ 
          'identity.id': identity.id,
          'identity.subtype': identity.subtype,
          'identity.aliases': aliases
        })
      } else if (foundAccount.identity.aliases !== aliases) foundAccount.updateOne({
        'identity.aliases': aliases
      })
      else continue
    }

    console.log(`${Date.now()}: Removing DB entries for accounts that are not longer in the ledger...`)
    const dbAccounts = await Account.find({})
    for (const dbAccount of dbAccounts) {
      if(!accounts.find(account => account.identity.id === dbAccount.identity.id))
        await dbAccount.deleteOne()
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

    console.log(`${Date.now()}: Removing DB entries for participants that are not longer in the credGraph...`)
    const dbParticipants = await CredParticipant.find({})
    for (const dbParticipant of dbParticipants) {
      if(!credParticipants.find(participant => participant.id === dbParticipant.id))
        await dbParticipant.deleteOne()
    }

    console.log(`${Date.now()}: DB entries updated.`)
  } catch (err) {
    console.log(err)
  }
}
