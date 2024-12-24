'use client';
import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { PencilIcon, XMarkIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { AssetData } from '@/types/asset';

// Define the asset categories and statuses
const ASSET_CATEGORIES = [
  'Select Category',  // Default option
  'Test Equipment',
  'Measurement Equipment',
  'Calibration Equipment',
  // ... add more categories
];

const ASSET_SUBCATEGORIES: { [key: string]: string[] } = {
  'Test Equipment': ['Oscilloscope', 'Signal Generator', 'Power Supply'],
  'Measurement Equipment': ['Multimeter', 'LCR Meter', 'Spectrum Analyzer'],
  'Calibration Equipment': ['Temperature Calibrator', 'Pressure Calibrator'],
  // ... add more subcategories
};

const ASSET_STATUSES = [
   // Default option
  'Active',
  'In Calibration',
  'Under Repair',
  'Retired',
  'Disposed'
];

interface AssetDetailsProps {
  asset: AssetData;
  onUpdate: (updatedAsset: Partial<AssetData>) => Promise<void>;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isSaving: boolean;
  changes: {
    category?: string;
    subcategory?: string;
    status?: string;
    notes?: boolean;
  };
}

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

function ConfirmationModal({ isOpen, onConfirm, onCancel, isSaving, changes }: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-start gap-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">Confirm Changes</h3>
            <div className="text-sm text-zinc-300 space-y-2">
              <p>Are you sure you want to save the following changes?</p>
              <ul className="list-disc list-inside space-y-1 text-zinc-400">
                {changes.category && (
                  <li>Category: {changes.category}</li>
                )}
                {changes.subcategory && (
                  <li>Subcategory: {changes.subcategory}</li>
                )}
                {changes.status && (
                  <li>Status: {changes.status}</li>
                )}
                {changes.notes && (
                  <li>Notes have been modified</li>
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

export default function AssetDetails({ asset, onUpdate }: AssetDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAsset, setEditedAsset] = useState(asset);
  const [isSaving, setIsSaving] = useState(false);
  const [editorContent, setEditorContent] = useState(asset.assetnotes);
  const [error, setError] = useState<string | null>(null);
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>(['Select Subcategory']);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<any>(null);

  useEffect(() => {
    if (editedAsset.assetcategory && editedAsset.assetcategory !== 'Select Category') {
      const subcategories = ASSET_SUBCATEGORIES[editedAsset.assetcategory] || [];
      setAvailableSubcategories(['Select Subcategory', ...subcategories]);
    } else {
      setAvailableSubcategories(['Select Subcategory']);
    }
  }, [editedAsset.assetcategory]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: editorContent,
    editable: isEditing,
    onUpdate: ({ editor }) => {
      setEditorContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-invert max-w-none focus:outline-none',
      },
    },
  }, [isEditing]); // Recreate editor when isEditing changes

  // Update editor content when asset changes
  useEffect(() => {
    if (editor && !isEditing) {
      editor.commands.setContent(asset.assetnotes || '');
    }
  }, [asset.assetnotes, editor, isEditing]);

  // Update editor editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
    }
  }, [editor, isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedAsset({
      ...asset,
      assetcategory: asset.assetcategory || 'Select Category',
      assetsubcategory: asset.assetsubcategory || 'Select Subcategory',
      assetstatus: asset.assetstatus || 'Select Status'
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedAsset(asset);
    setEditorContent(asset.assetnotes || '');
    editor?.commands.setContent(asset.assetnotes || '');
  };

  const handleSave = async () => {
    try {
      // Validation
      if (editedAsset.assetcategory === 'Select Category') {
        setError('Please select a category');
        return;
      }
      if (editedAsset.assetsubcategory === 'Select Subcategory') {
        setError('Please select a subcategory');
        return;
      }
      if (editedAsset.assetstatus === 'Select Status') {
        setError('Please select a status');
        return;
      }

      // Update the payload to include new fields
      const updatePayload = {
        assetcategory: editedAsset.assetcategory,
        assetsubcategory: editedAsset.assetsubcategory,
        assetstatus: editedAsset.assetstatus,
        assetnotes: editorContent,
        // Add new fields
        assetmodel: editedAsset.assetmodel,
        assetmanufacturer: editedAsset.assetmanufacturer,
        assetserialnumber: editedAsset.assetserialnumber,
        accessories: editedAsset.accessories,
      };

      // Store payload for confirmation
      setPendingChanges(updatePayload);
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
      await onUpdate(pendingChanges);
      setShowConfirmation(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update asset:', error);
      setError(error instanceof Error ? error.message : 'Failed to update asset');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setEditedAsset(prev => ({
      ...prev,
      assetcategory: newCategory,
      assetsubcategory: 'Select Subcategory' // Reset subcategory when category changes
    }));
  };

  const accessoriesEditor = useEditor({
    extensions: [StarterKit],
    content: asset.accessories || '',
    editable: isEditing,
    onUpdate: ({ editor }) => {
      setEditedAsset(prev => ({
        ...prev,
        accessories: editor.getHTML()
      }));
    },
  }, [isEditing]); // Recreate editor when isEditing changes

  // Update editor content when asset changes
  useEffect(() => {
    if (accessoriesEditor && !isEditing) {
      accessoriesEditor.commands.setContent(asset.accessories || '');
    }
  }, [asset.accessories, accessoriesEditor, isEditing]);

  // Update editor editable state
  useEffect(() => {
    if (accessoriesEditor) {
      accessoriesEditor.setEditable(isEditing);
    }
  }, [accessoriesEditor, isEditing]);

  return (
    <div className="bg-blue-950/20 backdrop-blur-sm rounded-lg shadow-lg p-3 w-full max-w-4xl relative">
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500/20 text-red-100 px-4 py-2 rounded-t-lg text-sm">
          {error}
        </div>
      )}

      {/* Edit/Save/Cancel buttons */}
      <div className="absolute top-3 right-3 flex gap-2">
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="p-1 text-blue-300 hover:text-blue-200 transition-colors"
            title="Edit Asset Details"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        ) : (
          <>
            <button
              onClick={handleCancel}
              className="p-1 text-red-300 hover:text-red-200 transition-colors"
              title="Cancel Editing"
              disabled={isSaving}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleSave}
              className="p-1 text-green-300 hover:text-green-200 transition-colors"
              title="Save Changes"
              disabled={isSaving}
            >
              <CheckIcon className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Non-editable fields */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">Asset Number</label>
          <div className="text-sm font-bold text-zinc-100">
            {asset.assetnumber}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">Asset Description</label>
          <div className="text-sm font-bold text-zinc-100">
            {asset.assetdescription}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">Acquisition Date</label>
          <div className="text-[12px] text-zinc-100">
            {asset.acquireddate ? new Date(asset.acquireddate).toLocaleDateString() : '-'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">Acquisition Value</label>
          <div className="text-[12px] text-zinc-100">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(asset.acquiredvalue ?? 0)}
          </div>
        </div>

        {/* Editable fields */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">Asset Category</label>
          {isEditing ? (
            <select
              value={editedAsset.assetcategory}
              onChange={handleCategoryChange}
              className="w-full bg-slate-700/50 text-zinc-100 text-sm rounded-md border-0 ring-1 ring-slate-600"
            >
              {ASSET_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          ) : (
            <div className="text-[12px] text-zinc-100">{asset.assetcategory}</div>
          )}
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">Asset Subcategory</label>
          {isEditing ? (
            <select
              value={editedAsset.assetsubcategory}
              onChange={(e) => setEditedAsset(prev => ({
                ...prev,
                assetsubcategory: e.target.value
              }))}
              className="w-full bg-slate-700/50 text-zinc-100 text-sm rounded-md border-0 ring-1 ring-slate-600"
              disabled={editedAsset.assetcategory === 'Select Category'}
            >
              {availableSubcategories.map(subcategory => (
                <option key={subcategory} value={subcategory}>{subcategory}</option>
              ))}
            </select>
          ) : (
            <div className="text-[12px] text-zinc-100">{asset.assetsubcategory}</div>
          )}
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">Asset Status</label>
          {isEditing ? (
            <select
              value={editedAsset.assetstatus}
              onChange={(e) => setEditedAsset(prev => ({
                ...prev,
                assetstatus: e.target.value
              }))}
              className="w-full bg-slate-700/50 text-zinc-100 text-sm rounded-md border-0 ring-1 ring-slate-600"
            >
              {ASSET_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          ) : (
            <div className="text-[12px] text-zinc-100">{asset.assetstatus}</div>
          )}
        </div>

        {/* Rich text notes field */}
        <div className="col-span-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100 mb-1">Asset Notes</label>
          <div className={`min-h-[100px] ${isEditing ? 'bg-slate-700/50 rounded-md p-2' : ''}`}>
            <EditorContent 
              editor={editor} 
              className={`prose prose-sm prose-invert max-w-none ${
                isEditing 
                  ? 'min-h-[100px] focus:outline-none cursor-text' 
                  : 'cursor-default'
              }`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">Model</label>
          {isEditing ? (
            <input
              type="text"
              value={editedAsset.assetmodel || ''}
              onChange={(e) => setEditedAsset(prev => ({
                ...prev,
                assetmodel: e.target.value
              }))}
              className="w-full bg-slate-700/50 text-zinc-100 text-sm rounded-md border-0 ring-1 ring-slate-600"
            />
          ) : (
            <div className="text-[12px] text-zinc-100">{asset.assetmodel}</div>
          )}
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">Manufacturer</label>
          {isEditing ? (
            <input
              type="text"
              value={editedAsset.assetmanufacturer || ''}
              onChange={(e) => setEditedAsset(prev => ({
                ...prev,
                assetmanufacturer: e.target.value
              }))}
              className="w-full bg-slate-700/50 text-zinc-100 text-sm rounded-md border-0 ring-1 ring-slate-600"
            />
          ) : (
            <div className="text-[12px] text-zinc-100">{asset.assetmanufacturer}</div>
          )}
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">Serial Number</label>
          {isEditing ? (
            <input
              type="text"
              value={editedAsset.assetserialnumber || ''}
              onChange={(e) => setEditedAsset(prev => ({
                ...prev,
                assetserialnumber: e.target.value
              }))}
              className="w-full bg-slate-700/50 text-zinc-100 text-sm rounded-md border-0 ring-1 ring-slate-600"
            />
          ) : (
            <div className="text-[12px] text-zinc-100">{asset.assetserialnumber}</div>
          )}
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
          <label className="block text-xs font-medium text-teal-100">Accessories</label>
          {isEditing ? (
            <EditorContent 
              editor={accessoriesEditor} 
              className="prose prose-sm prose-invert max-w-none bg-slate-700/50 rounded-md p-2"
            />
          ) : (
            <div 
              className="text-[12px] text-zinc-100 prose prose-sm prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: asset.accessories || '' }}
            />
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onConfirm={handleConfirmedSave}
        onCancel={() => setShowConfirmation(false)}
        isSaving={isSaving}
        changes={{
          category: pendingChanges?.assetcategory !== asset.assetcategory ? pendingChanges?.assetcategory : undefined,
          subcategory: pendingChanges?.assetsubcategory !== asset.assetsubcategory ? pendingChanges?.assetsubcategory : undefined,
          status: pendingChanges?.assetstatus !== asset.assetstatus ? pendingChanges?.assetstatus : undefined,
          notes: pendingChanges?.assetnotes !== asset.assetnotes,
        }}
      />
    </div>
  );
}
