interface AssetDetailsProps {
  asset: {
    assetnumber: string;
    assetdescription: string;
    assetcategory: string;
    assetsubcategory: string;
    assetstatus: string;
    assetnotes: string;
    acquireddate: string;
    acquiredvalue: number;
  };
}

export default function AssetDetails({ asset }: AssetDetailsProps) {
  return (
    <div className="bg-blue-950/20 backdrop-blur-sm rounded-lg shadow-lg p-3 w-full max-w-4xl">
      <div className="grid grid-cols-2 gap-2">
        {/* Asset Number & Description */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">
            Asset Number
          </label>
          <div className="text-sm  text-zinc-100">
            {asset.assetnumber}
          </div>
        </div>
        {/* ... rest of asset details ... */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">
            Asset Description
          </label>
          <div className="text-sm  text-zinc-100">
            {asset.assetdescription}
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">
            Asset Category
          </label>
          <div className="text-sm  text-zinc-100">
            {asset.assetcategory}
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">
            Asset Subcategory
          </label>
          <div className="text-sm  text-zinc-100">
            {asset.assetsubcategory}
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">
            Asset Status
          </label>
          <div className="text-sm  text-zinc-100">
            {asset.assetstatus}
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">
            Asset Notes
          </label>
          <div className="text-sm  text-zinc-100">
            {asset.assetnotes}
          </div>
        </div>
         <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">           
         <label className="block text-xs font-medium text-teal-100">
            Acquired Date
          </label>
          <div className="text-sm  text-zinc-100">
            {asset.acquireddate}
          </div>
         </div>
         <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
         <label className="block text-xs font-medium text-teal-100">
            Acquired Value
          </label>
          <div className="text-sm  text-zinc-100">
            {asset.acquiredvalue}
          </div>
         </div>
      </div>
    </div>
  );
}
