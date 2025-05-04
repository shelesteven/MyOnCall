/**
 * Data management utilities
 * Handles holidays, schedules, and team members
 * Simulates backend functionality with localStorage
 */

import { getLocalData, setLocalData, STORAGE_KEYS } from "./storage";
import { getCurrentUser, isAdmin } from "./auth";

// Default Canadian holidays for initialization
const DEFAULT_HOLIDAYS = [
  { id: 1, name: "New Year's Day", date: "2025-01-01", type: "fixed" },
  { id: 2, name: "Family Day", date: "2025-02-17", type: "variable" },
  { id: 3, name: "Good Friday", date: "2025-04-18", type: "variable" },
  { id: 4, name: "Victoria Day", date: "2025-05-19", type: "variable" },
  { id: 5, name: "Canada Day", date: "2025-07-01", type: "fixed" },
  { id: 6, name: "Civic Holiday", date: "2025-08-04", type: "variable" },
  { id: 7, name: "Labour Day", date: "2025-09-01", type: "variable" },
  { id: 8, name: "National Day for Truth and Reconciliation", date: "2025-09-30", type: "fixed" },
  { id: 9, name: "Thanksgiving", date: "2025-10-13", type: "variable" },
  { id: 10, name: "Remembrance Day", date: "2025-11-11", type: "fixed" },
  { id: 11, name: "Christmas Day", date: "2025-12-25", type: "fixed" },
  { id: 12, name: "Boxing Day", date: "2025-12-26", type: "fixed" },
];

// Default team members for initialization
const DEFAULT_TEAM_MEMBERS = [
  { id: 1, name: "Olivia Thompson", email: "olivia.t@example.com", avatar: { color: "blue", initials: "OT" }, availability: "high" },
  { id: 2, name: "Liam Chen", email: "liam.c@example.com", avatar: { color: "cyan", initials: "LC" }, availability: "medium" },
  { id: 3, name: "Emma Wilson", email: "emma.w@example.com", avatar: { color: "grape", initials: "EW" }, availability: "low" },
  { id: 4, name: "Noah Singh", email: "noah.s@example.com", avatar: { color: "orange", initials: "NS" }, availability: "high" },
  { id: 5, name: "Sophia Patel", email: "sophia.p@example.com", avatar: { color: "teal", initials: "SP" }, availability: "medium" },
  { id: 6, name: "Jackson Lee", email: "jackson.l@example.com", avatar: { color: "indigo", initials: "JL" }, availability: "high" },
  { id: 7, name: "Ava Tremblay", email: "ava.t@example.com", avatar: { color: "pink", initials: "AT" }, availability: "low" },
  { id: 8, name: "Lucas Roy", email: "lucas.r@example.com", avatar: { color: "green", initials: "LR" }, availability: "medium" },
];

// Avatar colors for new team members
const AVATAR_COLORS = ["blue", "cyan", "grape", "orange", "teal", "indigo", "pink", "green", "red", "violet", "yellow"];

/**
 * Initialize default data if not already present
 */
export const initializeDefaultData = () => {
  // Initialize holidays if not present
  if (!getLocalData(STORAGE_KEYS.HOLIDAYS)) {
    setLocalData(STORAGE_KEYS.HOLIDAYS, DEFAULT_HOLIDAYS);
  }

  // Initialize team members if not present
  if (!getLocalData(STORAGE_KEYS.TEAM_MEMBERS)) {
    setLocalData(STORAGE_KEYS.TEAM_MEMBERS, DEFAULT_TEAM_MEMBERS);
  }
};

/**
 * Get all holidays
 * @returns {Array} - List of holidays
 */
export const getAllHolidays = async () => {
  try {
    // Ensure data is initialized
    initializeDefaultData();

    // Simulate API call with delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Get holidays from storage
    return getLocalData(STORAGE_KEYS.HOLIDAYS) || [];
  } catch (error) {
    console.error("Error getting holidays:", error);
    return DEFAULT_HOLIDAYS;
  }
};

/**
 * Add a new holiday
 * @param {Object} holiday - Holiday data
 * @returns {Object} - The created holiday
 */
export const addHoliday = async (holiday) => {
  try {
    if (!isAdmin()) {
      throw new Error("Only admins can add holidays");
    }

    const holidays = getLocalData(STORAGE_KEYS.HOLIDAYS) || [];

    const newHoliday = {
      id: holidays.length ? Math.max(...holidays.map((h) => h.id)) + 1 : 1,
      ...holiday,
      createdAt: new Date().toISOString(),
    };

    holidays.push(newHoliday);
    setLocalData(STORAGE_KEYS.HOLIDAYS, holidays);

    return newHoliday;
  } catch (error) {
    console.error("Error adding holiday:", error);
    throw error;
  }
};

