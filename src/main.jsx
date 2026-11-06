import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { sound } from './sound.js'
import './styles.css'

// IIT MADRAS CAMPUS LOCKER UNITS
const LOCKERS = [
  { id: 'mandakini', name: 'Mandakini Hostel', short: 'Mandakini Unit-01', kind: 'regular', capacity: 20, location: 'North Campus · Ground Floor Quad', temp: '24.2°C', power: '230V Nominal' },
  { id: 'ganga', name: 'Ganga Hostel', short: 'Ganga Unit-02', kind: 'regular', capacity: 20, location: 'North Campus · Main Lobby', temp: '23.8°C', power: '230V Nominal' },
  { id: 'krishna', name: 'Krishna Hostel', short: 'Krishna Unit-03', kind: 'regular', capacity: 20, location: 'South Campus · Entrance Portico', temp: '24.5°C', power: '230V Nominal' },
  { id: 'tharamani', name: 'Tharamani Gate', short: 'Tharamani Cryo-04', kind: 'cold', capacity: 12, location: 'Security Gate · Cold-Chain Kiosk', temp: '3.9°C', power: 'Dual UPS Backup' },
]

// INITIAL SEED PARCELS
const seedParcels = [
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `AMZN-M${1040 + i}`,
    lockerId: 'mandakini',
    compartment: i + 1,
    phone: `984001230${i}`,
    student: i === 0 ? 'Ananya Subramaniam' : `Hostel Resident #${i + 1}`,
    status: 'stored',
    createdAt: 'Today, 09:14 IST',
    otp: `${160000 + i}`,
    type: 'regular',
    charge: 18,
    weight: `${(0.8 + (i * 0.3)).toFixed(1)} kg`
  })),
  ...Array.from({ length: 11 }, (_, i) => ({
    id: `BLU-G${2080 + i}`,
    lockerId: 'ganga',
    compartment: i + 1,
    phone: `984002340${i}`,
    student: i === 0 ? 'Rohan Verma' : `Ganga Scholar #${i + 1}`,
    status: 'stored',
    createdAt: 'Today, 10:28 IST',
    otp: `${170000 + i}`,
    type: 'regular',
    charge: 18,
    weight: `${(1.1 + (i * 0.2)).toFixed(1)} kg`
  })),
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `DEL-K${3050 + i}`,
    lockerId: 'krishna',
    compartment: i + 1,
    phone: `984003450${i}`,
    student: i === 0 ? 'Kavya Nair' : `Research Scholar #${i + 1}`,
    status: 'stored',
    createdAt: 'Today, 11:45 IST',
    otp: `${180000 + i}`,
    type: 'regular',
    charge: 18,
    weight: `${(0.6 + (i * 0.4)).toFixed(1)} kg`
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `SWG-CRYO-${4010 + i}`,
    lockerId: 'tharamani',
    compartment: i + 1,
    phone: `984004560${i}`,
    student: i === 0 ? 'Aditya Iyer' : `Campus Fellow #${i + 1}`,
    status: 'stored',
    createdAt: 'Today, 12:30 IST',
    otp: `${190000 + i}`,
    type: 'cold',
    charge: 45,
    weight: `${(1.5 + (i * 0.5)).toFixed(1)} kg`
  })),
]

const initialData = {
  parcels: seedParcels,
  students: [
    { name: 'Ananya Subramaniam', phone: '9840012300', hostel: 'Mandakini Hostel', roll: 'CS22B042' },
    { name: 'Rohan Verma', phone: '9840023400', hostel: 'Ganga Hostel', roll: 'EE21B118' },
    { name: 'Kavya Nair', phone: '9840034500', hostel: 'Krishna Hostel', roll: 'ME23M005' },
    { name: 'Aditya Iyer', phone: '9840045600', hostel: 'Tharamani Gate', roll: 'CH20B089' },
  ],
  prices: { regular: 18, cold: 45 }
}

const loadData = () => {
  try {
    const raw = localStorage.getItem('vault-iitm-data')
    return raw ? JSON.parse(raw) : initialData
  } catch {
    return initialData
  }
}

