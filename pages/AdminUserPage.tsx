import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { userDocumentService, adminService } from '../services/ServiceFactory';
import { Page } from '../types/navigation';
import { useModal } from '../hooks/useModal';
import { ArrowLeft, FileText, CheckCircle, XCircle, RefreshCw, User, Mail, Shield } from 'lucide-react';

export default function AdminUserPage({ pageData, onNavigate }: { pageData?: any; onNavigate?: (page: Page, data?: any) => void }) {
  const { showAlert, showConfirm } = useModal();
  const [userId, setUserId] = useState<string | null>(null);
  const [userDocs, setUserDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const [verifyingIds, setVerifyingIds] = useState<number[]>([]);

  useEffect(() => {
    const dataUid = pageData?.userId ? String(pageData.userId) : null;
    if (dataUid) { setUserId(dataUid); return; }
    const params = new URLSearchParams(window.location.search);
    const uid = params.get('userId');
    if (uid) setUserId(uid);
  }, [pageData]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        if (!userId) { setUserDocs([]); setLoading(false); return; }
        const docs = await userDocumentService.getDocumentsByUser(String(userId));
        if (!mounted) return;
        setUserDocs(docs || []);
        try {
          const users = await adminService.getUsers();
          const u = (users || []).find((x: any) => String(x.id) === String(userId));
          if (u && mounted) setUserInfo(u);
        } catch { /* ignore */ }
      } catch { setUserDocs([]); } finally { if (mounted) setLoading(false); }
    };
    load();
    return () => { mounted = false; };
  }, [userId]);

  const refresh = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const docs = await userDocumentService.getDocumentsByUser(userId);
      setUserDocs(docs || []);
    } catch { setUserDocs([]); } finally { setLoading(false); }
  };

  const markVerifying = (id: number) => setVerifyingIds((s) => Array.from(new Set([...s, id])));
  const unmarkVerifying = (id: number) => setVerifyingIds((s) => s.filter(x => x !== id));

  const handleVerify = async (id: number, approve: boolean) => {
    markVerifying(id);
    try {
      await userDocumentService.verifyDocument(id, approve);
      showAlert(approve ? 'Document approuvé' : 'Document rejeté', 'Documents');
      await refresh();
    } catch (err: any) { showAlert(err?.message || String(err), 'Erreur'); } finally { unmarkVerifying(id); }
  };

  const handleApproveAll = async () => {
    if (!userDocs || userDocs.length === 0) return;
    const pending = userDocs.filter(d => !d.isVerified);
    if (pending.length === 0) { showAlert('Aucun document en attente de vérification', 'Documents'); return; }
    showConfirm({
      title: 'Approuver tous les documents',
      message: `Voulez-vous approuver les ${pending.length} document(s) en attente pour cet utilisateur ?`,
      confirmLabel: 'Approuver tout',
      cancelLabel: 'Annuler',
      onConfirm: async () => {
        let success = 0, failed = 0;
        for (const d of pending) {
          markVerifying(d.id);
          try { await userDocumentService.verifyDocument(d.id, true); success++; } catch { failed++; } finally { unmarkVerifying(d.id); }
        }
        await refresh();
        showAlert(`Opération terminée — approuvés: ${success}, échoués: ${failed}`, 'Documents');
      }
    });
  };

  const pendingCount = userDocs.filter(d => !d.isVerified).length;
  const verifiedCount = userDocs.filter(d => d.isVerified).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <Button variant="ghost" onClick={() => { if (onNavigate) onNavigate('admin-dashboard', { tab: 'users' }); else window.history.back(); }} className="mb-6">
          <ArrowLeft size={18} />
          Retour aux utilisateurs
        </Button>

        {/* User Header Card */}
        <Card className="p-6 mb-6 border-l-4 border-l-ocean-500">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-ocean-600 rounded-full flex items-center justify-center text-white text-xl shrink-0">
                {userInfo?.name ? userInfo.name.split(' ').map((s: string) => s[0]).slice(0, 2).join('').toUpperCase() : <User size={24} />}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{userInfo?.name || 'Utilisateur'}</h2>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {userInfo?.email && (
                    <span className="flex items-center gap-1 text-sm text-gray-500"><Mail size={14} /> {userInfo.email}</span>
                  )}
                  <span className="text-xs text-gray-400">ID: {userId}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={refresh}><RefreshCw size={16} /> Rafraîchir</Button>
              {pendingCount > 0 && (
                <Button variant="primary" size="sm" onClick={handleApproveAll}>
                  <Shield size={16} /> Approuver tout ({pendingCount})
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-semibold text-gray-900">{userDocs.length}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Documents</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-semibold text-green-600">{verifiedCount}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Vérifiés</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-semibold text-orange-600">{pendingCount}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">En attente</div>
          </Card>
        </div>

        {/* Documents List */}
        <Card className="p-6">
          <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2"><FileText size={20} className="text-ocean-600" /> Documents de l'utilisateur</h3>

          {loading && <div className="text-center py-8 text-gray-500">Chargement des documents...</div>}
          {!loading && userDocs.length === 0 && (
            <div className="text-center py-12">
              <FileText size={48} className="text-gray-300 mx-auto mb-3" />
              <div className="text-gray-500">Aucun document trouvé pour cet utilisateur</div>
            </div>
          )}

          <div className="space-y-3">
            {userDocs.map((doc) => (
              <div key={doc.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-ocean-200 transition-colors gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${doc.isVerified ? 'bg-green-100' : 'bg-orange-100'}`}>
                    <FileText size={18} className={doc.isVerified ? 'text-green-600' : 'text-orange-600'} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900">{doc.documentType}</div>
                    <div className="text-xs text-gray-500">{doc.fileName} {doc.fileSize ? `• ${(doc.fileSize / 1024).toFixed(1)} KB` : ''}</div>
                    {doc.isVerified && (
                      <div className="text-xs text-gray-400 mt-0.5">Vérifié par {doc.verifiedBy || 'admin'} le {doc.verifiedAt ? new Date(doc.verifiedAt).toLocaleString() : ''}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {doc.documentUrl && <a href={doc.documentUrl} target="_blank" rel="noreferrer" className="text-sm text-ocean-600 hover:underline">Voir</a>}
                  <Badge variant={doc.isVerified ? 'success' : 'warning'}>{doc.isVerified ? 'Vérifié' : 'Non vérifié'}</Badge>
                  {!doc.isVerified && (
                    <>
                      <Button size="sm" variant="primary" disabled={verifyingIds.includes(doc.id)} onClick={() => handleVerify(doc.id, true)}>
                        <CheckCircle size={14} /> {verifyingIds.includes(doc.id) ? '...' : 'Approuver'}
                      </Button>
                      <Button size="sm" variant="ghost" disabled={verifyingIds.includes(doc.id)} onClick={() => handleVerify(doc.id, false)} className="text-red-600 hover:bg-red-50">
                        <XCircle size={14} /> Rejeter
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
