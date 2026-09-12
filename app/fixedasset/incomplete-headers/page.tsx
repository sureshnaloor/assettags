'use client';

import IncompleteHeadersPage from '@/app/components/incomplete-headers/IncompleteHeadersPage';

export default function FixedAssetIncompleteHeadersRoute() {
  return (
    <IncompleteHeadersPage
      assetType="fixedasset"
      title="Asset incomplete headers"
      subtitle="Fixed assets with custody and/or calibration records whose description, acquisition date, or acquisition value is missing. You can add, edit, or clear those three fields here."
      detailHref={(assetnumber) => `/fixedasset/${encodeURIComponent(assetnumber)}`}
    />
  );
}
