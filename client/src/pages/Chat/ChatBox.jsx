import React from 'react'
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Chat from '../../components/Chat/Chat';

export default function ChatBox() {
  return (
    <>
       <PageMeta
        title="Chat Box"
      />
      <PageBreadcrumb pageTitle="Chat Box" />
      <div className="space-y-6">
        <ComponentCard title="Chat Box">
          <Chat />
        </ComponentCard>
      </div>
    </>
  )
}
