import React from 'react'
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import UserApplicationApproval from '../../components/ExhibitorManagement/UserApplicationApproval';

export default function UserApplicationApprovalPage() {
  return (
    <>
       <PageMeta
        title="User Applications Approval Page"
        
      />
      <PageBreadcrumb pageTitle="User Applications Approval Page" />
      <div className="space-y-6">
        <ComponentCard title="All Exhibitors Applications">
          <UserApplicationApproval />
        </ComponentCard>
      </div>
    </>
  )
}
