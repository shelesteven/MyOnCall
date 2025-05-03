import "@mantine/dates/styles.css";

import { useState } from "react";
import { Button, Group, TextInput, ThemeIcon, ActionIcon, Title, Text, Checkbox, NumberInput, SimpleGrid, Paper, Badge, Card, Container, Divider, Box, Stack, Tooltip } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconTrash, IconCalendarEvent, IconPlus, IconCalendarPlus, IconCalendarDue } from "@tabler/icons-react";

// Mock data structure update:
// - isVariableDate: boolean
// - month, day: for fixed holidays (e.g., 1, 1 for Jan 1st)
// - specificDates: array of "YYYY-MM-DD" strings for variable holidays
const initialHolidays = [
  { id: 1, name: "New Year's Day", isVariableDate: false, month: 1, day: 1 },
  { id: 2, name: "Independence Day", isVariableDate: false, month: 7, day: 4 },
  { id: 3, name: "Christmas Day", isVariableDate: false, month: 12, day: 25 },
  { id: 4, name: "Easter Sunday", isVariableDate: true, specificDates: ["2025-04-20", "2026-04-05"] }, // Example variable holiday
];

// Helper to format month/day
const formatMonthDay = (month, day) => {
  if (!month || !day) return "";
  const date = new Date(2000, month - 1, day); // Use a dummy year for formatting
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric" });
};

