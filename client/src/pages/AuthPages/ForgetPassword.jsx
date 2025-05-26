import ForgetPasswordForm from "../../components/auth/forgetPassword";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

export default function ForgetPassword() {
  return (
    <>
      <PageMeta
        title="Forget Password | EventSphereManagement"
        description="EventSphere Management – Where Every Event Finds Its Orbit."
      />
      <AuthLayout>
        <ForgetPasswordForm />
      </AuthLayout>
    </>
  );
}
