import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync.js'

const adapter = new FileSync('.data/db.json')
export const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
db.defaults({ entries: [] }).write()
