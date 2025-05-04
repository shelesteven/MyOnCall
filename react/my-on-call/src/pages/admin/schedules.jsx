import "@mantine/dates/styles.css";

import { useState, useEffect } from "react";
import {
  Button,
  Group,
  TextInput,
  ThemeIcon,
  ActionIcon,
  Title,
  Text,
  SimpleGrid,
  Paper,
  Badge,
  Card,
  Container,
  Box,
  Stack,
  Tooltip,
  Tabs,
  Alert,
  LoadingOverlay,
  Drawer,
  Avatar,
  Select,
  Checkbox,
  Collapse,
  Modal,
  Grid,
  Divider,
  Menu,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconTrash, IconCalendarEvent, IconPlus, IconEdit, IconHome, IconAlertCircle, IconUserCheck, IconUsers, IconCalendarStats, IconInfoCircle, IconUserPlus, IconCalendarCheck, IconLogout, IconUser, IconSettings } from "@tabler/icons-react";
import { MonthPickerInput } from "@mantine/dates";
import { useNavigate } from "react-router";

// Import our utilities
import { getLocalData, setLocalData } from "../../utils/storage";
import { isAuthenticated, getCurrentUser, signOut, isAdmin } from "../../utils/auth";
import { getAllHolidays, getAllTeamMembers, getScheduleWithDetails, updateSchedule, generateSchedules, addTeamMember } from "../../utils/dataManagement";

// Styles
const paperStyle = {
  width: "min(100vw, 1400px)",
  padding: "16px",
  marginLeft: "auto",
  marginRight: "auto",
};

// Add Team Member form state and logic
const useAddTeamMemberForm = () => {
  const [inviteModalOpened, setInviteModalOpened] = useState(false);
  const [successModalOpened, setSuccessModalOpened] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState("");

  const inviteForm = useForm({
    initialValues: {
      email: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email address"),
    },
  });

  const handleInviteSubmit = async (values) => {
    // Store the email for the success message
    setInvitedEmail(values.email);

    // Close the invite modal and open the success modal
    setInviteModalOpened(false);
    setSuccessModalOpened(true);

    // Reset form
    inviteForm.reset();
  };

  return {
    inviteModalOpened,
    setInviteModalOpened,
    successModalOpened,
    setSuccessModalOpened,
    invitedEmail,
    inviteForm,
    handleInviteSubmit,
  };
};

const getMonthYearString = (date) => {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
};

// Helper to get day style
const getDayStyle = (date, isWeekend, isHoliday) => {
  if (isHoliday) {
    return {
      background: "rgba(255, 82, 82, 0.1)",
      borderLeft: "4px solid var(--mantine-color-red-6)",
    };
  }

  if (isWeekend) {
    return {
      background: "rgba(0, 0, 0, 0.03)",
      borderLeft: "4px solid var(--mantine-color-gray-5)",
    };
  }

  const today = new Date().toISOString().split("T")[0];
  if (date === today) {
    return {
      background: "rgba(51, 154, 240, 0.1)",
      borderLeft: "4px solid var(--mantine-color-blue-6)",
    };
  }

  return {};
};

