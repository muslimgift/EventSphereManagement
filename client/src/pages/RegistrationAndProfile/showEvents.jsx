import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import DisplayEvents from "../../components/RegistrationAndProfile/displayEvents";

export default function ShowEvents() {
  return (
    <>
      <PageMeta
        title="Future Events"
      />
      <PageBreadcrumb pageTitle="Future Events" />
      <div className="space-y-6">
        <ComponentCard title="Future Events">
          <DisplayEvents/>
        </ComponentCard>
      </div>
    </>
  );
}
