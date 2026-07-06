import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, Star, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { applyForDealer } from '@/services/api';
import { toast } from 'sonner';

const DealerApplicationPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    setApplying(true);
    try {
      await applyForDealer();
      await refreshProfile();
      toast.success('Application submitted! We will review and contact you.');
    } catch { toast.error('Failed to submit application'); }
    finally { setApplying(false); }
  };

  const status = profile?.dealer_status ?? 'none';

  const BENEFITS = [
    '15% discount on all products',
    'Dedicated account manager',
    'Priority stock allocation',
    'Credit limit up to ₼50,000',
    'Exclusive wholesale pricing',
    'Early access to new products',
    'Bulk Excel import/export',
    'Dedicated dealer dashboard',
  ];

  if (status === 'approved') {
    return (
      <div className="text-center py-8">
        <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">You're an Approved Dealer!</h2>
        <p className="text-muted-foreground text-sm mb-4">Your 15% dealer discount is active on all orders.</p>
        <Link to="/dealer"><Button className="bg-primary text-primary-foreground hover:bg-accent">Go to Dealer Dashboard</Button></Link>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
          <Star size={24} className="text-yellow-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Application Under Review</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Your dealer application is being reviewed. We typically respond within 24 hours.
          <br />You will be contacted via email or WhatsApp.
        </p>
        <a href="https://wa.me/994776117780" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" className="border border-border text-sm">Check Status via WhatsApp</Button>
        </a>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold text-foreground mb-2">Application Not Approved</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Your previous application was not approved. Contact us to discuss requirements.
        </p>
        <a href="https://wa.me/994776117780" target="_blank" rel="noopener noreferrer">
          <Button className="bg-green-700 hover:bg-green-600 text-white">Contact Us</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground red-stripe pl-3 mb-1">Dealer Program</h2>
        <p className="text-sm text-muted-foreground">Apply to become an authorized ITSECURITY dealer and access wholesale pricing.</p>
      </div>

      <Card className="bg-card border-border p-5">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={24} className="text-primary" />
          <div>
            <h3 className="text-base font-bold text-foreground">Dealer Benefits</h3>
            <p className="text-xs text-muted-foreground">Exclusive advantages for approved dealers</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-2">
          {BENEFITS.map(b => (
            <div key={b} className="flex items-center gap-2 text-sm">
              <CheckCircle size={14} className="text-green-400 shrink-0" />
              <span className="text-foreground">{b}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-card border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-2">Requirements</h3>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li className="flex items-start gap-2"><ChevronRight size={14} className="text-primary mt-0.5 shrink-0" />Registered business entity in Azerbaijan</li>
          <li className="flex items-start gap-2"><ChevronRight size={14} className="text-primary mt-0.5 shrink-0" />Minimum monthly order volume of ₼1,000</li>
          <li className="flex items-start gap-2"><ChevronRight size={14} className="text-primary mt-0.5 shrink-0" />Valid business registration or VÖEN (tax ID)</li>
          <li className="flex items-start gap-2"><ChevronRight size={14} className="text-primary mt-0.5 shrink-0" />Agreement to dealer terms and conditions</li>
        </ul>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="bg-primary text-primary-foreground hover:bg-accent flex-1" onClick={handleApply} disabled={applying}>
          {applying ? 'Submitting...' : 'Apply for Dealer Status'}
        </Button>
        <a href="https://wa.me/994776117780" target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="ghost" className="border border-border w-full">Ask Questions First</Button>
        </a>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        By applying, you agree to our dealer terms. Applications are usually processed within 24 hours.
      </p>
    </div>
  );
};

export default DealerApplicationPage;
