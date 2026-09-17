import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  writeBatch 
} from 'firebase/firestore';
import { db } from './firebase';
import { VisitRecord, Medicine, AdminUser, SchoolInfo, RestockLog } from '../types';
import { INITIAL_VISITS, INITIAL_MEDICINES, INITIAL_ADMIN_USERS, SCHOOL_INFO } from '../data/initialData';

const COLLECTIONS = {
  VISITS: 'visits',
  MEDICINES: 'medicines',
  USERS: 'users',
  RESTOCK: 'restock_logs',
  CONFIG: 'config'
};

const DOCS = {
  SCHOOL_INFO: 'school_info',
  SYSTEM_META: 'system_metadata'
};

/**
 * Pembersih objek rekursif untuk menghapus properti dengan nilai `undefined`
 * agar Firestore tidak menolak payload (Firestore melempar error jika ada field undefined).
 */
export const cleanFirestoreData = <T extends Record<string, any>>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  const result: any = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = cleanFirestoreData(value);
      } else if (Array.isArray(value)) {
        result[key] = value.map(item => (typeof item === 'object' && item !== null ? cleanFirestoreData(item) : item));
      } else {
        result[key] = value;
      }
    }
  }
  return result;
};

// ======================= REALTIME SUBSCRIPTIONS =======================

export const subscribeToVisits = (onUpdate: (data: VisitRecord[]) => void, onError?: (error: unknown) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.VISITS), 
    (snapshot) => {
      const records: VisitRecord[] = [];
      snapshot.forEach((d) => {
        records.push({ ...(d.data() as VisitRecord), id: d.id });
      });
      records.sort((a, b) => new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime());
      // Always notify listener with the latest records array (including empty array)
      onUpdate(records);
    },
    (err) => {
      console.warn('Firestore visits subscription error:', err);
      if (onError) onError(err);
    }
  );
};

export const subscribeToMedicines = (onUpdate: (data: Medicine[]) => void, onError?: (error: unknown) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.MEDICINES), 
    (snapshot) => {
      const items: Medicine[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as Medicine), id: d.id });
      });
      // Always notify listener with the latest medicines array (including empty array)
      onUpdate(items);
    },
    (err) => {
      console.warn('Firestore medicines subscription error:', err);
      if (onError) onError(err);
    }
  );
};

export const subscribeToUsers = (onUpdate: (data: AdminUser[]) => void, onError?: (error: unknown) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.USERS), 
    (snapshot) => {
      const users: AdminUser[] = [];
      snapshot.forEach((d) => {
        const u = { ...(d.data() as AdminUser), id: d.id };
        // Exclude legacy/duplicate admin account
        if (u.username?.toLowerCase() !== 'admin' && u.id !== 'usr-admin') {
          users.push(u);
        }
      });
      if (users.length > 0) {
        onUpdate(users);
      }
    },
    (err) => {
      console.warn('Firestore users subscription error:', err);
      if (onError) onError(err);
    }
  );
};

export const subscribeToRestockLogs = (onUpdate: (data: RestockLog[]) => void, onError?: (error: unknown) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.RESTOCK),
    (snapshot) => {
      const logs: RestockLog[] = [];
      snapshot.forEach((d) => {
        logs.push({ ...(d.data() as RestockLog), id: d.id });
      });
      logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onUpdate(logs);
    },
    (err) => {
      console.warn('Firestore restock logs subscription error:', err);
      if (onError) onError(err);
    }
  );
};

export const subscribeToSchoolInfo = (onUpdate: (data: SchoolInfo) => void, onError?: (error: unknown) => void) => {
  return onSnapshot(
    doc(db, COLLECTIONS.CONFIG, DOCS.SCHOOL_INFO), 
    (docSnap) => {
      if (docSnap.exists()) {
        const info = docSnap.data() as SchoolInfo;
        if (info && info.name) {
          onUpdate(info);
        }
      }
    },
    (err) => {
      console.warn('Firestore schoolInfo subscription error:', err);
      if (onError) onError(err);
    }
  );
};

// ======================= CRUD OPERATIONS =======================

// Visits
export const syncSaveVisit = async (visit: VisitRecord) => {
  try {
    const cleanPayload = cleanFirestoreData(visit);
    await setDoc(doc(db, COLLECTIONS.VISITS, visit.id), cleanPayload);
    return { success: true };
  } catch (err) {
    console.error('Failed to sync visit to Firestore:', err);
    return { success: false, error: err };
  }
};

export const syncDeleteVisit = async (visitId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.VISITS, visitId));
    return { success: true };
  } catch (err) {
    console.error('Failed to delete visit from Firestore:', err);
    return { success: false, error: err };
  }
};

// Medicines
export const syncSaveMedicine = async (med: Medicine) => {
  try {
    const cleanPayload = cleanFirestoreData(med);
    await setDoc(doc(db, COLLECTIONS.MEDICINES, med.id), cleanPayload);
    return { success: true };
  } catch (err) {
    console.error('Failed to sync medicine to Firestore:', err);
    return { success: false, error: err };
  }
};

