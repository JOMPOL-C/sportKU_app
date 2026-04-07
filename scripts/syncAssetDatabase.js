const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const dbPath = path.join(projectRoot, "assets", "SportsCourtDB.db");
const tempDbPath = path.join(projectRoot, "assets", "SportsCourtDB.tmp.db");
const catalogPath = path.join(projectRoot, "src", "data", "sportsCatalog.js");

const timeSlotCatalog = [
  { id: 1, label: "09:00-10:00", startTime: "09:00", endTime: "10:00" },
  { id: 2, label: "10:00-11:00", startTime: "10:00", endTime: "11:00" },
  { id: 3, label: "11:00-12:00", startTime: "11:00", endTime: "12:00" },
  { id: 4, label: "12:00-13:00", startTime: "12:00", endTime: "13:00" },
  { id: 5, label: "13:00-14:00", startTime: "13:00", endTime: "14:00" },
  { id: 6, label: "14:00-15:00", startTime: "14:00", endTime: "15:00" },
  { id: 7, label: "15:00-16:00", startTime: "15:00", endTime: "16:00" },
];

const escapeSql = (value) => String(value).replace(/'/g, "''");

const runSqlOn = (targetPath, sql) =>
  execFileSync("sqlite3", [targetPath, sql], {
    encoding: "utf8",
  });

const getSportsCatalog = () => {
  const source = fs.readFileSync(catalogPath, "utf8");
  const match = source.match(/const sportsCatalog = (\[[\s\S]*?\n\]);/);

  if (!match) {
    throw new Error("Could not parse sportsCatalog.js");
  }

  return Function(`return ${match[1]}`)();
};

const sourceHasTable = (tableName) => {
  const result = runSqlOn(
    dbPath,
    `SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = '${escapeSql(tableName)}';`
  ).trim();

  return result === "1";
};

const initializeFreshDatabase = () => {
  if (fs.existsSync(tempDbPath)) {
    fs.unlinkSync(tempDbPath);
  }

  runSqlOn(
    tempDbPath,
    `
      PRAGMA foreign_keys = ON;

      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        email TEXT,
        phone TEXT
      );

      CREATE TABLE sports (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        price REAL NOT NULL,
        image TEXT
      );

      CREATE TABLE courts (
        id INTEGER PRIMARY KEY,
        sport_id INTEGER NOT NULL,
        court_name TEXT NOT NULL,
        FOREIGN KEY (sport_id) REFERENCES sports (id),
        UNIQUE (sport_id, court_name)
      );

      CREATE TABLE time_slots (
        id INTEGER PRIMARY KEY,
        label TEXT UNIQUE NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL
      );

      CREATE TABLE bookings (
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
      );

      CREATE TABLE booking_time_slots (
        booking_id INTEGER NOT NULL,
        time_slot_id INTEGER NOT NULL,
        PRIMARY KEY (booking_id, time_slot_id),
        FOREIGN KEY (booking_id) REFERENCES bookings (id),
        FOREIGN KEY (time_slot_id) REFERENCES time_slots (id)
      );

      CREATE INDEX idx_courts_sport_id ON courts (sport_id);
      CREATE INDEX idx_bookings_user_id ON bookings (user_id);
      CREATE INDEX idx_bookings_lookup ON bookings (booking_day, sport_id, court_id);
      CREATE INDEX idx_booking_time_slots_booking_id ON booking_time_slots (booking_id);
    `
  );
};

const seedSportsAndCourts = (sportsCatalog) => {
  sportsCatalog.forEach((sport) => {
    runSqlOn(
      tempDbPath,
      `
        INSERT INTO sports (id, name, type, price, image)
        VALUES (${sport.id}, '${escapeSql(sport.name)}', '${escapeSql(sport.type)}', ${Number(
          sport.price
        )}, '${escapeSql(sport.image)}');
      `
    );

    for (let index = 0; index < sport.courts; index += 1) {
      const courtId = sport.id * 100 + index + 1;
      const courtName = `สนาม ${index + 1}`;

      runSqlOn(
        tempDbPath,
        `
          INSERT INTO courts (id, sport_id, court_name)
          VALUES (${courtId}, ${sport.id}, '${escapeSql(courtName)}');
        `
      );
    }
  });
};

const seedTimeSlots = () => {
  timeSlotCatalog.forEach((slot) => {
    runSqlOn(
      tempDbPath,
      `
        INSERT INTO time_slots (id, label, start_time, end_time)
        VALUES (${slot.id}, '${slot.label}', '${slot.startTime}', '${slot.endTime}');
      `
    );
  });
};

const copyUsers = () => {
  runSqlOn(
    tempDbPath,
    `
      ATTACH DATABASE '${escapeSql(dbPath)}' AS source_db;

      INSERT INTO users (id, username, password, name, email, phone)
      SELECT id, username, password, name, email, phone
      FROM source_db.users;

      DETACH DATABASE source_db;
    `
  );
};

const copyBookings = () => {
  runSqlOn(
    tempDbPath,
    `
      ATTACH DATABASE '${escapeSql(dbPath)}' AS source_db;

      INSERT INTO bookings (
        id,
        user_id,
        sport_id,
        court_id,
        sport_name,
        court_name,
        selected_times,
        booking_day,
        booking_date,
        status,
        payment_method,
        amount
      )
      SELECT
        b.id,
        b.user_id,
        (
          SELECT s.id
          FROM sports s
          WHERE s.name = b.sport_name
          LIMIT 1
        ) AS sport_id,
        (
          SELECT c.id
          FROM courts c
          WHERE c.sport_id = (
            SELECT s.id
            FROM sports s
            WHERE s.name = b.sport_name
            LIMIT 1
          )
            AND c.court_name = b.court_name
          LIMIT 1
        ) AS court_id,
        b.sport_name,
        b.court_name,
        b.selected_times,
        substr(b.booking_date, 1, 10) AS booking_day,
        b.booking_date,
        b.status,
        b.payment_method,
        b.amount
      FROM source_db.bookings b;

      DETACH DATABASE source_db;
    `
  );
};

const copyBookingTimeSlots = () => {
  if (!sourceHasTable("booking_time_slots")) {
    return;
  }

  runSqlOn(
    tempDbPath,
    `
      ATTACH DATABASE '${escapeSql(dbPath)}' AS source_db;

      INSERT OR IGNORE INTO booking_time_slots (booking_id, time_slot_id)
      SELECT booking_id, time_slot_id
      FROM source_db.booking_time_slots;

      DETACH DATABASE source_db;
    `
  );
};

const replaceDatabaseFile = () => {
  fs.renameSync(tempDbPath, dbPath);
};

const main = () => {
  const sportsCatalog = getSportsCatalog();
  initializeFreshDatabase();
  seedSportsAndCourts(sportsCatalog);
  seedTimeSlots();
  copyUsers();
  copyBookings();
  copyBookingTimeSlots();
  replaceDatabaseFile();
  console.log("Synced assets/SportsCourtDB.db");
};

main();
