import { Button, Group, TextInput, Title, Text, Card, Container, Box, Stack, Paper, Divider, Badge } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconUserPlus, IconArrowLeft, IconCheck, IconShieldLock } from "@tabler/icons-react";

export default function AdminSignUp() {
  const form = useForm({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      admin: true,
    },
    validate: {
      first_name: (value) => (value.length < 2 ? "First name must be at least 2 characters long" : null),
      last_name: (value) => (value.length < 2 ? "Last name must be at least 2 characters long" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  const handleSubmit = (values) => {
    console.log(values);
    // Add form submission logic here
  };

  return (
    <Container size="sm" px="xs" className="form-container">
      <title>Admin Sign Up - MyOnCall</title>

      <Paper shadow="xs" p="md" withBorder radius="md" mb="lg">
        <Group mb="md">
          <Button variant="subtle" leftSection={<IconArrowLeft size="1rem" />} component="a" href="/" compact>
            Back to Home
          </Button>
        </Group>

        <Box className="section" mb={30}>
          <Title order={1} className="primary" mb="xs">
            Create Admin Account
          </Title>
          <Text size="lg" c="dimmed" className="secondary" mb="md">
            Set up an admin account to manage on-call schedules for your organization
          </Text>
          <Badge color="blue" size="lg" radius="md" variant="light" mb="lg">
            Organization Administrator
          </Badge>
        </Box>

        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="md" mb="md">
            <Group>
              <IconShieldLock size={24} stroke={1.5} color="var(--primary-color)" />
              <Title order={3}>Admin Information</Title>
            </Group>
          </Card.Section>

          <Divider label="All fields are required" labelPosition="center" my="md" />

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack spacing="lg">
              <TextInput label="First Name" placeholder="Enter your first name" withAsterisk {...form.getInputProps("first_name")} />

              <TextInput label="Last Name" placeholder="Enter your last name" withAsterisk {...form.getInputProps("last_name")} />

              <TextInput label="Email" placeholder="Enter your email address" withAsterisk description="This will be your admin login" {...form.getInputProps("email")} />
            </Stack>

            <Group position="apart" mt="xl">
              <Button variant="outline" component="a" href="/" leftSection={<IconArrowLeft size="1rem" />}>
                Cancel
              </Button>

              <Button type="submit" leftSection={<IconUserPlus size="1rem" />} variant="filled" color="blue">
                Create Admin Account
              </Button>
            </Group>
          </form>
        </Card>
      </Paper>
    </Container>
  );
}
