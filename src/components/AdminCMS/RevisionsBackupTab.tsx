import React, { useState } from 'react';
import { CmsConfig, ContentRevision } from '../../types/cms';
import { 
  History, Download, Upload, RotateCcw, ShieldAlert, 
  CheckCircle2, AlertCircle, Clock, ArrowRight, RefreshCw, Sparkles 
} from 'lucide-react';
import { 
  downloadBackup, restoreBackup, resetSystemToDefaults, restoreContentRevision 
} from '../../services/api';

interface RevisionsBackupTabProps {
  cms: CmsConfig;
  onSaveCms: (partial: Partial<CmsConfig>, message?: string) => Promise<void>;
  onRefreshData?: () => void;
  saving: boolean;
}

export const RevisionsBackupTab: React.FC<RevisionsBackupTabProps> = ({
  cms,
  onSaveCms,
  onRefreshData,
  saving,
}) => {
  const [restoringRevisionId, setRestoringRevisionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [uploadingBackup, setUploadingBackup] = useState(false);

  const revisions: ContentRevision[] = cms.revisions || [];

  const handleDownloadBackup = () => {
    downloadBackup();
    setMessage('Enterprise JSON backup downloaded successfully.');
    setTimeout(() => setMessage(null), 3500);
  };

  const handleUploadBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Restoring from backup will overwrite current site configuration. Continue?')) {
      e.target.value = '';
      return;
    }

    setUploadingBackup(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);
          await restoreBackup(parsed);
          setMessage('Backup restored successfully.');
          if (onRefreshData) onRefreshData();
        } catch (err: unknown) {
          alert('Failed to parse backup JSON file.');
        } finally {
          setUploadingBackup(false);
          e.target.value = '';
        }
      };
      reader.readAsText(file);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Upload failed');
      setUploadingBackup(false);
    }
  };

  const handleRestoreRevision = async (rev: ContentRevision) => {
    if (!window.confirm(`Restore Content Revision v${rev.version} (${rev.summary})?`)) return;

    setRestoringRevisionId(rev.id);
    try {
      await restoreContentRevision(rev.id);
      await onSaveCms(rev.snapshot, `Restored to Revision v${rev.version}`);
      setMessage(`Successfully reverted website content to revision v${rev.version}.`);
      if (onRefreshData) onRefreshData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Restore revision failed');
    } finally {
      setRestoringRevisionId(null);
    }
  };

  const handleResetToDefaults = async () => {
    const confirmation = window.prompt('Type "RESET" to confirm resetting all website content to factory defaults:');
    if (confirmation !== 'RESET') return;

    setIsResetting(true);
    try {
      await resetSystemToDefaults();
      setMessage('System restored to default initial CMS datasets.');
      if (onRefreshData) onRefreshData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-2xs font-bold uppercase tracking-wider mb-1">
            <History className="w-3 h-3" />
            Module 17 &bull; Disaster Recovery & Versioning
          </div>
          <h2 className="text-xl font-bold text-slate-900">Content Backup & Revision History</h2>
          <p className="text-xs text-slate-500">
            Automatic snapshot history, instantaneous one-click rollbacks, and offline JSON database export / import.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadBackup}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export JSON Backup
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Backup Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Restore from JSON file */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600" />
            Restore From JSON Backup File
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload a previously exported TesfayeTech CMS JSON file to replace the entire website configuration.
          </p>
          <div className="pt-2">
            <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>{uploadingBackup ? 'Restoring File...' : 'Select Backup File (.json)'}</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleUploadBackup}
                disabled={uploadingBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Factory Reset Danger Zone */}
        <div className="bg-red-50/50 p-6 rounded-2xl border border-red-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-red-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            Reset to Verified Factory Defaults
          </h3>
          <p className="text-xs text-red-700 leading-relaxed">
            Reinitializes all homepage modules, services, Ethiopian partner clients, and team members to production baseline.
          </p>
          <div className="pt-2">
            <button
              onClick={handleResetToDefaults}
              disabled={isResetting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
              {isResetting ? 'Resetting System...' : 'Reset to Verified Defaults'}
            </button>
          </div>
        </div>

      </div>

      {/* Revisions History List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Automated Content Revisions</h3>
            <p className="text-xs text-slate-500">Each publish action creates a secure snapshot stored in Firestore.</p>
          </div>
          <span className="text-2xs font-mono text-slate-400">
            {revisions.length} total snapshots
          </span>
        </div>

        <div className="space-y-3">
          {revisions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No historical revisions found. Making edits will automatically record new versions.
            </div>
          ) : (
            revisions.map((rev) => (
              <div
                key={rev.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-100/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-3xs font-extrabold font-mono">
                      v{rev.version}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">{rev.summary}</span>
                  </div>
                  <div className="text-3xs text-slate-500 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(rev.timestamp).toLocaleString()}
                    </span>
                    <span>&bull;</span>
                    <span>By: {rev.authorEmail || 'Super Admin'}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRestoreRevision(rev)}
                  disabled={restoringRevisionId === rev.id || saving}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold text-2xs rounded-lg transition-colors shadow-xs"
                >
                  <RotateCcw className={`w-3 h-3 ${restoringRevisionId === rev.id ? 'animate-spin' : ''}`} />
                  {restoringRevisionId === rev.id ? 'Restoring...' : 'Restore This Snapshot'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