export const syncDeleteMedicine = async (medId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.MEDICINES, medId));
    return { success: true };
  } catch (err) {
    console.error('Failed to delete medicine from Firestore:', err);
    return { success: false, error: err };
  }
};

export const syncReplaceAllMedicines = async (oldMedIds: string[], newMeds: Medicine[]) => {
  try {
    const batch = writeBatch(db);
    oldMedIds.forEach(id => {
      batch.delete(doc(db, COLLECTIONS.MEDICINES, id));
    });
    newMeds.forEach(m => {
      const cleanM = cleanFirestoreData(m);
      batch.set(doc(db, COLLECTIONS.MEDICINES, m.id), cleanM);
    });
    await batch.commit();
    return { success: true };
  } catch (err) {
    console.error('Failed to replace medicines in Firestore:', err);
    return { success: false, error: err };
  }
};

// Restock Logs
export const syncSaveRestockLog = async (log: RestockLog) => {
  try {
    const cleanPayload = cleanFirestoreData(log);
    await setDoc(doc(db, COLLECTIONS.RESTOCK, log.id), cleanPayload);
    return { success: true };
  } catch (err) {
    console.error('Failed to sync restock log to Firestore:', err);
    return { success: false, error: err };
  }
};

// Users
export const syncSaveUser = async (user: AdminUser) => {
  try {
    const userId = user.id || user.username;
    const cleanPayload = cleanFirestoreData({ ...user, id: userId });
    await setDoc(doc(db, COLLECTIONS.USERS, userId), cleanPayload);
    return { success: true };
  } catch (err) {
    console.error('Failed to sync user to Firestore:', err);
    return { success: false, error: err };
  }
};

export const syncDeleteUser = async (userId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
    return { success: true };
  } catch (err) {
    console.error('Failed to delete user from Firestore:', err);
    return { success: false, error: err };
  }
};

// School Info
export const syncSaveSchoolInfo = async (info: SchoolInfo) => {
  try {
    const cleanPayload = cleanFirestoreData(info);
    await setDoc(doc(db, COLLECTIONS.CONFIG, DOCS.SCHOOL_INFO), cleanPayload);
    return { success: true };
  } catch (err) {
    console.error('Failed to sync schoolInfo to Firestore:', err);
    return { success: false, error: err };
  }
};

// ======================= INITIAL SEEDING HELPER =======================

export const seedInitialFirestoreData = async () => {
  try {
    // 1. Clean up legacy/duplicate admin documents if any
    try {
      await deleteDoc(doc(db, COLLECTIONS.USERS, 'usr-admin'));
      await deleteDoc(doc(db, COLLECTIONS.USERS, 'admin'));
    } catch {
      // Ignore if not present
    }

    // 2. Check if Firestore has ALREADY been seeded at least once
    // If already seeded, NEVER re-seed even if collections are empty (e.g. user intentionally deleted all records)
    const metaSnap = await getDoc(doc(db, COLLECTIONS.CONFIG, DOCS.SYSTEM_META));
    if (metaSnap.exists() && metaSnap.data()?.isSeeded) {
      return;
    }

    // First time ever initialization:
    const medSnap = await getDocs(collection(db, COLLECTIONS.MEDICINES));
    if (medSnap.empty) {
      console.log('Seeding initial medicines to Firestore...');
      const batch = writeBatch(db);
      INITIAL_MEDICINES.forEach((m) => {
        batch.set(doc(db, COLLECTIONS.MEDICINES, m.id), m);
      });
      await batch.commit();
    }

    // Visits collection starts clean with actual visits only (no dummy visits seeded)

    // Seed initial users ONLY if users collection is empty
    const userSnap = await getDocs(collection(db, COLLECTIONS.USERS));
    if (userSnap.empty) {
      console.log('Seeding initial users to Firestore...');
      const batch = writeBatch(db);
      INITIAL_ADMIN_USERS.forEach((u) => {
        const uid = u.id || u.username;
        batch.set(doc(db, COLLECTIONS.USERS, uid), { ...u, id: uid });
      });
      await batch.commit();
    }

    // Seed school info ONLY if not exists yet
    const schoolSnap = await getDoc(doc(db, COLLECTIONS.CONFIG, DOCS.SCHOOL_INFO));
    if (!schoolSnap.exists()) {
      await setDoc(doc(db, COLLECTIONS.CONFIG, DOCS.SCHOOL_INFO), SCHOOL_INFO);
    }

    // Mark as seeded in Firestore config so subsequent page refreshes never re-seed
    await setDoc(doc(db, COLLECTIONS.CONFIG, DOCS.SYSTEM_META), {
      isSeeded: true,
      seededAt: new Date().toISOString()
    });

    console.log('Firestore initialization complete!');
  } catch (err) {
    console.warn('Initial seeding skipped or Firestore offline:', err);
  }
};
