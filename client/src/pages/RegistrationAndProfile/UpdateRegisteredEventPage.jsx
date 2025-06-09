import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";


import UpdateRegisteredEvents from "../../components/RegistrationAndProfile/UpdateRegisteredEvents";

export default function UpdateRegisteredEventsPage() {
  return (
    <>
      <PageMeta
        title="Update Registered Events"
      />
      <PageBreadcrumb pageTitle="Update Registered Events" />
      <div className="space-y-6">
        <ComponentCard title="Update Registered Events">
          <UpdateRegisteredEvents/>
        </ComponentCard>
      </div>
    </>
  );
}
