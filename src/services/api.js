import { db } from './database';

// ลงทะเบียนผู้ใช้ใหม่
const registerUser = (username, password) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, password],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

// เข้าสู่ระบบ
const loginUser = (username, password) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password],
        (_, result) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0));
          } else {
            reject(new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'));
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

// บันทึกการจอง
const saveBooking = (userId, bookingData) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO bookings 
        (user_id, sport_name, court_name, selected_times, booking_date, status, payment_method, amount) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          bookingData.sport.name,
          bookingData.selectedCourt,
          JSON.stringify(bookingData.selectedTimes),
          new Date().toISOString(),
          'confirmed',
          bookingData.paymentMethod || 'promptpay',
          bookingData.amount
        ],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

// ดึงประวัติการจองของผู้ใช้
const getUserBookings = (userId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM bookings WHERE user_id = ? ORDER BY booking_date DESC',
        [userId],
        (_, result) => {
          const bookings = [];
          for (let i = 0; i < result.rows.length; i++) {
            bookings.push(result.rows.item(i));
          }
          resolve(bookings);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export { registerUser, loginUser, saveBooking, getUserBookings };