import { Button, Group, TextInput, Card, Container, Box, Title, Text, Paper, Stack, Divider, PasswordInput, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconLogin, IconArrowLeft, IconAlertCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useState } from "react";

// Import our authentication utilities
import { signIn, isAdmin } from "../../utils/auth";
import { initializeDefaultData } from "../../utils/dataManagement";

export default function SignIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => (value.length >= 6 ? null : "Password should be at least 6 characters"),
    },
  });

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError(null);

      // Attempt to sign in
      const result = await signIn(values.email, values.password);

      // Initialize default data (holidays, team members)
      initializeDefaultData();

      // Redirect based on user role
      if (isAdmin()) {
        navigate("/admin/schedules");
      } else {
        navigate("/schedules");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError(error.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" px="xs" className="form-container">
      <title>Sign In - MyOnCall</title>

      <Paper shadow="xs" p="md" withBorder radius="md" mb="lg">
        <Group mb="md">
          <Button variant="subtle" leftSection={<IconArrowLeft size="1rem" />} component="a" href="/" compact>
            Back to Home
          </Button>
        </Group>

        <Box className="section" mb={30}>
          <Title order={1} className="primary" mb="xs">
            Sign In
          </Title>
          <Text size="lg" c="dimmed" className="secondary" mb="md">
            Access your MyOnCall account
          </Text>
        </Box>

        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="md" mb="md">
            <Group>
              <IconLogin size={24} stroke={1.5} color="var(--primary-color)" />
              <Title order={3}>Account Login</Title>
            </Group>
          </Card.Section>

          {error && (
            <Alert icon={<IconAlertCircle size="1rem" />} title="Authentication Error" color="red" mb="md">
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack spacing="lg">
              <TextInput label="Email" placeholder="Enter your email address" withAsterisk {...form.getInputProps("email")} />

              <PasswordInput label="Password" placeholder="Enter your password" withAsterisk {...form.getInputProps("password")} />
            </Stack>

            <Group position="apart" mt="xl">
              <Stack gap="xs">
                <Button variant="subtle" component="a" href="/auth/sign-up" compact>
                  Don't have an account? Sign up
                </Button>
                <Button variant="subtle" component="a" href="/auth/admin/sign-up" compact>
                  Register as administrator
                </Button>
              </Stack>

              <Button type="submit" leftSection={<IconLogin size="1rem" />} variant="filled" loading={loading}>
                Sign In
              </Button>
            </Group>
          </form>
        </Card>
      </Paper>
    </Container>
  );
}
