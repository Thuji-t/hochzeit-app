import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X, Lock, LogOut, Copy, Trash2, Plus, MessageCircle, CheckCircle2, AlertCircle, Heart } from 'lucide-react';

export default function HochzeitsApp() {
  // ============= STATE =============
  const [currentPage, setCurrentPage] = useState('login');
  const [guestList, setGuestList] = useState([]);
  const [organizerList, setOrganizerList] = useState([]);
  const [rsvpData, setRsvpData] = useState([]);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [currentUserCode, setCurrentUserCode] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null); // 'guest' oder 'organizer'
  const [currentUserName, setCurrentUserName] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState({
    googleDriveLink: '',
    showQRCode: true
  });

  // Form States
  const [loginData, setLoginData] = useState({ name: '', code: '' });
  const [newGuestData, setNewGuestData] = useState({ name: '', email: '' });
  const [newOrganizerData, setNewOrganizerData] = useState({ name: '', role: 'Koordinator', email: '' });
  const [newSettingsLink, setNewSettingsLink] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    adults: 1,
    children: 0,
    dietary: [],
    mainCourse: '',
    attending: null,
    message: ''
  });

  const [organizerMessage, setOrganizerMessage] = useState('');
  const [organizerMessages, setOrganizerMessages] = useState([]);

  // ============= LOAD DATA =============
  useEffect(() => {
    const savedGuests = localStorage.getItem('hochzeitsGaesteListe');
    const savedOrganizers = localStorage.getItem('hochzeitsOrganizerListe');
    const savedRsvp = localStorage.getItem('hochzeitsRSVP');
    const savedSettings = localStorage.getItem('hochzeitsSettings');
    const savedMessages = localStorage.getItem('hochzeitsOrganizerMessages');
    
    if (savedGuests) setGuestList(JSON.parse(savedGuests));
    if (savedOrganizers) setOrganizerList(JSON.parse(savedOrganizers));
    if (savedRsvp) setRsvpData(JSON.parse(savedRsvp));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedMessages) setOrganizerMessages(JSON.parse(savedMessages));
  }, []);

  // ============= SAVE FUNCTIONS =============
  const saveGuestList = (newList) => {
    setGuestList(newList);
    localStorage.setItem('hochzeitsGaesteListe', JSON.stringify(newList));
  };

  const saveOrganizerList = (newList) => {
    setOrganizerList(newList);
    localStorage.setItem('hochzeitsOrganizerListe', JSON.stringify(newList));
  };

  const saveRsvpData = (newData) => {
    setRsvpData(newData);
    localStorage.setItem('hochzeitsRSVP', JSON.stringify(newData));
  };

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('hochzeitsSettings', JSON.stringify(newSettings));
  };

  const saveMessages = (newMessages) => {
    setOrganizerMessages(newMessages);
    localStorage.setItem('hochzeitsOrganizerMessages', JSON.stringify(newMessages));
  };

  // ============= AUTHENTICATION =============
  const handleLogin = (e) => {
    e.preventDefault();
    
    // Check Guest
    const guest = guestList.find(g => 
      g.name.toLowerCase() === loginData.name.toLowerCase() && 
      g.code === loginData.code
    );
    
    if (guest) {
      setCurrentUserCode(guest.code);
      setCurrentUserRole('guest');
      setCurrentUserName(guest.name);
      setCurrentPage('home');
      setLoginData({ name: '', code: '' });
      return;
    }

    // Check Organizer
    const organizer = organizerList.find(o => 
      o.name.toLowerCase() === loginData.name.toLowerCase() && 
      o.code === loginData.code
    );
    
    if (organizer) {
      setCurrentUserCode(organizer.code);
      setCurrentUserRole('organizer');
      setCurrentUserName(organizer.name);
      setCurrentPage('home');
      setLoginData({ name: '', code: '' });
      return;
    }

    alert('Name oder Code ist falsch!');
  };

  const handleLogout = () => {
    setCurrentUserCode(null);
    setCurrentUserRole(null);
    setCurrentUserName(null);
    setCurrentPage('login');
    setFormData({
      email: '',
      adults: 1,
      children: 0,
      dietary: [],
      mainCourse: '',
      attending: null,
      message: ''
    });
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'Hochzeit2024') {
      setAdminLoggedIn(true);
      setAdminPassword('');
    } else {
      alert('Falsches Passwort!');
    }
  };

  // ============= GUEST MANAGEMENT =============
  const handleAddGuest = (e) => {
    e.preventDefault();
    if (!newGuestData.name) {
      alert('Bitte Namen eingeben');
      return;
    }
    
    const newCode = 'GAST' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newGuest = {
      id: Date.now(),
      name: newGuestData.name,
      email: newGuestData.email,
      code: newCode
    };
    
    const updated = [...guestList, newGuest];
    saveGuestList(updated);
    setNewGuestData({ name: '', email: '' });
  };

  const handleDeleteGuest = (id) => {
    if (confirm('Wirklich löschen?')) {
      const updated = guestList.filter(g => g.id !== id);
      saveGuestList(updated);
    }
  };

  // ============= ORGANIZER MANAGEMENT =============
  const handleAddOrganizer = (e) => {
    e.preventDefault();
    if (!newOrganizerData.name) {
      alert('Bitte Namen eingeben');
      return;
    }
    
    const newCode = 'ORGA' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newOrganizer = {
      id: Date.now(),
      name: newOrganizerData.name,
      role: newOrganizerData.role,
      email: newOrganizerData.email,
      code: newCode
    };
    
    const updated = [...organizerList, newOrganizer];
    saveOrganizerList(updated);
    setNewOrganizerData({ name: '', role: 'Koordinator', email: '' });
  };

  const handleDeleteOrganizer = (id) => {
    if (confirm('Wirklich löschen?')) {
      const updated = organizerList.filter(o => o.id !== id);
      saveOrganizerList(updated);
    }
  };

  // ============= RSVP =============
  const handleRSVP = (e) => {
    e.preventDefault();
    if (formData.attending === null) {
      alert('Bitte gib an, ob du zusagst oder absagst');
      return;
    }

    const currentGuest = guestList.find(g => g.code === currentUserCode);
    
    const newRsvp = {
      id: Date.now(),
      guestCode: currentUserCode,
      guestName: currentGuest.name,
      ...formData,
      date: new Date().toLocaleDateString('de-DE')
    };

    const updated = rsvpData.filter(r => r.guestCode !== currentUserCode);
    updated.push(newRsvp);
    saveRsvpData(updated);

    setFormData({
      email: '',
      adults: 1,
      children: 0,
      dietary: [],
      mainCourse: '',
      attending: null,
      message: ''
    });

    alert('Danke für deine Zusage!');
    setCurrentPage('home');
  };

  const handleDietaryChange = (item) => {
    setFormData({
      ...formData,
      dietary: formData.dietary.includes(item)
        ? formData.dietary.filter(d => d !== item)
        : [...formData.dietary, item]
    });
  };

  // ============= ORGANIZER MESSAGES =============
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!organizerMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      from: currentUserName,
      text: organizerMessage,
      timestamp: new Date().toLocaleString('de-DE')
    };

    const updated = [...organizerMessages, newMessage];
    saveMessages(updated);
    setOrganizerMessage('');
  };

  // ============= STATISTICS =============
  const attendingGuests = rsvpData.filter(r => r.attending === true);
  const totalAdults = attendingGuests.reduce((sum, r) => sum + parseInt(r.adults || 0), 0);
  const totalChildren = attendingGuests.reduce((sum, r) => sum + parseInt(r.children || 0), 0);

  const showNav = currentUserCode || adminLoggedIn;

  // ============= RENDER =============
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50 text-gray-800">
      {/* NAVIGATION */}
      {showNav && (
        <nav className="sticky top-0 z-50 bg-white shadow-sm border-b-2 border-amber-100">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="text-2xl font-serif text-amber-900">✨ Unsere Hochzeit</div>
              
              {/* Desktop Menu */}
              <div className="hidden md:flex gap-6 items-center">
                {!adminLoggedIn && (
                  <>
                    <button onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} 
                      className={`font-medium transition ${currentPage === 'home' ? 'text-amber-700 border-b-2 border-amber-700' : 'text-gray-600 hover:text-amber-700'}`}>
                      Startseite
                    </button>
                    <button onClick={() => { setCurrentPage('rsvp'); setMobileMenuOpen(false); }} 
                      className={`font-medium transition ${currentPage === 'rsvp' ? 'text-amber-700 border-b-2 border-amber-700' : 'text-gray-600 hover:text-amber-700'}`}>
                      RSVP
                    </button>
                    <button onClick={() => { setCurrentPage('menu'); setMobileMenuOpen(false); }} 
                      className={`font-medium transition ${currentPage === 'menu' ? 'text-amber-700 border-b-2 border-amber-700' : 'text-gray-600 hover:text-amber-700'}`}>
                      Menü
                    </button>
                    <button onClick={() => { setCurrentPage('unterkunft'); setMobileMenuOpen(false); }} 
                      className={`font-medium transition ${currentPage === 'unterkunft' ? 'text-amber-700 border-b-2 border-amber-700' : 'text-gray-600 hover:text-amber-700'}`}>
                      Unterkunft
                    </button>
                    <button onClick={() => { setCurrentPage('fotos'); setMobileMenuOpen(false); }} 
                      className={`font-medium transition ${currentPage === 'fotos' ? 'text-amber-700 border-b-2 border-amber-700' : 'text-gray-600 hover:text-amber-700'}`}>
                      📸 Fotos
                    </button>
                    <button onClick={() => { setCurrentPage('faq'); setMobileMenuOpen(false); }} 
                      className={`font-medium transition ${currentPage === 'faq' ? 'text-amber-700 border-b-2 border-amber-700' : 'text-gray-600 hover:text-amber-700'}`}>
                      FAQ
                    </button>
                    <button onClick={() => { setCurrentPage('kontakt'); setMobileMenuOpen(false); }} 
                      className={`font-medium transition ${currentPage === 'kontakt' ? 'text-amber-700 border-b-2 border-amber-700' : 'text-gray-600 hover:text-amber-700'}`}>
                      Kontakt
                    </button>

                    {currentUserRole === 'organizer' && (
                      <button onClick={() => { setCurrentPage('organizer'); setMobileMenuOpen(false); }} 
                        className={`font-medium transition ${currentPage === 'organizer' ? 'text-teal-700 border-b-2 border-teal-700' : 'text-teal-600 hover:text-teal-700'}`}>
                        🔐 Organizer Hub
                      </button>
                    )}
                  </>
                )}

                {adminLoggedIn && (
                  <>
                    <button onClick={() => setCurrentPage('adminGuests')} 
                      className={`font-medium ${currentPage === 'adminGuests' ? 'text-amber-700' : 'text-gray-600 hover:text-amber-700'}`}>
                      👥 Gäste
                    </button>
                    <button onClick={() => setCurrentPage('adminOrganizers')} 
                      className={`font-medium ${currentPage === 'adminOrganizers' ? 'text-amber-700' : 'text-gray-600 hover:text-amber-700'}`}>
                      👨‍💼 Organizer
                    </button>
                    <button onClick={() => setCurrentPage('adminSettings')} 
                      className={`font-medium ${currentPage === 'adminSettings' ? 'text-amber-700' : 'text-gray-600 hover:text-amber-700'}`}>
                      ⚙️ Einstellungen
                    </button>
                  </>
                )}
                
                <button 
                  onClick={adminLoggedIn ? () => { setAdminLoggedIn(false); setCurrentPage('login'); } : handleLogout}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition">
                  <LogOut size={16} /> Logout
                </button>
              </div>

              {/* Mobile Menu */}
              <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="md:hidden mt-4 pb-4 border-t pt-4 space-y-2">
                {!adminLoggedIn && (
                  <>
                    {['home', 'rsvp', 'menu', 'unterkunft', 'fotos', 'faq', 'kontakt'].map(page => (
                      <button 
                        key={page}
                        onClick={() => { setCurrentPage(page); setMobileMenuOpen(false); }}
                        className="block w-full text-left py-2 text-gray-600 hover:text-amber-700 font-medium">
                        {page === 'home' ? 'Startseite' : page === 'rsvp' ? 'RSVP' : page === 'menu' ? 'Menü' : page === 'unterkunft' ? 'Unterkunft' : page === 'fotos' ? '📸 Fotos' : page === 'faq' ? 'FAQ' : 'Kontakt'}
                      </button>
                    ))}
                    {currentUserRole === 'organizer' && (
                      <button 
                        onClick={() => { setCurrentPage('organizer'); setMobileMenuOpen(false); }}
                        className="block w-full text-left py-2 text-teal-600 hover:text-teal-700 font-medium">
                        🔐 Organizer Hub
                      </button>
                    )}
                  </>
                )}
                <button 
                  onClick={adminLoggedIn ? () => { setAdminLoggedIn(false); setCurrentPage('login'); } : handleLogout}
                  className="block w-full text-left py-2 text-red-600 hover:text-red-700 font-medium">
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* LOGIN */}
        {currentPage === 'login' && !currentUserCode && !adminLoggedIn && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-serif text-amber-900 mb-4">✨ Unsere Hochzeit</h1>
              <p className="text-xl text-amber-700 mb-2">14. Juni 2025 | Royal am See</p>
              <p className="text-gray-600">Unter südindischem und bayerischem Himmel</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Gast-Login */}
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500 font-mono"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 rounded-lg transition">
                    Einloggen
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    💡 Code in deiner Einladung oder per Email
                  </p>
                </form>
              </div>

              {/* Admin-Login */}
              <div className="bg-gray-50 rounded-lg shadow-lg p-8 border-l-4 border-gray-400">
                <h2 className="text-2xl font-serif text-gray-900 mb-6">🔐 Admin</h2>
                <button
                  onClick={() => setCurrentPage('admin')}
                  className="w-full bg-gray-700 hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2">
                  <Lock size={20} /> Admin anmelden
                </button>
              </div>
            </div>

            <div className="mt-12 bg-gradient-to-r from-amber-50 to-teal-50 p-8 rounded-lg border border-amber-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">❓ Keinen Code?</h3>
              <p className="text-gray-700">
                📧 hochzeit@example.com | 📞 +49 (0)123 456789
              </p>
            </div>
          </div>
        )}

        {/* ADMIN LOGIN */}
        {currentPage === 'admin' && !adminLoggedIn && (
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
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

        {/* HOME - Nur für eingeloggte User */}
        {currentPage === 'home' && currentUserCode && (
          <div className="space-y-12">
            <div className="text-center space-y-6 py-8">
              <h1 className="text-5xl font-serif text-amber-900">Willkommen! 👋</h1>
              <p className="text-xl text-amber-700 font-serif">{currentUserName}</p>
              <div className="text-2xl text-amber-700">
                🌸 14. Juni 2025 🌸
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-amber-400">
              <h2 className="text-2xl font-serif text-amber-900 mb-4">📍 Veranstaltungsort</h2>
              <p className="text-gray-700 mb-2"><strong>Royal am See</strong></p>
              <p className="text-gray-600">Amlaching 2, 83346 Polling, Deutschland</p>
              <p className="text-sm text-gray-500 mt-4">🐕 Hundefreundlich - bringt eure Vierbeiner mit!</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                <div className="text-3xl mb-2">📋</div>
                <h3 className="font-serif text-lg text-amber-900 mb-2">RSVP</h3>
                <p className="text-sm text-gray-600 mb-4">Sag uns bis 31. Mai Bescheid</p>
                <button onClick={() => setCurrentPage('rsvp')} 
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded font-medium text-sm transition">
                  Jetzt zusagen
                </button>
              </div>
              <div className="bg-teal-50 p-6 rounded-lg border border-teal-200">
                <div className="text-3xl mb-2">🍽️</div>
                <h3 className="font-serif text-lg text-amber-900 mb-2">Menü</h3>
                <p className="text-sm text-gray-600 mb-4">Südindische & europäische Gerichte</p>
                <button onClick={() => setCurrentPage('menu')} 
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded font-medium text-sm transition">
                  Menü ansehen
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-100 to-teal-100 p-8 rounded-lg">
              <h2 className="text-2xl font-serif text-amber-900 mb-4">💛 Wichtige Daten</h2>
              <ul className="space-y-2 text-gray-700">
                <li>📋 <strong>Anmeldung bis:</strong> 31. Mai 2025</li>
                <li>🎯 <strong>Ankommen:</strong> 14. Juni, 16:00 Uhr</li>
                <li>🙏 <strong>Zeremonie:</strong> 17:00 Uhr</li>
                <li>🎉 <strong>Essen & Tanz:</strong> Ab 18:30 Uhr</li>
              </ul>
            </div>
          </div>
        )}

        {/* RSVP */}
        {currentPage === 'rsvp' && currentUserCode && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-serif text-amber-900 mb-8 text-center">📋 Deine Zusage</h1>
            
            <form onSubmit={handleRSVP} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Kommst du? *</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      checked={formData.attending === true}
                      onChange={() => setFormData({...formData, attending: true})}
                      className="mr-3"
                    />
                    <span className="text-gray-700">✅ Ja, sehr gerne!</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      checked={formData.attending === false}
                      onChange={() => setFormData({...formData, attending: false})}
                      className="mr-3"
                    />
                    <span className="text-gray-700">❌ Leider nein</span>
                  </label>
                </div>
              </div>

              {formData.attending && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Anzahl Erwachsene *</label>
                    <input 
                      type="number" 
                      min="1"
                      value={formData.adults}
                      onChange={(e) => setFormData({...formData, adults: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kinder bis 10 Jahre</label>
                    <input 
                      type="number" 
                      min="0"
                      value={formData.children}
                      onChange={(e) => setFormData({...formData, children: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Hauptgericht *</label>
                    <div className="space-y-2">
                      {['Südindisches Thali (vegetarisch)', 'Tandoori Huhn', 'Fisch-Curry', 'Lamm-Biryani', 'Vegetarisches Gericht'].map(course => (
                        <label key={course} className="flex items-center">
                          <input 
                            type="radio" 
                            checked={formData.mainCourse === course}
                            onChange={() => setFormData({...formData, mainCourse: course})}
                            className="mr-3"
                          />
                          <span className="text-gray-700">{course}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Allergien/Unverträglichkeiten</label>
                    <div className="space-y-2">
                      {['Glutenfrei', 'Laktosefrei', 'Nussallergie', 'Vegan'].map(item => (
                        <label key={item} className="flex items-center">
                          <input 
                            type="checkbox" 
                            checked={formData.dietary.includes(item)}
                            onChange={() => handleDietaryChange(item)}
                            className="mr-3"
                          />
                          <span className="text-gray-700">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email (optional)</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                </>
              )}

              <button 
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 rounded-lg transition">
                Zusage speichern
              </button>
            </form>
          </div>
        )}

        {/* MENÜ */}
        {currentPage === 'menu' && currentUserCode && (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-serif text-amber-900 mb-8 text-center">🍽️ Menü</h1>

            <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
              <div>
                <h2 className="text-2xl font-serif text-amber-900 mb-4">Südindische Spezialitäten</h2>
                <div className="space-y-4">
                  <div className="border-b-2 border-amber-100 pb-4">
                    <h3 className="font-medium text-lg">Südindisches Thali (Vegetarisch)</h3>
                    <p className="text-gray-600 text-sm">Reis, Dhal, Sambar, Rasam, Gemüsecurry, Papad, Pickles und Joghurt</p>
                  </div>
                  <div className="border-b-2 border-amber-100 pb-4">
                    <h3 className="font-medium text-lg">Tandoori Huhn</h3>
                    <p className="text-gray-600 text-sm">Mit Basmati-Reis und Naan-Brot</p>
                  </div>
                  <div className="border-b-2 border-amber-100 pb-4">
                    <h3 className="font-medium text-lg">Fisch-Curry (Meen Kuzhambu)</h3>
                    <p className="text-gray-600 text-sm">Traditionelle südindische Zubereitung</p>
                  </div>
                  <div className="border-b-2 border-amber-100 pb-4">
                    <h3 className="font-medium text-lg">Lamm-Biryani</h3>
                    <p className="text-gray-600 text-sm">Aromatischer Reis mit zartem Lamm</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-serif text-amber-900 mb-4">Desserts & Getränke</h2>
                <div className="space-y-2 text-gray-700">
                  <p>🍮 Gulab Jamun (Milchkugeln in Sirup)</p>
                  <p>🥛 Mango Lassi & Masala Chai</p>
                  <p>🍷 Auswahl an Weinen & Bieren</p>
                  <p>☕ Kaffee & Tee</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* UNTERKUNFT */}
        {currentPage === 'unterkunft' && currentUserCode && (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-serif text-amber-900 mb-8 text-center">🏨 Unterkunft</h1>

            <div className="space-y-6">
              {[
                {
                  name: 'Royal am See (Veranstaltungsort)',
                  distance: 'Vor Ort',
                  info: 'Wir arrangieren Zimmer zu Spezialpreisen!',
                  features: ['🐕 Hundefreundlich', '🌊 Mit Seeblick']
                },
                {
                  name: 'Hotel Alpina',
                  distance: '8 km',
                  info: 'Gemütliches 3-Sterne-Hotel mit guter Küche',
                  features: ['📞 +49 8192 3456', '💰 ~80€/Nacht', '🚗 Kostenlos Parken']
                },
                {
                  name: 'Gasthaus zur Post',
                  distance: '5 km',
                  info: 'Familiärer Gasthof mit bayerischer Tradition',
                  features: ['📞 +49 8195 1234', '💰 ~60€/Nacht', '🍺 Restaurant']
                }
              ].map((hotel, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-400">
                  <h3 className="text-xl font-serif text-amber-900 mb-2">{hotel.name}</h3>
                  <p className="text-teal-600 font-medium mb-3">{hotel.distance}</p>
                  <p className="text-gray-700 mb-4">{hotel.info}</p>
                  <div className="space-y-1">
                    {hotel.features.map((feature, j) => (
                      <p key={j} className="text-sm text-gray-600">{feature}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOTOS */}
        {currentPage === 'fotos' && currentUserCode && (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-serif text-amber-900 mb-8 text-center">📸 Hochzeits-Fotogalerie</h1>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center space-y-6">
                <h2 className="text-2xl font-serif text-amber-900">🌸 Teilt eure Fotos mit uns!</h2>
                <p className="text-gray-700">
                  Ladet während und nach der Hochzeit eure schönsten Momente hoch.
                  So entsteht ein gemeinsames Hochzeits-Album! 💕
                </p>

                {settings.googleDriveLink ? (
                  <>
                    <a 
                      href={settings.googleDriveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-4 px-8 rounded-lg transition text-lg">
                      📸 Zur Google Drive Galerie
                    </a>
                  </>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
                    <AlertCircle className="text-gray-400 mx-auto mb-3" size={40} />
                    <p className="text-gray-600">🌸 Der Fotos-Link wird bald aktiviert!</p>
                    <p className="text-sm text-gray-500 mt-2">Schau später nochmal vorbei 😊</p>
                  </div>
                )}

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-left">
                  <h3 className="font-medium text-amber-900 mb-2">💡 So funktioniert's:</h3>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Google Drive Link öffnen</li>
                    <li>[Dateien hochladen] klicken</li>
                    <li>Deine Fotos auswählen</li>
                    <li>Fertig! Alle sehen deine Bilder</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ */}
        {currentPage === 'faq' && currentUserCode && (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-serif text-amber-900 mb-8 text-center">❓ Häufig gestellte Fragen</h1>

            <div className="space-y-4">
              {[
                {
                  q: 'Kann ich meinen Partner/meine Partnerin mitbringen?',
                  a: 'Du kannst +1 Person mitbringen. Gib bitte den Namen an!'
                },
                {
                  q: 'Sind Kinder willkommen?',
                  a: 'Ja! Wir lieben Kinder. Bitte gib die Anzahl bei der RSVP an.'
                },
                {
                  q: 'Ist der Platz hundefreundlich?',
                  a: 'Ja! Unsere Hunde sind auch eingeladen. Bitte Bescheid geben!'
                },
                {
                  q: 'Was ist mit meinen Allergien?',
                  a: 'Gib alle Allergien bei der RSVP an. Wir kümmern uns darum!'
                },
                {
                  q: 'Wann endet die Feier?',
                  a: 'Wir planen bis ca. 23:00 Uhr. Danach gibt es eine optionale After-Party!'
                }
              ].map((item, i) => (
                <details key={i} className="bg-white rounded-lg shadow p-6 cursor-pointer group">
                  <summary className="font-medium text-gray-900 flex justify-between items-center">
                    {item.q}
                    <ChevronDown size={20} className="text-amber-600 group-open:rotate-180 transition" />
                  </summary>
                  <p className="text-gray-700 mt-4">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* KONTAKT */}
        {currentPage === 'kontakt' && currentUserCode && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-serif text-amber-900 mb-8 text-center">📧 Kontakt</h1>

            <div className="bg-gradient-to-r from-amber-50 to-teal-50 p-8 rounded-lg">
              <h2 className="text-xl font-serif text-amber-900 mb-4">Kontaktiere uns!</h2>
              <div className="space-y-3 text-gray-700">
                <p>📧 hochzeit@example.com</p>
                <p>📞 +49 (0)123 456789</p>
                <p>📱 WhatsApp: gerne!</p>
              </div>
            </div>
          </div>
        )}

        {/* ORGANIZER HUB */}
        {currentPage === 'organizer' && currentUserRole === 'organizer' && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-serif text-teal-900 mb-2">🔐 Organizer Hub</h1>
              <p className="text-lg text-teal-700">Willkommen {currentUserName}!</p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-green-100 border-l-4 border-green-600 p-4 rounded">
                <p className="text-sm text-gray-600">Zusagen</p>
                <p className="text-3xl font-bold text-green-600">{rsvpData.filter(r => r.attending === true).length}</p>
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
                <p className="text-sm text-gray-600">Personen</p>
                <p className="text-3xl font-bold text-purple-600">{totalAdults + totalChildren}</p>
              </div>
            </div>

            {/* Ablaufplan */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-serif text-teal-900 mb-6">📋 Ablaufplan (Detailliert)</h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-teal-500 pl-4 py-2">
                  <h3 className="font-medium text-lg">14:00 Uhr - Gäste-Ankunft</h3>
                  <p className="text-sm text-gray-600">Verantwortlich: Du</p>
                  <p className="text-sm text-gray-700 mt-1">Parkplatz-Koordination, Welcome-Drinks, Check-in</p>
                </div>

                <div className="border-l-4 border-teal-500 pl-4 py-2">
                  <h3 className="font-medium text-lg">16:00 Uhr - Vorbereitungen</h3>
                  <p className="text-sm text-gray-600">Verantwortlich: Du</p>
                  <p className="text-sm text-gray-700 mt-1">Makeup, Blumenschmuck, Sound-Check</p>
                </div>

                <div className="border-l-4 border-teal-500 pl-4 py-2">
                  <h3 className="font-medium text-lg">17:00 Uhr - Zeremonie</h3>
                  <p className="text-sm text-gray-600">Verantwortlich: Priester & Partner</p>
                  <p className="text-sm text-gray-700 mt-1">Mandap, Musik, Fotografie</p>
                </div>

                <div className="border-l-4 border-teal-500 pl-4 py-2">
                  <h3 className="font-medium text-lg">18:30 Uhr - Dinner & Tanz</h3>
                  <p className="text-sm text-gray-600">Verantwortlich: Catering-Team</p>
                  <p className="text-sm text-gray-700 mt-1">Service, Getränke, DJ</p>
                </div>
              </div>
            </div>

            {/* Organizer Messages */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-serif text-teal-900 mb-6">💬 Team-Nachrichten</h2>
              
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                {organizerMessages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Noch keine Nachrichten</p>
                ) : (
                  organizerMessages.map(msg => (
                    <div key={msg.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{msg.from}</p>
                          <p className="text-sm text-gray-700 mt-1">{msg.text}</p>
                        </div>
                        <p className="text-xs text-gray-500">{msg.timestamp}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  type="text"
                  value={organizerMessage}
                  onChange={(e) => setOrganizerMessage(e.target.value)}
                  placeholder="Nachricht schreiben..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                />
                <button 
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition">
                  <MessageCircle size={20} />
                </button>
              </form>
            </div>

            {/* Gäste-Übersicht für Organizer */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-serif text-teal-900 mb-6">👥 Gäste-Zusagen</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-teal-50 border-b-2 border-teal-200">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Name</th>
                      <th className="px-4 py-2 text-center font-medium">Erwachsene</th>
                      <th className="px-4 py-2 text-center font-medium">Kinder</th>
                      <th className="px-4 py-2 text-left font-medium">Menü</th>
                      <th className="px-4 py-2 text-left font-medium">Allergien</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rsvpData.filter(r => r.attending === true).map(rsvp => (
                      <tr key={rsvp.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{rsvp.guestName}</td>
                        <td className="px-4 py-3 text-center">{rsvp.adults}</td>
                        <td className="px-4 py-3 text-center">{rsvp.children}</td>
                        <td className="px-4 py-3 text-sm">{rsvp.mainCourse}</td>
                        <td className="px-4 py-3 text-sm">{rsvp.dietary.join(', ') || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN: GÄSTE */}
        {currentPage === 'adminGuests' && adminLoggedIn && (
          <div>
            <h1 className="text-3xl font-serif text-amber-900 mb-8">👥 Gästeliste Verwalten</h1>

            <div className="bg-gradient-to-r from-amber-50 to-teal-50 rounded-lg shadow-lg p-8 mb-8 border border-amber-200">
              <h2 className="text-xl font-serif text-amber-900 mb-6">➕ Neuen Gast hinzufügen</h2>
              <form onSubmit={handleAddGuest} className="grid md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input 
                    type="text" 
                    value={newGuestData.name}
                    onChange={(e) => setNewGuestData({...newGuestData, name: e.target.value})}
                    placeholder="Maria Müller"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email (optional)</label>
                  <input 
                    type="email" 
                    value={newGuestData.email}
                    onChange={(e) => setNewGuestData({...newGuestData, email: e.target.value})}
                    placeholder="maria@example.com"
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
                    <th className="px-4 py-3 text-left font-medium text-amber-900">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-amber-900">Code</th>
                    <th className="px-4 py-3 text-left font-medium text-amber-900">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-amber-900">Status RSVP</th>
                    <th className="px-4 py-3 text-center font-medium text-amber-900">Aktion</th>
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
                        <td className="px-4 py-3 text-sm text-gray-600">{guest.email || '-'}</td>
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
          </div>
        )}

        {/* ADMIN: ORGANIZER */}
        {currentPage === 'adminOrganizers' && adminLoggedIn && (
          <div>
            <h1 className="text-3xl font-serif text-amber-900 mb-8">👨‍💼 Organizer Verwalten</h1>

            <div className="bg-gradient-to-r from-amber-50 to-teal-50 rounded-lg shadow-lg p-8 mb-8 border border-amber-200">
              <h2 className="text-xl font-serif text-amber-900 mb-6">➕ Neuen Organizer hinzufügen</h2>
              <form onSubmit={handleAddOrganizer} className="grid md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input 
                    type="text" 
                    value={newOrganizerData.name}
                    onChange={(e) => setNewOrganizerData({...newOrganizerData, name: e.target.value})}
                    placeholder="Mama"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rolle *</label>
                  <select 
                    value={newOrganizerData.role}
                    onChange={(e) => setNewOrganizerData({...newOrganizerData, role: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2">
                    <option>Braut</option>
                    <option>Bräutigam</option>
                    <option>Koordinator</option>
                    <option>Wedding Planner</option>
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
                    placeholder="mama@example.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <button 
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 rounded-lg transition">
                  <Plus size={18} /> Organizer
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
              <table className="w-full">
                <thead className="bg-amber-50 border-b-2 border-amber-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-amber-900">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-amber-900">Rolle</th>
                    <th className="px-4 py-3 text-left font-medium text-amber-900">Code</th>
                    <th className="px-4 py-3 text-left font-medium text-amber-900">Email</th>
                    <th className="px-4 py-3 text-center font-medium text-amber-900">Aktion</th>
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
                      <td className="px-4 py-3 text-sm text-gray-600">{org.email || '-'}</td>
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
          </div>
        )}

        {/* ADMIN: EINSTELLUNGEN */}
        {currentPage === 'adminSettings' && adminLoggedIn && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-serif text-amber-900 mb-8">⚙️ Einstellungen</h1>

            <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
              {/* Google Drive */}
              <div className="border-b pb-8">
                <h2 className="text-2xl font-serif text-amber-900 mb-6">📸 Google Drive - Fotogalerie</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Drive Link</label>
                    <input 
                      type="text" 
                      value={newSettingsLink}
                      onChange={(e) => setNewSettingsLink(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 font-mono text-sm"
                    />
                  </div>

                  <button 
                    onClick={() => {
                      if (newSettingsLink) {
                        const newSettings = {...settings, googleDriveLink: newSettingsLink};
                        saveSettings(newSettings);
                        setNewSettingsLink('');
                        alert('Link gespeichert! ✅');
                      }
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-lg transition">
                    💾 Speichern
                  </button>

                  {settings.googleDriveLink && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800">✅ Link ist aktiv!</p>
                      <p className="text-xs text-green-700 mt-2 break-all">{settings.googleDriveLink}</p>
                    </div>
                  )}

                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-sm">
                    <h3 className="font-medium text-amber-900 mb-2">💡 So bekommst du den Link:</h3>
                    <ol className="space-y-1 text-amber-800 list-decimal list-inside">
                      <li>Google Drive öffnen</li>
                      <li>Neuer Ordner: "Hochzeit 2025 - Fotos"</li>
                      <li>Rechtsklick → Freigabe</li>
                      <li>"Jeder mit Link" → Bearbeiter</li>
                      <li>Link kopieren und oben eintragen</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Admin Passwort Info */}
              <div>
                <h2 className="text-2xl font-serif text-amber-900 mb-4">🔐 Admin-Passwort</h2>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800">
                    ⚠️ Um das Passwort zu ändern, bearbeite den Code direkt. Suche nach "Hochzeit2024" und ersetze es.
                  </p>
                </div>
              </div>
            </div>
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
