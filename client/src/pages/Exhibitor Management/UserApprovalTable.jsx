import React from 'react'
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import UserApproval from '../../components/ExhibitorManagement/UserApproval';

export default function UserApprovalTable() {
  return (
    <>
       <PageMeta
        title="Exhibitors Approval Page"
        
      />
      <PageBreadcrumb pageTitle="Exhibitors Approval Page" />
      <div className="space-y-6">
        <ComponentCard title="All Exhibitors">
          <UserApproval />
        </ComponentCard>
      </div>
    </>
  )
}
