import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { userDocumentService, adminService } from '../services/ServiceFactory';
import { Page } from '../types/navigation';
import { useModal } from '../hooks/useModal';

export default function AdminUserPage({ pageData, onNavigate }: { pageData?: any; onNavigate?: (page: Page, data?: any) => void }) {
  const { showAlert, showConfirm } = useModal();
  const [userId, setUserId] = useState<string | null>(null);
  const [userDocs, setUserDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const [verifyingIds, setVerifyingIds] = useState<number[]>([]);

  // Derive userId from SPA navigation pageData or from query string
  useEffect(() => {
    const dataUid = pageData?.userId ? String(pageData.userId) : null;
    if (dataUid) {
      setUserId(dataUid);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const uid = params.get('userId');
    if (uid) setUserId(uid);
  }, [pageData]);

  // Load documents whenever userId changes
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        if (!userId) {
          setUserDocs([]);
          setLoading(false);
          return;
        }

        const docs = await userDocumentService.getDocumentsByUser(String(userId));
        if (!mounted) return;
        setUserDocs(docs || []);

        // try to fetch minimal user info from adminService.getUsers()
        try {
          const users = await adminService.getUsers();
          const u = (users || []).find((x: any) => String(x.id) === String(userId));
          if (u && mounted) setUserInfo(u);
        } catch (e) {
          // ignore
        }
      } catch (err: any) {
        console.error('Error loading user documents', err);
        setUserDocs([]);
      } finally {
        if (mounted) setLoading(false);
      }
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
    } catch (err) {
      console.error('Refresh error', err);
      setUserDocs([]);
    } finally {
      setLoading(false);
    }
  };

  const markVerifying = (id: number) => setVerifyingIds((s) => Array.from(new Set([...s, id])));
  const unmarkVerifying = (id: number) => setVerifyingIds((s) => s.filter(x => x !== id));

  const handleVerify = async (id: number, approve: boolean) => {
    markVerifying(id);
    try {
      await userDocumentService.verifyDocument(id, approve);
      showAlert(approve ? 'Document approuvé' : 'Document rejeté', 'Documents');
      await refresh();
    } catch (err: any) {
      showAlert(err?.message || String(err), 'Erreur');
    } finally {
      unmarkVerifying(id);
    }
  };

  const handleApproveAll = async () => {
    if (!userDocs || userDocs.length === 0) return;
    const pending = userDocs.filter(d => !d.isVerified);
    if (pending.length === 0) {
      showAlert('Aucun document en attente de vérification', 'Documents');
      return;
    }

    showConfirm({
      title: 'Approuver tous les documents',
      message: `Voulez-vous approuver les ${pending.length} document(s) en attente pour cet utilisateur ?`,
      confirmLabel: 'Approuver tout',
      cancelLabel: 'Annuler',
      onConfirm: async () => {
        let success = 0;
        let failed = 0;
        for (const d of pending) {
          markVerifying(d.id);
          try {
            await userDocumentService.verifyDocument(d.id, true);
            success++;
          } catch (e) {
            failed++;
          } finally {
            unmarkVerifying(d.id);
          }
        }
        await refresh();
        showAlert(`Opération terminée — approuvés: ${success}, échoués: ${failed}`, 'Documents');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Gestion utilisateur</h2>
              <div className="text-sm text-gray-600">Gérer les documents et le profil utilisateur</div>
            </div>
            <div>
              <Button variant="ghost" onClick={() => {
                if (onNavigate) onNavigate('admin-dashboard', { tab: 'users' });
                else window.history.back();
              }} className='mr-2'>Retour</Button>
              <Button variant="primary" onClick={() => refresh()} className='mr-2'>Rafraîchir</Button>
              <Button variant="secondary" onClick={() => handleApproveAll()}>Approuver tout</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Utilisateur</h3>
          <div className="mb-4">
            <div className="text-sm text-gray-600">ID: {userId}</div>
            <div className="text-sm text-gray-600">Nom: {userInfo?.name || '-'}</div>
            <div className="text-sm text-gray-600">Email: {userInfo?.email || '-'}</div>
          </div>

          <h4 className="text-gray-900 mb-3">Documents</h4>
          {loading && <div>Chargement...</div>}
          {!loading && userDocs.length === 0 && <div className="text-sm text-gray-500">Aucun document</div>}
          <div className="space-y-3">
            {userDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="text-sm text-gray-900">{doc.documentType}</div>
                  <div className="text-xs text-gray-600">{doc.fileName} • {doc.fileSize ? `${(doc.fileSize/1024).toFixed(1)} KB` : ''}</div>
                  {doc.isVerified && (
                    <div className="text-xs text-gray-500 mt-1">Vérifié par {doc.verifiedBy || 'admin'} le {doc.verifiedAt ? new Date(doc.verifiedAt).toLocaleString() : ''}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {doc.documentUrl ? <a href={doc.documentUrl} target="_blank" rel="noreferrer" className="text-ocean-600 hover:underline">Voir</a> : null}
                  <Badge variant={doc.isVerified ? 'success' : 'warning'}>{doc.isVerified ? 'Vérifié' : 'Non vérifié'}</Badge>
                  {!doc.isVerified && (
                    <>
                      <Button size="sm" variant="primary" disabled={verifyingIds.includes(doc.id)} onClick={async () => await handleVerify(doc.id, true)}>
                        {verifyingIds.includes(doc.id) ? '...' : 'Approuver'}
                      </Button>
                      <Button size="sm" variant="ghost" disabled={verifyingIds.includes(doc.id)} onClick={async () => await handleVerify(doc.id, false)}>
                        {verifyingIds.includes(doc.id) ? '...' : 'Rejeter'}
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
