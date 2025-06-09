import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import DisplayEventsWithBooth from "../../components/RegistrationAndProfile/displayEventsWithBooth";

export default function ShowEventWithBoothPage() {
  return (
    <>
      <PageMeta
        title="Display Events With Booth Availaiblity"
      />
      <PageBreadcrumb pageTitle="Display Events With Booth Availaiblity" />
      <div className="space-y-6">
        <ComponentCard title="Display Events With Booth Availaiblity">
          <DisplayEventsWithBooth/>
        </ComponentCard>
      </div>
    </>
  );
}
