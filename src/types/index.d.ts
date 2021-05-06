import { Document } from 'mongoose'

export type PollenData = {
  accounts: any,
  credParticipants: any
}

export interface ICredParticipant extends Document {
  credPerInterval: number[],
  cred: number,
  id: string
}

export interface IAccount extends Document {
  identity: {
    id: string,
    subtype: string,
    aliases: string[]
  }
}