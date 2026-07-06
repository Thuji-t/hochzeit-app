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
      <div className="min-h-screen bg-white relative overflow-hidden" style={{ fontFamily: 'Segoe UI, Roboto, sans-serif' }}>
        <style>{styles}</style>

        {siteContent.heroImage && (
          <div 
            className={`absolute inset-0 bg-cover bg-center ${heroImageLoaded ? 'fade-in' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${siteContent.heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
          </div>
        )}

        <div className="relative z-20 min-h-screen flex flex-col items-center justify-center p-4">
          {currentPage === 'login' ? (
            <div className="text-center max-w-md w-full space-y-16">
              <div className="space-y-6 fade-in">
                <p className="text-sm uppercase tracking-widest text-teal-700 font-light">Wedding Invitation</p>
                <h1 className="text-7xl text-teal-900 font-light leading-tight script-font" style={{ fontWeight: 400 }}>
                  {siteContent.coupleNames.split(' & ')[0]}
                </h1>
                <p className="text-amber-700/70 text-sm font-light">and</p>
                <h1 className="text-7xl text-teal-900 font-light leading-tight script-font" style={{ fontWeight: 400 }}>
                  {siteContent.coupleNames.split(' & ')[1]}
                </h1>
              </div>

              <p className="text-gray-700 text-sm font-light leading-relaxed">Please enter your name and code to view the invitation.</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <input 
                  type="text" 
                  value={loginData.name}
                  onChange={(e) => setLoginData({...loginData, name: e.target.value})}
                  placeholder="Name"
                  className="w-full bg-white/60 border-2 border-teal-300 rounded-full px-6 py-3 text-gray-800 placeholder-gray-500 text-center text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-sm"
                  required
                />
                <input 
                  type="text" 
                  value={loginData.code}
                  onChange={(e) => setLoginData({...loginData, code: e.target.value.toUpperCase()})}
                  placeholder="Code"
                  className="w-full bg-white/60 border-2 border-teal-300 rounded-full px-6 py-3 text-gray-800 placeholder-gray-500 text-center font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-sm"
                  required
                />
                <button 
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-600 border-2 border-teal-600 text-white font-light py-3 rounded-full transition text-sm uppercase tracking-wider backdrop-blur-sm">
                  Enter
                </button>
              </form>

              <button
                onClick={() => setCurrentPage('admin')}
                className="text-teal-700/60 hover:text-teal-700 text-xs font-light transition">
                🔐 Admin
              </button>
            </div>
          ) : (
            <div className="text-center max-w-md w-full space-y-8">
              <h2 className="text-3xl font-light text-teal-900">Admin</h2>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Passwort"
                  className="w-full bg-white/60 border-2 border-teal-300 rounded-full px-6 py-3 text-gray-800 placeholder-gray-500 text-center text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-sm"
                  required
                />
                <button 
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-600 border-2 border-teal-600 text-white font-light py-3 rounded-full transition text-sm backdrop-blur-sm">
                  Anmelden
                </button>
              </form>
              <button
                onClick={() => setCurrentPage('login')}
                className="text-teal-700/60 hover:text-teal-700 text-sm font-light">
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
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Segoe UI, Roboto, sans-serif' }}>
      <style>{styles}</style>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-teal-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={() => setCurrentPage('home')}
            className="text-2xl text-teal-600 hover:text-teal-700 transition">✨</button>
          
          <button 
            className="text-teal-600 hover:text-teal-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="bg-white/95 backdrop-blur-md border-t-2 border-teal-200 p-4 space-y-3">
            {['home', 'timeline', 'rsvp', 'faq', 'fotos'].map(page => (
              <button 
                key={page}
                onClick={() => { setCurrentPage(page); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 text-gray-700 hover:text-teal-600 text-sm font-light">
                {page === 'home' ? '🏠 Home' : page === 'timeline' ? '⏰ Ablauf' : page === 'rsvp' ? '💌 RSVP' : page === 'faq' ? '❓ FAQ' : '📸 Fotos'}
              </button>
            ))}
            {userRole === 'admin' && (
              <button 
                onClick={() => { setCurrentPage('admin'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 text-gray-700 hover:text-teal-600 text-sm font-light">
                ⚙️ Admin
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="block w-full text-left py-2 text-gray-500 hover:text-gray-700 text-sm border-t-2 border-teal-200 pt-3 mt-3 font-light">
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
            <div className="relative h-screen overflow-hidden bg-gradient-to-b from-teal-50 to-white">
              {siteContent.heroImage ? (
                <img 
                  src={siteContent.heroImage} 
                  alt="Hero" 
                  className="w-full h-full object-cover opacity-30 fade-in"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-teal-50/40 to-white" />
              )}

              {userRole === 'admin' && (
                <button 
                  onClick={() => setEditingSection(editingSection === 'hero' ? null : 'hero')}
                  className="absolute top-20 right-4 bg-teal-500 hover:bg-teal-600 text-white p-3 rounded-lg transition z-20">
                  {editingSection === 'hero' ? <Save size={20} /> : <Edit2 size={20} />}
                </button>
              )}

              {editingSection === 'hero' && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4 z-30">
                  <div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4 border-2 border-teal-300">
                    <input 
                      type="file"
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="w-full text-sm text-gray-700"
                    />
                    <button 
                      onClick={() => setEditingSection(null)}
                      className="w-full bg-teal-500 text-white py-2 rounded-lg text-sm">
                      Fertig
                    </button>
                  </div>
                </div>
              )}

              {/* Invitation Card */}
              <div className="absolute inset-0 flex items-center justify-center px-4">
                <div className="max-w-2xl w-full bg-white/80 backdrop-blur-md border-2 border-teal-300 rounded-2xl p-12 text-center space-y-8 fade-in shadow-xl">
                  {userRole === 'admin' && (
                    <button 
                      onClick={() => setEditingSection(editingSection === 'card' ? null : 'card')}
                      className="absolute top-6 right-6 bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-lg transition">
                      {editingSection === 'card' ? <Save size={20} /> : <Edit2 size={20} />}
                    </button>
                  )}

                  {editingSection === 'card' ? (
                    <div className="space-y-6">
                      <input 
                        type="text"
                        value={siteContent.coupleNames}
                        onChange={(e) => updateContent('coupleNames', e.target.value)}
                        className="w-full bg-teal-50 border-2 border-teal-300 rounded px-4 py-2 text-gray-800 text-center"
                        placeholder="Namen"
                      />
                      <input 
                        type="text"
                        value={siteContent.weddingDate}
                        onChange={(e) => updateContent('weddingDate', e.target.value)}
                        className="w-full bg-teal-50 border-2 border-teal-300 rounded px-4 py-2 text-gray-800 text-center"
                        placeholder="Datum"
                      />
                      <input 
                        type="text"
                        value={siteContent.weddingTime}
                        onChange={(e) => updateContent('weddingTime', e.target.value)}
                        className="w-full bg-teal-50 border-2 border-teal-300 rounded px-4 py-2 text-gray-800 text-center"
                        placeholder="Zeit"
                      />
                      <input 
                        type="text"
                        value={siteContent.venue}
                        onChange={(e) => updateContent('venue', e.target.value)}
                        className="w-full bg-teal-50 border-2 border-teal-300 rounded px-4 py-2 text-gray-800 text-center"
                        placeholder="Ort"
                      />
                      <input 
                        type="text"
                        value={siteContent.address}
                        onChange={(e) => updateContent('address', e.target.value)}
                        className="w-full bg-teal-50 border-2 border-teal-300 rounded px-4 py-2 text-gray-800 text-center"
                        placeholder="Adresse"
                      />
                      <textarea 
                        value={siteContent.description}
                        onChange={(e) => updateContent('description', e.target.value)}
                        rows="3"
                        className="w-full bg-teal-50 border-2 border-teal-300 rounded px-4 py-2 text-gray-800 text-sm"
                        placeholder="Beschreibung"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-xs uppercase tracking-widest text-teal-700 font-light">Wedding Invitation</p>
                      
                      <div className="space-y-4">
                        <h1 className="text-6xl text-teal-900 font-light leading-tight script-font" style={{ fontWeight: 400 }}>
                          {siteContent.coupleNames.split(' & ')[0]}
                        </h1>
                        <p className="text-amber-700 text-sm">and</p>
                        <h1 className="text-6xl text-teal-900 font-light leading-tight script-font" style={{ fontWeight: 400 }}>
                          {siteContent.coupleNames.split(' & ')[1]}
                        </h1>
                      </div>

                      <div className="border-t-2 border-teal-300 pt-8 space-y-6">
                        <p className="text-gray-700 font-light leading-relaxed text-sm">{siteContent.description}</p>

                        <div className="space-y-4 text-left">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-teal-600 mb-1 font-semibold">Date & Time</p>
                            <p className="text-lg text-teal-900 font-light">{siteContent.weddingDate}</p>
                            <p className="text-teal-700 font-light text-sm">{siteContent.weddingTime}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs uppercase tracking-wide text-teal-600 mb-1 font-semibold">Venue</p>
                            <p className="text-lg text-teal-900 font-light">{siteContent.venue}</p>
                            <p className="text-teal-700 font-light text-sm">{siteContent.address}</p>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 italic">RSVP until {siteContent.rsvpDeadline}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* CTA Section */}
            {userRole && (
              <div className="bg-white px-4 py-12">
                <div className="max-w-2xl mx-auto flex flex-col gap-4">
                  <button 
                    onClick={() => setCurrentPage('rsvp')}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white border-2 border-teal-600 py-4 rounded-lg transition font-light">
                    Zur Zusage
                  </button>
                  <button 
                    onClick={() => setCurrentPage('fotos')}
                    className="w-full bg-amber-400/60 hover:bg-amber-400/80 text-teal-900 border-2 border-amber-400 py-4 rounded-lg transition font-light">
                    Zur Fotogalerie
                  </button>
                </div>
              </div>
            )}

            {/* Stats */}
            {userRole === 'admin' && (
              <div className="bg-teal-50 px-4 py-12 border-t-2 border-teal-200">
                <div className="max-w-2xl mx-auto grid grid-cols-3 gap-4">
                  {[
                    { label: 'Zusagen', value: attendingCount },
                    { label: 'Gäste', value: guestList.length },
                    { label: 'Fragen', value: faqList.length }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white border-2 border-teal-300 rounded-lg p-6 text-center shadow-sm">
                      <p className="text-xs text-teal-600 uppercase mb-2 font-semibold">{stat.label}</p>
                      <p className="text-3xl font-light text-teal-900">{stat.value}</p>
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
              <h2 className="text-3xl font-light text-teal-900 script-font" style={{ fontWeight: 400 }}>Ablauf</h2>
              {userRole === 'admin' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const newItem = { time: '', event: '', subItems: [] };
                      const updated = [...siteContent.timeline, newItem];
                      updateContent('timeline', updated);
                    }}
                    className="text-teal-600 hover:text-teal-700">
                    <Plus size={20} />
                  </button>
                  <button 
                    onClick={() => setEditingSection(editingSection === 'timeline' ? null : 'timeline')}
                    className="text-teal-600 hover:text-teal-700">
                    {editingSection === 'timeline' ? <Save size={20} /> : <Edit2 size={20} />}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {siteContent.timeline.map((item, idx) => (
                <div key={idx} className="bg-teal-50 border-2 border-teal-200 rounded-lg overflow-hidden">
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
                          className="w-24 bg-white border-2 border-teal-300 rounded px-2 py-1 font-mono text-sm text-gray-800"
                          placeholder="Zeit"
                        />
                        <input 
                          type="text"
                          value={item.event}
                          onChange={(e) => {
                            const updated = siteContent.timeline.map((i, i2) => i2 === idx ? {...i, event: e.target.value} : i);
                            updateContent('timeline', updated);
                          }}
                          className="flex-1 bg-white border-2 border-teal-300 rounded px-2 py-1 text-sm text-gray-800"
                          placeholder="Event"
                        />
                        <button 
                          onClick={() => {
                            const updated = siteContent.timeline.filter((_, i2) => i2 !== idx);
                            updateContent('timeline', updated);
                          }}
                          className="text-red-500 hover:text-red-600">
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Unterpunkte */}
                      <div className="ml-4 space-y-2 border-t-2 border-teal-200 pt-4">
                        <p className="text-xs text-teal-600 uppercase font-semibold">Unterpunkte</p>
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
                              className="flex-1 bg-white border-2 border-teal-300 rounded px-2 py-1 text-sm text-gray-800"
                              placeholder="Unterpunkt"
                            />
                            <button 
                              onClick={() => {
                                const newSubs = item.subItems.filter((_, si) => si !== subIdx);
                                const updated = siteContent.timeline.map((i, i2) => i2 === idx ? {...i, subItems: newSubs} : i);
                                updateContent('timeline', updated);
                              }}
                              className="text-red-500 hover:text-red-600">
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
                          className="text-teal-600 hover:text-teal-700 text-sm flex items-center gap-1">
                          <Plus size={14} /> Unterpunkt hinzufügen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => item.subItems && item.subItems.length > 0 && setExpandedTimeline(expandedTimeline === idx ? null : idx)}
                      className={`p-6 flex gap-6 ${item.subItems && item.subItems.length > 0 ? 'cursor-pointer hover:bg-teal-100 transition' : 'cursor-default'}`}>
                      <p className="font-mono text-teal-700 w-20">{item.time}</p>
                      <div className="flex-1">
                        <p className="text-gray-700 font-light">{item.event}</p>
                        {item.subItems && item.subItems.length > 0 && expandedTimeline === idx && (
                          <div className="mt-4 space-y-2 border-t-2 border-teal-200 pt-4">
                            {item.subItems.map((sub, subIdx) => (
                              <p key={subIdx} className="text-gray-600 text-sm font-light ml-4">• {sub}</p>
                            ))}
                          </div>
                        )}
                      </div>
                      {item.subItems && item.subItems.length > 0 && (
                        <ChevronDown size={20} className={`text-teal-400 transition ${expandedTimeline === idx ? 'rotate-180' : ''}`} />
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
            <h2 className="text-3xl font-light text-teal-900 script-font" style={{ fontWeight: 400 }}>Zusage</h2>

            {/* Stats Section - immer sichtbar */}
            {rsvpData.length > 0 && (
              <div className="bg-teal-50 border-2 border-teal-300 rounded-lg p-8 space-y-6">
                <h3 className="text-xl font-light text-teal-900">Übersicht (anonym)</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-6 text-center border-2 border-teal-200">
                    <p className="text-sm text-teal-600 uppercase mb-2 font-semibold">Zusagen</p>
                    <p className="text-4xl font-light text-teal-900">{attendingCount}</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 text-center border-2 border-teal-200">
                    <p className="text-sm text-teal-600 uppercase mb-2 font-semibold">Absagen</p>
                    <p className="text-4xl font-light text-teal-900">{rsvpData.filter(r => r.attending === false).length}</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 text-center border-2 border-teal-200">
                    <p className="text-sm text-teal-600 uppercase mb-2 font-semibold">Erwachsene</p>
                    <p className="text-4xl font-light text-teal-900">{totalAdults}</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 text-center border-2 border-teal-200">
                    <p className="text-sm text-teal-600 uppercase mb-2 font-semibold">Kinder</p>
                    <p className="text-4xl font-light text-teal-900">{totalChildren}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Admin View */}
            {userRole === 'admin' && (
              <div className="bg-teal-50 border-2 border-teal-300 rounded-lg p-8 space-y-6">
                <h3 className="text-xl font-light text-teal-900">Gäste Details</h3>
                <div className="space-y-3">
                  {guestList.map(guest => {
                    const rsvp = rsvpData.find(r => r.guestCode === guest.code);
                    return (
                      <div key={guest.id} className="bg-white rounded-lg p-4 border-2 border-teal-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-light text-gray-800">{guest.name}</p>
                            <p className="text-xs text-teal-600 font-mono mt-1">{guest.code}</p>
                          </div>
                          {rsvp ? (
                            <div className="text-right">
                              <span className={`text-sm font-semibold ${rsvp.attending ? 'text-green-600' : 'text-red-600'}`}>
                                {rsvp.attending ? '✓ Zusage' : '✗ Absage'}
                              </span>
                              {rsvp.attending && (
                                <div className="text-xs text-gray-600 mt-2">
                                  <p>{rsvp.adults} Erwachsene</p>
                                  <p>{rsvp.children} Kinder</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-amber-600 font-semibold">⏳ Ausstehend</span>
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
                  <p className="font-light text-gray-700 mb-4">Kommst du?</p>
                  <div className="space-y-2">
                    {[true, false].map(val => (
                      <label key={val} className="flex items-center p-4 bg-teal-50 rounded-lg cursor-pointer hover:bg-teal-100 transition border-2 border-teal-200">
                        <input 
                          type="radio" 
                          checked={rsvpForm.attending === val}
                          onChange={() => setRsvpForm({...rsvpForm, attending: val})}
                          className="mr-3 accent-teal-600"
                        />
                        <span className="text-gray-700">{val ? 'Ja, gerne' : 'Leider nein'}</span>
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
                        <label className="block text-xs text-teal-600 uppercase mb-2 font-semibold">{field.label}</label>
                        <input 
                          type="number" 
                          min={field.key === 'children' ? 0 : 1}
                          value={rsvpForm[field.key]}
                          onChange={(e) => setRsvpForm({...rsvpForm, [field.key]: parseInt(e.target.value)})}
                          className="w-full bg-white border-2 border-teal-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white border-2 border-teal-600 py-4 rounded-lg transition font-light">
                  Speichern
                </button>
              </form>
            )}

            {rsvpData.find(r => r.guestCode === userCode) && userRole === 'guest' && (
              <div className="bg-green-100 border-2 border-green-400 rounded-lg p-6 text-center">
                <p className="text-green-700 font-light">✓ Danke für deine Zusage!</p>
              </div>
            )}
          </div>
        )}

        {/* FAQ */}
        {currentPage === 'faq' && (
          <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
            <h2 className="text-3xl font-light text-teal-900 script-font" style={{ fontWeight: 400 }}>FAQ</h2>

            {/* Add Question */}
            <form onSubmit={handleAddFaq} className="bg-teal-50 border-2 border-teal-300 rounded-lg p-6">
              <p className="text-sm text-teal-600 uppercase mb-4 font-semibold">Deine Frage</p>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                  placeholder="Frage stellen..."
                  className="flex-1 bg-white border-2 border-teal-300 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg transition">
                  <Plus size={20} />
                </button>
              </div>
            </form>

            {/* FAQ List */}
            <div className="space-y-3">
              {faqList.map(faq => {
                const canDelete = userRole === 'admin' || (userRole === 'guest' && faq.author === userName && faq.isFromGuest);
                return (
                  <div key={faq.id} className="bg-teal-50 border-2 border-teal-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedTimeline(expandedTimeline === faq.id ? null : faq.id)}
                      className="w-full p-6 flex justify-between items-start hover:bg-teal-100 transition cursor-pointer">
                      <div className="text-left flex-1">
                        <p className="font-light text-gray-800">{faq.question}</p>
                        <p className="text-xs text-teal-600 mt-2 font-semibold">{faq.isFromGuest ? 'Gast Frage' : 'Admin'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {canDelete && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFaq(faq.id);
                            }}
                            className="text-red-500 hover:text-red-600">
                            <Trash2 size={18} />
                          </button>
                        )}
                        <ChevronDown size={20} className={`text-teal-400 transition ${expandedTimeline === faq.id ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {expandedTimeline === faq.id && (
                      <div className="border-t-2 border-teal-200 p-6 space-y-4 bg-white">
                        {userRole === 'admin' && !faq.answer ? (
                          <textarea 
                            defaultValue={faq.answer}
                            onBlur={(e) => updateFaqAnswer(faq.id, e.target.value)}
                            placeholder="Antwort eingeben..."
                            rows="3"
                            className="w-full bg-teal-50 border-2 border-teal-300 rounded px-3 py-2 text-sm text-gray-800 placeholder-gray-500"
                          />
                        ) : (
                          <div>
                            <p className="text-gray-700 text-sm font-light mb-3">{faq.answer || 'Noch keine Antwort'}</p>
                            {userRole === 'admin' && faq.answer && (
                              <button
                                onClick={() => {
                                  const newAnswer = prompt('Antwort bearbeiten:', faq.answer);
                                  if (newAnswer !== null) updateFaqAnswer(faq.id, newAnswer);
                                }}
                                className="text-teal-600 hover:text-teal-700 text-sm font-light">
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
        {currentPage === 'fotos' && (
          <div className="max-w-2xl mx-auto px-4 py-16 space-y-12">
            <h2 className="text-3xl font-light text-teal-900 script-font" style={{ fontWeight: 400 }}>Fotogalerie</h2>

            {userRole === 'admin' && (
              <div className="bg-teal-50 border-2 border-teal-300 rounded-lg p-8 space-y-6">
                <h3 className="text-xl font-light text-teal-900">Google Drive Link</h3>
                <input 
                  type="text"
                  value={siteContent.googleDriveLink}
                  onChange={(e) => updateContent('googleDriveLink', e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-white border-2 border-teal-300 rounded-lg px-4 py-3 text-sm font-mono text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                
                <h3 className="text-xl font-light text-teal-900 pt-4 border-t-2 border-teal-300">Anleitung für Gäste</h3>
                <textarea 
                  value={siteContent.googleDriveUploadLink}
                  onChange={(e) => updateContent('googleDriveUploadLink', e.target.value)}
                  rows="4"
                  placeholder="Wie laden Gäste Fotos hoch? (z.B. Link zum Upload Ordner)"
                  className="w-full bg-white border-2 border-teal-300 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}

            {siteContent.googleDriveLink ? (
              <div className="bg-teal-50 border-2 border-teal-300 rounded-lg p-8 space-y-6 text-center">
                {siteContent.googleDriveUploadLink && (
                  <div className="bg-white rounded-lg p-6 border-2 border-teal-200">
                    <h3 className="text-lg font-light text-teal-900 mb-4">Fotos hochladen</h3>
                    <p className="text-gray-700 text-sm font-light whitespace-pre-line">{siteContent.googleDriveUploadLink}</p>
                  </div>
                )}
                <a 
                  href={siteContent.googleDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-amber-400/70 hover:bg-amber-400/90 text-teal-900 border-2 border-amber-500 px-12 py-4 rounded-lg transition font-light">
                  Zur Google Drive Galerie →
                </a>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 font-light">Admin: Bitte Google Drive Link hinzufügen</p>
              </div>
            )}
          </div>
        )}

        {/* ADMIN */}
        {currentPage === 'admin' && userRole === 'admin' && (
          <div className="max-w-2xl mx-auto px-4 py-16 space-y-12">
            <h2 className="text-3xl font-light text-teal-900 script-font" style={{ fontWeight: 400 }}>Admin</h2>

            {/* Tabs */}
            <div className="flex gap-4 border-b-2 border-teal-300">
              {['guests', 'overview'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setAdminTab(tab)}
                  className={`py-3 px-4 font-light text-sm transition ${adminTab === tab ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-600 hover:text-teal-600'}`}>
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
                    className="flex-1 bg-teal-50 border-2 border-teal-300 rounded-lg px-4 py-2 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  <button className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition">
                    <Plus size={18} />
                  </button>
                </form>

                <div className="space-y-2">
                  {guestList.map(guest => (
                    <div key={guest.id} className="flex items-center justify-between p-3 bg-teal-50 border-2 border-teal-200 rounded-lg text-sm">
                      <div>
                        <p className="text-gray-700">{guest.name}</p>
                        <p className="text-teal-600 font-mono text-xs">{guest.code}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(guest.code);
                            alert('✓');
                          }}
                          className="text-teal-600 hover:text-teal-700">
                          <Copy size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteGuest(guest.id)}
                          className="text-red-500 hover:text-red-600">
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
                  <div className="bg-white rounded-lg p-6 text-center border-2 border-teal-200">
                    <p className="text-sm text-teal-600 uppercase mb-2 font-semibold">Gesamt Zusagen</p>
                    <p className="text-4xl font-light text-teal-900">{attendingCount}</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 text-center border-2 border-teal-200">
                    <p className="text-sm text-teal-600 uppercase mb-2 font-semibold">Absagen</p>
                    <p className="text-4xl font-light text-teal-900">{rsvpData.filter(r => r.attending === false).length}</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 text-center border-2 border-teal-200">
                    <p className="text-sm text-teal-600 uppercase mb-2 font-semibold">Erwachsene</p>
                    <p className="text-4xl font-light text-teal-900">{totalAdults}</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 text-center border-2 border-teal-200">
                    <p className="text-sm text-teal-600 uppercase mb-2 font-semibold">Kinder</p>
                    <p className="text-4xl font-light text-teal-900">{totalChildren}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="bg-teal-50 border-t-2 border-teal-200 py-8 text-center text-gray-600 text-xs font-light mt-20">
        <p>Hochzeitswebseite • Alle Daten sind lokal sicher</p>
      </footer>
    </div>
  );
}
