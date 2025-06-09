import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import AddSchedule from "../../components/Schedule/AddSchedule";

export default function AddSchedulePage() {
  return (
    <>
      <PageMeta
        title="Add Schedule"
      />
      <PageBreadcrumb pageTitle="Add Schedule" />
      <div className="space-y-6">
        <ComponentCard title="Add Schedule">
          <AddSchedule/>
        </ComponentCard>
      </div>
    </>
  );
}
