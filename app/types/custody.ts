export interface Custody {
  _id?: string;
  assetnumber: string;
  custodian: string;
  startdate: Date;
  enddate?: Date;
  location: string;
} 