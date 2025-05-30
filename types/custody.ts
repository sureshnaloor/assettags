export interface Custody {
  _id?: string;
  assetnumber: string;
  employeenumber: string;
  employeename: string;
  locationType: 'warehouse' | 'department';
  location: string;
  warehouseLocation?: string;  // for room/rack/bin
  warehouseCity?: 'Dammam' | 'Jubail';
  departmentLocation?: string;  // city for department
  project?: string; // wbs number for project
  projectname?: string; // project name
  createdat: Date;
  createdby: string;
  custodyfrom: Date;
  custodyto?: Date | null;  // Optional field
}

export interface CustodyRecord extends Custody {
  _id: string;
  assetnumber: string;
  employeenumber: string;
  employeename: string;
  locationType: 'warehouse' | 'department';
  location: string;
}

export interface Employee {
  _id: string;
  empno: string;
  empname: string;
}

export interface Project {
  _id: string;
  wbs: string;
  projectname: string;
}