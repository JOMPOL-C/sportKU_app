const express = require("express");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;
const DATABASE_PATH = path.resolve(__dirname, "../../assets/SportsCourtDB.db");

const sportsCatalog = [
  { id: 1, name: "ฟุตบอล", type: "ทีม", price: 500, courts: 3, image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80" },
  { id: 2, name: "บาสเก็ตบอล", type: "ทีม", price: 450, courts: 2, image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80" },
  { id: 3, name: "เทนนิส", type: "เดี่ยว", price: 400, courts: 8, image: "https://images.unsplash.com/photo-1622279457486-28f5917f4539?auto=format&fit=crop&w=900&q=80" },
  { id: 4, name: "แบดมินตัน", type: "เดี่ยว", price: 300, courts: 6, image: "https://images.unsplash.com/photo-1613918431703-aa508b38f11d?auto=format&fit=crop&w=900&q=80" },
  { id: 5, name: "วอลเลย์บอล", type: "ทีม", price: 350, courts: 2, image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=900&q=80" },
  { id: 6, name: "ฟุตซอล", type: "ทีม", price: 450, courts: 2, image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80" },
  { id: 7, name: "ปิงปอง", type: "เดี่ยว", price: 200, courts: 5, image: "https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=900&q=80" },
  { id: 8, name: "สควอช", type: "เดี่ยว", price: 380, courts: 2, image: "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=900&q=80" },
];

const timeSlotCatalog = [
  { id: 1, label: "09:00-10:00", startTime: "09:00", endTime: "10:00" },
  { id: 2, label: "10:00-11:00", startTime: "10:00", endTime: "11:00" },
  { id: 3, label: "11:00-12:00", startTime: "11:00", endTime: "12:00" },
  { id: 4, label: "12:00-13:00", startTime: "12:00", endTime: "13:00" },
  { id: 5, label: "13:00-14:00", startTime: "13:00", endTime: "14:00" },
  { id: 6, label: "14:00-15:00", startTime: "14:00", endTime: "15:00" },
  { id: 7, label: "15:00-16:00", startTime: "15:00", endTime: "16:00" },
];

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(DATABASE_PATH);

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function handleRun(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({
        lastID: this.lastID,
        changes: this.changes,
      });
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row || null);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows || []);
    });
  });

const formatBookingDay = (value = new Date()) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const timeToMinutes = (value) => {
  const [hour, minute] = String(value).split(":").map(Number);
  return (hour || 0) * 60 + (minute || 0);
};

const toTimeSlot = (slot) => {
  if (!slot) {
    return null;
  }

  if (typeof slot === "string") {
    const [start, end] = slot.split("-");

    if (!start || !end) {
      return null;
    }

    return {
      id: null,
      label: slot,
      start,
      end,
      startMinutes: timeToMinutes(start),
      endMinutes: timeToMinutes(end),
    };
  }

  const label =
    slot.label ||
    `${slot.start_time || slot.startTime || ""}-${slot.end_time || slot.endTime || ""}`;
  const start = slot.start_time || slot.startTime || label.split("-")[0];
  const end = slot.end_time || slot.endTime || label.split("-")[1];

  if (!start || !end) {
    return null;
  }

  return {
    id: slot.id ? Number(slot.id) : null,
    label,
    start,
    end,
    startMinutes: timeToMinutes(start),
    endMinutes: timeToMinutes(end),
  };
};

const normalizeTimeSlots = (slots) => {
  if (!Array.isArray(slots)) {
    return [];
  }

  return slots
    .map(toTimeSlot)
    .filter((slot) => slot && slot.endMinutes > slot.startMinutes)
    .sort((left, right) => left.startMinutes - right.startMinutes);
};

const mergeTimeSlots = (slots) => {
  const normalizedSlots = normalizeTimeSlots(slots);

  if (normalizedSlots.length === 0) {
    return [];
  }

  return normalizedSlots.reduce((mergedSlots, slot) => {
    const previousSlot = mergedSlots[mergedSlots.length - 1];

    if (!previousSlot) {
      return [slot];
    }

    if (slot.startMinutes <= previousSlot.endMinutes) {
      const nextEndMinutes = Math.max(previousSlot.endMinutes, slot.endMinutes);
      const nextEnd = nextEndMinutes === previousSlot.endMinutes ? previousSlot.end : slot.end;

      mergedSlots[mergedSlots.length - 1] = {
        ...previousSlot,
        end: nextEnd,
        endMinutes: nextEndMinutes,
        label: `${previousSlot.start}-${nextEnd}`,
      };
      return mergedSlots;
    }

    return [...mergedSlots, slot];
  }, []);
};

const getSelectedTimeLabels = (slots) => mergeTimeSlots(slots).map((slot) => slot.label);

