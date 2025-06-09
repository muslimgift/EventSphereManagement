import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import DisplaySchedule from "../../components/Schedule/DisplaySchedule";

export default function DisplaySchedulePage() {
  return (
    <>
      <PageMeta
        title="Display Schedule"
      />
      <PageBreadcrumb pageTitle="Display Schedule" />
      <div className="space-y-6">
        <ComponentCard title="Display Schedule">
          <DisplaySchedule/>
        </ComponentCard>
      </div>
    </>
  );
}
