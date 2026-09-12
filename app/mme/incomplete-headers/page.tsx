'use client';

import IncompleteHeadersPage from '@/app/components/incomplete-headers/IncompleteHeadersPage';

export default function MmeIncompleteHeadersRoute() {
  return (
    <IncompleteHeadersPage
      assetType="mme"
      title="MME incomplete headers"
      subtitle="MME with custody and/or calibration records whose description, acquisition date, or acquisition value is missing. You can add, edit, or clear those three fields here."
      detailHref={(assetnumber) => `/asset/${encodeURIComponent(assetnumber)}`}
    />
  );
}
