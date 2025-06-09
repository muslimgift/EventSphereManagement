import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import EditDeleteExpo from "../../components/Expo Management/EditDelete";

export default function EditDeleteExpoPage() {
  return (
    <>
      <PageMeta
        title="Edit or Delete Expo"
      />
      <PageBreadcrumb pageTitle="Edit Delete" />
      <div className="space-y-6">
        <ComponentCard title="Edit Delete Expo Center">
          <EditDeleteExpo />
        </ComponentCard>
      </div>
    </>
  );
}
