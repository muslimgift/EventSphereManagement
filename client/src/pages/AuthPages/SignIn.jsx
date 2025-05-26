import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign In | EventSphereManagement"
        description="EventSphere Management – Where Every Event Finds Its Orbit."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