/**
 * Get all team members
 * @returns {Array} - List of team members
 */
export const getAllTeamMembers = async () => {
  try {
    // Ensure data is initialized
    initializeDefaultData();

    // Simulate API call with delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Get team members from storage
    return getLocalData(STORAGE_KEYS.TEAM_MEMBERS) || [];
  } catch (error) {
    console.error("Error getting team members:", error);
    return DEFAULT_TEAM_MEMBERS;
  }
};

/**
 * Add a new team member
 * @param {Object} teamMember - Team member data
 * @returns {Object} - The created team member
 */
export const addTeamMember = async (teamMember) => {
  try {
    if (!isAdmin()) {
      throw new Error("Only admins can add team members");
    }

    const teamMembers = getLocalData(STORAGE_KEYS.TEAM_MEMBERS) || [];

    // Generate initials from name
    const initials = teamMember.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

    // Pick a random color
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const newTeamMember = {
      id: teamMembers.length ? Math.max(...teamMembers.map((m) => m.id)) + 1 : 1,
      ...teamMember,
      avatar: { color, initials },
      createdAt: new Date().toISOString(),
    };

    teamMembers.push(newTeamMember);
    setLocalData(STORAGE_KEYS.TEAM_MEMBERS, teamMembers);

    return newTeamMember;
  } catch (error) {
    console.error("Error adding team member:", error);
    throw error;
  }
};

/**
 * Generate schedule entries for a date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Array} - Generated schedule entries
 */
