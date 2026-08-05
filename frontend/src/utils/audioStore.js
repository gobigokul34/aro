const DATABASE_NAME = "ora-session-audio";
const STORE_NAME = "recordings";

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getStore(mode) {
  return openDatabase().then((database) => ({
    database,
    store: database.transaction(STORE_NAME, mode).objectStore(STORE_NAME),
  }));
}

export async function saveAudioBlob(blob) {
  if (!blob || !window.indexedDB) return null;
  const audioKey = `audio-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const { database, store } = await getStore("readwrite");

  return new Promise((resolve, reject) => {
    const request = store.put(blob, audioKey);
    request.onsuccess = () => { database.close(); resolve(audioKey); };
    request.onerror = () => { database.close(); reject(request.error); };
  });
}

export async function getAudioBlob(audioKey) {
  if (!audioKey || !window.indexedDB) return null;
  const { database, store } = await getStore("readonly");

  return new Promise((resolve, reject) => {
    const request = store.get(audioKey);
    request.onsuccess = () => { database.close(); resolve(request.result || null); };
    request.onerror = () => { database.close(); reject(request.error); };
  });
}

export async function deleteAudioBlob(audioKey) {
  if (!audioKey || !window.indexedDB) return;
  const { database, store } = await getStore("readwrite");

  return new Promise((resolve, reject) => {
    const request = store.delete(audioKey);
    request.onsuccess = () => { database.close(); resolve(); };
    request.onerror = () => { database.close(); reject(request.error); };
  });
}
