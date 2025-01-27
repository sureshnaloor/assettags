'use client';
import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { PencilIcon, XMarkIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { AssetData } from '@/types/asset';
import { usePathname } from 'next/navigation';

// Define separate category constants
const MME_CATEGORIES = [
  'Select Category',
  'Test Equipment',
  'Measurement Equipment',
  'Calibration Equipment',
  // ... MME specific categories
];

const FIXED_ASSET_CATEGORIES = [
  'Select Category',
  'Office Equipment',
  'Furniture',
  'IT Equipment',
  'Vehicles',
  // ... Fixed asset specific categories
];

const MME_SUBCATEGORIES: { [key: string]: string[] } = {
  'Test Equipment': ['Oscilloscope', 'Signal Generator', 'Power Supply'],
  'Measurement Equipment': ['Multimeter', 'LCR Meter', 'Spectrum Analyzer'],
  'Calibration Equipment': ['Temperature Calibrator', 'Pressure Calibrator'],
  // ... MME specific subcategories
};

const FIXED_ASSET_SUBCATEGORIES: { [key: string]: string[] } = {
  'Office Equipment': ['Printer', 'Scanner', 'Copier'],
  'Furniture': ['Desk', 'Chair', 'Cabinet'],
  'IT Equipment': ['Desktop', 'Laptop', 'Server'],
  'Vehicles': ['Car', 'Van', 'Truck'],
  // ... Fixed asset specific subcategories
};

const ASSET_STATUSES = [
  'Select Status',   // Default option
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

interface Category {
  _id: string;
  name: string;
}

interface Subcategory {
  _id: string;
  category: string;
  name: string;
}

export default function AssetDetails({ asset, onUpdate }: AssetDetailsProps) {
  const pathname = usePathname();
  const isFixedAsset = pathname?.includes('/fixedasset/') ?? false;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedAsset, setEditedAsset] = useState<AssetData>(asset);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          isFixedAsset ? '/api/categories/fixedasset' : '/api/categories/mme'
        );
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories([{ _id: '0', name: 'Select Category' }, ...data]);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [isFixedAsset]);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!editedAsset.assetcategory || editedAsset.assetcategory === 'Select Category') {
        setSubcategories([]);
        return;
      }

      try {
        const response = await fetch(
          `${isFixedAsset ? '/api/subcategories/fixedasset' : '/api/subcategories/mme'}?category=${encodeURIComponent(editedAsset.assetcategory)}`
        );
        if (!response.ok) throw new Error('Failed to fetch subcategories');
        const data = await response.json();
        setSubcategories([{ _id: '0', category: editedAsset.assetcategory, name: 'Select Subcategory' }, ...data]);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        setError('Failed to load subcategories');
      }
    };
    fetchSubcategories();
  }, [editedAsset?.assetcategory, isFixedAsset]);

  const [isSaving, setIsSaving] = useState(false);
  const [editorContent, setEditorContent] = useState(asset.assetnotes);
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>(['Select Subcategory']);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<any>(null);

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
    <div className="bg-white dark:bg-slate-800/20 backdrop-blur-sm rounded-lg shadow-lg p-3 w-full max-w-4xl relative">
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-200 px-4 py-2 rounded-t-lg text-sm">
          {error}
        </div>
      )}

      {/* Edit/Save/Cancel buttons */}
      <div className="absolute top-3 right-3 flex gap-2">
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            title="Edit Asset Details"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        ) : (
          <>
            <button
              onClick={handleCancel}
              className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              title="Cancel Editing"
              disabled={isSaving}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleSave}
              className="p-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
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
        <div className="bg-gray-200 dark:bg-slate-700/50 rounded-md p-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Asset Number</label>
          <div className="text-sm font-bold text-gray-900 dark:text-white">
            {asset.assetnumber}
          </div>
        </div>

        <div className="bg-gray-200 dark:bg-slate-700/50 rounded-md p-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Asset Description</label>
          <div className="text-sm font-bold text-gray-900 dark:text-white">
            {asset.assetdescription}
          </div>
        </div>

        <div className="bg-gray-200 dark:bg-slate-700/50 rounded-md p-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Acquisition Date</label>
          <div className="text-[12px] text-gray-900 dark:text-white">
            {asset.acquireddate ? new Date(asset.acquireddate).toLocaleDateString() : '-'}
          </div>
        </div>

        <div className="bg-gray-200 dark:bg-slate-700/50 rounded-md p-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Acquisition Value</label>
          <div className="text-[12px] text-gray-900 dark:text-white">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(asset.acquiredvalue ?? 0)}
          </div>
        </div>

        {/* Editable fields */}
        <div className="bg-gray-200 dark:bg-slate-700/50 rounded-md p-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Asset Category</label>
          {isEditing ? (
            <select
              value={editedAsset.assetcategory}
              onChange={handleCategoryChange}
              className="w-full bg-white dark:bg-slate-600 text-gray-900 dark:text-white text-sm rounded-md 
                       border border-gray-300 dark:border-slate-500
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              {categories.map(category => (
                <option key={category._id} value={category.name}>{category.name}</option>
              ))}
            </select>
          ) : (
            <div className="text-[12px] text-gray-900 dark:text-white">{asset.assetcategory}</div>
          )}
        </div>

        <div className="bg-gray-200 dark:bg-slate-700/50 rounded-md p-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Asset Subcategory</label>
          {isEditing ? (
            <select
              value={editedAsset.assetsubcategory}
              onChange={(e) => setEditedAsset(prev => ({
                ...prev,
                assetsubcategory: e.target.value
              }))}
              className="w-full bg-white dark:bg-slate-600 text-gray-900 dark:text-white text-sm rounded-md 
                       border border-gray-300 dark:border-slate-500
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              disabled={editedAsset.assetcategory === 'Select Category'}
            >
              {subcategories.map(subcategory => (
                <option key={subcategory._id} value={subcategory.name}>{subcategory.name}</option>
              ))}
            </select>
          ) : (
            <div className="text-[12px] text-gray-900 dark:text-white">{asset.assetsubcategory}</div>
          )}
        </div>

        <div className="bg-gray-200 dark:bg-slate-700/50 rounded-md p-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Asset Status</label>
          {isEditing ? (
            <select
              value={editedAsset.assetstatus}
              onChange={(e) => setEditedAsset(prev => ({
                ...prev,
                assetstatus: e.target.value
              }))}
              className="w-full bg-white dark:bg-slate-600 text-gray-900 dark:text-white text-sm rounded-md 
                       border border-gray-300 dark:border-slate-500
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              {ASSET_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          ) : (
            <div className="text-[12px] text-gray-900 dark:text-white">{asset.assetstatus}</div>
          )}
        </div>

        {/* Rich text notes field */}
        <div className="col-span-2 bg-gray-200 dark:bg-slate-700/50 rounded-md p-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            Asset Notes
          </label>
          <div className={`${
            isEditing 
              ? 'bg-white dark:bg-slate-600 rounded-md p-2 border border-gray-200 dark:border-slate-500' 
              : ''
          }`}>
            <EditorContent 
              editor={editor} 
              className={`prose prose-sm dark:prose-invert max-w-none ${
                isEditing 
                  ? 'min-h-[100px] focus:outline-none cursor-text' 
                  : 'cursor-default'
              }`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="bg-gray-200 dark:bg-slate-700/50 rounded-md p-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Model</label>
          {isEditing ? (
            <input
              type="text"
              value={editedAsset.assetmodel || ''}
              onChange={(e) => setEditedAsset(prev => ({
                ...prev,
                assetmodel: e.target.value
              }))}
              className="w-full bg-white dark:bg-slate-600 text-gray-900 dark:text-white text-sm rounded-md 
                       border border-gray-300 dark:border-slate-500
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          ) : (
            <div className="text-[12px] text-gray-900 dark:text-white">{asset.assetmodel}</div>
          )}
        </div>

        <div className="bg-gray-200 dark:bg-slate-700/50 rounded-md p-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Manufacturer</label>
          {isEditing ? (
            <input
              type="text"
              value={editedAsset.assetmanufacturer || ''}
              onChange={(e) => setEditedAsset(prev => ({
                ...prev,
                assetmanufacturer: e.target.value
              }))}
              className="w-full bg-white dark:bg-slate-600 text-gray-900 dark:text-white text-sm rounded-md 
                       border border-gray-300 dark:border-slate-500
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          ) : (
            <div className="text-[12px] text-gray-900 dark:text-white">{asset.assetmanufacturer}</div>
          )}
        </div>

        <div className="bg-gray-200 dark:bg-slate-700/50 rounded-md p-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Serial Number</label>
          {isEditing ? (
            <input
              type="text"
              value={editedAsset.assetserialnumber || ''}
              onChange={(e) => setEditedAsset(prev => ({
                ...prev,
                assetserialnumber: e.target.value
              }))}
              className="w-full bg-white dark:bg-slate-600 text-gray-900 dark:text-white text-sm rounded-md 
                       border border-gray-300 dark:border-slate-500
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          ) : (
            <div className="text-[12px] text-gray-900 dark:text-white">{asset.assetserialnumber}</div>
          )}
        </div>

        <div className="bg-gray-200 dark:bg-slate-700/50 rounded-md p-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Accessories</label>
          {isEditing ? (
            <EditorContent 
              editor={accessoriesEditor} 
              className="prose prose-sm dark:prose-invert max-w-none bg-white dark:bg-slate-600 rounded-md p-2"
            />
          ) : (
            <div 
              className="text-[12px] text-gray-900 dark:text-white prose prose-sm dark:prose-invert max-w-none"
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
