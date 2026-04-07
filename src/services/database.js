import {
  importDatabaseFromAssetAsync,
  openDatabaseSync,
} from 'expo-sqlite';
import sportsCatalog from '../data/sportsCatalog';

const DATABASE_NAME = 'SportsCourtDB.db';
const DATABASE_ASSET = require('../../assets/SportsCourtDB.db');

const timeSlotCatalog = [
  { id: 1, label: '09:00-10:00', startTime: '09:00', endTime: '10:00' },
  { id: 2, label: '10:00-11:00', startTime: '10:00', endTime: '11:00' },
  { id: 3, label: '11:00-12:00', startTime: '11:00', endTime: '12:00' },
  { id: 4, label: '12:00-13:00', startTime: '12:00', endTime: '13:00' },
  { id: 5, label: '13:00-14:00', startTime: '13:00', endTime: '14:00' },
  { id: 6, label: '14:00-15:00', startTime: '14:00', endTime: '15:00' },
  { id: 7, label: '15:00-16:00', startTime: '15:00', endTime: '16:00' },
];

let nativeDb = null;
let initializationPromise = null;

const createRows = (items) => ({
  length: items.length,
  item: (index) => items[index] ?? null,
  _array: items,
});

const isReadQuery = (sql) => {
  const normalized = sql.trim().replace(/\s+/g, ' ').toUpperCase();

  if (
    normalized.startsWith('SELECT') ||
    normalized.startsWith('WITH') ||
    normalized.startsWith('EXPLAIN')
  ) {
    return true;
  }

  if (normalized.startsWith('PRAGMA')) {
    return !normalized.includes('=');
  }

  return false;
};

const getNativeDb = () => {
  if (!nativeDb) {
    nativeDb = openDatabaseSync(DATABASE_NAME);
    nativeDb.execSync('PRAGMA foreign_keys = ON');
  }

  return nativeDb;
};

const normalizeParams = (params) => (Array.isArray(params) ? params : []);

const createTransaction = (sqliteDb) => ({
  executeSql(sql, params = [], success, error) {
    try {
      const queryParams = normalizeParams(params);
      let result;

      if (isReadQuery(sql)) {
        const rows = sqliteDb.getAllSync(sql, queryParams);
        result = {
          rows: createRows(rows),
          rowsAffected: 0,
          insertId: undefined,
        };
      } else {
        const runResult = sqliteDb.runSync(sql, queryParams);
        result = {
          rows: createRows([]),
          rowsAffected: runResult.changes ?? 0,
          insertId: runResult.lastInsertRowId ?? undefined,
        };
      }

      if (typeof success === 'function') {
        success(this, result);
      }

      return result;
    } catch (dbError) {
      if (typeof error === 'function') {
        const handled = error(this, dbError);

        if (handled === false) {
          return null;
        }
      }

      throw dbError;
    }
  },
});

const db = {
  transaction(transactionCallback, errorCallback, successCallback) {
    const sqliteDb = getNativeDb();
    const tx = createTransaction(sqliteDb);

    try {
      sqliteDb.execSync('BEGIN');
      transactionCallback(tx);
      sqliteDb.execSync('COMMIT');

      if (typeof successCallback === 'function') {
        successCallback();
      }
    } catch (error) {
      try {
        sqliteDb.execSync('ROLLBACK');
      } catch (rollbackError) {
        console.error('Failed to rollback database transaction', rollbackError);
      }

      if (typeof errorCallback === 'function') {
        errorCallback(error);
        return;
      }

      throw error;
    }
  },
};

const seedSports = (tx) => {
  sportsCatalog.forEach((sport) => {
    tx.executeSql(
      `INSERT OR IGNORE INTO sports (id, name, type, price, image)
       VALUES (?, ?, ?, ?, ?)`,
      [sport.id, sport.name, sport.type, sport.price, sport.image]
    );

    tx.executeSql(
      `UPDATE sports
       SET name = ?, type = ?, price = ?, image = ?
       WHERE id = ?`,
      [sport.name, sport.type, sport.price, sport.image, sport.id]
    );
  });
};

const seedCourts = (tx) => {
  sportsCatalog.forEach((sport) => {
    for (let index = 0; index < sport.courts; index += 1) {
      const courtId = sport.id * 100 + index + 1;
      const courtName = `สนาม ${index + 1}`;

      tx.executeSql(
        `INSERT OR IGNORE INTO courts (id, sport_id, court_name)
         VALUES (?, ?, ?)`,
        [courtId, sport.id, courtName]
      );

      tx.executeSql(
        `UPDATE courts
         SET court_name = ?
         WHERE id = ?`,
        [courtName, courtId]
      );
    }
  });
};

