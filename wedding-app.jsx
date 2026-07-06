import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, Edit2, Save, Plus, Trash2, Copy, ChevronDown } from 'lucide-react';

export default function HochzeitsApp() {
  const [currentPage, setCurrentPage] = useState('login');
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userCode, setUserCode] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
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
    googleDriveUploadLink: ''
  });

  const [loginData, setLoginData] = useState({ name: '', code: '' });
  const [adminPassword, setAdminPassword] = useState('');
  const [newGuestData, setNewGuestData] = useState({ name: '', email: '' });
  const [rsvpForm, setRsvpForm] = useState({ attending: null, adults: 1, children: 0 });
  const [newFaqQuestion, setNewFaqQuestion] = useState('');

  useEffect(() => {
    const saved = {
      guests: localStorage.getItem('hochzeitsGaesteListe'),
      rsvp: localStorage.getItem('hochzeitsRSVP'),
      content: localStorage.getItem('hochzeitsContent'),
      faq: localStorage.getItem('hochzeitsFAQ')
    };
    if (saved.guests) setGuestList(JSON.parse(saved.guests));
    if (saved.rsvp) setRsvpData(JSON.parse(saved.rsvp));
    if (saved.content) setSiteContent(JSON.parse(saved.content));
    if (saved.faq) setFaqList(JSON.parse(saved.faq));
    
    setTimeout(() => setHeroImageLoaded(true), 100);
  }, []);

  const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));
  const updateContent = (key, value) => {
    const updated = { ...siteContent, [key]: value };
    setSiteContent(updated);
    save('hochzeitsContent', updated);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const guest = guestList.find(g => g.name.toLowerCase() === loginData.name.toLowerCase() && g.code === loginData.code);
    if (guest) {
      setUserCode(guest.code);
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
    if (adminPassword === 'Hochzeit2024') {
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
    setHeroImageLoaded(false);
  };

  const handleAddGuest = (e) => {
    e.preventDefault();
    if (!newGuestData.name) return;
    const code = 'GAST' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newGuest = { id: Date.now(), name: newGuestData.name, email: newGuestData.email, code };
    const updated = [...guestList, newGuest];
    setGuestList(updated);
    save('hochzeitsGaesteListe', updated);
    setNewGuestData({ name: '', email: '' });
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
    const guest = guestList.find(g => g.code === userCode);
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
  `;

  // ===== LOGIN =====
  if (!userRole) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden" style={{ fontFamily: 'Segoe UI, Roboto, sans-serif' }}>
        <style>{styles}</style>

        {siteContent.heroImage && (
          <div 
            className={`absolute inset-0 bg-cover bg-center ${heroImageLoaded ? 'fade-in' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${siteContent.heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
        )}

        <div className="relative z-20 min-h-screen flex flex-col items-center justify-center p-4">
          {currentPage === 'login' ? (
            <div className="text-center max-w-md w-full space-y-16">
              <div className="space-y-6 fade-in">
                <p className="text-sm uppercase tracking-widest text-amber-100/90 font-light">Wedding Invitation</p>
                <h1 className="text-7xl text-white font-light leading-tight mb-3 script-font" style={{ fontWeight: 400 }}>
                  {siteContent.coupleNames.split(' & ')[0]}
                </h1>
                <p className="text-amber-100/70 text-sm font-light">and</p>
                <h1 className="text-7xl text-white font-light leading-tight script-font" style={{ fontWeight: 400 }}>
                  {siteContent.coupleNames.split(' & ')[1]}
                </h1>
              </div>

              <p className="text-amber-100/80 text-sm font-light leading-relaxed">Please enter your name and code to view the invitation.</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <input 
                  type="text" 
                  value={loginData.name}
                  onChange={(e) => setLoginData({...loginData, name: e.target.value})}
                  placeholder="Name"
                  className="w-full bg-white/10 border border-amber-100/40 rounded-full px-6 py-3 text-white placeholder-white/50 text-center text-sm focus:outline-none focus:ring-2 focus:ring-amber-100/60 backdrop-blur-sm"
                  required
                />
                <input 
                  type="text" 
                  value={loginData.code}
                  onChange={(e) => setLoginData({...loginData, code: e.target.value.toUpperCase()})}
                  placeholder="Code"
                  className="w-full bg-white/10 border border-amber-100/40 rounded-full px-6 py-3 text-white placeholder-white/50 text-center font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-100/60 backdrop-blur-sm"
                  required
                />
                <button 
                  type="submit"
                  className="w-full bg-amber-100/20 hover:bg-amber-100/30 border border-amber-100/50 text-white font-light py-3 rounded-full transition text-sm uppercase tracking-wider backdrop-blur-sm">
                  Enter
                </button>
              </form>

              <button
                onClick={() => setCurrentPage('admin')}
                className="text-amber-100/40 hover:text-amber-100/70 text-xs font-light transition">
                🔐 Admin
              </button>
            </div>
          ) : (
            <div className="text-center max-w-md w-full space-y-8">
              <h2 className="text-3xl font-light text-white">Admin</h2>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Passwort"
                  className="w-full bg-white/10 border border-amber-100/40 rounded-full px-6 py-3 text-white placeholder-white/50 text-center text-sm focus:outline-none focus:ring-2 focus:ring-amber-100/60 backdrop-blur-sm"
                  required
                />
                <button 
                  type="submit"
                  className="w-full bg-amber-100/20 hover:bg-amber-100/30 border border-amber-100/50 text-white font-light py-3 rounded-full transition text-sm backdrop-blur-sm">
                  Anmelden
                </button>
              </form>
              <button
                onClick={() => setCurrentPage('login')}
                className="text-amber-100/40 hover:text-amber-100/70 text-sm font-light">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black" style={{ fontFamily: 'Segoe UI, Roboto, sans-serif' }}>
      <style>{styles}</style>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-amber-100/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={() => setCurrentPage('home')}
            className="text-2xl text-white/80 hover:text-white transition">✨</button>
          
          <button 
            className="text-white/80 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="bg-black/80 backdrop-blur-md border-t border-amber-100/10 p-4 space-y-3">
            {['home', 'timeline', 'rsvp', 'faq', 'fotos'].map(page => (
              <button 
                key={page}
                onClick={() => { setCurrentPage(page); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 text-white/70 hover:text-white text-sm font-light">
                {page === 'home' ? '🏠 Home' : page === 'timeline' ? '⏰ Ablauf' : page === 'rsvp' ? '💌 RSVP' : page === 'faq' ? '❓ FAQ' : '📸 Fotos'}
              </button>
            ))}
            {userRole === 'admin' && (
              <button 
                onClick={() => { setCurrentPage('admin'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 text-white/70 hover:text-white text-sm font-light">
                ⚙️ Admin
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="block w-full text-left py-2 text-white/50 hover:text-white/70 text-sm border-t border-amber-100/10 pt-3 mt-3 font-light">
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* CONTENT */}
      <div className="pt-20">
        {/* HOME */}
        {currentPage === 'home' && (
          <div className="space-y-0">
            {/* Hero */}
            <div className="relative h-screen overflow-hidden bg-gradient-to-b from-amber-950/40 to-black">
              {siteContent.heroImage ? (
                <img 
                  src={siteContent.heroImage} 
                  alt="Hero" 
                  className="w-full h-full object-cover opacity-40 fade-in"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 to-black" />
              )}

              {userRole === 'admin' && (
                <button 
                  onClick={() => setEditingSection(editingSection === 'hero' ? null : 'hero')}
                  className="absolute top-20 right-4 bg-amber-900/50 hover:bg-amber-900/70 text-white p-3 rounded-lg transition z-20">
                  {editingSection === 'hero' ? <Save size={20} /> : <Edit2 size={20} />}
                </button>
              )}

              {editingSection === 'hero' && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4 z-30">
                  <div className="bg-slate-900 rounded-lg p-6 max-w-sm w-full space-y-4 border border-amber-100/20">
                    <input 
                      type="file"
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="w-full text-sm text-white/70"
                    />
                    <button 
                      onClick={() => setEditingSection(null)}
                      className="w-full bg-amber-900 text-white py-2 rounded-lg text-sm">
                      Fertig
                    </button>
                  </div>
                </div>
              )}

              {/* Invitation Card */}
              <div className="absolute inset-0 flex items-center justify-center px-4">
                <div className="max-w-2xl w-full bg-black/50 backdrop-blur-md border border-amber-100/20 rounded-2xl p-12 text-center space-y-8 fade-in">
                  {userRole === 'admin' && (
                    <button 
                      onClick={() => setEditingSection(editingSection === 'card' ? null : 'card')}
                      className="absolute top-6 right-6 bg-amber-900/50 hover:bg-amber-900/70 text-white p-2 rounded-lg transition">
                      {editingSection === 'card' ? <Save size={20} /> : <Edit2 size={20} />}
                    </button>
                  )}

                  {editingSection === 'card' ? (
                    <div className="space-y-6">
                      <input 
                        type="text"
                        value={siteContent.coupleNames}
                        onChange={(e) => updateContent('coupleNames', e.target.value)}
                        className="w-full bg-white/10 border border-amber-100/20 rounded px-4 py-2 text-white text-center"
                        placeholder="Namen"
                      />
                      <input 
                        type="text"
                        value={siteContent.weddingDate}
                        onChange={(e) => updateContent('weddingDate', e.target.value)}
                        className="w-full bg-white/10 border border-amber-100/20 rounded px-4 py-2 text-white text-center"
                        placeholder="Datum"
                      />
                      <input 
                        type="text"
                        value={siteContent.weddingTime}
                        onChange={(e) => updateContent('weddingTime', e.target.value)}
                        className="w-full bg-white/10 border border-amber-100/20 rounded px-4 py-2 text-white text-center"
                        placeholder="Zeit"
                      />
                      <input 
                        type="text"
                        value={siteContent.venue}
                        onChange={(e) => updateContent('venue', e.target.value)}
                        className="w-full bg-white/10 border border-amber-100/20 rounded px-4 py-2 text-white text-center"
                        placeholder="Ort"
                      />
                      <input 
                        type="text"
                        value={siteContent.address}
                        onChange={(e) => updateContent('address', e.target.value)}
                        className="w-full bg-white/10 border border-amber-100/20 rounded px-4 py-2 text-white text-center"
                        placeholder="Adresse"
                      />
                      <textarea 
                        value={siteContent.description}
                        onChange={(e) => updateContent('description', e.target.value)}
                        rows="3"
                        className="w-full bg-white/10 border border-amber-100/20 rounded px-4 py-2 text-white text-sm"
                        placeholder="Beschreibung"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-xs uppercase tracking-widest text-amber-100/70 font-light">Wedding Invitation</p>
                      
                      <div className="space-y-4">
                        <h1 className="text-6xl text-white font-light leading-tight script-font" style={{ fontWeight: 400 }}>
                          {siteContent.coupleNames.split(' & ')[0]}
                        </h1>
                        <p className="text-amber-100/60 text-sm">and</p>
                        <h1 className="text-6xl text-white font-light leading-tight script-font" style={{ fontWeight: 400 }}>
                          {siteContent.coupleNames.split(' & ')[1]}
                        </h1>
                      </div>

                      <div className="border-t border-amber-100/20 pt-8 space-y-6">
                        <p className="text-amber-100/70 font-light leading-relaxed text-sm">{siteContent.description}</p>

                        <div className="space-y-4 text-left">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-amber-100/50 mb-1">Date & Time</p>
                            <p className="text-lg text-white font-light">{siteContent.weddingDate}</p>
                            <p className="text-amber-100/70 font-light text-sm">{siteContent.weddingTime}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs uppercase tracking-wide text-amber-100/50 mb-1">Venue</p>
                            <p className="text-lg text-white font-light">{siteContent.venue}</p>
                            <p className="text-amber-100/70 font-light text-sm">{siteContent.address}</p>
                          </div>
                        </div>

                        <p className="text-xs text-amber-100/40 italic">RSVP until {siteContent.rsvpDeadline}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* CTA Section */}
            {userRole && (
              <div className="bg-black px-4 py-12">
                <div className="max-w-2xl mx-auto flex flex-col gap-4">
                  <button 
                    onClick={() => setCurrentPage('rsvp')}
                    className="w-full bg-amber-900/40 hover:bg-amber-900/60 text-white border border-amber-100/30 py-4 rounded-lg transition font-light">
                    Zur Zusage
                  </button>
                  <button 
                    onClick={() => setCurrentPage('fotos')}
                    className="w-full bg-amber-900/20 hover:bg-amber-900/40 text-white border border-amber-100/20 py-4 rounded-lg transition font-light">
                    Zur Fotogalerie
                  </button>
                </div>
              </div>
            )}

            {/* Stats */}
            {userRole === 'admin' && (
              <div className="bg-black px-4 py-12">
                <div className="max-w-2xl mx-auto grid grid-cols-3 gap-4">
                  {[
                    { label: 'Zusagen', value: attendingCount },
                    { label: 'Gäste', value: guestList.length },
                    { label: 'Fragen', value: faqList.length }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white/5 border border-amber-100/20 rounded-lg p-6 text-center">
                      <p className="text-xs text-amber-100 uppercase mb-2">{stat.label}</p>
                      <p className="text-3xl font-light text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TIMELINE */}
        {currentPage === 'timeline' && (
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
                    className="text-white/60 hover:text-white">
                    <Plus size={20} />
                  </button>
                  <button 
                    onClick={() => setEditingSection(editingSection === 'timeline' ? null : 'timeline')}
                    className="text-white/60 hover:text-white">
                    {editingSection === 'timeline' ? <Save size={20} /> : <Edit2 size={20} />}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {siteContent.timeline.map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-amber-100/10 rounded-lg overflow-hidden">
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
                          className="w-24 bg-white/10 border border-amber-100/20 rounded px-2 py-1 font-mono text-sm text-white"
                          placeholder="Zeit"
                        />
                        <input 
                          type="text"
                          value={item.event}
                          onChange={(e) => {
                            const updated = siteContent.timeline.map((i, i2) => i2 === idx ? {...i, event: e.target.value} : i);
                            updateContent('timeline', updated);
                          }}
                          className="flex-1 bg-white/10 border border-amber-100/20 rounded px-2 py-1 text-sm text-white"
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

                      {/* Unterpunkte */}
                      <div className="ml-4 space-y-2 border-t border-amber-100/10 pt-4">
                        <p className="text-xs text-amber-100/60 uppercase">Unterpunkte</p>
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
                              className="flex-1 bg-white/10 border border-amber-100/20 rounded px-2 py-1 text-sm text-white"
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
                          className="text-amber-100/60 hover:text-amber-100 text-sm flex items-center gap-1">
                          <Plus size={14} /> Unterpunkt hinzufügen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => item.subItems && item.subItems.length > 0 && setExpandedTimeline(expandedTimeline === idx ? null : idx)}
                      className={`p-6 flex gap-6 ${item.subItems && item.subItems.length > 0 ? 'cursor-pointer hover:bg-white/10 transition' : 'cursor-default'}`}>
                      <p className="font-mono text-amber-100/70 w-20">{item.time}</p>
                      <div className="flex-1">
                        <p className="text-white/70 font-light">{item.event}</p>
                        {item.subItems && item.subItems.length > 0 && expandedTimeline === idx && (
                          <div className="mt-4 space-y-2 border-t border-amber-100/10 pt-4">
                            {item.subItems.map((sub, subIdx) => (
                              <p key={subIdx} className="text-white/50 text-sm font-light ml-4">• {sub}</p>
                            ))}
                          </div>
                        )}
                      </div>
                      {item.subItems && item.subItems.length > 0 && (
                        <ChevronDown size={20} className={`text-white/40 transition ${expandedTimeline === idx ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RSVP */}
        {currentPage === 'rsvp' && (
          <div className="max-w-2xl mx-auto px-4 py-16 space-y-12">
            <h2 className="text-3xl font-light text-white script-font" style={{ fontWeight: 400 }}>Zusage</h2>

            {/* Stats Section */}
            {rsvpData.length > 0 && (
              <div className="bg-white/5 border border-amber-100/20 rounded-lg p-8 space-y-6">
                <h3 className="text-xl font-light text-white">Übersicht (anonym)</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/10 rounded-lg p-6 text-center border border-amber-100/10">
                    <p className="text-sm text-amber-100/70 uppercase mb-2">Zusagen</p>
                    <p className="text-4xl font-light text-white">{attendingCount}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6 text-center border border-amber-100/10">
                    <p className="text-sm text-amber-100/70 uppercase mb-2">Absagen</p>
                    <p className="text-4xl font-light text-white">{rsvpData.filter(r => r.attending === false).length}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6 text-center border border-amber-100/10">
                    <p className="text-sm text-amber-100/70 uppercase mb-2">Erwachsene</p>
                    <p className="text-4xl font-light text-white">{totalAdults}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6 text-center border border-amber-100/10">
                    <p className="text-sm text-amber-100/70 uppercase mb-2">Kinder</p>
                    <p className="text-4xl font-light text-white">{totalChildren}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Admin View */}
            {userRole === 'admin' && (
              <div className="bg-white/5 border border-amber-100/20 rounded-lg p-8 space-y-6">
                <h3 className="text-xl font-light text-white">Gäste Details</h3>
                <div className="space-y-3">
                  {guestList.map(guest => {
                    const rsvp = rsvpData.find(r => r.guestCode === guest.code);
                    return (
                      <div key={guest.id} className="bg-white/10 rounded-lg p-4 border border-amber-100/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-light text-white">{guest.name}</p>
                            <p className="text-xs text-amber-100/50 font-mono mt-1">{guest.code}</p>
                          </div>
                          {rsvp ? (
                            <div className="text-right">
                              <span className={`text-sm ${rsvp.attending ? 'text-green-400' : 'text-red-400'}`}>
                                {rsvp.attending ? '✓ Zusage' : '✗ Absage'}
                              </span>
                              {rsvp.attending && (
                                <div className="text-xs text-white/50 mt-2">
                                  <p>{rsvp.adults} Erwachsene</p>
                                  <p>{rsvp.children} Kinder</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-amber-100/60">⏳ Ausstehend</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RSVP Form */}
            {!rsvpData.find(r => r.guestCode === userCode) && userRole === 'guest' && (
              <form onSubmit={handleRsvp} className="space-y-8">
                <div>
                  <p className="font-light text-white/70 mb-4">Kommst du?</p>
                  <div className="space-y-2">
                    {[true, false].map(val => (
                      <label key={val} className="flex items-center p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition border border-amber-100/10">
                        <input 
                          type="radio" 
                          checked={rsvpForm.attending === val}
                          onChange={() => setRsvpForm({...rsvpForm, attending: val})}
                          className="mr-3"
                        />
                        <span className="text-white/70">{val ? 'Ja, gerne' : 'Leider nein'}</span>
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
                        <label className="block text-xs text-amber-100 uppercase mb-2">{field.label}</label>
                        <input 
                          type="number" 
                          min={field.key === 'children' ? 0 : 1}
                          value={rsvpForm[field.key]}
                          onChange={(e) => setRsvpForm({...rsvpForm, [field.key]: parseInt(e.target.value)})}
                          className="w-full bg-white/5 border border-amber-100/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-amber-100/30"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-amber-900/40 hover:bg-amber-900/60 text-white border border-amber-100/30 py-4 rounded-lg transition font-light">
                  Speichern
                </button>
              </form>
            )}

            {rsvpData.find(r => r.guestCode === userCode) && userRole === 'guest' && (
              <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-6 text-center">
                <p className="text-green-400 font-light">✓ Danke für deine Zusage!</p>
              </div>
            )}
          </div>
        )}

        {/* FAQ */}
        {currentPage === 'faq' && (
          <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
            <h2 className="text-3xl font-light text-white script-font" style={{ fontWeight: 400 }}>FAQ</h2>

            {/* Add Question */}
            <form onSubmit={handleAddFaq} className="bg-white/5 border border-amber-100/20 rounded-lg p-6">
              <p className="text-sm text-amber-100 uppercase mb-4 font-light">Deine Frage</p>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                  placeholder="Frage stellen..."
                  className="flex-1 bg-white/5 border border-amber-100/20 rounded-lg px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-amber-100/30"
                />
                <button className="bg-amber-900/40 hover:bg-amber-900/60 text-white px-6 py-3 rounded-lg transition">
                  <Plus size={20} />
                </button>
              </div>
            </form>

            {/* FAQ List */}
            <div className="space-y-3">
              {faqList.map(faq => (
                <div key={faq.id} className="bg-white/5 border border-amber-100/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedTimeline(expandedTimeline === faq.id ? null : faq.id)}
                    className="w-full p-6 flex justify-between items-start hover:bg-white/10 transition cursor-pointer">
                    <div className="text-left flex-1">
                      <p className="font-light text-white">{faq.question}</p>
                      <p className="text-xs text-amber-100/50 mt-2">{faq.isFromGuest ? 'Gast Frage' : 'Admin'}</p>
                    </div>
                    <ChevronDown size={20} className={`text-white/40 transition ${expandedTimeline === faq.id ? 'rotate-180' : ''} flex-shrink-0`} />
                  </button>

                  {expandedTimeline === faq.id && (
                    <div className="border-t border-amber-100/10 p-6 space-y-4 bg-white/5">
                      {userRole === 'admin' && !faq.answer ? (
                        <textarea 
                          defaultValue={faq.answer}
                          onBlur={(e) => updateFaqAnswer(faq.id, e.target.value)}
                          placeholder="Antwort eingeben..."
                          rows="3"
                          className="w-full bg-white/10 border border-amber-100/20 rounded px-3 py-2 text-sm text-white placeholder-white/40"
                        />
                      ) : (
                        <div>
                          <p className="text-white/70 text-sm font-light mb-3">{faq.answer || 'Noch keine Antwort'}</p>
                          {userRole === 'admin' && faq.answer && (
                            <button
                              onClick={() => {
                                const newAnswer = prompt('Antwort bearbeiten:', faq.answer);
                                if (newAnswer !== null) updateFaqAnswer(faq.id, newAnswer);
                              }}
                              className="text-amber-400 hover:text-amber-300 text-sm font-light">
                              ✏️ Bearbeiten
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOTOS */}
        {currentPage === 'fotos' && (
          <div className="max-w-2xl mx-auto px-4 py-16 space-y-12">
            <h2 className="text-3xl font-light text-white script-font" style={{ fontWeight: 400 }}>Fotogalerie</h2>

            {userRole === 'admin' && (
              <div className="bg-white/5 border border-amber-100/20 rounded-lg p-8 space-y-6">
                <h3 className="text-xl font-light text-white">Google Drive Link</h3>
                <input 
                  type="text"
                  value={siteContent.googleDriveLink}
                  onChange={(e) => updateContent('googleDriveLink', e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-white/5 border border-amber-100/20 rounded-lg px-4 py-3 text-sm font-mono text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-amber-100/30"
                />
                
                <h3 className="text-xl font-light text-white pt-4 border-t border-amber-100/10">Anleitung für Gäste</h3>
                <textarea 
                  value={siteContent.googleDriveUploadLink}
                  onChange={(e) => updateContent('googleDriveUploadLink', e.target.value)}
                  rows="4"
                  placeholder="Wie laden Gäste Fotos hoch? (z.B. Link zum Upload Ordner)"
                  className="w-full bg-white/5 border border-amber-100/20 rounded-lg px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-amber-100/30"
                />
              </div>
            )}

            {siteContent.googleDriveLink ? (
              <div className="bg-white/5 border border-amber-100/20 rounded-lg p-8 space-y-6 text-center">
                {siteContent.googleDriveUploadLink && (
                  <div className="bg-white/10 rounded-lg p-6 border border-amber-100/10">
                    <h3 className="text-lg font-light text-white mb-4">Fotos hochladen</h3>
                    <p className="text-white/70 text-sm font-light whitespace-pre-line">{siteContent.googleDriveUploadLink}</p>
                  </div>
                )}
                <a 
                  href={siteContent.googleDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-amber-900/40 hover:bg-amber-900/60 text-white border border-amber-100/30 px-12 py-4 rounded-lg transition font-light">
                  Zur Google Drive Galerie →
                </a>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-white/50 font-light">Admin: Bitte Google Drive Link hinzufügen</p>
              </div>
            )}
          </div>
        )}

        {/* ADMIN */}
        {currentPage === 'admin' && userRole === 'admin' && (
          <div className="max-w-2xl mx-auto px-4 py-16 space-y-12">
            <h2 className="text-3xl font-light text-white script-font" style={{ fontWeight: 400 }}>Admin</h2>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-amber-100/10">
              {['guests', 'overview'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setAdminTab(tab)}
                  className={`py-3 px-4 font-light text-sm transition ${adminTab === tab ? 'text-white border-b-2 border-amber-400' : 'text-white/50 hover:text-white'}`}>
                  {tab === 'guests' ? 'Gäste' : 'Übersicht'}
                </button>
              ))}
            </div>

            {/* Guests Tab */}
            {adminTab === 'guests' && (
              <div className="space-y-6">
                <form onSubmit={handleAddGuest} className="flex gap-2">
                  <input 
                    type="text"
                    value={newGuestData.name}
                    onChange={(e) => setNewGuestData({...newGuestData, name: e.target.value})}
                    placeholder="Name"
                    className="flex-1 bg-white/5 border border-amber-100/20 rounded-lg px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-amber-100/30"
                    required
                  />
                  <button className="bg-amber-900/40 text-white px-4 py-2 rounded-lg">
                    <Plus size={18} />
                  </button>
                </form>

                <div className="space-y-2">
                  {guestList.map(guest => (
                    <div key={guest.id} className="flex items-center justify-between p-3 bg-white/5 border border-amber-100/10 rounded-lg text-sm">
                      <div>
                        <p className="text-white/70">{guest.name}</p>
                        <p className="text-amber-100/50 font-mono text-xs">{guest.code}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(guest.code);
                            alert('✓');
                          }}
                          className="text-white/50 hover:text-white">
                          <Copy size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteGuest(guest.id)}
                          className="text-white/50 hover:text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overview Tab */}
            {adminTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/10 rounded-lg p-6 text-center border border-amber-100/10">
                    <p className="text-sm text-amber-100/70 uppercase mb-2">Gesamt Zusagen</p>
                    <p className="text-4xl font-light text-white">{attendingCount}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6 text-center border border-amber-100/10">
                    <p className="text-sm text-amber-100/70 uppercase mb-2">Absagen</p>
                    <p className="text-4xl font-light text-white">{rsvpData.filter(r => r.attending === false).length}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6 text-center border border-amber-100/10">
                    <p className="text-sm text-amber-100/70 uppercase mb-2">Erwachsene</p>
                    <p className="text-4xl font-light text-white">{totalAdults}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6 text-center border border-amber-100/10">
                    <p className="text-sm text-amber-100/70 uppercase mb-2">Kinder</p>
                    <p className="text-4xl font-light text-white">{totalChildren}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="bg-black/50 border-t border-amber-100/10 py-8 text-center text-white/40 text-xs font-light mt-20">
        <p>Hochzeitswebseite • Alle Daten sind lokal sicher</p>
      </footer>
    </div>
  );
}
