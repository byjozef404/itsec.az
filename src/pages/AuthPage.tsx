import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
        toast.success('Welcome back!');
        navigate('/');
      } else {
        await signUp(email, password, fullName);
        toast.success('Account created! Please check your email to verify.');
        setMode('login');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Image */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-secondary border-r border-border relative overflow-hidden">
        <img
          src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_1dce9933-b447-420c-9998-6811960da4ab.jpg"
          alt="Security System"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 text-center px-8">
          <div className="flex items-center justify-center mb-6">
            <span className="text-4xl font-black text-primary">PRO</span>
            <span className="text-4xl font-black text-foreground">SECURITY</span>
            <span className="text-2xl font-bold text-muted-foreground">.AZ</span>
          </div>
          <p className="text-muted-foreground text-base max-w-xs">
            Professional security systems platform. 2500+ products, 5000+ satisfied customers.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            {['Official Hikvision Partner', 'Dahua Distributor', '100% Warranty', 'Free Consultation'].map(f => (
              <div key={f} className="bg-secondary/80 border border-border rounded px-3 py-2 text-foreground">{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center justify-center mb-8">
            <span className="text-2xl font-black text-primary">PRO</span>
            <span className="text-2xl font-black text-foreground">SECURITY.AZ</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {mode === 'login' ? 'Welcome back to ITSecurity.az' : 'Join the ITSecurity.az platform'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
                <Input
                  required
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="bg-muted border-border h-10"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email Address</label>
              <Input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-muted border-border h-10"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Password</label>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-muted border-border h-10 pr-10"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-accent h-10" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button onClick={() => setMode('signup')} className="text-primary hover:underline font-medium">Sign Up</button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => setMode('login')} className="text-primary hover:underline font-medium">Sign In</button>
              </>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground mb-2">Need help? Contact us directly</p>
            <a href="https://wa.me/994776117780" target="_blank" rel="noopener noreferrer"
              className="text-xs text-green-400 hover:underline">WhatsApp: +994 77 611 77 80</a>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-primary">← Back to Store</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