export default function AdminSchedules() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("schedule");
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Add Team Member functionality
  const { inviteModalOpened, setInviteModalOpened, successModalOpened, setSuccessModalOpened, invitedEmail, inviteForm, handleInviteSubmit } = useAddTeamMemberForm();

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is authenticated and is an admin
        if (!isAuthenticated()) {
          navigate("/auth/sign-in");
          return;
        }

        if (!isAdmin()) {
          navigate("/schedules");
          return;
        }

        // Load current user data
        const user = getCurrentUser();
        setCurrentUser(user);

        // Load holidays and team members
        const [holidaysData, teamMembersData] = await Promise.all([getAllHolidays(), getAllTeamMembers()]);

        setHolidays(holidaysData);
        setTeamMembers(teamMembersData);

        // Load schedules for current month and next 2 months
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 2);
        endDate.setDate(endDate.getDate() + 30);

        let schedulesData = await getScheduleWithDetails(startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]);

        // If no schedules exist, generate them
        if (schedulesData.length === 0) {
          await generateSchedules(startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]);

          // Fetch the newly generated schedules
          schedulesData = await getScheduleWithDetails(startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]);
        }

        setScheduleData(schedulesData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Filter schedule data by selected month
  const filteredSchedule = scheduleData.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === selectedMonth.getMonth() && entryDate.getFullYear() === selectedMonth.getFullYear();
  });

  // Group by week for better display
  const scheduleByWeek = [];
  let currentWeek = [];

  if (filteredSchedule.length > 0) {
    // Get first day of month
    const firstDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay();

    // Add empty slots for start of month
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }

    // Add actual days
    filteredSchedule.forEach((day) => {
      if (currentWeek.length === 7) {
        scheduleByWeek.push([...currentWeek]);
        currentWeek = [];
      }

      currentWeek.push(day);
    });

    // Add remaining week if there are any days left
    if (currentWeek.length > 0) {
      // Fill remaining slots
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      scheduleByWeek.push([...currentWeek]);
    }
  }

  // Form for editing assignees
  const form = useForm({
    initialValues: {
      date: "",
      assignees: [],
    },
    validate: {
      assignees: (value) => {
        if (value.length === 0) {
          return null; // It's okay to have no assignees
        }
        if (value.length > 1) {
          return "Only one team member can be assigned per day";
        }
        return null;
      },
    },
  });

  // Handle editing a specific date's assignees
  const handleEditDate = (date) => {
    setSelectedDate(date);

    // Populate form with current assignees
    const currentAssignees = date.assignees.map((assignee) => assignee.id.toString());
    form.setValues({
      date: date.date,
      assignees: currentAssignees,
    });

    setDrawerOpened(true);
  };

  // Handle saving assignee changes
  const handleSaveAssignees = async (values) => {
    setLoading(true);

    try {
      // Update schedule with new assignees
      await updateSchedule(values.date, values.assignees);

      // Refresh schedule data
      const startDate = new Date(selectedMonth);
      startDate.setDate(1);

      const endDate = new Date(selectedMonth);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);

      const updatedScheduleData = await getScheduleWithDetails(startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]);

      // Merge updated data with existing data for other months
      const existingOtherMonthsData = scheduleData.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() !== selectedMonth.getMonth() || entryDate.getFullYear() !== selectedMonth.getFullYear();
      });

      setScheduleData([...existingOtherMonthsData, ...updatedScheduleData]);
      setDrawerOpened(false);
    } catch (error) {
      console.error("Error saving assignees:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk edit modal
  const bulkEditForm = useForm({
    initialValues: {
      dateRange: [null, null],
      pattern: "all",
      selectedMembers: [],
    },
    validate: {
      dateRange: (value) => {
        if (!value[0] || !value[1]) {
          return "Date range is required";
        }
        return null;
      },
      selectedMembers: (value) => {
        if (value.length === 0) {
          return "At least one team member must be selected";
        }
        if (value.length > 1) {
          return "Only one team member can be assigned per day";
        }
        return null;
      },
    },
  });

  // Handle opening the bulk edit modal
  const handleBulkEdit = () => {
    bulkEditForm.reset();
    setModalOpened(true);
  };

  // Handle applying bulk assignments
  const handleBulkAssign = async (values) => {
    if (!values.dateRange[0] || !values.dateRange[1] || values.selectedMembers.length === 0) {
      return;
    }

    setLoading(true);
    setModalOpened(false);

    try {
      const startDate = new Date(values.dateRange[0]);
      const endDate = new Date(values.dateRange[1]);

      // Loop through each day in the range
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split("T")[0];
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

        // Apply pattern filtering
        let shouldAssign = true;

        if (values.pattern === "weekdays" && (dayOfWeek === 0 || dayOfWeek === 6)) {
          shouldAssign = false;
        } else if (values.pattern === "weekends" && dayOfWeek !== 0 && dayOfWeek !== 6) {
          shouldAssign = false;
        } else if (values.pattern === "alternating" && date.getDate() % 2 === 0) {
          shouldAssign = false;
        }

        if (shouldAssign) {
          await updateSchedule(dateStr, values.selectedMembers);
        }
      }

      // Reload schedule data
      const refreshStartDate = new Date(selectedMonth);
      refreshStartDate.setDate(1);

      const refreshEndDate = new Date(selectedMonth);
      refreshEndDate.setMonth(refreshEndDate.getMonth() + 1);
      refreshEndDate.setDate(0);

      const updatedScheduleData = await getScheduleWithDetails(refreshStartDate.toISOString().split("T")[0], refreshEndDate.toISOString().split("T")[0]);

      // Update state with new data for the current month
      const existingOtherMonthsData = scheduleData.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() !== selectedMonth.getMonth() || entryDate.getFullYear() !== selectedMonth.getFullYear();
      });

      setScheduleData([...existingOtherMonthsData, ...updatedScheduleData]);
    } catch (error) {
      console.error("Error applying bulk assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle generating auto schedule
  const handleGenerateSchedule = async () => {
    setLoading(true);

    try {
      // Generate for the entire current year
      const currentYear = new Date().getFullYear();

      // Start from January 1st
      const startDate = new Date(currentYear, 0, 1);

      // End on December 31st
      const endDate = new Date(currentYear, 11, 31);

      // Show a more descriptive message in the loading state
      setLoading(true);

      await generateSchedules(startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]);

      // After generating the whole year, just load data for the current view (month)
      const viewStartDate = new Date(selectedMonth);
      viewStartDate.setDate(1); // First day of selected month

      const viewEndDate = new Date(selectedMonth);
      viewEndDate.setMonth(viewEndDate.getMonth() + 1);
      viewEndDate.setDate(0); // Last day of selected month

      const updatedScheduleData = await getScheduleWithDetails(viewStartDate.toISOString().split("T")[0], viewEndDate.toISOString().split("T")[0]);

      setScheduleData(updatedScheduleData);
    } catch (error) {
      console.error("Error generating schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle edit mode
  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  // Handle sign out
  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    navigate("/auth/sign-in");
  };

  return (
    <Container size="lg" px="xs" style={{ display: "flex", justifyContent: "center" }}>
      <title>Admin Schedule - MyOnCall</title>

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
                      {currentUser.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase()
                        .substring(0, 2)}
                    </Avatar>
                  }>
                  {currentUser.name}
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item leftSection={<IconUser size={14} />}>Admin Profile</Menu.Item>
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
            Admin Schedule Management
          </Title>
          <Text size="lg" c="dimmed" className="secondary">
            Manage on-call schedules and assignments for your team
          </Text>
        </Box>

        {/* Main Content Area with Tabs */}
        <Card shadow="sm" withBorder radius="md" mb={30} pos="relative" padding={0}>
          <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />

          <Card.Section withBorder inheritPadding py="md" px="lg">
            <Group justify="space-between">
              <Group>
                <ThemeIcon color="blue" variant="light" size={32} radius="xl">
                  <IconCalendarStats size="1.3rem" stroke={1.5} />
                </ThemeIcon>
                <Title order={3}>Team Schedule</Title>
              </Group>
              <Badge size="lg" color="blue">
                {teamMembers.length} Team Members
              </Badge>
            </Group>
          </Card.Section>

          <Tabs value={activeTab} onChange={setActiveTab} radius="md" mt="md" style={{ padding: "0 20px 20px" }}>
            <Tabs.List grow mb="md">
              <Tabs.Tab value="schedule" leftSection={<IconCalendarEvent size="0.9rem" />}>
                View Schedule
              </Tabs.Tab>
              <Tabs.Tab value="team" leftSection={<IconUsers size="0.9rem" />}>
                Team Members
              </Tabs.Tab>
              <Tabs.Tab value="holidays" leftSection={<IconCalendarCheck size="0.9rem" />}>
                Holidays
              </Tabs.Tab>
            </Tabs.List>

            {/* Schedule Tab */}
            <Tabs.Panel value="schedule" p="md">
              <Box mb="md">
                <Group position="apart" mb="md">
                  <Group>
                    <MonthPickerInput label="Select Month" placeholder="Pick month" value={selectedMonth} onChange={setSelectedMonth} mx="auto" maw={200} />
                    <Text fw={700} size="lg" style={{ marginTop: 25 }}>
                      {getMonthYearString(selectedMonth)}
                    </Text>
                  </Group>

                  <Group>
                    <Button variant={editMode ? "filled" : "light"} color={editMode ? "blue" : "gray"} leftSection={<IconEdit size="1rem" />} onClick={handleToggleEditMode}>
                      {editMode ? "Exit Edit Mode" : "Edit Schedule"}
                    </Button>
                    {editMode && (
                      <Button variant="light" leftSection={<IconCalendarStats size="1rem" />} onClick={handleBulkEdit}>
                        Bulk Assign
                      </Button>
                    )}
                  </Group>
                </Group>

                {/* Calendar header */}
                <SimpleGrid cols={7} mb="xs">
                  {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                    <Box
                      key={day}
                      p="xs"
                      ta="center"
                      fw={600}
                      style={{
                        background: "var(--mantine-color-blue-1)",
                        borderRadius: "var(--mantine-radius-sm)",
                      }}>
                      {day}
                    </Box>
                  ))}
                </SimpleGrid>

                {scheduleByWeek.length > 0 ? (
                  /* Calendar grid */
                  scheduleByWeek.map((week, weekIndex) => (
                    <SimpleGrid cols={7} key={weekIndex} mb="xs">
                      {week.map((day, dayIndex) => (
                        <Box
                          key={`${weekIndex}-${dayIndex}`}
                          p={day ? "sm" : "xs"}
                          style={{
                            minHeight: "120px",
                            border: "1px solid var(--mantine-color-gray-3)",
                            borderRadius: "var(--mantine-radius-sm)",
                            position: "relative",
                            ...(day &&
                              getDayStyle(
                                day.date,
                                day.day === 0 || day.day === 6, // Weekend check
                                day.holiday !== null
                              )),
                          }}>
                          {day ? (
                            <>
                              <Box mb="xs" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Text fw={600} size="lg">
                                  {new Date(day.date).getDate()}
                                </Text>

                                {editMode && (
                                  <ActionIcon variant="light" color="blue" onClick={() => handleEditDate(day)}>
                                    <IconEdit size="1rem" />
                                  </ActionIcon>
                                )}
                              </Box>

                              {day.holiday && (
                                <Badge size="sm" color="red" variant="light" mb="xs" fullWidth>
                                  {day.holiday.name}
                                </Badge>
                              )}

                              <Stack gap="xs" mt="xs">
                                {day.assignees &&
                                  day.assignees.map((person) => (
                                    <Group key={person.id} gap="xs" wrap="nowrap">
                                      <Avatar color={person.avatar.color} radius="xl" size="sm">
                                        {person.avatar.initials}
                                      </Avatar>
                                      <Text size="xs" lineClamp={1}>
                                        {person.name}
                                      </Text>
                                    </Group>
                                  ))}

                                {(!day.assignees || day.assignees.length === 0) && (
                                  <Text size="xs" fs="italic" c="dimmed">
                                    No assignees
                                  </Text>
                                )}
                              </Stack>
                            </>
                          ) : null}
                        </Box>
                      ))}
                    </SimpleGrid>
                  ))
                ) : (
                  <Alert icon={<IconAlertCircle size="1rem" />} title="No schedule data" color="blue">
                    There is no schedule data available for the selected month. Generate a schedule or select a different month.
                  </Alert>
                )}

                {/* Legend */}
                <Box mt="lg" p="md" style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: "var(--mantine-radius-md)" }}>
                  <Title order={5} mb="md">
                    Schedule Legend
                  </Title>
                  <SimpleGrid cols={{ base: 1, xs: 2, sm: 4 }} spacing="md">
                    <Group>
                      <Box style={{ width: 16, height: 16, background: "rgba(51, 154, 240, 0.1)", borderLeft: "4px solid var(--mantine-color-blue-6)" }}></Box>
                      <Text size="sm">Today</Text>
                    </Group>
                    <Group>
                      <Box style={{ width: 16, height: 16, background: "rgba(255, 82, 82, 0.1)", borderLeft: "4px solid var(--mantine-color-red-6)" }}></Box>
                      <Text size="sm">Holiday</Text>
                    </Group>
                    <Group>
                      <Box style={{ width: 16, height: 16, background: "rgba(0, 0, 0, 0.03)", borderLeft: "4px solid var(--mantine-color-gray-5)" }}></Box>
                      <Text size="sm">Weekend</Text>
                    </Group>
                    <Group>
                      <Avatar color="blue" radius="xl" size="xs">
                        JD
                      </Avatar>
                      <Text size="sm">Team Member</Text>
                    </Group>
                  </SimpleGrid>
                </Box>
              </Box>
            </Tabs.Panel>

            {/* Team Members Tab */}
            <Tabs.Panel value="team" p="md">
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                {teamMembers.map((member) => (
                  <Card key={member.id} shadow="sm" withBorder p="md">
                    <Group align="flex-start">
                      <Avatar color={member.avatar.color} radius="xl" size="lg">
                        {member.avatar.initials}
                      </Avatar>
                      <Box>
                        <Text fw={600}>{member.name}</Text>
                        <Text size="sm" c="dimmed">
                          {member.email}
                        </Text>
                        <Badge mt="xs" variant="dot" color={member.availability === "high" ? "green" : member.availability === "medium" ? "yellow" : "red"}>
                          {member.availability === "high" ? "High Availability" : member.availability === "medium" ? "Medium Availability" : "Low Availability"}
                        </Badge>
                      </Box>
                    </Group>
                  </Card>
                ))}

                <Card shadow="sm" withBorder p="md" style={{ border: "1px dashed var(--mantine-color-blue-5)" }}>
                  <Group justify="center" style={{ height: "100%" }}>
                    <Button variant="light" leftSection={<IconUserPlus size="1.2rem" />} onClick={() => setInviteModalOpened(true)}>
                      Add Team Member
                    </Button>
                  </Group>
                </Card>
              </SimpleGrid>
            </Tabs.Panel>

            {/* Holidays Tab */}
            <Tabs.Panel value="holidays" p="md">
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Title order={4} mb="md">
                    Fixed Date Holidays
                  </Title>
                  <Stack>
                    {holidays
                      .filter((h) => h.type === "fixed")
                      .map((holiday) => (
                        <Paper key={holiday.id} shadow="sm" withBorder p="md" style={{ borderLeft: "3px solid var(--mantine-color-red-6)" }}>
                          <Group justify="space-between">
                            <div>
                              <Text fw={600}>{holiday.name}</Text>
                              <Text size="sm" c="dimmed">
                                {new Date(holiday.date).toLocaleDateString(undefined, { month: "long", day: "numeric" })} (every year)
                              </Text>
                            </div>
                            <Tooltip label="Holiday details">
                              <ActionIcon color="blue" variant="light">
                                <IconInfoCircle size="1.1rem" />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Paper>
                      ))}
                  </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Title order={4} mb="md">
                    Variable Date Holidays
                  </Title>
                  <Stack>
                    {holidays
                      .filter((h) => h.type === "variable")
                      .map((holiday) => (
                        <Paper key={holiday.id} shadow="sm" withBorder p="md" style={{ borderLeft: "3px solid var(--mantine-color-orange-6)" }}>
                          <Group justify="space-between">
                            <div>
                              <Text fw={600}>{holiday.name}</Text>
                              <Text size="sm" c="dimmed">
                                {new Date(holiday.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                              </Text>
                            </div>
                            <Badge color="orange" variant="light">
                              Variable Date
                            </Badge>
                          </Group>
                        </Paper>
                      ))}

                    <Paper shadow="sm" withBorder p="sm" style={{ border: "1px dashed var(--mantine-color-blue-5)" }}>
                      <Group justify="center">
                        <Button variant="light" leftSection={<IconPlus size="1rem" />} compact component="a" href="/admin/holidays">
                          Manage Holidays
                        </Button>
                      </Group>
                    </Paper>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Tabs.Panel>
          </Tabs>
        </Card>

        {/* Bottom action card */}
        <Card shadow="sm" withBorder radius="md" p="md">
          <Group justify="space-between">
            <Text fw={500}>Need help with scheduling?</Text>
            <Button variant="light" leftSection={<IconCalendarEvent size="1rem" />} onClick={handleGenerateSchedule}>
              Generate Automated Schedule
            </Button>
          </Group>
        </Card>
      </Paper>

      {/* Edit assignees drawer */}
      <Drawer opened={drawerOpened} onClose={() => setDrawerOpened(false)} title={<Title order={4}>Edit Assigned Team Members</Title>} position="right" padding="md" size="md" overlayProps={{ blur: 2 }}>
        {selectedDate && (
          <Box>
            <Group mb="lg">
              <ThemeIcon color="blue" size="lg" radius="xl">
                <IconCalendarEvent size="1.2rem" />
              </ThemeIcon>
              <div>
                <Text fw={600} size="lg">
                  {new Date(selectedDate.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
                {selectedDate.holiday && (
                  <Badge color="red" variant="light">
                    {selectedDate.holiday.name}
                  </Badge>
                )}
              </div>
            </Group>

            <form onSubmit={form.onSubmit(handleSaveAssignees)}>
              <Text fw={600} mb="sm">
                Assign Team Members:
              </Text>

              <Alert color="blue" mb="md">
                <Text size="sm">Only one team member should be assigned per day according to current policy.</Text>
              </Alert>

              <Stack spacing="md" mb="xl">
                {teamMembers.map((member) => (
                  <Checkbox
                    key={member.id}
                    value={member.id.toString()}
                    label={
                      <Group gap="sm">
                        <Avatar color={member.avatar.color} radius="xl" size="sm">
                          {member.avatar.initials}
                        </Avatar>
                        <div>
                          <Text size="sm">{member.name}</Text>
                          <Text size="xs" c="dimmed">
                            {member.email}
                          </Text>
                        </div>
                        <Badge size="xs" variant="dot" color={member.availability === "high" ? "green" : member.availability === "medium" ? "yellow" : "red"}>
                          {member.availability}
                        </Badge>
                      </Group>
                    }
                    checked={form.values.assignees.includes(member.id.toString())}
                    onChange={(event) => {
                      const checked = event.currentTarget.checked;
                      const value = member.id.toString();

                      if (checked) {
                        // If this checkbox is being checked, uncheck all others first
                        form.setFieldValue("assignees", [value]);
                      } else {
                        // If this checkbox is being unchecked, just remove it
                        form.setFieldValue(
                          "assignees",
                          form.values.assignees.filter((item) => item !== value)
                        );
                      }
                    }}
                  />
                ))}
              </Stack>

              <Group justify="flex-end" mt="xl">
                <Button variant="default" onClick={() => setDrawerOpened(false)}>
                  Cancel
                </Button>
                <Button type="submit" color="blue">
                  Save Changes
                </Button>
              </Group>
            </form>
          </Box>
        )}
      </Drawer>

      {/* Bulk Edit Modal */}
      <Modal opened={modalOpened} onClose={() => setModalOpened(false)} title={<Title order={4}>Bulk Assignment</Title>} size="lg" centered>
        <Box>
          <Alert color="blue" mb="md">
            <Text size="sm">Bulk assignment lets you assign team members to multiple dates at once based on criteria you select.</Text>
          </Alert>

          <form onSubmit={bulkEditForm.onSubmit(handleBulkAssign)}>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
              <DatePickerInput type="range" label="Date Range" placeholder="Select dates" allowSingleDateInRange withAsterisk {...bulkEditForm.getInputProps("dateRange")} />

              <Select
                label="Assignment Pattern"
                placeholder="Select pattern"
                data={[
                  { value: "all", label: "All Days" },
                  { value: "weekdays", label: "Weekdays Only" },
                  { value: "weekends", label: "Weekends Only" },
                  { value: "alternating", label: "Alternating Days" },
                ]}
                {...bulkEditForm.getInputProps("pattern")}
              />
            </SimpleGrid>

            <Title order={5} mb="sm">
              Select Team Members
            </Title>
            <Stack spacing="xs" mb="xl">
              {teamMembers.map((member) => (
                <Checkbox
                  key={member.id}
                  value={member.id.toString()}
                  label={
                    <Group gap="sm">
                      <Avatar color={member.avatar.color} radius="xl" size="sm">
                        {member.avatar.initials}
                      </Avatar>
                      <Text size="sm">{member.name}</Text>
                    </Group>
                  }
                  {...bulkEditForm.getInputProps("selectedMembers", { type: "checkbox" })}
                />
              ))}
            </Stack>

            <Divider my="md" />

            <Group justify="flex-end">
              <Button variant="default" onClick={() => setModalOpened(false)}>
                Cancel
              </Button>
              <Button color="blue" type="submit">
                Apply Assignments
              </Button>
            </Group>
          </form>
        </Box>
      </Modal>

      {/* Invite Team Member Modal */}
      <Modal opened={inviteModalOpened} onClose={() => setInviteModalOpened(false)} title={<Title order={4}>Invite Team Member</Title>} size="md" centered>
        <form onSubmit={inviteForm.onSubmit(handleInviteSubmit)}>
          <TextInput label="Email Address" placeholder="Enter team member's email" withAsterisk {...inviteForm.getInputProps("email")} />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setInviteModalOpened(false)}>
              Cancel
            </Button>
            <Button type="submit" color="blue">
              Send Invite
            </Button>
          </Group>
        </form>
      </Modal>

      {/* Success Modal */}
      <Modal opened={successModalOpened} onClose={() => setSuccessModalOpened(false)} title={<Title order={4}>Invite Sent</Title>} size="sm" centered>
        <Text>
          An invitation has been sent to <strong>{invitedEmail}</strong>. They will be added to the team once they accept the invitation.
        </Text>
        <Group justify="flex-end" mt="md">
          <Button onClick={() => setSuccessModalOpened(false)}>Close</Button>
        </Group>
      </Modal>
    </Container>
  );
}
