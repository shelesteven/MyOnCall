// filepath: /Users/shelesteven/Documents/Projects/GDSC-Hacks-2025/react/my-on-call/src/pages/schedules.jsx
import "@mantine/dates/styles.css";

import { useState, useEffect } from "react";
import { Button, Group, ThemeIcon, ActionIcon, Title, Text, SimpleGrid, Paper, Badge, Card, Container, Box, Stack, Tooltip, Tabs, Alert, LoadingOverlay, Slider, Menu, Avatar, Divider } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconTrash, IconCalendarEvent, IconPlus, IconCalendarTime, IconUserCircle, IconHome, IconAlertCircle, IconLogout, IconUser, IconSettings } from "@tabler/icons-react";
import { useNavigate } from "react-router";

// Import our utilities
import { getLocalData, setLocalData } from "../utils/storage";
import { isAuthenticated, getCurrentUser, signOut } from "../utils/auth";
import { getAllHolidays } from "../utils/dataManagement";

// Storage key for user availability preferences
const AVAILABILITY_STORAGE_KEY = "myOnCallAvailability";

// Helper to get priority color - reversed scale (5 is least available, 1 is most available)
const getPriorityColor = (priority) => {
  // 5 = red (least available), 1 = green (most available)
  const colors = ["teal", "blue", "cyan", "yellow", "orange", "red"];
  return colors[priority] || colors[0];
};

// Helper to get priority label - reversed scale
const getPriorityLabel = (priority) => {
  const labels = ["", "Slightly Prefer Not To Work", "Moderately Prefer Not To Work", "Strongly Prefer Not To Work", "Very Strongly Prefer Not To Work", "Absolutely Prefer Not To Work"];
  return labels[priority] || "";
};

const paperStyle = {
  width: "min(100vw, 800px)",
  padding: "16px",
  marginLeft: "auto",
  marginRight: "auto",
};

// Style for consistent panels
const panelStyle = {
  display: "block",
};

// Paper style for schedule items
const schedulePaperStyle = {
  width: "100%",
  marginLeft: "auto",
  marginRight: "auto",
};