const loadSession = () => {
  try {
    const raw = localStorage.getItem('vault-iitm-session')
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
// ICONS
// --------------------------------------------------------------------------
function Icon({ name, size = 16, className = '' }) {
  const icons = {
    grid: <path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z" />,
    box: <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z M3.3 7 12 12l8.7-5 M12 22V12" />,
    scan: <><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" /><line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="2" /></>,
    key: <><circle cx="7.5" cy="15.5" r="4.5" /><path d="m11 12 9-9 3 3-2 2-2-2-3 3" /></>,
    radar: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /><line x1="12" y1="3" x2="12" y2="21" /><line x1="3" y1="12" x2="21" y2="12" /></>,
    terminal: <><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" strokeWidth="2" /></>,
    user: <><circle cx="12" cy="7" r="4" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></>,
    snowflake: <><line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /><line x1="19.07" y1="4.93" x2="4.93" y2="19.07" /><circle cx="12" cy="12" r="2" /></>,
    check: <polyline points="20 6 9 17 4 12" />,
    arrowRight: <path d="M5 12h14M13 5l7 7-7 7" />,
    bolt: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
    soundOn: <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" /></>,
    soundMute: <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></>,
    info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
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
      className={className}
      aria-hidden="true"
    >
      {icons[name] || null}
    </svg>
  )
}

// --------------------------------------------------------------------------
// QR CODE COMPONENT (Vector crisp)
// --------------------------------------------------------------------------
function QrMatrix({ value, size = 64 }) {
  const hash = [...value].reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const isFinder = (x, y, cornerX, cornerY) => {
    const lx = x - cornerX, ly = y - cornerY
    return lx >= 0 && lx < 3 && ly >= 0 && ly < 3 && (lx === 0 || lx === 2 || ly === 0 || ly === 2 || (lx === 1 && ly === 1))
  }

  const cells = Array.from({ length: 81 }, (_, i) => {
    const x = i % 9, y = Math.floor(i / 9)
    const finder = isFinder(x, y, 0, 0) || isFinder(x, y, 6, 0) || isFinder(x, y, 0, 6)
    const filled = finder || ((i * 19 + hash + x * y) % 4 < 2)
    return filled ? <rect key={i} x={x} y={y} width="1" height="1" fill="currentColor" /> : null
  })

  return (
    <svg viewBox="0 0 9 9" width={size} height={size} style={{ color: '#090d14', background: '#fff', padding: 4, borderRadius: 4, display: 'block' }}>
      {cells}
    </svg>
  )
}

// --------------------------------------------------------------------------
// 3D PHYSICAL LOCKER HARDWARE BANK
// --------------------------------------------------------------------------
function LockerBank3D({ locker, parcels, openCompartment, onSelectCompartment, flat = false, interactive = true }) {
  const [hovered, setHovered] = useState(null)
  const [manualOpens, setManualOpens] = useState({})

  const occupiedMap = useMemo(() => {
    const map = {}
    parcels
      .filter(p => p.lockerId === locker.id && p.status === 'stored')
      .forEach(p => { map[p.compartment] = p })
    return map
  }, [locker.id, parcels])

  const toggleManual = (num) => {
    sound.playSolenoid()
    sound.playDoorOpen()
    setManualOpens(prev => ({ ...prev, [num]: !prev[num] }))
    if (onSelectCompartment) {
      onSelectCompartment(num)
    }
  }

  return (
    <div className="locker-rack-wrapper">
      <div className={`locker-rack ${flat ? 'flat' : ''}`}>
        {/* Chassis Screws */}
        <span className="chassis-screw tl" />
        <span className="chassis-screw tr" />
        <span className="chassis-screw bl" />
        <span className="chassis-screw br" />

        {/* Marquee Header */}
        <div className="rack-marquee">
          <div className="rack-title">
            <span className="status-beacon" />
            <span>{locker.short}</span>
          </div>
          <div className="rack-temp">
            {locker.kind === 'cold' ? 'CRYO 4°C · ACTIVE' : 'CHAMBER AMBIENT 24°C'}
          </div>
        </div>

        {/* Doors Grid */}
        <div className={`doors-grid ${locker.capacity <= 12 ? 'cols-3' : ''}`}>
          {Array.from({ length: locker.capacity }, (_, idx) => {
            const num = idx + 1
            const parcel = occupiedMap[num]
            const isOccupied = Boolean(parcel)
            const isOpen = openCompartment === num || Boolean(manualOpens[num])
            const isCold = locker.kind === 'cold'

            return (
              <div
                key={num}
                className="compartment-cell"
                onMouseEnter={() => setHovered(num)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => interactive && toggleManual(num)}
                title={`Compartment #${num} (${isOccupied ? 'Occupied by ' + parcel.id : 'Available'})`}
              >
                {/* Interior cavity revealed when door swings open */}
                <div className="compartment-cavity">
                  <div className={`cavity-light ${isCold ? 'cryo' : ''}`} />
                  {isOccupied && (
                    <div className="cavity-parcel">
                      <span>{parcel.id.slice(-4)}</span>
                    </div>
                  )}
                </div>

                {/* Physical metal door hinged on left */}
                <div
                  className={`compartment-door ${isOccupied ? 'occupied' : ''} ${isOpen ? 'open' : ''} ${openCompartment === num ? 'active-target' : ''}`}
                >
                  <span className="door-num">{String(num).padStart(2, '0')}</span>
                  <div className="door-bottom">
                    <span className={`door-led ${isOccupied ? 'occupied' : isCold ? 'cryo' : ''}`} />
                    <span className="door-latch" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Base Pedestal */}
        <div className="rack-base">
          <span className="rack-foot" />
          <span className="rack-foot" />
        </div>
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
  const [deliveryLocker, setDeliveryLocker] = useState('mandakini')
  const [unlockingCompartment, setUnlockingCompartment] = useState(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [toast, setToast] = useState(null)
  const [currentTime, setCurrentTime] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('vault-iitm-data', JSON.stringify(data))
  }, [data])

  useEffect(() => {
    if (studentSession) {
      localStorage.setItem('vault-iitm-session', JSON.stringify(studentSession))
    }
  }, [studentSession])

  // Live clock
  useEffect(() => {
    const update = () => {
      const now = new Date()
      setCurrentTime(
        new Intl.DateTimeFormat('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata'
        }).format(now)
      )
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  const notify = (msg, tone = 'info') => {
    if (tone === 'error') sound.playError()
    else sound.playSuccess()
    setToast({ msg, tone })
    setTimeout(() => setToast(null), 4000)
  }

  const toggleSound = () => {
    const next = sound.toggle()
    setSoundEnabled(next)
    if (next) sound.playKey('enter')
  }

  // Stats calculations
  const totalSlots = LOCKERS.reduce((acc, l) => acc + l.capacity, 0)
  const storedCount = data.parcels.filter(p => p.status === 'stored').length
  const collectedCount = data.parcels.filter(p => p.status === 'collected').length
  const freeCount = totalSlots - storedCount

  // Handlers
  const handleRegisterStudent = (student) => {
    sound.playSuccess()
    setData(prev => ({
      ...prev,
      students: [...prev.students.filter(s => s.phone !== student.phone), student]
    }))
    setStudentSession(student)
    notify(`Profile initialized for ${student.name}`)
  }

  const handleDeposit = ({ phone, parcelId, lockerId, compartment }) => {
    const digits = phone.replace(/\D/g, '')
    const student = data.students.find(s => s.phone === digits)
    if (!student) {
      sound.playError()
      return { error: 'Mobile number not registered in IITM VAULT directory' }
    }
    if (!parcelId.trim()) {
      sound.playError()
      return { error: 'Please enter or scan a courier tracking ID' }
    }
    if (data.parcels.some(p => p.id.toLowerCase() === parcelId.trim().toLowerCase())) {
      sound.playError()
      return { error: 'This tracking ID is already logged in the system' }
    }

    const locker = lockerById(lockerId)
    const occupied = data.parcels.filter(p => p.lockerId === lockerId && p.status === 'stored').map(p => p.compartment)
    const assigned = compartment || Array.from({ length: locker.capacity }, (_, i) => i + 1).find(n => !occupied.includes(n))

    if (!assigned) {
      sound.playError()
      return { error: 'Selected locker unit has zero free compartments' }
    }

    // Generate unique 6-digit OTP
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
      createdAt: `Today, ${currentTime} IST`,
      otp,
      type: locker.kind,
      charge: data.prices[locker.kind === 'cold' ? 'cold' : 'regular'],
      weight: '1.4 kg'
    }

    sound.playSolenoid()
    sound.playSuccess()
    setData(prev => ({ ...prev, parcels: [newParcel, ...prev.parcels] }))
    notify(`Parcel secured in Bay #${assigned}. OTP issued.`)
    return { parcel: newParcel }
  }

  const handleCollect = (parcel) => {
    sound.playSolenoid()
    sound.playDoorOpen()
    sound.playSuccess()
    setData(prev => ({
      ...prev,
      parcels: prev.parcels.map(p =>
        p.id === parcel.id
          ? { ...p, status: 'collected', collectedAt: `Today, ${currentTime} IST` }
          : p
      )
    }))
    setUnlockingCompartment(parcel.compartment)
    notify(`Bay #${parcel.compartment} unlocked. Chamber returned to pool.`)
  }

  const navItems = [
    { id: 'home', label: 'Overview', num: '01', icon: 'grid' },
    { id: 'student', label: 'Student Desk', num: '02', icon: 'user' },
    { id: 'delivery', label: 'Courier Dispatch', num: '03', icon: 'scan' },
    { id: 'collect', label: 'Retrieve PIN Pad', num: '04', icon: 'key', badge: storedCount },
    { id: 'availability', label: 'Network Radar', num: '05', icon: 'radar' },
    { id: 'admin', label: 'Ops Console', num: '06', icon: 'terminal' },
  ]

  return (
    <div className="app-shell">
      {/* MOBILE BACKDROP */}
      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Icon name="box" size={20} />
          </div>
          <div className="brand-text">
            <span className="brand-title">VAULT // IITM</span>
            <span className="brand-subtitle">Autonomous Locker Net</span>
          </div>
        </div>

        <div className="sidebar-telemetry">
          <div className="telemetry-row">
            <span>GRID STATUS</span>
            <span className="telemetry-status">
              <span className="status-beacon" />
              <b>ONLINE</b>
            </span>
          </div>
          <div className="telemetry-row">
            <span>ACTIVE UNITS</span>
            <b>{LOCKERS.length} STATIONS</b>
          </div>
          <div className="telemetry-row">
            <span>CHAMBER POOL</span>
            <b>{freeCount}/{totalSlots} FREE</b>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => {
                sound.playKey('1')
                setPage(item.id)
                setMobileMenuOpen(false)
              }}
            >
              <span className="nav-item-num">{item.num}</span>
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
              {Boolean(item.badge) && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="campus-signature">
            <span>IIT Madras Cyber-Physical</span><br />
            <span>Smart Mobility Lab · 2026</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-area">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <Icon name="grid" size={18} />
            </button>

            <div className="breadcrumb-path">
              <span className="breadcrumb-root">VAULT-NODE-01</span>
              <span className="breadcrumb-sep">//</span>
              <span className="breadcrumb-active">
                {navItems.find(n => n.id === page)?.label}
              </span>
            </div>
          </div>

          <div className="topbar-right">
            <button
              className={`sfx-toggle ${soundEnabled ? 'on' : ''}`}
              onClick={toggleSound}
              title="Toggle Hardware Audio Synthesis"
            >
              <span className="sfx-led" />
              <Icon name={soundEnabled ? 'soundOn' : 'soundMute'} size={14} />
              <span>SFX: {soundEnabled ? 'ARMED' : 'MUTED'}</span>
            </button>

            <div className="hardware-clock">
              <span>IST</span>
              <b>{currentTime || '16:35:00'}</b>
            </div>

            <span className="ping-tag">
              <span className="status-beacon" />
              12ms FIBER
            </span>
          </div>
        </header>

        {/* ACTIVE PAGE */}
        <div className="page-container">
          {page === 'home' && (
            <HomePage
              data={data}
              stored={storedCount}
              available={freeCount}
              totalSlots={totalSlots}
              goto={setPage}
              setDeliveryLocker={setDeliveryLocker}
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
              unlockedCompartment={unlockingCompartment}
            />
          )}

          {page === 'availability' && (
            <AvailabilityPage
              parcels={data.parcels}
              onOpenDispatch={(lid) => {
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
            />
          )}
        </div>
      </main>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`toast-notice ${toast.tone}`}>
          <Icon name={toast.tone === 'error' ? 'info' : 'check'} size={18} />
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  )
}

// --------------------------------------------------------------------------
// PAGE 01: HOME OVERVIEW
// --------------------------------------------------------------------------
function HomePage({ data, stored, available, totalSlots, goto, setDeliveryLocker }) {
  const primaryLocker = LOCKERS[0]

  return (
    <div>
      {/* HERO CHASSIS */}
      <section className="hero-chassis">
        <span className="chassis-screw tl" />
        <span className="chassis-screw tr" />
        <span className="chassis-screw bl" />
        <span className="chassis-screw br" />

        <div className="hero-content">
          <div className="hero-badges">
            <span className="badge-tag amber">
              <span className="status-beacon" /> IIT MADRAS CAMPUS GRID
            </span>
            <span className="badge-tag cyan">SOLENOID SECURED</span>
          </div>

          <h1>
            AUTONOMOUS <br />
            <span className="gradient-text">SMART LOCKERS</span> <br />
            ZERO HAND-OFF FRICTION
          </h1>

          <p>
            Hardware-encrypted parcel compartments distributed across Mandakini, Ganga, Krishna hostels and Tharamani cryo-station for 24/7 contactless deliveries.
          </p>

          <div className="hero-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                sound.playKey('enter')
                goto('delivery')
              }}
            >
              <Icon name="scan" size={16} />
              <span>Courier Dispatch</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => {
                sound.playKey('enter')
                goto('collect')
              }}
            >
              <Icon name="key" size={16} />
              <span>Retrieve with PIN</span>
            </button>

            <button
              className="btn btn-ghost"
              onClick={() => {
                sound.playKey('enter')
                goto('student')
              }}
            >
              <Icon name="user" size={16} />
              <span>Student Pass</span>
            </button>
          </div>

          <div className="hero-specs">
            <div className="spec-cell">
              <span className="spec-label">ACTIVE PARCELS</span>
              <span className="spec-value highlight-amber">{stored}</span>
            </div>
            <div className="spec-cell">
              <span className="spec-label">CHAMBERS FREE</span>
              <span className="spec-value highlight-green">{available} / {totalSlots}</span>
            </div>
            <div className="spec-cell">
              <span className="spec-label">CRYO TEMPERATURE</span>
              <span className="spec-value highlight-cyan">3.9°C REGULATED</span>
            </div>
          </div>
        </div>

        {/* 3D Hardware Display */}
        <div className="hero-hardware">
          <LockerBank3D locker={primaryLocker} parcels={data.parcels} interactive={true} />
        </div>
      </section>

      {/* STATS CHASSIS GRID */}
      <div className="stats-chassis-grid">
        <div className="stat-chassis amber">
          <div className="stat-header">
            <span className="stat-title">Active In Safekeeping</span>
            <Icon name="box" size={18} className="stat-icon" />
          </div>
          <div className="stat-digits">{stored}</div>
          <div className="stat-note">Parcels awaiting recipient collection</div>
        </div>

        <div className="stat-chassis green">
          <div className="stat-header">
            <span className="stat-title">Network Capacity</span>
            <Icon name="grid" size={18} className="stat-icon" />
          </div>
          <div className="stat-digits">{available}</div>
          <div className="stat-note">{Math.round((available / totalSlots) * 100)}% compartments ready to assign</div>
        </div>

        <div className="stat-chassis cyan">
          <div className="stat-header">
            <span className="stat-title">Cryo Cold-Chain (4°C)</span>
            <Icon name="snowflake" size={18} className="stat-icon" />
          </div>
          <div className="stat-digits">
            {LOCKERS[3].capacity - occupancy(LOCKERS[3], data.parcels)}/12
          </div>
          <div className="stat-note">Tharamani Gate Security Kiosk</div>
        </div>

        <div className="stat-chassis">
          <div className="stat-header">
            <span className="stat-title">Solenoid Actuations</span>
            <Icon name="bolt" size={18} className="stat-icon" />
          </div>
          <div className="stat-digits">14,892</div>
          <div className="stat-note">99.99% hardware latch reliability</div>
        </div>
      </div>

      {/* WORKFLOW SEQUENCE */}
      <section className="section-panel">
        <div className="section-panel-header">
          <div>
            <span className="page-eyebrow">Operating Architecture</span>
            <h2>Physical-Digital Hand-off Protocol</h2>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => {
              sound.playKey('1')
              goto('availability')
            }}
          >
            <span>Inspect Campus Map</span>
            <Icon name="arrowRight" size={14} />
          </button>
        </div>

        <div className="workflow-steps-grid">
          <div className="workflow-card">
            <div className="workflow-number">01</div>
            <h3>Courier Scans Barcode</h3>
            <p>Delivery agent arrives at hostel kiosk, sweeps parcel barcode. Unit identifies student & unlocks assigned bay.</p>
          </div>

          <div className="workflow-card">
            <div className="workflow-number">02</div>
            <h3>Solenoid Latch Engaged</h3>
            <p>Package placed inside, door latches automatically with high-torque magnetic interlock and weight confirmation.</p>
          </div>

          <div className="workflow-card">
            <div className="workflow-number">03</div>
            <h3>Encrypted OTP Dispatched</h3>
            <p>System generates unique 6-digit rolling PIN, relayed to student's mobile dashboard and campus notification.</p>
          </div>

          <div className="workflow-card">
            <div className="workflow-number">04</div>
            <h3>Contactless Retrieval</h3>
            <p>Student enters 6-digit PIN on the terminal keypad. Chamber pops open; bay returns to availability pool.</p>
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
  const [form, setForm] = useState(session || { name: '', phone: '', hostel: 'Mandakini Hostel', roll: 'CS22B001' })

  // Quick switch demo student
  const pickPersona = (p) => {
    sound.playKey('1')
    setForm(p)
    onRegister(p)
  }

  const mine = session ? data.parcels.filter(p => p.phone === session.phone) : []
  const activeParcels = mine.filter(p => p.status === 'stored')
  const historyParcels = mine.filter(p => p.status === 'collected')

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="page-eyebrow">Student Identity & Manifest</span>
          <h1>Campus Collection Desk</h1>
          <p className="page-desc">
            Your registered mobile number acts as your physical VAULT locker address across all hostels.
          </p>
        </div>
      </div>

      <div className="student-desk-grid">
        {/* LEFT COLUMN: HOLOGRAPHIC IITM SMART CARD & REGISTRATION */}
        <div>
          <div className="id-card-wrapper">
            <div className="iit-smart-card">
              <div className="card-hologram" />
              <div className="card-top">
                <div className="card-org">IIT MADRAS // VAULT PASS</div>
                <div className="card-chip" />
              </div>
              <div className="card-middle">
                <div className="card-name">{session?.name || 'GUEST SCHOLAR'}</div>
                <div className="card-hostel">{session?.hostel || 'Hostel Not Set'}</div>
              </div>
              <div className="card-bottom">
                <div className="card-details">
                  <small>MOBILE IDENTIFIER</small>
                  <span>{session?.phone ? `+91 ${session.phone}` : 'UNLINKED'}</span>
                </div>
                <div className="card-nfc">
                  <Icon name="bolt" size={14} />
                  <span>NFC ARMED</span>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK PERSONA SWITCHER */}
          <div className="persona-switcher">
            <div className="persona-switcher-title">Switch Active Demo Student</div>
            <div className="persona-buttons">
              {data.students.map(s => (
                <button
                  key={s.phone}
                  className={`persona-btn ${session?.phone === s.phone ? 'selected' : ''}`}
                  onClick={() => pickPersona(s)}
                >
                  {s.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* EDIT / REGISTER PROFILE FORM */}
          <div className="section-panel" style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Update Student Profile</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                onRegister(form)
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <div className="input-group">
                <label>Full Student Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  required
                />
              </div>

              <div className="input-group">
                <label>10-Digit Mobile (Locker ID)</label>
                <input
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="98400xxxxx"
                  required
                />
              </div>

              <div className="input-group">
                <label>Primary Hostel Wing</label>
                <select
                  value={form.hostel}
                  onChange={e => setForm({ ...form, hostel: e.target.value })}
                >
                  {LOCKERS.map(l => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: 6 }}>
                <Icon name="check" size={16} />
                <span>Save Profile</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE PARCELS & COLLECTION PASSES */}
        <div>
          <div className="section-panel">
            <div className="section-panel-header">
              <div>
                <span className="page-eyebrow">Awaiting Pickup ({activeParcels.length})</span>
                <h2>Active Secure Parcels</h2>
              </div>
              {activeParcels.length > 0 && (
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    sound.playKey('enter')
                    goto('collect')
                  }}
                >
                  <Icon name="key" size={14} />
                  <span>Open PIN Terminal</span>
                </button>
              )}
            </div>

            {activeParcels.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                <Icon name="box" size={36} style={{ margin: '0 auto 12px', display: 'block' }} />
                <p>No parcels currently awaiting collection for this student profile.</p>
                <small>When a courier deposits a package, the 6-digit OTP will appear here.</small>
              </div>
            ) : (
              <div className="parcels-grid">
                {activeParcels.map(parcel => {
                  const locker = lockerById(parcel.lockerId)
                  return (
                    <div key={parcel.id} className={`parcel-dossier ${parcel.type === 'cold' ? 'cold' : ''}`}>
                      <div className="parcel-dossier-head">
                        <span className="parcel-barcode-mock">{parcel.id}</span>
                        <span className="parcel-status-pill stored">STORED</span>
                      </div>

                      <table className="parcel-meta-table">
                        <tbody>
                          <tr>
                            <td>LOCKER STATION</td>
                            <td>{locker.name}</td>
                          </tr>
                          <tr>
                            <td>COMPARTMENT</td>
                            <td>BAY #{String(parcel.compartment).padStart(2, '0')}</td>
                          </tr>
                          <tr>
                            <td>SECURED TIME</td>
                            <td>{parcel.createdAt}</td>
                          </tr>
                          <tr>
                            <td>TYPE</td>
                            <td>{parcel.type === 'cold' ? 'CRYO 4°C PERISHABLE' : 'STANDARD CARGO'}</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Prominent OTP Box */}
                      <div className="otp-display-box">
                        <div className="otp-label-group">
                          <small>COLLECTION PIN</small>
                          <span className="otp-digits">{parcel.otp}</span>
                        </div>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: 11 }}
                          onClick={() => {
                            navigator.clipboard?.writeText(parcel.otp)
                            sound.playKey('enter')
                            alert(`OTP ${parcel.otp} copied to clipboard!`)
                          }}
                        >
                          <Icon name="copy" size={13} />
                          <span>Copy</span>
                        </button>
                      </div>

                      <button
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        onClick={() => {
                          sound.playKey('enter')
                          goto('collect')
                        }}
                      >
                        <Icon name="key" size={15} />
                        <span>Open Door at Terminal</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* HISTORIC LOGS */}
          {historyParcels.length > 0 && (
            <div className="section-panel" style={{ marginTop: 24 }}>
              <h3 style={{ marginBottom: 14 }}>Collection History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {historyParcels.map(p => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 6,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11
                    }}
                  >
                    <div>
                      <b style={{ color: 'var(--text-bright)' }}>{p.id}</b>
                      <span style={{ color: 'var(--text-dim)', marginLeft: 12 }}>
                        {lockerById(p.lockerId).short} · Bay #{p.compartment}
                      </span>
                    </div>
                    <span style={{ color: 'var(--green)' }}>COLLECTED {p.collectedAt}</span>
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
// PAGE 03: DISPATCH & DEPOSIT TERMINAL (COURIER)
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

  // Quick Barcode Scans Simulation
  const simulateScan = (barcode, studentPhone, lockerChoice) => {
    sound.playScan()
    setParcelId(barcode)
    setPhone(studentPhone)
    if (lockerChoice) onSelectLocker(lockerChoice)
    setResult(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const res = onDeposit({
      phone,
      parcelId,
      lockerId: selectedLocker,
      compartment: chosenBay
    })
    setResult(res)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="page-eyebrow">Courier Inbound Interface</span>
          <h1>Locker Deposit Kiosk</h1>
          <p className="page-desc">
            Scan delivery package barcode, verify recipient directory profile, and select available compartment.
          </p>
        </div>
      </div>

      <div className="dispatch-terminal">
        {/* LEFT: SCANNER VIEWPORT & DEPOSIT FORM */}
        <div>
          {/* SIMULATED OPTICAL SCANNER */}
          <div className="scanner-viewport">
            <div className="scanner-reticle">
              <div className="scanner-laser-line" />
              <div className="scanner-code-readout">
                {parcelId ? `[SCANNED: ${parcelId}]` : '// ALIGN BARCODE WITH LASER //'}
              </div>
            </div>

            <div className="quick-barcodes-bar">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>
                MOCK SCAN PRESETS:
              </span>
              <button
                className="quick-barcode-pill"
                onClick={() => simulateScan(`AMZN-${Math.floor(1000 + Math.random() * 9000)}`, '9840012300', 'mandakini')}
              >
                Amazon Prime · Ananya (Mandakini)
              </button>
              <button
                className="quick-barcode-pill"
                onClick={() => simulateScan(`BLU-${Math.floor(1000 + Math.random() * 9000)}`, '9840023400', 'ganga')}
              >
                BlueDart · Rohan (Ganga)
              </button>
              <button
                className="quick-barcode-pill"
                onClick={() => simulateScan(`SWG-CRYO-${Math.floor(1000 + Math.random() * 9000)}`, '9840045600', 'tharamani')}
              >
                Swiggy Cold 4°C · Aditya (Tharamani)
              </button>
            </div>
          </div>

          {/* DEPOSIT FORM */}
          <div className="section-panel">
            {result?.parcel ? (
              <div className="dispatch-success-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--green)' }}>
                  <Icon name="check" size={24} />
                  <h3 style={{ color: 'var(--green)' }}>PARCEL SECURED IN CHAMBER</h3>
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  Tracking ID: <b>{result.parcel.id}</b><br />
                  Station: <b>{locker.name}</b><br />
                  Compartment: <b>BAY #{String(result.parcel.compartment).padStart(2, '0')}</b><br />
                  Issued OTP: <b style={{ color: 'var(--amber)', fontSize: 16 }}>{result.parcel.otp}</b>
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      sound.playKey('enter')
                      goto('collect')
                    }}
                  >
                    <span>Test Collection at PIN Pad</span>
                    <Icon name="arrowRight" size={14} />
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      sound.playKey('1')
                      setResult(null)
                      setParcelId('')
                    }}
                  >
                    Deposit Another Package
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="deposit-form-fields">
                <div className="input-group">
                  <label>Package Tracking / Order Barcode</label>
                  <input
                    value={parcelId}
                    onChange={e => { setParcelId(e.target.value); setResult(null) }}
                    placeholder="e.g. AMZN-90214-X"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Recipient Mobile Number (IITM Directory)</label>
                  <input
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setResult(null) }}
                    placeholder="Enter 10-digit number (e.g. 9840012300)"
                    required
                  />
                  {phone && (
                    <div className={`recipient-badge ${matchedStudent ? 'verified' : 'unregistered'}`}>
                      <Icon name={matchedStudent ? 'check' : 'info'} size={14} />
                      <span>
                        {matchedStudent
                          ? `MATCHED: ${matchedStudent.name} (${matchedStudent.hostel})`
                          : 'Student not yet registered in directory'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label>Compartment Assignment</label>
                  <select
                    value={chosenBay || 'auto'}
                    onChange={e => setChosenBay(e.target.value === 'auto' ? null : Number(e.target.value))}
                  >
                    <option value="auto">Automatic (First Available Compartment)</option>
                    {freeBays.map(bay => (
                      <option key={bay} value={bay}>
                        Bay #{String(bay).padStart(2, '0')} (Empty)
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{
                  padding: '12px 14px',
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--text-muted)'
                }}>
                  Courier Storage Fee: <b style={{ color: 'var(--text-bright)' }}>₹{data.prices[locker.kind === 'cold' ? 'cold' : 'regular']}</b> (Billed to delivery company). Student collection is always 100% free.
                </div>

                {result?.error && (
                  <div style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                    [ERROR]: {result.error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={freeBays.length === 0}
                  style={{ marginTop: 8 }}
                >
                  <Icon name="box" size={16} />
                  <span>Lock Chamber & Issue Notification</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* RIGHT: 3D HARDWARE INTERACTIVE RACK */}
        <div>
          <div className="section-panel">
            <div className="section-panel-header" style={{ marginBottom: 16 }}>
              <div>
                <span className="page-eyebrow">Interactive Rack Preview</span>
                <h3>{locker.name}</h3>
              </div>
              <select
                value={selectedLocker}
                onChange={e => {
                  sound.playKey('1')
                  onSelectLocker(e.target.value)
                  setChosenBay(null)
                }}
                style={{ width: 'auto', padding: '6px 12px', fontSize: 11 }}
              >
                {LOCKERS.map(l => (
                  <option key={l.id} value={l.id}>{l.short}</option>
                ))}
              </select>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Click any compartment door directly on the 3D rack below to manually select it for this delivery.
            </p>

            <LockerBank3D
              locker={locker}
              parcels={data.parcels}
              openCompartment={chosenBay}
              onSelectCompartment={(bay) => {
                if (freeBays.includes(bay)) {
                  setChosenBay(bay)
                }
              }}
              flat={true}
              interactive={true}
            />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 18,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-muted)'
            }}>
              <span>BAYS FREE: <b style={{ color: 'var(--green)' }}>{freeBays.length}</b></span>
              <span>OCCUPIED: <b style={{ color: 'var(--amber)' }}>{occupiedList.length}</b></span>
              <span>RATING: <b>IP65 WEATHERPROOF</b></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// PAGE 04: RETRIEVE & KEYPAD KIOSK
// --------------------------------------------------------------------------
function CollectPage({ data, onCollect, unlockedCompartment }) {
  const [pin, setPin] = useState('')
  const [activeParcel, setActiveParcel] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  // Filter stored parcels for easy one-click testing
  const storedParcels = data.parcels.filter(p => p.status === 'stored')

  const handleKeyPress = (char) => {
    sound.playKey(char)
    setErrorMsg('')

    if (char === 'clear') {
      setPin('')
      setActiveParcel(null)
      return
    }

    if (char === 'enter') {
      submitPin(pin)
      return
    }

    if (pin.length < 6) {
      const next = pin + char
      setPin(next)
      if (next.length === 6) {
        submitPin(next)
      }
    }
  }

  const submitPin = (code) => {
    const match = data.parcels.find(p => p.otp === code.trim() && p.status === 'stored')
    if (match) {
      setActiveParcel(match)
      onCollect(match)
    } else {
      sound.playError()
      setErrorMsg('INVALID PIN: No active parcel waiting with this collection code')
    }
  }

  const locker = activeParcel ? lockerById(activeParcel.lockerId) : null

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="page-eyebrow">Physical Terminal Interface</span>
          <h1>Locker PIN Pad Kiosk</h1>
          <p className="page-desc">
            Type the 6-digit collection OTP on the tactile kiosk keypad to trigger solenoid door release.
          </p>
        </div>
      </div>

      <div className="collect-terminal">
        {/* LEFT: INDUSTRIAL KIOSK PINPAD CHASSIS */}
        <div className="kiosk-chassis">
          {/* SEGMENTED 6-DIGIT VFD DISPLAY */}
          <div className="kiosk-display">
            <div className="kiosk-display-label">AUTHENTICATION PASSCODE REQUIRED</div>
            <div className="kiosk-digits-screen">
              {pin.padEnd(6, '_').split('').join(' ')}
            </div>
          </div>

          {/* PHYSICAL 3x4 KEYPAD */}
          <div className="kiosk-keypad">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                className="key-btn"
                onClick={() => handleKeyPress(num)}
              >
                {num}
              </button>
            ))}
            <button
              className="key-btn action-clear"
              onClick={() => handleKeyPress('clear')}
            >
              CLEAR
            </button>
            <button
              className="key-btn"
              onClick={() => handleKeyPress('0')}
            >
              0
            </button>
            <button
              className="key-btn action-enter"
              onClick={() => handleKeyPress('enter')}
            >
              ENTER
            </button>
          </div>

          {errorMsg && (
            <div style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 11, marginTop: 14, textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}

          {/* QUICK DEMO PIN SHORTCUTS */}
          <div className="quick-pins-strip">
            <div className="quick-pins-label">ACTIVE DEMO PINS (CLICK TO TEST POP):</div>
            <div className="quick-pins-list">
              {storedParcels.slice(0, 6).map(p => (
                <button
                  key={p.id}
                  className="quick-pin-pill"
                  onClick={() => {
                    setPin(p.otp)
                    submitPin(p.otp)
                  }}
                >
                  {lockerById(p.lockerId).short.split(' ')[0]} #{p.compartment} → <b>{p.otp}</b>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE UNLOCK REVEAL & THERMAL RECEIPT SLIP */}
        <div>
          {activeParcel && locker ? (
            <div className="section-panel">
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: 'rgba(0, 245, 155, 0.15)',
                  border: '1px solid var(--green)',
                  color: 'var(--green)',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 12px'
                }}>
                  <Icon name="check" size={26} />
                </div>
                <h2 style={{ color: 'var(--green)' }}>COMPARTMENT #{activeParcel.compartment} UNLOCKED</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  Solenoid latch released. Door has popped open on unit {locker.name}.
                </p>
              </div>

              {/* 3D Visualizer with Door Open */}
              <div style={{ margin: '20px 0' }}>
                <LockerBank3D
                  locker={locker}
                  parcels={data.parcels}
                  openCompartment={activeParcel.compartment}
                  flat={true}
                  interactive={false}
                />
              </div>

              {/* THERMAL COLLECTION RECEIPT SLIP */}
              <div className="thermal-receipt">
                <div className="thermal-head">
                  <h3>IIT MADRAS // VAULT RECEIPT</h3>
                  <small>OFFICIAL AUTONOMOUS RETRIEVAL PASS</small>
                </div>
                <div className="thermal-row">
                  <span>PARCEL ID:</span>
                  <b>{activeParcel.id}</b>
                </div>
                <div className="thermal-row">
                  <span>RECIPIENT:</span>
                  <b>{activeParcel.student}</b>
                </div>
                <div className="thermal-row">
                  <span>STATION:</span>
                  <b>{locker.name}</b>
                </div>
                <div className="thermal-row">
                  <span>COMPARTMENT:</span>
                  <b>BAY #{String(activeParcel.compartment).padStart(2, '0')}</b>
                </div>
                <div className="thermal-row">
                  <span>RETRIEVAL TIME:</span>
                  <b>{activeParcel.collectedAt || 'JUST NOW'}</b>
                </div>
                <div className="thermal-row">
                  <span>STUDENT FEE:</span>
                  <b>₹0.00 (FREE CAMPUS ACCESS)</b>
                </div>

                <div className="thermal-qr">
                  <QrMatrix value={`IITM:VAULT:${activeParcel.id}:${activeParcel.otp}`} size={70} />
                </div>

                <div style={{ textAlign: 'center', fontSize: 9, color: '#556' }}>
                  *** PHYSICAL LATCH RELEASED ***<br />
                  PLEASE CLOSE CHAMBER DOOR AFTER REMOVAL
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '6px 12px', fontSize: 11 }}
                    onClick={() => {
                      sound.playKey('enter')
                      window.print()
                    }}
                  >
                    <Icon name="download" size={13} />
                    <span>Print Thermal Slip</span>
                  </button>
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 24 }}
                onClick={() => {
                  sound.playSolenoid()
                  setActiveParcel(null)
                  setPin('')
                }}
              >
                <Icon name="check" size={16} />
                <span>Confirm Parcel Removed & Reset Bay</span>
              </button>
            </div>
          ) : (
            <div className="section-panel" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <Icon name="key" size={44} style={{ color: 'var(--amber)', margin: '0 auto 16px', display: 'block' }} />
              <h3>Awaiting PIN Authorization</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: 360, margin: '8px auto 0' }}>
                Enter the 6-digit collection OTP sent to your registered student dashboard. The mechanical solenoid latch will actuate instantly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// PAGE 05: CAMPUS NETWORK RADAR (AVAILABILITY)
// --------------------------------------------------------------------------
function AvailabilityPage({ parcels, onOpenDispatch }) {
  const [filter, setFilter] = useState('all')

  const totalCapacity = LOCKERS.reduce((a, b) => a + b.capacity, 0)
  const totalOccupied = parcels.filter(p => p.status === 'stored').length
  const totalFree = totalCapacity - totalOccupied

  const filtered = filter === 'cold'
    ? LOCKERS.filter(l => l.kind === 'cold')
    : filter === 'regular'
      ? LOCKERS.filter(l => l.kind === 'regular')
      : LOCKERS

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="page-eyebrow">Real-Time Telemetry Radar</span>
          <h1>Campus Locker Stations</h1>
          <p className="page-desc">
            Live telemetry stream from all 4 autonomous locker units across North Campus, South Campus, and Tharamani Gate.
          </p>
        </div>

        <div className="segmented-pill-group">
          <button
            className={`segmented-pill-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => { sound.playKey('1'); setFilter('all') }}
          >
            All Stations ({LOCKERS.length})
          </button>
          <button
            className={`segmented-pill-btn ${filter === 'cold' ? 'active' : ''}`}
            onClick={() => { sound.playKey('1'); setFilter('cold') }}
          >
            Cryo 4°C Bays
          </button>
          <button
            className={`segmented-pill-btn ${filter === 'regular' ? 'active' : ''}`}
            onClick={() => { sound.playKey('1'); setFilter('regular') }}
          >
            Standard Bays
          </button>
        </div>
      </div>

      {/* OVERALL CAPACITY BAR */}
      <div className="section-panel" style={{ padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            OVERALL CAMPUS OCCUPANCY
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text-bright)' }}>
            {totalOccupied} / {totalCapacity} OCCUPIED ({totalFree} AVAILABLE)
          </span>
        </div>
        <div style={{ height: 12, background: '#080d14', borderRadius: 6, overflow: 'hidden', display: 'flex' }}>
          <div
            style={{
              width: `${(totalOccupied / totalCapacity) * 100}%`,
              background: 'linear-gradient(90deg, #ff7a3d 0%, #00f0ff 100%)',
              transition: 'width 0.4s'
            }}
          />
        </div>
      </div>

      {/* STATIONS GRID */}
      <div className="network-radar-stations">
        {filtered.map(station => {
          const used = occupancy(station, parcels)
          const free = station.capacity - used
          const pct = Math.round((used / station.capacity) * 100)

          return (
            <div key={station.id} className={`station-card ${station.kind === 'cold' ? 'cryo' : ''}`}>
              <div className="station-head">
                <div>
                  <h3 className="station-name">{station.name}</h3>
                  <div className="station-location">{station.location}</div>
                </div>
                <span className="badge-tag green">
                  <span className="status-beacon" /> 100% ONLINE
                </span>
              </div>

              {/* Occupancy Progress */}
              <div className="station-occupancy-bar">
                <div className="station-bar-fill" style={{ width: `${pct}%` }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11, marginBottom: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}>{used}/{station.capacity} Chambers Filled</span>
                <b style={{ color: 'var(--green)' }}>{free} Available Now</b>
              </div>

              {/* Station Telemetry Grid */}
              <div className="station-telemetry-grid">
                <div className="telemetry-item">
                  <small>CHAMBER TEMP</small>
                  <strong style={{ color: station.kind === 'cold' ? 'var(--cyan)' : 'var(--text-bright)' }}>
                    {station.temp}
                  </strong>
                </div>
                <div className="telemetry-item">
                  <small>POWER BUS</small>
                  <strong>{station.power}</strong>
                </div>
                <div className="telemetry-item">
                  <small>FIBER LATENCY</small>
                  <strong>11ms RTT</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    sound.playKey('enter')
                    onOpenDispatch(station.id)
                  }}
                >
                  <Icon name="scan" size={15} />
                  <span>Dispatch To This Unit</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// PAGE 06: OPS COMMAND CONSOLE (ADMIN)
// --------------------------------------------------------------------------
function AdminPage({ data, setData, stored, collected, available, notify }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [prices, setPrices] = useState(data.prices)

  const handlePriceSave = (e) => {
    e.preventDefault()
    sound.playSuccess()
    setData(prev => ({
      ...prev,
      prices: { regular: Number(prices.regular), cold: Number(prices.cold) }
    }))
    notify('Storage rate card updated.')
  }

  const handleSimulateBatch = () => {
    sound.playScan()
    sound.playSuccess()
    const newItems = Array.from({ length: 3 }, (_, i) => {
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
        weight: '1.2 kg'
      }
    })
    setData(prev => ({ ...prev, parcels: [...newItems, ...prev.parcels] }))
    notify('3 simulated packages deposited across stations.')
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
    a.download = `vault-iitm-manifest-${Date.now()}.csv`
    a.click()
    notify('Exported dispatch manifest CSV.')
  }

  const handleResetData = () => {
    if (confirm('Reset all parcels and sessions to campus factory seed data?')) {
      sound.playSolenoid()
      setData(initialData)
      localStorage.removeItem('vault-iitm-data')
      notify('System data restored to factory defaults.')
    }
  }

  const filteredParcels = data.parcels.filter(p => {
    const matchesFilter = filter === 'all' || p.status === filter
    const matchesSearch = !search ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.student.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
    return matchesFilter && matchesSearch
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="page-eyebrow">Administrative Command Center</span>
          <h1>Locker Operations Console</h1>
          <p className="page-desc">
            Campus security and facilities dashboard for hardware diagnostics, tariffs, and parcel manifests.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={handleSimulateBatch}>
            <Icon name="box" size={14} />
            <span>Deposit 3 Mock Deliveries</span>
          </button>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Icon name="download" size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="admin-grid-layout">
        {/* PARCEL MANIFEST DATA TABLE */}
        <div className="admin-table-wrapper">
          <div className="admin-table-filters">
            <div className="segmented-pill-group">
              <button
                className={`segmented-pill-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => { sound.playKey('1'); setFilter('all') }}
              >
                All Parcels ({data.parcels.length})
              </button>
              <button
                className={`segmented-pill-btn ${filter === 'stored' ? 'active' : ''}`}
                onClick={() => { sound.playKey('1'); setFilter('stored') }}
              >
                In Safekeeping ({stored})
              </button>
              <button
                className={`segmented-pill-btn ${filter === 'collected' ? 'active' : ''}`}
                onClick={() => { sound.playKey('1'); setFilter('collected') }}
              >
                Collected ({collected})
              </button>
            </div>

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search ID, Student, or Phone..."
              style={{ width: 220, height: 32, fontSize: 11 }}
            />
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Station</th>
                <th>Bay</th>
                <th>Recipient</th>
                <th>Status</th>
                <th>OTP PIN</th>
              </tr>
            </thead>
            <tbody>
              {filteredParcels.slice(0, 15).map(p => {
                const locker = lockerById(p.lockerId)
                return (
                  <tr key={p.id}>
                    <td>
                      <b style={{ color: 'var(--text-bright)' }}>{p.id}</b>
                    </td>
                    <td>{locker.short}</td>
                    <td>BAY #{String(p.compartment).padStart(2, '0')}</td>
                    <td>
                      <div>{p.student}</div>
                      <small style={{ color: 'var(--text-dim)' }}>{p.phone}</small>
                    </td>
                    <td>
                      <span className={`parcel-status-pill ${p.status}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <code style={{ color: 'var(--amber)', fontWeight: 700 }}>{p.otp}</code>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* SIDEBAR: DIAGNOSTICS & TARIFF CONFIG */}
        <div className="admin-sidebar-panels">
          {/* HARDWARE DIAGNOSTICS */}
          <div className="admin-panel">
            <h3>Subsystem Telemetry</h3>
            <div className="diagnostic-item">
              <span style={{ color: 'var(--text-muted)' }}>Solenoid Latches</span>
              <b style={{ color: 'var(--green)' }}>72/72 HEALTHY</b>
            </div>
            <div className="diagnostic-item">
              <span style={{ color: 'var(--text-muted)' }}>Cryo Loop Pressure</span>
              <b style={{ color: 'var(--cyan)' }}>4.2 BAR (R134a)</b>
            </div>
            <div className="diagnostic-item">
              <span style={{ color: 'var(--text-muted)' }}>5G Mesh Ping</span>
              <b style={{ color: 'var(--green)' }}>12ms IITM-NET</b>
            </div>
            <div className="diagnostic-item">
              <span style={{ color: 'var(--text-muted)' }}>Emergency Override</span>
              <b style={{ color: 'var(--amber)' }}>STANDBY ARMED</b>
            </div>
          </div>

          {/* TARIFF / RATE CARD */}
          <form className="admin-panel" onSubmit={handlePriceSave}>
            <h3>Courier Rate Card</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: '14px 0' }}>
              <div className="input-group">
                <label>Standard Ambient Locker Fee (₹)</label>
                <input
                  type="number"
                  value={prices.regular}
                  onChange={e => setPrices({ ...prices, regular: e.target.value })}
                  min="0"
                />
              </div>
              <div className="input-group">
                <label>Refrigerated Cryo 4°C Fee (₹)</label>
                <input
                  type="number"
                  value={prices.cold}
                  onChange={e => setPrices({ ...prices, cold: e.target.value })}
                  min="0"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>
              Save Tariffs
            </button>
            <small style={{ color: 'var(--text-dim)', fontSize: 10, display: 'block', marginTop: 8 }}>
              Fees charged solely to delivery logistics carriers. Student retrieval remains permanently free.
            </small>
          </form>

          {/* DANGER ZONE / FACTORY RESET */}
          <div className="admin-panel" style={{ borderColor: 'rgba(255, 51, 75, 0.3)' }}>
            <h3 style={{ color: 'var(--red)' }}>Factory Maintenance</h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
              Clear browser state and return to initial seed database.
            </p>
            <button
              className="btn btn-ghost"
              style={{ color: 'var(--red)', borderColor: 'rgba(255, 51, 75, 0.4)', width: '100%' }}
              onClick={handleResetData}
            >
              Reset to Campus Factory Seeds
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// MOUNT
// --------------------------------------------------------------------------
createRoot(document.getElementById('root')).render(<App />)
