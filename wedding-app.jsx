import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, Edit2, Save, Plus, Trash2, Copy, ChevronDown, Lock, Settings } from 'lucide-react';

export default function HochzeitsApp() {
  const BACKUP_ADMIN_PASSWORD = 'BACKUP2024';

  const [currentPage, setCurrentPage] = useState('login');
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userCode, setUserCode] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [expandedTimeline, setExpandedTimeline] = useState(null);
  const [adminTab, setAdminTab] = useState('guests');

  const defaultContent = {
    coupleNames: 'Bira & Partner',
    weddingDate: '14. Juni 2025',
    weddingTime: '16:00 - 23:00 Uhr',
    venue: 'Royal am See',
    address: 'Amlaching 2, 83346 Polling, Bayern',
    description: 'Wir laden euch herzlich zu unserer Hochzeit ein. Ein Tag voller Liebe, Farben und Freude, an dem wir gerne mit euch feiern möchten.',
    rsvpDeadline: '31. Mai 2025',
    heroImage: null,
    timeline: [
      { time: '16:00', event: 'Ankunft & Empfang', subItems: [] },
      { time: '17:00', event: 'Zeremonie', subItems: [] },
      { time: '18:30', event: 'Aperitif & Fotos', subItems: [] },
      { time: '19:00', event: 'Dinner', subItems: ['Südindisches Thali (V)', 'Tandoori Huhn', 'Fisch-Curry'] },
      { time: '21:00', event: 'Tanz & Feier', subItems: [] }
    ],
    googleDriveLink: '',
    googleDriveUploadLink: '',
    adminPassword: 'Hochzeit2024',
    tabAvailability: {
      timeline: true,
      rsvp: true,
      faq: true,
      fotos: true
    }
  };

  // Lade gespeicherte Content oder nutze defaults
  const savedContent = localStorage.getItem('hochzeitsContent');
  const initialContent = savedContent ? JSON.parse(savedContent) : defaultContent;

  const [guestList, setGuestList] = useState(() => {
    const saved = localStorage.getItem('hochzeitsGaesteListe');
    return saved ? JSON.parse(saved) : [];
  });
  const [rsvpData, setRsvpData] = useState(() => {
    const saved = localStorage.getItem('hochzeitsRSVP');
    return saved ? JSON.parse(saved) : [];
  });
  const [faqList, setFaqList] = useState(() => {
    const saved = localStorage.getItem('hochzeitsFAQ');
    return saved ? JSON.parse(saved) : [];
  });
  const [siteContent, setSiteContent] = useState(initialContent);

  const [loginData, setLoginData] = useState({ name: '', code: '' });
  const [adminPassword, setAdminPassword] = useState('');
  const [newGuestData, setNewGuestData] = useState({ name: '', password: '' });
  const [rsvpForm, setRsvpForm] = useState({ attending: null, adults: 1, children: 0 });
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [editingGuestId, setEditingGuestId] = useState(null);
  const [editingGuestData, setEditingGuestData] = useState({ name: '', password: '' });

  const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));
  const updateContent = (key, value) => {
    const updated = { ...siteContent, [key]: value };
    setSiteContent(updated);
    save('hochzeitsContent', updated);
  };

  const toggleTabAvailability = (tab) => {
    const updated = {
      ...siteContent.tabAvailability,
      [tab]: !siteContent.tabAvailability[tab]
    };
    updateContent('tabAvailability', updated);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const guest = guestList.find(g => g.name.toLowerCase() === loginData.name.toLowerCase() && g.password === loginData.code);
    if (guest) {
      setUserCode(guest.password);
      setUserRole('guest');
      setUserName(guest.name);
      setCurrentPage('home');
      setLoginData({ name: '', code: '' });
      return;
    }
    alert('Ungültig!');
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === siteContent.adminPassword || adminPassword === BACKUP_ADMIN_PASSWORD) {
      setUserRole('admin');
      setUserName('Admin');
      setCurrentPage('home');
      setAdminPassword('');
    } else {
      alert('Falsch!');
    }
  };

  const handleLogout = () => {
    setUserCode(null);
    setUserRole(null);
    setUserName(null);
    setCurrentPage('login');
    setEditingSection(null);
  };

  const handleAddGuest = (e) => {
    e.preventDefault();
    if (!newGuestData.name || !newGuestData.password) return;
    const newGuest = { id: Date.now(), name: newGuestData.name, password: newGuestData.password };
    const updated = [...guestList, newGuest];
    setGuestList(updated);
    save('hochzeitsGaesteListe', updated);
    setNewGuestData({ name: '', password: '' });
  };

  const handleUpdateGuest = (id) => {
    if (!editingGuestData.name || !editingGuestData.password) return;
    const updated = guestList.map(g => g.id === id ? {...g, name: editingGuestData.name, password: editingGuestData.password} : g);
    setGuestList(updated);
    save('hochzeitsGaesteListe', updated);
    setEditingGuestId(null);
    setEditingGuestData({ name: '', password: '' });
  };

  const handleDeleteGuest = (id) => {
    if (confirm('Löschen?')) {
      const updated = guestList.filter(g => g.id !== id);
      setGuestList(updated);
      save('hochzeitsGaesteListe', updated);
    }
  };

  const handleRsvp = (e) => {
    e.preventDefault();
    if (rsvpForm.attending === null) return;
    const guest = guestList.find(g => g.password === userCode);
    const newRsvp = { id: Date.now(), guestCode: userCode, guestName: guest.name, ...rsvpForm };
    const updated = rsvpData.filter(r => r.guestCode !== userCode);
    updated.push(newRsvp);
    setRsvpData(updated);
    save('hochzeitsRSVP', updated);
    setRsvpForm({ attending: null, adults: 1, children: 0 });
    alert('Danke!');
    setCurrentPage('home');
  };

  const handleAddFaq = (e) => {
    e.preventDefault();
    if (!newFaqQuestion.trim()) return;
    const newFaq = { id: Date.now(), question: newFaqQuestion, answer: '', author: userName, isFromGuest: userRole === 'guest' };
    const updated = [...faqList, newFaq];
    setFaqList(updated);
    save('hochzeitsFAQ', updated);
    setNewFaqQuestion('');
  };

  const handleDeleteFaq = (id) => {
    const faq = faqList.find(f => f.id === id);
    const isOwner = userRole === 'guest' && faq.author === userName && faq.isFromGuest;
    const isAdmin = userRole === 'admin';
    
    if (isOwner || isAdmin) {
      if (confirm('Löschen?')) {
        const updated = faqList.filter(f => f.id !== id);
        setFaqList(updated);
        save('hochzeitsFAQ', updated);
      }
    }
  };

  const updateFaqAnswer = (id, answer) => {
    const updated = faqList.map(f => f.id === id ? { ...f, answer } : f);
    setFaqList(updated);
    save('hochzeitsFAQ', updated);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => updateContent('heroImage', event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const attendingCount = rsvpData.filter(r => r.attending === true).length;
  const totalAdults = rsvpData.filter(r => r.attending).reduce((sum, r) => sum + (r.adults || 0), 0);
  const totalChildren = rsvpData.filter(r => r.attending).reduce((sum, r) => sum + (r.children || 0), 0);

  const canAccessTab = (tab) => userRole === 'admin' || siteContent.tabAvailability[tab];

  const getPageTitle = () => {
    switch(currentPage) {
      case 'timeline': return 'Ablauf';
      case 'rsvp': return 'Zusage';
      case 'faq': return 'FAQ';
      case 'fotos': return 'Fotogalerie';
      default: return 'Home';
    }
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .fade-in {
      animation: fadeIn 1.5s ease-in-out;
    }
    .script-font {
      font-family: 'Great Vibes', cursive;
    }
    * {
      transition: all 0.3s ease;
    }
  `;

  // ===== LOGIN =====
  if (!userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 relative overflow-hidden" style={{ fontFamily: 'Segoe UI, Roboto, sans-serif' }}>
        <style>{styles}</style>

        {siteContent.heroImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: `url(${siteContent.heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-emerald-950/40 to-transparent" />
          </div>
        )}

        <div className="relative z-20 min-h-screen flex flex-col items-center justify-center p-4">
          {currentPage === 'login' ? (
            <div className="text-center max-w-md w-full space-y-16">
              <div className="space-y-6 fade-in">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80 font-light">Wedding Invitation</p>
                <h1 className="text-7xl text-transparent bg-clip-text bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-200 font-light leading-tight script-font" style={{ fontWeight: 400 }}>
                  {siteContent.coupleNames.split(' & ')[0]}
                </h1>
                <p className="text-emerald-200/70 text-sm font-light">and</p>
                <h1 className="text-7xl text-transparent bg-clip-text bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-200 font-light leading-tight script-font" style={{ fontWeight: 400 }}>
                  {siteContent.coupleNames.split(' & ')[1]}
                </h1>
              </div>

              <p className="text-slate-300/90 text-sm font-light leading-relaxed">Please enter your name and password to view the invitation.</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative group">
                  <input 
                    type="text" 
                    value={loginData.name}
                    onChange={(e) => setLoginData({...loginData, name: e.target.value})}
                    placeholder="Name"
                    className="w-full bg-white/8 border border-white/30 rounded-xl px-6 py-3.5 text-white placeholder-white/50 text-center text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400/50 backdrop-blur-xl shadow-lg group-hover:border-white/40 group-hover:bg-white/10"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-400/0 to-amber-500/0 group-hover:from-emerald-500/5 group-hover:via-emerald-400/5 group-hover:to-amber-500/5 pointer-events-none" />
                </div>
                <div className="relative group">
                  <input 
                    type="password" 
                    value={loginData.code}
                    onChange={(e) => setLoginData({...loginData, code: e.target.value})}
                    placeholder="Password"
                    className="w-full bg-white/8 border border-white/30 rounded-xl px-6 py-3.5 text-white placeholder-white/50 text-center font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400/50 backdrop-blur-xl shadow-lg group-hover:border-white/40 group-hover:bg-white/10"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-400/0 to-amber-500/0 group-hover:from-emerald-500/5 group-hover:via-emerald-400/5 group-hover:to-amber-500/5 pointer-events-none" />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:via-emerald-400 hover:to-teal-400 text-white font-light py-3.5 rounded-xl transition shadow-xl hover:shadow-emerald-500/30 border border-emerald-400/30 hover:border-emerald-300/50 uppercase text-xs tracking-widest">
                  Enter
                </button>
              </form>

              <button
                onClick={() => setCurrentPage('admin')}
                className="text-white/50 hover:text-emerald-300 text-xs font-light transition">
                🔐 Admin
              </button>
            </div>
          ) : (
            <div className="text-center max-w-md w-full space-y-8">
              <h2 className="text-3xl font-light text-white">Admin Login</h2>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="relative group">
                  <input 
                    type="password" 
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-white/8 border border-white/30 rounded-xl px-6 py-3.5 text-white placeholder-white/50 text-center text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400/50 backdrop-blur-xl shadow-lg group-hover:border-white/40 group-hover:bg-white/10"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:via-emerald-400 hover:to-teal-400 text-white font-light py-3.5 rounded-xl transition shadow-xl hover:shadow-emerald-500/30 border border-emerald-400/30 hover:border-emerald-300/50 uppercase text-xs tracking-widest">
                  Anmelden
                </button>
              </form>
              <button
                onClick={() => setCurrentPage('login')}
                className="text-white/50 hover:text-emerald-300 text-sm font-light">
                ← Zurück
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== MAIN APP =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 relative" style={{ fontFamily: 'Segoe UI, Roboto, sans-serif' }}>
      <style>{styles}</style>

      <div className={`fixed inset-0 bg-cover bg-center z-0 pointer-events-none transition-all duration-500 ${
        currentPage === 'home' ? 'opacity-30 blur-0' : 'opacity-25 blur-md'
      }`}
        style={{ backgroundImage: siteContent.heroImage ? `url(${siteContent.heroImage})` : 'none' }}
      />
      
      {/* Dark Overlay für andere Seiten */}
      {currentPage !== 'home' && (
        <div className="fixed inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/50 to-slate-950/60 z-0 pointer-events-none" />
      )}

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/50 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentPage('home')}
              className="text-2xl hover:scale-110 transition duration-300">✨</button>
            <span className="hidden sm:block text-white/90 font-light text-sm">{getPageTitle()}</span>
          </div>
          
          <button 
            className="text-white/80 hover:text-white hover:scale-110 transition duration-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="bg-slate-900/80 backdrop-blur-2xl border-t border-white/10 p-4 space-y-3">
            {['home', 'timeline', 'rsvp', 'faq', 'fotos'].map(page => {
              const isAvailable = page === 'home' || canAccessTab(page);
              
              return (
                <button 
                  key={page}
                  onClick={() => { 
                    if (isAvailable) {
                      setCurrentPage(page); 
                      setMobileMenuOpen(false);
                    }
                  }}
                  className={`block w-full text-left py-2 text-sm font-light transition ${
                    isAvailable 
                      ? 'text-white/90 hover:text-emerald-300' 
                      : 'text-white/30'
                  }`}>
                  {page === 'home' ? '🏠 Home' : page === 'timeline' ? '⏰ Ablauf' : page === 'rsvp' ? '💌 RSVP' : page === 'faq' ? '❓ FAQ' : '📸 Fotos'}
                  {!isAvailable && <span className="text-xs text-white/20 ml-2">(bald)</span>}
                </button>
              );
            })}
            {userRole === 'admin' && (
              <button 
                onClick={() => { setCurrentPage('admin'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 text-white/90 hover:text-emerald-300 text-sm font-light">
                ⚙️ Admin
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="block w-full text-left py-2 text-white/50 hover:text-white text-sm border-t border-white/10 pt-3 mt-3 font-light">
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* CONTENT */}
      <div className="relative z-10 pt-20">
        {/* HOME */}
        {currentPage === 'home' && (
          <div className="space-y-0">
            {/* Hero */}
            <div className="relative h-screen overflow-hidden bg-gradient-to-b from-emerald-900/30 to-slate-950">
              {userRole === 'admin' && (
                <button 
                  onClick={() => setEditingSection(editingSection === 'hero' ? null : 'hero')}
                  className="absolute top-20 right-4 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white p-3 rounded-xl transition z-20 shadow-lg hover:shadow-emerald-500/40">
                  {editingSection === 'hero' ? <Save size={20} /> : <Edit2 size={20} />}
                </button>
              )}

              {editingSection === 'hero' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-30 backdrop-blur-sm">
                  <div className="bg-slate-900/90 rounded-2xl p-6 max-w-sm w-full space-y-4 border border-emerald-500/30 shadow-2xl">
                    <input 
                      type="file"
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="w-full text-sm text-white/70"
                    />
                    <button 
                      onClick={() => setEditingSection(null)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white py-2 rounded-lg text-sm font-light transition shadow-lg">
                      Fertig
                    </button>
                  </div>
                </div>
              )}

              {/* Invitation Card */}
              <div className="absolute inset-0 flex items-center justify-center px-4">
                <div className="max-w-2xl w-full bg-slate-900/40 backdrop-blur-3xl border border-white/20 rounded-3xl p-12 text-center space-y-8 fade-in shadow-2xl hover:shadow-emerald-500/20">
                  {userRole === 'admin' && (
                    <button 
                      onClick={() => setEditingSection(editingSection === 'card' ? null : 'card')}
                      className="absolute top-6 right-6 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white p-2 rounded-lg transition shadow-lg">
                      {editingSection === 'card' ? <Save size={20} /> : <Edit2 size={20} />}
                    </button>
                  )}

                  {editingSection === 'card' ? (
                    <div className="space-y-6">
                      <input type="text" value={siteContent.coupleNames} onChange={(e) => updateContent('coupleNames', e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-center backdrop-blur-sm" placeholder="Namen" />
                      <input type="text" value={siteContent.weddingDate} onChange={(e) => updateContent('weddingDate', e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-center backdrop-blur-sm" placeholder="Datum" />
                      <input type="text" value={siteContent.weddingTime} onChange={(e) => updateContent('weddingTime', e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-center backdrop-blur-sm" placeholder="Zeit" />
                      <input type="text" value={siteContent.venue} onChange={(e) => updateContent('venue', e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-center backdrop-blur-sm" placeholder="Ort" />
                      <input type="text" value={siteContent.address} onChange={(e) => updateContent('address', e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-center backdrop-blur-sm" placeholder="Adresse" />
                      <textarea value={siteContent.description} onChange={(e) => updateContent('description', e.target.value)} rows="3" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-sm backdrop-blur-sm" placeholder="Beschreibung" />
                    </div>
                  ) : (
                    <>
                      <p className="text-xs uppercase tracking-[0.15em] text-amber-200/70 font-light">Wedding Invitation</p>
                      
                      <div className="space-y-4">
                        <h1 className="text-6xl text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-200 font-light leading-tight script-font" style={{ fontWeight: 400 }}>
                          {siteContent.coupleNames.split(' & ')[0]}
                        </h1>
                        <p className="text-emerald-300/70 text-sm font-light">and</p>
                        <h1 className="text-6xl text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-200 font-light leading-tight script-font" style={{ fontWeight: 400 }}>
                          {siteContent.coupleNames.split(' & ')[1]}
                        </h1>
                      </div>

                      <div className="border-t border-white/15 pt-8 space-y-6">
                        <p className="text-white/80 font-light leading-relaxed text-sm">{siteContent.description}</p>

                        <div className="space-y-4 text-left">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-emerald-300/80 mb-1 font-light">Date & Time</p>
                            <p className="text-lg text-white/95 font-light">{siteContent.weddingDate}</p>
                            <p className="text-white/70 font-light text-sm">{siteContent.weddingTime}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs uppercase tracking-wider text-emerald-300/80 mb-1 font-light">Venue</p>
                            <p className="text-lg text-white/95 font-light">{siteContent.venue}</p>
                            <p className="text-white/70 font-light text-sm">{siteContent.address}</p>
                          </div>
                        </div>

                        <p className="text-xs text-white/50 italic">RSVP until {siteContent.rsvpDeadline}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* CTA Section */}
            {userRole && (
              <div className="bg-slate-900/40 backdrop-blur-xl px-4 py-12 border-t border-white/10">
                <div className="max-w-2xl mx-auto flex flex-col gap-4">
                  <button 
                    onClick={() => canAccessTab('rsvp') ? setCurrentPage('rsvp') : null}
                    className={`w-full border rounded-xl py-4 transition font-light ${
                      canAccessTab('rsvp')
                        ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:via-emerald-400 hover:to-teal-400 border-emerald-400/30 hover:border-emerald-300/50 text-white shadow-lg hover:shadow-emerald-500/30'
                        : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                    }`}>
                    Zur Zusage {!canAccessTab('rsvp') && '(bald)'}
                  </button>
                  <button 
                    onClick={() => canAccessTab('fotos') ? setCurrentPage('fotos') : null}
                    className={`w-full border rounded-xl py-4 transition font-light ${
                      canAccessTab('fotos')
                        ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-400 hover:via-pink-400 hover:to-rose-400 border-rose-400/30 hover:border-rose-300/50 text-white shadow-lg hover:shadow-rose-500/20'
                        : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                    }`}>
                    Zur Fotogalerie {!canAccessTab('fotos') && '(bald)'}
                  </button>
                </div>
              </div>
            )}

            {/* Stats */}
            {userRole === 'admin' && (
              <div className="bg-slate-900/40 backdrop-blur-xl px-4 py-12 border-t border-white/10">
                <div className="max-w-2xl mx-auto grid grid-cols-3 gap-4">
                  {[
                    { label: 'Zusagen', value: attendingCount },
                    { label: 'Gäste', value: guestList.length },
                    { label: 'Fragen', value: faqList.length }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/15 rounded-2xl p-6 text-center backdrop-blur-sm hover:bg-white/8 hover:border-emerald-400/30 transition shadow-lg">
                      <p className="text-xs text-emerald-300/80 uppercase mb-2 font-light tracking-wider">{stat.label}</p>
                      <p className="text-3xl font-light text-white/95">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TIMELINE */}
        {currentPage === 'timeline' && canAccessTab('timeline') && (
          <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-light text-white/95 script-font" style={{ fontWeight: 400 }}>Ablauf</h2>
              {userRole === 'admin' && (
                <div className="flex gap-2">
                  <button onClick={() => { const newItem = { time: '', event: '', subItems: [] }; const updated = [...siteContent.timeline, newItem]; updateContent('timeline', updated); }} className="text-emerald-300/70 hover:text-emerald-200"><Plus size={20} /></button>
                  <button onClick={() => setEditingSection(editingSection === 'timeline' ? null : 'timeline')} className="text-emerald-300/70 hover:text-emerald-200">{editingSection === 'timeline' ? <Save size={20} /> : <Edit2 size={20} />}</button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {siteContent.timeline.map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/15 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-emerald-400/30 hover:bg-white/8 transition">
                  {editingSection === 'timeline' ? (
                    <div className="p-6 space-y-4">
                      <div className="flex gap-4">
                        <input type="text" value={item.time} onChange={(e) => { const updated = siteContent.timeline.map((i, i2) => i2 === idx ? {...i, time: e.target.value} : i); updateContent('timeline', updated); }} className="w-24 bg-white/10 border border-white/20 rounded-lg px-2 py-1 font-mono text-sm text-white backdrop-blur-sm" placeholder="Zeit" />
                        <input type="text" value={item.event} onChange={(e) => { const updated = siteContent.timeline.map((i, i2) => i2 === idx ? {...i, event: e.target.value} : i); updateContent('timeline', updated); }} className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm text-white backdrop-blur-sm" placeholder="Event" />
                        <button onClick={() => { const updated = siteContent.timeline.filter((_, i2) => i2 !== idx); updateContent('timeline', updated); }} className="text-red-400/70 hover:text-red-300"><Trash2 size={18} /></button>
                      </div>

                      <div className="ml-4 space-y-2 border-t border-white/15 pt-4">
                        <p className="text-xs text-emerald-300/70 uppercase font-light">Unterpunkte</p>
                        {item.subItems && item.subItems.map((sub, subIdx) => (
                          <div key={subIdx} className="flex gap-2">
                            <input type="text" value={sub} onChange={(e) => { const newSubs = item.subItems.map((s, si) => si === subIdx ? e.target.value : s); const updated = siteContent.timeline.map((i, i2) => i2 === idx ? {...i, subItems: newSubs} : i); updateContent('timeline', updated); }} className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm text-white backdrop-blur-sm" placeholder="Unterpunkt" />
                            <button onClick={() => { const newSubs = item.subItems.filter((_, si) => si !== subIdx); const updated = siteContent.timeline.map((i, i2) => i2 === idx ? {...i, subItems: newSubs} : i); updateContent('timeline', updated); }} className="text-red-400/70 hover:text-red-300"><Trash2 size={16} /></button>
                          </div>
                        ))}
                        <button onClick={() => { const newSubs = [...(item.subItems || []), '']; const updated = siteContent.timeline.map((i, i2) => i2 === idx ? {...i, subItems: newSubs} : i); updateContent('timeline', updated); }} className="text-emerald-300/60 hover:text-emerald-200 text-sm flex items-center gap-1"><Plus size={14} /> Unterpunkt</button>
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => item.subItems && item.subItems.length > 0 && setExpandedTimeline(expandedTimeline === idx ? null : idx)} className={`p-6 flex gap-6 ${item.subItems && item.subItems.length > 0 ? 'cursor-pointer' : 'cursor-default'}`}>
                      <p className="font-mono text-emerald-300/70 w-20">{item.time}</p>
                      <div className="flex-1">
                        <p className="text-white/80 font-light">{item.event}</p>
                        {item.subItems && item.subItems.length > 0 && expandedTimeline === idx && (
                          <div className="mt-4 space-y-2 border-t border-white/15 pt-4">
                            {item.subItems.map((sub, subIdx) => (<p key={subIdx} className="text-white/60 text-sm font-light ml-4">• {sub}</p>))}
                          </div>
                        )}
                      </div>
                      {item.subItems && item.subItems.length > 0 && <ChevronDown size={20} className={`text-emerald-300/40 transition ${expandedTimeline === idx ? 'rotate-180' : ''}`} />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RSVP */}
        {currentPage === 'rsvp' && canAccessTab('rsvp') && (
          <div className="max-w-2xl mx-auto px-4 py-16 space-y-12">
            <h2 className="text-3xl font-light text-white/95 script-font" style={{ fontWeight: 400 }}>Zusage</h2>

            {rsvpData.length > 0 && (
              <div className="bg-white/5 border border-white/15 rounded-2xl p-8 space-y-6 backdrop-blur-sm">
                <h3 className="text-xl font-light text-white/90">Übersicht (anonym)</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10 hover:border-emerald-400/30 hover:bg-white/8 transition"><p className="text-sm text-emerald-300/80 uppercase mb-2 font-light">Zusagen</p><p className="text-4xl font-light text-white/95">{attendingCount}</p></div>
                  <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10 hover:border-emerald-400/30 hover:bg-white/8 transition"><p className="text-sm text-emerald-300/80 uppercase mb-2 font-light">Absagen</p><p className="text-4xl font-light text-white/95">{rsvpData.filter(r => r.attending === false).length}</p></div>
                  <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10 hover:border-emerald-400/30 hover:bg-white/8 transition"><p className="text-sm text-emerald-300/80 uppercase mb-2 font-light">Erwachsene</p><p className="text-4xl font-light text-white/95">{totalAdults}</p></div>
                  <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10 hover:border-emerald-400/30 hover:bg-white/8 transition"><p className="text-sm text-emerald-300/80 uppercase mb-2 font-light">Kinder</p><p className="text-4xl font-light text-white/95">{totalChildren}</p></div>
                </div>
              </div>
            )}

            {userRole === 'admin' && (
              <div className="bg-white/5 border border-white/15 rounded-2xl p-8 space-y-6 backdrop-blur-sm">
                <h3 className="text-xl font-light text-white/90">Gäste Details</h3>
                <div className="space-y-3">
                  {guestList.map(guest => {
                    const rsvp = rsvpData.find(r => r.guestCode === guest.password);
                    return (
                      <div key={guest.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-emerald-400/30 hover:bg-white/8 transition">
                        <div className="flex justify-between items-start">
                          <div><p className="font-light text-white/90">{guest.name}</p><p className="text-xs text-emerald-300/60 font-mono mt-1">{guest.password}</p></div>
                          {rsvp ? (<div className="text-right"><span className={`text-sm font-light ${rsvp.attending ? 'text-green-400' : 'text-red-400'}`}>{rsvp.attending ? '✓ Zusage' : '✗ Absage'}</span>{rsvp.attending && <div className="text-xs text-white/60 mt-2"><p>{rsvp.adults} Erw.</p><p>{rsvp.children} Ki.</p></div>}</div>) : (<span className="text-sm text-amber-300/60 font-light">⏳ Ausstehend</span>)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!rsvpData.find(r => r.guestCode === userCode) && userRole === 'guest' && (
              <form onSubmit={handleRsvp} className="space-y-8">
                <div><p className="font-light text-white/80 mb-4">Kommst du?</p><div className="space-y-2">{[true, false].map(val => (<label key={val} className="flex items-center p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition border border-white/15 hover:border-emerald-400/30"><input type="radio" checked={rsvpForm.attending === val} onChange={() => setRsvpForm({...rsvpForm, attending: val})} className="mr-3" /><span className="text-white/80 font-light">{val ? 'Ja, gerne' : 'Leider nein'}</span></label>))}</div></div>
                {rsvpForm.attending && (<div className="grid grid-cols-2 gap-4">{[{label: 'Erwachsene', key: 'adults'}, {label: 'Kinder (0-14)', key: 'children'}].map(field => (<div key={field.key}><label className="block text-xs text-emerald-300/80 uppercase mb-2 font-light">{field.label}</label><input type="number" min={field.key === 'children' ? 0 : 1} value={rsvpForm[field.key]} onChange={(e) => setRsvpForm({...rsvpForm, [field.key]: parseInt(e.target.value)})} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-emerald-400/50" /></div>))}</div>)}
                <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:via-emerald-400 hover:to-teal-400 text-white border border-emerald-400/30 py-4 rounded-xl transition font-light shadow-lg hover:shadow-emerald-500/30 uppercase text-sm tracking-wider">Speichern</button>
              </form>
            )}

            {rsvpData.find(r => r.guestCode === userCode) && userRole === 'guest' && (<div className="bg-green-900/30 border border-green-500/40 rounded-xl p-6 text-center backdrop-blur-sm"><p className="text-green-300/90 font-light">✓ Danke für deine Zusage!</p></div>)}
          </div>
        )}

        {/* FAQ */}
        {currentPage === 'faq' && canAccessTab('faq') && (
          <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
            <h2 className="text-3xl font-light text-white/95 script-font" style={{ fontWeight: 400 }}>FAQ</h2>

            <form onSubmit={handleAddFaq} className="bg-white/5 border border-white/15 rounded-2xl p-6 backdrop-blur-sm">
              <p className="text-sm text-emerald-300/80 uppercase mb-4 font-light tracking-wider">Deine Frage</p>
              <div className="flex gap-2">
                <input type="text" value={newFaqQuestion} onChange={(e) => setNewFaqQuestion(e.target.value)} placeholder="Frage stellen..." className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 backdrop-blur-sm" />
                <button className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-6 py-3 rounded-lg transition shadow-lg"><Plus size={20} /></button>
              </div>
            </form>

            <div className="space-y-3">
              {faqList.map(faq => {
                const canDelete = userRole === 'admin' || (userRole === 'guest' && faq.author === userName && faq.isFromGuest);
                return (
                  <div key={faq.id} className="bg-white/5 border border-white/15 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-emerald-400/30 hover:bg-white/8 transition">
                    <button onClick={() => setExpandedTimeline(expandedTimeline === faq.id ? null : faq.id)} className="w-full p-6 flex justify-between items-start cursor-pointer"><div className="text-left flex-1"><p className="font-light text-white/90">{faq.question}</p><p className="text-xs text-emerald-300/70 mt-2 font-light">{faq.isFromGuest ? 'Gast Frage' : 'Admin'}</p></div><div className="flex items-center gap-2">{canDelete && <button onClick={(e) => { e.stopPropagation(); handleDeleteFaq(faq.id); }} className="text-red-400/70 hover:text-red-300"><Trash2 size={18} /></button>}<ChevronDown size={20} className={`text-emerald-300/40 transition ${expandedTimeline === faq.id ? 'rotate-180' : ''}`} /></div></button>
                    {expandedTimeline === faq.id && (<div className="border-t border-white/15 p-6 space-y-4 bg-white/5">{userRole === 'admin' && !faq.answer ? (<textarea defaultValue={faq.answer} onBlur={(e) => updateFaqAnswer(faq.id, e.target.value)} placeholder="Antwort..." rows="3" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 backdrop-blur-sm" />) : (<div><p className="text-white/80 text-sm font-light mb-3">{faq.answer || 'Noch keine Antwort'}</p>{userRole === 'admin' && faq.answer && <button onClick={() => { const newAnswer = prompt('Bearbeiten:', faq.answer); if (newAnswer !== null) updateFaqAnswer(faq.id, newAnswer); }} className="text-emerald-300/70 hover:text-emerald-200 text-sm font-light">✏️ Bearbeiten</button>}</div>)}</div>)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FOTOS */}
        {currentPage === 'fotos' && canAccessTab('fotos') && (
          <div className="max-w-2xl mx-auto px-4 py-16 space-y-12">
            <h2 className="text-3xl font-light text-white/95 script-font" style={{ fontWeight: 400 }}>Fotogalerie</h2>

            {userRole === 'admin' && (
              <div className="bg-white/5 border border-white/15 rounded-2xl p-8 space-y-6 backdrop-blur-sm">
                <h3 className="text-xl font-light text-white/90">Google Drive Link</h3>
                <input type="text" value={siteContent.googleDriveLink} onChange={(e) => updateContent('googleDriveLink', e.target.value)} placeholder="https://drive.google.com/..." className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-sm font-mono text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 backdrop-blur-sm" />
                
                <h3 className="text-xl font-light text-white/90 pt-4 border-t border-white/15">Anleitung für Gäste</h3>
                <textarea value={siteContent.googleDriveUploadLink} onChange={(e) => updateContent('googleDriveUploadLink', e.target.value)} rows="4" placeholder="Wie laden Gäste Fotos hoch?" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 backdrop-blur-sm" />
              </div>
            )}

            {userRole !== 'admin' && (
              siteContent.googleDriveLink ? (
                <div className="bg-white/5 border border-white/15 rounded-2xl p-8 space-y-6 text-center backdrop-blur-sm">
                  {siteContent.googleDriveUploadLink && (<div className="bg-white/5 rounded-xl p-6 border border-white/10"><h3 className="text-lg font-light text-white/90 mb-4">Fotos hochladen</h3><p className="text-white/70 text-sm font-light whitespace-pre-line">{siteContent.googleDriveUploadLink}</p></div>)}
                  <a href={siteContent.googleDriveLink} target="_blank" rel="noopener noreferrer" className="inline-block bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-400 hover:via-pink-400 hover:to-rose-400 text-white border border-rose-400/30 px-12 py-4 rounded-lg transition font-light shadow-lg hover:shadow-rose-500/20">Zur Galerie →</a>
                </div>
              ) : (
                <div className="text-center py-12"><p className="text-white/40 font-light">Admin: Link hinzufügen</p></div>
              )
            )}
          </div>
        )}

        {/* ADMIN */}
        {currentPage === 'admin' && userRole === 'admin' && (
          <div className="max-w-2xl mx-auto px-4 py-16 space-y-12">
            <h2 className="text-3xl font-light text-white/95 script-font" style={{ fontWeight: 400 }}>Admin</h2>

            <div className="flex gap-4 border-b border-white/15 flex-wrap">
              {['guests', 'overview', 'freigabe', 'einstellungen'].map(tab => (<button key={tab} onClick={() => setAdminTab(tab)} className={`py-3 px-4 font-light text-sm transition ${adminTab === tab ? 'text-emerald-300 border-b border-emerald-400' : 'text-white/50 hover:text-white/70'}`}>{tab === 'guests' ? 'Gäste' : tab === 'overview' ? 'Übersicht' : tab === 'freigabe' ? 'Reiter' : 'Einst.'}</button>))}
            </div>

            {adminTab === 'guests' && (
              <div className="space-y-6">
                <form onSubmit={handleAddGuest} className="flex gap-2 flex-wrap">
                  <input type="text" value={newGuestData.name} onChange={(e) => setNewGuestData({...newGuestData, name: e.target.value})} placeholder="Name" className="flex-1 min-w-32 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 backdrop-blur-sm" required />
                  <input type="text" value={newGuestData.password} onChange={(e) => setNewGuestData({...newGuestData, password: e.target.value})} placeholder="Pwd" className="flex-1 min-w-32 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 backdrop-blur-sm" required />
                  <button className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-4 py-2 rounded-lg transition"><Plus size={18} /></button>
                </form>

                <div className="space-y-2">
                  {guestList.map(guest => (
                    <div key={guest.id}>{editingGuestId === guest.id ? (<div className="flex gap-2 p-3 bg-white/5 border border-white/15 rounded-lg"><input type="text" value={editingGuestData.name} onChange={(e) => setEditingGuestData({...editingGuestData, name: e.target.value})} className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white backdrop-blur-sm" /><input type="text" value={editingGuestData.password} onChange={(e) => setEditingGuestData({...editingGuestData, password: e.target.value})} className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white backdrop-blur-sm" /><button onClick={() => handleUpdateGuest(guest.id)} className="text-emerald-300/70 hover:text-emerald-200"><Save size={16} /></button><button onClick={() => setEditingGuestId(null)} className="text-red-400/70 hover:text-red-300"><X size={16} /></button></div>) : (<div className="flex items-center justify-between p-3 bg-white/5 border border-white/15 rounded-lg text-sm hover:border-emerald-400/30 hover:bg-white/8 transition"><div><p className="text-white/90">{guest.name}</p><p className="text-emerald-300/60 font-mono text-xs">{guest.password}</p></div><div className="flex gap-2"><button onClick={() => { setEditingGuestId(guest.id); setEditingGuestData({name: guest.name, password: guest.password}); }} className="text-emerald-300/70 hover:text-emerald-200"><Edit2 size={16} /></button><button onClick={() => { navigator.clipboard.writeText(guest.password); alert('✓'); }} className="text-white/50 hover:text-white"><Copy size={16} /></button><button onClick={() => handleDeleteGuest(guest.id)} className="text-red-400/70 hover:text-red-300"><Trash2 size={16} /></button></div></div>)}</div>
                  ))}
                </div>
              </div>
            )}

            {adminTab === 'overview' && (
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-xl p-6 text-center border border-white/15 hover:border-emerald-400/30 hover:bg-white/8 transition"><p className="text-sm text-emerald-300/80 uppercase mb-2 font-light">Zusagen</p><p className="text-4xl font-light text-white/95">{attendingCount}</p></div>
                <div className="bg-white/5 rounded-xl p-6 text-center border border-white/15 hover:border-emerald-400/30 hover:bg-white/8 transition"><p className="text-sm text-emerald-300/80 uppercase mb-2 font-light">Absagen</p><p className="text-4xl font-light text-white/95">{rsvpData.filter(r => r.attending === false).length}</p></div>
                <div className="bg-white/5 rounded-xl p-6 text-center border border-white/15 hover:border-emerald-400/30 hover:bg-white/8 transition"><p className="text-sm text-emerald-300/80 uppercase mb-2 font-light">Erw.</p><p className="text-4xl font-light text-white/95">{totalAdults}</p></div>
                <div className="bg-white/5 rounded-xl p-6 text-center border border-white/15 hover:border-emerald-400/30 hover:bg-white/8 transition"><p className="text-sm text-emerald-300/80 uppercase mb-2 font-light">Ki.</p><p className="text-4xl font-light text-white/95">{totalChildren}</p></div>
              </div>
            )}

            {adminTab === 'freigabe' && (
              <div className="space-y-3">
                {['timeline', 'rsvp', 'faq', 'fotos'].map(tab => (<button key={tab} onClick={() => toggleTabAvailability(tab)} className={`w-full p-4 rounded-xl border font-light text-left transition ${siteContent.tabAvailability[tab] ? 'bg-white/5 border-emerald-400/30 hover:bg-white/10 text-white/90' : 'bg-white/5 border-white/10 text-white/50'}`}><div className="flex items-center justify-between"><span>{tab === 'timeline' ? '⏰' : tab === 'rsvp' ? '💌' : tab === 'faq' ? '❓' : '📸'} {tab}</span><span className="text-xs">{siteContent.tabAvailability[tab] ? '✓' : '🔒'}</span></div></button>))}
              </div>
            )}

            {adminTab === 'einstellungen' && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-light text-white/90">Admin Passwort</h3>
                  <div className="space-y-3">
                    <input type="password" placeholder="Aktuell" id="currentPw" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 backdrop-blur-sm" />
                    <input type="password" placeholder="Neu" id="newPw" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 backdrop-blur-sm" />
                    <button onClick={() => { const currentPw = document.getElementById('currentPw').value; const newPw = document.getElementById('newPw').value; if (!currentPw || !newPw) { alert('Bitte ausfüllen'); return; } if (currentPw !== siteContent.adminPassword && currentPw !== BACKUP_ADMIN_PASSWORD) { alert('Falsch'); return; } updateContent('adminPassword', newPw); document.getElementById('currentPw').value = ''; document.getElementById('newPw').value = ''; alert('✓'); }} className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white py-3 rounded-lg transition font-light shadow-lg">Ändern</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="relative z-10 bg-slate-900/30 border-t border-white/10 py-8 text-center text-white/40 text-xs font-light mt-20 backdrop-blur">
        <p>Hochzeitswebseite • Alle Daten lokal sicher</p>
      </footer>
    </div>
  );
}
