export interface AssetData {
  _id?: string;
  assetnumber: string;
  assetcategory?: string;
  assetsubcategory?: string;
  assetstatus?: string;
  assetdescription?: string;
  acquireddate?: Date;
  acquiredvalue?: number;
  assetnotes?: string;
  assetmodel?: string;
  assetmanufacturer?: string;
  assetserialnumber?: string;
  accessories?: string;
  
}

export interface Custodian {
  location: "warehouse" | "in use";
  projectName?: string;
  projectLocation?: string;
  department?: string;
  employeeNumber?: string;
  name: string;
  custodyFrom: string;
  // Add more fields as needed
}

export interface AssetCategory {
  category: string;
  subcategories: string[];
}

export interface AssetStatus {
  status: string;
  description: string;
}

export interface AssetLocation {
  location: string;
  description: string;
}

export interface AssetCategory {
  category: string;
  subcategories: string[];
}

export interface AssetModel {
  model: string;
  manufacturer: string;
}

export interface AssetAccessory {
  accessory: string;
  description: string;
}

export interface Calibration {
  _id?: string;
  assetnumber: string;
  calibratedby: string;
  calibrationdate: Date | null;
  calibrationtodate: Date | null;
  calibrationpo?: string;
  calibfile?: string;
  calibcertificate?: string;
  createdby: string;
  createdat: Date;
}








