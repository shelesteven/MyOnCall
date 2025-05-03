import { Button, Group, TextInput, Card, Container, Box, Title, Text, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconLogin } from "@tabler/icons-react";

export default function SignIn() {
  const form = useForm({
    initialValues: {
      email: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  return (
    <Container size="lg" px="xs">
      <title>Sign In - MyOnCall</title>
      <Box className="section" mb={30}>
        <Title order={1} className="primary" mb="xs">
          Sign In
        </Title>
        <Text size="lg" c="dimmed" className="secondary">
          Sign in to view or manage the on-call schedule
        </Text>
      </Box>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs" mb="md">
          <Group>
            <IconLogin size={20} />
            <Title order={3}>Account Login</Title>
          </Group>
        </Card.Section>

        <form className="form" onSubmit={form.onSubmit((values) => console.log(values))}>
          <TextInput label="Email" placeholder="Enter your email address" {...form.getInputProps("email")} />

          <Group justify="flex-end" mt="xl">
            <Button variant="outline" component="a" href="/">
              Cancel
            </Button>
            <Button type="submit" leftSection={<IconLogin size="1rem" />} variant="filled">
              Sign In
            </Button>
          </Group>
        </form>
      </Card>
    </Container>
  );
}
