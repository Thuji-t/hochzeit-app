import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, Edit2, Save, Plus, Trash2, Copy, ChevronDown, Lock, Settings } from 'lucide-react';

export default function HochzeitsApp() {
  const BACKUP_ADMIN_PASSWORD = 'BACKUP2024'; // Nur für Notfälle

  const [currentPage, setCurrentPage] = useState('login');
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userCode, setUserCode] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [expandedTimeline, setExpandedTimeline] = useState(null);
  const [adminTab, setAdminTab] = useState('guests');

  const [guestList, setGuestList] = useState([]);
  const [rsvpData, setRsvpData] = useState([]);
  const [faqList, setFaqList] = useState([]);

  const [siteContent, setSiteContent] = useState({
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
  });

  const [loginData, setLoginData] = useState({ name: '', code: '' });
  const [adminPassword, setAdminPassword] = useState('');
  const [newGuestData, setNewGuestData] = useState({ name: '', password: '' });
  const [rsvpForm, setRsvpForm] = useState({ attending: null, adults: 1, children: 0 });
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [editingGuestId, setEditingGuestId] = useState(null);
  const [editingGuestData, setEditingGuestData] = useState({ name: '', password: '' });

  useEffect(() => {
    const saved = {
      guests: localStorage.getItem('hochzeitsGaesteListe'),
      rsvp: localStorage.getItem('hochzeitsRSVP'),
      content: localStorage.getItem('hochzeitsContent'),
      faq: localStorage.getItem('hochzeitsFAQ')
    };
    if (saved.guests) setGuestList(JSON.parse(saved.guests));
    if (saved.rsvp) setRsvpData(JSON.parse(saved.rsvp));
    if (saved.content) {
      const content = JSON.parse(saved.content);
      setSiteContent({...siteContent, ...content});
    }
    if (saved.faq) setFaqList(JSON.parse(saved.faq));
  }, []);

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
    body {
      background: linear-gradient(135deg, #0a5f5f 0%, #0d7f7f 50%, #0a5f5f 100%);
    }
  `;

  // ===== LOGIN =====
  if (!userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 relative overflow-hidden" style={{ fontFamily: 'Segoe UI, Roboto, sans-serif' }}>
        <style>{styles}</style>

        {siteContent.heroImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${siteContent.heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-teal-900 via-teal-800/50 to-transparent" />
          </div>
        )}

        <div className="relative z-20 min-h-screen flex flex-col items-center justify-center p-4">
          {currentPage === 'login' ? (
            <div className="text-center max-w-md w-full space-y-16">
              <div className="space-y-6 fade-in">
                <p className="text-sm uppercase tracking-widest text-rose-300 font-light">Wedding Invitation</p>
                <h1 className="text-7xl text-white font-light leading-tight script-font" style={{ fontWeight: 400 }}>
                  {siteContent.coupleNames.split(' & ')[0]}
                </h1>
                <p className="text-amber-300 text-sm font-light">and</p>
                <h1 className="text-7xl text-white font-light leading-tight script-font" style={{ fontWeight: 400 }}>
                  {siteContent.coupleNames.split(' & ')[1]}
                </h1>
              </div>

              <p className="text-white/80 text-sm font-light leading-relaxed">Please enter your name and password to view the invitation.</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <input 
                  type="text" 
                  value={loginData.name}
                  onChange={(e) => setLoginData({...loginData, name: e.target.value})}
                  placeholder="Name"
                  className="w-full bg-white/20 border-2 border-white/40 rounded-full px-6 py-3 text-white placeholder-white/60 text-center text-sm focus:outline-none focus:ring-2 focus:ring-white/60 backdrop-blur-sm"
                  required
                />
                <input 
                  type="password" 
                  value={loginData.code}
                  onChange={(e) => setLoginData({...loginData, code: e.target.value})}
                  placeholder="Password"
                  className="w-full bg-white/20 border-2 border-white/40 rounded-full px-6 py-3 text-white placeholder-white/60 text-center font-mono text-sm focus:outline-none focus:ring-2 focus:ring-white/60 backdrop-blur-sm"
                  required
                />
                <button 
                  type="submit"
                  className="w-full bg-amber-400 hover:bg-amber-500 border-2 border-amber-600 text-teal-900 font-light py-3 rounded-full transition text-sm uppercase tracking-wider">
                  Enter
                </button>
              </form>

              <button
                onClick={() => setCurrentPage('admin')}
                className="text-white/60 hover:text-white text-xs font-light transition">
                🔐 Admin
              </button>
            </div>
          ) : (
            <div className="text-center max-w-md w-full space-y-8">
              <h2 className="text-3xl font-light text-white">Admin Login</h2>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-white/20 border-2 border-white/40 rounded-full px-6 py-3 text-white placeholder-white/60 text-center text-sm focus:outline-none focus:ring-2 focus:ring-white/60 backdrop-blur-sm"
                  required
                />
                <button 
                  type="submit"
                  className="w-full bg-amber-400 hover:bg-amber-500 border-2 border-amber-600 text-teal-900 font-light py-3 rounded-full transition text-sm">
                  Anmelden
                </button>
              </form>
              <button
                onClick={() => setCurrentPage('login')}
                className="text-white/60 hover:text-white text-sm font-light">
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
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 relative" style={{ fontFamily: 'Segoe UI, Roboto, sans-serif' }}>
      <style>{styles}</style>

      {/* Background Image - überall, aber verschwommen außer auf Home */}
      <div className={`fixed inset-0 bg-cover bg-center z-0 pointer-events-none transition-all duration-500 ${
        currentPage === 'home' ? 'opacity-30 blur-0' : 'opacity-15 blur-md'
      }`}
        style={{ backgroundImage: siteContent.heroImage ? `url(${siteContent.heroImage})` : 'none' }}
      />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-teal-900/80 backdrop-blur-md border-b-2 border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentPage('home')}
              className="text-2xl hover:opacity-80 transition">✨</button>
            <span className="hidden sm:block text-white font-light text-sm">{getPageTitle()}</span>
          </div>
          
          <button 
            className="text-white hover:opacity-80"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="bg-teal-900/95 backdrop-blur-md border-t-2 border-white/20 p-4 space-y-3">
            {['home', 'timeline', 'rsvp', 'faq', 'fotos'].map(page => {
              const isAvailable = page === 'home' || canAccessTab(page);
              const showLocked = !isAvailable;
              
              return (
                <button 
                  key={page}
                  onClick={() => { 
                    if (isAvailable) {
                      setCurrentPage(page); 
                      setMobileMenuOpen(false);
                    }
                  }}
                  className={`block w-full text-left py-2 text-sm font-light ${
                    isAvailable 
                      ? 'text-white hover:text-amber-300' 
                      : 'text-white/40'
                  }`}>
                  {page === 'home' ? '🏠 Home' : page === 'timeline' ? '⏰ Ablauf' : page === 'rsvp' ? '💌 RSVP' : page === 'faq' ? '❓ FAQ' : '📸 Fotos'}
                  {showLocked && <span className="text-xs text-white/30 ml-2">(bald sichtbar)</span>}
                </button>
              );
            })}
            {userRole === 'admin' && (
              <button 
                onClick={() => { setCurrentPage('admin'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 text-white hover:text-amber-300 text-sm font-light">
                ⚙️ Admin
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="block w-full text-left py-2 text-white/60 hover:text-white text-sm border-t-2 border-white/20 pt-3 mt-3 font-light">
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
            <div className="relative h-screen overflow-hidden bg-gradient-to-b from-teal-800/40 to-teal-900">
              {userRole === 'admin' && (
                <button 
                  onClick={() => setEditingSection(editingSection === 'hero' ? null : 'hero')}
                  className="absolute top-20 right-4 bg-amber-400 hover:bg-amber-500 text-teal-900 p-3 rounded-lg transition z-20">
                  {editingSection === 'hero' ? <Save size={20} /> : <Edit2 size={20} />}
                </button>
              )}

              {editingSection === 'hero' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-30">
                  <div className="bg-teal-900 rounded-lg p-6 max-w-sm w-full space-y-4 border-2 border-white/30">
                    <input 
                      type="file"
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="w-full text-sm text-white/70"
                    />
                    <button 
                      onClick={() => setEditingSection(null)}
                      className="w-full bg-amber-400 hover:bg-amber-500 text-teal-900 py-2 rounded-lg text-sm">
                      Fertig
                    </button>
                  </div>
                </div>
              )}

              {/* Invitation Card */}
              <div className="absolute inset-0 flex items-center justify-center px-4">
                <div className="max-w-2xl w-full bg-teal-900/70 backdrop-blur-md border-2 border-white/30 rounded-2xl p-12 text-center space-y-8 fade-in shadow-2xl">
                  {userRole === 'admin' && (
                    <button 
                      onClick={() => setEditingSection(editingSection === 'card' ? null : 'card')}
                      className="absolute top-6 right-6 bg-amber-400 hover:bg-amber-500 text-teal-900 p-2 rounded-lg transition">
                      {editingSection === 'card' ? <Save size={20} /> : <Edit2 size={20} />}
                    </button>
                  )}

                  {editingSection === 'card' ? (
                    <div className="space-y-6">
                      <input 
                        type="text"
                        value={siteContent.coupleNames}
                        onChange={(e) => updateContent('coupleNames', e.target.value)}
                        className="w-full bg-white/10 border-2 border-white/30 rounded px-4 py-2 text-white text-center"
                        placeholder="Namen"
                      />
                      <input 
                        type="text"
                        value={siteContent.weddingDate}
                        onChange={(e) => updateContent('weddingDate', e.target.value)}
                        className="w-full bg-white/10 border-2 border-white/30 rounded px-4 py-2 text-white text-center"
                        placeholder="Datum"
                      />
                      <input 
                        type="text"
                        value={siteContent.weddingTime}
                        onChange={(e) => updateContent('weddingTime', e.target.value)}
                        className="w-full bg-white/10 border-2 border-white/30 rounded px-4 py-2 text-white text-center"
                        placeholder="Zeit"
                      />
                      <input 
                        type="text"
                        value={siteContent.venue}
                        onChange={(e) => updateContent('venue', e.target.value)}
                        className="w-full bg-white/10 border-2 border-white/30 rounded px-4 py-2 text-white text-center"
                        placeholder="Ort"
                      />
                      <input 
                        type="text"
                        value={siteContent.address}
                        onChange={(e) => updateContent('address', e.target.value)}
                        className="w-full bg-white/10 border-2 border-white/30 rounded px-4 py-2 text-white text-center"
                        placeholder="Adresse"
                      />
                      <textarea 
                        value={siteContent.description}
                        onChange={(e) => updateContent('description', e.target.value)}
                        rows="3"
                        className="w-full bg-white/10 border-2 border-white/30 rounded px-4 py-2 text-white text-sm"
                        placeholder="Beschreibung"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-xs uppercase tracking-widest text-amber-300 font-light">Wedding Invitation</p>
                      
                      <div className="space-y-4">
                        <h1 className="text-6xl text-white font-light leading-tight script-font" style={{ fontWeight: 400 }}>
                          {siteContent.coupleNames.split(' & ')[0]}
                        </h1>
                        <p className="text-amber-300 text-sm font-light">and</p>
                        <h1 className="text-6xl text-white font-light leading-tight script-font" style={{ fontWeight: 400 }}>
                          {siteContent.coupleNames.split(' & ')[1]}
                        </h1>
                      </div>

                      <div className="border-t-2 border-white/30 pt-8 space-y-6">
                        <p className="text-white/90 font-light leading-relaxed text-sm">{siteContent.description}</p>

                        <div className="space-y-4 text-left">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-amber-300 mb-1 font-semibold">Date & Time</p>
                            <p className="text-lg text-white font-light">{siteContent.weddingDate}</p>
                            <p className="text-white/80 font-light text-sm">{siteContent.weddingTime}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs uppercase tracking-wide text-amber-300 mb-1 font-semibold">Venue</p>
                            <p className="text-lg text-white font-light">{siteContent.venue}</p>
                            <p className="text-white/80 font-light text-sm">{siteContent.address}</p>
                          </div>
                        </div>

                        <p className="text-xs text-white/60 italic">RSVP until {siteContent.rsvpDeadline}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* CTA Section */}
            {userRole && (
              <div className="bg-teal-900/50 backdrop-blur px-4 py-12">
                <div className="max-w-2xl mx-auto flex flex-col gap-4">
                  <button 
                    onClick={() => canAccessTab('rsvp') ? setCurrentPage('rsvp') : null}
                    className={`w-full border-2 py-4 rounded-lg transition font-light ${
                      canAccessTab('rsvp')
                        ? 'bg-amber-400 hover:bg-amber-500 border-amber-600 text-teal-900'
                        : 'bg-white/10 border-white/20 text-white/40 cursor-not-allowed'
                    }`}>
                    Zur Zusage {!canAccessTab('rsvp') && '(bald sichtbar)'}
                  </button>
                  <button 
                    onClick={() => canAccessTab('fotos') ? setCurrentPage('fotos') : null}
                    className={`w-full border-2 py-4 rounded-lg transition font-light ${
                      canAccessTab('fotos')
                        ? 'bg-rose-300 hover:bg-rose-400 border-rose-500 text-teal-900'
                        : 'bg-white/10 border-white/20 text-white/40 cursor-not-allowed'
                    }`}>
                    Zur Fotogalerie {!canAccessTab('fotos') && '(bald sichtbar)'}
                  </button>
                </div>
              </div>
            )}

            {/* Stats */}
            {userRole === 'admin' && (
              <div className="bg-teal-900/50 backdrop-blur px-4 py-12 border-t-2 border-white/20">
                <div className="max-w-2xl mx-auto grid grid-cols-3 gap-4">
                  {[
                    { label: 'Zusagen', value: attendingCount },
                    { label: 'Gäste', value: guestList.length },
                    { label: 'Fragen', value: faqList.length }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-teal-900/70 border-2 border-white/20 rounded-lg p-6 text-center shadow-sm">
                      <p className="text-xs text-amber-300 uppercase mb-2 font-semibold">{stat.label}</p>
                      <p className="text-3xl font-light text-white">{stat.value}</p>
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
              <h2 className="text-3xl font-light text-white script-font" style={{ fontWeight: 400 }}>Ablauf</h2>
              {userRole === 'admin' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const newItem = { time: '', event: '', subItems: [] };
                      const updated = [...siteContent.timeline, newItem];
                      updateContent('timeline', updated);
                    }}
                    className="text-amber-300 hover:text-amber-400">
                    <Plus size={20} />
                  </button>
                  <button 
                    onClick={() => setEditingSection(editingSection === 'timeline' ? null : 'timeline')}
                    className="text-amber-300 hover:text-amber-400">
                    {editingSection === 'timeline' ? <Save size={20} /> : <Edit2 size={20} />}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {siteContent.timeline.map((item, idx) => (
                <div key={idx} className="bg-teal-800/50 border-2 border-white/20 rounded-lg overflow-hidden">
                  {editingSection === 'timeline' ? (
                    <div className="p-6 space-y-4">
                      <div className="flex gap-4">
                        <input 
                          type="text"
                          value={item.time}
                          onChange={(e) => {
                            const updated = siteContent.timeline.map((i, i2) => i2 === idx ? {...i, time: e.target.value} : i);
                            updateContent('timeline', updated);
                          }}
                          className="w-24 bg-white/10 border-2 border-white/20 rounded px-2 py-1 font-mono text-sm text-white"
                          placeholder="Zeit"
                        />
                        <input 
                          type="text"
                          value={item.event}
                          onChange={(e) => {
                            const updated = siteContent.timeline.map((i, i2) => i2 === idx ? {...i, event: e.target.value} : i);
                            updateContent('timeline', updated);
                          }}
                          className="flex-1 bg-white/10 border-2 border-white/20 rounded px-2 py-1 text-sm text-white"
                          placeholder="Event"
                        />
                        <button 
                          onClick={() => {
                            const updated = siteContent.timeline.filter((_, i2) => i2 !== idx);
                            updateContent('timeline', updated);
                          }}
                          className="text-red-400 hover:text-red-300">
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="ml-4 space-y-2 border-t-2 border-white/20 pt-4">
                        <p className="text-xs text-amber-300 uppercase font-semibold">Unterpunkte</p>
                        {item.subItems && item.subItems.map((sub, subIdx) => (
                          <div key={subIdx} className="flex gap-2">
                            <input 
                              type="text"
                              value={sub}
                              onChange={(e) => {
                                const newSubs = item.subItems.map((s, si) => si === subIdx ? e.target.value : s);
                                const updated = siteContent.timeline.map((i, i2) => i2 === idx ? {...i, subItems: newSubs} : i);
                                updateContent('timeline', updated);
                              }}
                              className="flex-1 bg-white/10 border-2 border-white/20 rounded px-2 py-1 text-sm text-white"
                              placeholder="Unterpunkt"
                            />
                            <button 
                              onClick={() => {
                                const newSubs = item.subItems.filter((_, si) => si !== subIdx);
                                const updated = siteContent.timeline.map((i, i2) => i2 === idx ? {...i, subItems: newSubs} : i);
                                updateContent('timeline', updated);
                              }}
                              className="text-red-400 hover:text-red-300">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const newSubs = [...(item.subItems || []), ''];
                            const updated = siteContent.timeline.map((i, i2) => i2 === idx ? {...i, subItems: newSubs} : i);
                            updateContent('timeline', updated);
                          }}
                          className="text-amber-300 hover:text-amber-400 text-sm flex items-center gap-1">
                          <Plus size={14} /> Unterpunkt hinzufügen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => item.subItems && item.subItems.length > 0 && setExpandedTimeline(expandedTimeline === idx ? null : idx)}
                      className={`p-6 flex gap-6 ${item.subItems && item.subItems.length > 0 ? 'cursor-pointer hover:bg-teal-700/50 transition' : 'cursor-default'}`}>
                      <p className="font-mono text-amber-300 w-20">{item.time}</p>
                      <div className="flex-1">
                        <p className="text-white/90 font-light">{item.event}</p>
                        {item.subItems && item.subItems.length > 0 && expandedTimeline === idx && (
                          <div className="mt-4 space-y-2 border-t-2 border-white/20 pt-4">
                            {item.subItems.map((sub, subIdx) => (
                              <p key={subIdx} className="text-white/70 text-sm font-light ml-4">• {sub}</p>
                            ))}
                          </div>
                        )}
                      </div>
                      {item.subItems && item.subItems.length > 0 && (
                        <ChevronDown size={20} className={`text-amber-300/60 transition ${expandedTimeline === idx ? 'rotate-180' : ''}`} />
                      )}
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
            <h2 className="text-3xl font-light text-white script-font" style={{ fontWeight: 400 }}>Zusage</h2>

            {rsvpData.length > 0 && (
              <div className="bg-teal-800/50 border-2 border-white/20 rounded-lg p-8 space-y-6">
                <h3 className="text-xl font-light text-white">Übersicht (anonym)</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-teal-900/70 rounded-lg p-6 text-center border-2 border-white/20">
                    <p className="text-sm text-amber-300 uppercase mb-2 font-semibold">Zusagen</p>
                    <p className="text-4xl font-light text-white">{attendingCount}</p>
                  </div>
                  <div className="bg-teal-900/70 rounded-lg p-6 text-center border-2 border-white/20">
                    <p className="text-sm text-amber-300 uppercase mb-2 font-semibold">Absagen</p>
                    <p className="text-4xl font-light text-white">{rsvpData.filter(r => r.attending === false).length}</p>
                  </div>
                  <div className="bg-teal-900/70 rounded-lg p-6 text-center border-2 border-white/20">
                    <p className="text-sm text-amber-300 uppercase mb-2 font-semibold">Erwachsene</p>
                    <p className="text-4xl font-light text-white">{totalAdults}</p>
                  </div>
                  <div className="bg-teal-900/70 rounded-lg p-6 text-center border-2 border-white/20">
                    <p className="text-sm text-amber-300 uppercase mb-2 font-semibold">Kinder</p>
                    <p className="text-4xl font-light text-white">{totalChildren}</p>
                  </div>
                </div>
              </div>
            )}

            {userRole === 'admin' && (
              <div className="bg-teal-800/50 border-2 border-white/20 rounded-lg p-8 space-y-6">
                <h3 className="text-xl font-light text-white">Gäste Details</h3>
                <div className="space-y-3">
                  {guestList.map(guest => {
                    const rsvp = rsvpData.find(r => r.guestCode === guest.password);
                    return (
                      <div key={guest.id} className="bg-teal-900/70 rounded-lg p-4 border-2 border-white/20">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-light text-white">{guest.name}</p>
                            <p className="text-xs text-amber-300 font-mono mt-1">{guest.password}</p>
                          </div>
                          {rsvp ? (
                            <div className="text-right">
                              <span className={`text-sm font-semibold ${rsvp.attending ? 'text-green-400' : 'text-red-400'}`}>
                                {rsvp.attending ? '✓ Zusage' : '✗ Absage'}
                              </span>
                              {rsvp.attending && (
                                <div className="text-xs text-white/70 mt-2">
                                  <p>{rsvp.adults} Erwachsene</p>
                                  <p>{rsvp.children} Kinder</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-rose-400 font-semibold">⏳ Ausstehend</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!rsvpData.find(r => r.guestCode === userCode) && userRole === 'guest' && (
              <form onSubmit={handleRsvp} className="space-y-8">
                <div>
                  <p className="font-light text-white/90 mb-4">Kommst du?</p>
                  <div className="space-y-2">
                    {[true, false].map(val => (
                      <label key={val} className="flex items-center p-4 bg-teal-800/50 rounded-lg cursor-pointer hover:bg-teal-700/50 transition border-2 border-white/20">
                        <input 
                          type="radio" 
                          checked={rsvpForm.attending === val}
                          onChange={() => setRsvpForm({...rsvpForm, attending: val})}
                          className="mr-3"
                        />
                        <span className="text-white/90">{val ? 'Ja, gerne' : 'Leider nein'}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {rsvpForm.attending && (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Erwachsene', key: 'adults' },
                      { label: 'Kinder (0-14)', key: 'children' }
                    ].map(field => (
                      <div key={field.key}>
                        <label className="block text-xs text-amber-300 uppercase mb-2 font-semibold">{field.label}</label>
                        <input 
                          type="number" 
                          min={field.key === 'children' ? 0 : 1}
                          value={rsvpForm[field.key]}
                          onChange={(e) => setRsvpForm({...rsvpForm, [field.key]: parseInt(e.target.value)})}
                          className="w-full bg-white/10 border-2 border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/40"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-amber-400 hover:bg-amber-500 text-teal-900 border-2 border-amber-600 py-4 rounded-lg transition font-light">
                  Speichern
                </button>
              </form>
            )}

            {rsvpData.find(r => r.guestCode === userCode) && userRole === 'guest' && (
              <div className="bg-green-900/40 border-2 border-green-500/60 rounded-lg p-6 text-center">
                <p className="text-green-300 font-light">✓ Danke für deine Zusage!</p>
              </div>
            )}
          </div>
        )}

        {/* FAQ */}
        {currentPage === 'faq' && canAccessTab('faq') && (
          <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
            <h2 className="text-3xl font-light text-white script-font" style={{ fontWeight: 400 }}>FAQ</h2>

            <form onSubmit={handleAddFaq} className="bg-teal-800/50 border-2 border-white/20 rounded-lg p-6">
              <p className="text-sm text-amber-300 uppercase mb-4 font-semibold">Deine Frage</p>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                  placeholder="Frage stellen..."
                  className="flex-1 bg-white/10 border-2 border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
                />
                <button className="bg-amber-400 hover:bg-amber-500 text-teal-900 px-6 py-3 rounded-lg transition">
                  <Plus size={20} />
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {faqList.map(faq => {
                const canDelete = userRole === 'admin' || (userRole === 'guest' && faq.author === userName && faq.isFromGuest);
                return (
                  <div key={faq.id} className="bg-teal-800/50 border-2 border-white/20 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedTimeline(expandedTimeline === faq.id ? null : faq.id)}
                      className="w-full p-6 flex justify-between items-start hover:bg-teal-700/50 transition cursor-pointer">
                      <div className="text-left flex-1">
                        <p className="font-light text-white">{faq.question}</p>
                        <p className="text-xs text-amber-300 mt-2 font-semibold">{faq.isFromGuest ? 'Gast Frage' : 'Admin'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {canDelete && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFaq(faq.id);
                            }}
                            className="text-red-400 hover:text-red-300">
                            <Trash2 size={18} />
                          </button>
                        )}
                        <ChevronDown size={20} className={`text-amber-300/60 transition ${expandedTimeline === faq.id ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {expandedTimeline === faq.id && (
                      <div className="border-t-2 border-white/20 p-6 space-y-4 bg-teal-900/50">
                        {userRole === 'admin' && !faq.answer ? (
                          <textarea 
                            defaultValue={faq.answer}
                            onBlur={(e) => updateFaqAnswer(faq.id, e.target.value)}
                            placeholder="Antwort eingeben..."
                            rows="3"
                            className="w-full bg-white/10 border-2 border-white/20 rounded px-3 py-2 text-sm text-white placeholder-white/50"
                          />
                        ) : (
                          <div>
                            <p className="text-white/90 text-sm font-light mb-3">{faq.answer || 'Noch keine Antwort'}</p>
                            {userRole === 'admin' && faq.answer && (
                              <button
                                onClick={() => {
                                  const newAnswer = prompt('Antwort bearbeiten:', faq.answer);
                                  if (newAnswer !== null) updateFaqAnswer(faq.id, newAnswer);
                                }}
                                className="text-amber-300 hover:text-amber-400 text-sm font-light">
                                ✏️ Bearbeiten
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FOTOS */}
        {currentPage === 'fotos' && canAccessTab('fotos') && (
          <div className="max-w-2xl mx-auto px-4 py-16 space-y-12">
            <h2 className="text-3xl font-light text-white script-font" style={{ fontWeight: 400 }}>Fotogalerie</h2>

            {userRole === 'admin' && (
              <div className="bg-teal-800/50 border-2 border-white/20 rounded-lg p-8 space-y-6">
                <h3 className="text-xl font-light text-white">Google Drive Link</h3>
                <input 
                  type="text"
                  value={siteContent.googleDriveLink}
                  onChange={(e) => updateContent('googleDriveLink', e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-white/10 border-2 border-white/20 rounded-lg px-4 py-3 text-sm font-mono text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
                />
                
                <h3 className="text-xl font-light text-white pt-4 border-t-2 border-white/20">Anleitung für Gäste</h3>
                <textarea 
                  value={siteContent.googleDriveUploadLink}
                  onChange={(e) => updateContent('googleDriveUploadLink', e.target.value)}
                  rows="4"
                  placeholder="Wie laden Gäste Fotos hoch?"
                  className="w-full bg-white/10 border-2 border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
                />
              </div>
            )}

            {userRole !== 'admin' && (
              siteContent.googleDriveLink ? (
                <div className="bg-rose-900/40 border-2 border-rose-400/50 rounded-lg p-8 space-y-6 text-center">
                  {siteContent.googleDriveUploadLink && (
                    <div className="bg-teal-900/70 rounded-lg p-6 border-2 border-white/20">
                      <h3 className="text-lg font-light text-white mb-4">Fotos hochladen</h3>
                      <p className="text-white/90 text-sm font-light whitespace-pre-line">{siteContent.googleDriveUploadLink}</p>
                    </div>
                  )}
                  <a 
                    href={siteContent.googleDriveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-rose-400 hover:bg-rose-500 text-teal-900 border-2 border-rose-600 px-12 py-4 rounded-lg transition font-light">
                    Zur Google Drive Galerie →
                  </a>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-white/60 font-light">Admin: Bitte Google Drive Link hinzufügen</p>
                </div>
              )
            )}
          </div>
        )}

        {/* ADMIN */}
        {currentPage === 'admin' && userRole === 'admin' && (
          <div className="max-w-2xl mx-auto px-4 py-16 space-y-12">
            <h2 className="text-3xl font-light text-white script-font" style={{ fontWeight: 400 }}>Admin</h2>

            <div className="flex gap-4 border-b-2 border-white/20 flex-wrap">
              {['guests', 'overview', 'freigabe', 'einstellungen'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setAdminTab(tab)}
                  className={`py-3 px-4 font-light text-sm transition ${adminTab === tab ? 'text-amber-300 border-b-2 border-amber-400' : 'text-white/60 hover:text-white'}`}>
                  {tab === 'guests' ? 'Gäste' : tab === 'overview' ? 'Übersicht' : tab === 'freigabe' ? 'Reiter Freigabe' : 'Einstellungen'}
                </button>
              ))}
            </div>

            {/* Guests Tab */}
            {adminTab === 'guests' && (
              <div className="space-y-6">
                <form onSubmit={handleAddGuest} className="flex gap-2 flex-wrap">
                  <input 
                    type="text"
                    value={newGuestData.name}
                    onChange={(e) => setNewGuestData({...newGuestData, name: e.target.value})}
                    placeholder="Name"
                    className="flex-1 min-w-32 bg-white/10 border-2 border-white/20 rounded-lg px-4 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
                    required
                  />
                  <input 
                    type="text"
                    value={newGuestData.password}
                    onChange={(e) => setNewGuestData({...newGuestData, password: e.target.value})}
                    placeholder="Password"
                    className="flex-1 min-w-32 bg-white/10 border-2 border-white/20 rounded-lg px-4 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
                    required
                  />
                  <button className="bg-amber-400 text-teal-900 px-4 py-2 rounded-lg hover:bg-amber-500 transition">
                    <Plus size={18} />
                  </button>
                </form>

                <div className="space-y-2">
                  {guestList.map(guest => (
                    <div key={guest.id}>
                      {editingGuestId === guest.id ? (
                        <div className="flex gap-2 p-3 bg-teal-800/50 border-2 border-white/20 rounded-lg">
                          <input 
                            type="text"
                            value={editingGuestData.name}
                            onChange={(e) => setEditingGuestData({...editingGuestData, name: e.target.value})}
                            className="flex-1 bg-white/10 border-2 border-white/20 rounded px-2 py-1 text-sm text-white"
                          />
                          <input 
                            type="text"
                            value={editingGuestData.password}
                            onChange={(e) => setEditingGuestData({...editingGuestData, password: e.target.value})}
                            className="flex-1 bg-white/10 border-2 border-white/20 rounded px-2 py-1 text-sm text-white"
                          />
                          <button 
                            onClick={() => handleUpdateGuest(guest.id)}
                            className="text-amber-300 hover:text-amber-400">
                            <Save size={16} />
                          </button>
                          <button 
                            onClick={() => setEditingGuestId(null)}
                            className="text-red-400 hover:text-red-300">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-teal-800/50 border-2 border-white/20 rounded-lg text-sm">
                          <div>
                            <p className="text-white">{guest.name}</p>
                            <p className="text-amber-300 font-mono text-xs">{guest.password}</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setEditingGuestId(guest.id);
                                setEditingGuestData({name: guest.name, password: guest.password});
                              }}
                              className="text-amber-300 hover:text-amber-400">
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(guest.password);
                                alert('✓ Password kopiert');
                              }}
                              className="text-white/60 hover:text-white">
                              <Copy size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteGuest(guest.id)}
                              className="text-red-400 hover:text-red-300">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overview Tab */}
            {adminTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-teal-900/70 rounded-lg p-6 text-center border-2 border-white/20">
                    <p className="text-sm text-amber-300 uppercase mb-2 font-semibold">Gesamt Zusagen</p>
                    <p className="text-4xl font-light text-white">{attendingCount}</p>
                  </div>
                  <div className="bg-teal-900/70 rounded-lg p-6 text-center border-2 border-white/20">
                    <p className="text-sm text-amber-300 uppercase mb-2 font-semibold">Absagen</p>
                    <p className="text-4xl font-light text-white">{rsvpData.filter(r => r.attending === false).length}</p>
                  </div>
                  <div className="bg-teal-900/70 rounded-lg p-6 text-center border-2 border-white/20">
                    <p className="text-sm text-amber-300 uppercase mb-2 font-semibold">Erwachsene</p>
                    <p className="text-4xl font-light text-white">{totalAdults}</p>
                  </div>
                  <div className="bg-teal-900/70 rounded-lg p-6 text-center border-2 border-white/20">
                    <p className="text-sm text-amber-300 uppercase mb-2 font-semibold">Kinder</p>
                    <p className="text-4xl font-light text-white">{totalChildren}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Freigabe Tab */}
            {adminTab === 'freigabe' && (
              <div className="space-y-6">
                <p className="text-sm text-white/70 font-light">Aktiviere die Reiter, die Gäste sehen sollen:</p>
                <div className="space-y-3">
                  {['timeline', 'rsvp', 'faq', 'fotos'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => toggleTabAvailability(tab)}
                      className={`w-full p-4 rounded-lg border-2 font-light text-left transition ${
                        siteContent.tabAvailability[tab]
                          ? 'bg-teal-800/50 border-white/30 text-white'
                          : 'bg-teal-900/30 border-white/10 text-white/60'
                      }`}>
                      <div className="flex items-center justify-between">
                        <span>
                          {tab === 'timeline' ? '⏰ Ablauf' : tab === 'rsvp' ? '💌 RSVP' : tab === 'faq' ? '❓ FAQ' : '📸 Fotos'}
                        </span>
                        <span className="text-sm">
                          {siteContent.tabAvailability[tab] ? '✓ Freigegeben' : '🔒 Gesperrt'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Einstellungen Tab */}
            {adminTab === 'einstellungen' && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-light text-white">Admin Passwort ändern</h3>
                  <div className="space-y-3">
                    <input 
                      type="password"
                      placeholder="Aktuelles Passwort"
                      id="currentPw"
                      className="w-full bg-white/10 border-2 border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
                    />
                    <input 
                      type="password"
                      placeholder="Neues Passwort"
                      id="newPw"
                      className="w-full bg-white/10 border-2 border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
                    />
                    <button 
                      onClick={() => {
                        const currentPw = document.getElementById('currentPw').value;
                        const newPw = document.getElementById('newPw').value;
                        if (!currentPw || !newPw) {
                          alert('Bitte beide Felder ausfüllen');
                          return;
                        }
                        if (currentPw !== siteContent.adminPassword && currentPw !== BACKUP_ADMIN_PASSWORD) {
                          alert('Aktuelles Passwort falsch');
                          return;
                        }
                        updateContent('adminPassword', newPw);
                        document.getElementById('currentPw').value = '';
                        document.getElementById('newPw').value = '';
                        alert('✓ Passwort geändert!');
                      }}
                      className="w-full bg-amber-400 hover:bg-amber-500 text-teal-900 border-2 border-amber-600 py-3 rounded-lg transition font-light">
                      Passwort ändern
                    </button>
                  </div>
                  <p className="text-xs text-white/50 italic">Backup-Passwort: nur im Code gespeichert</p>
                </div>

                <div className="border-t-2 border-white/20 pt-8 space-y-4">
                  <h3 className="text-lg font-light text-white">Infos</h3>
                  <div className="bg-teal-800/50 border-2 border-white/20 rounded-lg p-6 space-y-3">
                    <p className="text-sm text-white/80"><span className="text-amber-300 font-semibold">Gäste:</span> {guestList.length}</p>
                    <p className="text-sm text-white/80"><span className="text-amber-300 font-semibold">RSVP erhalten:</span> {rsvpData.length}</p>
                    <p className="text-sm text-white/80"><span className="text-amber-300 font-semibold">Fragen:</span> {faqList.length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 bg-teal-900/50 border-t-2 border-white/20 py-8 text-center text-white/50 text-xs font-light mt-20">
        <p>Hochzeitswebseite • Alle Daten sind lokal sicher</p>
      </footer>
    </div>
  );
}
