import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import AddExpo from "../../components/Expo Management/AddExpo";

export default function AddExpoPage() {
  return (
    <div>
      <PageMeta
        title="Add Expo Center"
      />
      <PageBreadcrumb pageTitle="Add Expo Center" />
      <AddExpo/>
    </div>
  );
}
