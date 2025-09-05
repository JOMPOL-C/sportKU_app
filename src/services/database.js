import SQLite from 'react-native-sqlite-storage';

// แก้ไขการเปิด connection สำหรับ Android
const db = SQLite.openDatabase(
  {
    name: 'SportsCourtDB.db',
    createFromLocation: 1,
    location: 'default'
  },
  () => console.log('Database connected'),
  error => console.error('Database error', error)
);

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // สร้างตาราง users
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT,
          email TEXT,
          phone TEXT
        )`,
        [],
        () => console.log('Users table checked/created'),
        (_, error) => {
          console.error('Error with users table', error);
          reject(error);
        }
      );

      // สร้างตาราง bookings
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          sport_name TEXT NOT NULL,
          court_name TEXT NOT NULL,
          selected_times TEXT NOT NULL,
          booking_date TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          payment_method TEXT,
          amount REAL,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )`,
        [],
        () => {
          console.log('Bookings table checked/created');
          resolve();
        },
        (_, error) => {
          console.error('Error with bookings table', error);
          reject(error);
        }
      );
    });
  });
};

export { db, initializeDatabase };