export default function AdminHolidays() {
  const [holidays, setHolidays] = useState(initialHolidays);
  // State to manage the date input for adding specific dates to variable holidays
  const [specificDateInputs, setSpecificDateInputs] = useState({}); // { holidayId: dateValue }

  const form = useForm({
    initialValues: {
      holidayName: "",
      isVariableDate: false,
      month: "", // Use string to allow empty initial state for NumberInput
      day: "", // Use string to allow empty initial state for NumberInput
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

  const handleCreateHoliday = (values) => {
    let newHoliday;
    if (values.isVariableDate) {
      newHoliday = {
        id: Date.now(),
        name: values.holidayName,
        isVariableDate: true,
        specificDates: [], // Initialize with empty array
      };
    } else {
      newHoliday = {
        id: Date.now(),
        name: values.holidayName,
        isVariableDate: false,
        month: Number(values.month),
        day: Number(values.day),
      };
    }

    setHolidays([...holidays, newHoliday]);
    form.reset();
  };

  const handleDeleteHoliday = (idToDelete) => {
    setHolidays(holidays.filter((holiday) => holiday.id !== idToDelete));
  };

  // Handler for adding a specific date to a variable holiday
  const handleAddSpecificDate = (holidayId) => {
    const dateToAdd = specificDateInputs[holidayId];
    if (!dateToAdd) return; // No date selected

    const formattedDate = dateToAdd.toISOString().split("T")[0];

    setHolidays(
      holidays.map((holiday) => {
        if (holiday.id === holidayId && holiday.isVariableDate) {
          // Avoid adding duplicate dates
          if (!holiday.specificDates.includes(formattedDate)) {
            return { ...holiday, specificDates: [...holiday.specificDates, formattedDate].sort() };
          }
        }
        return holiday;
      })
    );

    // Clear the input for this specific holiday
    setSpecificDateInputs((prev) => ({ ...prev, [holidayId]: null }));
  };

  // Handler for removing a specific date from a variable holiday
  const handleRemoveSpecificDate = (holidayId, dateToRemove) => {
    setHolidays(
      holidays.map((holiday) => {
        if (holiday.id === holidayId && holiday.isVariableDate) {
          return { ...holiday, specificDates: holiday.specificDates.filter((d) => d !== dateToRemove) };
        }
        return holiday;
      })
    );
  };

  // Handler for updating the date input state for a specific holiday
  const handleSpecificDateInputChange = (holidayId, value) => {
    setSpecificDateInputs((prev) => ({ ...prev, [holidayId]: value }));
  };

  return (
    <Container size="lg" px="xs">
      <title>Holidays - MyOnCall</title>
      <Box className="section" mb={30}>
        <Title order={1} className="primary" mb="xs">
          Manage Holidays
        </Title>
        <Text size="lg" c="dimmed" className="secondary">
          Configure holidays for your on-call schedule
        </Text>
      </Box>

      {/* Existing Holidays List - Updated */}
      <Card shadow="sm" padding="lg" radius="md" withBorder mb={30}>
        <Card.Section withBorder inheritPadding py="xs" mb="md">
          <Group justify="space-between">
            <Group>
              <IconCalendarDue size={20} />
              <Title order={3}>Existing Holidays</Title>
            </Group>
            <Badge>{holidays.length}</Badge>
          </Group>
        </Card.Section>

        {holidays.length > 0 ? (
          <Stack>
            {holidays.map((holiday) => (
              <Paper
                key={holiday.id}
                shadow="xs"
                p="md"
                withBorder
                radius="md"
                style={{
                  borderLeft: `4px solid ${holiday.isVariableDate ? "var(--mantine-color-orange-6)" : "var(--mantine-color-blue-6)"}`,
                }}>
                <Group justify="space-between" mb="xs">
                  <Group>
                    <ThemeIcon color={holiday.isVariableDate ? "orange" : "blue"} variant="light" size={32} radius="xl">
                      <IconCalendarEvent size="1.2rem" />
                    </ThemeIcon>
                    <Stack gap={0}>
                      <Text fw={600} size="lg">
                        {holiday.name}
                      </Text>
                      <Badge variant="dot" color={holiday.isVariableDate ? "orange" : "blue"}>
                        {holiday.isVariableDate ? "Variable Date" : "Fixed Date"}
                      </Badge>
                    </Stack>
                  </Group>
                  <Tooltip label="Delete holiday" position="left" withArrow>
                    <ActionIcon color="red" variant="light" onClick={() => handleDeleteHoliday(holiday.id)} radius="xl" size="lg">
                      <IconTrash size="1.2rem" />
                    </ActionIcon>
                  </Tooltip>
                </Group>

                {holiday.isVariableDate ? (
                  <Box mt="md">
                    <Text size="sm" fw={500} mb="xs">
                      Specific Occurrences:
                    </Text>
                    {holiday.specificDates.length > 0 ? (
                      <Group gap="xs" mb="md">
                        {holiday.specificDates.map((date) => (
                          <Badge
                            key={date}
                            variant="outline"
                            size="lg"
                            rightSection={
                              <ActionIcon size="xs" color="gray" radius="xl" variant="transparent" onClick={() => handleRemoveSpecificDate(holiday.id, date)}>
                                <IconTrash size="0.75rem" />
                              </ActionIcon>
                            }>
                            {date}
                          </Badge>
                        ))}
                      </Group>
                    ) : (
                      <Text size="sm" c="dimmed" mb="md" fs="italic">
                        No specific dates added yet.
                      </Text>
                    )}

                    <Divider my="sm" variant="dashed" />

                    {/* Add Specific Date Form */}
                    <Group gap="xs">
                      <DatePickerInput
                        placeholder="Add specific date"
                        valueFormat="YYYY-MM-DD"
                        size="sm"
                        style={{ flexGrow: 1 }}
                        value={specificDateInputs[holiday.id] || null}
                        onChange={(value) => handleSpecificDateInputChange(holiday.id, value)}
                        rightSection={
                          <ActionIcon color="blue" variant="subtle" onClick={() => handleAddSpecificDate(holiday.id)} disabled={!specificDateInputs[holiday.id]}>
                            <IconPlus size="1rem" />
                          </ActionIcon>
                        }
                      />
                    </Group>
                  </Box>
                ) : (
                  <Box pl="md" mt="xs">
                    <Text fw={500} size="md">
                      {formatMonthDay(holiday.month, holiday.day)}
                    </Text>
                  </Box>
                )}
              </Paper>
            ))}
          </Stack>
        ) : (
          <Box py={30} ta="center">
            <Text fs="italic" c="dimmed">
              No holidays defined yet.
            </Text>
          </Box>
        )}
      </Card>

      {/* Create New Holiday Form - Updated */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs" mb="md">
          <Group>
            <IconCalendarPlus size={20} />
            <Title order={3}>Create New Holiday</Title>
          </Group>
        </Card.Section>

        <form className="form" onSubmit={form.onSubmit(handleCreateHoliday)}>
          <TextInput label="Holiday Name" placeholder="e.g., Thanksgiving or Easter Sunday" mb="md" {...form.getInputProps("holidayName")} />

          <Checkbox label="Date varies year-to-year (e.g., Easter)" description="Check this for holidays without a fixed date in the calendar" mb="md" {...form.getInputProps("isVariableDate", { type: "checkbox" })} />

          {/* Conditionally render date inputs */}
          {!form.values.isVariableDate && (
            <Box mb="md">
              <Text size="sm" mb="xs">
                Fixed Date
              </Text>
              <SimpleGrid cols={{ base: 1, xs: 2 }}>
                <NumberInput label="Month" placeholder="e.g., 1 for January" min={1} max={12} step={1} {...form.getInputProps("month")} />
                <NumberInput label="Day" placeholder="e.g., 1 for the 1st" min={1} max={31} step={1} {...form.getInputProps("day")} />
              </SimpleGrid>
            </Box>
          )}

          <Group justify="flex-end" mt="xl">
            <Button type="submit" leftSection={<IconPlus size="1rem" />} variant="filled" size="md">
              Create Holiday
            </Button>
          </Group>
        </form>
      </Card>
    </Container>
  );
}
