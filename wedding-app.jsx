import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X, Lock, LogOut, Copy, Trash2, Plus, MessageCircle, CheckCircle2, AlertCircle, Heart, Edit2, Save, UploadCloud } from 'lucide-react';

export default function HochzeitsApp() {
  // ============= STATE =============
  const [currentPage, setCurrentPage] = useState('login');
  const [userRole, setUserRole] = useState(null); // 'guest', 'organizer', 'admin'
  const [userName, setUserName] = useState(null);
  const [userCode, setUserCode] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminEditMode, setAdminEditMode] = useState(false);

  // Lists
  const [guestList, setGuestList] = useState([]);
  const [organizerList, setOrganizerList] = useState([]);
  const [rsvpData, setRsvpData] = useState([]);
  const [faqList, setFaqList] = useState([]);

  // Admin Content Management
  const [siteContent, setSiteContent] = useState({
    heroImage: null,
    heroTitle: '✨ Unsere Hochzeit',
    heroSubtitle: 'Südindische & Bayerische Tradition',
    heroDate: '14. Juni 2025 | 16:00 Uhr',
    location: 'Royal am See, Amlaching 2, 83346 Polling',
    guestAblaufplan: [
      { time: '16:00', event: 'Ankunft & Welcome' },
      { time: '17:00', event: 'Zeremonie' },
      { time: '18:30', event: 'Dinner' },
      { time: '20:00', event: 'Tanz & Feier' }
    ],
    adminAblaufplan: [
      { time: '14:00', event: 'Team-Treffen', responsible: 'Mama' },
      { time: '16:00', event: 'Gäste-Empfang', responsible: 'Koordinator' },
      { time: '16:30', event: 'Makeup & Vorbereitung', responsible: 'Freundin A' },
      { time: '17:00', event: 'Zeremonie Start', responsible: 'Priester' },
      { time: '17:45', event: 'Fotos', responsible: 'Fotograf' },
      { time: '18:30', event: 'Dinner Service', responsible: 'Catering' },
      { time: '20:00', event: 'DJ Start', responsible: 'DJ' }
    ],
    googleDriveLink: '',
    menuItems: ['Südindisches Thali (vegetarisch)', 'Tandoori Huhn', 'Fisch-Curry', 'Lamm-Biryani', 'Vegetarisches Gericht'],
    description: 'Wir freuen uns, euch zu unserer Hochzeit einzuladen! Ein Tag voller Liebe, Farben und Freude. 🌸'
  });

  // Form States
  const [loginData, setLoginData] = useState({ name: '', code: '' });
  const [adminPassword, setAdminPassword] = useState('');
  const [newGuestData, setNewGuestData] = useState({ name: '', email: '' });
  const [newOrganizerData, setNewOrganizerData] = useState({ name: '', role: 'Koordinator', email: '' });
  const [rsvpForm, setRsvpForm] = useState({
    attending: null,
    adults: 1,
    children: 0,
    mainCourse: '',
    dietary: [],
    email: ''
  });
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [faqAnswers, setFaqAnswers] = useState({});

  // ============= LOAD DATA =============
  useEffect(() => {
    const saved = {
      guests: localStorage.getItem('hochzeitsGaesteListe'),
      organizers: localStorage.getItem('hochzeitsOrganizerListe'),
      rsvp: localStorage.getItem('hochzeitsRSVP'),
      content: localStorage.getItem('hochzeitsContent'),
      faq: localStorage.getItem('hochzeitsFAQ')
    };

    if (saved.guests) setGuestList(JSON.parse(saved.guests));
    if (saved.organizers) setOrganizerList(JSON.parse(saved.organizers));
    if (saved.rsvp) setRsvpData(JSON.parse(saved.rsvp));
    if (saved.content) setSiteContent(JSON.parse(saved.content));
    if (saved.faq) setFaqList(JSON.parse(saved.faq));
  }, []);

  // ============= SAVE FUNCTIONS =============
  const saveGuests = (list) => {
    setGuestList(list);
    localStorage.setItem('hochzeitsGaesteListe', JSON.stringify(list));
  };

  const saveOrganizers = (list) => {
    setOrganizerList(list);
    localStorage.setItem('hochzeitsOrganizerListe', JSON.stringify(list));
  };

  const saveRsvp = (list) => {
    setRsvpData(list);
    localStorage.setItem('hochzeitsRSVP', JSON.stringify(list));
  };

  const saveContent = (content) => {
    setSiteContent(content);
    localStorage.setItem('hochzeitsContent', JSON.stringify(content));
  };

  const saveFaq = (list) => {
    setFaqList(list);
    localStorage.setItem('hochzeitsFAQ', JSON.stringify(list));
  };

  // ============= AUTH =============
  const handleLogin = (e) => {
    e.preventDefault();
    
    const guest = guestList.find(g => 
      g.name.toLowerCase() === loginData.name.toLowerCase() && 
      g.code === loginData.code
    );
    
    if (guest) {
      setUserCode(guest.code);
      setUserRole('guest');
      setUserName(guest.name);
      setCurrentPage('home');
      setLoginData({ name: '', code: '' });
      return;
    }

    const organizer = organizerList.find(o => 
      o.name.toLowerCase() === loginData.name.toLowerCase() && 
      o.code === loginData.code
    );
    
    if (organizer) {
      setUserCode(organizer.code);
      setUserRole('organizer');
      setUserName(organizer.name);
      setCurrentPage('home');
      setLoginData({ name: '', code: '' });
      return;
    }

    alert('Name oder Code ist falsch!');
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'Hochzeit2024') {
      setUserRole('admin');
      setCurrentPage('adminHome');
      setAdminPassword('');
    } else {
      alert('Falsches Admin-Passwort!');
    }
  };

  const handleLogout = () => {
    setUserCode(null);
    setUserRole(null);
    setUserName(null);
    setCurrentPage('login');
    setAdminEditMode(false);
  };

  // ============= GUEST MANAGEMENT =============
  const handleAddGuest = (e) => {
    e.preventDefault();
    if (!newGuestData.name) {
      alert('Bitte Namen eingeben');
      return;
    }
    
    const code = 'GAST' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newGuest = {
      id: Date.now(),
      name: newGuestData.name,
      email: newGuestData.email,
      code: code
    };
    
    saveGuests([...guestList, newGuest]);
    setNewGuestData({ name: '', email: '' });
  };

  const handleDeleteGuest = (id) => {
    if (confirm('Wirklich löschen?')) {
      saveGuests(guestList.filter(g => g.id !== id));
    }
  };

  // ============= ORGANIZER MANAGEMENT =============
  const handleAddOrganizer = (e) => {
    e.preventDefault();
    if (!newOrganizerData.name) {
      alert('Bitte Namen eingeben');
      return;
    }
    
    const code = 'ORGA' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newOrganizer = {
      id: Date.now(),
      name: newOrganizerData.name,
      role: newOrganizerData.role,
      email: newOrganizerData.email,
      code: code
    };
    
    saveOrganizers([...organizerList, newOrganizer]);
    setNewOrganizerData({ name: '', role: 'Koordinator', email: '' });
  };

  const handleDeleteOrganizer = (id) => {
    if (confirm('Wirklich löschen?')) {
      saveOrganizers(organizerList.filter(o => o.id !== id));
    }
  };

  // ============= RSVP =============
  const handleRsvp = (e) => {
    e.preventDefault();
    if (rsvpForm.attending === null) {
      alert('Bitte gib an ob du zusagst');
      return;
    }

    const currentGuest = guestList.find(g => g.code === userCode);
    
    const newRsvp = {
      id: Date.now(),
      guestCode: userCode,
      guestName: currentGuest.name,
      ...rsvpForm,
      date: new Date().toLocaleDateString('de-DE')
    };

    const updated = rsvpData.filter(r => r.guestCode !== userCode);
    saveRsvp([...updated, newRsvp]);
    setRsvpForm({
      attending: null,
      adults: 1,
      children: 0,
      mainCourse: '',
      dietary: [],
      email: ''
    });

    alert('Danke für deine Zusage!');
    setCurrentPage('home');
  };

  // ============= FAQ =============
  const handleAddFaqQuestion = (e) => {
    e.preventDefault();
    if (!newFaqQuestion.trim()) return;

    const newFaq = {
      id: Date.now(),
      question: newFaqQuestion,
      answer: faqAnswers[Date.now()] || '',
      author: userName,
      isFromGuest: userRole === 'guest',
      date: new Date().toLocaleDateString('de-DE')
    };

    saveFaq([...faqList, newFaq]);
    setNewFaqQuestion('');
  };

  const handleUpdateFaqAnswer = (id, answer) => {
    const updated = faqList.map(f => 
      f.id === id ? { ...f, answer } : f
    );
    saveFaq(updated);
  };

  // ============= HELPERS =============
  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = { ...siteContent, [field]: event.target.result };
        saveContent(content);
      };
      reader.readAsDataURL(file);
    }
  };

  const attendingCount = rsvpData.filter(r => r.attending === true).length;
  const totalAdults = rsvpData.filter(r => r.attending).reduce((sum, r) => sum + (r.adults || 0), 0);
  const totalChildren = rsvpData.filter(r => r.attending).reduce((sum, r) => sum + (r.children || 0), 0);

  const showNav = userRole && userCode;

  // ============= RENDER =============
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
      {/* NAVIGATION */}
      {showNav && (
        <nav className="sticky top-0 z-50 bg-white shadow-sm border-b-2 border-amber-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="text-xl font-serif text-amber-900 font-bold">✨ Unsere Hochzeit</div>
              
              <div className="hidden md:flex gap-4 items-center">
                <button onClick={() => setCurrentPage('home')} 
                  className={`font-medium ${currentPage === 'home' ? 'text-amber-700 border-b-2 border-amber-700' : 'text-gray-600'}`}>
                  Home
                </button>
                <button onClick={() => setCurrentPage('ablaufplan')} 
                  className={`font-medium ${currentPage === 'ablaufplan' ? 'text-amber-700 border-b-2 border-amber-700' : 'text-gray-600'}`}>
                  Ablaufplan
                </button>
                <button onClick={() => setCurrentPage('rsvp')} 
                  className={`font-medium ${currentPage === 'rsvp' ? 'text-amber-700 border-b-2 border-amber-700' : 'text-gray-600'}`}>
                  RSVP
                </button>
                <button onClick={() => setCurrentPage('faq')} 
                  className={`font-medium ${currentPage === 'faq' ? 'text-amber-700 border-b-2 border-amber-700' : 'text-gray-600'}`}>
                  FAQ
                </button>
                {siteContent.googleDriveLink && (
                  <button onClick={() => setCurrentPage('fotos')} 
                    className={`font-medium ${currentPage === 'fotos' ? 'text-amber-700 border-b-2 border-amber-700' : 'text-gray-600'}`}>
                    📸 Fotos
                  </button>
                )}
                {userRole === 'admin' && (
                  <button onClick={() => setCurrentPage('adminHome')} 
                    className="font-medium text-teal-600 hover:text-teal-700">
                    ⚙️ Admin
                  </button>
                )}
                <button onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium">
                  <LogOut size={16} /> Logout
                </button>
              </div>

              <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="mt-4 space-y-2 border-t pt-4">
                {['home', 'ablaufplan', 'rsvp', 'faq'].map(page => (
                  <button 
                    key={page}
                    onClick={() => { setCurrentPage(page); setMobileMenuOpen(false); }}
                    className="block w-full text-left py-2 text-gray-600 hover:text-amber-700">
                    {page === 'home' ? 'Home' : page === 'ablaufplan' ? 'Ablaufplan' : page === 'rsvp' ? 'RSVP' : 'FAQ'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      )}

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* LOGIN */}
        {currentPage === 'login' && !userRole && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-serif text-amber-900 mb-4">✨ Unsere Hochzeit</h1>
              <p className="text-xl text-amber-700">14. Juni 2025</p>
              <p className="text-gray-600">Südindische & Bayerische Tradition</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-serif text-amber-900 mb-6">👋 Gast-Login</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dein Name</label>
                    <input 
                      type="text" 
                      value={loginData.name}
                      onChange={(e) => setLoginData({...loginData, name: e.target.value})}
                      placeholder="z.B. Maria Müller"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gast-Code</label>
                    <input 
                      type="text" 
                      value={loginData.code}
                      onChange={(e) => setLoginData({...loginData, code: e.target.value.toUpperCase()})}
                      placeholder="z.B. GAST12345"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 rounded-lg transition">
                    Einloggen
                  </button>
                </form>
              </div>

              <div className="bg-gray-50 rounded-lg shadow-lg p-8 border-l-4 border-gray-400">
                <h2 className="text-2xl font-serif text-gray-900 mb-6">🔐 Admin</h2>
                <button
                  onClick={() => setCurrentPage('adminLogin')}
                  className="w-full bg-gray-700 hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2">
                  <Lock size={20} /> Admin anmelden
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN LOGIN */}
        {currentPage === 'adminLogin' && !userRole && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-2xl font-serif text-amber-900 mb-6 text-center">🔐 Admin-Login</h1>
              
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Passwort</label>
                  <input 
                    type="password" 
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 rounded-lg transition">
                  Anmelden
                </button>
              </form>

              <button
                onClick={() => setCurrentPage('login')}
                className="w-full mt-4 text-amber-600 hover:text-amber-700 font-medium">
                ← Zurück
              </button>
            </div>
          </div>
        )}

        {/* HOME PAGE - SCHÖNE STARTSEITE */}
        {currentPage === 'home' && userRole && userRole !== 'admin' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative rounded-lg overflow-hidden shadow-xl">
              {siteContent.heroImage && (
                <img src={siteContent.heroImage} alt="Hero" className="w-full h-96 object-cover" />
              )}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 ${!siteContent.heroImage ? 'bg-gradient-to-r from-amber-500 to-amber-400' : ''}`}>
                <h1 className="text-5xl font-serif text-white mb-2">{siteContent.heroTitle}</h1>
                <p className="text-2xl text-amber-100 mb-2">{siteContent.heroDate}</p>
                <p className="text-amber-50">{siteContent.heroSubtitle}</p>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-amber-400">
              <h2 className="text-2xl font-serif text-amber-900 mb-4">📍 Veranstaltungsort</h2>
              <p className="text-lg text-gray-700">{siteContent.location}</p>
            </div>

            {/* Description */}
            <div className="bg-gradient-to-r from-amber-50 to-teal-50 p-8 rounded-lg border border-amber-200">
              <p className="text-lg text-gray-700 leading-relaxed">{siteContent.description}</p>
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-3 gap-6">
              <button onClick={() => setCurrentPage('rsvp')} 
                className="bg-amber-100 hover:bg-amber-200 p-6 rounded-lg transition border border-amber-300">
                <div className="text-4xl mb-2">📋</div>
                <h3 className="font-serif text-lg text-amber-900 mb-1">RSVP</h3>
                <p className="text-sm text-gray-600">Melde dich an</p>
              </button>
              <button onClick={() => setCurrentPage('ablaufplan')} 
                className="bg-teal-100 hover:bg-teal-200 p-6 rounded-lg transition border border-teal-300">
                <div className="text-4xl mb-2">⏰</div>
                <h3 className="font-serif text-lg text-teal-900 mb-1">Ablaufplan</h3>
                <p className="text-sm text-gray-600">Zeitablauf</p>
              </button>
              <button onClick={() => setCurrentPage('faq')} 
                className="bg-purple-100 hover:bg-purple-200 p-6 rounded-lg transition border border-purple-300">
                <div className="text-4xl mb-2">❓</div>
                <h3 className="font-serif text-lg text-purple-900 mb-1">FAQ</h3>
                <p className="text-sm text-gray-600">Häufige Fragen</p>
              </button>
            </div>
          </div>
        )}

        {/* ABLAUFPLAN */}
        {currentPage === 'ablaufplan' && userRole && userRole !== 'admin' && (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-serif text-amber-900 mb-8 text-center">⏰ Ablaufplan</h1>

            <div className="space-y-4">
              {siteContent.guestAblaufplan.map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-amber-500 flex items-center gap-6">
                  <div className="text-3xl font-bold text-amber-600 min-w-24">{item.time}</div>
                  <div className="text-lg text-gray-700">{item.event}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RSVP */}
        {currentPage === 'rsvp' && userRole && userRole !== 'admin' && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-serif text-amber-900 mb-8 text-center">📋 Deine Zusage</h1>
            
            <form onSubmit={handleRsvp} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Kommst du?</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      checked={rsvpForm.attending === true}
                      onChange={() => setRsvpForm({...rsvpForm, attending: true})}
                      className="mr-3"
                    />
                    <span className="text-gray-700">✅ Ja, sehr gerne!</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      checked={rsvpForm.attending === false}
                      onChange={() => setRsvpForm({...rsvpForm, attending: false})}
                      className="mr-3"
                    />
                    <span className="text-gray-700">❌ Leider nein</span>
                  </label>
                </div>
              </div>

              {rsvpForm.attending && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Anzahl Erwachsene</label>
                    <input 
                      type="number" 
                      min="1"
                      value={rsvpForm.adults}
                      onChange={(e) => setRsvpForm({...rsvpForm, adults: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kinder bis 10 Jahre</label>
                    <input 
                      type="number" 
                      min="0"
                      value={rsvpForm.children}
                      onChange={(e) => setRsvpForm({...rsvpForm, children: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Hauptgericht</label>
                    <div className="space-y-2">
                      {siteContent.menuItems.map(item => (
                        <label key={item} className="flex items-center">
                          <input 
                            type="radio" 
                            checked={rsvpForm.mainCourse === item}
                            onChange={() => setRsvpForm({...rsvpForm, mainCourse: item})}
                            className="mr-3"
                          />
                          <span className="text-gray-700">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <button 
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 rounded-lg transition">
                Speichern
              </button>
            </form>
          </div>
        )}

        {/* FAQ */}
        {currentPage === 'faq' && userRole && userRole !== 'admin' && (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-serif text-amber-900 mb-8 text-center">❓ Häufig gestellte Fragen</h1>

            {/* Add Question */}
            {userRole === 'guest' && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-xl font-serif text-amber-900 mb-4">Deine Frage stellen</h2>
                <form onSubmit={handleAddFaqQuestion} className="flex gap-2">
                  <input 
                    type="text"
                    value={newFaqQuestion}
                    onChange={(e) => setNewFaqQuestion(e.target.value)}
                    placeholder="Deine Frage..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                  />
                  <button 
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium transition">
                    <Plus size={20} />
                  </button>
                </form>
              </div>
            )}

            {/* FAQ List */}
            <div className="space-y-4">
              {faqList.map(faq => (
                <details key={faq.id} className="bg-white rounded-lg shadow p-6 cursor-pointer group">
                  <summary className="font-medium text-gray-900 flex justify-between items-center">
                    <span>{faq.question}</span>
                    <ChevronDown size={20} className="group-open:rotate-180 transition" />
                  </summary>
                  <div className="mt-4 pt-4 border-t">
                    {faq.answer ? (
                      <>
                        <p className="text-gray-700 mb-2">{faq.answer}</p>
                        <p className="text-xs text-gray-500">Gefragt von: {faq.author} ({faq.date})</p>
                      </>
                    ) : (
                      <p className="text-gray-500 italic">Antwort folgt bald...</p>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* FOTOS */}
        {currentPage === 'fotos' && siteContent.googleDriveLink && userRole && userRole !== 'admin' && (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-serif text-amber-900 mb-8 text-center">📸 Fotogalerie</h1>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center space-y-6">
                <h2 className="text-2xl font-serif text-amber-900">Teilt eure Fotos mit uns! 🌸</h2>
                <a 
                  href={siteContent.googleDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-4 px-8 rounded-lg transition text-lg">
                  📸 Zur Google Drive Galerie
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ============= ADMIN VIEWS ============= */}

        {/* ADMIN HOME */}
        {currentPage === 'adminHome' && userRole === 'admin' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-serif text-amber-900">⚙️ Admin-Bereich</h1>
              <button 
                onClick={() => setAdminEditMode(!adminEditMode)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                  adminEditMode 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}>
                {adminEditMode ? <Save size={20} /> : <Edit2 size={20} />}
                {adminEditMode ? 'Bearbeitung speichern' : 'Bearbeiten'}
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-green-100 border-l-4 border-green-600 p-4 rounded">
                <p className="text-sm text-gray-600">Zusagen</p>
                <p className="text-3xl font-bold text-green-600">{attendingCount}</p>
              </div>
              <div className="bg-blue-100 border-l-4 border-blue-600 p-4 rounded">
                <p className="text-sm text-gray-600">Erwachsene</p>
                <p className="text-3xl font-bold text-blue-600">{totalAdults}</p>
              </div>
              <div className="bg-yellow-100 border-l-4 border-yellow-600 p-4 rounded">
                <p className="text-sm text-gray-600">Kinder</p>
                <p className="text-3xl font-bold text-yellow-600">{totalChildren}</p>
              </div>
              <div className="bg-purple-100 border-l-4 border-purple-600 p-4 rounded">
                <p className="text-sm text-gray-600">Gäste insgesamt</p>
                <p className="text-3xl font-bold text-purple-600">{totalAdults + totalChildren}</p>
              </div>
            </div>

            {/* Admin Edit Mode */}
            {adminEditMode && (
              <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
                <h2 className="text-2xl font-serif text-amber-900">Startseite bearbeiten</h2>

                {/* Hero Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero-Bild</label>
                  {siteContent.heroImage && (
                    <img src={siteContent.heroImage} alt="Hero" className="w-full h-48 object-cover rounded-lg mb-2" />
                  )}
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'heroImage')}
                    className="block w-full"
                  />
                </div>

                {/* Hero Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titel</label>
                  <input 
                    type="text"
                    value={siteContent.heroTitle}
                    onChange={(e) => saveContent({...siteContent, heroTitle: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Untertitel</label>
                  <input 
                    type="text"
                    value={siteContent.heroSubtitle}
                    onChange={(e) => saveContent({...siteContent, heroSubtitle: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung</label>
                  <textarea 
                    value={siteContent.description}
                    onChange={(e) => saveContent({...siteContent, description: e.target.value})}
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Google Drive Link</label>
                  <input 
                    type="text"
                    value={siteContent.googleDriveLink}
                    onChange={(e) => saveContent({...siteContent, googleDriveLink: e.target.value})}
                    placeholder="https://drive.google.com/..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm"
                  />
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="grid grid-cols-3 gap-4">
              <button onClick={() => setCurrentPage('adminGuests')} 
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg transition">
                👥 Gäste ({guestList.length})
              </button>
              <button onClick={() => setCurrentPage('adminOrganizers')} 
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg transition">
                👨‍💼 Organizer ({organizerList.length})
              </button>
              <button onClick={() => setCurrentPage('adminAblaufplan')} 
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg transition">
                📋 Ablaufplan
              </button>
            </div>
          </div>
        )}

        {/* ADMIN GÄSTE */}
        {currentPage === 'adminGuests' && userRole === 'admin' && (
          <div>
            <h1 className="text-3xl font-serif text-amber-900 mb-8">👥 Gäste verwalten</h1>

            <div className="bg-gradient-to-r from-amber-50 to-teal-50 rounded-lg shadow-lg p-8 mb-8 border border-amber-200">
              <h2 className="text-xl font-serif text-amber-900 mb-6">➕ Neuen Gast hinzufügen</h2>
              <form onSubmit={handleAddGuest} className="grid md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input 
                    type="text" 
                    value={newGuestData.name}
                    onChange={(e) => setNewGuestData({...newGuestData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={newGuestData.email}
                    onChange={(e) => setNewGuestData({...newGuestData, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <button 
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 rounded-lg transition">
                  <Plus size={18} /> Gast hinzufügen
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
              <table className="w-full">
                <thead className="bg-amber-50 border-b-2 border-amber-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Code</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-center font-medium">Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {guestList.map(guest => {
                    const rsvp = rsvpData.find(r => r.guestCode === guest.code);
                    return (
                      <tr key={guest.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{guest.name}</td>
                        <td className="px-4 py-3 font-mono text-sm bg-gray-50 rounded flex items-center gap-2">
                          {guest.code}
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(guest.code);
                              alert('Code kopiert!');
                            }}
                            className="text-amber-600 hover:text-amber-700">
                            <Copy size={16} />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm">{guest.email || '-'}</td>
                        <td className="px-4 py-3">
                          {rsvp ? (
                            rsvp.attending ? (
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">✅ Zusage</span>
                            ) : (
                              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">❌ Absage</span>
                            )
                          ) : (
                            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">⏳ Ausstehend</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button 
                            onClick={() => handleDeleteGuest(guest.id)}
                            className="text-red-600 hover:text-red-700">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button onClick={() => setCurrentPage('adminHome')} 
              className="mt-8 text-amber-600 hover:text-amber-700 font-medium">
              ← Zurück
            </button>
          </div>
        )}

        {/* ADMIN ORGANIZER */}
        {currentPage === 'adminOrganizers' && userRole === 'admin' && (
          <div>
            <h1 className="text-3xl font-serif text-amber-900 mb-8">👨‍💼 Organizer verwalten</h1>

            <div className="bg-gradient-to-r from-amber-50 to-teal-50 rounded-lg shadow-lg p-8 mb-8 border border-amber-200">
              <h2 className="text-xl font-serif text-amber-900 mb-6">➕ Neuen Organizer hinzufügen</h2>
              <form onSubmit={handleAddOrganizer} className="grid md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input 
                    type="text" 
                    value={newOrganizerData.name}
                    onChange={(e) => setNewOrganizerData({...newOrganizerData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rolle</label>
                  <select 
                    value={newOrganizerData.role}
                    onChange={(e) => setNewOrganizerData({...newOrganizerData, role: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2">
                    <option>Koordinator</option>
                    <option>Braut</option>
                    <option>Bräutigam</option>
                    <option>DJ</option>
                    <option>Fotograf</option>
                    <option>Catering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={newOrganizerData.email}
                    onChange={(e) => setNewOrganizerData({...newOrganizerData, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <button 
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 rounded-lg transition">
                  <Plus size={18} /> Hinzufügen
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
              <table className="w-full">
                <thead className="bg-amber-50 border-b-2 border-amber-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Rolle</th>
                    <th className="px-4 py-3 text-left font-medium">Code</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-center font-medium">Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {organizerList.map(org => (
                    <tr key={org.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{org.name}</td>
                      <td className="px-4 py-3 text-sm">{org.role}</td>
                      <td className="px-4 py-3 font-mono text-sm bg-gray-50 rounded flex items-center gap-2">
                        {org.code}
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(org.code);
                            alert('Code kopiert!');
                          }}
                          className="text-amber-600 hover:text-amber-700">
                          <Copy size={16} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm">{org.email || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => handleDeleteOrganizer(org.id)}
                          className="text-red-600 hover:text-red-700">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button onClick={() => setCurrentPage('adminHome')} 
              className="mt-8 text-amber-600 hover:text-amber-700 font-medium">
              ← Zurück
            </button>
          </div>
        )}

        {/* ADMIN ABLAUFPLAN */}
        {currentPage === 'adminAblaufplan' && userRole === 'admin' && (
          <div>
            <h1 className="text-3xl font-serif text-amber-900 mb-8">📋 Ablaufplan verwalten</h1>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Gast-Ablaufplan */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-serif text-amber-900 mb-6">Für Gäste sichtbar</h2>
                <div className="space-y-3">
                  {siteContent.guestAblaufplan.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-3 bg-amber-50 rounded-lg">
                      <input 
                        type="text"
                        value={item.time}
                        onChange={(e) => {
                          const updated = siteContent.guestAblaufplan.map((i, i2) => 
                            i2 === idx ? {...i, time: e.target.value} : i
                          );
                          saveContent({...siteContent, guestAblaufplan: updated});
                        }}
                        className="w-20 border border-gray-300 rounded px-2 py-1 font-mono"
                      />
                      <input 
                        type="text"
                        value={item.event}
                        onChange={(e) => {
                          const updated = siteContent.guestAblaufplan.map((i, i2) => 
                            i2 === idx ? {...i, event: e.target.value} : i
                          );
                          saveContent({...siteContent, guestAblaufplan: updated});
                        }}
                        className="flex-1 border border-gray-300 rounded px-2 py-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin-Ablaufplan */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-serif text-amber-900 mb-6">Nur für dich (Details)</h2>
                <div className="space-y-3">
                  {siteContent.adminAblaufplan.map((item, idx) => (
                    <div key={idx} className="p-3 bg-teal-50 rounded-lg space-y-1">
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={item.time}
                          onChange={(e) => {
                            const updated = siteContent.adminAblaufplan.map((i, i2) => 
                              i2 === idx ? {...i, time: e.target.value} : i
                            );
                            saveContent({...siteContent, adminAblaufplan: updated});
                          }}
                          className="w-20 border border-gray-300 rounded px-2 py-1 font-mono text-sm"
                        />
                        <input 
                          type="text"
                          value={item.event}
                          onChange={(e) => {
                            const updated = siteContent.adminAblaufplan.map((i, i2) => 
                              i2 === idx ? {...i, event: e.target.value} : i
                            );
                            saveContent({...siteContent, adminAblaufplan: updated});
                          }}
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <input 
                        type="text"
                        value={item.responsible}
                        onChange={(e) => {
                          const updated = siteContent.adminAblaufplan.map((i, i2) => 
                            i2 === idx ? {...i, responsible: e.target.value} : i
                          );
                          saveContent({...siteContent, adminAblaufplan: updated});
                        }}
                        placeholder="Verantwortlich: ..."
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => setCurrentPage('adminHome')} 
              className="mt-8 text-amber-600 hover:text-amber-700 font-medium">
              ← Zurück
            </button>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="bg-amber-900 text-amber-50 text-center py-6 mt-16 border-t-4 border-amber-700">
        <p className="text-sm">
          Hochzeitswebseite erstellt mit ❤️ | PWA-ready | Alle Daten sind sicher
        </p>
      </footer>
    </div>
  );
}