const seedTimeSlots = (tx) => {
  timeSlotCatalog.forEach((slot) => {
    tx.executeSql(
      `INSERT OR IGNORE INTO time_slots (id, label, start_time, end_time)
       VALUES (?, ?, ?, ?)`,
      [slot.id, slot.label, slot.startTime, slot.endTime]
    );

    tx.executeSql(
      `UPDATE time_slots
       SET label = ?, start_time = ?, end_time = ?
       WHERE id = ?`,
      [slot.label, slot.startTime, slot.endTime, slot.id]
    );
  });
};

const ensureBookingColumns = (tx) => {
  tx.executeSql(
    'PRAGMA table_info(bookings)',
    [],
    (_, result) => {
      const existingColumns = [];

      for (let index = 0; index < result.rows.length; index += 1) {
        existingColumns.push(result.rows.item(index).name);
      }

      if (!existingColumns.includes('sport_id')) {
        tx.executeSql('ALTER TABLE bookings ADD COLUMN sport_id INTEGER');
      }

      if (!existingColumns.includes('court_id')) {
        tx.executeSql('ALTER TABLE bookings ADD COLUMN court_id INTEGER');
      }

      if (!existingColumns.includes('booking_day')) {
        tx.executeSql('ALTER TABLE bookings ADD COLUMN booking_day TEXT');
      }
    },
    (_, error) => {
      console.error('Error checking bookings columns', error);
      return false;
    }
  );
};

const initializeDatabase = async () => {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    await importDatabaseFromAssetAsync(DATABASE_NAME, {
      assetId: DATABASE_ASSET,
    });

    db.transaction(
      (tx) => {
        tx.executeSql('PRAGMA foreign_keys = ON');

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT,
            email TEXT,
            phone TEXT
          )`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS sports (
            id INTEGER PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            type TEXT NOT NULL,
            price REAL NOT NULL,
            image TEXT
          )`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS courts (
            id INTEGER PRIMARY KEY,
            sport_id INTEGER NOT NULL,
            court_name TEXT NOT NULL,
            FOREIGN KEY (sport_id) REFERENCES sports (id),
            UNIQUE (sport_id, court_name)
          )`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS time_slots (
            id INTEGER PRIMARY KEY,
            label TEXT UNIQUE NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL
          )`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            sport_id INTEGER,
            court_id INTEGER,
            sport_name TEXT NOT NULL,
            court_name TEXT NOT NULL,
            selected_times TEXT NOT NULL,
            booking_day TEXT,
            booking_date TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            payment_method TEXT,
            amount REAL,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (sport_id) REFERENCES sports (id),
            FOREIGN KEY (court_id) REFERENCES courts (id)
          )`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS booking_time_slots (
            booking_id INTEGER NOT NULL,
            time_slot_id INTEGER NOT NULL,
            PRIMARY KEY (booking_id, time_slot_id),
            FOREIGN KEY (booking_id) REFERENCES bookings (id),
            FOREIGN KEY (time_slot_id) REFERENCES time_slots (id)
          )`
        );

        ensureBookingColumns(tx);
      },
      (error) => {
        console.error('Error creating base schema', error);
        throw error;
      }
    );

    db.transaction(
      (tx) => {
        tx.executeSql('PRAGMA foreign_keys = ON');

        tx.executeSql(
          'CREATE INDEX IF NOT EXISTS idx_courts_sport_id ON courts (sport_id)'
        );
        tx.executeSql(
          'CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings (user_id)'
        );
        tx.executeSql(
          'CREATE INDEX IF NOT EXISTS idx_bookings_lookup ON bookings (booking_day, sport_id, court_id)'
        );
        tx.executeSql(
          'CREATE INDEX IF NOT EXISTS idx_booking_time_slots_booking_id ON booking_time_slots (booking_id)'
        );

        seedSports(tx);
        seedCourts(tx);
        seedTimeSlots(tx);

        tx.executeSql(
          `UPDATE bookings
           SET booking_day = COALESCE(booking_day, substr(booking_date, 1, 10))
           WHERE booking_date IS NOT NULL`
        );

        tx.executeSql(
          `UPDATE bookings
           SET sport_id = (
             SELECT id FROM sports WHERE sports.name = bookings.sport_name LIMIT 1
           )
           WHERE sport_id IS NULL AND sport_name IS NOT NULL`
        );

        tx.executeSql(
          `UPDATE bookings
           SET court_id = (
             SELECT courts.id
             FROM courts
             WHERE courts.sport_id = bookings.sport_id
               AND courts.court_name = bookings.court_name
             LIMIT 1
           )
           WHERE court_id IS NULL AND court_name IS NOT NULL AND sport_id IS NOT NULL`
        );
      },
      (error) => {
        console.error('Error seeding relational data', error);
        throw error;
      }
    );

    console.log('Database initialized with expo-sqlite');
  })();

  try {
    await initializationPromise;
  } catch (error) {
    initializationPromise = null;
    throw error;
  }
};

export { db, initializeDatabase };
