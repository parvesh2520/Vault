import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { sound } from './sound.js'
import iitmLogo from './assets/iitm-logo.png'
import './styles.css'

// IIT MADRAS CAMPUS LOCKERS (INCLUDING ADMIN BUILDING & THARAMANI GATE NORMAL + COLD UNITS)
const LOCKERS = [
  { id: 'mandakini', name: 'Mandakini Hostel', short: 'Mandakini Unit', kind: 'regular', capacity: 20, location: 'North Campus · Ground Floor' },
  { id: 'ganga', name: 'Ganga Hostel', short: 'Ganga Unit', kind: 'regular', capacity: 20, location: 'North Campus · Main Lobby' },
  { id: 'krishna', name: 'Krishna Hostel', short: 'Krishna Unit', kind: 'regular', capacity: 20, location: 'South Campus · Entrance Portico' },
  { id: 'admin-regular', name: 'Admin Building (Standard)', short: 'Admin Normal Unit', kind: 'regular', capacity: 16, location: 'Central Campus · Admin Foyer' },
  { id: 'admin-cold', name: 'Admin Building (Cold Storage)', short: 'Admin Cryo Unit', kind: 'cold', capacity: 12, location: 'Central Campus · 4°C Cryo Bay' },
  { id: 'tharamani-regular', name: 'Tharamani Gate (Standard)', short: 'Tharamani Normal Unit', kind: 'regular', capacity: 16, location: 'Security Gate · Main Kiosk' },
  { id: 'tharamani', name: 'Tharamani Gate (Cold Storage)', short: 'Tharamani Cold Unit', kind: 'cold', capacity: 12, location: 'Security Gate · 4°C Regulated' },
]

// INITIAL DEMO DATA
const seedParcels = [
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `AMZN-M${101 + i}`,
    lockerId: 'mandakini',
    compartment: i + 1,
    phone: `984001230${i}`,
    student: i === 0 ? 'Ananya Subramaniam' : `Hostel Resident #${i + 1}`,
    status: 'stored',
    createdAt: 'Today, 10:30 AM',
    otp: `${160000 + i}`,
    type: 'regular',
    charge: 18,
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `BLU-G${201 + i}`,
    lockerId: 'ganga',
    compartment: i + 1,
    phone: `984002340${i}`,
    student: i === 0 ? 'Rohan Verma' : `Ganga Scholar #${i + 1}`,
    status: 'stored',
    createdAt: 'Today, 11:15 AM',
    otp: `${170000 + i}`,
    type: 'regular',
    charge: 18,
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `DEL-K${301 + i}`,
    lockerId: 'krishna',
    compartment: i + 1,
    phone: `984003450${i}`,
    student: i === 0 ? 'Kavya Nair' : `Research Scholar #${i + 1}`,
    status: 'stored',
    createdAt: 'Today, 11:45 AM',
    otp: `${180000 + i}`,
    type: 'regular',
    charge: 18,
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `ADM-REG-${501 + i}`,
    lockerId: 'admin-regular',
    compartment: i + 1,
    phone: `984005670${i}`,
    student: i === 0 ? 'Prof. Sundararajan' : `Admin Staff Member #${i + 1}`,
    status: 'stored',
    createdAt: 'Today, 09:40 AM',
    otp: `${150000 + i}`,
    type: 'regular',
    charge: 18,
  })),
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `ADM-COLD-${601 + i}`,
    lockerId: 'admin-cold',
    compartment: i + 1,
    phone: `984006780${i}`,
    student: i === 0 ? 'Dr. Meenakshi' : `Research Fellow #${i + 1}`,
    status: 'stored',
    createdAt: 'Today, 08:50 AM',
    otp: `${140000 + i}`,
    type: 'cold',
    charge: 45,
  })),
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `THA-REG-${701 + i}`,
    lockerId: 'tharamani-regular',
    compartment: i + 1,
    phone: `984007890${i}`,
    student: i === 0 ? 'Vikram R.' : `Campus Resident #${i + 1}`,
    status: 'stored',
    createdAt: 'Today, 10:10 AM',
    otp: `${130000 + i}`,
    type: 'regular',
    charge: 18,
  })),
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `SWG-FRZ-${401 + i}`,
    lockerId: 'tharamani',
    compartment: i + 1,
    phone: `984004560${i}`,
    student: i === 0 ? 'Aditya Iyer' : `Campus Resident #${i + 1}`,
    status: 'stored',
    createdAt: 'Today, 12:20 PM',
    otp: `${190000 + i}`,
    type: 'cold',
    charge: 45,
  })),
]

const initialData = {
  parcels: seedParcels,
  students: [
    { name: 'Ananya Subramaniam', phone: '9840012300', hostel: 'Mandakini Hostel' },
    { name: 'Rohan Verma', phone: '9840023400', hostel: 'Ganga Hostel' },
    { name: 'Kavya Nair', phone: '9840034500', hostel: 'Krishna Hostel' },
    { name: 'Prof. Sundararajan', phone: '9840056700', hostel: 'Admin Building' },
    { name: 'Dr. Meenakshi', phone: '9840067800', hostel: 'Admin Building' },
    { name: 'Aditya Iyer', phone: '9840045600', hostel: 'Tharamani Gate' },
  ],
  prices: { regular: 18, cold: 45 },
}

const loadData = () => {
  try {
    const raw = localStorage.getItem('vault-app-data-v3')
    return raw ? JSON.parse(raw) : initialData
  } catch {
    return initialData
  }
}

