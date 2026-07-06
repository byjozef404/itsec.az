import React, { useState, useEffect, useCallback } from 'react';
import { Shield, UserCheck, UserX, ChevronLeft, ChevronRight, Settings2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminFetchAllProfiles, adminUpdateProfile } from '@/services/api';
import { toast } from 'sonner';
import type { Profile } from '@/types/types';

const ROLE_COLORS: Record<string, string> = {
  admin:       'bg-primary/10 text-primary border-primary/20',
  dealer:      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  distributor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  customer:    'bg-muted text-muted-foreground border-border',
};

const DEALER_STATUS_COLORS: Record<string, string> = {
  none:     'bg-muted text-muted-foreground',
  pending:  'bg-yellow-500/10 text-yellow-400',
  approved: 'bg-green-500/10 text-green-400',
  rejected: 'bg-destructive/10 text-destructive',
};

const ROLE_LABELS: Record<string, { az: string; en: string }> = {
  admin:       { az: 'Admin',      en: 'Admin' },
  dealer:      { az: 'Topdancı',  en: 'Dealer' },
  distributor: { az: 'Diler',     en: 'Distributor' },
  customer:    { az: 'Müştəri',   en: 'Customer' },
};

const STATUS_LABELS: Record<string, { az: string; en: string }> = {
  none:     { az: 'Heç biri',       en: 'None' },
  pending:  { az: 'Gözləyir',       en: 'Pending' },
  approved: { az: 'Təsdiqlənib',    en: 'Approved' },
  rejected: { az: 'Rədd edildi',    en: 'Rejected' },
};

const AdminCustomers: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [editRole, setEditRole] = useState<string>('customer');
  const [editDealerStatus, setEditDealerStatus] = useState<string>('none');
  const [saving, setSaving] = useState(false);
  const LIMIT = 15;

  const load = useCallback(() => {
    setLoading(true);
    adminFetchAllProfiles(page, LIMIT)
      .then(({ data, count }) => { setProfiles(data); setCount(count); })
      .catch(console.error).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (p: Profile) => {
    setEditUser(p);
    setEditRole(p.role ?? 'customer');
    setEditDealerStatus(p.dealer_status ?? 'none');
  };

  const handleSaveRole = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await adminUpdateProfile(editUser.id, {
        role: editRole as Profile['role'],
        dealer_status: editDealerStatus as Profile['dealer_status'],
      });
      toast.success(`${editUser.full_name || editUser.email} → ${ROLE_LABELS[editRole]?.az ?? editRole}`);
      setEditUser(null);
      load();
    } catch {
      toast.error('Status yenilənmədi');
    } finally {
      setSaving(false);
    }
  };

  // Quick approve/reject for pending dealers
  const handleDealerApprove = async (id: string) => {
    await adminUpdateProfile(id, { dealer_status: 'approved', role: 'dealer' });
    toast.success('Topdancı təsdiqləndi!');
    load();
  };
  const handleDealerReject = async (id: string) => {
    await adminUpdateProfile(id, { dealer_status: 'rejected' });
    toast.success('Topdancı müraciəti rədd edildi');
    load();
  };

  const totalPages = Math.ceil(count / LIMIT);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Müştərilər / Customers ({count})</h1>
        <p className="text-xs text-muted-foreground">İstifadəçiyə rol vermək üçün ⚙ düyməsinə basın</p>
      </div>

      <Card className="bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-border">
                {['Ad / E-mail', 'Rol / Role', 'Dealer Status', 'Telefon', 'Qoşulma', 'Əməliyyat'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                : profiles.map(p => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground text-sm">{p.full_name || '—'}</div>
                        <div className="text-xs text-muted-foreground">{p.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs border capitalize ${ROLE_COLORS[p.role] ?? ''}`}>
                          {ROLE_LABELS[p.role]?.az ?? p.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded ${DEALER_STATUS_COLORS[p.dealer_status ?? 'none'] ?? ''}`}>
                          {STATUS_LABELS[p.dealer_status ?? 'none']?.az ?? p.dealer_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.phone ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* Quick approve/reject for pending dealer applications */}
                          {p.dealer_status === 'pending' && (
                            <>
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-green-400 hover:bg-green-900/20 border border-green-700/30" onClick={() => handleDealerApprove(p.id)}>
                                <UserCheck size={12} className="mr-1" />Təsdiqlə
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:bg-destructive/10 border border-destructive/30" onClick={() => handleDealerReject(p.id)}>
                                <UserX size={12} className="mr-1" />Rədd et
                              </Button>
                            </>
                          )}
                          {/* Full role editor — always available */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-primary border border-border"
                            title="Rol ver / Assign Role"
                            onClick={() => openEdit(p)}
                          >
                            <Settings2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="border border-border"><ChevronLeft size={16} /></Button>
          <span className="flex items-center text-sm text-muted-foreground px-3">Səhifə {page} / {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="border border-border"><ChevronRight size={16} /></Button>
        </div>
      )}

      {/* ── Role Assignment Dialog ── */}
      <Dialog open={!!editUser} onOpenChange={open => { if (!open) setEditUser(null); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              Rol Təyin Et / Assign Role
            </DialogTitle>
          </DialogHeader>

          {editUser && (
            <div className="space-y-5 pt-1">
              {/* User info */}
              <div className="bg-muted/40 rounded-lg px-4 py-3 border border-border">
                <p className="text-sm font-semibold text-foreground">{editUser.full_name || '—'}</p>
                <p className="text-xs text-muted-foreground">{editUser.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge className={`text-xs border ${ROLE_COLORS[editUser.role] ?? ''}`}>
                    Cari: {ROLE_LABELS[editUser.role]?.az ?? editUser.role}
                  </Badge>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${DEALER_STATUS_COLORS[editUser.dealer_status ?? 'none']}`}>
                    {STATUS_LABELS[editUser.dealer_status ?? 'none']?.az}
                  </span>
                </div>
              </div>

              {/* Role selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Rol seçin / Select Role</label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger className="bg-muted border-border h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">👤 Müştəri / Customer</SelectItem>
                    <SelectItem value="distributor">🏬 Diler / Distributor (10%)</SelectItem>
                    <SelectItem value="dealer">🏪 Topdancı / Dealer (15%)</SelectItem>
                    <SelectItem value="admin">🛡 Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dealer status selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Topdancı statusu / Dealer Status</label>
                <Select value={editDealerStatus} onValueChange={setEditDealerStatus}>
                  <SelectTrigger className="bg-muted border-border h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Heç biri / None</SelectItem>
                    <SelectItem value="pending">🕐 Gözləyir / Pending</SelectItem>
                    <SelectItem value="approved">✅ Təsdiqlənib / Approved</SelectItem>
                    <SelectItem value="rejected">❌ Rədd edildi / Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Topdancı rolunu aktiv etmək üçün rol = Topdancı + status = Təsdiqlənib seçin.</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button className="flex-1 bg-primary text-primary-foreground hover:bg-accent" onClick={handleSaveRole} disabled={saving}>
                  {saving ? 'Yadda saxlanılır…' : 'Yadda saxla / Save'}
                </Button>
                <Button variant="ghost" className="border border-border" onClick={() => setEditUser(null)}>
                  <X size={14} className="mr-1" />Ləğv et
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomers;
