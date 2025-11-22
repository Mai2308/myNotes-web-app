import AuthContainer from "../components/auth/AuthContainer";
import SignupForm from "../components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthContainer title="Create Account" showSignup={false}>
      <SignupForm />
    </AuthContainer>
  );
}


