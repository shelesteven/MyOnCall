import "@mantine/dates/styles.css";

import { useState, useEffect } from "react";
import { Button, Group, TextInput, ThemeIcon, ActionIcon, Title, Text, NumberInput, SimpleGrid, Paper, Badge, Card, Container, Divider, Box, Stack, Tooltip, Tabs, Alert, LoadingOverlay } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconTrash, IconCalendarEvent, IconPlus, IconCalendarPlus, IconCalendarDue, IconAlertCircle, IconHome } from "@tabler/icons-react";
import { useNavigate } from "react-router";

// Import our client-side data management utilities
import { getAllHolidays, addHoliday } from "../../utils/dataManagement";
import { isAuthenticated, isAdmin } from "../../utils/auth";

// Helper to format month/day
const formatMonthDay = (month, day) => {
  if (!month || !day) return "";
  const date = new Date(2000, month - 1, day); // Use a dummy year for formatting
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric" });
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

// Paper style for holiday items
const holidayPaperStyle = {
  width: "100%",
  marginLeft: "auto",
  marginRight: "auto",
};

export default function AdminHolidays() {
  const navigate = useNavigate();
  const [holidays, setHolidays] = useState([]);
  const [activeTab, setActiveTab] = useState("fixed");
  // State to manage the date input for adding specific dates to variable holidays
  const [specificDateInputs, setSpecificDateInputs] = useState({}); // { holidayId: dateValue }
  const [loading, setLoading] = useState(true); // Start with loading state

  // Check authentication on component mount
  useEffect(() => {
    // Verify admin status
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        navigate("/auth/sign-in");
        return;
      }

      if (!isAdmin()) {
        navigate("/schedules"); // Redirect non-admin users
        return;
      }

      // Load holidays data
      try {
        const holidaysData = await getAllHolidays();
        setHolidays(holidaysData);
      } catch (error) {
        console.error("Error loading holidays:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const form = useForm({
    initialValues: {
      holidayName: "",
      isVariableDate: activeTab === "variable",
      month: "",
      day: "",
    },
    validate: (values) => {
      const errors = {};
      if (!values.holidayName.trim()) {
        errors.holidayName = "Holiday name is required";
      }
      if (!values.isVariableDate) {
        if (!values.month || values.month < 1 || values.month > 12) {
          errors.month = "Invalid month (1-12)";
        }
        if (!values.day || values.day < 1 || values.day > 31) {
          // Basic day validation
          errors.day = "Invalid day (1-31)";
        }
      }
      return errors;
    },
  });

  const handleTabChange = (value) => {
    setActiveTab(value);
    form.setValues({ ...form.values, isVariableDate: value === "variable" });
  };

  const handleCreateHoliday = async (values) => {
    setLoading(true);

    try {
      let newHoliday;
      if (values.isVariableDate) {
        newHoliday = {
          name: values.holidayName,
          type: "variable",
          specificDates: [], // Initialize with empty array
          date: new Date().toISOString().split("T")[0], // Use current date as placeholder for variable holidays
        };
      } else {
        // Format date as YYYY-MM-DD using current year
        const currentYear = new Date().getFullYear();
        const formattedDate = `${currentYear}-${String(values.month).padStart(2, "0")}-${String(values.day).padStart(2, "0")}`;

        newHoliday = {
          name: values.holidayName,
          type: "fixed",
          date: formattedDate,
          month: Number(values.month),
          day: Number(values.day),
        };
      }

      // Add the holiday using our data management utility
      await addHoliday(newHoliday);

      // Refresh holidays list
      const updatedHolidays = await getAllHolidays();
      setHolidays(updatedHolidays);

      // Reset form
      form.reset();
    } catch (error) {
      console.error("Error creating holiday:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHoliday = async (idToDelete) => {
    setLoading(true);

    try {
      // Filter out locally first for immediate UI feedback
      setHolidays(holidays.filter((holiday) => holiday.id !== idToDelete));

      // In a real implementation, we would call an API here
      // For now, we'll just update localStorage directly
      const updatedHolidays = holidays.filter((holiday) => holiday.id !== idToDelete);
      localStorage.setItem("moc_holidays", JSON.stringify(updatedHolidays));
    } catch (error) {
      console.error("Error deleting holiday:", error);
      // Refresh the holidays list to ensure consistent state
      const refreshedHolidays = await getAllHolidays();
      setHolidays(refreshedHolidays);
    } finally {
      setLoading(false);
    }
  };

  // Handler for adding a specific date to a variable holiday
  const handleAddSpecificDate = async (holidayId) => {
    const dateToAdd = specificDateInputs[holidayId];
    if (!dateToAdd) return; // No date selected

    setLoading(true);
    const formattedDate = dateToAdd.toISOString().split("T")[0];

    try {
      // Update locally first for immediate UI feedback
      const updatedHolidays = holidays.map((holiday) => {
        if (holiday.id === holidayId && holiday.type === "variable") {
          // Avoid adding duplicate dates
          if (!holiday.specificDates) {
            holiday.specificDates = [];
          }
          if (!holiday.specificDates.includes(formattedDate)) {
            return {
              ...holiday,
              specificDates: [...(holiday.specificDates || []), formattedDate].sort(),
            };
          }
        }
        return holiday;
      });

      setHolidays(updatedHolidays);

      // In a real implementation, we would call an API here
      // For now, we'll just update localStorage directly
      localStorage.setItem("moc_holidays", JSON.stringify(updatedHolidays));

      // Clear the input for this specific holiday
      setSpecificDateInputs((prev) => ({ ...prev, [holidayId]: null }));
    } catch (error) {
      console.error("Error adding specific date:", error);
      // Refresh the holidays list to ensure consistent state
      const refreshedHolidays = await getAllHolidays();
      setHolidays(refreshedHolidays);
    } finally {
      setLoading(false);
    }
  };

  // Handler for removing a specific date from a variable holiday
  const handleRemoveSpecificDate = async (holidayId, dateToRemove) => {
    setLoading(true);

    try {
      // Update locally first for immediate UI feedback
      const updatedHolidays = holidays.map((holiday) => {
        if (holiday.id === holidayId && holiday.type === "variable") {
          return {
            ...holiday,
            specificDates: (holiday.specificDates || []).filter((d) => d !== dateToRemove),
          };
        }
        return holiday;
      });

      setHolidays(updatedHolidays);

      // In a real implementation, we would call an API here
      // For now, we'll just update localStorage directly
      localStorage.setItem("moc_holidays", JSON.stringify(updatedHolidays));
    } catch (error) {
      console.error("Error removing specific date:", error);
      // Refresh the holidays list to ensure consistent state
      const refreshedHolidays = await getAllHolidays();
      setHolidays(refreshedHolidays);
    } finally {
      setLoading(false);
    }
  };

  // Handler for updating the date input state for a specific holiday
  const handleSpecificDateInputChange = (holidayId, value) => {
    setSpecificDateInputs((prev) => ({ ...prev, [holidayId]: value }));
  };

  // Filter holidays by type
  const fixedHolidays = holidays.filter((h) => h.type === "fixed");
  const variableHolidays = holidays.filter((h) => h.type === "variable");

  return (
    <Container size="lg" px="xs" style={{ display: "flex", justifyContent: "center" }}>
      <title>Holidays - MyOnCall</title>

      <Paper style={{ ...paperStyle }} shadow="xs" p="md" withBorder radius="md" mb="lg">
        <Group mb="md">
          <Button variant="subtle" leftSection={<IconHome size="1rem" />} component="a" href="/admin/schedules" compact>
            Dashboard
          </Button>
        </Group>

        <Box className="section" mb={30}>
          <Title order={1} className="primary" mb="xs">
            Manage Holidays
          </Title>
          <Text size="lg" c="dimmed" className="secondary">
            Configure holidays for your on-call schedule
          </Text>
        </Box>

        {/* Main Content Area with Tabs */}
        <Card shadow="sm" withBorder radius="md" mb={30} pos="relative" padding={0}>
          <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />

          <Card.Section withBorder inheritPadding py="md" px="lg">
            <Group justify="space-between">
              <Group>
                <ThemeIcon color="blue" variant="light" size={32} radius="xl">
                  <IconCalendarDue size="1.3rem" stroke={1.5} />
                </ThemeIcon>
                <Title order={3}>Holidays Management</Title>
              </Group>
              <Badge size="lg">
                {holidays.length} {holidays.length === 1 ? "Holiday" : "Holidays"}
              </Badge>
            </Group>
          </Card.Section>

          <Tabs value={activeTab} onChange={handleTabChange} radius="md" mt="md" style={{ padding: "0 20px 20px" }}>
            <Tabs.List grow mb="md">
              <Tabs.Tab value="fixed" leftSection={<IconCalendarEvent size="0.9rem" />}>
                Fixed Date Holidays
                {fixedHolidays.length > 0 && (
                  <Badge size="sm" ml="xs" variant="light">
                    {fixedHolidays.length}
                  </Badge>
                )}
              </Tabs.Tab>
              <Tabs.Tab value="variable" leftSection={<IconCalendarPlus size="0.9rem" />}>
                Variable Date Holidays
                {variableHolidays.length > 0 && (
                  <Badge size="sm" ml="xs" variant="light">
                    {variableHolidays.length}
                  </Badge>
                )}
              </Tabs.Tab>
              <Tabs.Tab value="create" leftSection={<IconPlus size="0.9rem" />}>
                Create New Holiday
              </Tabs.Tab>
            </Tabs.List>

            {/* Fixed Date Holidays Tab */}
            <Tabs.Panel value="fixed" style={panelStyle}>
              <Box style={{ width: "100%", display: "flex", justifyContent: "center", padding: "0" }}>
                {fixedHolidays.length > 0 ? (
                  <Stack align="center" style={{ width: "100%", gap: "12px" }}>
                    {fixedHolidays.map((holiday) => (
                      <Paper
                        key={holiday.id}
                        shadow="xs"
                        p="md"
                        withBorder
                        radius="md"
                        style={{
                          ...holidayPaperStyle,
                          borderLeft: `4px solid var(--mantine-color-blue-6)`,
                        }}>
                        <Group justify="space-between" mb="xs">
                          <Group>
                            <ThemeIcon color="blue" variant="light" size={32} radius="xl">
                              <IconCalendarEvent size="1.2rem" />
                            </ThemeIcon>
                            <div>
                              <Text fw={600} size="lg">
                                {holiday.name}
                              </Text>
                              <Text size="sm" c="dimmed">
                                {formatMonthDay(holiday.month, holiday.day)} (Date: {holiday.date})
                              </Text>
                            </div>
                          </Group>
                          <Tooltip label="Delete holiday" position="left" withArrow>
                            <ActionIcon color="red" variant="light" onClick={() => handleDeleteHoliday(holiday.id)} radius="xl" size="lg">
                              <IconTrash size="1.2rem" />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Alert icon={<IconAlertCircle size="1rem" />} title="No fixed date holidays" color="blue" variant="light" style={holidayPaperStyle}>
                    You haven't added any holidays with a fixed calendar date yet. Create one using the "Create New Holiday" tab.
                  </Alert>
                )}
              </Box>
            </Tabs.Panel>

            {/* Variable Date Holidays Tab */}
            <Tabs.Panel value="variable" style={panelStyle}>
              <Box style={{ width: "100%", display: "flex", justifyContent: "center", padding: "0" }}>
                {variableHolidays.length > 0 ? (
                  <Stack align="center" style={{ width: "100%", gap: "12px" }}>
                    {variableHolidays.map((holiday) => (
                      <Paper
                        key={holiday.id}
                        shadow="xs"
                        p="md"
                        withBorder
                        radius="md"
                        style={{
                          ...holidayPaperStyle,
                          borderLeft: `4px solid var(--mantine-color-orange-6)`,
                        }}>
                        <Group justify="space-between" mb="xs">
                          <Group>
                            <ThemeIcon color="orange" variant="light" size={32} radius="xl">
                              <IconCalendarEvent size="1.2rem" />
                            </ThemeIcon>
                            <Stack gap={0}>
                              <Text fw={600} size="lg">
                                {holiday.name}
                              </Text>
                              <Badge variant="dot" color="orange" size="sm">
                                Variable Date
                              </Badge>
                            </Stack>
                          </Group>
                          <Tooltip label="Delete holiday" position="left" withArrow>
                            <ActionIcon color="red" variant="light" onClick={() => handleDeleteHoliday(holiday.id)} radius="xl" size="lg">
                              <IconTrash size="1.2rem" />
                            </ActionIcon>
                          </Tooltip>
                        </Group>

                        <Box mt="md" style={{ width: "100%" }}>
                          <Text size="sm" fw={500} mb="xs">
                            Specific Occurrences:
                          </Text>
                          <div style={{ width: "100%", minHeight: "40px" }}>
                            {holiday.specificDates && holiday.specificDates.length > 0 ? (
                              <div
                                style={{
                                  width: "100%",
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "8px",
                                  marginBottom: "16px",
                                  overflow: "hidden",
                                }}>
                                {holiday.specificDates.map((date) => (
                                  <Badge
                                    key={date}
                                    variant="outline"
                                    size="lg"
                                    style={{ marginBottom: "4px" }}
                                    rightSection={
                                      <ActionIcon size="xs" color="gray" radius="xl" variant="transparent" onClick={() => handleRemoveSpecificDate(holiday.id, date)}>
                                        <IconTrash size="0.75rem" />
                                      </ActionIcon>
                                    }>
                                    {date}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <Text size="sm" c="dimmed" mb="md" fs="italic">
                                No specific dates added yet.
                              </Text>
                            )}
                          </div>

                          <Divider my="sm" variant="dashed" />

                          {/* Add Specific Date Form */}
                          <Group gap="xs" style={{ width: "100%" }}>
                            <DatePickerInput placeholder="Add specific date" valueFormat="YYYY-MM-DD" size="sm" style={{ flexGrow: 1 }} value={specificDateInputs[holiday.id] || null} onChange={(value) => handleSpecificDateInputChange(holiday.id, value)} />
                            <Button variant="light" color="blue" onClick={() => handleAddSpecificDate(holiday.id)} disabled={!specificDateInputs[holiday.id]} leftSection={<IconPlus size="1rem" />} size="sm">
                              Add Date
                            </Button>
                          </Group>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Alert icon={<IconAlertCircle size="1rem" />} title="No variable date holidays" color="orange" variant="light" style={holidayPaperStyle}>
                    You haven't added any holidays with variable dates yet. Create one using the "Create New Holiday" tab.
                  </Alert>
                )}
              </Box>
            </Tabs.Panel>

            {/* Create New Holiday Tab */}
            <Tabs.Panel value="create" style={panelStyle}>
              <Box py="md" style={{ width: "100%", padding: "0" }}>
                <div className="create-holiday-container" style={{ width: "100%", position: "relative" }}>
                  <Tabs
                    value={form.values.isVariableDate ? "variable" : "fixed"}
                    onChange={(v) => form.setValues({ ...form.values, isVariableDate: v === "variable" })}
                    classNames={{
                      panel: "holiday-type-panel",
                    }}>
                    <Tabs.List grow mb="md" style={{ width: "100%" }}>
                      <Tabs.Tab value="fixed" leftSection={<IconCalendarEvent size="0.9rem" />}>
                        Fixed Date Holiday
                      </Tabs.Tab>
                      <Tabs.Tab value="variable" leftSection={<IconCalendarPlus size="0.9rem" />}>
                        Variable Date Holiday
                      </Tabs.Tab>
                    </Tabs.List>

                    <form onSubmit={form.onSubmit(handleCreateHoliday)} style={{ width: "100%" }}>
                      <TextInput label="Holiday Name" placeholder="e.g., Thanksgiving or Easter Sunday" mb="md" withAsterisk style={{ width: "100%" }} {...form.getInputProps("holidayName")} />

                      <div style={{ minHeight: "150px", width: "100%", position: "relative" }}>
                        <div style={{ position: "absolute", width: "100%" }}>
                          <Tabs.Panel value="fixed" style={{ ...panelStyle, position: "static" }}>
                            <Box mb="md" style={{ width: "100%" }}>
                              <Text size="sm" mb="xs" fw={500}>
                                Fixed Date (same day every year)
                              </Text>
                              <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
                                <NumberInput label="Month" placeholder="e.g., 1 for January" min={1} max={12} step={1} withAsterisk {...form.getInputProps("month")} />
                                <NumberInput label="Day" placeholder="e.g., 1 for the 1st" min={1} max={31} step={1} withAsterisk {...form.getInputProps("day")} />
                              </SimpleGrid>

                              {form.values.month && form.values.day && (
                                <Text size="sm" mt="xs" fw={500} c="blue">
                                  Will occur on: {formatMonthDay(form.values.month, form.values.day)}
                                </Text>
                              )}
                            </Box>
                          </Tabs.Panel>

                          <Tabs.Panel value="variable" style={{ ...panelStyle, position: "static" }}>
                            <Alert color="blue" mb="md" style={{ width: "100%" }}>
                              <Text size="sm">For holidays that occur on different dates each year (like Easter), create the holiday first and then add the specific dates for each year.</Text>
                            </Alert>
                          </Tabs.Panel>
                        </div>
                      </div>

                      <Group justify="flex-end" mt="xl" style={{ width: "100%" }}>
                        <Button type="submit" leftSection={<IconPlus size="1rem" />} variant="filled" size="md" color={form.values.isVariableDate ? "orange" : "blue"}>
                          Create Holiday
                        </Button>
                      </Group>
                    </form>
                  </Tabs>
                </div>
              </Box>
            </Tabs.Panel>
          </Tabs>
        </Card>
      </Paper>
    </Container>
  );
}
