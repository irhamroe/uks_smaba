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
import { VisitRecord, Medicine, AdminUser, SchoolInfo, UksBed } from '../types';
import { INITIAL_VISITS, INITIAL_MEDICINES, INITIAL_ADMIN_USERS, INITIAL_BEDS, SCHOOL_INFO } from '../data/initialData';

const COLLECTIONS = {
  VISITS: 'visits',
  MEDICINES: 'medicines',
  USERS: 'users',
  BEDS: 'beds',
  CONFIG: 'config'
};

const DOCS = {
  SCHOOL_INFO: 'school_info',
  SYSTEM_META: 'system_metadata'
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
      records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      // Always notify listener with the latest records array (including empty array)
      onUpdate(records);
    },
    (err) => {
      console.warn('Firestore visits subscription error (using local state):', err);
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
      console.warn('Firestore medicines subscription error (using local state):', err);
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
      console.warn('Firestore users subscription error (using local state):', err);
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
      console.warn('Firestore schoolInfo subscription error (using local state):', err);
      if (onError) onError(err);
    }
  );
};

export const subscribeToBeds = (onUpdate: (data: UksBed[]) => void, onError?: (error: unknown) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.BEDS), 
    (snapshot) => {
      const beds: UksBed[] = [];
      snapshot.forEach((d) => {
        beds.push({ ...(d.data() as UksBed), id: d.id });
      });
      // Always notify listener with the latest beds array (including empty array)
      onUpdate(beds);
    },
    (err) => {
      console.warn('Firestore beds subscription error (using local state):', err);
      if (onError) onError(err);
    }
  );
};

// ======================= CRUD OPERATIONS =======================

// Visits
export const syncSaveVisit = async (visit: VisitRecord) => {
  try {
    await setDoc(doc(db, COLLECTIONS.VISITS, visit.id), visit);
  } catch (err) {
    console.error('Failed to sync visit to Firestore:', err);
  }
};

export const syncDeleteVisit = async (visitId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.VISITS, visitId));
  } catch (err) {
    console.error('Failed to delete visit from Firestore:', err);
  }
};

// Medicines
export const syncSaveMedicine = async (med: Medicine) => {
  try {
    await setDoc(doc(db, COLLECTIONS.MEDICINES, med.id), med);
  } catch (err) {
    console.error('Failed to sync medicine to Firestore:', err);
  }
};

export const syncDeleteMedicine = async (medId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.MEDICINES, medId));
  } catch (err) {
    console.error('Failed to delete medicine from Firestore:', err);
  }
};

export const syncReplaceAllMedicines = async (oldMedIds: string[], newMeds: Medicine[]) => {
  try {
    const batch = writeBatch(db);
    oldMedIds.forEach(id => {
      batch.delete(doc(db, COLLECTIONS.MEDICINES, id));
    });
    newMeds.forEach(m => {
      batch.set(doc(db, COLLECTIONS.MEDICINES, m.id), m);
    });
    await batch.commit();
  } catch (err) {
    console.error('Failed to replace medicines in Firestore:', err);
  }
};

// Users
export const syncSaveUser = async (user: AdminUser) => {
  try {
    const userId = user.id || user.username;
    await setDoc(doc(db, COLLECTIONS.USERS, userId), { ...user, id: userId });
  } catch (err) {
    console.error('Failed to sync user to Firestore:', err);
  }
};

export const syncDeleteUser = async (userId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
  } catch (err) {
    console.error('Failed to delete user from Firestore:', err);
  }
};

// School Info
export const syncSaveSchoolInfo = async (info: SchoolInfo) => {
  try {
    await setDoc(doc(db, COLLECTIONS.CONFIG, DOCS.SCHOOL_INFO), info);
  } catch (err) {
    console.error('Failed to sync schoolInfo to Firestore:', err);
  }
};

// Beds
export const syncSaveBed = async (bed: UksBed) => {
  try {
    await setDoc(doc(db, COLLECTIONS.BEDS, bed.id), bed);
  } catch (err) {
    console.error('Failed to sync bed to Firestore:', err);
  }
};

export const syncDeleteBed = async (bedId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.BEDS, bedId));
  } catch (err) {
    console.error('Failed to delete bed from Firestore:', err);
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

    const visitSnap = await getDocs(collection(db, COLLECTIONS.VISITS));
    if (visitSnap.empty) {
      console.log('Seeding initial visits to Firestore...');
      const batch = writeBatch(db);
      INITIAL_VISITS.forEach((v) => {
        batch.set(doc(db, COLLECTIONS.VISITS, v.id), v);
      });
      await batch.commit();
    }

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

    const bedSnap = await getDocs(collection(db, COLLECTIONS.BEDS));
    if (bedSnap.empty) {
      console.log('Seeding initial beds to Firestore...');
      const batch = writeBatch(db);
      INITIAL_BEDS.forEach((b) => {
        batch.set(doc(db, COLLECTIONS.BEDS, b.id), b);
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
