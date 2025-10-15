export interface ZeroValMaterialData {
  _id?: string;
  materialid: string; // 10-digit generated from ObjectId
  materialCode: string;
  materialDescription: string;
  uom: string; // Unit of Measure
  quantity: number;
  sourceProject: string;
  sourcePONumber: string;
  sourceIssueNumber: string;
  sourceUnitRate: number;
  testDocs: string[]; // Array of file URLs
  remarks?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ZeroValMaterialIssue {
  _id?: string;
  materialid: string;
  issuedQuantity: number;
  issuedTo: string; // Employee name or department
  issuedBy: string; // Warehouse supervisor
  issueDate: Date;
  projectName?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: Date;
}

export interface ZeroValMaterialTransaction {
  _id?: string;
  materialid: string;
  transactionType: 'issue' | 'return' | 'adjustment';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reference?: string; // Issue ID, return ID, or adjustment reason
  notes?: string;
  createdBy?: string;
  createdAt?: Date;
}
