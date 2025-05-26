import ForgetPasswordForm from "../../components/auth/forgetPassword";
import ResetPasswordForm from "../../components/auth/ResetPassword";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

export default function ResetPassword() {
  return (
    <>
      <PageMeta
        title="Reset Password | EventSphereManagement"
        description="EventSphere Management – Where Every Event Finds Its Orbit."
      />
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </>
  );
}
