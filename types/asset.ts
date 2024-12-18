export interface Asset {
  _id: string;
  assetnumber: string;
  acquireddate: string;
  assetdescription: string;
  acquiredvalue: number;
  assetcategory: string;
  assetsubcategory: string;
  assetstatus: string;
  assetnotes: string;
}

export interface CalibrationCertificate {
  certificateNumber: string;
  calibrationDate: string;
  nextDueDate: string;
  status: string;
  // Add more fields as needed
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


