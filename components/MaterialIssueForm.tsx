'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface MaterialIssueFormProps {
  materialId: string;
  materialDescription: string;
  availableQuantity: number;
  onClose: () => void;
  onSubmit: (data: any) => void;
  requestData?: any; // Optional request data to pre-fill the form
}

export default function MaterialIssueForm({ 
  materialId, 
  materialDescription, 
  availableQuantity, 
  onClose, 
  onSubmit,
  requestData
}: MaterialIssueFormProps) {
  const [formData, setFormData] = useState({
    drawingNumber: '',
    equipment: '',
    room: '',
    requestorName: '',
    qtyRequested: 0,
    issuerName: '',
    issueQuantity: 0,
    remarks: ''
  });

  useEffect(() => {
    if (requestData) {
      setFormData({
        drawingNumber: requestData.drawingNumber || '',
        equipment: requestData.equipment || '',
        room: requestData.room || '',
        requestorName: requestData.requestorName || '',
        qtyRequested: requestData.qtyRequested || 0,
        issuerName: '',
        issueQuantity: requestData.qtyRequested || 0,
        remarks: requestData.remarks || ''
      });
    }
  }, [requestData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.issueQuantity > availableQuantity) {
      alert('Issue quantity cannot exceed available quantity');
      return;
    }

    if (formData.issueQuantity <= 0) {
      alert('Issue quantity must be greater than 0');
      return;
    }

    onSubmit({
      materialid: materialId,
      ...formData
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Issue Material
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>Material:</strong> {materialDescription}
          </p>
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>Available Quantity:</strong> {availableQuantity.toLocaleString()}
          </p>
          {requestData && (
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Issuing from Request:</strong> {requestData.requestorName}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Drawing Number *
              </label>
              <input
                type="text"
                required
                value={formData.drawingNumber}
                onChange={(e) => setFormData({ ...formData, drawingNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter drawing number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Equipment *
              </label>
              <input
                type="text"
                required
                value={formData.equipment}
                onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter equipment name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Room *
              </label>
              <input
                type="text"
                required
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter room number/location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Requestor Name *
              </label>
              <input
                type="text"
                required
                value={formData.requestorName}
                onChange={(e) => setFormData({ ...formData, requestorName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter requestor name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity Requested
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.qtyRequested}
                onChange={(e) => setFormData({ ...formData, qtyRequested: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter requested quantity"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Issuer Name *
              </label>
              <input
                type="text"
                required
                value={formData.issuerName}
                onChange={(e) => setFormData({ ...formData, issuerName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter issuer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Issue Quantity *
              </label>
              <input
                type="number"
                required
                min="0.01"
                max={availableQuantity}
                step="0.01"
                value={formData.issueQuantity}
                onChange={(e) => setFormData({ ...formData, issueQuantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter issue quantity"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Maximum: {availableQuantity.toLocaleString()}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter any additional remarks"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Issue Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
