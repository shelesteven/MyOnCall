import { Button, Group, Container, Box, Title, Text, Card, Stack, Paper, SimpleGrid, ThemeIcon } from "@mantine/core";
import { IconUserPlus, IconLogin, IconUsers, IconShieldLock, IconCalendar } from "@tabler/icons-react";

export default function Index() {
  return (
    <Container size="md" px="xs">
      <title>Home - MyOnCall</title>

      <Paper shadow="xs" p="lg" withBorder radius="md" mb="lg">
        <Box className="section" mt={20} mb={40} ta="center">
          <img src="/logo.png" alt="MyOnCall Logo" className="logo" style={{ width: "auto", maxHeight: "80px", marginBottom: "1.5rem" }} />
          <Title order={1} className="primary" mb="md" size="h1">
            Welcome to MyOnCall
          </Title>
          <Text size="xl" c="dimmed" className="secondary" maw={500}>
            The simple solution for managing on-call schedules for your team
          </Text>
        </Box>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Card.Section withBorder inheritPadding py="md" mb="lg">
              <Group>
                <ThemeIcon size={34} radius="md" variant="light" color="blue">
                  <IconShieldLock size={20} stroke={1.5} />
                </ThemeIcon>
                <Title order={3}>Administrators</Title>
              </Group>
            </Card.Section>

            <Text size="sm" mb="lg">
              Create an admin account to set up and manage on-call schedules for your organization
            </Text>

            <Stack spacing="md" align="stretch">
              <Button size="md" leftSection={<IconUserPlus size="1.2rem" />} variant="filled" component="a" href="/auth/admin/sign-up" fullWidth>
                Create Admin Account
              </Button>

              <Button size="md" leftSection={<IconLogin size="1.2rem" />} variant="outline" component="a" href="/auth/sign-in" fullWidth>
                Admin Sign In
              </Button>
            </Stack>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Card.Section withBorder inheritPadding py="md" mb="lg">
              <Group>
                <ThemeIcon size={34} radius="md" variant="light" color="teal">
                  <IconUsers size={20} stroke={1.5} />
                </ThemeIcon>
                <Title order={3}>Team Members</Title>
              </Group>
            </Card.Section>

            <Text size="sm" mb="lg">
              Create a user account to view and receive notifications about your on-call schedule
            </Text>

            <Stack spacing="md" align="stretch">
              <Button size="md" leftSection={<IconUserPlus size="1.2rem" />} variant="filled" color="teal" component="a" href="/auth/sign-up" fullWidth>
                Create User Account
              </Button>

              <Button size="md" leftSection={<IconLogin size="1.2rem" />} variant="outline" color="teal" component="a" href="/auth/sign-in" fullWidth>
                User Sign In
              </Button>
            </Stack>
          </Card>
        </SimpleGrid>

        <Box mt={40} ta="center">
          <Text size="sm" c="dimmed">
            © 2025 MyOnCall • Simplify your on-call management
          </Text>
        </Box>
      </Paper>
    </Container>
  );
}
