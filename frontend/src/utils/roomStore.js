const ROOMS_KEY = "ora.rooms.v1";
const SESSIONS_KEY = "ora.sessions.v1";
const USER_KEY = "ora.active-user.v1";
const UPDATE_EVENT = "ora-data-update";

const read = (key) => JSON.parse(localStorage.getItem(key) || "[]");
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function notify() {
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeRoomCode(rooms) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  do {
    code = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  } while (rooms.some((room) => room.code === code));
  return code;
}

export function getActiveUser() {
  try { return JSON.parse(sessionStorage.getItem(USER_KEY) || "null"); } catch { return null; }
}

export function saveActiveUser(user) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearActiveUser() {
  sessionStorage.removeItem(USER_KEY);
}

export function createUser({ name, role }) {
  const cleanName = name.trim().replace(/\s+/g, " ");
  const identity = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "voice";
  return { id: `ora-user-${identity}`, name: cleanName, role, activeRoomCode: null };
}

export function createRoom(leader) {
  const rooms = read(ROOMS_KEY);
  const room = {
    id: makeId("room"),
    code: makeRoomCode(rooms),
    leaderId: leader.id,
    leaderName: leader.name,
    createdAt: new Date().toISOString(),
  };
  rooms.unshift(room);
  write(ROOMS_KEY, rooms);
  notify();
  return room;
}

export function getRoom(roomCode) {
  if (!roomCode) return null;
  return read(ROOMS_KEY).find((room) => room.code === roomCode.toUpperCase()) || null;
}

export function getLeaderRoom(leaderId) {
  return read(ROOMS_KEY).find((room) => room.leaderId === leaderId) || null;
}

export function joinRoom(user, roomCode) {
  const room = getRoom(roomCode);
  if (!room) return { room: null, error: "That room code doesn’t exist yet." };
  const updatedUser = { ...user, activeRoomCode: room.code };
  saveActiveUser(updatedUser);
  notify();
  return { room, user: updatedUser, error: "" };
}

export function leaveRoom(user) {
  const updatedUser = { ...user, activeRoomCode: null };
  saveActiveUser(updatedUser);
  notify();
  return updatedUser;
}

export function saveSession(session) {
  const sessions = read(SESSIONS_KEY);
  sessions.unshift(session);
  write(SESSIONS_KEY, sessions);
  notify();
  return session;
}

export function getUserSessions(userId) {
  return read(SESSIONS_KEY).filter((session) => session.userId === userId);
}

export function getRoomSessions(roomCode) {
  return read(SESSIONS_KEY).filter((session) => session.roomCode === roomCode);
}

export function deleteSession(sessionId) {
  const sessions = read(SESSIONS_KEY);
  const session = sessions.find((item) => item.id === sessionId) || null;
  write(SESSIONS_KEY, sessions.filter((item) => item.id !== sessionId));
  notify();
  return session;
}

export function subscribeToStore(onUpdate) {
  const onStorage = (event) => {
    if ([ROOMS_KEY, SESSIONS_KEY].includes(event.key)) onUpdate();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(UPDATE_EVENT, onUpdate);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(UPDATE_EVENT, onUpdate);
  };
}
