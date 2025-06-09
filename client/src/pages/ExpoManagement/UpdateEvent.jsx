import PageBreadcrumb from "../../components/common/PageBreadCrumb";

import PageMeta from "../../components/common/PageMeta";
import UpdateEvent from "../../components/Expo Management/UpdateEvent";

export default function UpdateEventPage() {
  return (
    <div>
      <PageMeta
        title="Update Events"
      />
      <PageBreadcrumb pageTitle="Update Events" />
      <UpdateEvent/>
    </div>
  );
}
