import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Sign Up | EventSphereManagement"
        description="EventSphere Management – Where Every Event Finds Its Orbit."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
