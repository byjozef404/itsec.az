import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/services/api';
import { toast } from 'sonner';
import ImageUpload from '@/components/common/ImageUpload';

const ProfilePage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({ full_name: '', phone: '', address: '', city: '' });
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? '',
        phone: profile.phone ?? '',
        address: profile.address ?? '',
        city: profile.city ?? '',
      });
      setAvatarUrl(profile.avatar_url ?? '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ ...form, avatar_url: avatarUrl });
      await refreshProfile();
      toast.success('Profile updated successfully!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground red-stripe pl-3">My Profile</h2>

      {/* Avatar upload card */}
      <Card className="bg-card border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Profile Photo</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Current avatar preview */}
          <div className="w-20 h-20 rounded-full border-2 border-border overflow-hidden bg-muted flex items-center justify-center shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                {profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0 w-full max-w-xs">
            <ImageUpload
              bucket="avatars"
              path={profile?.id ?? 'user'}
              currentUrl={avatarUrl}
              onUploaded={url => setAvatarUrl(url)}
              label="Upload new photo"
              aspectRatio="square"
            />
          </div>
        </div>
      </Card>

      {/* Profile form card */}
      <Card className="bg-card border-border p-6">
        <form onSubmit={handleSave} className="space-y-4 max-w-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
              <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                placeholder="Your full name" className="bg-muted border-border h-10" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email (read-only)</label>
              <Input value={profile?.email ?? ''} disabled className="bg-muted border-border h-10 opacity-60" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+994 XX XXX XX XX" className="bg-muted border-border h-10" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">City</label>
              <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="Baku" className="bg-muted border-border h-10" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Address</label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Street address" className="bg-muted border-border h-10" />
            </div>
          </div>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-accent" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>

      <Card className="bg-card border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Account Info</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Role: </span><span className="text-foreground capitalize">{profile?.role}</span></div>
          <div><span className="text-muted-foreground">Dealer Status: </span><span className="text-foreground capitalize">{profile?.dealer_status ?? 'none'}</span></div>
          <div><span className="text-muted-foreground">Member since: </span><span className="text-foreground">{new Date(profile?.created_at ?? '').toLocaleDateString()}</span></div>
          <div><span className="text-muted-foreground">Language: </span><span className="text-foreground uppercase">{profile?.language}</span></div>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
