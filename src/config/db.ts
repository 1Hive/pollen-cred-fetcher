import { connect } from 'mongoose'
import { config } from 'dotenv'

config()

export default async function connectDB() {
  try {
    await connect(
      process.env.MONGODB_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
      }
    )
    
    console.log('MongoDB Connected')
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
}
