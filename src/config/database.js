import * as SQLite from 'expo-sqlite';

let db = null;

export const initDatabase = async () => {
  db = await SQLite.openDatabaseAsync('niloufer_kmc.db');

  // Create tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS babies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      uhid TEXT UNIQUE NOT NULL,
      bedNo TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS parents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      motherName TEXT NOT NULL,
      mobile TEXT UNIQUE NOT NULL,
      pin TEXT NOT NULL,
      babyId INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (babyId) REFERENCES babies(id)
    );

    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      isAdmin INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parentId INTEGER NOT NULL,
      babyId INTEGER,
      startTime TEXT NOT NULL,
      endTime TEXT,
      duration INTEGER DEFAULT 0,
      isActive INTEGER DEFAULT 1,
      FOREIGN KEY (parentId) REFERENCES parents(id),
      FOREIGN KEY (babyId) REFERENCES babies(id)
    );
  `);

  // Create default admin if not exists
  const existingAdmin = await db.getFirstAsync(
    'SELECT * FROM staff WHERE username = ?',
    ['admin']
  );

  if (!existingAdmin) {
    await db.runAsync(
      'INSERT INTO staff (name, username, password, isAdmin) VALUES (?, ?, ?, ?)',
      ['Administrator', 'admin', 'admin123', 1]
    );
  }

  return db;
};

export const getDatabase = () => db;

// Parent operations
export const loginParent = async (mobile, pin) => {
  const parent = await db.getFirstAsync(
    'SELECT * FROM parents WHERE mobile = ? AND pin = ?',
    [mobile, pin]
  );
  if (!parent) throw new Error('Invalid mobile number or PIN');
  return parent;
};

export const getParentsByBabyId = async (babyId) => {
  return await db.getAllAsync(
    'SELECT * FROM parents WHERE babyId = ?',
    [babyId]
  );
};

export const addParent = async (motherName, mobile, pin, babyId) => {
  const existing = await db.getFirstAsync(
    'SELECT * FROM parents WHERE mobile = ?',
    [mobile]
  );
  if (existing) throw new Error('Mobile number already registered');

  const result = await db.runAsync(
    'INSERT INTO parents (motherName, mobile, pin, babyId) VALUES (?, ?, ?, ?)',
    [motherName, mobile, pin, babyId]
  );
  return { id: result.lastInsertRowId, motherName, mobile, pin, babyId };
};

// Staff operations
export const loginStaff = async (username, password) => {
  const staff = await db.getFirstAsync(
    'SELECT * FROM staff WHERE username = ? AND password = ?',
    [username.toLowerCase(), password]
  );
  if (!staff) throw new Error('Invalid username or password');
  return staff;
};

export const addStaff = async (name, username, password, isAdmin) => {
  const existing = await db.getFirstAsync(
    'SELECT * FROM staff WHERE username = ?',
    [username.toLowerCase()]
  );
  if (existing) throw new Error('Username already taken');

  const result = await db.runAsync(
    'INSERT INTO staff (name, username, password, isAdmin) VALUES (?, ?, ?, ?)',
    [name, username.toLowerCase(), password, isAdmin ? 1 : 0]
  );
  return { id: result.lastInsertRowId, name, username, isAdmin };
};

// Baby operations
export const getAllBabies = async () => {
  return await db.getAllAsync('SELECT * FROM babies ORDER BY name');
};

export const getBabyById = async (id) => {
  return await db.getFirstAsync('SELECT * FROM babies WHERE id = ?', [id]);
};

export const addBaby = async (name, uhid, bedNo) => {
  const existing = await db.getFirstAsync(
    'SELECT * FROM babies WHERE uhid = ?',
    [uhid]
  );
  if (existing) throw new Error('Baby with this UHID already exists');

  const result = await db.runAsync(
    'INSERT INTO babies (name, uhid, bedNo) VALUES (?, ?, ?)',
    [name, uhid, bedNo || null]
  );
  return { id: result.lastInsertRowId, name, uhid, bedNo };
};

// Session operations
export const startSession = async (parentId, babyId) => {
  const startTime = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO sessions (parentId, babyId, startTime, isActive) VALUES (?, ?, ?, 1)',
    [parentId, babyId, startTime]
  );
  return { id: result.lastInsertRowId, parentId, babyId, startTime, isActive: true };
};

export const stopSession = async (sessionId, duration) => {
  const endTime = new Date().toISOString();
  await db.runAsync(
    'UPDATE sessions SET endTime = ?, duration = ?, isActive = 0 WHERE id = ?',
    [endTime, duration, sessionId]
  );
};

export const getActiveSession = async (parentId) => {
  return await db.getFirstAsync(
    'SELECT * FROM sessions WHERE parentId = ? AND isActive = 1',
    [parentId]
  );
};

export const getSessionsByParent = async (parentId) => {
  return await db.getAllAsync(
    'SELECT * FROM sessions WHERE parentId = ? AND isActive = 0 ORDER BY startTime DESC',
    [parentId]
  );
};

export const getSessionsByBaby = async (babyId) => {
  return await db.getAllAsync(
    'SELECT * FROM sessions WHERE babyId = ? AND isActive = 0 ORDER BY startTime DESC',
    [babyId]
  );
};

export const getTodaySessionsByParent = async (parentId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  return await db.getAllAsync(
    'SELECT * FROM sessions WHERE parentId = ? AND startTime >= ? AND isActive = 0',
    [parentId, todayStr]
  );
};

export const getWeekSessionsByParent = async (parentId) => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(today.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString();

  return await db.getAllAsync(
    'SELECT * FROM sessions WHERE parentId = ? AND startTime >= ? AND isActive = 0',
    [parentId, weekStartStr]
  );
};

export const getTodaySessionsByBaby = async (babyId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  return await db.getAllAsync(
    'SELECT * FROM sessions WHERE babyId = ? AND startTime >= ? AND isActive = 0',
    [babyId, todayStr]
  );
};

export const getWeekSessionsByBaby = async (babyId) => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(today.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString();

  return await db.getAllAsync(
    'SELECT * FROM sessions WHERE babyId = ? AND startTime >= ? AND isActive = 0',
    [babyId, weekStartStr]
  );
};
