import { useState } from "react";
import { Button, Group, TextInput, Card, Container, Box, Title, Text, Stack, Paper, Divider, PasswordInput, LoadingOverlay, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconUserPlus, IconArrowLeft, IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router";

// Import our authentication utilities
import { createUser, signIn } from "../../utils/auth";
import { initializeDefaultData } from "../../utils/dataManagement";

export default function SignUp() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      name: (value) => (value.length < 2 ? "Name must be at least 2 characters long" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => (value.length < 6 ? "Password must be at least 6 characters long" : null),
      confirmPassword: (value, values) => (value !== values.password ? "Passwords do not match" : null),
    },
  });

  const handleSubmit = async (values) => {
    setError("");
    setLoading(true);

    try {
      // Create the user account
      const userData = {
        name: values.name,
        email: values.email,
        password: values.password,
      };

      // Create user (this only registers, doesn't log in)
      await createUser(userData, false);

      // Now sign in with the new credentials
      await signIn(values.email, values.password);

      // Initialize default data
      initializeDefaultData();

      // Navigate to schedules page
      navigate("/schedules");
    } catch (err) {
      console.error("Sign up error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" px="xs" className="form-container">
      <title>Sign Up - MyOnCall</title>

      <Paper shadow="xs" p="md" withBorder radius="md" mb="lg" pos="relative">
        <LoadingOverlay visible={loading} overlayBlur={2} />

        <Group mb="md">
          <Button variant="subtle" leftSection={<IconArrowLeft size="1rem" />} component="a" href="/" compact>
            Back to Home
          </Button>
        </Group>

        <Box className="section" mb={30}>
          <Title order={1} className="primary" mb="xs">
            Create User Account
          </Title>
          <Text size="lg" c="dimmed" className="secondary" mb="md">
            Join MyOnCall to view your organization's on-call schedule
          </Text>
        </Box>

        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="md" mb="md">
            <Group>
              <IconUserPlus size={24} stroke={1.5} color="var(--primary-color)" />
              <Title order={3}>User Information</Title>
            </Group>
          </Card.Section>

          {error && (
            <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" mb="md">
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack spacing="lg">
              <TextInput label="Full Name" placeholder="Enter your full name" withAsterisk {...form.getInputProps("name")} />

              <TextInput label="Email" placeholder="Enter your email address" withAsterisk {...form.getInputProps("email")} />

              <PasswordInput label="Password" placeholder="Create a password" withAsterisk {...form.getInputProps("password")} />

              <PasswordInput label="Confirm Password" placeholder="Confirm your password" withAsterisk {...form.getInputProps("confirmPassword")} />
            </Stack>

            <Group mt="md" position="apart">
              <Text size="sm" component="a" href="/auth/sign-in" c="blue">
                Already have an account? Sign in
              </Text>

              <Text size="sm" component="a" href="/auth/admin/sign-up" c="blue">
                Register as administrator
              </Text>
            </Group>

            <Group position="apart" mt="xl">
              <Button variant="outline" component="a" href="/" leftSection={<IconArrowLeft size="1rem" />}>
                Cancel
              </Button>

              <Button type="submit" leftSection={<IconCheck size="1rem" />} variant="filled" loading={loading}>
                Create Account
              </Button>
            </Group>
          </form>
        </Card>
      </Paper>
    </Container>
  );
}
