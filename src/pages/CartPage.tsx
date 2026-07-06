import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { createOrder } from '@/services/api';
import { toast } from 'sonner';
import type { CheckoutForm } from '@/types/types';
import WhatsAppOrderSheet from '@/components/common/WhatsAppOrderSheet';

const CartPage: React.FC = () => {
  const { items, loading, subtotal, updateQty, removeItem, totalItems, clearAllCart } = useCart();
  const { user, isDealer, profile } = useAuth();
  const navigate = useNavigate();
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    full_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    address: profile?.address ?? '',
    city: profile?.city ?? '',
    country: 'Azerbaijan',
    notes: '',
  });

  const discount = isDealer ? subtotal * 0.15 : 0;
  const total = subtotal - discount;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to place an order'); navigate('/auth'); return; }
    setSubmitting(true);
    try {
      const order = await createOrder(items, form, isDealer, isDealer ? 15 : 0);
      await clearAllCart();
      toast.success(`Order ${order.order_number} placed successfully!`);
      navigate(`/user/orders/${order.id}`);
    } catch (err) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-12 text-center text-muted-foreground">Loading cart...</div>;

  if (items.length === 0) return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center">
      <ShoppingBag size={64} className="mx-auto mb-4 text-muted-foreground/30" />
      <h2 className="text-xl font-bold text-foreground mb-2">Your cart is empty</h2>
      <p className="text-muted-foreground mb-6">Add some products to get started.</p>
      <Link to="/products"><Button className="bg-primary text-primary-foreground hover:bg-accent">Browse Products</Button></Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Shopping Cart ({totalItems} items)</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => {
            const price = isDealer && item.products?.dealer_price ? item.products.dealer_price : (item.products?.price ?? 0);
            return (
              <Card key={item.id} className="bg-card border-border p-4">
                <div className="flex gap-4">
                  <Link to={`/products/${item.products?.slug}`} className="shrink-0">
                    <div className="w-20 h-20 bg-muted rounded overflow-hidden">
                      <img src={item.products?.thumbnail_url ?? ''} alt={item.products?.name} className="w-full h-full object-cover" />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.products?.slug}`}>
                      <h3 className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">{item.products?.name}</h3>
                    </Link>
                    <p className="price-tag text-base mt-1">₼{price.toFixed(2)} each</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-border rounded overflow-hidden">
                        <button onClick={() => updateQty(item.id, item.product_id, item.quantity - 1)} className="px-2 py-1 text-foreground hover:bg-muted transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="px-3 py-1 text-sm text-foreground bg-muted">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.product_id, item.quantity + 1)} className="px-2 py-1 text-foreground hover:bg-muted transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-foreground">₼{(price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => removeItem(item.id)} className="text-destructive hover:text-destructive/80 ml-auto">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Summary */}
        <div>
          <Card className="bg-card border-border p-5 sticky top-20">
            <h2 className="text-base font-bold text-foreground mb-4 red-stripe pl-3">Order Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>₼{subtotal.toFixed(2)}</span>
              </div>
              {isDealer && (
                <div className="flex justify-between text-green-400">
                  <span>Dealer Discount (15%)</span><span>-₼{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground text-base">
                <span>Total</span><span className="price-tag">₼{total.toFixed(2)}</span>
              </div>
            </div>

            {!checkoutMode ? (
              <>
                {user ? (
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-accent" onClick={() => setCheckoutMode(true)}>
                    Checkout <ArrowRight size={16} className="ml-2" />
                  </Button>
                ) : (
                  <Link to="/auth"><Button className="w-full bg-primary text-primary-foreground hover:bg-accent">Sign In to Checkout</Button></Link>
                )}
                <Button
                  variant="ghost"
                  onClick={() => setWaOpen(true)}
                  className="w-full mt-2 border border-green-700 text-green-400 hover:bg-green-900/20 text-sm"
                >
                  <MessageCircle size={14} className="mr-2" />Order via WhatsApp
                </Button>
              </>
            ) : (
              <form onSubmit={handleCheckout} className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Shipping Info</h3>
                <Input required placeholder="Full Name" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="bg-muted border-border text-sm h-9" />
                <Input required placeholder="Phone Number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="bg-muted border-border text-sm h-9" />
                <Input required placeholder="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="bg-muted border-border text-sm h-9" />
                <Input required placeholder="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="bg-muted border-border text-sm h-9" />
                <textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none h-16 focus:outline-none focus:ring-1 focus:ring-primary" />
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-accent" disabled={submitting}>
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </Button>
                <Button type="button" variant="ghost" className="w-full border border-border text-sm" onClick={() => setCheckoutMode(false)}>Back</Button>
              </form>
            )}
          </Card>
        </div>
      </div>
      <WhatsAppOrderSheet
        open={waOpen}
        onClose={() => setWaOpen(false)}
        cartItems={items.map(item => ({
          product: {
            id: item.product_id,
            name: item.products?.name ?? '',
            sku: item.products?.sku,
            brand: (item.products as any)?.brands?.name,
            price: item.products?.price ?? 0,
            dealer_price: item.products?.dealer_price,
            warranty_months: item.products?.warranty_months,
            model_number: item.products?.model_number,
          },
          qty: item.quantity,
        }))}
      />
    </div>
  );
};

export default CartPage;