const loadSession = () => {
  try {
    const raw = localStorage.getItem('vault-app-session-v3')
    return raw ? JSON.parse(raw) : initialData.students[0]
  } catch {
    return initialData.students[0]
  }
}

function lockerById(id) {
  return LOCKERS.find(l => l.id === id) || LOCKERS[0]
}

function occupancy(locker, parcels) {
  return parcels.filter(p => p.lockerId === locker.id && p.status === 'stored').length
}

// --------------------------------------------------------------------------
// SIMPLE SVG ICONS
// --------------------------------------------------------------------------
function Icon({ name, size = 16 }) {
  const icons = {
    box: <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z M3.3 7 12 12l8.7-5 M12 22V12" />,
    grid: <path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z" />,
    key: <><circle cx="7.5" cy="15.5" r="4.5" /><path d="m11 12 9-9 3 3-2 2-2-2-3 3" /></>,
    user: <><circle cx="12" cy="7" r="4" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></>,
    scan: <><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" /><line x1="7" y1="12" x2="17" y2="12" strokeWidth="2" /></>,
    map: <><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></>,
    check: <polyline points="20 6 9 17 4 12" />,
    snowflake: <><line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><circle cx="12" cy="12" r="2" /></>,
    soundOn: <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" /></>,
    soundMute: <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></>,
    arrowRight: <path d="M5 12h14M13 5l7 7-7 7" />,
    info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name] || null}
    </svg>
  )
}

