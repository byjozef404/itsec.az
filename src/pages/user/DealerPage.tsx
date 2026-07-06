import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { applyForDealer } from '@/services/api';
import { toast } from 'sonner';
import { CheckCircle, Star, Clock, XCircle } from 'lucide-react';

const DealerPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    try {
      await applyForDealer();
      await refreshProfile();
      toast.success('Dealer application submitted! We will review it shortly.');
    } catch { toast.error('Failed to submit application'); }
    finally { setLoading(false); }
  };

  const status = profile?.dealer_status ?? 'none';

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground red-stripe pl-3">Dealer Program</h2>

      {/* Status */}
      {status !== 'none' && (
        <Card className="bg-card border-border p-4 flex items-center gap-3">
          {status === 'pending' && <><Clock size={20} className="text-yellow-400 shrink-0" /><div><div className="font-semibold text-foreground">Application Pending</div><div className="text-xs text-muted-foreground">We are reviewing your application. You'll be notified soon.</div></div></>}
          {status === 'approved' && <><CheckCircle size={20} className="text-green-400 shrink-0" /><div><div className="font-semibold text-green-400">Dealer Account Active</div><div className="text-xs text-muted-foreground">You have 15% discount on all products and access to the dealer panel.</div></div></>}
          {status === 'rejected' && <><XCircle size={20} className="text-destructive shrink-0" /><div><div className="font-semibold text-destructive">Application Rejected</div><div className="text-xs text-muted-foreground">Contact us for more information.</div></div></>}
        </Card>
      )}

      {/* Benefits */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: '💰', title: '15% Dealer Discount', desc: 'Automatic 15% discount on all orders after approval.' },
          { icon: '📦', title: 'Bulk Ordering', desc: 'Place large orders with volume pricing and priority processing.' },
          { icon: '📊', title: 'Sales Statistics', desc: 'Access detailed reports of your order history and savings.' },
          { icon: '💳', title: 'Credit Limit', desc: 'Apply for credit limit to place orders without upfront payment.' },
          { icon: '📥', title: 'Excel Import/Export', desc: 'Import bulk orders from Excel and export your order history.' },
          { icon: '🎧', title: 'Priority Support', desc: 'Dedicated technical support line and faster response times.' },
        ].map(b => (
          <Card key={b.title} className="bg-card border-border p-4">
            <div className="text-2xl mb-2">{b.icon}</div>
            <h3 className="text-sm font-semibold text-foreground mb-1">{b.title}</h3>
            <p className="text-xs text-muted-foreground">{b.desc}</p>
          </Card>
        ))}
      </div>

      {/* Apply */}
      {status === 'none' && (
        <Card className="bg-card border-border p-6 text-center">
          <Star size={40} className="mx-auto mb-3 text-yellow-400" />
          <h3 className="text-lg font-bold text-foreground mb-2">Apply for Dealer Status</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Join our dealer network and enjoy exclusive wholesale pricing, bulk ordering tools, and priority support.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button className="bg-primary text-primary-foreground hover:bg-accent" onClick={handleApply} disabled={loading}>
              {loading ? 'Submitting...' : 'Apply Now'}
            </Button>
            <a href="https://wa.me/994776117780?text=Hello! I would like to apply for dealer status." target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="border border-green-700 text-green-400 hover:bg-green-900/20">Contact via WhatsApp</Button>
            </a>
          </div>
        </Card>
      )}

      {status === 'approved' && (
        <Card className="bg-card border-border p-6 text-center">
          <CheckCircle size={40} className="mx-auto mb-3 text-green-400" />
          <h3 className="text-lg font-bold text-foreground mb-2">Your Dealer Account is Active</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Credit Limit: <span className="text-foreground font-bold">₼{(profile?.credit_limit ?? 0).toFixed(2)}</span>
            {' · '}Used: <span className="text-foreground font-bold">₼{(profile?.credit_used ?? 0).toFixed(2)}</span>
          </p>
          <a href="/dealer"><Button className="bg-primary text-primary-foreground hover:bg-accent">Open Dealer Panel</Button></a>
        </Card>
      )}
    </div>
  );
};

export default DealerPage;
