import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import EditDeleteEvent from "../../components/Expo Management/EditDeleteEvent";

export default function EditDeleteEventPage() {
  return (
    <>
      <PageMeta
        title="Edit or Delete Event"
      />
      <PageBreadcrumb pageTitle="Edit Delete" />
      <div className="space-y-6">
        <ComponentCard title="Edit Delete Events">
          <EditDeleteEvent />
        </ComponentCard>
      </div>
    </>
  );
}
