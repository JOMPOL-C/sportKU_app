const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// เปิดใช้งาน CORS
app.use(cors());
app.use(express.json());

// ข้อมูลกีฬา
let sports = [
  { 
    id: 1, 
    name: "ฟุตบอล",
    type: "ทีม", 
    price: 50, 
    courts: 3,
    image: "https://media.licdn.com/dms/image/v2/D4E12AQFjprt14-A0oQ/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1697467310224?e=2147483647&v=beta&t=FtaAaBl1FAks_3dVMCfMCusX4tKcz38YvR-l6ZcgExs"
  },
  { 
    id: 2, 
    name: "บาสเก็ตบอล", 
    type: "ทีม", 
    price: 50, 
    courts: 2,
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  { 
    id: 3, 
    name: "เทนนิส", 
    type: "เดี่ยว", 
    price: 50, 
    courts: 8,
    image: "https://www.pngarts.com/files/5/Tennis-PNG-Picture.png"
  },
  { 
    id: 4, 
    name: "แบดมินตัน", 
    type: "เดี่ยว", 
    price: 50, 
    courts: 6,
    image: "https://www.pngarts.com/files/2/Badminton-PNG-Photo.png"
  },
];

// ข้อมูลการจอง
let bookings = [];

// 📌 ดึงข้อมูลกีฬาทั้งหมด หรือค้นหาตามชื่อ
app.get("/sports", (req, res) => {
  const { name, id } = req.query;

  if (id) {
    const sport = sports.find((s) => s.id == id);
    return sport ? res.json(sport) : res.status(404).json({ message: "ไม่พบกีฬา" });
  }

  if (name) {
    const filtered = sports.filter((s) => s.name.includes(name));
    return res.json(filtered);
  }

  res.json(sports);
});

// 📌 เพิ่มกีฬาใหม่
app.post("/sports", (req, res) => {
  const { name, type, price, courts, image } = req.body;

  if (!name || !type || !price || !courts) {
    return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
  }

  const newSport = { 
    id: sports.length + 1, 
    name, 
    type, 
    price, 
    courts,
    image: image || "https://images.unsplash.com/photo-1543357486-c250b47a1ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  };

  sports.push(newSport);
  res.status(201).json(newSport);
});

// 📌 ดึงข้อมูลกีฬายอดนิยม (เรียงตามจำนวนการจอง)
app.get("/popular-sports", (req, res) => {
  // นับจำนวนการจองแต่ละกีฬา
  const sportCounts = {};
  
  bookings.forEach(booking => {
    const sportId = booking.sportId;
    sportCounts[sportId] = (sportCounts[sportId] || 0) + 1;
  });

  // สร้างอาร์เรย์กีฬายอดนิยม
  const popularSports = Object.entries(sportCounts)
    .sort((a, b) => b[1] - a[1]) // เรียงจากมากไปน้อย
    .slice(0, 5) // เลือกมา 5 อันดับแรก
    .map(([sportId, count]) => {
      const sport = sports.find(s => s.id == sportId);
      return { 
        ...sport, 
        bookingCount: count,
        rank: popularSports.length + 1
      };
    })?? [];

  res.json(popularSports);
});

// 📌 บันทึกการจองใหม่
app.post("/bookings", (req, res) => {
  const { sportId, courtNumber, date, time, userId } = req.body;
  
  if (!sportId || !courtNumber || !date || !time) {
    return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
  }

  // ตรวจสอบว่ามีกีฬานี้หรือไม่
  const sportExists = sports.some(s => s.id == sportId);
  if (!sportExists) {
    return res.status(404).json({ message: "ไม่พบกีฬาที่ต้องการจอง" });
  }

  const newBooking = {
    id: bookings.length + 1,
    sportId,
    courtNumber,
    date,
    time,
    userId: userId || null,
    bookedAt: new Date().toISOString()
  };

  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

// 📌 ดึงข้อมูลการจอง
app.get("/bookings", (req, res) => {
  const { userId } = req.query;

  if (userId) {
    const userBookings = bookings.filter(b => b.userId == userId);
    return res.json(userBookings);
  }

  res.json(bookings);
});

// เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`🚀 API พร้อมใช้งานที่ http://localhost:${PORT}`);
});