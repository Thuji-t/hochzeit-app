import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, Edit2, Save, Plus, Trash2, Copy, ChevronDown, Check } from 'lucide-react';

export default function HochzeitsApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userCode, setUserCode] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

  // Data
  const [guestList, setGuestList] = useState([]);
  const [organizerList, setOrganizerList] = useState([]);
  const [rsvpData, setRsvpData] = useState([]);
  const [faqList, setFaqList] = useState([]);

  const [siteContent, setSiteContent] = useState({
    coupleNames: 'Bira & Partner',
    weddingDate: '14. Juni 2025',
    weddingTime: '16:00 - 23:00 Uhr',
    venue: 'Royal am See',
    address: 'Amlaching 2, 83346 Polling, Bayern',
    subtitle: 'Südindische Tradition trifft bayerische Gastfreundschaft',
    description: 'Wir laden euch herzlich zu unserer Hochzeit ein. Ein Tag voller Liebe, Farben und Freude, an dem wir gerne mit euch feiern möchten.',
    rsvpDeadline: '31. Mai 2025',
    heroImage: null,
    timeline: [
      { time: '16:00', event: 'Ankunft & Empfang' },
      { time: '17:00', event: 'Zeremonie' },
      { time: '18:30', event: 'Aperitif & Fotos' },
      { time: '19:00', event: 'Dinner' },
      { time: '21:00', event: 'Tanz & Feier' }
    ],
    googleDriveLink: '',
    menuItems: ['Südindisches Thali (V)', 'Tandoori Huhn', 'Fisch-Curry', 'Lamm-Biryani']
  });

  const [loginData, setLoginData] = useState({ name: '', code: '' });
  const [adminPassword, setAdminPassword] = useState('');
  const [newGuestData, setNewGuestData] = useState({ name: '', email: '' });
  const [rsvpForm, setRsvpForm] = useState({ attending: null, adults: 1, children: 0, mainCourse: '' });
  const [newFaqQuestion, setNewFaqQuestion] = useState('');

  // Load
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
  }, []);

  // Save
  const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));
  const updateContent = (key, value) => {
    const updated = { ...siteContent, [key]: value };
    setSiteContent(updated);
    save('hochzeitsContent', updated);
  };

  // Auth
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
    setCurrentPage('home');
    setEditingSection(null);
  };

  // Guests
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

  // RSVP
  const handleRsvp = (e) => {
    e.preventDefault();
    if (rsvpForm.attending === null) return;
    const guest = guestList.find(g => g.code === userCode);
    const newRsvp = { id: Date.now(), guestCode: userCode, guestName: guest.name, ...rsvpForm };
    const updated = rsvpData.filter(r => r.guestCode !== userCode);
    updated.push(newRsvp);
    setRsvpData(updated);
    save('hochzeitsRSVP', updated);
    setRsvpForm({ attending: null, adults: 1, children: 0, mainCourse: '' });
    alert('Danke!');
    setCurrentPage('home');
  };

  // FAQ
  const handleAddFaq = (e) => {
    e.preventDefault();
    if (!newFaqQuestion.trim()) return;
    const newFaq = { id: Date.now(), question: newFaqQuestion, answer: '', author: userName };
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

  // ===== LOGIN =====
  if (!userRole) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          {currentPage === 'login' ? (
            <div>
              <div className="text-center mb-12">
                <h1 className="text-5xl mb-2 font-light tracking-tight">✨</h1>
                <h2 className="text-3xl font-light text-gray-900 mb-2">Unsere Hochzeit</h2>
                <p className="text-gray-500 text-sm">14. Juni 2025</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 mb-8">
                <input 
                  type="text" 
                  value={loginData.name}
                  onChange={(e) => setLoginData({...loginData, name: e.target.value})}
                  placeholder="Name"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                  required
                />
                <input 
                  type="text" 
                  value={loginData.code}
                  onChange={(e) => setLoginData({...loginData, code: e.target.value.toUpperCase()})}
                  placeholder="Code"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gray-400"
                  required
                />
                <button 
                  type="submit"
                  className="w-full bg-black text-white font-light py-3 rounded-lg hover:bg-gray-900 transition text-sm">
                  Einloggen
                </button>
              </form>

              <button
                onClick={() => setCurrentPage('admin')}
                className="w-full text-gray-500 hover:text-gray-700 text-sm font-light transition">
                🔐 Admin
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-8 text-center">Admin</h2>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Passwort"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                  required
                />
                <button 
                  type="submit"
                  className="w-full bg-black text-white font-light py-3 rounded-lg hover:bg-gray-900 transition text-sm">
                  Anmelden
                </button>
              </form>
              <button
                onClick={() => setCurrentPage('login')}
                className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm font-light">
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
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 backdrop-blur-sm bg-white/80">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={() => setCurrentPage('home')}
            className="text-2xl font-light">✨</button>
          
          <button 
            className="text-gray-600 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="bg-white border-t border-gray-100 p-4 space-y-3">
            {['home', 'timeline', 'rsvp', 'faq'].map(page => (
              <button 
                key={page}
                onClick={() => { setCurrentPage(page); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 text-gray-600 hover:text-gray-900 text-sm">
                {page === 'home' ? 'Home' : page === 'timeline' ? 'Ablauf' : page === 'rsvp' ? 'RSVP' : 'FAQ'}
              </button>
            ))}
            {siteContent.googleDriveLink && (
              <button 
                onClick={() => { setCurrentPage('fotos'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 text-gray-600 hover:text-gray-900 text-sm">
                📸 Fotos
              </button>
            )}
            {userRole === 'admin' && (
              <button 
                onClick={() => { setCurrentPage('admin'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 text-gray-600 hover:text-gray-900 text-sm">
                ⚙️ Admin
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="block w-full text-left py-2 text-gray-400 hover:text-gray-600 text-sm">
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* CONTENT */}
      <div className="pt-16">
        {/* HOME */}
        {currentPage === 'home' && (
          <div className="space-y-16">
            {/* Hero */}
            <div className="relative h-96 bg-gray-50 overflow-hidden">
              {siteContent.heroImage && (
                <img src={siteContent.heroImage} alt="Hero" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              
              {userRole === 'admin' && (
                <button 
                  onClick={() => setEditingSection(editingSection === 'hero' ? null : 'hero')}
                  className="absolute top-4 right-4 bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition">
                  {editingSection === 'hero' ? <Save size={20} /> : <Edit2 size={20} />}
                </button>
              )}

              {editingSection === 'hero' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4">
                    <input 
                      type="file"
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="w-full text-sm"
                    />
                    <button 
                      onClick={() => setEditingSection(null)}
                      className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm">
                      Fertig
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Invitation Card */}
            <div className="max-w-2xl mx-auto px-4">
              <div className="bg-gray-50 rounded-2xl p-12 relative">
                {userRole === 'admin' && (
                  <button 
                    onClick={() => setEditingSection(editingSection === 'card' ? null : 'card')}
                    className="absolute top-4 right-4 bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition">
                    {editingSection === 'card' ? <Save size={20} /> : <Edit2 size={20} />}
                  </button>
                )}

                {editingSection === 'card' ? (
                  <div className="space-y-4">
                    <input 
                      type="text"
                      value={siteContent.coupleNames}
                      onChange={(e) => updateContent('coupleNames', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-lg"
                    />
                    <input 
                      type="text"
                      value={siteContent.subtitle}
                      onChange={(e) => updateContent('subtitle', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    <textarea 
                      value={siteContent.description}
                      onChange={(e) => updateContent('description', e.target.value)}
                      rows="3"
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-5xl font-light text-gray-900 mb-3">{siteContent.coupleNames}</h1>
                    <p className="text-lg text-gray-600 font-light mb-8">{siteContent.subtitle}</p>
                    <p className="text-gray-700 leading-relaxed mb-12">{siteContent.description}</p>

                    <div className="space-y-6 border-t border-gray-200 pt-8">
                      <div>
                        <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Datum</p>
                        <p className="text-2xl font-light text-gray-900">{siteContent.weddingDate}</p>
                        <p className="text-gray-600 font-light">{siteContent.weddingTime}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Ort</p>
                        <p className="text-2xl font-light text-gray-900">{siteContent.venue}</p>
                        <p className="text-gray-600 font-light">{siteContent.address}</p>
                      </div>

                      <p className="text-xs text-gray-400 italic">RSVP bis {siteContent.rsvpDeadline}</p>
                    </div>
                  </>
                )}
              </div>

              {userRole && (
                <button 
                  onClick={() => setCurrentPage('rsvp')}
                  className="w-full mt-8 bg-gray-900 text-white py-4 rounded-lg hover:bg-black transition font-light text-lg">
                  Zur Zusage
                </button>
              )}
            </div>

            {/* Stats for Admin */}
            {userRole === 'admin' && (
              <div className="max-w-2xl mx-auto px-4 grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-500 mb-2">Zusagen</p>
                  <p className="text-3xl font-light text-gray-900">{attendingCount}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-500 mb-2">Gäste</p>
                  <p className="text-3xl font-light text-gray-900">{guestList.length}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-500 mb-2">Fragen</p>
                  <p className="text-3xl font-light text-gray-900">{faqList.length}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TIMELINE */}
        {currentPage === 'timeline' && (
          <div className="max-w-2xl mx-auto px-4 py-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-light text-gray-900">Ablauf</h2>
              {userRole === 'admin' && (
                <button 
                  onClick={() => setEditingSection(editingSection === 'timeline' ? null : 'timeline')}
                  className="text-gray-600 hover:text-gray-900">
                  {editingSection === 'timeline' ? <Save size={20} /> : <Edit2 size={20} />}
                </button>
              )}
            </div>

            <div className="space-y-4">
              {siteContent.timeline.map((item, idx) => (
                <div key={idx} className="flex gap-6 p-6 bg-gray-50 rounded-lg">
                  {editingSection === 'timeline' ? (
                    <>
                      <input 
                        type="text"
                        value={item.time}
                        onChange={(e) => {
                          const updated = siteContent.timeline.map((i, i2) => i2 === idx ? {...i, time: e.target.value} : i);
                          updateContent('timeline', updated);
                        }}
                        className="w-20 border border-gray-300 rounded px-2 py-1 font-mono text-sm"
                      />
                      <input 
                        type="text"
                        value={item.event}
                        onChange={(e) => {
                          const updated = siteContent.timeline.map((i, i2) => i2 === idx ? {...i, event: e.target.value} : i);
                          updateContent('timeline', updated);
                        }}
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </>
                  ) : (
                    <>
                      <p className="font-mono text-gray-600 w-20">{item.time}</p>
                      <p className="text-gray-900 font-light">{item.event}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RSVP */}
        {currentPage === 'rsvp' && (
          <div className="max-w-2xl mx-auto px-4 py-16">
            <h2 className="text-3xl font-light text-gray-900 mb-8">Zusage</h2>

            <form onSubmit={handleRsvp} className="space-y-8">
              <div>
                <p className="font-light text-gray-900 mb-4">Kommst du?</p>
                <div className="space-y-3">
                  <label className="flex items-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <input 
                      type="radio" 
                      checked={rsvpForm.attending === true}
                      onChange={() => setRsvpForm({...rsvpForm, attending: true})}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="text-gray-900">Ja, gerne</span>
                  </label>
                  <label className="flex items-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <input 
                      type="radio" 
                      checked={rsvpForm.attending === false}
                      onChange={() => setRsvpForm({...rsvpForm, attending: false})}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="text-gray-900">Leider nein</span>
                  </label>
                </div>
              </div>

              {rsvpForm.attending && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Erwachsene</label>
                      <input 
                        type="number" 
                        min="1"
                        value={rsvpForm.adults}
                        onChange={(e) => setRsvpForm({...rsvpForm, adults: parseInt(e.target.value)})}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Kinder</label>
                      <input 
                        type="number" 
                        min="0"
                        value={rsvpForm.children}
                        onChange={(e) => setRsvpForm({...rsvpForm, children: parseInt(e.target.value)})}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-3">Hauptgericht</label>
                    <div className="space-y-2">
                      {siteContent.menuItems.map(item => (
                        <label key={item} className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                          <input 
                            type="radio" 
                            checked={rsvpForm.mainCourse === item}
                            onChange={() => setRsvpForm({...rsvpForm, mainCourse: item})}
                            className="mr-3 w-4 h-4"
                          />
                          <span className="text-gray-900 text-sm">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <button 
                type="submit"
                className="w-full bg-gray-900 text-white py-4 rounded-lg hover:bg-black transition font-light text-lg">
                Speichern
              </button>
            </form>
          </div>
        )}

        {/* FAQ */}
        {currentPage === 'faq' && (
          <div className="max-w-2xl mx-auto px-4 py-16">
            <h2 className="text-3xl font-light text-gray-900 mb-8">Fragen</h2>

            {userRole === 'guest' && (
              <form onSubmit={handleAddFaq} className="mb-8 flex gap-2">
                <input 
                  type="text"
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                  placeholder="Frage stellen..."
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
                <button 
                  type="submit"
                  className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-black transition">
                  <Plus size={20} />
                </button>
              </form>
            )}

            <div className="space-y-3">
              {faqList.map(faq => (
                <details key={faq.id} className="group bg-gray-50 rounded-lg p-6">
                  <summary className="font-light text-gray-900 flex justify-between cursor-pointer">
                    {faq.question}
                    <ChevronDown size={20} className="text-gray-400 group-open:rotate-180 transition" />
                  </summary>
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    {userRole === 'admin' && !faq.answer ? (
                      <textarea 
                        defaultValue={faq.answer}
                        onBlur={(e) => updateFaqAnswer(faq.id, e.target.value)}
                        placeholder="Antwort..."
                        rows="2"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                    ) : (
                      <p className="text-gray-700 text-sm font-light">{faq.answer || '–'}</p>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* FOTOS */}
        {currentPage === 'fotos' && siteContent.googleDriveLink && (
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl font-light text-gray-900 mb-8">Fotos</h2>
            <a 
              href={siteContent.googleDriveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gray-900 text-white px-12 py-4 rounded-lg hover:bg-black transition font-light">
              Zur Galerie →
            </a>
          </div>
        )}

        {/* ADMIN */}
        {currentPage === 'admin' && userRole === 'admin' && (
          <div className="max-w-2xl mx-auto px-4 py-16 space-y-12">
            <h2 className="text-3xl font-light text-gray-900">Admin</h2>

            {/* Guests */}
            <div>
              <h3 className="text-xl font-light text-gray-900 mb-6">Gäste</h3>
              <form onSubmit={handleAddGuest} className="flex gap-2 mb-6">
                <input 
                  type="text"
                  value={newGuestData.name}
                  onChange={(e) => setNewGuestData({...newGuestData, name: e.target.value})}
                  placeholder="Name"
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                  required
                />
                <button className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition">
                  <Plus size={18} />
                </button>
              </form>

              <div className="space-y-2">
                {guestList.map(guest => (
                  <div key={guest.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                    <div>
                      <p className="text-gray-900">{guest.name}</p>
                      <p className="text-gray-500 font-mono text-xs">{guest.code}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(guest.code);
                          alert('✓');
                        }}
                        className="text-gray-600 hover:text-gray-900">
                        <Copy size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteGuest(guest.id)}
                        className="text-gray-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Google Drive */}
            <div>
              <h3 className="text-xl font-light text-gray-900 mb-4">Google Drive</h3>
              <input 
                type="text"
                value={siteContent.googleDriveLink}
                onChange={(e) => updateContent('googleDriveLink', e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-50 border-t border-gray-100 py-8 text-center text-gray-500 text-xs font-light mt-16">
        <p>Hochzeitswebseite • Alle Daten sind lokal sicher</p>
      </footer>
    </div>
  );
}
