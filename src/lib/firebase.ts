import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

let _db: Firestore

export function getDb(): Firestore {
  if (_db) return _db

  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Missing Firebase credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables."
      )
    }

    const serviceAccount: ServiceAccount = { projectId, clientEmail, privateKey }
    initializeApp({ credential: cert(serviceAccount) })
  }

  _db = getFirestore()
  return _db
}

// Lazy proxy that defers initialization until first property access
export const db: Firestore = new Proxy({} as Firestore, {
  get(_target, prop, receiver) {
    const instance = getDb()
    const value = Reflect.get(instance, prop, instance)
    if (typeof value === "function") {
      return value.bind(instance)
    }
    return value
  },
})
