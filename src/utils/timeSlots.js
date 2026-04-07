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

const formatTimeSlots = (slots, fallback = "ไม่ระบุ") => {
  const labels = getSelectedTimeLabels(slots);
  return labels.length > 0 ? labels.join(", ") : fallback;
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

export {
  formatTimeSlots,
  getSelectedTimeLabels,
  hasTimeConflict,
  mergeTimeSlots,
  normalizeTimeSlots,
  parseStoredTimeSlots,
};
