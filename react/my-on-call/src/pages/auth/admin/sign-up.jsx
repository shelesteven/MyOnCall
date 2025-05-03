import { Button, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";

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
    <>
      <title>Admin Sign Up - MyOnCall</title>
      <div className="section">
        <h2 className="primary">Create Admin Account</h2>
        <h4 className="secondary">Create an admin account to manage the on-call schedule</h4>
      </div>
      <form className="form" onSubmit={form.onSubmit((values) => console.log(values))}>
        <div className="fields">
          <TextInput label="First Name" {...form.getInputProps("first_name")} />
          <TextInput label="Last Name" {...form.getInputProps("last_name")} />
          <TextInput label="Email" {...form.getInputProps("email")} />
        </div>
        <Group justify="flex-end" mt="md">
          <Button className="button outline" variant="outline" component="a" href="/">
            Cancel
          </Button>
          <Button className="button fill" type="submit">
            Create Admin Account
          </Button>
        </Group>
      </form>
    </>
  );
}
