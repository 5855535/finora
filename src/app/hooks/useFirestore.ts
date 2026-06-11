import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "./useAuth";

export function useFirestore(collectionName: string) {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, collectionName),
      where("userId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setData(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error en ${collectionName}:`, err);
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user, collectionName]);

  const addItem = async (newItem: any) => {
    if (!user) return false;
    try {
      await addDoc(collection(db, collectionName), {
        ...newItem,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      });
      return true;
    } catch (err: any) {
      console.error("Error adding:", err);
      alert("Error al guardar: " + err.message);
      return false;
    }
  };

  const updateItem = async (id: string, updatedData: any) => {
    if (!user) return false;
    try {
      await updateDoc(doc(db, collectionName, id), updatedData);
      return true;
    } catch (err: any) {
      console.error("Error updating:", err);
      alert("Error al actualizar: " + err.message);
      return false;
    }
  };

  const deleteItem = async (id: string) => {
    if (!user) return false;
    try {
      await deleteDoc(doc(db, collectionName, id));
      return true;
    } catch (err: any) {
      console.error("Error deleting:", err);
      alert("Error al eliminar: " + err.message);
      return false;
    }
  };

  return { data, loading, error, addItem, updateItem, deleteItem };
}
