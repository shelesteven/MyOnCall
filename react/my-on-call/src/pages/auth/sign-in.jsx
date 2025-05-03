import { Button, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";

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
    <>
      <title>Sign In - MyOnCall</title>
      <form className="form" onSubmit={form.onSubmit((values) => console.log(values))}>
        <div className="section">
          <h2 className="primary">Sign In</h2>
          <h4 className="secondary">Sign in to view or manage the on-call schedule</h4>
        </div>
        <div className="fields">
          <TextInput label="Email" {...form.getInputProps("email")} />
        </div>
        <Group justify="flex-end" mt="md">
          <Button className="button outline" variant="outline" component="a" href="/">
            Cancel
          </Button>
          <Button className="button fill" type="submit">
            Sign In
          </Button>
        </Group>
      </form>
    </>
  );
}
