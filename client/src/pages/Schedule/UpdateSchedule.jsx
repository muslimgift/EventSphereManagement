import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import UpdateSchedule from "../../components/Schedule/UpdateSchedule";

export default function UpdateSchedulePage() {
  return (
    <>
      <PageMeta
        title="Update Schedule"
      />
      <PageBreadcrumb pageTitle="Update Schedule" />
      <div className="space-y-6">
        <ComponentCard title="Update Schedule">
          <UpdateSchedule/>
        </ComponentCard>
      </div>
    </>
  );
}
