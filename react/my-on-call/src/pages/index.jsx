import { Button } from "@mantine/core";

export default function Index() {
  return (
    <>
      <title>Home - MyOnCall</title>
      <div className="section">
        <img src="/logo.png" alt="MyOnCall Logo" className="logo" />
      </div>
      <div className="section">
        <div className="buttons">
          <Button size="lg" className="button fill" component="a" href="/auth/admin/sign-up">
            Create Admin Account
          </Button>
          <Button size="lg" className="button fill" component="a" href="/auth/sign-up">
            Create User Account
          </Button>
          <Button size="lg" className="button fill" component="a" href="/auth/sign-in">
            Sign In
          </Button>
        </div>
      </div>
    </>
  );
}
