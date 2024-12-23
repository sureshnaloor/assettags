export interface AssetData {
  _id: string;
  assetnumber: string;
  acquireddate: string;
  assetdescription: string;
  acquiredvalue: number;
  assetcategory: string;
  assetsubcategory: string;
  assetstatus: string;
  assetnotes: string;
  assetmodel?: string;
  assetmanufacturer?: string;
  assetserialnumber?: string;
  accessories?: string;
}

export interface CalibrationCertificate {
  _id: string;
  assetnumber: string;
  calibratedby: string;
  calibrationdate: string;
  calibrationtodate: string;
  calibrationpo?: string;
  calibfile?: string;
  calibcertificate?: string;
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

export interface Calibration {
  _id?: string;
  assetnumber: string;
  calibcertificate: string;
  calibfile: string;
  calibratedby: string;
  calibrationdate: Date;
  calibrationfromdate: Date;
  calibrationtodate: Date;
  calibrationpo: string;
  createdby: string;
  createdat: Date;
}


