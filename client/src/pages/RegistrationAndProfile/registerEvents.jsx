import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import RegisterEvents from "../../components/RegistrationAndProfile/registerEvents";

export default function RegisterEventsPage() {
  return (
    <>
      <PageMeta
        title="Register Events"
      />
      <PageBreadcrumb pageTitle="Register Events" />
      <div className="space-y-6">
        <ComponentCard title="Register Events">
          <RegisterEvents/>
        </ComponentCard>
      </div>
    </>
  );
}
