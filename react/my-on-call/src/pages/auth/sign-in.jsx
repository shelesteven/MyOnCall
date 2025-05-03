import { Button, Group, TextInput, Card, Container, Box, Title, Text, Paper, Stack, Divider } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconLogin, IconArrowLeft } from "@tabler/icons-react";

export default function SignIn() {
  const form = useForm({
    initialValues: {
      email: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  const handleSubmit = (values) => {
    console.log(values);
    // Add form submission logic here
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

          <Divider label="Enter your email" labelPosition="center" my="md" />

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack spacing="lg">
              <TextInput label="Email" placeholder="Enter your email address" description="We'll send you a magic link to sign in" icon={<IconLogin size="1rem" />} withAsterisk {...form.getInputProps("email")} />
            </Stack>

            <Group position="apart" mt="xl">
              <Button variant="outline" component="a" href="/" leftSection={<IconArrowLeft size="1rem" />}>
                Cancel
              </Button>

              <Button type="submit" leftSection={<IconLogin size="1rem" />} variant="filled">
                Sign In
              </Button>
            </Group>
          </form>
        </Card>
      </Paper>
    </Container>
  );
}
