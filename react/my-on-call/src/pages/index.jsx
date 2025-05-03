import { Button, Group, Container, Box, Title, Text, Card, Stack } from "@mantine/core";
import { IconUserPlus, IconLogin, IconUsers } from "@tabler/icons-react";

export default function Index() {
  return (
    <Container size="lg" px="xs">
      <title>Home - MyOnCall</title>

      <Box className="section" mb={30} ta="center">
        <img src="/logo.png" alt="MyOnCall Logo" className="logo" style={{ maxWidth: "200px", marginBottom: "1rem" }} />
        <Title order={1} className="primary" mb="xs">
          Welcome to MyOnCall
        </Title>
        <Text size="lg" c="dimmed" className="secondary">
          Simplify your on-call schedule management
        </Text>
      </Box>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs" mb="md">
          <Group>
            <IconUsers size={20} />
            <Title order={3}>Get Started</Title>
          </Group>
        </Card.Section>

        <Stack spacing="md" align="center" py="md">
          <Button size="lg" leftSection={<IconUserPlus size="1.2rem" />} variant="filled" component="a" href="/auth/admin/sign-up" fullWidth>
            Create Admin Account
          </Button>

          <Button size="lg" leftSection={<IconUserPlus size="1.2rem" />} variant="outline" component="a" href="/auth/sign-up" fullWidth>
            Create User Account
          </Button>

          <Button size="lg" leftSection={<IconLogin size="1.2rem" />} variant="light" component="a" href="/auth/sign-in" fullWidth>
            Sign In
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}
