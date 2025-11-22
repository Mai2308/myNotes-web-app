import AuthContainer from "../components/auth/AuthContainer";
import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthContainer title="Welcome Back" showSignup={true}>
      <LoginForm />
    </AuthContainer>
  );
}




