// PPE Master Data Types
export interface PPEMaster {
  _id?: string;
  ppeId: string;
  ppeName: string;
  materialCode: string;
  life: number;
  lifeUOM: 'week' | 'month' | 'year';
  description?: string;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}

// PPE Issue Record Types
export interface PPEIssueRecord {
  _id?: string;
  userEmpNumber: string;
  userEmpName: string;
  dateOfIssue: Date;
  ppeId: string;
  ppeName: string; // Denormalized for easier queries
  quantityIssued: number;
  isFirstIssue: boolean; // Y/N flag
  lastIssueDate?: Date; // Only if not first issue
  issueAgainstDue: boolean; // Y for due, N for damage
  remarks?: string;
  issuedBy: string; // Employee number of person who issued
  issuedByName: string; // Name of person who issued
  createdAt: Date;
  createdBy: string;
}

// Bulk PPE Issue Types
export interface PPEBulkIssue {
  _id?: string;
  departmentOrProjectName: string;
  location: string;
  ppeId: string;
  ppeName: string; // Denormalized for easier queries
  quantityIssued: number;
  receiverUserEmpNumber: string;
  receiverUserEmpName: string; // Denormalized for easier queries
  issueDate: Date;
  issuedBy: string; // Employee number of person who issued
  issuedByName: string; // Name of person who issued
  remarks?: string;
  createdAt: Date;
  createdBy: string;
}

// Employee Types (Updated with active field)
export interface Employee {
  _id?: string;
  empno: string;
  empname: string;
  active?: 'Y' | 'N' | null; // Default null or Y, N if resigned/exited
  department?: string;
  designation?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}

// PPE Issue Summary Types
export interface PPEIssueSummary {
  ppeId: string;
  ppeName: string;
  totalIssued: number;
  totalUsers: number;
  lastIssueDate: Date;
  nextDueDate?: Date;
}

// PPE Due for Reissue Types
export interface PPEDueForReissue {
  _id: string;
  userEmpNumber: string;
  userEmpName: string;
  ppeId: string;
  ppeName: string;
  lastIssueDate: Date;
  dueDate: Date;
  daysOverdue: number;
  quantity: number;
}

// API Response Types
export interface PPEApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PPEPaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
