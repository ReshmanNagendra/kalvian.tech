
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

/**
 * Example abstraction for Firestore interactions.
 * In a full production app, you will replace your LocalStorage logic inside SnippetVault
 * with these helper functions to sync data across devices.
 */

// SNIPPETS API
export async function saveSnippetToCloud(userId, snippetData) {
  if (!userId) throw new Error('User must be logged in to save snippets remotely.')
  
  try {
    const docRef = await addDoc(collection(db, 'snippets'), {
      ...snippetData,
      ownerId: userId,
      createdAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error("Error adding snippet to cloud:", error)
    throw error
  }
}

export async function fetchUserSnippets(userId) {
  try {
    const snippetsRef = collection(db, 'snippets')
    const q = query(snippetsRef, where('ownerId', '==', userId))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error("Error fetching user snippets:", error)
    throw error
  }
}
