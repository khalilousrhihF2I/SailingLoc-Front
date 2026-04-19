import { useEffect, useState } from 'react';
import { handleLogout } from '../utils/handleLogout';
import { Users, Ship, Calendar, DollarSign, LogOut, Search, LayoutDashboard, ShieldCheck, MessageSquare, Star, CheckCircle, XCircle, FileText, Settings, Trash2, Activity, Globe, UserPlus, Anchor, Shield, AlertTriangle, Ban, Eye } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { DashboardShell, StatCard, SectionTitle } from '../components/ui/DashboardShell';
import AdminUsersPage from './AdminUsersPage';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { TablePagination } from '../components/ui/TablePagination';
import { adminService } from '../services/ServiceFactory';
import { apiClient } from '../lib/apiClient';

const ACTION_LABELS: Record<string, string> = {
  '': 'Toutes les actions',
  USER_LOGIN: 'Connexion',
  USER_REGISTER: 'Inscription',
  USER_LOGOUT: 'Deconnexion',
  BOOKING_CREATE: 'Creation reservation',
  BOOKING_UPDATE: 'Modification reservation',
  BOOKING_CANCEL: 'Annulation reservation',
  BOAT_CREATE: 'Creation bateau',
  BOAT_DELETE: 'Suppression bateau',
  BOAT_VERIFY: 'Verification bateau',
  REVIEW_APPROVE: 'Approbation avis',
  REVIEW_REJECT: 'Rejet avis',
  DISPUTE_CREATE: 'Creation litige',
  DISPUTE_RESOLVE: 'Resolution litige',
  ADMIN_USER_CREATE: 'Creation admin',
  ADMIN_USER_DELETE: 'Suppression admin',
  DATA_RESET: 'Reinitialisation donnees',
};
const AUDIT_ACTIONS = Object.keys(ACTION_LABELS);

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigate: (page: import('../types/navigation').Page, data?: any) => void;
}

