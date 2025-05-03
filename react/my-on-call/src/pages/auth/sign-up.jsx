import { Button, Group, TextInput, Card, Container, Box, Title, Text, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconUserPlus } from "@tabler/icons-react";

export default function SignUp() {
  const form = useForm({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      admin: false,
    },
    validate: {
      first_name: (value) => (value.length < 2 ? "First name must be at least 2 characters long" : null),
      last_name: (value) => (value.length < 2 ? "Last name must be at least 2 characters long" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  return (
    <Container size="lg" px="xs">
      <title>Sign Up - MyOnCall</title>
      <Box className="section" mb={30}>
        <Title order={1} className="primary" mb="xs">
          Create User Account
        </Title>
        <Text size="lg" c="dimmed" className="secondary">
          Create a user account to view the on-call schedule
        </Text>
      </Box>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs" mb="md">
          <Group>
            <IconUserPlus size={20} />
            <Title order={3}>User Information</Title>
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
              Create User Account
            </Button>
          </Group>
        </form>
      </Card>
    </Container>
  );
}
