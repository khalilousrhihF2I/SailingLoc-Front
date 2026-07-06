import { useRef, useState } from 'react';
import { UploadCloud, FileText, X, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

export interface DocTypeOption {
  value: string;
  label: string;
}

export interface BoatOption {
  id: number | string;
  name: string;
}

interface DocumentUploaderProps {
  /** Selectable document types. */
  docTypes: DocTypeOption[];
  /** When provided, a boat must be selected before uploading (owner flow). */
  boats?: BoatOption[];
  /** Whether an upload is currently in progress. */
  uploading?: boolean;
  /** Called when the user submits a valid document. */
  onUpload: (args: { file: File; documentType: string; boatId: string | number | null }) => Promise<void> | void;
}

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,application/pdf,image/*';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

const selectClass =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none';

export function DocumentUploader({ docTypes, boats, uploading = false, onUpload }: DocumentUploaderProps) {
  const requireBoat = Array.isArray(boats);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState(docTypes[0]?.value ?? '');
  const [boatId, setBoatId] = useState<string | number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const canSubmit = !!file && !!docType && (!requireBoat || !!boatId) && !uploading;

  const reset = () => {
    setFile(null);
    setDocType(docTypes[0]?.value ?? '');
    if (requireBoat) setBoatId(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const submit = async () => {
    if (!canSubmit || !file) return;
    await onUpload({ file, documentType: docType, boatId: requireBoat ? boatId : null });
    reset();
  };

  const clearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const helper = (() => {
    if (uploading) return 'Envoi du document en cours…';
    const missing: string[] = [];
    if (requireBoat && !boatId) missing.push('sélectionnez un bateau');
    if (!file) missing.push('ajoutez un fichier');
    if (missing.length === 0) return 'Tout est prêt, vous pouvez envoyer le document.';
    return `Pour continuer, ${missing.join(' et ')}.`;
  })();

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-5">
      <div className="mb-4">
        <h4 className="text-gray-900 font-semibold">Ajouter un document</h4>
        <p className="text-sm text-gray-500">Formats acceptés : PDF, JPG ou PNG (10 Mo max).</p>
      </div>

      <div className={`grid gap-4 ${requireBoat ? 'sm:grid-cols-2' : ''}`}>
        {requireBoat && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bateau concerné</label>
            <select
              className={selectClass}
              value={boatId ?? ''}
              onChange={(e) => setBoatId(e.target.value ? (isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value)) : null)}
            >
              <option value="">-- Sélectionner un bateau --</option>
              {boats!.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de document</label>
          <select className={selectClass} value={docType} onChange={(e) => setDocType(e.target.value)}>
            {docTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">Fichier</label>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const dropped = e.dataTransfer.files?.[0];
          if (dropped) setFile(dropped);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
          dragOver
            ? 'border-ocean-500 bg-ocean-50'
            : file
              ? 'border-ocean-300 bg-white'
              : 'border-gray-300 bg-white hover:border-ocean-400 hover:bg-ocean-50/40'
        }`}
      >
        {file ? (
          <div className="flex w-full items-center justify-center gap-3">
            <FileText className="shrink-0 text-ocean-600" size={28} />
            <div className="min-w-0 text-left">
              <div className="truncate font-medium text-gray-900">{file.name}</div>
              <div className="text-xs text-gray-500">{formatSize(file.size)}</div>
            </div>
            <button
              type="button"
              onClick={clearFile}
              aria-label="Retirer le fichier"
              className="ml-1 shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <>
            <UploadCloud className="text-ocean-500" size={32} />
            <div className="text-gray-700">
              <span className="font-medium text-ocean-600">Cliquez pour choisir un fichier</span> ou glissez-déposez
            </div>
            <div className="text-xs text-gray-400">PDF, JPG ou PNG</div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className={`flex items-center gap-1.5 text-xs ${canSubmit ? 'text-green-600' : 'text-gray-500'}`}>
          {canSubmit && <CheckCircle2 size={14} />}
          {helper}
        </p>
        <Button disabled={!canSubmit} onClick={submit}>
          {uploading ? 'Envoi…' : 'Ajouter le document'}
        </Button>
      </div>
    </div>
  );
}

export default DocumentUploader;