const hasTimeConflict = (existingSlots, requestedSlots) => {
  const normalizedExistingSlots = normalizeTimeSlots(existingSlots);
  const normalizedRequestedSlots = normalizeTimeSlots(requestedSlots);

  return normalizedExistingSlots.some((existing) =>
    normalizedRequestedSlots.some(
      (requested) =>
        requested.startMinutes < existing.endMinutes &&
        existing.startMinutes < requested.endMinutes
    )
  );
};

const parseStoredTimeSlots = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const initializeDatabase = async () => {
  await run("PRAGMA foreign_keys = ON");

  await run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      email TEXT,
      phone TEXT
    )`
  );

  await run(
    `CREATE TABLE IF NOT EXISTS sports (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT
    )`
  );

  await run(
    `CREATE TABLE IF NOT EXISTS courts (
      id INTEGER PRIMARY KEY,
      sport_id INTEGER NOT NULL,
      court_name TEXT NOT NULL,
      FOREIGN KEY (sport_id) REFERENCES sports (id),
      UNIQUE (sport_id, court_name)
    )`
  );

  await run(
    `CREATE TABLE IF NOT EXISTS time_slots (
      id INTEGER PRIMARY KEY,
      label TEXT UNIQUE NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL
    )`
  );

  await run(
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

  await run(
    `CREATE TABLE IF NOT EXISTS booking_time_slots (
      booking_id INTEGER NOT NULL,
      time_slot_id INTEGER NOT NULL,
      PRIMARY KEY (booking_id, time_slot_id),
      FOREIGN KEY (booking_id) REFERENCES bookings (id),
      FOREIGN KEY (time_slot_id) REFERENCES time_slots (id)
    )`
  );

  await run("CREATE INDEX IF NOT EXISTS idx_courts_sport_id ON courts (sport_id)");
  await run("CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings (user_id)");
  await run(
    "CREATE INDEX IF NOT EXISTS idx_bookings_lookup ON bookings (booking_day, sport_id, court_id)"
  );
  await run(
    "CREATE INDEX IF NOT EXISTS idx_booking_time_slots_booking_id ON booking_time_slots (booking_id)"
  );

  for (const sport of sportsCatalog) {
    await run(
      `INSERT OR IGNORE INTO sports (id, name, type, price, image)
       VALUES (?, ?, ?, ?, ?)`,
      [sport.id, sport.name, sport.type, sport.price, sport.image]
    );

    await run(
      `UPDATE sports
       SET name = ?, type = ?, price = ?, image = ?
       WHERE id = ?`,
      [sport.name, sport.type, sport.price, sport.image, sport.id]
    );

    for (let index = 0; index < sport.courts; index += 1) {
      const courtId = sport.id * 100 + index + 1;
      const courtName = `สนาม ${index + 1}`;

      await run(
        `INSERT OR IGNORE INTO courts (id, sport_id, court_name)
         VALUES (?, ?, ?)`,
        [courtId, sport.id, courtName]
      );

      await run(
        `UPDATE courts
         SET court_name = ?
         WHERE id = ?`,
        [courtName, courtId]
      );
    }
  }

  for (const slot of timeSlotCatalog) {
    await run(
      `INSERT OR IGNORE INTO time_slots (id, label, start_time, end_time)
       VALUES (?, ?, ?, ?)`,
      [slot.id, slot.label, slot.startTime, slot.endTime]
    );

    await run(
      `UPDATE time_slots
       SET label = ?, start_time = ?, end_time = ?
       WHERE id = ?`,
      [slot.label, slot.startTime, slot.endTime, slot.id]
    );
  }

  await run(
    `UPDATE bookings
     SET booking_day = COALESCE(booking_day, substr(booking_date, 1, 10))
     WHERE booking_date IS NOT NULL`
  );

  await run(
    `UPDATE bookings
     SET sport_id = (
       SELECT id FROM sports WHERE sports.name = bookings.sport_name LIMIT 1
     )
     WHERE sport_id IS NULL AND sport_name IS NOT NULL`
  );

  await run(
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
};

app.get("/health", async (req, res) => {
  try {
    const stats = await get(
      `SELECT
         (SELECT COUNT(*) FROM users) AS user_count,
         (SELECT COUNT(*) FROM bookings) AS booking_count`
    );
    res.json({ ok: true, databasePath: DATABASE_PATH, ...stats });
  } catch (error) {
    res.status(500).json({ message: "ไม่สามารถเช็กสถานะระบบได้" });
  }
});

app.post("/auth/register", async (req, res) => {
  const {
    username = "",
    password = "",
    firstName = "",
    lastName = "",
    email = "",
    phone = "",
  } = req.body || {};

  const trimmedUsername = String(username).trim();
  const trimmedPassword = String(password).trim();
  const fullName = [String(firstName).trim(), String(lastName).trim()]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (!trimmedUsername || !trimmedPassword) {
    res.status(400).json({ message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" });
    return;
  }

  try {
    const result = await run(
      "INSERT INTO users (username, password, name, email, phone) VALUES (?, ?, ?, ?, ?)",
      [
        trimmedUsername,
        trimmedPassword,
        fullName || null,
        String(email).trim() || null,
        String(phone).trim() || null,
      ]
    );

    const user = await get(
      "SELECT id, username, name, email, phone FROM users WHERE id = ?",
      [result.lastID]
    );

    res.status(201).json(user);
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) {
      res.status(409).json({ message: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" });
      return;
    }

    res.status(500).json({ message: "ไม่สามารถลงทะเบียนผู้ใช้ได้" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { username = "", password = "" } = req.body || {};

  try {
    const user = await get(
      `SELECT id, username, name, email, phone
       FROM users
       WHERE username = ? AND password = ?`,
      [String(username).trim(), String(password).trim()]
    );

    if (!user) {
      res.status(401).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "ไม่สามารถเข้าสู่ระบบได้" });
  }
});

app.get("/sports", async (req, res) => {
  const search = String(req.query.name || "").trim();

  try {
    const rows = await all(
      `SELECT s.id, s.name, s.type, s.price, s.image, COUNT(c.id) AS courts
       FROM sports s
       LEFT JOIN courts c ON c.sport_id = s.id
       WHERE ? = '' OR s.name LIKE ?
       GROUP BY s.id, s.name, s.type, s.price, s.image
       ORDER BY s.id`,
      [search, `%${search}%`]
    );

    res.json(rows.map((sport) => ({ ...sport, courts: Number(sport.courts) || 0 })));
  } catch (error) {
    res.status(500).json({ message: "ไม่สามารถโหลดข้อมูลกีฬาได้" });
  }
});

app.get("/popular-sports", async (req, res) => {
  const limit = Number(req.query.limit) || 4;

  try {
    const rows = await all(
      `SELECT
         s.id,
         s.name,
         s.type,
         s.price,
         s.image,
         COUNT(DISTINCT c.id) AS courts,
         COUNT(DISTINCT b.id) AS booking_count
       FROM bookings b
       INNER JOIN sports s ON s.id = b.sport_id
       LEFT JOIN courts c ON c.sport_id = s.id
       GROUP BY s.id, s.name, s.type, s.price, s.image
       ORDER BY booking_count DESC, s.id ASC
       LIMIT ?`,
      [limit]
    );

    res.json(
      rows.map((sport) => ({
        ...sport,
        courts: Number(sport.courts) || 0,
        bookingCount: Number(sport.booking_count) || 0,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "ไม่สามารถโหลดกีฬายอดนิยมได้" });
  }
});

app.get("/sports/:sportId/courts", async (req, res) => {
  try {
    const rows = await all(
      `SELECT id, sport_id, court_name
       FROM courts
       WHERE sport_id = ?
       ORDER BY id`,
      [req.params.sportId]
    );

    res.json(
      rows.map((court) => ({
        id: court.id,
        sportId: court.sport_id,
        name: court.court_name,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "ไม่สามารถโหลดข้อมูลสนามได้" });
  }
});

app.get("/time-slots", async (req, res) => {
  try {
    const rows = await all(
      `SELECT id, label, start_time, end_time
       FROM time_slots
       ORDER BY start_time`
    );

    res.json(
      rows.map((slot) => ({
        id: slot.id,
        label: slot.label,
        startTime: slot.start_time,
        endTime: slot.end_time,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "ไม่สามารถโหลดช่วงเวลาได้" });
  }
});

app.get("/bookings/booked-slots", async (req, res) => {
  const bookingDay = req.query.bookingDay || formatBookingDay();
  const sportId = Number(req.query.sportId) || null;
  const sportName = String(req.query.sportName || "").trim();
  const courtId = Number(req.query.courtId) || null;
  const courtName = String(req.query.courtName || "").trim();

  if (!sportId || !courtId) {
    res.json([]);
    return;
  }

  try {
    const rows = await all(
      `SELECT selected_times
       FROM bookings
       WHERE booking_day = ?
         AND (
           (sport_id = ? AND court_id = ?)
           OR (sport_name = ? AND court_name = ?)
         )`,
      [bookingDay, sportId, courtId, sportName, courtName]
    );

    const bookedSlots = rows.flatMap((booking) => parseStoredTimeSlots(booking.selected_times));
    res.json(bookedSlots);
  } catch (error) {
    res.status(500).json({ message: "ไม่สามารถโหลดช่วงเวลาที่ถูกจองได้" });
  }
});

app.post("/bookings", async (req, res) => {
  const {
    userId,
    sport = {},
    selectedCourt = null,
    selectedTimes = [],
    amount = 0,
    paymentMethod = "promptpay",
    bookingDate,
    bookingDay,
  } = req.body || {};

  const resolvedBookingDate = bookingDate ? new Date(bookingDate) : new Date();
  const resolvedBookingDay = bookingDay || formatBookingDay(resolvedBookingDate);
  const requestedSlots = normalizeTimeSlots(selectedTimes);
  const selectedTimeLabels = getSelectedTimeLabels(selectedTimes);
  const sportId = sport?.id ?? null;
  const sportName = sport?.name || "ไม่ระบุกีฬา";
  const courtId = selectedCourt?.id ?? null;
  const courtName = selectedCourt?.name || selectedCourt?.court_name || selectedCourt || "ไม่ระบุ";

  if (!userId) {
    res.status(400).json({ message: "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่" });
    return;
  }

  if (!sportId || !courtId) {
    res.status(400).json({ message: "ไม่พบข้อมูลกีฬา หรือสนามที่ต้องการจอง" });
    return;
  }

  if (requestedSlots.length === 0) {
    res.status(400).json({ message: "กรุณาเลือกช่วงเวลาก่อนทำรายการ" });
    return;
  }

  try {
    const existingBookings = await all(
      `SELECT selected_times
       FROM bookings
       WHERE booking_day = ?
         AND (
           (sport_id = ? AND court_id = ?)
           OR (sport_name = ? AND court_name = ?)
         )`,
      [resolvedBookingDay, sportId, courtId, sportName, courtName]
    );

    const conflictFound = existingBookings.some((booking) =>
      hasTimeConflict(parseStoredTimeSlots(booking.selected_times), requestedSlots)
    );

    if (conflictFound) {
      res.status(409).json({ message: "ช่วงเวลานี้ถูกจองไปแล้ว กรุณาเลือกเวลาใหม่" });
      return;
    }

    const insertResult = await run(
      `INSERT INTO bookings
       (user_id, sport_id, court_id, sport_name, court_name, selected_times, booking_day, booking_date, status, payment_method, amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        sportId,
        courtId,
        sportName,
        courtName,
        JSON.stringify(selectedTimeLabels),
        resolvedBookingDay,
        resolvedBookingDate.toISOString(),
        "confirmed",
        paymentMethod,
        amount,
      ]
    );

    for (const slot of requestedSlots.filter((item) => item.id)) {
      await run(
        "INSERT OR IGNORE INTO booking_time_slots (booking_id, time_slot_id) VALUES (?, ?)",
        [insertResult.lastID, slot.id]
      );
    }

    const booking = await get("SELECT * FROM bookings WHERE id = ?", [insertResult.lastID]);
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "ไม่สามารถบันทึกข้อมูลการจองได้" });
  }
});

