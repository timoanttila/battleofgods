import dayjs from 'dayjs'
import {Env, User} from './types'

/**
 * Executes a database query and returns the results.
 * @param env The environment configuration containing the database connection.
 * @param query The SQL query to be executed.
 * @param binds An array of bind parameters for the query (optional).
 * @returns The results of the query as an array.
 */
export const runQuery = async (env: Env, query: string, binds: any[] = []): Promise<any[]> => {
  const statement = env.DB.prepare(query)
  const {results} = binds.length ? await statement.bind(...binds).all() : await statement.all()

  if (Array.isArray(results)) {
    return results
  }
  return []
}

/**
 * Converts a string to a slug by removing non-alphanumeric characters.
 * @param value The input string to be slugified.
 * @returns The slugified string.
 */
export const slugify = (value: string): string => {
  if (!value) return ''
  return value.toLowerCase().replace(/[^a-z0-9-]/gi, '')
}

/**
 * Sanitizes content by removing characters that are not letters or special characters like @, !, ., and :.
 * @param value The input content to be sanitized.
 * @returns The sanitized content.
 */
export const sanitizeContent = (value: string): string => {
  if (!value) return ''
  return value.replace(/[^\w\s@!.:;äÄöÖåÅ]/gi, '')
}

/**
 * Sanitizes a name by removing characters that are not letters or special characters like ä, å, and ö.
 * @param value The input name to be sanitized.
 * @returns The sanitized name.
 */
export const sanitizeName = (value: string) => {
  return value.replace(/[^a-zA-ZäåöÄÅÖ -]/g, '')
}

/**
 * Encrypts a value using AES-GCM encryption with the given passphrase.
 * @param value The value to be encrypted.
 * @param passphrase The passphrase used for encryption.
 * @returns A Promise that resolves to the base64-encoded encrypted value.
 */
export const encrypt = async (value: string, passphrase: string): Promise<string> => {
  // Convert the passphrase to an ArrayBuffer (used for encryption)
  const passphraseBuffer = new TextEncoder().encode(passphrase)

  // Generate a random IV (Initialization Vector)
  const iv = crypto.getRandomValues(new Uint8Array(12))

  // Convert the value to an ArrayBuffer (used for encryption)
  const valueBuffer = new TextEncoder().encode(value)

  // Import the key and encrypt the data
  const key = await crypto.subtle.importKey('raw', passphraseBuffer, 'AES-GCM', false, ['encrypt'])

  const encryptedData = await crypto.subtle.encrypt({name: 'AES-GCM', iv}, key, valueBuffer)

  // Combine IV and encrypted data and return as a base64 string
  const combinedData = new Uint8Array(iv.length + encryptedData.byteLength)
  combinedData.set(iv)
  combinedData.set(new Uint8Array(encryptedData), iv.length)

  return btoa(String.fromCharCode(...combinedData))
}

/**
 * Decrypts a value using AES-GCM decryption with the given passphrase.
 * @param value The base64-encoded encrypted value to be decrypted.
 * @param passphrase The passphrase used for decryption.
 * @returns A Promise that resolves to the decrypted value as a string.
 */
export const decrypt = async (value: string, passphrase: string): Promise<string> => {
  // Convert the passphrase to an ArrayBuffer (used for decryption)
  const passphraseBuffer = new TextEncoder().encode(passphrase)

  // Convert the base64 string back to a Uint8Array
  const combinedData = new Uint8Array(
    atob(value)
      .split('')
      .map(char => char.charCodeAt(0))
  )

  // Extract IV and encrypted data
  const iv = combinedData.slice(0, 12)
  const encryptedData = combinedData.slice(12)

  // Import the key and decrypt the data
  const key = await crypto.subtle.importKey('raw', passphraseBuffer, 'AES-GCM', false, ['decrypt'])

  const decryptedData = await crypto.subtle.decrypt({name: 'AES-GCM', iv}, key, encryptedData)

  // Convert the decrypted data to a string and return
  return new TextDecoder().decode(decryptedData)
}

/**
 * Generates a new UUID (version 4) using the 'uuid' package.
 * @returns A new UUID (version 4) as a string.
 */
export const newId = () => {
  const {v4: uuidv4} = require('uuid')
  const uuid = uuidv4()
  return uuid
}

/**
 * Formats the given date value or the current date into a string with the format 'YYYY-MM-DD HH:mm:ss'.
 * @param value The optional date value to be formatted (defaults to the current date if not provided).
 * @returns A formatted date string in the format 'YYYY-MM-DD HH:mm:ss'.
 */
export const newDate = (value: string | undefined = undefined) => {
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * Updates an existing user or inserts a new user into the database.
 * @param env The environment configuration containing the database connection.
 * @param userUUID The UUID of the user.
 * @param userName The name of the user.
 * @returns A boolean indicating if the user update or insertion was successful.
 */
export const updateUser = async (env: Env, userUUID: string, userName: string): Promise<boolean> => {
  const uuid = slugify(userUUID)
  const name = sanitizeName(userName)
  const date = newDate()

  try {
    //const crypedName = await encrypt(name, env.SECRET_KEY)
    const user: User[] = await runQuery(env, 'SELECT id, userName FROM users WHERE id = ? LIMIT 1', [uuid])

    if (user.length && user[0].id) {
      const oldName = user[0].userName
      if (oldName === name) {
        return true
      }

      await runQuery(env, 'UPDATE users SET userName = ?, updated = ? WHERE id = ? LIMIT 1', [name, date, uuid])
    } else {
      await runQuery(env, 'INSERT INTO users VALUES (?, ?, ?, ?)', [uuid, name, date, date])
    }

    return true
  } catch (error) {
    console.error('Error while updating or inserting user:', error)
    return false
  }
}
