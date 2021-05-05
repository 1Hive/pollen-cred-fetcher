import fetchPollenData from './utils'

const updatePollenData = async () => {
  try {
    const pollenData = await fetchPollenData()
    console.log(pollenData)

  } catch (err) {
    console.log(err)
  }
}

updatePollenData()