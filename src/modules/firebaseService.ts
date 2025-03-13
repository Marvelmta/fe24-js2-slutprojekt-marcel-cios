import { db } from "./firebaseConfig";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

export class FirebaseService {
  static async fetchCollection(collectionName: string): Promise<any[]> {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  static async addDocument(collectionName: string, data: any) {
    await addDoc(collection(db, collectionName), data);
  }

  static async updateDocument(collectionName: string, id: string, data: any) {
    const documentRef = doc(db, collectionName, id);
    await updateDoc(documentRef, data);
  }

  static async deleteDocument(collectionName: string, id: string) {
    const documentRef = doc(db, collectionName, id);
    await deleteDoc(documentRef);
  }
}
