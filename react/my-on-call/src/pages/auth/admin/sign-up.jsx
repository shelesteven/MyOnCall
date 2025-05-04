import { useState } from "react";
import { Button, Group, TextInput, Title, Text, Card, Container, Box, Stack, Paper, Divider, Badge, PasswordInput, LoadingOverlay, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconUserPlus, IconArrowLeft, IconCheck, IconShieldLock, IconAlertCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router";

// Import our authentication utilities
import { createUser, signIn } from "../../../utils/auth";
import { initializeDefaultData } from "../../../utils/dataManagement";

export default function AdminSignUp() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      organizationName: "", // Added organization name field
    },
    validate: {
      name: (value) => (value.length < 2 ? "Name must be at least 2 characters long" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => (value.length < 6 ? "Password must be at least 6 characters long" : null),
      confirmPassword: (value, values) => (value !== values.password ? "Passwords do not match" : null),
      organizationName: (value) => (value.length < 2 ? "Organization name is required" : null),
    },
  });

  const handleSubmit = async (values) => {
    setError("");
    setLoading(true);

    try {
      // Create admin user
      const userData = {
        name: values.name,
        email: values.email,
        password: values.password,
        organizationName: values.organizationName,
      };

      // Create admin user (true flag indicates admin role)
      await createUser(userData, true);

      // Automatically sign in with the new admin credentials
      await signIn(values.email, values.password);

      // Initialize default data
      initializeDefaultData();

      // Redirect to admin schedules page
      navigate("/admin/schedules");
    } catch (err) {
      console.error("Admin sign up error:", err);
      setError(err.message || "Failed to create admin account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" px="xs" className="form-container">
      <title>Admin Sign Up - MyOnCall</title>

      <Paper shadow="xs" p="md" withBorder radius="md" mb="lg" pos="relative">
        <LoadingOverlay visible={loading} overlayBlur={2} />

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

          {error && (
            <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" mb="md">
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack spacing="lg">
              <TextInput label="Full Name" placeholder="Enter your full name" withAsterisk {...form.getInputProps("name")} />

              <TextInput label="Organization Name" placeholder="Enter your organization name" withAsterisk {...form.getInputProps("organizationName")} />

              <TextInput label="Email" placeholder="Enter your email address" withAsterisk {...form.getInputProps("email")} />

              <PasswordInput label="Password" placeholder="Create a password" withAsterisk {...form.getInputProps("password")} />

              <PasswordInput label="Confirm Password" placeholder="Confirm your password" withAsterisk {...form.getInputProps("confirmPassword")} />
            </Stack>

            <Text mt="md" size="sm" component="a" href="/auth/sign-in" c="blue">
              Already have an account? Sign in
            </Text>

            <Group position="apart" mt="xl">
              <Button variant="outline" component="a" href="/" leftSection={<IconArrowLeft size="1rem" />}>
                Cancel
              </Button>

              <Button type="submit" leftSection={<IconUserPlus size="1rem" />} variant="filled" color="blue" loading={loading}>
                Create Admin Account
              </Button>
            </Group>
          </form>
        </Card>
      </Paper>
    </Container>
  );
}
