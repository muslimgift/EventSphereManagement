import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import RegisteredEvents from "../../components/RegistrationAndProfile/RegisteredEvents";

export default function RegisteredEventsPage() {
  return (
    <>
      <PageMeta
        title="Registered Events"
      />
      <PageBreadcrumb pageTitle="Registered Events" />
      <div className="space-y-6">
        <ComponentCard title="Registered Events">
          <RegisteredEvents/>
        </ComponentCard>
      </div>
    </>
  );
}