app.get("/users/:userId/bookings", async (req, res) => {
  try {
    const rows = await all(
      `SELECT
         b.*,
         COALESCE(s.name, b.sport_name) AS display_sport_name,
         COALESCE(c.court_name, b.court_name) AS display_court_name
       FROM bookings b
       LEFT JOIN sports s ON s.id = b.sport_id
       LEFT JOIN courts c ON c.id = b.court_id
       WHERE b.user_id = ?
       ORDER BY b.booking_date DESC`,
      [req.params.userId]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "ไม่สามารถโหลดประวัติการจองได้" });
  }
});

app.get("/debug/bookings", async (req, res) => {
  try {
    const rows = await all(
      `SELECT
         b.id,
         b.user_id,
         b.sport_name,
         b.court_name,
         b.selected_times,
         b.booking_date,
         b.status,
         u.username
       FROM bookings b
       LEFT JOIN users u ON u.id = b.user_id
       ORDER BY b.booking_date DESC, b.id DESC`
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "ไม่สามารถอ่านรายการจองได้" });
  }
});

app.delete("/debug/bookings", async (req, res) => {
  try {
    await run("DELETE FROM booking_time_slots");
    const result = await run("DELETE FROM bookings");
    res.json({ success: true, deleted: result.changes || 0 });
  } catch (error) {
    res.status(500).json({ message: "ไม่สามารถล้างข้อมูลจองได้" });
  }
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API พร้อมใช้งานที่ http://localhost:${PORT}`);
      console.log(`SQLite backend: ${DATABASE_PATH}`);
    });
  })
  .catch((error) => {
    console.error("ไม่สามารถเริ่ม backend ได้", error);
    process.exit(1);
  });
