import PageBreadcrumb from "../../components/common/PageBreadCrumb";

import PageMeta from "../../components/common/PageMeta";
import AddEvent from "../../components/Expo Management/AddEvent";

export default function AddEventPage() {
  return (
    <div>
      <PageMeta
        title="Add Events"
      />
      <PageBreadcrumb pageTitle="Add New Events" />
      <AddEvent/>
    </div>
  );
}
