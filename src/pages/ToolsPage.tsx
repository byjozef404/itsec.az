import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HardDrive, Eye, Zap, Wifi, Cable, Server, Radio, Smartphone, Monitor, Download, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// ─── HDD Calculator ───────────────────────────────────────────────────
const HddCalculator: React.FC = () => {
  const [cameras, setCameras] = useState(4);
  const [res, setRes] = useState('2');
  const [fps, setFps] = useState(15);
  const [days, setDays] = useState(30);
  const [hours, setHours] = useState(24);
  const [result, setResult] = useState<string | null>(null);
  const RES_BITRATES: Record<string, number> = { '1': 1024, '2': 2048, '4': 4096, '8': 8192 };
  const calculate = () => {
    const bitrate = (RES_BITRATES[res] ?? 2048) * (fps / 25);
    const totalGB = (cameras * bitrate * 3600 * hours * days) / (8 * 1024 * 1024 * 1024);
    const recommended = totalGB * 1.2;
    setResult(`Yaddaş: ${totalGB.toFixed(1)} GB | Tövsiyə: ${recommended.toFixed(0)} GB (${(recommended / 1000).toFixed(1)} TB)`);
  };
  return (
    <Card className="bg-card border-border p-5">
      <div className="flex items-center gap-2 mb-4"><HardDrive size={20} className="text-primary" /><h3 className="text-base font-bold text-foreground">HDD Yaddaş Kalkulyatoru</h3></div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div><label className="text-xs text-muted-foreground mb-1 block">Kamera sayı</label><Input type="number" min={1} max={64} value={cameras} onChange={e => setCameras(+e.target.value)} className="bg-muted border-border h-9 text-sm" /></div>
        <div><label className="text-xs text-muted-foreground mb-1 block">Həll qabiliyyəti (MP)</label>
          <Select value={res} onValueChange={setRes}><SelectTrigger className="bg-muted border-border h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-secondary border-border"><SelectItem value="1">1MP (720p)</SelectItem><SelectItem value="2">2MP (1080p)</SelectItem><SelectItem value="4">4MP (2K)</SelectItem><SelectItem value="8">8MP (4K)</SelectItem></SelectContent>
          </Select></div>
        <div><label className="text-xs text-muted-foreground mb-1 block">FPS</label><Input type="number" min={1} max={30} value={fps} onChange={e => setFps(+e.target.value)} className="bg-muted border-border h-9 text-sm" /></div>
        <div><label className="text-xs text-muted-foreground mb-1 block">Gündəlik saat</label><Input type="number" min={1} max={24} value={hours} onChange={e => setHours(+e.target.value)} className="bg-muted border-border h-9 text-sm" /></div>
        <div><label className="text-xs text-muted-foreground mb-1 block">Saxlama günü</label><Input type="number" min={1} max={365} value={days} onChange={e => setDays(+e.target.value)} className="bg-muted border-border h-9 text-sm" /></div>
      </div>
      <Button className="w-full bg-primary text-primary-foreground hover:bg-accent" onClick={calculate}>Hesabla</Button>
      {result && <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded text-sm text-primary font-medium">{result}</div>}
    </Card>
  );
};

// ─── Lens FOV Calculator ───────────────────────────────────────────────
const LensCalculator: React.FC = () => {
  const [focal, setFocal] = useState(2.8);
  const [sensor, setSensor] = useState('1/2.8');
  const [result, setResult] = useState<string | null>(null);
  const SENSOR_SIZES: Record<string, { w: number; h: number }> = { '1/2.8': { w: 6.35, h: 4.76 }, '1/3': { w: 6.0, h: 4.5 }, '1/2.7': { w: 6.6, h: 5.0 }, '1/1.8': { w: 7.18, h: 5.32 } };
  const calculate = () => {
    const s = SENSOR_SIZES[sensor] ?? SENSOR_SIZES['1/2.8'];
    const hFov = (2 * Math.atan(s.w / (2 * focal)) * 180) / Math.PI;
    const vFov = (2 * Math.atan(s.h / (2 * focal)) * 180) / Math.PI;
    const covAt10m = 2 * 10 * Math.tan((hFov * Math.PI) / 360);
    setResult(`Üfüqi: ${hFov.toFixed(1)}° | Şaquli: ${vFov.toFixed(1)}° | 10m-də əhatə: ${covAt10m.toFixed(1)}m`);
  };
  return (
    <Card className="bg-card border-border p-5">
      <div className="flex items-center gap-2 mb-4"><Eye size={20} className="text-primary" /><h3 className="text-base font-bold text-foreground">Lens Bucağı (FOV) Simulatoru</h3></div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div><label className="text-xs text-muted-foreground mb-1 block">Fokus (mm)</label><Input type="number" min={1.4} max={100} step={0.1} value={focal} onChange={e => setFocal(+e.target.value)} className="bg-muted border-border h-9 text-sm" /></div>
        <div><label className="text-xs text-muted-foreground mb-1 block">Sensor ölçüsü</label>
          <Select value={sensor} onValueChange={setSensor}><SelectTrigger className="bg-muted border-border h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-secondary border-border"><SelectItem value="1/1.8">1/1.8" (böyük)</SelectItem><SelectItem value="1/2.7">1/2.7"</SelectItem><SelectItem value="1/2.8">1/2.8" (standart)</SelectItem><SelectItem value="1/3">1/3"</SelectItem></SelectContent>
          </Select></div>
      </div>
      <Button className="w-full bg-primary text-primary-foreground hover:bg-accent" onClick={calculate}>FOV Hesabla</Button>
      {result && <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded text-sm text-primary font-medium">{result}</div>}
    </Card>
  );
};

// ─── PoE Calculator ───────────────────────────────────────────────────
const PoeCalculator: React.FC = () => {
  const [cameras, setCameras] = useState(4);
  const [poeStd, setPoeStd] = useState('802.3at');
  const [result, setResult] = useState<string | null>(null);
  const WATTS: Record<string, number> = { '802.3af': 15.4, '802.3at': 30, '802.3bt': 60 };
  const calculate = () => {
    const wPerPort = WATTS[poeStd] ?? 30;
    const total = cameras * wPerPort;
    setResult(`Hər kamera: ${wPerPort}W | Ümumi: ${total}W | Tövsiyə switch: ${(total * 1.2).toFixed(0)}W`);
  };
  return (
    <Card className="bg-card border-border p-5">
      <div className="flex items-center gap-2 mb-4"><Zap size={20} className="text-primary" /><h3 className="text-base font-bold text-foreground">PoE Güc Kalkulyatoru</h3></div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div><label className="text-xs text-muted-foreground mb-1 block">Kamera sayı</label><Input type="number" min={1} max={64} value={cameras} onChange={e => setCameras(+e.target.value)} className="bg-muted border-border h-9 text-sm" /></div>
        <div><label className="text-xs text-muted-foreground mb-1 block">PoE standartı</label>
          <Select value={poeStd} onValueChange={setPoeStd}><SelectTrigger className="bg-muted border-border h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-secondary border-border"><SelectItem value="802.3af">802.3af (15.4W)</SelectItem><SelectItem value="802.3at">802.3at / PoE+ (30W)</SelectItem><SelectItem value="802.3bt">802.3bt / PoE++ (60W)</SelectItem></SelectContent>
          </Select></div>
      </div>
      <Button className="w-full bg-primary text-primary-foreground hover:bg-accent" onClick={calculate}>Hesabla</Button>
      {result && <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded text-sm text-primary font-medium">{result}</div>}
    </Card>
  );
};

// ─── Bandwidth Calculator ─────────────────────────────────────────────
const BandwidthCalculator: React.FC = () => {
  const [cameras, setCameras] = useState(4);
  const [res, setRes] = useState('2');
  const [codec, setCodec] = useState('h265plus');
  const [result, setResult] = useState<string | null>(null);
  const BASE_KBPS: Record<string, number> = { '1': 512, '2': 1024, '4': 2048, '8': 4096 };
  const CODEC_FACTOR: Record<string, number> = { 'h264': 1.0, 'h265': 0.5, 'h265plus': 0.3 };
  const calculate = () => {
    const base = (BASE_KBPS[res] ?? 1024) * (CODEC_FACTOR[codec] ?? 0.5);
    const totalMbps = (cameras * base) / 1000;
    setResult(`Hər kamera: ${base.toFixed(0)} kbps | Ümumi: ${totalMbps.toFixed(2)} Mbps | Tövsiyə: ${(totalMbps * 1.3).toFixed(1)} Mbps`);
  };
  return (
    <Card className="bg-card border-border p-5">
      <div className="flex items-center gap-2 mb-4"><Wifi size={20} className="text-primary" /><h3 className="text-base font-bold text-foreground">Bant Genişliyi Kalkulyatoru</h3></div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div><label className="text-xs text-muted-foreground mb-1 block">Kamera sayı</label><Input type="number" min={1} max={64} value={cameras} onChange={e => setCameras(+e.target.value)} className="bg-muted border-border h-9 text-sm" /></div>
        <div><label className="text-xs text-muted-foreground mb-1 block">Həll qabiliyyəti</label>
          <Select value={res} onValueChange={setRes}><SelectTrigger className="bg-muted border-border h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-secondary border-border"><SelectItem value="1">1MP</SelectItem><SelectItem value="2">2MP</SelectItem><SelectItem value="4">4MP</SelectItem><SelectItem value="8">8MP</SelectItem></SelectContent>
          </Select></div>
        <div className="col-span-2"><label className="text-xs text-muted-foreground mb-1 block">Kodek</label>
          <Select value={codec} onValueChange={setCodec}><SelectTrigger className="bg-muted border-border h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-secondary border-border"><SelectItem value="h264">H.264</SelectItem><SelectItem value="h265">H.265</SelectItem><SelectItem value="h265plus">H.265+ (Smart Coding)</SelectItem></SelectContent>
          </Select></div>
      </div>
      <Button className="w-full bg-primary text-primary-foreground hover:bg-accent" onClick={calculate}>Hesabla</Button>
      {result && <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded text-sm text-primary font-medium">{result}</div>}
    </Card>
  );
};

// ─── Cable Calculator ─────────────────────────────────────────────────
const CableCalculator: React.FC = () => {
  const [type, setType] = useState('cat6');
  const [result, setResult] = useState<string | null>(null);
  const CABLE_INFO: Record<string, { max: number; note: string }> = {
    cat5e: { max: 100, note: 'PoE üçün maks 100m. Müdaxilə yüksəkdirsə ekranlı kabel.' },
    cat6: { max: 100, note: 'Maks 100m, 55m-ə qədər 10Gbps. IP kameralar üçün ideal.' },
    cat6a: { max: 100, note: 'Maks 100m @ 10Gbps. 4K kameralar üçün ən yaxşısı.' },
    coax_rg59: { max: 500, note: 'Analog CVBS üçün maks 500m. Uzatmaq üçün aktiv balun.' },
    coax_rg6: { max: 1000, note: 'Analog üçün maks 1000m. HD-TVI/AHD üçün.' },
    fiber: { max: 80000, note: 'Single-mode: 80km-ə qədər. Multi-mode: 550m @ 1Gbps.' },
  };
  const calculate = () => {
    const info = CABLE_INFO[type];
    if (info) setResult(`Maks məsafə: ${info.max >= 1000 ? (info.max / 1000) + 'km' : info.max + 'm'} | ${info.note}`);
  };
  return (
    <Card className="bg-card border-border p-5">
      <div className="flex items-center gap-2 mb-4"><Cable size={20} className="text-primary" /><h3 className="text-base font-bold text-foreground">Kabel Məsafəsi Cədvəli</h3></div>
      <div className="mb-4"><label className="text-xs text-muted-foreground mb-1 block">Kabel növü</label>
        <Select value={type} onValueChange={setType}><SelectTrigger className="bg-muted border-border h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-secondary border-border"><SelectItem value="cat5e">Cat5e UTP/STP</SelectItem><SelectItem value="cat6">Cat6 UTP/STP</SelectItem><SelectItem value="cat6a">Cat6A (Augmented)</SelectItem><SelectItem value="coax_rg59">Koaksial RG59</SelectItem><SelectItem value="coax_rg6">Koaksial RG6</SelectItem><SelectItem value="fiber">Fiber Optik</SelectItem></SelectContent>
        </Select></div>
      <Button className="w-full bg-primary text-primary-foreground hover:bg-accent" onClick={calculate}>Məlumat Al</Button>
      {result && <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded text-sm text-primary font-medium">{result}</div>}
    </Card>
  );
};

// ─── NVR Channel Selector ─────────────────────────────────────────────
const NvrSelector: React.FC = () => {
  const [cameras, setCameras] = useState(6);
  const [result, setResult] = useState<string | null>(null);
  const calculate = () => {
    const recommended = [4, 8, 16, 32, 64].find(c => c >= cameras) ?? 64;
    const next = [4, 8, 16, 32, 64].find(c => c > recommended) ?? 64;
    setResult(`Tövsiyə: ${recommended} kanallı NVR | Genişləndirmə üçün: ${next} kanal. Həmişə 20-30% artıq kanal seçin.`);
  };
  return (
    <Card className="bg-card border-border p-5">
      <div className="flex items-center gap-2 mb-4"><Server size={20} className="text-primary" /><h3 className="text-base font-bold text-foreground">NVR Kanal Seçimi</h3></div>
      <div className="mb-4"><label className="text-xs text-muted-foreground mb-1 block">IP kamera sayı</label><Input type="number" min={1} max={64} value={cameras} onChange={e => setCameras(+e.target.value)} className="bg-muted border-border h-9 text-sm" /></div>
      <Button className="w-full bg-primary text-primary-foreground hover:bg-accent" onClick={calculate}>NVR Tövsiyə Et</Button>
      {result && <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded text-sm text-primary font-medium">{result}</div>}
    </Card>
  );
};

// ─── Fiber Distance Calculator ────────────────────────────────────────
const FiberCalculator: React.FC = () => {
  const [fiberType, setFiberType] = useState('single');
  const [speed, setSpeed] = useState('1gbps');
  const [result, setResult] = useState<string | null>(null);
  const DISTANCES: Record<string, Record<string, string>> = {
    single: { '1gbps': '10km (standart), optik ilə 80km', '10gbps': '40km-ə qədər', '40gbps': '10km-ə qədər' },
    multi_om3: { '1gbps': '550m-ə qədər', '10gbps': '300m-ə qədər', '40gbps': '100m-ə qədər' },
    multi_om4: { '1gbps': '1000m-ə qədər', '10gbps': '400m-ə qədər', '40gbps': '150m-ə qədər' },
  };
  const calculate = () => {
    const d = DISTANCES[fiberType]?.[speed] ?? 'N/A';
    setResult(`Maks məsafə: ${d}`);
  };
  return (
    <Card className="bg-card border-border p-5">
      <div className="flex items-center gap-2 mb-4"><Radio size={20} className="text-primary" /><h3 className="text-base font-bold text-foreground">Fiber Məsafə Kalkulyatoru</h3></div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div><label className="text-xs text-muted-foreground mb-1 block">Fiber növü</label>
          <Select value={fiberType} onValueChange={setFiberType}><SelectTrigger className="bg-muted border-border h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-secondary border-border"><SelectItem value="single">Single-mode (SMF)</SelectItem><SelectItem value="multi_om3">Multi-mode OM3</SelectItem><SelectItem value="multi_om4">Multi-mode OM4</SelectItem></SelectContent>
          </Select></div>
        <div><label className="text-xs text-muted-foreground mb-1 block">Sürət</label>
          <Select value={speed} onValueChange={setSpeed}><SelectTrigger className="bg-muted border-border h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-secondary border-border"><SelectItem value="1gbps">1 Gbps</SelectItem><SelectItem value="10gbps">10 Gbps</SelectItem><SelectItem value="40gbps">40 Gbps</SelectItem></SelectContent>
          </Select></div>
      </div>
      <Button className="w-full bg-primary text-primary-foreground hover:bg-accent" onClick={calculate}>Hesabla</Button>
      {result && <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded text-sm text-primary font-medium">{result}</div>}
    </Card>
  );
};

// ─── DVR/NVR Software & App Downloads ────────────────────────────────
const SoftwareDownloads: React.FC = () => {
  const systems = [
    {
      brand: 'Hikvision',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10 border-red-500/20',
      items: [
        { label: 'iVMS-4200 (Windows PC)', icon: <Monitor size={14} />, url: 'https://www.hikvision.com/en/support/download/software/ivms-4200-series/' },
        { label: 'iVMS-4200 (Mac)', icon: <Monitor size={14} />, url: 'https://www.hikvision.com/en/support/download/software/ivms-4200-series/' },
        { label: 'Hik-Connect (Android)', icon: <Smartphone size={14} />, url: 'https://play.google.com/store/apps/details?id=com.hikvision.star' },
        { label: 'Hik-Connect (iOS)', icon: <Smartphone size={14} />, url: 'https://apps.apple.com/app/hik-connect/id1017216479' },
      ],
    },
    {
      brand: 'Dahua',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      items: [
        { label: 'SmartPSS (Windows PC)', icon: <Monitor size={14} />, url: 'https://dahuawiki.com/SmartPSS' },
        { label: 'SmartPSS (Mac)', icon: <Monitor size={14} />, url: 'https://dahuawiki.com/SmartPSS' },
        { label: 'DMSS (Android)', icon: <Smartphone size={14} />, url: 'https://play.google.com/store/apps/details?id=com.dahua.mobile' },
        { label: 'DMSS (iOS)', icon: <Smartphone size={14} />, url: 'https://apps.apple.com/app/dmss/id1249605205' },
      ],
    },
    {
      brand: 'Uniview (UNV)',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/20',
      items: [
        { label: 'EZTools (Windows PC)', icon: <Monitor size={14} />, url: 'https://www.uniview.com/Support/Software_Download/' },
        { label: 'EZView (Android)', icon: <Smartphone size={14} />, url: 'https://play.google.com/store/apps/details?id=com.uniview.ezview' },
        { label: 'EZView (iOS)', icon: <Smartphone size={14} />, url: 'https://apps.apple.com/app/ezview/id878516903' },
      ],
    },
    {
      brand: 'Reolink',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10 border-orange-500/20',
      items: [
        { label: 'Reolink Client (Windows PC)', icon: <Monitor size={14} />, url: 'https://reolink.com/software-and-manual/' },
        { label: 'Reolink App (Android)', icon: <Smartphone size={14} />, url: 'https://play.google.com/store/apps/details?id=com.mcu.reolink' },
        { label: 'Reolink App (iOS)', icon: <Smartphone size={14} />, url: 'https://apps.apple.com/app/reolink/id947955967' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-1">
          <Download size={18} className="text-primary" /> DVR/NVR Proqram & Mobil Tətbiqlər
        </h3>
        <p className="text-xs text-muted-foreground">Kamera sistemlərini PC və ya smartfonunuzdan idarə edin</p>
      </div>
      {systems.map(sys => (
        <Card key={sys.brand} className={`bg-card border p-4 ${sys.bgColor}`}>
          <h4 className={`text-sm font-bold mb-3 ${sys.color}`}>{sys.brand}</h4>
          <div className="grid grid-cols-1 gap-2">
            {sys.items.map(item => (
              <a
                key={item.label}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-foreground hover:text-primary transition-colors group"
              >
                <span className={`${sys.color} shrink-0`}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                <ExternalLink size={11} className="text-muted-foreground group-hover:text-primary shrink-0" />
              </a>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

// ─── Main Tools Page ──────────────────────────────────────────────────
const ToolsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('downloads');
  const { t } = useLanguage();

  const TABS = [
    { id: 'downloads', label: 'Proqramlar', icon: Download },
    { id: 'hdd', label: 'HDD', icon: HardDrive },
    { id: 'lens', label: 'Lens FOV', icon: Eye },
    { id: 'poe', label: 'PoE', icon: Zap },
    { id: 'bandwidth', label: 'Bant', icon: Wifi },
    { id: 'cable', label: 'Kabel', icon: Cable },
    { id: 'nvr', label: 'NVR', icon: Server },
    { id: 'fiber', label: 'Fiber', icon: Radio },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Texniki Alətlər</h1>
        <p className="text-muted-foreground text-sm">DVR/NVR proqramları, mobil tətbiqlər və peşəkar kalkulyatorlar</p>
      </div>

      {/* Tab nav */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded transition-colors ${activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-secondary border border-border'}`}>
            <tab.icon size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className={activeTab === 'downloads' ? 'max-w-2xl' : 'max-w-lg'}>
        {activeTab === 'downloads' && <SoftwareDownloads />}
        {activeTab === 'hdd' && <HddCalculator />}
        {activeTab === 'lens' && <LensCalculator />}
        {activeTab === 'poe' && <PoeCalculator />}
        {activeTab === 'bandwidth' && <BandwidthCalculator />}
        {activeTab === 'cable' && <CableCalculator />}
        {activeTab === 'nvr' && <NvrSelector />}
        {activeTab === 'fiber' && <FiberCalculator />}
      </div>

      <div className="mt-8 bg-card border border-border rounded p-6 text-center">
        <p className="text-sm text-muted-foreground mb-3">{t('free_consultation')}</p>
        <a href="https://wa.me/994776117780" target="_blank" rel="noopener noreferrer">
          <Button className="bg-green-700 hover:bg-green-600 text-white">WhatsApp ilə əlaqə</Button>
        </a>
      </div>
    </div>
  );
};

export default ToolsPage;
