import PageBreadcrumb from "../../components/common/PageBreadCrumb";

import PageMeta from "../../components/common/PageMeta";

import UpdateExpo from "../../components/Expo Management/UpdateExpo";

export default function UpdateExpoPage() {
  return (
    <div>
      <PageMeta
        title="Update Expo Center"
      />
      <PageBreadcrumb pageTitle="Update Expo Center" />
      <UpdateExpo/>
    </div>
  );
}
