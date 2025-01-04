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
  assetnumber: string;
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-start justify-center pt-4 sm:pt-8 px-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-2xl w-full mb-4">
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

export default function CalibrationDetails({ currentCalibration, calibrationHistory, onUpdate, assetnumber }: CalibrationDetailsProps) {
  const [showNewCalibrationModal, setShowNewCalibrationModal] = useState(false);
  
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

  useEffect(() => {
    if (isNewMode) {
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
      setSelectedValidityPeriod(12);
    }
  }, [isNewMode, currentCalibration?.assetnumber]);

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
    setIsEditing(false);
    setIsNewMode(true);
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

  console.log('Main component currentCalibration:', currentCalibration);

  // Add this to get asset number from either current calibration or history
  const assetNumber = currentCalibration?.assetnumber || calibrationHistory[0]?.assetnumber || '';

  return (
    <div className="bg-white dark:bg-slate-800/20 backdrop-blur-sm rounded-lg shadow-lg p-3 w-full max-w-4xl relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {isNewMode ? 'New Calibration' : 'Current Calibration'}
        </h2>
        
        <div className="flex gap-2">
          {!isEditing && !isNewMode && (
            <>
              <button
                onClick={() => setShowNewCalibrationModal(true)}
                className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                title="New Calibration"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
              {currentCalibration && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
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
                className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
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
                className="p-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                disabled={isSaving}
              >
                <CheckIcon className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-200 px-4 py-2 rounded-t-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mt-2">
        {/* Calibrated By */}
        <div className="bg-gray-200 dark:bg-slate-700/50 rounded-md p-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Calibrated By</label>
          {isEditing ? (
            <select
              value={editedCalibration.calibratedby || ''}
              onChange={(e) => setEditedCalibration(prev => ({
                ...prev,
                calibratedby: e.target.value
              }))}
              className="w-full bg-white dark:bg-slate-600 text-gray-900 dark:text-white text-xs rounded-md 
                       border border-gray-300 dark:border-slate-500
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="">Select Company</option>
              {calibrationCompanies.map(company => (
                <option key={company._id} value={company.name}>
                  {company.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-sm text-gray-900 dark:text-white">
              {currentCalibration?.calibratedby || 'Not specified'}
            </div>
          )}
        </div>

        {/* Calibration Date */}
        <div className="bg-gray-200 dark:bg-slate-700/50 rounded-md p-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Calibration Date</label>
          {isEditing ? (
            <DatePicker
              selected={editedCalibration.calibrationdate}
              onChange={handleCalibrationDateChange}
              className="w-full bg-white dark:bg-slate-600 text-gray-900 dark:text-white text-xs rounded-md 
                       border border-gray-300 dark:border-slate-500 p-2
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              dateFormat="yyyy-MM-dd"
            />
          ) : (
            <div className="text-sm text-gray-900 dark:text-white">
              {formatDate(currentCalibration?.calibrationdate ?? null)}
            </div>
          )}
        </div>

        {/* Validity Period */}
        <div className="bg-gray-200 dark:bg-slate-700/50 rounded-md p-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Validity Period</label>
          {isEditing ? (
            <select
              value={selectedValidityPeriod}
              onChange={(e) => handleValidityPeriodChange(Number(e.target.value))}
              className="w-full bg-white dark:bg-slate-600 text-gray-900 dark:text-white text-xs rounded-md 
                       border border-gray-300 dark:border-slate-500
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              {VALIDITY_PERIODS.map(period => (
                <option key={period.months} value={period.months}>
                  {period.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-sm text-gray-900 dark:text-white">
              {`${selectedValidityPeriod} Months`}
            </div>
          )}
        </div>

        {/* Valid Until */}
        <div className="bg-gray-200 dark:bg-slate-700/50 rounded-md p-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Valid Until</label>
          <div className="text-sm text-gray-900 dark:text-white">
            {currentCalibration?.calibrationtodate 
              ? new Date(currentCalibration.calibrationtodate).toLocaleDateString() 
              : '-'}
          </div>
        </div>

        {/* Calibration PO */}
        <div className="bg-gray-200 dark:bg-slate-700/50 rounded-md p-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Calibration PO</label>
          {isEditing ? (  
            <input
              type="text"
              value={editedCalibration.calibrationpo || ''}
              onChange={(e) => setEditedCalibration(prev => ({
                ...prev,
                calibrationpo: e.target.value
              }))}
              className="w-full bg-white dark:bg-slate-600 text-gray-900 dark:text-white text-xs rounded-md 
                       border border-gray-300 dark:border-slate-500 p-2
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          ) : (
            <div className="text-sm text-gray-900 dark:text-white">
              {currentCalibration?.calibrationpo || 'Not specified'}
            </div>
          )}
        </div>

        {/* Calibration File */}
        <div className="bg-gray-200 dark:bg-slate-700/50 rounded-md p-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Calibration File</label>
          {isEditing ? (
            <input
              type="text"
              value={editedCalibration.calibfile || ''}
              onChange={(e) => setEditedCalibration(prev => ({
                ...prev,
                calibfile: e.target.value
              }))}
              className="w-full bg-white dark:bg-slate-600 text-gray-900 dark:text-white text-xs rounded-md 
                       border border-gray-300 dark:border-slate-500 p-2
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          ) : (
            <div className="text-sm text-gray-900 dark:text-white">
              {currentCalibration?.calibfile || 'Not specified'}
            </div>
          )}
        </div>

        {/* Calibration certificate */}
        <div className="bg-gray-200 dark:bg-slate-700/50 rounded-md p-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Calibration Certificate</label>
          {isEditing ? (
            <input
              type="text"
              value={editedCalibration.calibcertificate || ''}
              onChange={(e) => setEditedCalibration(prev => ({
                ...prev,
                calibcertificate: e.target.value
              }))}
              className="w-full bg-white dark:bg-slate-600 text-gray-900 dark:text-white text-xs rounded-md 
                       border border-gray-300 dark:border-slate-500 p-2
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          ) : (
            <div className="text-sm text-gray-900 dark:text-white">
              {currentCalibration?.calibcertificate || 'Not specified'}
            </div>
          )}
        </div>
      </div>

      {/* History Section */}
      <div className="mt-6 border-t border-gray-200 dark:border-slate-600/80 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100">Calibration History</h3>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {showHistory ? 'Hide History' : `Show History (${calibrationHistory.length} previous records)`}
          </button>
        </div>

        {showHistory && calibrationHistory.length > 0 && (
          <div className="space-y-2">
            {calibrationHistory.map((record) => (
              <div 
                key={record._id}
                className="bg-gray-200 dark:bg-slate-700/30 rounded-md p-2 shadow-md 
                         border border-gray-200 dark:border-slate-600/30"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Calibrated By</label>
                    <div className="text-sm text-gray-900 dark:text-white">{record.calibratedby}</div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Calibration Date</label>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {record.calibrationdate ? new Date(record.calibrationdate).toLocaleDateString() : '-'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Valid Until</label>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {record.calibrationtodate ? new Date(record.calibrationtodate).toLocaleDateString() : '-'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">PO Number</label>
                    <div className="text-sm text-gray-900 dark:text-white">{record.calibrationpo || '-'}</div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Certificate</label>
                    <div className="text-sm text-gray-900 dark:text-white">{record.calibcertificate || '-'}</div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">File Reference</label>
                    <div className="text-sm text-gray-900 dark:text-white">{record.calibfile || '-'}</div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Created By</label>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {record.createdby}
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                        on {new Date(record.createdat).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-start justify-center pt-4 sm:pt-8 px-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-2xl w-full mb-4">
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

      {/* New Calibration Modal */}
      <NewCalibrationFormModal
        isOpen={showNewCalibrationModal}
        onClose={() => setShowNewCalibrationModal(false)}
        onSave={(newCalibration) => {
          console.log('Opening modal with asset number:', assetnumber);
          onUpdate(newCalibration);
          setShowNewCalibrationModal(false);
        }}
        assetnumber={assetnumber}
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-start justify-center pt-4 sm:pt-8 px-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-2xl w-full mb-4">
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

interface NewCalibrationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (calibration: Calibration) => void;
  assetnumber: string;
}

function NewCalibrationFormModal({ isOpen, onClose, onSave, assetnumber }: NewCalibrationFormModalProps) {
  console.log('Modal received assetnumber:', assetnumber);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calibrationCompanies, setCalibrationCompanies] = useState<CalibrationCompany[]>([]);
  const [selectedValidityPeriod, setSelectedValidityPeriod] = useState(12);
  const [newCalibration, setNewCalibration] = useState<Calibration>(() => ({
    calibratedby: '',
    calibrationdate: null,
    calibrationtodate: null,
    calibrationpo: '',
    calibfile: '',
    calibcertificate: '',
    assetnumber: assetnumber,
    createdby: 'current-user',
    createdat: new Date(),
  } as Calibration));

  useEffect(() => {
    console.log('Asset number changed in modal:', assetnumber);
    setNewCalibration(prev => ({
      ...prev,
      assetnumber: assetnumber
    }));
  }, [assetnumber]);

  useEffect(() => {
    if (isOpen) {
      fetchCalibrationCompanies();
    }
  }, [isOpen]);

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

  const handleSave = async () => {
    try {
      console.log('Saving calibration with assetnumber:', newCalibration.assetnumber);
      
      if (!newCalibration.calibratedby) {
        setError('Please select a calibration company');
        return;
      }
      if (!newCalibration.calibrationdate) {
        setError('Please select a calibration date');
        return;
      }

      const calibrationWithAssetNumber = {
        ...newCalibration,
        assetnumber: newCalibration.assetnumber
      };

      console.log('Final payload:', calibrationWithAssetNumber);

      setIsSaving(true);
      const response = await fetch(`/api/calibrations/${newCalibration.assetnumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calibrationWithAssetNumber),
      });

      if (!response.ok) {
        throw new Error('Failed to create calibration');
      }

      const savedCalibration = await response.json();
      onSave(savedCalibration);
    } catch (error) {
      console.error('Failed to create calibration:', error);
      setError(error instanceof Error ? error.message : 'Failed to create calibration');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-start justify-center pt-4 sm:pt-8 px-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-2xl w-full mb-4">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">New Calibration</h3>
        
        {error && (
          <div className="bg-red-500/20 text-red-100 px-4 py-2 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Calibrated By
            </label>
            <select
              value={newCalibration.calibratedby}
              onChange={(e) => setNewCalibration(prev => ({
                ...prev,
                calibratedby: e.target.value
              }))}
              className="w-full bg-slate-700/50 text-zinc-100 text-sm rounded-md border-0 ring-1 ring-slate-600 p-2"
            >
              <option value="">Select Company</option>
              {calibrationCompanies.map(company => (
                <option key={company._id} value={company.name}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Calibration Date
            </label>
            <DatePicker
              selected={newCalibration.calibrationdate}
              onChange={(date: Date | null) => {
                if (date) {
                  const validUntil = new Date(date);
                  validUntil.setMonth(validUntil.getMonth() + selectedValidityPeriod);
                  setNewCalibration(prev => ({
                    ...prev,
                    calibrationdate: date,
                    calibrationtodate: validUntil
                  }));
                }
              }}
              className="w-full bg-slate-700/50 text-zinc-100 text-sm rounded-md border-0 ring-1 ring-slate-600 p-2"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Validity Period
            </label>
            <select
              value={selectedValidityPeriod}
              onChange={(e) => {
                const months = Number(e.target.value);
                setSelectedValidityPeriod(months);
                if (newCalibration.calibrationdate) {
                  const validUntil = new Date(newCalibration.calibrationdate);
                  validUntil.setMonth(validUntil.getMonth() + months);
                  setNewCalibration(prev => ({
                    ...prev,
                    calibrationtodate: validUntil
                  }));
                }
              }}
              className="w-full bg-slate-700/50 text-zinc-100 text-sm rounded-md border-0 ring-1 ring-slate-600 p-2"
            >
              {VALIDITY_PERIODS.map(period => (
                <option key={period.months} value={period.months}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Valid Until
            </label>
            <DatePicker
              selected={newCalibration.calibrationtodate}
              onChange={(date: Date | null) => {
                if (date) {
                  setNewCalibration(prev => ({
                    ...prev,
                    calibrationtodate: date
                  }));
                }
              }}
              className="w-full bg-slate-700/50 text-zinc-100 text-sm rounded-md border-0 ring-1 ring-slate-600 p-2"
              dateFormat="yyyy-MM-dd"
              minDate={newCalibration.calibrationdate || undefined}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Calibration PO
            </label>
            <input
              type="text"
              value={newCalibration.calibrationpo}
              onChange={(e) => setNewCalibration(prev => ({
                ...prev,
                calibrationpo: e.target.value
              }))}
              className="w-full bg-slate-700/50 text-zinc-100 text-sm rounded-md border-0 ring-1 ring-slate-600 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Calibration Certificate
            </label>
            <input
              type="text"
              value={newCalibration.calibcertificate}
              onChange={(e) => setNewCalibration(prev => ({
                ...prev,
                calibcertificate: e.target.value
              }))}
              className="w-full bg-slate-700/50 text-zinc-100 text-sm rounded-md border-0 ring-1 ring-slate-600 p-2"
              placeholder="Enter certificate number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Calibration File
            </label>
            <input
              type="text"
              value={newCalibration.calibfile}
              onChange={(e) => setNewCalibration(prev => ({
                ...prev,
                calibfile: e.target.value
              }))}
              className="w-full bg-slate-700/50 text-zinc-100 text-sm rounded-md border-0 ring-1 ring-slate-600 p-2"
              placeholder="Enter file reference"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <LoadingSpinner />
                <span>Saving...</span>
              </>
            ) : (
              'Save'
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 