export const generateSchedules = async (startDate, endDate) => {
  try {
    if (!isAdmin()) {
      throw new Error("Only admins can generate schedules");
    }

    // Simulate API call with delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get holidays and team members
    const holidays = await getAllHolidays();
    const teamMembers = await getAllTeamMembers();

    // Get existing schedules
    let schedules = getLocalData(STORAGE_KEYS.SCHEDULES) || [];

    // Filter out schedules outside our date range to keep them intact
    schedules = schedules.filter((s) => s.date < startDate || s.date > endDate);

    // Create rotation patterns - various ways to shuffle team members
    const rotationPatterns = [
      // Pattern 1: High availability members first, then low
      [...teamMembers].sort((a, b) => {
        const availabilityScore = { high: 3, medium: 2, low: 1 };
        return availabilityScore[b.availability] - availabilityScore[a.availability];
      }),

      // Pattern 2: Random shuffle
      [...teamMembers].sort(() => Math.random() - 0.5),

      // Pattern 3: Alphabetical by name
      [...teamMembers].sort((a, b) => a.name.localeCompare(b.name)),

      // Pattern 4: Reverse alphabetical
      [...teamMembers].sort((a, b) => b.name.localeCompare(a.name)),

      // Pattern 5: By ID in reverse
      [...teamMembers].sort((a, b) => b.id - a.id),
    ];

    // Weighting system - repeat high availability members more often in the roster
    const weightedTeamMemberIds = [];
    teamMembers.forEach((member) => {
      const weight = member.availability === "high" ? 3 : member.availability === "medium" ? 2 : 1;

      for (let i = 0; i < weight; i++) {
        weightedTeamMemberIds.push(member.id.toString());
      }
    });

    // Calculate date factor for more variety
    const currentDate = new Date();
    const dateFactor = currentDate.getDate() + currentDate.getMonth();

    // Create schedule entries for each day in the range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const date = d.toISOString().split("T")[0];
      const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday
      const dayOfMonth = d.getDate();

      // Find if this date is a holiday
      const holiday = holidays.find((h) => h.date === date);

      // Choose pattern based on day of week
      const patternIndex = (dayOfWeek + dateFactor) % rotationPatterns.length;
      const pattern = rotationPatterns[patternIndex];

      // Assign one team member
      let assigneeId;

      if (holiday) {
        // For holidays, assign randomly from all team members
        assigneeId = teamMembers[Math.floor(Math.random() * teamMembers.length)].id.toString();
      } else if (dayOfWeek === 0 || dayOfWeek === 6) {
        // For weekends, assign from the weighted roster (favors high availability)
        assigneeId = weightedTeamMemberIds[Math.floor(Math.random() * weightedTeamMemberIds.length)];
      } else {
        // For weekdays, use the rotation pattern and day of month to select
        assigneeId = pattern[dayOfMonth % pattern.length].id.toString();
      }

      // Create new schedule entry
      schedules.push({
        id: `schedule_${date}`,
        date,
        day: dayOfWeek,
        assigneeIds: [assigneeId], // Only one per day
        holidayId: holiday ? holiday.id : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Save updated schedules
    setLocalData(STORAGE_KEYS.SCHEDULES, schedules);

    // Return schedules for the requested date range
    return schedules.filter((s) => s.date >= startDate && s.date <= endDate);
  } catch (error) {
    console.error("Error generating schedules:", error);
    throw error;
  }
};

/**
 * Get schedule entries with team member and holiday details
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Array} - Schedule entries with details
 */
export const getScheduleWithDetails = async (startDate, endDate) => {
  try {
    // Ensure data is initialized
    initializeDefaultData();

    // Simulate API call with delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Get schedules, holidays, and team members
    const schedules = getLocalData(STORAGE_KEYS.SCHEDULES) || [];
    const holidays = await getAllHolidays();
    const teamMembers = await getAllTeamMembers();

    // Filter schedules by date range
    const filteredSchedules = schedules.filter((s) => s.date >= startDate && s.date <= endDate);

    // Enhance schedules with holiday and team member details
    return filteredSchedules.map((schedule) => {
      // Get holiday details
      const holiday = schedule.holidayId ? holidays.find((h) => h.id === schedule.holidayId) : null;

      // Get assignee details
      const assignees = schedule.assigneeIds
        ? schedule.assigneeIds.map((id) => teamMembers.find((m) => m.id.toString() === id)).filter(Boolean) // Remove any undefined values (in case team member was deleted)
        : [];

      return {
        ...schedule,
        holiday,
        assignees,
      };
    });
  } catch (error) {
    console.error("Error getting schedules with details:", error);
    return [];
  }
};

/**
 * Update assignees for a specific date
 * @param {string} date - Date to update (YYYY-MM-DD)
 * @param {Array} assigneeIds - Array of team member IDs
 * @returns {Object} - Updated schedule entry
 */
export const updateSchedule = async (date, assigneeIds) => {
  try {
    if (!isAdmin()) {
      throw new Error("Only admins can update schedules");
    }

    // Simulate API call with delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Get schedules
    const schedules = getLocalData(STORAGE_KEYS.SCHEDULES) || [];

    // Find existing schedule
    const existingIndex = schedules.findIndex((s) => s.date === date);

    if (existingIndex >= 0) {
      // Update existing
      schedules[existingIndex] = {
        ...schedules[existingIndex],
        assigneeIds,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Create new
      const dayOfWeek = new Date(date).getDay();
      const holidays = await getAllHolidays();
      const holiday = holidays.find((h) => h.date === date);

      schedules.push({
        id: `schedule_${date}`,
        date,
        day: dayOfWeek,
        assigneeIds,
        holidayId: holiday ? holiday.id : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Save updated schedules
    setLocalData(STORAGE_KEYS.SCHEDULES, schedules);

    // Return updated schedule with details
    const result = await getScheduleWithDetails(date, date);
    return result[0] || null;
  } catch (error) {
    console.error("Error updating schedule:", error);
    throw error;
  }
};

/**
 * Get user availability data for a specific user or all users
 * @param {string} userId - Optional user ID to filter by
 * @returns {Array} - Availability entries
 */
export const getUserAvailability = async (userId = null) => {
  try {
    // Get availability data
    const availability = getLocalData(STORAGE_KEYS.AVAILABILITY) || [];

    // Filter by user ID if specified
    return userId ? availability.filter((a) => a.userId === userId) : availability;
  } catch (error) {
    console.error("Error getting user availability:", error);
    return [];
  }
};

/**
 * Update user availability for a date range
 * @param {Array} dateRange - Array with start and end dates
 * @param {number} priority - Priority level (1-5)
 * @returns {Array} - Updated availability entries for the user
 */
export const updateUserAvailability = async (dateRange, priority) => {
  try {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      throw new Error("User must be logged in");
    }

    if (!dateRange[0] || !dateRange[1]) {
      throw new Error("Date range is required");
    }

    // Get existing availability data
    const allAvailability = getLocalData(STORAGE_KEYS.AVAILABILITY) || [];

    // Filter out the current user's availability for this date range
    const otherAvailability = allAvailability.filter((a) => a.userId !== currentUser.id);

    const startDate = new Date(dateRange[0]);
    const endDate = new Date(dateRange[1]);
    const newAvailability = [];

    // Create availability entries for each day in the range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const date = d.toISOString().split("T")[0];

      newAvailability.push({
        id: `${currentUser.id}-${date}`,
        userId: currentUser.id,
        date,
        priority,
        createdAt: new Date().toISOString(),
      });
    }

    // Add the availability data to local storage
    setLocalData(STORAGE_KEYS.AVAILABILITY, [...otherAvailability, ...newAvailability]);

    return newAvailability;
  } catch (error) {
    console.error("Error updating user availability:", error);
    throw error;
  }
};