export function AdminDashboard({ onLogout, onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview'|'users'|'boats'|'bookings'|'payments'|'admins'|'reviews'|'disputes'|'audit'|'settings'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<any|null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [boats, setBoats] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [boatSearch, setBoatSearch] = useState('');
  const [boatStatusFilter, setBoatStatusFilter] = useState<'all'|'verified'|'unverified'>('all');
  const [boatTypeFilter, setBoatTypeFilter] = useState<string>('all');
  const [boatViewMode, setBoatViewMode] = useState<'card'|'table'>('table');
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [reviewFilter, setReviewFilter] = useState<'pending'|'approved'|'rejected'|'all'>('pending');
  const [disputes, setDisputes] = useState<any[]>([]);
  const [disputeFilter, setDisputeFilter] = useState<string>('all');
  const [reviewsPage, setReviewsPage] = useState(1);
  const [disputesPage, setDisputesPage] = useState(1);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilter, setAuditFilter] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<{type:'success'|'error';text:string}|null>(null);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [usersPage, setUsersPage] = useState(1);
  const [boatsPage, setBoatsPage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true); setError(null);
      try {
        const [s,u,bts,bks,act] = await Promise.all([
          adminService.getStats(), adminService.getUsers(), adminService.getBoats(),
          adminService.getBookings(), adminService.getActivity()
        ]);
        if (!mounted) return;
        setStats(s);
        setUsers(Array.isArray(u)?u:[]);
        setBoats(Array.isArray(bts)?bts:[]);
        setBookings(Array.isArray(bks)?bks:[]);
        setActivity(Array.isArray(act)?act:[]);
        const [revPending, revAll, dispRes] = await Promise.all([
          apiClient.get<any[]>('/review/moderation/pending').catch(()=>({data:[]})),
          apiClient.get<any[]>('/review').catch(()=>({data:[]})),
          apiClient.get<any[]>('/dispute').catch(()=>({data:[]})),
        ]);
        if (!mounted) return;
        setPendingReviews(Array.isArray(revPending.data)?revPending.data:[]);
        setAllReviews(Array.isArray(revAll.data)?revAll.data:[]);
        setDisputes(Array.isArray(dispRes.data)?dispRes.data:[]);
      } catch (err:any) { setError(err?.message||String(err)); }
      finally { if (mounted) setLoading(false); }
    }
    load();
    return ()=>{ mounted=false; };
  }, []);

  useEffect(() => {
    if (activeTab !== 'audit') return;
    let mounted = true;
    async function loadAudit() {
      setAuditLoading(true);
      try {
        const res = await apiClient.get<any>(`/admin/audit-logs?page=${auditPage}&pageSize=${PAGE_SIZE}${auditFilter?`&action=${auditFilter}`:''}`);
        if (!mounted) return;
        const data = res.data;
        setAuditLogs(Array.isArray(data?.items)?data.items:Array.isArray(data)?data:[]);
        setAuditTotal(data?.total??data?.totalCount??0);
      } catch {}
      finally { if (mounted) setAuditLoading(false); }
    }
    loadAudit();
    return ()=>{ mounted=false; };
  }, [activeTab, auditPage, auditFilter]);

  const handleDataReset = async () => {
    if (!window.confirm('Etes-vous sur de vouloir reinitialiser les donnees ? Cette action est irreversible.')) return;
    if (!window.confirm('Derniere confirmation : Toutes les reservations, messages, litiges et profils seront supprimes. Continuer ?')) return;
    setResetLoading(true); setResetMessage(null);
    try {
      await apiClient.post('/admin/data-reset/reset', {});
      setResetMessage({type:'success',text:'Donnees reinitialisees avec succes.'});
    } catch (err:any) {
      setResetMessage({type:'error',text:err?.response?.data?.message||err?.message||'Erreur lors de la reinitialisation.'});
    } finally { setResetLoading(false); }
  };

  const boatTypes = [...new Set(boats.map(b=>b.type).filter(Boolean))];
  const filteredBoatsAll = boats.filter(b=>{
    if (boatStatusFilter==='verified'&&!b.isVerified) return false;
    if (boatStatusFilter==='unverified'&&b.isVerified) return false;
    if (boatTypeFilter!=='all'&&b.type!==boatTypeFilter) return false;
    if (!boatSearch) return true;
    const s=boatSearch.toLowerCase();
    return String(b.name).toLowerCase().includes(s)||String(b.ownerName).toLowerCase().includes(s)||String(b.type).toLowerCase().includes(s)||String(b.location).toLowerCase().includes(s);
  });
  const boatsTotalPages = Math.ceil(filteredBoatsAll.length/PAGE_SIZE);
  const filteredBoatsVisible = filteredBoatsAll.slice((boatsPage-1)*PAGE_SIZE,boatsPage*PAGE_SIZE);

  const filteredBookings = bookings.filter(b=>{
    if (bookingStatusFilter!=='all'&&b.status?.toLowerCase()!==bookingStatusFilter) return false;
    if (!bookingSearch) return true;
    const s=bookingSearch.toLowerCase();
    return String(b.id).toLowerCase().includes(s)||String(b.boatName).toLowerCase().includes(s)||String(b.renterName).toLowerCase().includes(s);
  });

  const filteredReviews = reviewFilter==='pending'?pendingReviews
    :reviewFilter==='all'?allReviews
    :allReviews.filter(r=>r.moderationStatus===reviewFilter);

  const translateStatus=(status:string)=>{
    const s=status?.toLowerCase();
    if(s==='confirmed') return 'Confirmee';
    if(s==='cancelled') return 'Annulee';
    if(s==='pending') return 'En attente';
    if(s==='completed') return 'Terminee';
    return status||'Inconnu';
  };
  const statusVariant=(status:string)=>{
    const s=status?.toLowerCase();
    if(s==='confirmed') return 'success' as const;
    if(s==='pending') return 'warning' as const;
    if(s==='cancelled') return 'danger' as const;
    return 'default' as const;
  };
  const formatDateFR=(d:string|undefined)=>{
    if(!d) return '—';
    try{return new Date(d).toLocaleDateString('fr-FR');}catch{return d;}
  };
  const friendlyAction=(action:string)=>ACTION_LABELS[action]||action;

  const handleBlockUser = async (userId:string, isBlocked:boolean) => {
    if(!window.confirm(isBlocked?'Debloquer cet utilisateur ?':'Bloquer cet utilisateur ? Il ne pourra plus se connecter.')) return;
    try {
      await apiClient.patch(`/admin/users/${userId}`,{lockoutEnabled:!isBlocked,lockoutEnd:isBlocked?null:'2099-12-31T00:00:00Z'});
      setUsers(prev=>prev.map(u=>u.id===userId?{...u,isBlocked:!isBlocked,lockoutEnd:isBlocked?null:'2099-12-31T00:00:00Z'}:u));
    } catch(err:any){alert(err?.message||'Erreur');}
  };

  const navItems = [
    {id:'overview',label:'Vue d\'ensemble',icon:<LayoutDashboard size={20}/>},
    {id:'users',label:'Utilisateurs',icon:<Users size={20}/>},
    {id:'admins',label:'Administrateurs',icon:<ShieldCheck size={20}/>},
    {id:'boats',label:'Annonces',icon:<Ship size={20}/>,badge:stats?.pendingVerifications||undefined,badgeVariant:'warning' as const},
    {id:'bookings',label:'Reservations',icon:<Calendar size={20}/>},
    {id:'payments',label:'Paiements',icon:<DollarSign size={20}/>},
    {id:'reviews',label:'Moderation',icon:<Star size={20}/>,badge:pendingReviews.length||undefined,badgeVariant:'warning' as const},
    {id:'disputes',label:'Litiges',icon:<MessageSquare size={20}/>,badge:disputes.filter(d=>d.status==='open'||d.status==='under_review').length||undefined,badgeVariant:'danger' as const},
    {id:'audit',label:'Journal d\'audit',icon:<FileText size={20}/>},
    {id:'settings',label:'Parametres',icon:<Settings size={20}/>},
  ];

  return (
    <DashboardShell
      title="Administration SailingLoc"
      subtitle="Panneau de gestion de la plateforme"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={(id)=>{if(id==='logout'){handleLogout(onLogout);return;}setActiveTab(id as any);}}
      headerActions={<Button variant="danger" onClick={()=>handleLogout(onLogout)}><LogOut size={18}/>Deconnexion</Button>}
    >
      {loading && <Card className="p-8 text-center text-gray-500">Chargement des donnees...</Card>}
      {error && <Alert type="error">Erreur : {error}</Alert>}

      {activeTab==='overview'&&!loading&&!error&&(
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Utilisateurs" value={stats?.totalUsers??0} icon={<Users className="text-ocean-600" size={22}/>} iconBg="bg-ocean-100"/>
            <StatCard label="Bateaux" value={stats?.totalBoats??0} icon={<Ship className="text-turquoise-600" size={22}/>} iconBg="bg-turquoise-100"/>
            <StatCard label="Reservations" value={stats?.totalBookings??0} icon={<Calendar className="text-green-600" size={22}/>} iconBg="bg-green-100"/>
            <StatCard label="Revenus" value={`${stats?.totalRevenue??0}€`} icon={<DollarSign className="text-orange-600" size={22}/>} iconBg="bg-orange-100"/>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="p-5 border-orange-200 bg-orange-50/50 cursor-pointer hover:shadow-md transition-shadow" onClick={()=>{setBoatStatusFilter('unverified');setActiveTab('boats');}}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0"><Ship className="text-orange-600" size={18}/></div>
                <div><div className="text-2xl font-bold text-orange-900">{stats?.pendingVerifications??0}</div><div className="text-xs text-orange-700">Annonces a verifier</div></div>
              </div>
            </Card>
            <Card className="p-5 border-yellow-200 bg-yellow-50/50 cursor-pointer hover:shadow-md transition-shadow" onClick={()=>{setReviewFilter('pending');setActiveTab('reviews');}}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0"><Star className="text-yellow-600" size={18}/></div>
                <div><div className="text-2xl font-bold text-yellow-900">{pendingReviews.length}</div><div className="text-xs text-yellow-700">Avis a moderer</div></div>
              </div>
            </Card>
            <Card className="p-5 border-red-200 bg-red-50/50 cursor-pointer hover:shadow-md transition-shadow" onClick={()=>{setDisputeFilter('open');setActiveTab('disputes');}}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0"><MessageSquare className="text-red-600" size={18}/></div>
                <div><div className="text-2xl font-bold text-red-900">{disputes.filter(d=>d.status==='open'||d.status==='under_review').length}</div><div className="text-xs text-red-700">Litiges en cours</div></div>
              </div>
            </Card>
            <Card className="p-5 border-blue-200 bg-blue-50/50 cursor-pointer hover:shadow-md transition-shadow" onClick={()=>setActiveTab('users')}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0"><FileText className="text-blue-600" size={18}/></div>
                <div><div className="text-2xl font-bold text-blue-900">{stats?.pendingDocuments??0}</div><div className="text-xs text-blue-700">Documents a verifier</div></div>
              </div>
            </Card>
          </div>
          <Card className="p-6">
            <SectionTitle title="Activite recente"/>
            <div className="space-y-3">
              {activity.length===0&&<div className="text-sm text-gray-500 text-center py-4">Aucune activite recente</div>}
              {activity.slice(0,10).map((a,index)=>{
                const actType=(a.type||a.action||'').toLowerCase();
                const icon=actType.includes('login')?<Globe size={16} className="text-blue-500"/>
                  :actType.includes('user')||actType.includes('register')?<UserPlus size={16} className="text-green-500"/>
                  :actType.includes('booking')?<Calendar size={16} className="text-purple-500"/>
                  :actType.includes('boat')?<Anchor size={16} className="text-ocean-500"/>
                  :actType.includes('review')?<Star size={16} className="text-yellow-500"/>
                  :actType.includes('dispute')?<AlertTriangle size={16} className="text-red-500"/>
                  :actType.includes('admin')||actType.includes('reset')?<Shield size={16} className="text-gray-500"/>
                  :<Activity size={16} className="text-gray-400"/>;
                const tagColor=actType.includes('login')?'bg-blue-100 text-blue-700'
                  :actType.includes('user')||actType.includes('register')?'bg-green-100 text-green-700'
                  :actType.includes('booking')?'bg-purple-100 text-purple-700'
                  :actType.includes('boat')?'bg-cyan-100 text-cyan-700'
                  :actType.includes('review')?'bg-yellow-100 text-yellow-700'
                  :actType.includes('dispute')?'bg-red-100 text-red-700'
                  :'bg-gray-100 text-gray-600';
                const actionLabel=friendlyAction(a.action||a.type||'');
                const description=a.description||a.message||a.text||a.type||'';
                const timestamp=a.occurredAt||a.date||a.time||'';
                const formattedTime=timestamp?new Date(timestamp).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'';
                return (
                  <div key={index} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tagColor}`}>{actionLabel}</span>
                        {a.ip&&<span className="text-xs text-gray-400 font-mono">{a.ip}</span>}
                      </div>
                      <p className="text-sm text-gray-700 truncate">{description}</p>
                    </div>
                    <div className="text-xs text-gray-400 whitespace-nowrap shrink-0">{formattedTime}</div>
                  </div>
                );
              })}
              {activity.length>10&&<button className="w-full text-center text-sm text-ocean-600 hover:text-ocean-700 py-2" onClick={()=>setActiveTab('audit')}>Voir tout le journal d'audit &rarr;</button>}
            </div>
          </Card>
        </div>
      )}

      {activeTab==='users'&&(
        <Card className="p-6">
          <SectionTitle title="Gestion des utilisateurs" action={<div className="w-64"><Input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e)=>{setSearchTerm(e.target.value);setUsersPage(1);}} icon={<Search size={18}/>}/></div>}/>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr></thead>
              <tbody>
                {(()=>{
                  const filtered=users.filter(u=>!searchTerm||u.name?.toLowerCase().includes(searchTerm.toLowerCase())||u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
                  return filtered.slice((usersPage-1)*PAGE_SIZE,usersPage*PAGE_SIZE).map(user=>{
                    const isBlocked=!!user.isBlocked||(user.lockoutEnd&&new Date(user.lockoutEnd)>new Date());
                    return (
                      <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4"><div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-ocean-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {user.avatar||(user.name?user.name.split(' ').map((s:string)=>s[0]).slice(0,2).join('').toUpperCase():'U')}
                          </div>
                          <div><span className="text-gray-900 font-medium">{user.name}</span>{isBlocked&&<span className="ml-2"><Badge variant="danger" size="sm">Bloque</Badge></span>}</div>
                        </div></td>
                        <td className="py-3 px-4"><Badge variant={user.type==='owner'?'info':'default'}>{user.type==='owner'?'Proprietaire':'Locataire'}</Badge></td>
                        <td className="py-3 px-4"><div className="text-gray-700 text-sm">{user.email}</div></td>
                        <td className="py-3 px-4 text-center"><Badge variant={user.verified?'success':'warning'}>{user.verified?'Verifie':'Non verifie'}</Badge></td>
                        <td className="py-3 px-4 text-right"><div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={()=>{try{onNavigate('admin-user',{userId:user.id});}catch{window.location.href=`/admin-user?userId=${encodeURIComponent(String(user.id))}`;}}}><Eye size={14}/> Voir</Button>
                          <Button variant={isBlocked?'secondary':'danger'} size="sm" onClick={()=>handleBlockUser(user.id,isBlocked)}><Ban size={14}/>{isBlocked?'Debloquer':'Bloquer'}</Button>
                        </div></td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
            {(()=>{const filtered=users.filter(u=>!searchTerm||u.name?.toLowerCase().includes(searchTerm.toLowerCase())||u.email?.toLowerCase().includes(searchTerm.toLowerCase()));return <TablePagination currentPage={usersPage} totalPages={Math.ceil(filtered.length/PAGE_SIZE)} onPageChange={setUsersPage} totalItems={filtered.length}/>;})()}
          </div>
        </Card>
      )}

      {activeTab==='admins'&&<AdminUsersPage onNavigate={onNavigate}/>}

      {activeTab==='boats'&&(
        <Card className="p-6">
          <SectionTitle title="Gestion des annonces"/>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 flex-wrap">
            <div className="w-full sm:w-72"><Input type="text" placeholder="Rechercher un bateau..." value={boatSearch} onChange={(e)=>{setBoatSearch(e.target.value);setBoatsPage(1);}} icon={<Search size={18}/>}/></div>
            <select value={boatStatusFilter} onChange={(e)=>{setBoatStatusFilter(e.target.value as any);setBoatsPage(1);}} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500">
              <option value="all">Tous les statuts</option><option value="verified">Verifiees</option><option value="unverified">Non verifiees</option>
            </select>
            <select value={boatTypeFilter} onChange={(e)=>{setBoatTypeFilter(e.target.value);setBoatsPage(1);}} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500">
              <option value="all">Tous les types</option>{boatTypes.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            <div className="flex gap-1 ml-auto">
              <button onClick={()=>setBoatViewMode('table')} className={`p-2 rounded-lg ${boatViewMode==='table'?'bg-ocean-100 text-ocean-700':'text-gray-400 hover:bg-gray-100'}`} title="Vue tableau"><LayoutDashboard size={18}/></button>
              <button onClick={()=>setBoatViewMode('card')} className={`p-2 rounded-lg ${boatViewMode==='card'?'bg-ocean-100 text-ocean-700':'text-gray-400 hover:bg-gray-100'}`} title="Vue carte"><Ship size={18}/></button>
            </div>
          </div>

          {boatViewMode==='table'?(
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bateau</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Proprietaire</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Localisation</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr></thead>
                <tbody>
                  {filteredBoatsVisible.map(boat=>(
                    <tr key={boat.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4"><span className="text-gray-900 font-medium">{boat.name}</span></td>
                      <td className="py-3 px-4 text-sm text-gray-600">{boat.type}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{boat.ownerName}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{boat.location}</td>
                      <td className="py-3 px-4 text-center"><Badge variant={boat.isVerified?'success':'warning'} size="sm">{boat.isVerified?'Verifiee':'A moderer'}</Badge></td>
                      <td className="py-3 px-4 text-right"><Button variant="ghost" size="sm" onClick={()=>onNavigate('edit-listing',{boatId:boat.id,startStep:6})}>Moderer</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBoatsVisible.length===0&&<div className="text-center py-8 text-gray-500 text-sm">Aucune annonce trouvee</div>}
            </div>
          ):(
            <div className="space-y-3">
              {filteredBoatsVisible.map(boat=>{
                const typeImageMap:Record<string,string>={catamaran:'/images/catamaran.png',sailboat:'/images/voiliers.png',semirigid:'/images/semi-rigide.jpg',motor:'/images/moteur.jpg'};
                const fallback=typeImageMap[boat.type]||'/images/voiliers.png';
                const imgSrc=boat.image||fallback;
                return (
                  <div key={boat.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 relative">
                      <img src={imgSrc} alt={boat.name} className="w-full h-full object-cover"/>
                      <div className="absolute top-1 left-1 bg-white/90 text-xs text-gray-700 px-2 py-0.5 rounded-md font-medium">{boat.type}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 font-medium truncate">{boat.name}</div>
                      <div className="text-sm text-gray-500">{boat.location}</div>
                      <div className="text-sm text-gray-500">Proprietaire : {boat.ownerName}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={boat.isVerified?'success':'warning'}>{boat.isVerified?'Actif':'A moderer'}</Badge>
                      <Button variant="ghost" size="sm" onClick={()=>onNavigate('edit-listing',{boatId:boat.id,startStep:6})}>Moderer</Button>
                    </div>
                  </div>
                );
              })}
              {filteredBoatsVisible.length===0&&<div className="text-center py-8 text-gray-500 text-sm">Aucune annonce trouvee</div>}
            </div>
          )}
          <TablePagination currentPage={boatsPage} totalPages={boatsTotalPages} onPageChange={setBoatsPage} totalItems={filteredBoatsAll.length}/>
        </Card>
      )}

      {activeTab==='bookings'&&(
        <Card className="p-6">
          <SectionTitle title="Toutes les reservations"/>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="w-full sm:w-72"><Input type="text" placeholder="Rechercher ref, bateau, locataire..." value={bookingSearch} onChange={(e)=>{setBookingSearch(e.target.value);setBookingsPage(1);}} icon={<Search size={18}/>}/></div>
            <select value={bookingStatusFilter} onChange={(e)=>{setBookingStatusFilter(e.target.value);setBookingsPage(1);}} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500">
              <option value="all">Tous les statuts</option><option value="pending">En attente</option><option value="confirmed">Confirmees</option><option value="completed">Terminees</option><option value="cancelled">Annulees</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reservation</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
              </tr></thead>
              <tbody>
                {filteredBookings.slice((bookingsPage-1)*PAGE_SIZE,bookingsPage*PAGE_SIZE).map(booking=>(
                  <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="text-sm font-mono text-gray-500">#{booking.id}</div>
                      <div className="text-sm text-gray-900 font-medium">{booking.boatName}</div>
                      <div className="text-xs text-gray-500">{booking.renterName}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{formatDateFR(booking.startDate)} &rarr; {formatDateFR(booking.endDate)}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">{booking.totalPrice}€</td>
                    <td className="py-3 px-4"><Badge variant={statusVariant(booking.status)} size="sm">{translateStatus(booking.status)}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredBookings.length===0&&<div className="text-center py-8 text-gray-500 text-sm">Aucune reservation</div>}
            <TablePagination currentPage={bookingsPage} totalPages={Math.ceil(filteredBookings.length/PAGE_SIZE)} onPageChange={setBookingsPage} totalItems={filteredBookings.length}/>
          </div>
        </Card>
      )}

      {activeTab==='payments'&&(
        <div className="space-y-6">
          {(()=>{
            const paidBookings=bookings.filter(b=>b.status?.toLowerCase()==='confirmed'||b.status?.toLowerCase()==='completed');
            const pendingBookings=bookings.filter(b=>b.status?.toLowerCase()==='pending');
            const totalPaid=paidBookings.reduce((sum:number,b:any)=>sum+(Number(b.totalPrice)||0),0);
            const totalPending=pendingBookings.reduce((sum:number,b:any)=>sum+(Number(b.totalPrice)||0),0);
            const commission=Math.round(totalPaid*0.1);
            const allPaymentBookings=[...bookings].sort((a:any,b:any)=>{
              const da=a.startDate?new Date(a.startDate).getTime():a.createdAt?new Date(a.createdAt).getTime():0;
              const db=b.startDate?new Date(b.startDate).getTime():b.createdAt?new Date(b.createdAt).getTime():0;
              return db-da;
            });
            return (<>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-5 border-green-100 bg-green-50/30"><div className="text-sm text-green-700 mb-1">Total encaisse</div><div className="text-2xl font-semibold text-green-900">{totalPaid.toLocaleString('fr-FR')}€</div><div className="text-xs text-green-600 mt-1">{paidBookings.length} reservations</div></Card>
                <Card className="p-5 border-orange-100 bg-orange-50/30"><div className="text-sm text-orange-700 mb-1">En attente</div><div className="text-2xl font-semibold text-orange-900">{totalPending.toLocaleString('fr-FR')}€</div><div className="text-xs text-orange-600 mt-1">{pendingBookings.length} reservations</div></Card>
                <Card className="p-5 border-ocean-100 bg-ocean-50/30"><div className="text-sm text-ocean-700 mb-1">Commission SailingLoc (10%)</div><div className="text-2xl font-semibold text-ocean-900">{commission.toLocaleString('fr-FR')}€</div></Card>
                <Card className="p-5 border-gray-100 bg-gray-50/30"><div className="text-sm text-gray-700 mb-1">Reverse aux proprietaires</div><div className="text-2xl font-semibold text-gray-900">{(totalPaid-commission).toLocaleString('fr-FR')}€</div></Card>
              </div>
              <Card className="p-6">
                <SectionTitle title="Historique des paiements"/>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reservation</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Commission</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                    </tr></thead>
                    <tbody>
                      {allPaymentBookings.slice((paymentsPage-1)*PAGE_SIZE,paymentsPage*PAGE_SIZE).map((booking:any)=>{
                        const amount=Number(booking.totalPrice)||0;
                        const comm=Math.round(amount*0.1);
                        const payStatus=booking.status?.toLowerCase()==='confirmed'||booking.status?.toLowerCase()==='completed'?'Paye':booking.status?.toLowerCase()==='pending'?'En attente':'Annule';
                        const payVariant=payStatus==='Paye'?'success' as const:payStatus==='En attente'?'warning' as const:'danger' as const;
                        return (
                          <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="text-sm font-mono text-gray-500">#{booking.id}</div>
                              <div className="text-sm text-gray-900 font-medium">{booking.boatName}</div>
                              <div className="text-xs text-gray-500">{booking.renterName}</div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{formatDateFR(booking.startDate)} &rarr; {formatDateFR(booking.endDate)}</td>
                            <td className="py-3 px-4 text-sm font-semibold text-gray-900">{amount}€</td>
                            <td className="py-3 px-4 text-sm text-ocean-700">{comm}€</td>
                            <td className="py-3 px-4"><Badge variant={payVariant} size="sm">{payStatus}</Badge></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {allPaymentBookings.length===0&&<div className="text-center py-8 text-gray-500 text-sm">Aucun paiement</div>}
                  <TablePagination currentPage={paymentsPage} totalPages={Math.ceil(allPaymentBookings.length/PAGE_SIZE)} onPageChange={setPaymentsPage} totalItems={allPaymentBookings.length}/>
                </div>
              </Card>
            </>);
          })()}
        </div>
      )}

      {activeTab==='reviews'&&(
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <SectionTitle title={`Moderation des avis (${filteredReviews.length})`}/>
            <select value={reviewFilter} onChange={(e)=>{setReviewFilter(e.target.value as any);setReviewsPage(1);}} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500">
              <option value="pending">En attente</option><option value="approved">Approuves</option><option value="rejected">Rejetes</option><option value="all">Tous</option>
            </select>
          </div>
          {filteredReviews.length===0?(
            <Card className="p-8 text-center text-gray-500"><CheckCircle size={40} className="mx-auto mb-3 text-green-400"/><p>Aucun avis {reviewFilter==='pending'?'en attente de moderation':reviewFilter==='all'?'':`avec le statut "${reviewFilter}"`}</p></Card>
          ):(
            <div className="space-y-4">
              {filteredReviews.slice((reviewsPage-1)*PAGE_SIZE,reviewsPage*PAGE_SIZE).map((review:any)=>{
                const modStatus=review.moderationStatus||'pending';
                const modVariant=modStatus==='approved'?'success' as const:modStatus==='rejected'?'danger' as const:'warning' as const;
                const modLabel=modStatus==='approved'?'Approuve':modStatus==='rejected'?'Rejete':'En attente';
                return (
                  <Card key={review.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{review.userName||review.userId}</span>
                          <span className="text-yellow-500">{'\u2605'.repeat(review.rating||0)}{'\u2606'.repeat(5-(review.rating||0))}</span>
                          <Badge variant={modVariant} size="sm">{modLabel}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">Bateau : {review.boatName||review.boatId} — {review.createdAt?new Date(review.createdAt).toLocaleDateString('fr-FR'):''}</p>
                        <p className="text-gray-700">{review.comment}</p>
                        {review.moderationNote&&<p className="text-sm text-gray-500 mt-1 italic">Note : {review.moderationNote}</p>}
                      </div>
                      {modStatus==='pending'&&(
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="primary" onClick={async()=>{
                            await apiClient.patch(`/review/${review.id}/approve`,{});
                            setPendingReviews(prev=>prev.filter(r=>r.id!==review.id));
                            setAllReviews(prev=>prev.map(r=>r.id===review.id?{...r,moderationStatus:'approved'}:r));
                          }}><CheckCircle size={16}/> Approuver</Button>
                          <Button size="sm" variant="outline" onClick={async()=>{
                            const reason=prompt('Motif du rejet :');
                            if(!reason) return;
                            await apiClient.patch(`/review/${review.id}/reject`,{reason});
                            setPendingReviews(prev=>prev.filter(r=>r.id!==review.id));
                            setAllReviews(prev=>prev.map(r=>r.id===review.id?{...r,moderationStatus:'rejected',moderationNote:reason}:r));
                          }}><XCircle size={16}/> Rejeter</Button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
              <TablePagination currentPage={reviewsPage} totalPages={Math.ceil(filteredReviews.length/PAGE_SIZE)} onPageChange={setReviewsPage} totalItems={filteredReviews.length}/>
            </div>
          )}
        </div>
      )}

      {activeTab==='disputes'&&(
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <SectionTitle title={`Litiges (${disputes.length})`}/>
            <div className="flex gap-2">{['all','open','under_review','resolved','closed'].map(f=>(<button key={f} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${disputeFilter===f?'bg-ocean-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} onClick={()=>{setDisputeFilter(f);setDisputesPage(1);}}>{f==='all'?'Tous':f==='open'?'Ouvert':f==='under_review'?'En examen':f==='resolved'?'Resolu':'Ferme'}</button>))}</div>
          </div>
          {(()=>{
            const filtered=disputeFilter==='all'?disputes:disputes.filter(d=>d.status===disputeFilter);
            const paged=filtered.slice((disputesPage-1)*PAGE_SIZE,disputesPage*PAGE_SIZE);
            if(filtered.length===0) return <Card className="p-8 text-center text-gray-500"><MessageSquare size={40} className="mx-auto mb-3 text-gray-300"/><p>Aucun litige{disputeFilter!=='all'?` avec le statut "${disputeFilter}"`:''}</p></Card>;
            return (
              <div className="space-y-4">
                {paged.map((dispute:any)=>{
                  const statusColor=dispute.status==='open'?'warning':dispute.status==='under_review'?'info':dispute.status==='resolved'?'success':'default';
                  const statusLabel=dispute.status==='open'?'Ouvert':dispute.status==='under_review'?'En examen':dispute.status==='resolved'?'Resolu':'Ferme';
                  return (
                    <Card key={dispute.id} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1"><span className="font-semibold text-gray-900">{dispute.subject}</span><Badge variant={statusColor as any} size="sm">{statusLabel}</Badge></div>
                          <p className="text-sm text-gray-500 mb-2">Reservation #{dispute.bookingId} — Signale par {dispute.reporterName||dispute.reporterId} — {dispute.createdAt?new Date(dispute.createdAt).toLocaleDateString('fr-FR'):''}</p>
                          <p className="text-gray-700 mb-2">{dispute.description}</p>
                          {dispute.resolution&&<div className="p-3 bg-green-50 rounded-lg text-sm text-green-800"><strong>Resolution :</strong> {dispute.resolution}</div>}
                          {dispute.adminNote&&<p className="text-sm text-gray-500 mt-1 italic">Note admin : {dispute.adminNote}</p>}
                        </div>
                        {(dispute.status==='open'||dispute.status==='under_review')&&(
                          <div className="shrink-0"><Button size="sm" variant="primary" onClick={async()=>{
                            const resolution=prompt('Resolution du litige :');
                            if(!resolution) return;
                            const adminNote=prompt('Note admin (facultatif) :')||'';
                            await apiClient.patch(`/dispute/${dispute.id}/resolve`,{resolution,adminNote});
                            setDisputes(prev=>prev.map(d=>d.id===dispute.id?{...d,status:'resolved',resolution,adminNote}:d));
                          }}>Resoudre</Button></div>
                        )}
                      </div>
                    </Card>
                  );
                })}
                <TablePagination currentPage={disputesPage} totalPages={Math.ceil(filtered.length/PAGE_SIZE)} onPageChange={setDisputesPage} totalItems={filtered.length}/>
              </div>
            );
          })()}
        </div>
      )}

      {activeTab==='audit'&&(
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <SectionTitle title="Journal d'audit"/>
            <select value={auditFilter} onChange={(e)=>{setAuditFilter(e.target.value);setAuditPage(1);}} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 min-w-[220px]">
              {AUDIT_ACTIONS.map(a=><option key={a} value={a}>{ACTION_LABELS[a]}</option>)}
            </select>
          </div>
          <Card className="p-6">
            {auditLoading?<div className="text-center py-8 text-gray-500">Chargement...</div>
            :auditLogs.length===0?<div className="text-center py-8 text-gray-500"><FileText size={40} className="mx-auto mb-3 text-gray-300"/><p>Aucune entree d'audit{auditFilter?` pour \u00AB ${ACTION_LABELS[auditFilter]||auditFilter} \u00BB`:''}</p></div>
            :<>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">IP</th>
                  </tr></thead>
                  <tbody>
                    {auditLogs.map((log:any)=>{
                      const actionTag=log.action||'';
                      const tagColor=actionTag.includes('LOGIN')||actionTag.includes('LOGOUT')?'bg-blue-100 text-blue-700'
                        :actionTag.includes('REGISTER')?'bg-green-100 text-green-700'
                        :actionTag.includes('BOOKING')?'bg-purple-100 text-purple-700'
                        :actionTag.includes('BOAT')?'bg-cyan-100 text-cyan-700'
                        :actionTag.includes('REVIEW')?'bg-yellow-100 text-yellow-700'
                        :actionTag.includes('DISPUTE')?'bg-red-100 text-red-700'
                        :actionTag.includes('ADMIN')||actionTag.includes('RESET')?'bg-gray-200 text-gray-700'
                        :'bg-gray-100 text-gray-600';
                      return (
                        <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">{log.timestamp?new Date(log.timestamp).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'}):''}</td>
                          <td className="py-3 px-4"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${tagColor}`}>{friendlyAction(actionTag)}</span></td>
                          <td className="py-3 px-4 text-sm text-gray-600 font-mono">{log.userId?String(log.userId).substring(0,8)+'...':'—'}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 max-w-xs truncate">{log.details||'—'}</td>
                          <td className="py-3 px-4 text-sm text-gray-400 font-mono">{log.ip||'—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <TablePagination currentPage={auditPage} totalPages={Math.ceil(auditTotal/PAGE_SIZE)} onPageChange={setAuditPage} totalItems={auditTotal}/>
            </>}
          </Card>
        </div>
      )}

      {activeTab==='settings'&&(
        <div className="space-y-6">
          <SectionTitle title="Parametres d'administration"/>
          <Card className="p-6 border-red-200 bg-red-50/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0"><Trash2 className="text-red-600" size={22}/></div>
              <div className="flex-1">
                <h4 className="text-red-900 font-semibold mb-1">Reinitialisation des donnees</h4>
                <p className="text-sm text-red-700 mb-3">Supprime toutes les reservations, messages, litiges, disponibilites, documents, profils (hors test), et tokens.<br/><strong>Conserve :</strong> Destinations, bateaux, images, avis, roles, et les 3 comptes test.</p>
                <Button variant="danger" onClick={handleDataReset} disabled={resetLoading}><Trash2 size={16}/>{resetLoading?'Reinitialisation en cours...':'Reinitialiser les donnees'}</Button>
                {resetMessage&&<div className="mt-3"><Alert type={resetMessage.type==='success'?'success':'error'}>{resetMessage.text}</Alert></div>}
              </div>
            </div>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
