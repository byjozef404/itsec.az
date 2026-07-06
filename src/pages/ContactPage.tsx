import React from 'react';
import { Phone, MapPin, Mail, Clock, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ContactPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">Contact Us</h1>
      <p className="text-muted-foreground text-sm">Get in touch with our team for sales, technical support, or dealer inquiries.</p>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      {/* Contact Info */}
      <div className="space-y-4">
        {[
          { icon: Phone, title: 'Phone / WhatsApp', value: '+994 77 611 77 80', href: 'tel:+994776117780', color: 'text-green-400' },
          { icon: Mail, title: 'Email', value: 'info@itsecurity.az', href: 'mailto:info@itsecurity.az', color: 'text-blue-400' },
          { icon: MapPin, title: 'Address', value: 'Baku, Azadliq prospekti 143', href: '#map', color: 'text-primary' },
          { icon: Clock, title: 'Working Hours', value: 'Mon–Sat: 09:00 – 18:00', href: undefined, color: 'text-yellow-400' },
        ].map(c => (
          <Card key={c.title} className="bg-card border-border p-4 flex items-start gap-4">
            <div className={`w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0 ${c.color}`}>
              <c.icon size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
              {c.href ? (
                <a href={c.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{c.value}</a>
              ) : (
                <p className="text-sm text-muted-foreground">{c.value}</p>
              )}
            </div>
          </Card>
        ))}

        <Card className="bg-green-900/10 border-green-700/30 p-4">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare size={18} className="text-green-400" />
            <h3 className="text-sm font-semibold text-foreground">Instant Support via WhatsApp</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Get answers in minutes. Our team is available Mon–Sat 9AM–6PM.</p>
          <a href="https://wa.me/994776117780" target="_blank" rel="noopener noreferrer">
            <Button className="bg-green-700 hover:bg-green-600 text-white w-full text-sm">
              Open WhatsApp Chat
            </Button>
          </a>
        </Card>
      </div>

      {/* Map */}
      <div id="map">
        <Card className="bg-card border-border overflow-hidden h-full min-h-64">
          <iframe
            width="100%"
            height="100%"
            style={{ minHeight: '320px', border: 0 }}
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed/v1/place?key=AIzaSyB_LJOYJL-84SMuxNB7LtRGhxEQLjswvy0&q=Azadliq+prospekti+143,Baku,Azerbaijan&language=en&region=az"
            allowFullScreen
          />
        </Card>
      </div>
    </div>

    {/* Brands partner section */}
    <div className="mt-10">
      <h2 className="text-lg font-bold text-foreground mb-4 red-stripe pl-3">Official Partner of</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { name: 'Hikvision', desc: 'Platinum Authorized Partner' },
          { name: 'Dahua', desc: 'Authorized Distributor' },
          { name: 'TP-Link', desc: 'Enterprise Partner' },
          { name: 'Cisco', desc: 'Reseller Partner' },
          { name: 'Avitel', desc: 'Distributor' },
          { name: 'RVI', desc: 'Authorized Dealer' },
        ].map(b => (
          <Card key={b.name} className="bg-card border-border p-4 text-center">
            <div className="text-lg font-black text-foreground mb-1">{b.name}</div>
            <div className="text-xs text-muted-foreground">{b.desc}</div>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

export default ContactPage;
