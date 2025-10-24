export interface ProjectReturnMaterialData {
  _id?: string;
  materialid: string; // 10-digit generated from ObjectId
  materialCode: string;
  materialDescription: string;
  uom: string; // Unit of Measure
  quantity: number;
  pendingRequests: number; // Sum of all requested but not yet issued quantities
  sourceProject: string;
  sourcePONumber: string;
  sourceIssueNumber: string;
  sourceUnitRate: number;
  warehouseLocation: string; // Warehouse location
  yardRoomRackBin: string; // Yard/Room/Rack-Bin
  receivedInWarehouseDate?: Date; // Date when material was received in warehouse
  consignmentNoteNumber?: string; // Consignment note number
  testDocs: string[]; // Array of file URLs
  remarks?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectReturnMaterialTransaction {
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

export interface ProjReturnMaterialRequest {
  _id?: string;
  materialid: string;
  projectName: string;
  requestor: string;
  qtyRequested: number;
  remarks?: string;
  status: 'pending' | 'approved' | 'rejected' | 'issued';
  requestDate: Date;
  createdBy?: string;
  createdAt?: Date;
}

export interface ProjReturnMaterialIssue {
  _id?: string;
  materialid: string;
  projectName: string;
  requestor: string;
  qtyRequested: number;
  issuerName: string;
  issueQuantity: number;
  remarks?: string;
  issueDate: Date;
  requestId?: string; // Reference to the original request if issued from a request
  createdBy?: string;
  createdAt?: Date;
}