// --------------------------------------------------------------------------
// MODULAR LOCKER CABINET (CLEAN LIGHT DESIGN)
// --------------------------------------------------------------------------
function LockerCabinet({ locker, parcels, openCompartment, onSelectCompartment, interactive = true }) {
  const [manualOpens, setManualOpens] = useState({})

  const occupiedMap = useMemo(() => {
    const map = {}
    parcels
      .filter(p => p.lockerId === locker.id && p.status === 'stored')
      .forEach(p => { map[p.compartment] = p })
    return map
  }, [locker.id, parcels])

  const toggleDoor = (num) => {
    sound.playSolenoid()
    sound.playDoorOpen()
    setManualOpens(prev => ({ ...prev, [num]: !prev[num] }))
    if (onSelectCompartment) {
      onSelectCompartment(num)
    }
  }

  const used = occupancy(locker, parcels)
  const free = locker.capacity - used

  return (
    <div className="locker-cabinet">
      <div className="cabinet-header">
        <div className="cabinet-title">
          <span>{locker.name}</span>
        </div>
        <span className={`cabinet-status-tag ${locker.kind === 'cold' ? 'cold' : ''}`}>
          {locker.kind === 'cold' ? '❄️ 4°C Cold Storage' : `${free} bays available`}
        </span>
      </div>

      <div className={`compartment-grid ${locker.capacity <= 12 ? 'cols-3' : ''}`}>
        {Array.from({ length: locker.capacity }, (_, idx) => {
          const num = idx + 1
          const parcel = occupiedMap[num]
          const isOccupied = Boolean(parcel)
          const isOpen = openCompartment === num || Boolean(manualOpens[num])
          const isCold = locker.kind === 'cold'

          return (
            <div
              key={num}
              className="locker-cell"
              onClick={() => interactive && toggleDoor(num)}
              title={`Chamber #${num} (${isOccupied ? 'Occupied by ' + parcel.id : 'Available'})`}
            >
              {/* Cavity behind the door */}
              <div className="locker-cavity">
                <div className={`cavity-glow ${isCold ? 'cold' : ''}`} />
                {isOccupied && (
                  <div className="cavity-box">
                    <span>{parcel.id.slice(-4)}</span>
                  </div>
                )}
              </div>

              {/* Clean door */}
              <div
                className={`locker-door ${isOccupied ? 'occupied' : ''} ${isOpen ? 'open' : ''} ${openCompartment === num ? 'highlight' : ''}`}
              >
                <div className="door-header-line">
                  <span className="door-number">{String(num).padStart(2, '0')}</span>
                  <span className={`door-dot ${isOccupied ? 'occupied' : isCold ? 'cold' : ''}`} />
                </div>
                <div className="door-handle-groove" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// MAIN APPLICATION COMPONENT
// --------------------------------------------------------------------------
function App() {
  const [data, setData] = useState(loadData)
  const [page, setPage] = useState('home')
  const [studentSession, setStudentSession] = useState(loadSession)
  const [deliveryLocker, setDeliveryLocker] = useState('admin-regular')
  const [unlockingBay, setUnlockingBay] = useState(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    localStorage.setItem('vault-app-data-v3', JSON.stringify(data))
  }, [data])

  useEffect(() => {
    if (studentSession) {
      localStorage.setItem('vault-app-session-v3', JSON.stringify(studentSession))
    }
  }, [studentSession])

  const notify = (msg, tone = 'info') => {
    if (tone === 'error') sound.playError()
    else sound.playSuccess()
    setToast({ msg, tone })
    setTimeout(() => setToast(null), 3500)
  }

  const toggleSound = () => {
    const next = sound.toggle()
    setSoundEnabled(next)
    if (next) sound.playKey('enter')
  }

  const totalSlots = LOCKERS.reduce((a, b) => a + b.capacity, 0)
  const storedCount = data.parcels.filter(p => p.status === 'stored').length
  const collectedCount = data.parcels.filter(p => p.status === 'collected').length
  const freeCount = totalSlots - storedCount

  // Register or switch student
  const handleRegisterStudent = (student) => {
    sound.playSuccess()
    setData(prev => ({
      ...prev,
      students: [...prev.students.filter(s => s.phone !== student.phone), student],
    }))
    setStudentSession(student)
    notify(`Profile updated for ${student.name}`)
  }

  // Courier deposit
  const handleDeposit = ({ phone, parcelId, lockerId, compartment }) => {
    const digits = phone.replace(/\D/g, '')
    const student = data.students.find(s => s.phone === digits)
    if (!student) {
      sound.playError()
      return { error: 'Mobile number not found in campus directory.' }
    }
    if (!parcelId.trim()) {
      sound.playError()
      return { error: 'Please enter a package tracking ID.' }
    }
    if (data.parcels.some(p => p.id.toLowerCase() === parcelId.trim().toLowerCase())) {
      sound.playError()
      return { error: 'This tracking ID has already been deposited.' }
    }

    const locker = lockerById(lockerId)
    const occupied = data.parcels.filter(p => p.lockerId === lockerId && p.status === 'stored').map(p => p.compartment)
    const assigned = compartment || Array.from({ length: locker.capacity }, (_, i) => i + 1).find(n => !occupied.includes(n))

    if (!assigned) {
      sound.playError()
      return { error: 'No empty compartments remaining in this locker.' }
    }

    let otp
    do {
      otp = String(Math.floor(100000 + Math.random() * 900000))
    } while (data.parcels.some(p => p.otp === otp && p.status === 'stored'))

    const newParcel = {
      id: parcelId.trim().toUpperCase(),
      lockerId,
      compartment: assigned,
      phone: digits,
      student: student.name,
      status: 'stored',
      createdAt: 'Just now',
      otp,
      type: locker.kind,
      charge: data.prices[locker.kind === 'cold' ? 'cold' : 'regular'],
    }

    sound.playSolenoid()
    sound.playSuccess()
    setData(prev => ({ ...prev, parcels: [newParcel, ...prev.parcels] }))
    notify(`Parcel secured in ${locker.short} Bay #${assigned}. OTP issued.`)
    return { parcel: newParcel }
  }

  // Student collect
  const handleCollect = (parcel) => {
    sound.playSolenoid()
    sound.playDoorOpen()
    sound.playSuccess()
    setData(prev => ({
      ...prev,
      parcels: prev.parcels.map(p =>
        p.id === parcel.id
          ? { ...p, status: 'collected', collectedAt: 'Just now' }
          : p
      ),
    }))
    setUnlockingBay(parcel.compartment)
    notify(`Door #${parcel.compartment} unlocked!`)
  }

  const navLinks = [
    { id: 'home', label: 'Overview' },
    { id: 'student', label: 'Student Desk' },
    { id: 'delivery', label: 'Deposit (Courier)' },
    { id: 'collect', label: 'Collect (OTP)', badge: storedCount },
    { id: 'availability', label: 'Lockers Network' },
    { id: 'admin', label: 'Admin' },
  ]

  return (
    <div className="app-shell">
      {/* NAVBAR WITH OFFICIAL IIT MADRAS LOGO */}
      <header className="navbar">
        <div className="navbar-left">
          <div className="brand-badge" onClick={() => setPage('home')}>
            <img src={iitmLogo} alt="IIT Madras Official Emblem" className="brand-logo-img" />
            <div className="brand-text-wrap">
              <span className="brand-name">VAULT</span>
              <span className="brand-tag">IIT Madras</span>
            </div>
          </div>

          <nav className="navbar-nav">
            {navLinks.map(link => (
              <button
                key={link.id}
                className={`nav-link ${page === link.id ? 'active' : ''}`}
                onClick={() => {
                  sound.playKey('1')
                  setPage(link.id)
                }}
              >
                <span>{link.label}</span>
                {Boolean(link.badge) && <span className="nav-pill-badge">{link.badge}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="navbar-right">
          <button
            className={`sfx-btn ${soundEnabled ? 'active' : ''}`}
            onClick={toggleSound}
            title="Toggle sound effects"
          >
            <Icon name={soundEnabled ? 'soundOn' : 'soundMute'} size={15} />
            <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
          </button>

          <div className="status-indicator">
            <span className="status-pulse-dot" />
            <span>Network Online</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="main-content">
        {page === 'home' && (
          <OverviewPage
            data={data}
            stored={storedCount}
            available={freeCount}
            totalSlots={totalSlots}
            goto={setPage}
          />
        )}

        {page === 'student' && (
          <StudentDeskPage
            data={data}
            session={studentSession}
            onRegister={handleRegisterStudent}
            goto={setPage}
          />
        )}

        {page === 'delivery' && (
          <DeliveryPage
            data={data}
            selectedLocker={deliveryLocker}
            onSelectLocker={setDeliveryLocker}
            onDeposit={handleDeposit}
            goto={setPage}
          />
        )}

        {page === 'collect' && (
          <CollectPage
            data={data}
            onCollect={handleCollect}
            unlockedBay={unlockingBay}
          />
        )}

        {page === 'availability' && (
          <AvailabilityPage
            parcels={data.parcels}
            onSelectStation={(lid) => {
              setDeliveryLocker(lid)
              setPage('delivery')
            }}
          />
        )}

        {page === 'admin' && (
          <AdminPage
            data={data}
            setData={setData}
            stored={storedCount}
            collected={collectedCount}
            available={freeCount}
            notify={notify}
            onSelectStation={(lid) => {
              setDeliveryLocker(lid)
              setPage('delivery')
            }}
          />
        )}
      </main>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`clean-toast ${toast.tone}`}>
          <Icon name={toast.tone === 'error' ? 'info' : 'check'} size={16} />
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  )
}

// --------------------------------------------------------------------------
// PAGE 01: OVERVIEW
// --------------------------------------------------------------------------
function OverviewPage({ data, stored, available, totalSlots, goto }) {
  const primaryLocker = LOCKERS.find(l => l.id === 'admin-regular') || LOCKERS[0]

  return (
    <div>
      {/* HERO SECTION */}
      <section className="overview-hero">
        <div className="hero-text">
          <div className="hero-iitm-badge">
            <img src={iitmLogo} alt="IIT Madras Emblem" />
            <span>Indian Institute of Technology Madras</span>
          </div>

          <h1>
            Smart, secure parcel pickup across <span>IIT Madras</span>.
          </h1>
          <p>
            Autonomous smart lockers across the Administration Building, Mandakini, Ganga, Krishna hostels and Tharamani Gate. Couriers drop off packages securely into standard and 4°C cold-storage bays, and recipients collect 24/7 with a 6-digit PIN.
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => goto('collect')}>
              <Icon name="key" size={15} />
              <span>Collect My Package</span>
            </button>
            <button className="btn btn-secondary" onClick={() => goto('delivery')}>
              <Icon name="scan" size={15} />
              <span>Courier Drop-Off</span>
            </button>
          </div>
        </div>

        <div>
          <LockerCabinet locker={primaryLocker} parcels={data.parcels} />
        </div>
      </section>

      {/* METRICS ROW */}
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Parcels Stored</span>
            <Icon name="box" size={18} />
          </div>
          <div className="metric-number">{stored}</div>
          <div className="metric-sub">Currently in secure safekeeping</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Available Bays</span>
            <Icon name="grid" size={18} />
          </div>
          <div className="metric-number">{available} / {totalSlots}</div>
          <div className="metric-sub">Standard & Cold Storage bays ready</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Cold Storage (4°C)</span>
            <Icon name="snowflake" size={18} />
          </div>
          <div className="metric-number">
            {LOCKERS.filter(l => l.kind === 'cold').reduce((acc, l) => acc + (l.capacity - occupancy(l, data.parcels)), 0)} free
          </div>
          <div className="metric-sub">Admin Building & Tharamani Gate</div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="steps-section">
        <h2 className="steps-heading">How VAULT Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <h3>Courier Drop-Off</h3>
            <p>The delivery agent scans the package, confirms the recipient mobile number, and places it into an automatically opened standard or cold-storage bay.</p>
          </div>

          <div className="step-card">
            <div className="step-num">02</div>
            <h3>Instant 6-Digit PIN</h3>
            <p>The system generates a unique 6-digit collection OTP visible on the student or staff member's personal dashboard.</p>
          </div>

          <div className="step-card">
            <div className="step-num">03</div>
            <h3>Collect Anytime</h3>
            <p>Enter the code on the locker keypad. The door unlocks instantly so you can grab your parcel whenever convenient.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

// --------------------------------------------------------------------------
// PAGE 02: STUDENT DESK
// --------------------------------------------------------------------------
function StudentDeskPage({ data, session, onRegister, goto }) {
  const [form, setForm] = useState(session || { name: '', phone: '', hostel: 'Admin Building' })

  const pickDemoStudent = (st) => {
    sound.playKey('1')
    setForm(st)
    onRegister(st)
  }

  const mine = session ? data.parcels.filter(p => p.phone === session.phone) : []
  const activeParcels = mine.filter(p => p.status === 'stored')
  const historyParcels = mine.filter(p => p.status === 'collected')

  return (
    <div>
      <div className="page-title-row">
        <div>
          <span className="page-eyebrow">Campus Recipient Portal</span>
          <h1 className="page-heading">Your Deliveries & OTP Codes</h1>
          <p className="page-subtext">
            View packages waiting for collection at your hostel or the Administration Building.
          </p>
        </div>
      </div>

      <div className="student-grid">
        {/* STUDENT / STAFF PROFILE CARD */}
        <div className="student-profile-card">
          <div className="profile-avatar-row">
            <div className="avatar-initials" style={{ padding: 0, overflow: 'hidden' }}>
              <img src={iitmLogo} alt="IIT Madras" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div className="profile-name">{session?.name || 'Campus Recipient'}</div>
              <div className="profile-hostel">{session?.hostel} · {session?.phone}</div>
            </div>
          </div>

          <div className="persona-picker">
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Switch Demo Recipient:
            </span>
            {data.students.map(st => (
              <button
                key={st.phone}
                className={`persona-pill ${session?.phone === st.phone ? 'active' : ''}`}
                onClick={() => pickDemoStudent(st)}
              >
                {st.name} ({st.hostel})
              </button>
            ))}
          </div>

          {/* EDIT PROFILE FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onRegister(form)
            }}
            style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-default)' }}
          >
            <div className="field-group">
              <label>Full Name</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="field-group">
              <label>Mobile Number</label>
              <input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            <div className="field-group">
              <label>Primary Campus Location</label>
              <select
                value={form.hostel}
                onChange={e => setForm({ ...form, hostel: e.target.value })}
              >
                <option value="Admin Building">Admin Building (Central Campus)</option>
                <option value="Mandakini Hostel">Mandakini Hostel</option>
                <option value="Ganga Hostel">Ganga Hostel</option>
                <option value="Krishna Hostel">Krishna Hostel</option>
                <option value="Tharamani Gate">Tharamani Gate</option>
              </select>
            </div>
            <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: 8 }}>
              Save Details
            </button>
          </form>
        </div>

        {/* PARCEL LISTING */}
        <div className="parcel-cards-col">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Ready to Collect ({activeParcels.length})
          </h2>

          {activeParcels.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius)', padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
              <Icon name="box" size={32} />
              <p style={{ marginTop: 8 }}>No parcels currently waiting for this mobile number.</p>
            </div>
          ) : (
            activeParcels.map(p => {
              const locker = lockerById(p.lockerId)
              return (
                <div key={p.id} className={`clean-parcel-card ${p.type === 'cold' ? 'cold' : 'regular'}`}>
                  <div className="parcel-main-info">
                    <h3>{p.id}</h3>
                    <div className="parcel-location-text">
                      <Icon name="map" size={14} />
                      <span>{locker.name} · Bay <b>#{String(p.compartment).padStart(2, '0')}</b></span>
                    </div>
                    <div className="parcel-time-badge">
                      Deposited {p.createdAt} · {p.type === 'cold' ? '❄️ 4°C Cold Storage' : 'Standard Ambient Bay'}
                    </div>
                  </div>

                  <div className="parcel-otp-group">
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Collection PIN</span>
                    <div className="otp-box">{p.otp}</div>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '6px 14px', fontSize: 12 }}
                      onClick={() => {
                        sound.playKey('enter')
                        goto('collect')
                      }}
                    >
                      <span>Collect at Locker</span>
                      <Icon name="arrowRight" size={13} />
                    </button>
                  </div>
                </div>
              )
            })
          )}

          {/* PREVIOUS COLLECTIONS */}
          {historyParcels.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12 }}>
                Collection History
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {historyParcels.map(p => (
                  <div
                    key={p.id}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--border-default)',
                      borderRadius: 8,
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 13
                    }}
                  >
                    <div>
                      <b>{p.id}</b>
                      <span style={{ color: 'var(--text-muted)', marginLeft: 10 }}>
                        {lockerById(p.lockerId).short} · Bay #{p.compartment}
                      </span>
                    </div>
                    <span style={{ color: 'var(--green)', fontWeight: 600 }}>Collected</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// PAGE 03: COURIER DISPATCH
// --------------------------------------------------------------------------
function DeliveryPage({ data, selectedLocker, onSelectLocker, onDeposit, goto }) {
  const [phone, setPhone] = useState('')
  const [parcelId, setParcelId] = useState('')
  const [chosenBay, setChosenBay] = useState(null)
  const [result, setResult] = useState(null)

  const locker = lockerById(selectedLocker)
  const occupiedList = data.parcels.filter(p => p.lockerId === selectedLocker && p.status === 'stored').map(p => p.compartment)
  const freeBays = Array.from({ length: locker.capacity }, (_, i) => i + 1).filter(n => !occupiedList.includes(n))
  const matchedStudent = data.students.find(s => s.phone === phone.replace(/\D/g, ''))

  const handleDemoPreset = (code, studentPhone, lockerKey) => {
    sound.playKey('1')
    setParcelId(code)
    setPhone(studentPhone)
    if (lockerKey) onSelectLocker(lockerKey)
    setResult(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const res = onDeposit({
      phone,
      parcelId,
      lockerId: selectedLocker,
      compartment: chosenBay,
    })
    setResult(res)
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <span className="page-eyebrow">Courier Inbound</span>
          <h1 className="page-heading">Deposit a Delivery</h1>
          <p className="page-subtext">
            Choose standard ambient or 4°C cold-storage compartments at the Admin Building, hostels, or campus gates.
          </p>
        </div>
      </div>

      <div className="dispatch-grid">
        {/* FORM */}
        <div className="dispatch-form-card">
          {result?.parcel ? (
            <div style={{ textAlign: 'center', padding: '24px 12px' }}>
              <div style={{ width: 48, height: 48, background: 'var(--green-subtle)', color: 'var(--green)', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                <Icon name="check" size={24} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Package Secured!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Placed in <b>{locker.name} · Bay #{result.parcel.compartment}</b>
              </p>
              <div style={{ margin: '18px 0', padding: 14, background: 'var(--bg-subtle)', borderRadius: 8, display: 'inline-block' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Collection Code Generated:</span>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em' }}>
                  {result.parcel.otp}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => goto('collect')}
                >
                  Test Pickup at Kiosk
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setResult(null)
                    setParcelId('')
                  }}
                >
                  Deposit Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <label>Recipient Mobile Number</label>
                <input
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setResult(null) }}
                  placeholder="e.g. 9840056700"
                  required
                />
                {phone && (
                  <div className={`recipient-status ${matchedStudent ? 'found' : 'notfound'}`}>
                    <Icon name={matchedStudent ? 'check' : 'info'} size={14} />
                    <span>
                      {matchedStudent
                        ? `Recipient: ${matchedStudent.name} (${matchedStudent.hostel})`
                        : 'Unregistered number (recipient must register first)'}
                    </span>
                  </div>
                )}
              </div>

              <div className="field-group">
                <label>Parcel Tracking / Order ID</label>
                <input
                  value={parcelId}
                  onChange={e => { setParcelId(e.target.value); setResult(null) }}
                  placeholder="e.g. AMZN-4091"
                  required
                />

                <div className="demo-chips">
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>Presets:</span>
                  <button
                    type="button"
                    className="demo-chip-btn"
                    onClick={() => handleDemoPreset(`DOCS-${Math.floor(1000 + Math.random() * 9000)}`, '9840056700', 'admin-regular')}
                  >
                    Admin Docs (Prof. Sundararajan)
                  </button>
                  <button
                    type="button"
                    className="demo-chip-btn"
                    onClick={() => handleDemoPreset(`LAB-CRYO-${Math.floor(1000 + Math.random() * 9000)}`, '9840067800', 'admin-cold')}
                  >
                    ❄️ Admin Cold (Dr. Meenakshi)
                  </button>
                  <button
                    type="button"
                    className="demo-chip-btn"
                    onClick={() => handleDemoPreset(`AMZN-${Math.floor(1000 + Math.random() * 9000)}`, '9840012300', 'mandakini')}
                  >
                    Amazon (Ananya - Mandakini)
                  </button>
                  <button
                    type="button"
                    className="demo-chip-btn"
                    onClick={() => handleDemoPreset(`SWG-${Math.floor(1000 + Math.random() * 9000)}`, '9840045600', 'tharamani')}
                  >
                    ❄️ Swiggy Cold (Tharamani)
                  </button>
                </div>
              </div>

              <div className="field-group">
                <label>Target Locker Unit</label>
                <select
                  value={selectedLocker}
                  onChange={e => {
                    onSelectLocker(e.target.value)
                    setChosenBay(null)
                  }}
                >
                  {LOCKERS.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name} {l.kind === 'cold' ? '— ❄️ 4°C Cold Storage' : '— Standard'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label>Compartment Selection</label>
                <select
                  value={chosenBay || 'auto'}
                  onChange={e => setChosenBay(e.target.value === 'auto' ? null : Number(e.target.value))}
                >
                  <option value="auto">Auto-assign first available bay</option>
                  {freeBays.map(bay => (
                    <option key={bay} value={bay}>
                      Bay #{String(bay).padStart(2, '0')} (Free)
                    </option>
                  ))}
                </select>
              </div>

              {result?.error && (
                <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>
                  {result.error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 8 }}
                disabled={freeBays.length === 0}
              >
                Deposit & Issue OTP
              </button>
            </form>
          )}
        </div>

        {/* VISUAL LOCKER PREVIEW */}
        <div>
          <LockerCabinet
            locker={locker}
            parcels={data.parcels}
            openCompartment={chosenBay}
            onSelectCompartment={(bay) => {
              if (freeBays.includes(bay)) {
                setChosenBay(bay)
              }
            }}
          />
          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
            Click any free compartment above to manually select it.
          </p>
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// PAGE 04: PIN PAD RETRIEVE
// --------------------------------------------------------------------------
function CollectPage({ data, onCollect, unlockedBay }) {
  const [pin, setPin] = useState('')
  const [activeParcel, setActiveParcel] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const storedParcels = data.parcels.filter(p => p.status === 'stored')

  const handleKeyPress = (val) => {
    sound.playKey(val)
    setErrorMsg('')

    if (val === 'clear') {
      setPin('')
      setActiveParcel(null)
      return
    }

    if (val === 'enter') {
      verifyPin(pin)
      return
    }

    if (pin.length < 6) {
      const next = pin + val
      setPin(next)
      if (next.length === 6) {
        verifyPin(next)
      }
    }
  }

  const verifyPin = (code) => {
    const match = data.parcels.find(p => p.otp === code.trim() && p.status === 'stored')
    if (match) {
      setActiveParcel(match)
      onCollect(match)
    } else {
      sound.playError()
      setErrorMsg('No active parcel matches this 6-digit PIN.')
    }
  }

  const locker = activeParcel ? lockerById(activeParcel.lockerId) : null

  return (
    <div>
      <div className="page-title-row">
        <div>
          <span className="page-eyebrow">Retrieval Kiosk</span>
          <h1 className="page-heading">Enter Collection PIN</h1>
          <p className="page-subtext">
            Type your 6-digit code on the keypad below to release the locker compartment.
          </p>
        </div>
      </div>

      <div className="retrieve-layout">
        {/* KEYPAD */}
        <div className="pin-pad-card">
          <div className="pin-display">
            {pin.padEnd(6, '·').split('').join(' ')}
          </div>

          <div className="keypad-grid">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                className="key-pad-btn"
                onClick={() => handleKeyPress(num)}
              >
                {num}
              </button>
            ))}
            <button
              className="key-pad-btn action-c"
              onClick={() => handleKeyPress('clear')}
            >
              Clear
            </button>
            <button
              className="key-pad-btn"
              onClick={() => handleKeyPress('0')}
            >
              0
            </button>
            <button
              className="key-pad-btn action-ok"
              onClick={() => handleKeyPress('enter')}
            >
              Enter
            </button>
          </div>

          {errorMsg && (
            <div style={{ color: 'var(--red)', fontSize: 13, marginTop: 14 }}>
              {errorMsg}
            </div>
          )}

          {/* QUICK DEMO PINS */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-default)', textAlign: 'left' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
              CLICK ACTIVE DEMO PINS:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {storedParcels.slice(0, 6).map(p => (
                <button
                  key={p.id}
                  className="demo-chip-btn"
                  onClick={() => {
                    setPin(p.otp)
                    verifyPin(p.otp)
                  }}
                >
                  {lockerById(p.lockerId).short.replace('Unit', '')} #{p.compartment} → <b>{p.otp}</b>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS & VISUAL UNLOCK */}
        <div>
          {activeParcel && locker ? (
            <div className="unlock-success-card">
              <div className="unlock-icon-circle">
                <Icon name="check" size={28} />
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
                Compartment #{activeParcel.compartment} Unlocked
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                {locker.name} · Grab your package and close the door.
              </p>

              <div style={{ maxWidth: 360, margin: '0 auto 20px' }}>
                <LockerCabinet
                  locker={locker}
                  parcels={data.parcels}
                  openCompartment={activeParcel.compartment}
                  interactive={false}
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={() => {
                  sound.playSolenoid()
                  setActiveParcel(null)
                  setPin('')
                }}
              >
                I Have Collected My Parcel
              </button>
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius)', padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              <Icon name="key" size={40} />
              <h3 style={{ marginTop: 12, color: 'var(--text-main)', fontSize: 17 }}>Awaiting PIN Entry</h3>
              <p style={{ fontSize: 13, maxWidth: 340, margin: '6px auto 0' }}>
                Enter the code sent to your Student Desk. The corresponding locker bay will swing open automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// PAGE 05: LOCKERS NETWORK
// --------------------------------------------------------------------------
function AvailabilityPage({ parcels, onSelectStation }) {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'cold'
    ? LOCKERS.filter(l => l.kind === 'cold')
    : filter === 'regular'
      ? LOCKERS.filter(l => l.kind === 'regular')
      : LOCKERS

  return (
    <div>
      <div className="page-title-row">
        <div>
          <span className="page-eyebrow">Campus Hardware Network</span>
          <h1 className="page-heading">Locker Stations</h1>
          <p className="page-subtext">
            Live availability status across the Admin Building, North Campus, South Campus, and Tharamani Gate.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'regular', 'cold'].map(t => (
            <button
              key={t}
              className={`btn btn-secondary ${filter === t ? 'btn-primary' : ''}`}
              style={{ padding: '6px 12px', fontSize: 12, textTransform: 'capitalize' }}
              onClick={() => setFilter(t)}
            >
              {t === 'all' ? 'All Stations' : t === 'regular' ? 'Normal Lockers' : '❄️ Cold Storage'}
            </button>
          ))}
        </div>
      </div>

      <div className="network-cards-grid">
        {filtered.map(l => {
          const used = occupancy(l, parcels)
          const free = l.capacity - used
          const pct = Math.round((used / l.capacity) * 100)

          return (
            <div key={l.id} className="station-summary-card">
              <div>
                <div className="station-top">
                  <div>
                    <h3>{l.name}</h3>
                    <p>{l.location}</p>
                  </div>
                  <span className={`cabinet-status-tag ${l.kind === 'cold' ? 'cold' : ''}`}>
                    {l.kind === 'cold' ? '❄️ 4°C Cold Storage' : 'Standard'}
                  </span>
                </div>

                <div className="capacity-progress-bar">
                  <div
                    className={`capacity-progress-fill ${l.kind === 'cold' ? 'cold' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 16 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{used} / {l.capacity} occupied</span>
                  <b style={{ color: 'var(--green)' }}>{free} available</b>
                </div>
              </div>

              <button
                className="btn btn-secondary"
                style={{ width: '100%' }}
                onClick={() => onSelectStation(l.id)}
              >
                Deposit at this Unit
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// PAGE 06: ADMIN CONSOLE
// --------------------------------------------------------------------------
function AdminPage({ data, setData, stored, collected, available, notify, onSelectStation }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [prices, setPrices] = useState(data.prices)

  const handlePriceSave = (e) => {
    e.preventDefault()
    sound.playSuccess()
    setData(prev => ({
      ...prev,
      prices: { regular: Number(prices.regular), cold: Number(prices.cold) },
    }))
    notify('Storage rate card updated.')
  }

  const handleSimulateBatch = () => {
    sound.playSuccess()
    const newItems = Array.from({ length: 2 }, (_, i) => {
      const locker = LOCKERS[i % LOCKERS.length]
      const occupied = data.parcels.filter(p => p.lockerId === locker.id && p.status === 'stored').map(p => p.compartment)
      const free = Array.from({ length: locker.capacity }, (_, k) => k + 1).find(n => !occupied.includes(n)) || 1
      return {
        id: `MOCK-${Date.now().toString(36).toUpperCase()}-${i}`,
        lockerId: locker.id,
        compartment: free,
        phone: data.students[i % data.students.length].phone,
        student: data.students[i % data.students.length].name,
        status: 'stored',
        createdAt: 'Just now',
        otp: String(Math.floor(100000 + Math.random() * 900000)),
        type: locker.kind,
        charge: data.prices[locker.kind === 'cold' ? 'cold' : 'regular'],
      }
    })
    setData(prev => ({ ...prev, parcels: [...newItems, ...prev.parcels] }))
    notify('2 mock parcels deposited.')
  }

  const handleExportCSV = () => {
    sound.playKey('enter')
    const headers = 'ID,Locker,Compartment,Student,Phone,Status,Timestamp,OTP,Charge\n'
    const rows = data.parcels.map(p =>
      `${p.id},${p.lockerId},${p.compartment},"${p.student}",${p.phone},${p.status},"${p.createdAt}",${p.otp},${p.charge}`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vault-manifest-${Date.now()}.csv`
    a.click()
    notify('Exported CSV manifest.')
  }

  const handleResetData = () => {
    if (confirm('Reset to initial seed data?')) {
      setData(initialData)
      localStorage.removeItem('vault-app-data-v3')
      notify('Reset to default seeds.')
    }
  }

  const filtered = data.parcels.filter(p => {
    const matchesFilter = filter === 'all' || p.status === filter
    const matchesSearch = !search ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.student.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
    return matchesFilter && matchesSearch
  })

  const filteredLockers = locationFilter === 'cold'
    ? LOCKERS.filter(l => l.kind === 'cold')
    : locationFilter === 'regular'
      ? LOCKERS.filter(l => l.kind === 'regular')
      : LOCKERS

  return (
    <div>
      <div className="page-title-row">
        <div>
          <span className="page-eyebrow">Administration</span>
          <h1 className="page-heading">Operations Console</h1>
          <p className="page-subtext">
            Campus locker units status, live parcel register, and courier tariffs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={handleSimulateBatch}>
            + Mock Deliveries
          </button>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="admin-layout">
        {/* PARCEL TABLE */}
        <div className="admin-table-card">
          <div className="table-toolbar">
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'stored', 'collected'].map(f => (
                <button
                  key={f}
                  className={`btn btn-secondary ${filter === f ? 'btn-primary' : ''}`}
                  style={{ padding: '4px 10px', fontSize: 12, textTransform: 'capitalize' }}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search parcels..."
              style={{ padding: '6px 12px', fontSize: 12, width: 180 }}
            />
          </div>

          <table className="clean-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Unit</th>
                <th>Bay</th>
                <th>Recipient</th>
                <th>Status</th>
                <th>PIN</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 15).map(p => (
                <tr key={p.id}>
                  <td><b>{p.id}</b></td>
                  <td>{lockerById(p.lockerId).short}</td>
                  <td>#{p.compartment}</td>
                  <td>{p.student}</td>
                  <td>
                    <span className={`status-badge ${p.status}`}>
                      {p.status}
                    </span>
                  </td>
                  <td><code style={{ color: 'var(--primary)', fontWeight: 700 }}>{p.otp}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <form className="dispatch-form-card" onSubmit={handlePriceSave}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Storage Tariffs</h3>
            <div className="field-group">
              <label>Standard Bay Fee (₹)</label>
              <input
                type="number"
                value={prices.regular}
                onChange={e => setPrices({ ...prices, regular: e.target.value })}
                min="0"
              />
            </div>
            <div className="field-group">
              <label>Cold Storage 4°C Fee (₹)</label>
              <input
                type="number"
                value={prices.cold}
                onChange={e => setPrices({ ...prices, cold: e.target.value })}
                min="0"
              />
            </div>
            <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: 6 }}>
              Save Tariffs
            </button>
          </form>

          <div className="dispatch-form-card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--red)' }}>Reset Data</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              Restore parcel database to default campus seeds.
            </p>
            <button
              className="btn btn-secondary"
              style={{ color: 'var(--red)', width: '100%' }}
              onClick={handleResetData}
            >
              Reset to Factory Seeds
            </button>
          </div>
        </div>
      </div>

      {/* LOCKER UNITS BY LOCATION SECTION (ADMIN PANEL LOCATION STATUS) */}
      <div className="admin-locations-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
          <div>
            <span className="page-eyebrow">Campus Hardware Locations</span>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Locker Units & Storage Capacity</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Real-time monitoring across standard ambient lockers and 4°C cold-storage units.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'regular', 'cold'].map(t => (
              <button
                key={t}
                className={`btn btn-secondary ${locationFilter === t ? 'btn-primary' : ''}`}
                style={{ padding: '4px 10px', fontSize: 12, textTransform: 'capitalize' }}
                onClick={() => setLocationFilter(t)}
              >
                {t === 'all' ? 'All Units' : t === 'regular' ? 'Normal Lockers' : '❄️ Cold Storage'}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-locations-grid">
          {filteredLockers.map(l => {
            const used = occupancy(l, data.parcels)
            const free = l.capacity - used
            const pct = Math.round((used / l.capacity) * 100)
            const isCold = l.kind === 'cold'

            return (
              <div key={l.id} className={`admin-location-card ${isCold ? 'cold' : 'regular'}`}>
                <div className="admin-card-header">
                  <div>
                    <div className="admin-card-title">{l.name}</div>
                    <div className="admin-card-loc">{l.location}</div>
                  </div>
                  <span className={`admin-badge-type ${isCold ? 'cold' : 'regular'}`}>
                    {isCold ? '❄️ 4°C Cold' : 'Normal'}
                  </span>
                </div>

                <div className="capacity-progress-bar" style={{ margin: '12px 0 8px' }}>
                  <div
                    className={`capacity-progress-fill ${isCold ? 'cold' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>{used} / {l.capacity} occupied</span>
                  <b style={{ color: 'var(--green)' }}>{free} available</b>
                </div>

                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>Chamber: <b>{isCold ? '4.0°C Regulated' : 'Ambient (24°C)'}</b></span>
                  <span>Fee: <b>₹{data.prices[isCold ? 'cold' : 'regular']}</b></span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// MOUNT
// --------------------------------------------------------------------------
createRoot(document.getElementById('root')).render(<App />)
