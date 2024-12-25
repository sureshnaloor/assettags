'use client';
import { useState, useEffect } from 'react';
import { PencilIcon, XMarkIcon, CheckIcon, ExclamationTriangleIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Calibration } from '@/types/asset';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface CalibrationCompany {
  _id: string;
  name: string;
}

interface CalibrationDetailsProps {
  currentCalibration: Calibration | null;
  calibrationHistory: Calibration[];
  onUpdate: (updatedCalibration: Calibration | null) => void;
}

const VALIDITY_PERIODS = [
  { label: '3 Months', months: 3 },
  { label: '6 Months', months: 6 },
  { label: '12 Months', months: 12 },
  { label: '24 Months', months: 24 },
];

function LoadingSpinner() {
  return (
    <svg 
      className="animate-spin h-5 w-5 text-white" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isSaving: boolean;
  changes: {
    calibratedby?: string;
    calibrationdate?: string;
    validityPeriod?: string;
    calibrationpo?: string;
    calibfile?: string;
    calibcertificate?: string;
  };
}

function ConfirmationModal({ isOpen, onConfirm, onCancel, isSaving, changes }: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-start gap-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">Confirm Calibration Changes</h3>
            <div className="text-sm text-zinc-300 space-y-2">
              <p>Are you sure you want to save the following changes?</p>
              <ul className="list-disc list-inside space-y-1 text-zinc-400">
                {Object.entries(changes).map(([key, value]) => 
                  value ? (
                    <li key={key}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                    </li>
                  ) : null
                )}
              </ul>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={onConfirm}
                disabled={isSaving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner />
                    <span>Saving...</span>
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                onClick={onCancel}
                disabled={isSaving}
                className="flex-1 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ArchivedCalibration extends Calibration {
  archivedAt: Date;
  archivedBy: string;
  reason: string;
}

export default function CalibrationDetails({ currentCalibration, calibrationHistory, onUpdate }: CalibrationDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calibrationCompanies, setCalibrationCompanies] = useState<CalibrationCompany[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Partial<Calibration> | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showNewConfirmation, setShowNewConfirmation] = useState(false);
  const [pendingNewCalibration, setPendingNewCalibration] = useState<Partial<Calibration> | null>(null);
  const [isNewMode, setIsNewMode] = useState(false);
  
  const [editedCalibration, setEditedCalibration] = useState<Calibration>(() => {
    return {
      calibratedby: '',
      calibrationdate: null as Date | null,
      calibrationtodate: null as Date | null,
      calibrationpo: '',
      calibfile: '',
      calibcertificate: '',
      assetnumber: currentCalibration?.assetnumber ?? '',
      createdby: 'current-user',
      createdat: new Date(),
    } as Calibration;
  });

  useEffect(() => {
    if (isEditing && currentCalibration) {
      setEditedCalibration({
        ...currentCalibration,
        calibrationdate: currentCalibration.calibrationdate 
          ? new Date(currentCalibration.calibrationdate)
          : null,
        calibrationtodate: currentCalibration.calibrationtodate
          ? new Date(currentCalibration.calibrationtodate)
          : null
      });
    }
  }, [isEditing, currentCalibration]);

  const [selectedValidityPeriod, setSelectedValidityPeriod] = useState(12);

  useEffect(() => {
    fetchCalibrationCompanies();
  }, []);

  const fetchCalibrationCompanies = async () => {
    try {
      const response = await fetch('/api/calibration-companies');
      if (!response.ok) throw new Error('Failed to fetch companies');
      const companies = await response.json();
      setCalibrationCompanies(companies);
    } catch (error) {
      console.error('Error fetching calibration companies:', error);
      setError('Failed to load calibration companies');
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Not specified';
    try {
      return new Date(date).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const calculateValidUntil = (calibrationDate: Date, months: number) => {
    const validUntil = new Date(calibrationDate);
    validUntil.setMonth(validUntil.getMonth() + months);
    return validUntil;
  };
  const handleCalibrationDateChange = (date: Date | null) => {
    setEditedCalibration(prev => {
      const updates = {
        ...prev,
        calibrationdate: date,
        calibrationtodate: date ? calculateValidUntil(date, selectedValidityPeriod) : null
      };
      return updates;
    });
  };

  const handleValidityPeriodChange = (months: number) => {
    setSelectedValidityPeriod(months);
    if (editedCalibration.calibrationdate) {
      setEditedCalibration(prev => ({
        ...prev,
        calibrationtodate: editedCalibration.calibrationdate ? calculateValidUntil(editedCalibration.calibrationdate, months) : null
      }));
    }
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!editedCalibration.calibratedby) {
        setError('Please select a calibration company');
        return;
      }
      if (!editedCalibration.calibrationdate) {
        setError('Please select a calibration date');
        return;
      }

      // Calculate changes
      const currentCal = currentCalibration || {} as Calibration;
      const changes = {
        calibratedby: editedCalibration.calibratedby !== currentCal.calibratedby 
          ? editedCalibration.calibratedby 
          : undefined,
        calibrationdate: editedCalibration.calibrationdate !== currentCal.calibrationdate 
          ? formatDate(editedCalibration.calibrationdate)
          : undefined,
        validityPeriod: selectedValidityPeriod !== 12 
          ? `${selectedValidityPeriod} Months`
          : undefined,
        calibrationpo: editedCalibration.calibrationpo !== currentCal.calibrationpo 
          ? editedCalibration.calibrationpo 
          : undefined,
        calibfile: editedCalibration.calibfile !== currentCal.calibfile 
          ? editedCalibration.calibfile 
          : undefined,
        calibcertificate: editedCalibration.calibcertificate !== currentCal.calibcertificate 
          ? editedCalibration.calibcertificate 
          : undefined,
      };
      // Store the changes and show confirmation
      setPendingChanges({
        ...editedCalibration,
        calibrationdate: editedCalibration.calibrationdate || undefined,
        calibrationtodate: editedCalibration.calibrationtodate || undefined
      });
      setShowConfirmation(true);

    } catch (error) {
      console.error('Failed to prepare update:', error);
      setError(error instanceof Error ? error.message : 'Failed to prepare update');
    }
  };

  const handleConfirmedSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await fetch(`/api/calibrations/${currentCalibration?.assetnumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedCalibration),
      });

      if (!response.ok) {
        throw new Error('Failed to update calibration');
      }

      const updatedCalibration = await response.json();
      
      onUpdate(updatedCalibration);
      
      setIsEditing(false);
      setShowConfirmation(false);
    } catch (error) {
      console.error('Failed to update calibration:', error);
      setError(error instanceof Error ? error.message : 'Failed to update calibration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNew = () => {
    setEditedCalibration({
      calibratedby: '',
      calibrationdate: null as Date | null,
      calibrationtodate: null as Date | null,
      calibrationpo: '',
      calibfile: '',
      calibcertificate: '',
      assetnumber: currentCalibration?.assetnumber ?? '',
      createdby: 'current-user',
      createdat: new Date(),
    } as Calibration);
    setIsNewMode(true);
    setIsEditing(false);
  };

  const handleConfirmedNew = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      const response = await fetch(`/api/calibrations/${currentCalibration?.assetnumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedCalibration),
      });

      if (!response.ok) {
        throw new Error('Failed to create calibration');
      }

      const newCalibration = await response.json();
      onUpdate(newCalibration);
      setIsEditing(false);
      setShowNewConfirmation(false);
      setShowNewForm(false);
    } catch (error) {
      console.error('Failed to create calibration:', error);
      setError(error instanceof Error ? error.message : 'Failed to create calibration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const responsearchive = await fetch(`/api/calibrations/${currentCalibration?.assetnumber}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calibration: currentCalibration,
          reason: archiveReason,
          archivedBy: 'current-user', // Replace with actual user
        }),
      });      

      const responsedelete = await fetch(`/api/calibrations/${currentCalibration?.assetnumber}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calibration: currentCalibration,
          // Replace with actual user
        }),
      }); 

      if (!responsearchive.ok) {
        throw new Error('Failed to archive calibration');
      }

      if (!responsedelete.ok) {
        throw new Error('Failed to delete calibration');
      }

      onUpdate(null); // Clear the calibration from parent
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error('Failed to archive calibration:', error);
      setError(error instanceof Error ? error.message : 'Failed to archive calibration');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setEditedCalibration({
      calibratedby: '',
      calibrationdate: null as Date | null,
      calibrationtodate: null as Date | null,
      calibrationpo: '',
      calibfile: '',
      calibcertificate: '',
      assetnumber: currentCalibration?.assetnumber ?? '',
      createdby: 'current-user',
      createdat: new Date(),
    } as Calibration);
  };

  return (
    <div className="bg-teal-800/80 backdrop-blur-sm rounded-lg shadow-lg p-3 w-full max-w-4xl relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-emerald-200">
          {isNewMode ? 'New Calibration' : 'Current Calibration'}
        </h2>
        
        <div className="flex gap-2">
          {!isEditing && !isNewMode && (
            <>
              <button
                onClick={handleNew}
                className="p-1 text-emerald-300 hover:text-emerald-200 transition-colors"
                title="New Calibration"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
              {currentCalibration && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-emerald-300 hover:text-emerald-200 transition-colors"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
              )}
            </>
          )}
          
          {(isEditing || isNewMode) && (
            <>
              <button
                onClick={() => {
                  if (isNewMode) {
                    setIsNewMode(false);
                  } else {
                    setIsEditing(false);
                  }
                  resetForm();
                }}
                className="p-1 text-red-300 hover:text-red-200 transition-colors"
                disabled={isSaving}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  if (isNewMode) {
                    setPendingNewCalibration({
                      ...editedCalibration,
                      calibrationdate: editedCalibration.calibrationdate || undefined,
                      calibrationtodate: editedCalibration.calibrationtodate || undefined
                    });
                    setShowNewConfirmation(true);
                  } else {
                    handleSave();
                  }
                }}
                className="p-1 text-green-300 hover:text-green-200 transition-colors"
                disabled={isSaving}
              >
                <CheckIcon className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500/20 text-red-100 px-4 py-2 rounded-t-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mt-2">
        {/* Calibrated By */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">Calibrated By</label>
          {isEditing ? (
            <select
              value={editedCalibration.calibratedby || ''}
              onChange={(e) => setEditedCalibration(prev => ({
                ...prev,
                calibratedby: e.target.value
              }))}
              className="w-full bg-slate-700/50 text-zinc-100 text-xs rounded-md border-0 ring-1 ring-slate-600"
            >
              <option value="">Select Company</option>
              {calibrationCompanies.map(company => (
                <option key={company._id} value={company.name}>
                  {company.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-xs text-zinc-100">
              {currentCalibration?.calibratedby || 'Not specified'}
            </div>
          )}
        </div>

        {/* Calibration Date */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">Calibration Date</label>
          {isEditing ? (
            <DatePicker
              selected={editedCalibration.calibrationdate}
              onChange={handleCalibrationDateChange}
              className="w-full bg-slate-700/50 text-zinc-100 text-xs rounded-md border-0 ring-1 ring-slate-600 p-2"
              dateFormat="yyyy-MM-dd"
            />
          ) : (
            <div className="text-xs text-zinc-100">
              {formatDate(currentCalibration?.calibrationdate ?? null)}
            </div>
          )}
        </div>

        {/* Validity Period */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">Validity Period</label>
          {isEditing ? (
            <select
              value={selectedValidityPeriod}
              onChange={(e) => handleValidityPeriodChange(Number(e.target.value))}
              className="w-full bg-slate-700/50 text-zinc-100 text-xs rounded-md border-0 ring-1 ring-slate-600"
            >
              {VALIDITY_PERIODS.map(period => (
                <option key={period.months} value={period.months}>
                  {period.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-xs text-zinc-100">
              {`${selectedValidityPeriod} Months`}
            </div>
          )}
        </div>

        {/* Valid Until */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">Valid Until</label>
          {isEditing ? (  
            <DatePicker
              selected={editedCalibration.calibrationtodate}
              onChange={handleCalibrationDateChange}
              className="w-full bg-slate-700/50 text-zinc-100 text-xs rounded-md border-0 ring-1 ring-slate-600 p-2"
              dateFormat="yyyy-MM-dd"
            />
          ) : (
            <div className="text-xs text-zinc-100">
              {formatDate((editedCalibration.calibrationtodate || currentCalibration?.calibrationtodate) ?? null)}
            </div>
          )}
        </div>

        {/* Calibration PO */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">Calibration PO</label>
          {isEditing ? (  
            <input
              type="text"
              value={editedCalibration.calibrationpo || ''}
              onChange={(e) => setEditedCalibration(prev => ({
                ...prev,
                calibrationpo: e.target.value
              }))}
              className="w-full bg-slate-700/50 text-zinc-100 text-xs rounded-md border-0 ring-1 ring-slate-600 p-2"
            />
          ) : (
            <div className="text-xs text-zinc-100">
              {currentCalibration?.calibrationpo || 'Not specified'}
            </div>
          )}
        </div>

        {/* Calibration File */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">Calibration File</label>
          {isEditing ? (
            <input
              type="text"
              value={editedCalibration.calibfile || ''}
              onChange={(e) => setEditedCalibration(prev => ({
                ...prev,
                calibfile: e.target.value
              }))}
              className="w-full bg-slate-700/50 text-zinc-100 text-xs rounded-md border-0 ring-1 ring-slate-600 p-2"
            />
          ) : (
            <div className="text-xs text-zinc-100">
              {currentCalibration?.calibfile || 'Not specified'}
            </div>
          )}
        </div>

        {/* Calibration certificate */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">Calibration Certificate</label>
          {isEditing ? (
            <input
              type="text"
              value={editedCalibration.calibcertificate || ''}
              onChange={(e) => setEditedCalibration(prev => ({
                ...prev,
                calibcertificate: e.target.value
              }))}
              className="w-full bg-slate-700/50 text-zinc-100 text-xs rounded-md border-0 ring-1 ring-slate-600 p-2"
            />
          ) : (
            <div className="text-xs text-zinc-100">
              {currentCalibration?.calibcertificate || 'Not specified'}
            </div>
          )}
        </div>
      </div>

      {/* History Section */}
      {calibrationHistory.length > 0 && (
        <div className="mt-6 border-t border-teal-500/80 pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-emerald-400">View Calibration History</h3>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              {showHistory ? 'Hide History' : `Show History (${calibrationHistory.length} previous records)`}
            </button>
          </div>

          {showHistory && (
            <div className="space-y-4">
              {calibrationHistory.map((historyItem, index) => (
                <div 
                  key={historyItem._id || index}
                  className="bg-slate-800/50 rounded-md p-3"
                >
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-emerald-300">Calibrated By:</span>
                      <span className="ml-2 text-zinc-100">{historyItem.calibratedby}</span>
                    </div>
                    <div>
                      <span className="text-emerald-300">Date:</span>
                      <span className="ml-2 text-zinc-100">{formatDate(historyItem.calibrationdate)}</span>
                    </div>
                    <div>
                      <span className="text-emerald-300">Valid Until:</span>
                      <span className="ml-2 text-zinc-100">{formatDate(historyItem.calibrationtodate)}</span>
                    </div>
                    <div>
                      <span className="text-emerald-300">PO:</span>
                      <span className="ml-2 text-zinc-100">{historyItem.calibrationpo || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={showConfirmation}
        onConfirm={handleConfirmedSave}
        onCancel={() => setShowConfirmation(false)}
        isSaving={isSaving}
        changes={{
          calibratedby: pendingChanges?.calibratedby !== currentCalibration?.calibratedby 
            ? pendingChanges?.calibratedby 
            : undefined,
          calibrationdate: pendingChanges?.calibrationdate !== currentCalibration?.calibrationdate 
            ? pendingChanges?.calibrationdate?.toISOString()
            : undefined,
          validityPeriod: selectedValidityPeriod !== 12 
            ? `${selectedValidityPeriod} Months`
            : undefined,
          calibrationpo: pendingChanges?.calibrationpo !== currentCalibration?.calibrationpo 
            ? pendingChanges?.calibrationpo 
            : undefined,
          calibfile: pendingChanges?.calibfile !== currentCalibration?.calibfile 
            ? pendingChanges?.calibfile 
            : undefined,
          calibcertificate: pendingChanges?.calibcertificate !== currentCalibration?.calibcertificate 
            ? pendingChanges?.calibcertificate 
            : undefined,
        }}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Delete Calibration Record</h3>
            <p className="text-sm text-zinc-300 mb-4">
              This action will archive the calibration record. Please provide a reason:
            </p>
            <textarea
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
              className="w-full bg-slate-700/50 text-zinc-100 text-sm rounded-md border-0 ring-1 ring-slate-600 p-2 mb-4"
              placeholder="Reason for deletion..."
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={!archiveReason.trim() || isSaving}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {isSaving ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                disabled={isSaving}
                className="flex-1 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Confirmation Modal */}
      <NewCalibrationModal
        isOpen={showNewConfirmation}
        onConfirm={handleConfirmedNew}
        onCancel={() => setShowNewConfirmation(false)}
        isSaving={isSaving}
        calibration={pendingNewCalibration}
      />
    </div>
  );
}

function NewCalibrationModal({ isOpen, onConfirm, onCancel, isSaving, calibration }: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isSaving: boolean;
  calibration: Partial<Calibration> | null;
}) {
  if (!isOpen || !calibration) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-start gap-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">Add New Calibration</h3>
            <div className="text-sm text-zinc-300 space-y-2">
              <p>Are you sure you want to add this calibration?</p>
              <ul className="list-disc list-inside space-y-1 text-zinc-400">
                <li>Calibrated By: {calibration.calibratedby}</li>
                <li>Date: {calibration.calibrationdate?.toLocaleDateString()}</li>
                <li>Valid Until: {calibration.calibrationtodate?.toLocaleDateString()}</li>
                {calibration.calibrationpo && <li>PO: {calibration.calibrationpo}</li>}
              </ul>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={onConfirm}
                disabled={isSaving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner />
                    <span>Adding...</span>
                  </>
                ) : (
                  'Add Calibration'
                )}
              </button>
              <button
                onClick={onCancel}
                disabled={isSaving}
                className="flex-1 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 