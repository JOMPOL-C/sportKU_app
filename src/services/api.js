import axios from "axios";
import { NativeModules, Platform } from "react-native";

const resolveApiBaseUrl = () => {
  const scriptURL = NativeModules.SourceCode?.scriptURL || "";
  const hostMatch = scriptURL.match(/https?:\/\/([^/:]+)/);
  const detectedHost = hostMatch?.[1];

  if (!detectedHost) {
    return Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";
  }

  if (Platform.OS === "android" && ["localhost", "127.0.0.1"].includes(detectedHost)) {
    return "http://10.0.2.2:3000";
  }

  return `http://${detectedHost}:3000`;
};

const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10000,
});

const toApiError = (error, fallbackMessage) => {
  const message =
    error?.response?.data?.message || error?.message || fallbackMessage;

  return new Error(message);
};

const registerUser = async (userDataOrUsername, passwordArg) => {
  const userData =
    typeof userDataOrUsername === "object" && userDataOrUsername !== null
      ? userDataOrUsername
      : {
          username: userDataOrUsername,
          password: passwordArg,
        };

  try {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw toApiError(error, "ไม่สามารถลงทะเบียนผู้ใช้ได้");
  }
};

const loginUser = async (username, password) => {
  try {
    const response = await apiClient.post("/auth/login", { username, password });
    return response.data;
  } catch (error) {
    throw toApiError(error, "ไม่สามารถเข้าสู่ระบบได้");
  }
};

const getSports = async () => {
  try {
    const response = await apiClient.get("/sports");
    return response.data;
  } catch (error) {
    throw toApiError(error, "ไม่สามารถโหลดข้อมูลกีฬาได้");
  }
};

const getPopularSports = async (limit = 4) => {
  try {
    const response = await apiClient.get("/popular-sports", {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw toApiError(error, "ไม่สามารถโหลดกีฬายอดนิยมได้");
  }
};

const getCourtsBySport = async (sportId) => {
  try {
    const response = await apiClient.get(`/sports/${sportId}/courts`);
    return response.data;
  } catch (error) {
    throw toApiError(error, "ไม่สามารถโหลดข้อมูลสนามได้");
  }
};

const getTimeSlots = async () => {
  try {
    const response = await apiClient.get("/time-slots");
    return response.data;
  } catch (error) {
    throw toApiError(error, "ไม่สามารถโหลดช่วงเวลาได้");
  }
};

const getBookedTimeSlotsForCourt = async (bookingData = {}) => {
  const sportId = bookingData.sport?.id ?? null;
  const courtId = bookingData.selectedCourt?.id ?? null;

  if (!sportId || !courtId) {
    return [];
  }

  try {
    const response = await apiClient.get("/bookings/booked-slots", {
      params: {
        bookingDay: bookingData.bookingDay,
        sportId,
        sportName: bookingData.sport?.name,
        courtId,
        courtName: bookingData.selectedCourt?.name || bookingData.selectedCourt,
      },
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    throw toApiError(error, "ไม่สามารถโหลดช่วงเวลาที่ถูกจองได้");
  }
};

const saveBooking = async (userId, bookingData) => {
  try {
    const response = await apiClient.post("/bookings", {
      userId,
      ...bookingData,
    });
    return response.data;
  } catch (error) {
    throw toApiError(error, "ไม่สามารถบันทึกข้อมูลการจองได้");
  }
};

const getUserBookings = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}/bookings`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    throw toApiError(error, "ไม่สามารถโหลดประวัติการจองได้");
  }
};

const getAllBookingsDebug = async () => {
  try {
    const response = await apiClient.get("/debug/bookings");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    throw toApiError(error, "ไม่สามารถอ่านรายการจองได้");
  }
};

const clearAllBookingsDebug = async () => {
  try {
    const response = await apiClient.delete("/debug/bookings");
    return response.data;
  } catch (error) {
    throw toApiError(error, "ไม่สามารถล้างข้อมูลจองได้");
  }
};

export {
  registerUser,
  loginUser,
  getSports,
  getPopularSports,
  getCourtsBySport,
  getBookedTimeSlotsForCourt,
  getTimeSlots,
  saveBooking,
  getUserBookings,
  getAllBookingsDebug,
  clearAllBookingsDebug,
};