export default function Schedules() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [holidays, setHolidays] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // For filtering purposes
  const currentDate = new Date();
  const dateString = currentDate.toISOString().split("T")[0];

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        navigate("/auth/sign-in");
        return;
      }

      // Load current user data
      const user = getCurrentUser();
      setCurrentUser(user);

      // Load holidays
      const holidaysData = await getAllHolidays();
      setHolidays(holidaysData);

      // Load user's availability preferences
      const savedAvailability = getLocalData(AVAILABILITY_STORAGE_KEY) || [];

      // Filter availability for the current user
      const userAvailability = savedAvailability.filter((item) => item.userId === user?.id);

      setSchedules(userAvailability);
      setLoading(false);
    };

    loadData();
  }, [navigate]);

  // Form for adding new availability
  const form = useForm({
    initialValues: {
      dateRange: [null, null],
      priority: 3, // Default priority (moderately prefer not to work)
    },
    validate: {
      dateRange: (value) => {
        if (!value[0] || !value[1]) {
          return "Start and end dates are required";
        }
        return null;
      },
    },
  });

  // Handle sign out
  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    navigate("/auth/sign-in");
  };

  // Handle form submission for adding new availability
  const handleSubmit = (values) => {
    if (!currentUser) return;

    setLoading(true);

    setTimeout(() => {
      if (!values.dateRange[0] || !values.dateRange[1]) {
        setLoading(false);
        return;
      }

      const startDate = new Date(values.dateRange[0]);
      const endDate = new Date(values.dateRange[1]);
      const newSchedules = [];

      // Create schedule entries for each day in the range
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        // Format date as YYYY-MM-DD
        const formattedDate = d.toISOString().split("T")[0];

        // Check if date already exists for this user
        const existingIndex = schedules.findIndex((schedule) => schedule.date === formattedDate && schedule.userId === currentUser.id);

        if (existingIndex >= 0) {
          // Update existing schedule
          schedules[existingIndex] = {
            ...schedules[existingIndex],
            priority: values.priority,
          };
        } else {
          // Create new schedule
          newSchedules.push({
            id: `${currentUser.id}-${formattedDate}`,
            userId: currentUser.id,
            date: formattedDate,
            priority: values.priority,
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Combine existing and new schedules
      const updatedSchedules = [...schedules.filter((s) => !newSchedules.some((ns) => ns.date === s.date && ns.userId === s.userId)), ...newSchedules];

      // Update state
      setSchedules(updatedSchedules);

      // Save to local storage (combine with any other users' data)
      const allAvailability = getLocalData(AVAILABILITY_STORAGE_KEY) || [];
      const otherUsersAvailability = allAvailability.filter((item) => item.userId !== currentUser.id);

      setLocalData(AVAILABILITY_STORAGE_KEY, [...otherUsersAvailability, ...updatedSchedules]);

      form.reset();
      setLoading(false);
    }, 500); // Simulate API call
  };

  const handleDeleteSchedule = (idToDelete) => {
    setLoading(true);

    setTimeout(() => {
      // Remove from state
      const updatedSchedules = schedules.filter((schedule) => schedule.id !== idToDelete);
      setSchedules(updatedSchedules);

      // Remove from local storage
      const allAvailability = getLocalData(AVAILABILITY_STORAGE_KEY) || [];
      const updatedAllAvailability = allAvailability.filter((item) => item.id !== idToDelete);

      setLocalData(AVAILABILITY_STORAGE_KEY, updatedAllAvailability);

      setLoading(false);
    }, 300);
  };

  // Add holiday information to schedules
  const schedulesWithHolidays = schedules.map((schedule) => {
    const holiday = holidays.find((h) => h.date === schedule.date);
    return {
      ...schedule,
      holiday,
    };
  });

  // Sort schedules by date
  const sortedSchedules = [...schedulesWithHolidays].sort((a, b) => a.date.localeCompare(b.date));

  // Filter schedules by past or upcoming based on active tab
  const upcomingSchedules = sortedSchedules.filter((s) => s.date >= dateString);
  const pastSchedules = sortedSchedules.filter((s) => s.date < dateString);

  // Generate initials for user avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Container size="lg" px="xs" style={{ display: "flex", justifyContent: "center" }}>
      <title>My Schedule - MyOnCall</title>

      <Paper style={{ ...paperStyle }} shadow="xs" p="md" withBorder radius="md" mb="lg">
        <Group justify="space-between" mb="md">
          <Button variant="subtle" leftSection={<IconHome size="1rem" />} component="a" href="/" compact>
            Home
          </Button>

          {currentUser && (
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <Button
                  variant="subtle"
                  rightSection={
                    <Avatar size="sm" color="blue" radius="xl">
                      {getInitials(currentUser.name)}
                    </Avatar>
                  }>
                  {currentUser.name}
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item leftSection={<IconUser size={14} />}>Profile</Menu.Item>
                <Menu.Item leftSection={<IconSettings size={14} />}>Settings</Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleSignOut}>
                  Sign out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>

        <Box className="section" mb={30}>
          <Title order={1} className="primary" mb="xs">
            My Availability Schedule
          </Title>
          <Text size="lg" c="dimmed" className="secondary">
            Set your availability preferences for on-call scheduling
          </Text>
        </Box>

        {/* Main Content Area with Tabs */}
        <Card shadow="sm" withBorder radius="md" mb={30} pos="relative" padding={0}>
          <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />

          <Card.Section withBorder inheritPadding py="md" px="lg">
            <Group justify="space-between">
              <Group>
                <ThemeIcon color="teal" variant="light" size={32} radius="xl">
                  <IconCalendarTime size="1.3rem" stroke={1.5} />
                </ThemeIcon>
                <Title order={3}>My Schedule</Title>
              </Group>
              <Badge size="lg">
                {schedules.length} {schedules.length === 1 ? "Date" : "Dates"} Scheduled
              </Badge>
            </Group>
          </Card.Section>

          {/* Add new schedule section */}
          <Box p="md" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Title order={4} mb="md">
                Set Your Availability
              </Title>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <div>
                  <DatePickerInput type="range" label="Select Date Range" placeholder="Pick start and end dates" valueFormat="YYYY-MM-DD" clearable withAsterisk allowSingleDateInRange {...form.getInputProps("dateRange")} />
                </div>
                <div>
                  <Text size="sm" fw={500} mb="xs">
                    Preference Level (1-5)
                  </Text>
                  <Slider
                    marks={[
                      { value: 1, label: "1" },
                      { value: 2, label: "2" },
                      { value: 3, label: "3" },
                      { value: 4, label: "4" },
                      { value: 5, label: "5" },
                    ]}
                    min={1}
                    max={5}
                    step={1}
                    label={getPriorityLabel}
                    color={getPriorityColor(form.values.priority)}
                    {...form.getInputProps("priority")}
                  />
                </div>
              </SimpleGrid>
              <Group justify="flex-end" mt="md">
                <Button type="submit" leftSection={<IconPlus size="1rem" />} variant="filled" color="teal" disabled={!form.values.dateRange[0] || !form.values.dateRange[1]}>
                  Add to Schedule
                </Button>
              </Group>
            </form>
          </Box>

          <Tabs value={activeTab} onChange={setActiveTab} radius="md" mt="md" style={{ padding: "0 20px 20px" }}>
            <Tabs.List grow mb="md">
              <Tabs.Tab value="upcoming" leftSection={<IconCalendarEvent size="0.9rem" />}>
                Upcoming Dates
                {upcomingSchedules.length > 0 && (
                  <Badge size="sm" ml="xs" variant="light">
                    {upcomingSchedules.length}
                  </Badge>
                )}
              </Tabs.Tab>
              <Tabs.Tab value="past" leftSection={<IconCalendarTime size="0.9rem" />}>
                Past Dates
                {pastSchedules.length > 0 && (
                  <Badge size="sm" ml="xs" variant="light">
                    {pastSchedules.length}
                  </Badge>
                )}
              </Tabs.Tab>
            </Tabs.List>

            {/* Upcoming Schedules Tab */}
            <Tabs.Panel value="upcoming" style={panelStyle}>
              <Box
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  padding: "0",
                }}>
                {upcomingSchedules.length > 0 ? (
                  <Stack align="center" style={{ width: "100%", gap: "12px" }}>
                    {upcomingSchedules.map((schedule) => (
                      <Paper
                        key={schedule.id}
                        shadow="xs"
                        p="md"
                        withBorder
                        radius="md"
                        style={{
                          ...schedulePaperStyle,
                          borderLeft: `4px solid var(--mantine-color-${getPriorityColor(schedule.priority)}-6)`,
                        }}>
                        <Group justify="space-between" mb="xs">
                          <Group>
                            <ThemeIcon color={getPriorityColor(schedule.priority)} variant="light" size={32} radius="xl">
                              <IconUserCircle size="1.2rem" />
                            </ThemeIcon>
                            <div>
                              <Text fw={600} size="lg">
                                {new Date(schedule.date).toLocaleDateString(undefined, {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </Text>
                              <Group spacing="xs">
                                <Badge color={getPriorityColor(schedule.priority)}>
                                  Level {schedule.priority}: {getPriorityLabel(schedule.priority)}
                                </Badge>

                                {schedule.holiday && (
                                  <Badge color="red" variant="light">
                                    {schedule.holiday.name}
                                  </Badge>
                                )}
                              </Group>
                            </div>
                          </Group>
                          <Tooltip label="Remove from schedule" position="left" withArrow>
                            <ActionIcon color="red" variant="light" onClick={() => handleDeleteSchedule(schedule.id)} radius="xl" size="lg">
                              <IconTrash size="1.2rem" />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Alert icon={<IconAlertCircle size="1rem" />} title="No upcoming scheduled dates" color="teal" variant="light" style={schedulePaperStyle}>
                    You haven't added any future dates to your schedule yet. Use the form above to add dates.
                  </Alert>
                )}
              </Box>
            </Tabs.Panel>

            {/* Past Schedules Tab */}
            <Tabs.Panel value="past" style={panelStyle}>
              <Box
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  padding: "0",
                }}>
                {pastSchedules.length > 0 ? (
                  <Stack align="center" style={{ width: "100%", gap: "12px" }}>
                    {pastSchedules.map((schedule) => (
                      <Paper
                        key={schedule.id}
                        shadow="xs"
                        p="md"
                        withBorder
                        radius="md"
                        style={{
                          ...schedulePaperStyle,
                          borderLeft: `4px solid var(--mantine-color-${getPriorityColor(schedule.priority)}-6)`,
                          opacity: 0.8,
                        }}>
                        <Group justify="space-between" mb="xs">
                          <Group>
                            <ThemeIcon color={getPriorityColor(schedule.priority)} variant="light" size={32} radius="xl">
                              <IconUserCircle size="1.2rem" />
                            </ThemeIcon>
                            <div>
                              <Text fw={600} size="lg">
                                {new Date(schedule.date).toLocaleDateString(undefined, {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </Text>
                              <Group spacing="xs">
                                <Badge color={getPriorityColor(schedule.priority)}>
                                  Level {schedule.priority}: {getPriorityLabel(schedule.priority)}
                                </Badge>

                                {schedule.holiday && (
                                  <Badge color="red" variant="light">
                                    {schedule.holiday.name}
                                  </Badge>
                                )}
                              </Group>
                            </div>
                          </Group>
                          <Tooltip label="Remove from history" position="left" withArrow>
                            <ActionIcon color="red" variant="light" onClick={() => handleDeleteSchedule(schedule.id)} radius="xl" size="lg">
                              <IconTrash size="1.2rem" />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Alert icon={<IconAlertCircle size="1rem" />} title="No past scheduled dates" color="blue" variant="light" style={schedulePaperStyle}>
                    You don't have any past scheduled dates in your history.
                  </Alert>
                )}
              </Box>
            </Tabs.Panel>
          </Tabs>
        </Card>

        {/* Priority Legend Card */}
        <Card shadow="sm" withBorder radius="md">
          <Card.Section withBorder inheritPadding py="md">
            <Title order={4}>Preference Level Guide</Title>
          </Card.Section>

          <SimpleGrid cols={{ base: 1, sm: 1 }} p="md">
            {Array.from({ length: 5 }, (_, i) => {
              const level = i + 1; // Levels 1-5
              return (
                <Group key={level} spacing="md" align="center">
                  <Badge color={getPriorityColor(level)} size="lg">
                    Level {level}
                  </Badge>
                  <Text size="sm">{getPriorityLabel(level)}</Text>
                </Group>
              );
            })}
          </SimpleGrid>

          <Box p="md" pt={0}>
            <Text size="sm" c="dimmed">
              Set your preference level to help your team determine scheduling. Lower levels (1) indicate you're available, while higher levels (5) indicate you absolutely prefer not to work on the selected date(s).
            </Text>
          </Box>
        </Card>
      </Paper>
    </Container>
  );
}
