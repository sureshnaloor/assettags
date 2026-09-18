'use client';

import { useState, useEffect, useRef } from 'react';
import { PPEMaster, PPEIssueRecord } from '@/types/ppe';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toaster';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SearchableEmployeeSelect from '@/components/SearchableEmployeeSelect';
import SearchablePPESelect from '@/components/SearchablePPESelect';
import { useAppTheme } from '@/app/contexts/ThemeContext';
import {
  CalendarDaysIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const MIN_DATE = '2025-04-01';
const MAX_DATE = '2026-06-30';

interface PPEPreviousYearFormData {
  userEmpNumber: string;
  userEmpName: string;
  dateOfIssue: string;
  reservationNumber: string;
  fileReferenceNumber: string;
  remarks: string;
}

interface ItemRow {
  ppeId: string;
  ppeName: string;
  quantityIssued: number;
  size: string;
  isFirstIssue: boolean;
  issueAgainstDue: boolean;
}

interface HistoricalIssueRow {
  id: string;
  type: 'Individual' | 'Bulk';
  date: string;
  rawDate: string;
  ppeId: string;
  ppeName: string;
  quantity: number;
  size?: string;
  reservationNumber?: string;
  fileReferenceNumber?: string;
  remarks?: string;
  issuer?: string;
}

export default function PPEPreviousYearIssuesPage() {
  const { theme } = useAppTheme();
  const { show } = useToast();

  const [formData, setFormData] = useState<PPEPreviousYearFormData>({
    userEmpNumber: '',
    userEmpName: '',
    dateOfIssue: '2025-04-01',
    reservationNumber: '',
    fileReferenceNumber: '',
    remarks: '',
  });

  const [itemRows, setItemRows] = useState<ItemRow[]>([
    { ppeId: '', ppeName: '', quantityIssued: 1, size: '', isFirstIssue: true, issueAgainstDue: true },
  ]);

  const [existingRecords, setExistingRecords] = useState<HistoricalIssueRow[]>([]);
  const [fetchingExisting, setFetchingExisting] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }>
  >([]);
  const animationFrameRef = useRef<number>();

  // Fetch existing records for the selected employee in the Apr 1, 2025 - Jun 30, 2026 window
  const fetchEmployeeHistoricalRecords = async (empNumber: string, empName: string) => {
    if (!empNumber && !empName) {
      setExistingRecords([]);
      return;
    }

    try {
      setFetchingExisting(true);

      const indParams = new URLSearchParams();
      if (empNumber) indParams.set('userEmpNumber', empNumber);
      else if (empName) indParams.set('search', empName);
      indParams.set('dateFrom', `${MIN_DATE}T00:00:00.000Z`);
      indParams.set('dateTo', `${MAX_DATE}T23:59:59.999Z`);
      indParams.set('limit', '200');

      const bulkParams = new URLSearchParams();
      const searchForBulk = empNumber || empName;
      if (searchForBulk) bulkParams.set('search', searchForBulk);
      bulkParams.set('dateFrom', MIN_DATE);
      bulkParams.set('dateTo', MAX_DATE);
      bulkParams.set('limit', '200');

      const [indRes, bulkRes] = await Promise.all([
        fetch(`/api/ppe-records?${indParams.toString()}`),
        fetch(`/api/ppe-bulk-issues?${bulkParams.toString()}`),
      ]);

      const [indJson, bulkJson] = await Promise.all([indRes.json(), bulkRes.json()]);

      const indRows: HistoricalIssueRow[] = (indJson?.data?.records || []).map((r: any) => ({
        id: r._id || Math.random().toString(),
        type: 'Individual',
        date: new Date(r.dateOfIssue).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        rawDate: r.dateOfIssue,
        ppeId: r.ppeId,
        ppeName: r.ppeName,
        quantity: r.quantityIssued,
        size: r.size,
        reservationNumber: r.reservationNumber,
        fileReferenceNumber: r.fileReferenceNumber,
        remarks: r.remarks,
        issuer: r.issuedByName || r.issuedBy,
      }));

      const bulkRows: HistoricalIssueRow[] = (bulkJson?.data?.records || []).map((r: any) => ({
        id: r._id || Math.random().toString(),
        type: 'Bulk',
        date: new Date(r.issueDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        rawDate: r.issueDate,
        ppeId: r.ppeId,
        ppeName: r.ppeName,
        quantity: r.quantityIssued,
        size: '',
        remarks: r.remarks,
        issuer: r.issuedByName || r.issuedBy,
      }));

      const merged = [...indRows, ...bulkRows].sort(
        (a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()
      );

      setExistingRecords(merged);
    } catch (error) {
      console.error('Error fetching employee historical records:', error);
      show({
        title: 'Error checking existing records',
        description: 'Could not load existing records for this employee',
        variant: 'destructive',
      });
    } finally {
      setFetchingExisting(false);
    }
  };

  const handleEmployeeChange = (empNumber: string, empName: string) => {
    setFormData((prev) => ({
      ...prev,
      userEmpNumber: empNumber,
      userEmpName: empName,
    }));

    if (empNumber || empName) {
      fetchEmployeeHistoricalRecords(empNumber, empName);
    } else {
      setExistingRecords([]);
    }
  };

  const handleItemChange = (index: number, field: keyof ItemRow, value: any) => {
    const updated = [...itemRows];
    updated[index] = { ...updated[index], [field]: value };
    setItemRows(updated);
  };

  const addItemRow = () => {
    setItemRows((prev) => [
      ...prev,
      { ppeId: '', ppeName: '', quantityIssued: 1, size: '', isFirstIssue: false, issueAgainstDue: true },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (itemRows.length <= 1) return;
    setItemRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userEmpNumber || !formData.userEmpName) {
      show({ title: 'Validation Error', description: 'Please select an employee', variant: 'destructive' });
      return;
    }

    if (!formData.dateOfIssue || formData.dateOfIssue < MIN_DATE || formData.dateOfIssue > MAX_DATE) {
      show({
        title: 'Invalid Date',
        description: `Date of Issue must be between ${MIN_DATE} and ${MAX_DATE}`,
        variant: 'destructive',
      });
      return;
    }

    const validRows = itemRows.filter((r) => r.ppeId && r.quantityIssued > 0);
    if (validRows.length === 0) {
      show({ title: 'No PPE Items', description: 'Please add at least one PPE item', variant: 'destructive' });
      return;
    }

    try {
      setSubmitLoading(true);
      let successCount = 0;

      for (const row of validRows) {
        const response = await fetch('/api/ppe-records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmpNumber: formData.userEmpNumber,
            userEmpName: formData.userEmpName,
            dateOfIssue: formData.dateOfIssue,
            reservationNumber: formData.reservationNumber,
            fileReferenceNumber: formData.fileReferenceNumber,
            ppeId: row.ppeId,
            ppeName: row.ppeName,
            quantityIssued: Number(row.quantityIssued),
            size: row.size,
            isFirstIssue: row.isFirstIssue,
            issueAgainstDue: row.issueAgainstDue,
            remarks: formData.remarks ? `[Previous Year Data] ${formData.remarks}` : '[Previous Year Data]',
            skipStockCheck: true,
            isHistorical: true,
          }),
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || `Failed to create record for ${row.ppeName}`);
        }
        successCount += 1;
      }

      show({
        title: 'Historical Entry Saved',
        description: `Successfully added ${successCount} previous year PPE issue record(s)`,
        variant: 'success',
      });

      // Refresh right side panel immediately to reflect new records
      fetchEmployeeHistoricalRecords(formData.userEmpNumber, formData.userEmpName);

      // Reset item rows for next entry
      setItemRows([
        { ppeId: '', ppeName: '', quantityIssued: 1, size: '', isFirstIssue: false, issueAgainstDue: true },
      ]);
    } catch (err: any) {
      console.error('Error saving historical records:', err);
      show({
        title: 'Submission Failed',
        description: err.message || 'Could not save historical records',
        variant: 'destructive',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Theme-based styles
  const getStyles = () => {
    switch (theme) {
      case 'glassmorphic':
        return {
          container: 'relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]',
          card: 'bg-white/10 backdrop-blur-lg border border-white/20 text-white shadow-2xl',
          cardHeader: 'border-b border-white/10',
          title: 'bg-gradient-to-r from-teal-300 via-white to-teal-400 bg-clip-text text-transparent',
          label: 'text-teal-200 text-sm font-medium',
          input: 'bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:ring-teal-400',
          tableHeader: 'bg-white/5 text-teal-300 border-b border-white/10',
          tableRow: 'border-b border-white/5 hover:bg-white/10 text-white/90',
          badgeWarning: 'bg-amber-500/20 text-amber-300 border border-amber-400/30',
          badgeSuccess: 'bg-teal-500/20 text-teal-300 border border-teal-400/30',
          buttonPrimary: 'bg-teal-500/30 hover:bg-teal-500/40 text-teal-200 border border-teal-400/40',
          buttonSecondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
          subtext: 'text-white/70',
        };
      case 'light':
        return {
          container: 'relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-gray-100',
          card: 'bg-white border-2 border-blue-200 text-gray-900 shadow-xl',
          cardHeader: 'border-b border-blue-100 bg-blue-50/50',
          title: 'bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent',
          label: 'text-blue-900 text-sm font-medium',
          input: 'bg-white border-2 border-blue-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500',
          tableHeader: 'bg-blue-50 text-blue-900 border-b border-blue-200 font-semibold',
          tableRow: 'border-b border-gray-200 hover:bg-blue-50/50 text-gray-800',
          badgeWarning: 'bg-amber-100 text-amber-900 border border-amber-300',
          badgeSuccess: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
          buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 shadow-sm',
          buttonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300',
          subtext: 'text-gray-600',
        };
      default: // dark theme
        return {
          container: 'relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0b1120] via-[#151f32] to-[#0b1120]',
          card: 'bg-slate-800/90 border border-slate-700 text-slate-100 shadow-2xl backdrop-blur-md',
          cardHeader: 'border-b border-slate-700 bg-slate-800/50',
          title: 'bg-gradient-to-r from-slate-100 via-teal-300 to-teal-400 bg-clip-text text-transparent',
          label: 'text-teal-300 text-sm font-medium',
          input: 'bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-teal-400',
          tableHeader: 'bg-slate-900/60 text-teal-300 border-b border-slate-700',
          tableRow: 'border-b border-slate-800 hover:bg-slate-700/40 text-slate-200',
          badgeWarning: 'bg-amber-900/40 text-amber-300 border border-amber-600/40',
          badgeSuccess: 'bg-teal-900/40 text-teal-300 border border-teal-500/40',
          buttonPrimary: 'bg-teal-600 hover:bg-teal-500 text-white border border-teal-500 shadow-md',
          buttonSecondary: 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600',
          subtext: 'text-slate-400',
        };
    }
  };

  const styles = getStyles();

  // Particle background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    particlesRef.current = [];
    for (let i = 0; i < 35; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 2 + 1,
      });
    }

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        if (theme === 'light') {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
        } else {
          ctx.fillStyle = 'rgba(45, 212, 191, 0.35)';
        }
        ctx.fill();

        particlesRef.current.forEach((otherParticle, j) => {
          if (i !== j) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 110) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              if (theme === 'light') {
                ctx.strokeStyle = `rgba(59, 130, 246, ${0.12 * (1 - distance / 110)})`;
              } else {
                ctx.strokeStyle = `rgba(45, 212, 191, ${0.16 * (1 - distance / 110)})`;
              }
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [theme]);

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
                  <CalendarDaysIcon className="w-7 h-7" />
                </div>
                <div>
                  <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${styles.title}`}>
                    PPE Previous Year's Data Entry
                  </h1>
                  <p className={`text-sm mt-1 ${styles.subtext}`}>
                    Enter and backfill historical PPE issues for the period{' '}
                    <span className="font-semibold text-amber-400">01 April 2025 – 30 June 2026</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="default" className={styles.badgeWarning}>
                Allowed Range: 2025-04-01 to 2026-06-30
              </Badge>
            </div>
          </div>
        </div>

        {/* 2-Column Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Data Entry Form */}
          <div className="lg:col-span-7">
            <Card className={styles.card}>
              <CardHeader className={`pb-4 ${styles.cardHeader}`}>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-teal-400" />
                  Historical Issue Form
                </CardTitle>
                <p className={`text-xs ${styles.subtext}`}>
                  Fill in the details below. Existing records for the selected employee will appear on the right to prevent duplication.
                </p>
              </CardHeader>

              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Employee Selection */}
                  <div>
                    <label className={`block mb-1.5 ${styles.label}`}>
                      Select Employee (Name or Emp No) <span className="text-red-400">*</span>
                    </label>
                    <SearchableEmployeeSelect
                      value={formData.userEmpNumber}
                      initialEmpName={formData.userEmpName}
                      onChange={handleEmployeeChange}
                      placeholder="Search employee by number or name..."
                      required
                    />
                    {formData.userEmpNumber && (
                      <p className={`text-xs mt-1.5 flex items-center gap-1 ${styles.subtext}`}>
                        <InformationCircleIcon className="w-4 h-4 text-teal-400" />
                        Selected:{' '}
                        <span className="font-medium text-teal-300">
                          {formData.userEmpNumber} - {formData.userEmpName}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Date of Issue & Reservation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block mb-1.5 ${styles.label}`}>
                        Date of Issue <span className="text-red-400">*</span>
                      </label>
                      <Input
                        type="date"
                        min={MIN_DATE}
                        max={MAX_DATE}
                        value={formData.dateOfIssue}
                        onChange={(e) => setFormData({ ...formData, dateOfIssue: e.target.value })}
                        required
                        className={styles.input}
                      />
                      <span className="text-[11px] text-amber-400 mt-1 block">
                        Strictly 01/04/2025 to 30/06/2026
                      </span>
                    </div>

                    <div>
                      <label className={`block mb-1.5 ${styles.label}`}>Reservation Number</label>
                      <Input
                        type="text"
                        value={formData.reservationNumber}
                        onChange={(e) => setFormData({ ...formData, reservationNumber: e.target.value })}
                        placeholder="e.g. RES-2025-001"
                        className={styles.input}
                      />
                    </div>
                  </div>

                  {/* File Reference & Remarks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block mb-1.5 ${styles.label}`}>File Reference Number</label>
                      <Input
                        type="text"
                        value={formData.fileReferenceNumber}
                        onChange={(e) => setFormData({ ...formData, fileReferenceNumber: e.target.value })}
                        placeholder="e.g. REF-2025-PPE"
                        className={styles.input}
                      />
                    </div>

                    <div>
                      <label className={`block mb-1.5 ${styles.label}`}>Remarks</label>
                      <Input
                        type="text"
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        placeholder="Optional remarks"
                        className={styles.input}
                      />
                    </div>
                  </div>

                  {/* PPE Items Section */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <label className={`text-sm font-semibold ${styles.label}`}>
                        PPE Items to Issue <span className="text-red-400">*</span>
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addItemRow}
                        className={`text-xs flex items-center gap-1 ${styles.buttonSecondary}`}
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                        Add Another Item
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {itemRows.map((row, index) => {
                        // Check if this specific PPE item already exists in the right panel
                        const isAlreadyIssued =
                          row.ppeId &&
                          existingRecords.some(
                            (r) => r.ppeId.toLowerCase() === row.ppeId.toLowerCase()
                          );

                        return (
                          <div
                            key={index}
                            className={`p-4 rounded-xl border relative transition-all ${
                              isAlreadyIssued
                                ? 'bg-amber-500/10 border-amber-500/40'
                                : theme === 'light'
                                ? 'bg-slate-50 border-slate-200'
                                : 'bg-slate-900/50 border-slate-700/70'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                                Item #{index + 1}
                              </span>
                              {itemRows.length > 1 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeItemRow(index)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 w-7 p-0"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </Button>
                              )}
                            </div>

                            {/* PPE Select */}
                            <div className="mb-3">
                              <label className={`block mb-1 text-xs ${styles.label}`}>
                                Select PPE Item <span className="text-red-400">*</span>
                              </label>
                              <SearchablePPESelect
                                value={row.ppeId}
                                onChange={(id, name) => {
                                  handleItemChange(index, 'ppeId', id);
                                  handleItemChange(index, 'ppeName', name);
                                }}
                                placeholder="Search PPE by name or ID..."
                                required
                              />
                            </div>

                            {/* Duplicate Item Warning Badge */}
                            {isAlreadyIssued && (
                              <div className="mb-3 p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-300">
                                <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
                                <div>
                                  <span className="font-semibold">Potential Duplicate:</span> This employee already has a record for{' '}
                                  <span className="underline font-medium">{row.ppeName || row.ppeId}</span> in the 2025-2026 historical period. Check the right panel before proceeding.
                                </div>
                              </div>
                            )}

                            {/* Quantity and Size */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className={`block mb-1 text-xs ${styles.label}`}>
                                  Quantity <span className="text-red-400">*</span>
                                </label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={row.quantityIssued}
                                  onChange={(e) =>
                                    handleItemChange(index, 'quantityIssued', parseInt(e.target.value) || 1)
                                  }
                                  required
                                  className={styles.input}
                                />
                              </div>

                              <div>
                                <label className={`block mb-1 text-xs ${styles.label}`}>Size (Optional)</label>
                                <Input
                                  type="text"
                                  value={row.size}
                                  onChange={(e) => handleItemChange(index, 'size', e.target.value)}
                                  placeholder="e.g. M, L, XL, 42"
                                  className={styles.input}
                                />
                              </div>
                            </div>

                            {/* Checkboxes */}
                            <div className="flex flex-wrap gap-4 pt-1">
                              <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={row.isFirstIssue}
                                  onChange={(e) => handleItemChange(index, 'isFirstIssue', e.target.checked)}
                                  className="rounded border-slate-600 accent-teal-500 h-4 w-4"
                                />
                                <span className={styles.subtext}>First Issue</span>
                              </label>

                              <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={row.issueAgainstDue}
                                  onChange={(e) => handleItemChange(index, 'issueAgainstDue', e.target.checked)}
                                  className="rounded border-slate-600 accent-teal-500 h-4 w-4"
                                />
                                <span className={styles.subtext}>Issue Against Due</span>
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                    <Button
                      type="submit"
                      disabled={submitLoading || !formData.userEmpNumber}
                      className={`w-full sm:w-auto px-8 py-2.5 text-sm font-semibold rounded-xl ${styles.buttonPrimary}`}
                    >
                      {submitLoading ? (
                        <span className="flex items-center gap-2">
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          Saving Historical Entry...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4" />
                          Save Previous Year Data
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Duplicate Prevention & Existing History Panel */}
          <div className="lg:col-span-5">
            <Card className={`${styles.card} sticky top-6`}>
              <CardHeader className={`pb-4 ${styles.cardHeader}`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <CalendarDaysIcon className="w-5 h-5 text-amber-400" />
                    Existing Historical Records
                  </CardTitle>
                  {formData.userEmpNumber && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        fetchEmployeeHistoricalRecords(formData.userEmpNumber, formData.userEmpName)
                      }
                      disabled={fetchingExisting}
                      className="h-8 px-2 text-xs text-teal-300 hover:text-teal-200"
                    >
                      <ArrowPathIcon className={`w-3.5 h-3.5 mr-1 ${fetchingExisting ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  )}
                </div>
                <p className={`text-xs ${styles.subtext}`}>
                  Records for selected employee between <span className="text-amber-400 font-medium">Apr 1, 2025</span> and{' '}
                  <span className="text-amber-400 font-medium">Jun 30, 2026</span>
                </p>
              </CardHeader>

              <CardContent className="pt-5">
                {/* State 1: No employee selected yet */}
                {!formData.userEmpNumber ? (
                  <div className="py-12 px-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-700/40 flex items-center justify-center text-slate-400">
                      <InformationCircleIcon className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-medium mb-1">No Employee Selected</h4>
                    <p className={`text-xs max-w-xs mx-auto ${styles.subtext}`}>
                      Select an employee on the left to verify if records already exist for the April 2025 – June 2026 period.
                    </p>
                  </div>
                ) : fetchingExisting ? (
                  /* State 2: Fetching records */
                  <div className="py-12 text-center">
                    <ArrowPathIcon className="w-8 h-8 mx-auto animate-spin text-teal-400 mb-3" />
                    <p className="text-sm font-medium">Checking historical records...</p>
                    <p className={`text-xs ${styles.subtext}`}>Querying issues for {formData.userEmpName}</p>
                  </div>
                ) : existingRecords.length > 0 ? (
                  /* State 3: Records found -> Show duplicate warning and list */
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5">
                      <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300">
                          {existingRecords.length} Historical Record(s) Found!
                        </span>
                        <p className="mt-0.5 text-amber-200/90">
                          Please review the list below before entering new data to avoid duplicate entries for this employee.
                        </p>
                      </div>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto space-y-2.5 pr-1">
                      {existingRecords.map((rec) => (
                        <div
                          key={rec.id}
                          className={`p-3 rounded-xl border transition-all ${
                            theme === 'light'
                              ? 'bg-blue-50/70 border-blue-200'
                              : 'bg-slate-900/70 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-semibold text-sm text-teal-300">
                                {rec.ppeName || rec.ppeId}
                              </div>
                              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>PPE ID: {rec.ppeId}</span>
                                {rec.size && <span>• Size: {rec.size}</span>}
                              </div>
                            </div>
                            <Badge variant="default" className={styles.badgeWarning}>
                              Qty: {rec.quantity}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5 text-[11px]">
                            <div>
                              <span className={styles.subtext}>Issue Date:</span>{' '}
                              <span className="font-medium text-amber-300">{rec.date}</span>
                            </div>
                            <div>
                              <span className={styles.subtext}>Type:</span>{' '}
                              <span className="font-medium">{rec.type}</span>
                            </div>
                            {rec.reservationNumber && (
                              <div>
                                <span className={styles.subtext}>Res #:</span> {rec.reservationNumber}
                              </div>
                            )}
                            {rec.fileReferenceNumber && (
                              <div>
                                <span className={styles.subtext}>Ref #:</span> {rec.fileReferenceNumber}
                              </div>
                            )}
                            {rec.issuer && (
                              <div className="col-span-2">
                                <span className={styles.subtext}>Issued By:</span> {rec.issuer}
                              </div>
                            )}
                            {rec.remarks && (
                              <div className="col-span-2 italic text-slate-400">
                                "{rec.remarks}"
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* State 4: No records found -> Clear to proceed */
                  <div className="py-8 px-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center">
                      <CheckCircleIcon className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-semibold text-teal-300 mb-1">No Duplicate Records</h4>
                    <p className={`text-xs max-w-xs mx-auto mb-4 ${styles.subtext}`}>
                      No previous PPE issue records exist for{' '}
                      <span className="font-medium text-white">{formData.userEmpName}</span> between April 1, 2025 and June 30, 2026.
                    </p>
                    <Badge variant="default" className={styles.badgeSuccess}>
                      Clear to Enter Previous Year Data
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
