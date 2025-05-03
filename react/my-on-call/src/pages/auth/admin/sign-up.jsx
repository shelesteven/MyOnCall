import { Button, Group, TextInput, Title, Text, Card, Container, Box, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconUserPlus } from "@tabler/icons-react";

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

  return (
    <Container size="lg" px="xs">
      <title>Admin Sign Up - MyOnCall</title>
      <Box className="section" mb={30}>
        <Title order={1} className="primary" mb="xs">
          Create Admin Account
        </Title>
        <Text size="lg" c="dimmed" className="secondary">
          Create an admin account to manage the on-call schedule
        </Text>
      </Box>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs" mb="md">
          <Group>
            <IconUserPlus size={20} />
            <Title order={3}>Admin Information</Title>
          </Group>
        </Card.Section>

        <form className="form" onSubmit={form.onSubmit((values) => console.log(values))}>
          <Stack>
            <TextInput label="First Name" placeholder="Enter your first name" {...form.getInputProps("first_name")} />
            <TextInput label="Last Name" placeholder="Enter your last name" {...form.getInputProps("last_name")} />
            <TextInput label="Email" placeholder="Enter your email address" {...form.getInputProps("email")} />
          </Stack>

          <Group justify="flex-end" mt="xl">
            <Button variant="outline" component="a" href="/">
              Cancel
            </Button>
            <Button type="submit" leftSection={<IconUserPlus size="1rem" />} variant="filled">
              Create Admin Account
            </Button>
          </Group>
        </form>
      </Card>
    </Container>
  );
}
