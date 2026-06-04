import React, { useEffect, useState, useRef } from 'react'
import { 
  TrendingUp, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  RefreshCw, 
  Search,
  Layers,
  Database,
  Lock,
  Unlock,
  LogOut,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  BarChart3,
  Activity,
  Terminal,
  ChevronRight,
  CreditCard,
  ArrowUpRight,
  Check,
  Settings,
  ShieldAlert,
  Server,
  Download,
  Copy,
  FileText,
  Plus,
  ArrowLeft,
  Smartphone,
  Palette,
  Sparkles,
  ChevronDown
} from 'lucide-react'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  query, 
  orderBy,
  serverTimestamp,
  setDoc,
  writeBatch
} from 'firebase/firestore'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import useCopyToClipboard from './hooks/useCopyToClipboard'
import { exportCommissionReceiptPDF } from './services/pdfService'
import useToast from './hooks/useToast'
import GuidedToast from './components/ui/GuidedToast'
import { useAlertConfirm } from './components/common/AlertConfirmContext'
import DarkModeToggle from './components/ui/DarkModeToggle'


// Variables de entorno para conectar al Firebase Central de Control
const CENTRAL_CONFIG = {
  apiKey: import.meta.env.VITE_DEVELOPER_CENTRAL_API_KEY || "",
  authDomain: import.meta.env.VITE_DEVELOPER_CENTRAL_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_DEVELOPER_CENTRAL_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_DEVELOPER_CENTRAL_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_DEVELOPER_CENTRAL_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_DEVELOPER_CENTRAL_APP_ID || ""
}

const CLIENT_ID = import.meta.env.VITE_DEVELOPER_CLIENT_ID || "ventas-smartfix"
const DEV_TOKEN = import.meta.env.VITE_DEVELOPER_TELEMETRY_TOKEN || "test-token"

function CustomSelect({ value, onChange, options, className }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const selectedOption = options.find(opt => (opt.id !== undefined ? opt.id : opt) === value)
  const selectedLabel = selectedOption ? (selectedOption.name || selectedOption.label || selectedOption.id || selectedOption) : value

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-[var(--color-surface-2)]/40 hover:bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none flex items-center justify-between transition-colors focus:border-indigo-500 cursor-pointer ${className || ''}`}
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto animate-scale-up">
          {options.map(opt => {
            const id = opt.id !== undefined ? opt.id : opt
            const label = opt.name || opt.label || opt.id || opt
            const isSelected = id === value
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onChange({ target: { value: id } })
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer block ${
                  isSelected 
                    ? 'bg-indigo-600 text-white font-bold' 
                    : 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function App() {
  const { showAlert, showConfirm } = useAlertConfirm()
  const { toast, showToast, hideToast } = useToast()
  const [isCopied, copy] = useCopyToClipboard()
  const [user, setUser] = useState(null)
  const [reports, setReports] = useState([])
  const [activeMetricModal, setActiveMetricModal] = useState(null)
  const [newClientName, setNewClientName] = useState('')
  const [selectedCrmClientId, setSelectedCrmClientId] = useState(null)
  const [crmSearch, setCrmSearch] = useState('')
  const [clientesSaas, setClientesSaas] = useState([
    { id: 'ventas-smartfix', comisionPorcentaje: 1.5 },
    { id: 'tienda-calzado-x', comisionPorcentaje: 2.0 },
    { id: 'restaurante-gourmet', comisionPorcentaje: 1.0 },
    { id: 'minimercado-central', comisionPorcentaje: 1.2 },
    { id: 'moda-express', comisionPorcentaje: 1.8 },
    { id: 'ferreteria-nacional', comisionPorcentaje: 1.5 }
  ])
  const [telemetryTokens, setTelemetryTokens] = useState([])
  const [onboardingData, setOnboardingData] = useState(null)

  // Estados para el aprovisionamiento de nuevo cliente
  const [billingMode, setBillingMode] = useState('percentage')
  const [comisionPorcentaje, setComisionPorcentaje] = useState(1.5)
  const [montoFijoServicio, setMontoFijoServicio] = useState(500)
  const [pagoMensualFijo, setPagoMensualFijo] = useState(50000)

  const [fbApiKey, setFbApiKey] = useState('')
  const [fbAuthDomain, setFbAuthDomain] = useState('')
  const [fbProjectId, setFbProjectId] = useState('')
  const [fbStorageBucket, setFbStorageBucket] = useState('')
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState('')
  const [fbAppId, setFbAppId] = useState('')
  const [targetPath, setTargetPath] = useState('')
  const [templates, setTemplates] = useState([
    { id: 'template-core-seed', name: 'Crear desde cero' }
  ])
  const [selectedTemplate, setSelectedTemplate] = useState('template-core-seed')
  const [isRegistering, setIsRegistering] = useState(false)
  const [enableGithub, setEnableGithub] = useState(true)
  const [enableFirebaseDeploy, setEnableFirebaseDeploy] = useState(true)
  const [isProvisioning, setIsProvisioning] = useState(false)
  const [isFetchingConfig, setIsFetchingConfig] = useState(false)
  const [fbVapidKey, setFbVapidKey] = useState('')
  // Guarda datos del cliente cuando Firestore OK pero CLI falla — permite reintentar solo el paso físico
  const [pendingCliProvisioning, setPendingCliProvisioning] = useState(null)

  // Onboarding & Branding premium states
  const [isOnboardingActive, setIsOnboardingActive] = useState(false)
  const [primaryColor, setPrimaryColor] = useState('#6366f1')
  const [secondaryColor, setSecondaryColor] = useState('#a855f7')
  const [bgColor, setBgColor] = useState('#0f172a')
  const [textColor, setTextColor] = useState('#f8fafc')
  const [googleFont, setGoogleFont] = useState('Inter')
  const [enablePwa, setEnablePwa] = useState(true)
  const [enablePush, setEnablePush] = useState(true)
  const [enableBilling, setEnableBilling] = useState(false)
  const [enableDianBilling, setEnableDianBilling] = useState(false)
  const [costoPorFacturaDian, setCostoPorFacturaDian] = useState(150)
  const [customRequirements, setCustomRequirements] = useState('')
  const [wizardTab, setWizardTab] = useState('server')
  const [isFontModalOpen, setIsFontModalOpen] = useState(false)
  const [fontSearchQuery, setFontSearchQuery] = useState('')

  // Pre-load all Google Fonts for previews when onboarding is active
  useEffect(() => {
    if (!isOnboardingActive) return;
    const allFontsId = 'all-preview-fonts';
    let link = document.getElementById(allFontsId);
    if (!link) {
      link = document.createElement('link');
      link.id = allFontsId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = 'https://fonts.googleapis.com/css2?family=Cabin&family=DM+Sans&family=Fira+Sans&family=Inter&family=Lora&family=Manrope&family=Montserrat&family=Nunito&family=Outfit&family=Playfair+Display&family=Poppins&family=Plus+Jakarta+Sans&family=Quicksand&family=Roboto&family=Sora&family=Space+Grotesk&family=Syne&display=swap';
  }, [isOnboardingActive]);

  // Dynamic font loader for premium mobile preview
  useEffect(() => {
    const fontId = 'dynamic-preview-font';
    let link = document.getElementById(fontId);
    if (!link) {
      link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?family=${googleFont.replace(' ', '+')}:wght@400;600;800&display=swap`;
  }, [googleFont]);

  // Control de Tema Claro/Oscuro
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  // Estados de carga, búsqueda y UI general
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [isSimulated, setIsSimulated] = useState(false)
  const [dbStatus, setDbStatus] = useState('conectando')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [systemLogs, setSystemLogs] = useState([])
  const [logPage, setLogPage] = useState(1)
  const [crmStatusFilter, setCrmStatusFilter] = useState('todos')

  const getClientRate = (clientId) => {
    const configObj = clientesSaas.find(c => c.id === clientId)
    return configObj && configObj.comisionPorcentaje !== undefined ? parseFloat(configObj.comisionPorcentaje) : 1.5
  }

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  // Cargar plantillas dinámicamente
  useEffect(() => {
    fetch('http://localhost:3001/api/templates')
      .then(res => res.json())
      .then(data => {
        const seedTemplate = { id: 'template-core-seed', name: 'Crear desde cero' }
        if (Array.isArray(data)) {
          const list = data.some(t => (t.id || t) === 'template-core-seed')
            ? data
            : [seedTemplate, ...data]
          setTemplates(list)
          if (list.length > 0 && !list.some(t => (t.id || t) === selectedTemplate)) {
            setSelectedTemplate(list[0].id || list[0])
          }
        } else {
          setTemplates([
            seedTemplate,
            { id: 'template-ventas', name: 'Plantilla de Ventas Base (Local)' }
          ])
        }
      })
      .catch(err => {
        console.warn("No se pudo cargar plantillas del backend CLI, usando fallback:", err)
        setTemplates([
          { id: 'template-core-seed', name: 'Crear desde cero' },
          { id: 'template-ventas', name: 'Plantilla de Ventas Base (Local)' }
        ])
      })
  }, [])

  // Auto-detectar credenciales Firebase desde el CLI Bridge local
  const handleAutoDetectConfig = async () => {
    if (!fbProjectId.trim()) {
      showToast('Ingresa primero el Firebase Project ID para auto-detectar', { type: 'error' })
      return
    }
    setIsFetchingConfig(true)
    addLog(`Auto-detectando credenciales Firebase para proyecto: ${fbProjectId}...`, 'info')
    try {
      const res = await fetch(
        `http://localhost:3001/api/firebase-config?projectId=${encodeURIComponent(fbProjectId)}&projectName=${encodeURIComponent(newClientName || fbProjectId)}`
      )
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error desconocido del servidor CLI.')
      }
      const { config } = data
      setFbApiKey(config.apiKey || '')
      setFbAuthDomain(config.authDomain || '')
      setFbStorageBucket(config.storageBucket || '')
      setFbMessagingSenderId(config.messagingSenderId || '')
      setFbAppId(config.appId || '')
      addLog(`✓ Credenciales Firebase auto-detectadas y cargadas para ${fbProjectId}.`, 'success')
      showToast('Configuración de Firebase auto-detectada y rellenada ✓', { type: 'success' })
    } catch (err) {
      console.error('Auto-detect error:', err)
      addLog(`Error al auto-detectar config Firebase: ${err.message}`, 'error')
      showToast(`CLI offline o error: ${err.message}. Copia las credenciales manualmente.`, { type: 'error' })
    } finally {
      setIsFetchingConfig(false)
    }
  }

  const handleClientNameChange = (val) => {
    setNewClientName(val)
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    setTargetPath(val.trim() ? `D:\\Aplicaciones\\App-${slug}` : '')
  }

  // Reintentar solo el aprovisionamiento físico en disco (CLI) cuando Firestore ya fue exitoso
  const handleRetryCliProvisioning = async () => {
    if (!pendingCliProvisioning) return
    const { clientId, nombre, comisionPorcentaje, telemetryToken, payload } = pendingCliProvisioning

    addLog(`[Reintento] Volviendo a contactar el daemon CLI para provisionar: ${clientId}...`, 'warning')
    setIsProvisioning(true)

    try {
      const cliRes = await fetch('http://localhost:3001/api/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (cliRes.ok) {
        const resData = await cliRes.json()
        const promptResult = resData.prompt || (resData.data && resData.data.prompt) || ''
        addLog(`[CLI API] Reintento exitoso. Proyecto ${clientId} aprovisionado en disco.`, 'success')
        showToast(`Reintento exitoso — ${nombre} aprovisionado en disco ✓`, { type: 'success' })
        setOnboardingData(prev => prev ? { ...prev, prompt: promptResult } : {
          clientId,
          token: telemetryToken,
          comisionPorcentaje,
          vapidKey: payload.firebaseConfig?.vapidKey || '',
          prompt: promptResult
        })
        setPendingCliProvisioning(null)
      } else {
        const errText = await cliRes.text()
        addLog(`[Reintento fallido] CLI respondió con error: ${errText}`, 'error')
        showToast(`Sigue fallando: ${errText}`, { type: 'error' })
      }
    } catch (retryErr) {
      addLog(`[Reintento fallido] Daemon CLI sigue offline: ${retryErr.message}`, 'error')
      showToast('El servidor CLI sigue offline. Verifica que esté corriendo en el puerto 3001.', { type: 'error' })
    } finally {
      setIsProvisioning(false)
    }
  }

  // Descartar aprovisionamiento pendiente eliminándolo físicamente de Firestore Central
  const handleDiscardPendingProvisioning = async () => {
    if (!pendingCliProvisioning) return
    const { clientId, telemetryToken, nombre } = pendingCliProvisioning

    const confirmed = await showConfirm({
      title: 'Descartar Aprovisionamiento',
      message: `¿Estás seguro de que deseas descartar y eliminar el registro de ${nombre} de Firestore central?`,
      confirmText: 'Sí, Descartar',
      cancelText: 'Cancelar',
      variant: 'error'
    })

    if (!confirmed) return

    addLog(`Descartando y eliminando cliente ${clientId} de Firestore central...`, "warning")

    if (isSimulated) {
      setPendingCliProvisioning(null)
      addLog(`[Sandbox] Registro de cliente ${clientId} descartado localmente.`, "success")
      showToast('Registro de cliente descartado (Sandbox) ✓', { type: 'success' })
      return
    }

    const centralApp = getCentralApp()
    if (!centralApp) return
    const dbInstance = getFirestore(centralApp)

    try {
      const batch = writeBatch(dbInstance)
      const clientRef = doc(dbInstance, 'clientes_saas', clientId)
      const tokenRef = doc(dbInstance, 'tokens', telemetryToken)

      batch.delete(clientRef)
      batch.delete(tokenRef)

      await batch.commit()

      addLog(`[Firestore] Registro de cliente ${clientId} y su token ${telemetryToken} eliminados con éxito.`, "success")
      setPendingCliProvisioning(null)
      showToast('Registro de cliente descartado y eliminado de Firestore central', { type: 'success' })
    } catch (err) {
      console.error("Error al descartar cliente de Firestore:", err)
      addLog(`Error al descartar cliente: ${err.message}`, "error")
      showToast(`Error al descartar: ${err.message}`, { type: 'error' })
    }
  }

  // Agregar log a la consola
  const addLog = (message, type = 'info', client = null) => {
    const timestamp = new Date().toLocaleTimeString('es-CO')
    setSystemLogs(prev => [
      { timestamp, message, type, client },
      ...prev.slice(0, 49) // Limitar a 50 logs
    ])
    setLogPage(1) // Reset a la primera página para ver el nuevo log
  }

  // Obtener Firebase Central
  const getCentralApp = () => {
    if (!CENTRAL_CONFIG.apiKey || !CENTRAL_CONFIG.projectId) {
      return null
    }
    const appName = "centralDevApp"
    try {
      if (getApps().some(app => app.name === appName)) {
        return getApp(appName)
      } else {
        return initializeApp(CENTRAL_CONFIG, appName)
      }
    } catch (err) {
      console.error("Error inicializando Firebase Central:", err)
      return null
    }
  }

  // Auth y Firebase Listeners
  useEffect(() => {
    addLog("Iniciando conexión con Consola Central...", "warning")
    const centralApp = getCentralApp()
    if (!centralApp) {
      loadSimulatedData()
      setIsSimulated(true)
      setDbStatus('simulado')
      setIsLoading(false)
      addLog("Firebase Central no configurado en .env.local. Cargado entorno sandbox.", "warning")
      return
    }

    const authInstance = getAuth(centralApp)
    const dbInstance = getFirestore(centralApp)
    setDbStatus('conectado')
    addLog("Conexión con base de datos Firestore Central establecida.", "success")

    // Escuchar cambios de sesión
    const unsubAuth = onAuthStateChanged(authInstance, (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        addLog(`Sesión iniciada como ${firebaseUser.email}`, "success")
        
        let unsubDocs = () => {}
        let unsubClientes = () => {}
        let unsubTokens = () => {}

        try {
          // Escuchar reportes en tiempo real
          const q = query(collection(dbInstance, 'reportesBilling'), orderBy('periodo', 'desc'))
          unsubDocs = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
            setReports(data)
            setIsLoading(false)
            const clientsList = Array.from(new Set(data.map(d => d.clientId || 'desconocido'))).join(', ')
            addLog(`Sincronizados ${data.length} reportes de facturación de clientes en vivo. Clientes: [${clientsList}]`, "success")
          }, (error) => {
            console.warn("Fallo al leer datos reales. Cargando sandbox local:", error)
            loadSimulatedData()
            setIsSimulated(true)
            setDbStatus('error-sandbox')
            setIsLoading(false)
            addLog("Acceso denegado a Firestore. Cargando Sandbox local automático.", "error")
          })

          // Escuchar configuración de tasas comisiones SaaS
          const qClientes = collection(dbInstance, 'clientes_saas')
          unsubClientes = onSnapshot(qClientes, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
            setClientesSaas(data)
            addLog(`Sincronizadas ${data.length} configuraciones de clientes SaaS en tiempo real.`, "success")
          }, (error) => {
            console.warn("Fallo al escuchar clientes_saas:", error)
          })

          // Escuchar tokens de telemetría en tiempo real
          const qTokens = collection(dbInstance, 'tokens')
          unsubTokens = onSnapshot(qTokens, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
            setTelemetryTokens(data)
          }, (error) => {
            console.warn("Fallo al escuchar tokens:", error)
          })
        } catch (dbErr) {
          console.error("Error setting up Firestore listeners:", dbErr)
        }
        
        return () => {
          unsubDocs()
          unsubClientes()
          unsubTokens()
        }
      } else {
        setReports([])
        setIsLoading(false)
        addLog("Cerrando sesión del desarrollador.", "info")
      }
    })

    return () => unsubAuth()
  }, [])

  const loadSimulatedData = () => {
    setReports([
      {
        id: 'ventas-smartfix_2026-06',
        clientId: 'ventas-smartfix',
        periodo: '2026-06',
        totalVentas: 6850000,
        comisionPorcentaje: 1.5,
        comisionValor: 102750,
        estadoPago: 'pendiente',
        updatedAt: { toDate: () => new Date() }
      },
      {
        id: 'tienda-calzado-x_2026-06',
        clientId: 'tienda-calzado-x',
        periodo: '2026-06',
        totalVentas: 9400000,
        comisionPorcentaje: 2.0,
        comisionValor: 188000,
        estadoPago: 'pagado',
        updatedAt: { toDate: () => new Date(Date.now() - 3600000) }
      },
      {
        id: 'restaurante-gourmet_2026-05',
        clientId: 'restaurante-gourmet',
        periodo: '2026-05',
        totalVentas: 14200000,
        comisionPorcentaje: 1.0,
        comisionValor: 142000,
        estadoPago: 'pagado',
        updatedAt: { toDate: () => new Date(Date.now() - 172800000) }
      },
      {
        id: 'minimercado-central_2026-06',
        clientId: 'minimercado-central',
        periodo: '2026-06',
        totalVentas: 18900000,
        comisionPorcentaje: 1.2,
        comisionValor: 226800,
        estadoPago: 'pendiente',
        updatedAt: { toDate: () => new Date(Date.now() - 5000000) }
      },
      {
        id: 'moda-express_2026-05',
        clientId: 'moda-express',
        periodo: '2026-05',
        totalVentas: 8100000,
        comisionPorcentaje: 1.8,
        comisionValor: 145800,
        estadoPago: 'pagado',
        updatedAt: { toDate: () => new Date(Date.now() - 15000000) }
      },
      {
        id: 'ferreteria-nacional_2026-05',
        clientId: 'ferreteria-nacional',
        periodo: '2026-05',
        totalVentas: 11500000,
        comisionPorcentaje: 1.5,
        comisionValor: 172500,
        estadoPago: 'pendiente',
        updatedAt: { toDate: () => new Date(Date.now() - 25000000) }
      }
    ])
  }

  // Login
  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    addLog(`Intentando autenticación para ${email}...`, "info")

    const centralApp = getCentralApp()
    if (!centralApp) {
      // Si estamos en simulado, permitir entrada con cualquier dato
      setUser({ email, uid: 'simulated-uid' })
      setAuthLoading(false)
      addLog("Sandbox Bypass: Sesión simulada autorizada.", "success")
      return
    }

    try {
      const authInstance = getAuth(centralApp)
      await signInWithEmailAndPassword(authInstance, email, password)
    } catch (err) {
      console.error(err)
      setAuthError('Credenciales incorrectas o error de conexión.')
      addLog("Error de inicio de sesión: Credenciales inválidas.", "error")
    } finally {
      setAuthLoading(false)
    }
  }

  // Logout
  const handleLogout = async () => {
    const centralApp = getCentralApp()
    if (!centralApp) {
      setUser(null)
      return
    }
    const authInstance = getAuth(centralApp)
    await signOut(authInstance)
  }

  // Toggle estado de pago
  const handleTogglePayment = async (report) => {
    const nuevoEstado = (report.estadoPago || 'pendiente').toLowerCase() === 'pagado' ? 'pendiente' : 'pagado'
    
    const confirmed = await showConfirm({
      title: nuevoEstado === 'pagado' ? 'Aprobar Pago' : 'Marcar como Pendiente',
      message: `¿Estás seguro de que deseas marcar el reporte de ${report.clientId} (${report.periodo}) como ${nuevoEstado.toUpperCase()}?`,
      confirmText: nuevoEstado === 'pagado' ? 'Sí, Aprobar' : 'Sí, Pendiente',
      cancelText: 'Cancelar',
      variant: nuevoEstado === 'pagado' ? 'success' : 'warning'
    })
    
    if (!confirmed) return

    addLog(`Cambiando estado de pago para ${report.clientId} (${report.periodo}) a ${nuevoEstado.toUpperCase()}...`, "info")
    
    if (isSimulated) {
      setReports(prev => prev.map(r => r.id === report.id ? { 
        ...r, 
        estadoPago: nuevoEstado,
        updatedAt: { toDate: () => new Date() }
      } : r))
      
      // Actualizar inspector si está abierto
      if (selectedReport && selectedReport.id === report.id) {
        setSelectedReport(prev => ({ ...prev, estadoPago: nuevoEstado, updatedAt: { toDate: () => new Date() } }))
      }
      addLog(`[Sandbox] Estado de pago actualizado localmente para ${report.clientId}.`, "success")
      showToast(`[Sandbox] Pago actualizado a ${nuevoEstado}`, { type: 'success' })
      return
    }

    const centralApp = getCentralApp()
    if (!centralApp) return
    const dbInstance = getFirestore(centralApp)

    try {
      const docRef = doc(dbInstance, 'reportesBilling', report.id)
      await updateDoc(docRef, {
        estadoPago: nuevoEstado,
        updatedAt: serverTimestamp()
      })
      addLog(`[Firestore] Estado de pago guardado para ${report.clientId}.`, "success")
      showToast(`Pago de ${report.clientId} actualizado a ${nuevoEstado}`, { type: 'success' })
    } catch (err) {
      console.error("Error actualizando pago:", err)
      addLog(`Error al guardar estado de pago: ${err.message}`, "error")
      showToast(`Error al actualizar pago: ${err.message}`, { type: 'error' })
    }
  }

  // Crear reporte prueba
  const handleCreateTestReport = async () => {
    const targetClient = isSimulated ? 'cliente-simulado-' + Math.floor(Math.random() * 10) : CLIENT_ID
    const testPeriod = new Date().toISOString().substring(0, 7)
    const reportId = `${targetClient}_${testPeriod}`
    const sales = Math.floor(Math.random() * 8000000) + 2000000
    const pct = getClientRate(targetClient)
    const comValue = (sales * pct) / 100
    
    addLog(`Generando telemetría de prueba para ${targetClient} ($${sales.toLocaleString()} Ventas, ${pct}%)`, "info", targetClient)

    if (isSimulated) {
      const newRep = {
        id: reportId,
        clientId: targetClient,
        periodo: testPeriod,
        totalVentas: sales,
        comisionPorcentaje: pct,
        comisionValor: comValue,
        estadoPago: 'pendiente',
        updatedAt: { toDate: () => new Date() }
      }
      setReports(prev => [newRep, ...prev.filter(r => r.id !== reportId)])
      addLog(`[Sandbox] Reporte simulado insertado correctamente.`, "success", targetClient)
      return
    }

    const centralApp = getCentralApp()
    if (!centralApp) return
    const dbInstance = getFirestore(centralApp)

    try {
      const tokenDoc = telemetryTokens.find(t => t.clientId === targetClient)
      const activeToken = tokenDoc ? tokenDoc.id : DEV_TOKEN
      const docRef = doc(dbInstance, 'reportesBilling', reportId)
      await setDoc(docRef, {
        clientId: targetClient,
        token: activeToken,
        periodo: testPeriod,
        totalVentas: sales,
        comisionPorcentaje: pct,
        comisionValor: comValue,
        estadoPago: 'pendiente',
        updatedAt: serverTimestamp()
      })
      addLog(`[Firestore] Telemetría enviada con éxito a la nube central.`, "success", targetClient)
    } catch (err) {
      console.error(err)
      addLog(`Error al enviar telemetría: ${err.message}`, "error")
    }
  }

  // Filtro
  const filteredReports = reports.filter(r => {
    const matchesSearch = r.clientId.toLowerCase().includes(searchQuery.toLowerCase()) || r.periodo.includes(searchQuery)
    const reportStatus = (r.estadoPago || 'pendiente').toLowerCase()
    const matchesStatus = statusFilter === 'todos' || reportStatus === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  // Métricas
  const totalComision = reports.reduce((sum, r) => sum + (r.comisionValor || 0), 0)
  const totalCobrado = reports.reduce((sum, r) => (r.estadoPago || 'pendiente').toLowerCase() === 'pagado' ? sum + (r.comisionValor || 0) : sum, 0)
  const totalPendiente = totalComision - totalCobrado
  const clientesActivos = new Set(reports.map(r => r.clientId)).size

  // Clientes ordenados por mayor comisión acumulada para el gráfico
  const clientAggregated = reports.reduce((acc, r) => {
    if (!acc[r.clientId]) {
      acc[r.clientId] = {
        name: r.clientId,
        totalSales: 0,
        totalCommission: 0,
        reportCount: 0,
        pendingCount: 0
      }
    }
    acc[r.clientId].totalSales += (r.totalVentas || 0)
    acc[r.clientId].totalCommission += (r.comisionValor || 0)
    acc[r.clientId].reportCount += 1
    const reportStatus = (r.estadoPago || 'pendiente').toLowerCase()
    if (reportStatus === 'pendiente') {
      acc[r.clientId].pendingCount += 1
    }
    return acc
  }, {})

  const chartData = Object.values(clientAggregated)
    .sort((a, b) => b.totalCommission - a.totalCommission)
    .slice(0, 5) // Top 5 clientes

  const maxChartValue = chartData.length > 0 ? Math.max(...chartData.map(c => c.totalCommission)) : 1

  // RENDER PANTALLA LOGIN
  if (!user) {
    return (
      <div className="min-h-screen relative flex items-center justify-center bg-[#070b13] px-4 font-sans overflow-hidden">
        {/* Background Gradients and blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_center,rgba(99,102,241,0.02),transparent)]" />

        <form 
          onSubmit={handleLogin}
          className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 space-y-6"
        >
          <div className="text-center relative">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(99,102,241,0.3)]">
              <Lock size={30} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">Consola Central SaaS</h2>
            <p className="text-xs text-slate-400 mt-1">Ingreso exclusivo para desarrolladores y administradores core.</p>
          </div>

          {authError && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2.5 animate-pulse">
              <AlertTriangle size={15} className="shrink-0 text-red-400" />
              <p>{authError}</p>
            </div>
          )}

          {isSimulated && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-xl flex items-center gap-2.5">
              <ShieldAlert size={15} className="shrink-0 text-amber-500" />
              <p>Modo Sandbox local activo. Ingresa cualquier credencial para probar la UI.</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Correo Electrónico</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  placeholder="dev@plataforma.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-11 pr-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 transition-all placeholder:text-slate-600"
                />
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Contraseña</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-11 rounded-xl bg-slate-950/80 border border-slate-800/80 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 transition-all placeholder:text-slate-600"
                />
                <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(99,102,241,0.2)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.35)] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            {authLoading ? (
              <>
                <RefreshCw className="animate-spin text-white" size={16} />
                Autenticando Acceso...
              </>
            ) : (
              "Ingresar a la Consola"
            )}
          </button>
        </form>
      </div>
    )
  }

  // RENDER PANEL PRINCIPAL
  if (isOnboardingActive) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-sans pb-12 overflow-x-hidden transition-colors duration-300">
        {/* Background decorativos */}
        <div className="absolute top-0 right-0 w-[50%] h-[400px] rounded-full bg-gradient-to-b from-indigo-500/5 to-purple-500/0 blur-[150px] pointer-events-none opacity-50 dark:opacity-100" />
        
        {/* Barra de Navegación Premium */}
        <nav className="h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsOnboardingActive(false)}
              className="h-9 px-3 rounded-xl bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-xs font-bold border border-[var(--color-border)] transition-colors flex items-center gap-1.5 cursor-pointer text-[var(--color-text)]"
            >
              <ArrowLeft size={14} />
              Volver al Dashboard
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">Aprovisionamiento y Onboarding</span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">SaaS Engine</span>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* WIZARD PANEL (Left) */}
            <div className="lg:col-span-7 bg-[var(--color-surface)] p-6 rounded-3xl shadow-sm border border-[var(--color-border)] flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                <div>
                  <h2 className="text-lg font-black text-[var(--color-text)] flex items-center gap-2">
                    <Sparkles size={18} className="text-indigo-400" />
                    Asistente de Aprovisionamiento
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted)]">Configura e inicializa una nueva instancia de ventas.</p>
                </div>
              </div>

              {/* Wizard Tabs */}
              <div className="flex bg-[var(--color-bg)] border border-[var(--color-border)] p-1 rounded-xl shadow-sm">
                {[
                  { id: 'server', label: 'Servidor', icon: Server },
                  { id: 'branding', label: 'Branding', icon: Palette },
                  { id: 'modules', label: 'Módulos', icon: Settings }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setWizardTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      wizardTab === tab.id 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="space-y-4 min-h-[350px]">
                {wizardTab === 'server' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Nombre del Cliente</label>
                        <input 
                          type="text" 
                          placeholder="Nombre del Cliente (Ej: Ventas SmartFix)"
                          value={newClientName}
                          onChange={(e) => handleClientNameChange(e.target.value)}
                          className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Client ID (Auto-generado)</label>
                        <input 
                          type="text" 
                          disabled
                          value={newClientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
                          placeholder="ventas-smartfix"
                          className="bg-[var(--color-bg)] opacity-60 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none cursor-not-allowed font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Modelo de Facturación</label>
                        <CustomSelect 
                          value={billingMode}
                          onChange={(e) => setBillingMode(e.target.value)}
                          options={[
                            { id: 'percentage', name: 'Porcentaje de Venta' },
                            { id: 'fixed_per_service', name: 'Monto Fijo por Servicio' },
                            { id: 'flat_monthly', name: 'Pago Mensual Fijo' }
                          ]}
                        />
                      </div>

                      {billingMode === 'percentage' && (
                        <div className="space-y-1 animate-fade-in">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Tasa de Comisión (%)</label>
                          <input 
                            type="number" 
                            step="0.1"
                            value={comisionPorcentaje}
                            onChange={(e) => setComisionPorcentaje(parseFloat(e.target.value) || 0)}
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                      )}

                      {billingMode === 'fixed_per_service' && (
                        <div className="space-y-1 animate-fade-in">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Monto Fijo por Servicio ($)</label>
                          <input 
                            type="number" 
                            value={montoFijoServicio}
                            onChange={(e) => setMontoFijoServicio(parseFloat(e.target.value) || 0)}
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                      )}

                      {billingMode === 'flat_monthly' && (
                        <div className="space-y-1 animate-fade-in">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Pago Mensual Fijo ($)</label>
                          <input 
                            type="number" 
                            value={pagoMensualFijo}
                            onChange={(e) => setPagoMensualFijo(parseFloat(e.target.value) || 0)}
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Telemetry Token (Auto-generado)</label>
                        <input 
                          type="text" 
                          disabled
                          value={newClientName.trim() ? `${newClientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-token-${Date.now()}` : ''}
                          placeholder="token-telemetria"
                          className="bg-[var(--color-bg)] opacity-60 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none cursor-not-allowed font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Ruta Física en Disco</label>
                        <input 
                          type="text" 
                          value={targetPath}
                          onChange={(e) => setTargetPath(e.target.value)}
                          placeholder="D:\Aplicaciones\App-ventas-smartfix"
                          className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Plantilla Base</label>
                        <CustomSelect 
                          value={selectedTemplate}
                          onChange={(e) => setSelectedTemplate(e.target.value)}
                          options={templates}
                        />
                      </div>
                    </div>

                    <div className="border-t border-[var(--color-border)] pt-4 mt-2">
                      <div className="space-y-1.5 mb-4">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Firebase Project ID</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={fbProjectId}
                            onChange={(e) => setFbProjectId(e.target.value)}
                            placeholder="proyecto-cliente"
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs flex-1 text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleAutoDetectConfig}
                            disabled={isFetchingConfig}
                            className="px-3 py-2 bg-indigo-650/30 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/25 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                          >
                            {isFetchingConfig ? 'Detectando...' : 'Auto-detectar'}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Firebase API Key</label>
                          <input 
                            type="text" 
                            value={fbApiKey}
                            onChange={(e) => setFbApiKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Firebase Auth Domain</label>
                          <input 
                            type="text" 
                            value={fbAuthDomain}
                            onChange={(e) => setFbAuthDomain(e.target.value)}
                            placeholder="proyecto.firebaseapp.com"
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Firebase Storage Bucket</label>
                          <input 
                            type="text" 
                            value={fbStorageBucket}
                            onChange={(e) => setFbStorageBucket(e.target.value)}
                            placeholder="proyecto.appspot.com"
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Firebase Messaging Sender ID</label>
                          <input 
                            type="text" 
                            value={fbMessagingSenderId}
                            onChange={(e) => setFbMessagingSenderId(e.target.value)}
                            placeholder="856294715..."
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Firebase App ID</label>
                          <input 
                            type="text" 
                            value={fbAppId}
                            onChange={(e) => setFbAppId(e.target.value)}
                            placeholder="1:856294715:web:a1b2c3d4..."
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 mt-3">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">VAPID Key de Web Push (Manual)</label>
                        <input 
                          type="text" 
                          value={fbVapidKey}
                          onChange={(e) => setFbVapidKey(e.target.value)}
                          placeholder="BDd3L1s..."
                          className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {wizardTab === 'branding' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Paletas de Colores Preestablecidas */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Paletas de Colores de Marca Recomendadas</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { name: 'Royal Indigo', primary: '#6366f1', secondary: '#a855f7', bg: '#070b13', text: '#f8fafc' },
                          { name: 'Esmeralda Tech', primary: '#10b981', secondary: '#06b6d4', bg: '#06130e', text: '#ecfdf5' },
                          { name: 'Cyberpunk Neon', primary: '#ff007f', secondary: '#00f0ff', bg: '#0c0714', text: '#fdf6ff' },
                          { name: 'Sunset Glow', primary: '#f97316', secondary: '#ef4444', bg: '#140c0b', text: '#fffcfb' },
                          { name: 'Crimson Rose', primary: '#e11d48', secondary: '#be123c', bg: '#18080f', text: '#fff1f2' },
                          { name: 'Amber Warm', primary: '#f59e0b', secondary: '#d97706', bg: '#15120c', text: '#fffdfa' },
                          { name: 'Ocean Wave', primary: '#0ea5e9', secondary: '#3b82f6', bg: '#080f1e', text: '#f0f7ff' },
                          { name: 'Slate Clean', primary: '#475569', secondary: '#94a3b8', bg: '#0f172a', text: '#f8fafc' }
                        ].map((preset, pIdx) => {
                          const isSelected = primaryColor === preset.primary && secondaryColor === preset.secondary && bgColor === preset.bg && textColor === preset.text;
                          return (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => {
                                setPrimaryColor(preset.primary);
                                setSecondaryColor(preset.secondary);
                                setBgColor(preset.bg);
                                setTextColor(preset.text);
                                showToast(`Aplicada paleta: ${preset.name}`, { type: 'success' });
                              }}
                              className={`p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                                isSelected 
                                  ? 'bg-indigo-650/15 border-indigo-500 shadow-md scale-[1.02]' 
                                  : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/60'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.primary }} />
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.secondary }} />
                                <div className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ backgroundColor: preset.bg }} />
                                <div className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: preset.text }} />
                              </div>
                              <span className="text-[10px] font-bold block text-[var(--color-text)] truncate">{preset.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="h-px bg-[var(--color-border)] my-2" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Color Primario */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Color Primario</label>
                        <div className="flex gap-2">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[var(--color-border)] shrink-0 shadow-sm" style={{ backgroundColor: primaryColor }}>
                            <input 
                              type="color" 
                              value={primaryColor} 
                              onChange={(e) => setPrimaryColor(e.target.value)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                          <input 
                            type="text" 
                            value={primaryColor} 
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs flex-1 text-[var(--color-text)] font-mono outline-none focus:border-indigo-500"
                          />
                        </div>
                        {/* Círculos de Selección Rápida */}
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {['#6366f1', '#3b82f6', '#0ea5e9', '#10b981', '#f59e0b', '#f97316', '#ef4444', '#ec4899', '#a855f7'].map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setPrimaryColor(c)}
                              className="w-4 h-4 rounded-full border border-white/10 shadow-sm hover:scale-125 transition-transform cursor-pointer"
                              style={{ backgroundColor: c }}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Color Secundario */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Color Secundario</label>
                        <div className="flex gap-2">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[var(--color-border)] shrink-0 shadow-sm" style={{ backgroundColor: secondaryColor }}>
                            <input 
                              type="color" 
                              value={secondaryColor} 
                              onChange={(e) => setSecondaryColor(e.target.value)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                          <input 
                            type="text" 
                            value={secondaryColor} 
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs flex-1 text-[var(--color-text)] font-mono outline-none focus:border-indigo-500"
                          />
                        </div>
                        {/* Círculos de Selección Rápida */}
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {['#a855f7', '#d97706', '#ec4899', '#be123c', '#06b6d4', '#4f46e5', '#3b82f6', '#10b981', '#64748b'].map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setSecondaryColor(c)}
                              className="w-4 h-4 rounded-full border border-white/10 shadow-sm hover:scale-125 transition-transform cursor-pointer"
                              style={{ backgroundColor: c }}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Color de Fondo */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Color de Fondo</label>
                        <div className="flex gap-2">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[var(--color-border)] shrink-0 shadow-sm" style={{ backgroundColor: bgColor }}>
                            <input 
                              type="color" 
                              value={bgColor} 
                              onChange={(e) => setBgColor(e.target.value)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                          <input 
                            type="text" 
                            value={bgColor} 
                            onChange={(e) => setBgColor(e.target.value)}
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs flex-1 text-[var(--color-text)] font-mono outline-none focus:border-indigo-500"
                          />
                        </div>
                        {/* Círculos de Selección Rápida */}
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {['#070b13', '#0f172a', '#1e293b', '#06130e', '#0c0714', '#140c0b', '#18080f', '#080f1e', '#f8fafc'].map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setBgColor(c)}
                              className="w-4 h-4 rounded-full border border-white/10 shadow-sm hover:scale-125 transition-transform cursor-pointer"
                              style={{ backgroundColor: c }}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Color de Texto */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Color de Texto</label>
                        <div className="flex gap-2">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[var(--color-border)] shrink-0 shadow-sm" style={{ backgroundColor: textColor }}>
                            <input 
                              type="color" 
                              value={textColor} 
                              onChange={(e) => setTextColor(e.target.value)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                          <input 
                            type="text" 
                            value={textColor} 
                            onChange={(e) => setTextColor(e.target.value)}
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs flex-1 text-[var(--color-text)] font-mono outline-none focus:border-indigo-500"
                          />
                        </div>
                        {/* Círculos de Selección Rápida */}
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {['#f8fafc', '#ffffff', '#e2e8f0', '#ecfdf5', '#fdf6ff', '#fffcfb', '#fff1f2', '#f0f7ff', '#0f172a'].map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setTextColor(c)}
                              className="w-4 h-4 rounded-full border border-white/10 shadow-sm hover:scale-125 transition-transform cursor-pointer"
                              style={{ backgroundColor: c }}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Selector de Fuentes con Modal y Previsualizaciones */}
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Google Font Seleccionada</label>
                        <div className="flex gap-2">
                          <div className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs flex-1 text-[var(--color-text)] font-semibold flex items-center justify-between">
                            <span>{googleFont}</span>
                            <span className="text-[11px] opacity-75 font-bold tracking-wide" style={{ fontFamily: `'${googleFont}', sans-serif` }}>Abc - Vista Previa</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFontSearchQuery('');
                              setIsFontModalOpen(true);
                            }}
                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                          >
                            Seleccionar fuente
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {wizardTab === 'modules' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl space-y-4">
                      <h4 className="text-xs font-bold text-[var(--color-text)]">Funcionalidades Core y Flags</h4>
                      
                      <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] select-none">
                          <input 
                            type="checkbox" 
                            checked={enableGithub} 
                            onChange={(e) => setEnableGithub(e.target.checked)}
                            className="w-4 h-4 rounded accent-indigo-600 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                          />
                          Inicializar repositorio en GitHub
                        </label>
                        
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] select-none">
                          <input 
                            type="checkbox" 
                            checked={enableFirebaseDeploy} 
                            onChange={(e) => setEnableFirebaseDeploy(e.target.checked)}
                            className="w-4 h-4 rounded accent-indigo-600 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                          />
                          Desplegar reglas e índices en Firebase
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] select-none">
                          <input 
                            type="checkbox" 
                            checked={enablePwa} 
                            onChange={(e) => setEnablePwa(e.target.checked)}
                            className="w-4 h-4 rounded accent-indigo-600 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                          />
                          Activar PWA (Progressive Web App)
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] select-none">
                          <input 
                            type="checkbox" 
                            checked={enablePush} 
                            onChange={(e) => setEnablePush(e.target.checked)}
                            className="w-4 h-4 rounded accent-indigo-600 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                          />
                          Servicio de Notificaciones Push
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] select-none">
                          <input 
                            type="checkbox" 
                            checked={enableBilling} 
                            onChange={(e) => setEnableBilling(e.target.checked)}
                            className="w-4 h-4 rounded accent-indigo-600 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                          />
                          Módulo de Facturación Electrónica
                        </label>

                        <div className="pl-6 border-l border-indigo-500/20 space-y-3 mt-1">
                          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] select-none">
                            <input 
                              type="checkbox" 
                              checked={enableDianBilling} 
                              onChange={(e) => setEnableDianBilling(e.target.checked)}
                              className="w-4 h-4 rounded accent-indigo-600 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                            />
                            Facturación Electrónica DIAN Directa
                          </label>

                          {enableDianBilling && (
                            <div className="space-y-1.5 animate-fade-in">
                              <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Costo Adicional por Documento DIAN ($ COP)</label>
                              <input 
                                type="number" 
                                value={costoPorFacturaDian}
                                onChange={(e) => setCostoPorFacturaDian(parseFloat(e.target.value) || 0)}
                                className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-xs w-full max-w-[200px] text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                                min="0"
                                placeholder="150"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-[var(--color-border)] pt-3.5 space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Requerimientos Especiales del Cliente (Briefing/Notas)</label>
                        <textarea 
                          value={customRequirements}
                          onChange={(e) => setCustomRequirements(e.target.value)}
                          placeholder="Especificaciones o notas custom de negocio... (ej: El cliente requiere que la facturación valide cédula de extranjería...)"
                          rows={3}
                          className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-sans resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation & Submit inside Wizard */}
              <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={wizardTab === 'server'}
                    onClick={() => setWizardTab(wizardTab === 'modules' ? 'branding' : (wizardTab === 'branding' ? 'server' : 'server'))}
                    className="px-3.5 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] disabled:opacity-30 disabled:cursor-not-allowed text-[var(--color-text)] rounded-xl text-xs font-bold transition-colors cursor-pointer border border-[var(--color-border)]"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    disabled={wizardTab === 'modules'}
                    onClick={() => setWizardTab(wizardTab === 'server' ? 'branding' : 'modules')}
                    className="px-3.5 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] disabled:opacity-30 disabled:cursor-not-allowed text-[var(--color-text)] rounded-xl text-xs font-bold transition-colors cursor-pointer border border-[var(--color-border)]"
                  >
                    Siguiente
                  </button>
                </div>

                <button 
                  disabled={isRegistering || isProvisioning || !newClientName.trim()}
                  onClick={async () => {
                    if (!newClientName.trim()) return
                    
                    setIsRegistering(true)
                    setIsProvisioning(true)
                    const clientId = newClientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                    const telemetryToken = `${clientId}-token-${Date.now()}`

                    addLog(`Registrando nuevo cliente SaaS: ${clientId} (${billingMode})`, "info")

                    const cliPayload = {
                      template: selectedTemplate,
                      projectName: newClientName.trim(),
                      targetPath,
                      telemetryToken,
                      paletteChoice: 'custom',
                      customPrimary: primaryColor,
                      customAccent: secondaryColor,
                      enableGithub,
                      enableFirebaseDeploy,
                      firebaseApiKey: fbApiKey,
                      firebaseAuthDomain: fbAuthDomain,
                      firebaseProjectId: fbProjectId,
                      firebaseStorageBucket: fbStorageBucket,
                      firebaseMessagingSenderId: fbMessagingSenderId,
                      firebaseAppId: fbAppId,
                      centralApiKey: CENTRAL_CONFIG.apiKey,
                      centralMessagingSenderId: CENTRAL_CONFIG.messagingSenderId,
                      centralAppId: CENTRAL_CONFIG.appId,
                      customRequirements: customRequirements.trim(),
                      billingMode,
                      comisionPorcentaje,
                      montoFijoServicio,
                      pagoMensualFijo,
                      enableDianBilling,
                      costoPorFacturaDian,
                      branding: {
                        primaryColor,
                        secondaryColor,
                        bgColor,
                        textColor,
                        googleFont
                      },
                      flags: {
                        enableGithub,
                        enableFirebaseDeploy,
                        enablePwa,
                        enablePush,
                        enableBilling,
                        enableDianBilling
                      }
                    }

                    if (isSimulated) {
                      const testPeriod = new Date().toISOString().substring(0, 7)
                      const reportId = `${clientId}_${testPeriod}`
                      const sales = Math.floor(Math.random() * 8000000) + 2000000
                      
                      let comValue = 0
                      if (billingMode === 'percentage') {
                        comValue = (sales * comisionPorcentaje) / 100
                      } else if (billingMode === 'fixed_per_service') {
                        comValue = montoFijoServicio * 12
                      } else if (billingMode === 'flat_monthly') {
                        comValue = pagoMensualFijo
                      }
                      
                      const newRep = {
                        id: reportId,
                        clientId: clientId,
                        periodo: testPeriod,
                        totalVentas: sales,
                        comisionPorcentaje: billingMode === 'percentage' ? comisionPorcentaje : 0,
                        comisionValor: comValue,
                        estadoPago: 'pendiente',
                        updatedAt: { toDate: () => new Date() }
                      }

                      setClientesSaas(prev => [...prev, { id: clientId, billingMode, comisionPorcentaje, montoFijoServicio, pagoMensualFijo, enableDianBilling, costoPorFacturaDian }])
                      setReports(prev => [newRep, ...prev])
                      setTelemetryTokens(prev => [...prev, { id: telemetryToken, clientId }])

                      addLog(`[Sandbox] Cliente ${clientId} registrado y token configurado localmente.`, "success")
                      showToast(`Cliente ${newClientName} registrado (Sandbox)`, { type: 'success' })
                      
                      setOnboardingData({
                        clientId,
                        token: telemetryToken,
                        comisionPorcentaje,
                        vapidKey: fbVapidKey,
                        prompt: `# Antigravity Bootstrap Prompt for ${clientId}\n\nThis is a simulated prompt for testing purposes.`
                      })
                      setIsOnboardingActive(false)
                      setNewClientName('')
                      setFbApiKey('')
                      setFbAuthDomain('')
                      setFbProjectId('')
                      setFbStorageBucket('')
                      setFbMessagingSenderId('')
                      setFbAppId('')
                      setFbVapidKey('')
                      setIsRegistering(false)
                      setIsProvisioning(false)
                      return
                    }

                    const centralApp = getCentralApp()
                    if (!centralApp) {
                      setIsRegistering(false)
                      setIsProvisioning(false)
                      return
                    }
                    const dbInstance = getFirestore(centralApp)

                    try {
                      const clientRef = doc(dbInstance, 'clientes_saas', clientId)
                      await setDoc(clientRef, {
                        nombre: newClientName.trim(),
                        billingMode,
                        comisionPorcentaje,
                        montoFijoServicio,
                        pagoMensualFijo,
                        enableDianBilling,
                        costoPorFacturaDian,
                        creadoEn: serverTimestamp(),
                        targetPath,
                        template: selectedTemplate,
                        customRequirements: customRequirements.trim(),
                        firebaseConfig: {
                          apiKey: fbApiKey,
                          authDomain: fbAuthDomain,
                          projectId: fbProjectId,
                          storageBucket: fbStorageBucket,
                          messagingSenderId: fbMessagingSenderId,
                          appId: fbAppId,
                          vapidKey: fbVapidKey
                        },
                        branding: {
                          primaryColor,
                          secondaryColor,
                          bgColor,
                          textColor,
                          googleFont
                        },
                        flags: {
                          enableGithub,
                          enableFirebaseDeploy,
                          enablePwa,
                          enablePush,
                          enableBilling,
                          enableDianBilling
                        }
                      })

                      const tokenRef = doc(dbInstance, 'tokens', telemetryToken)
                      await setDoc(tokenRef, {
                        active: true,
                        clientId,
                        creadoEn: serverTimestamp()
                      })

                      addLog(`[Firestore] Aprovisionamiento exitoso para el cliente ${clientId} en la nube central.`, "success")
                      
                      let promptResult = ''

                      try {
                        const cliRes = await fetch('http://localhost:3001/api/create-project', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(cliPayload)
                        })

                        if (cliRes.ok) {
                          const resData = await cliRes.json()
                          promptResult = resData.prompt || (resData.data && resData.data.prompt) || ''
                          addLog(`[CLI API] Aprovisionamiento físico del proyecto en disco completado correctamente.`, "success")
                          showToast(`Cliente ${newClientName} registrado y proyecto creado en disco`, { type: 'success' })
                        } else {
                          const errText = await cliRes.text()
                          addLog(`[CLI API Warning] CLI respondió con error: ${errText}. Datos guardados en Firestore — puedes reintentar.`, "warning")
                          setPendingCliProvisioning({
                            clientId, nombre: newClientName.trim(), comisionPorcentaje, telemetryToken,
                            payload: cliPayload
                          })
                          showToast(`El cliente se guardó en Firestore. Presiona "Reintentar" cuando el CLI esté disponible.`, { type: 'error' })
                        }
                      } catch (cliErr) {
                        console.error("Error en API de aprovisionamiento:", cliErr)
                        addLog(`[CLI API Warning] Daemon CLI offline. Datos en Firestore seguros — usa el botón Reintentar cuando el CLI esté disponible.`, "warning")
                        setPendingCliProvisioning({
                          clientId, nombre: newClientName.trim(), comisionPorcentaje, telemetryToken,
                          payload: cliPayload
                        })
                        showToast('Daemon CLI offline. Firestore OK. Presiona "Reintentar" cuando el servidor esté disponible.', { type: 'error' })
                      }

                      setOnboardingData({
                        clientId,
                        token: telemetryToken,
                        comisionPorcentaje,
                        vapidKey: fbVapidKey,
                        prompt: promptResult
                      })
                      setIsOnboardingActive(false)
                      setNewClientName('')
                      setFbApiKey('')
                      setFbAuthDomain('')
                      setFbProjectId('')
                      setFbStorageBucket('')
                      setFbMessagingSenderId('')
                      setFbAppId('')
                      setFbVapidKey('')
                      setCustomRequirements('')
                    } catch (err) {
                      console.error(err)
                      addLog(`Error registrando cliente: ${err.message}`, "error")
                      showToast(`Error al registrar cliente: ${err.message}`, { type: 'error' })
                    } finally {
                      setIsRegistering(false)
                      setIsProvisioning(false)
                    }
                  }}
                  className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center gap-1.5 ${(isRegistering || isProvisioning || !newClientName.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {(isRegistering || isProvisioning) ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      Procesando Aprovisionamiento...
                    </>
                  ) : (
                    "Registrar y Generar Onboarding"
                  )}
                </button>
              </div>
            </div>

            {/* MOCKUP PREVIEW PANEL (Right) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[var(--color-surface)]/50 p-6 rounded-3xl border border-[var(--color-border)] shadow-sm sticky top-24">
              <div className="text-center mb-4">
                <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider flex items-center justify-center gap-1">
                  <Smartphone size={10} />
                  Vista Previa Interactiva
                </span>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">El mockup refleja branding y tipografías en tiempo real.</p>
              </div>

              {/* Smartphone mockup */}
              <div 
                className="w-[280px] h-[550px] rounded-[36px] p-2.5 relative shadow-2xl transition-all duration-555 ease-in-out border border-slate-700/50"
                style={{ 
                  backgroundColor: bgColor, 
                  color: textColor,
                  fontFamily: `'${googleFont}', sans-serif`,
                  boxShadow: `0 25px 50px -12px ${primaryColor}20, 0 0 2px 2px ${primaryColor}40`
                }}
              >
                {/* Glass reflection effect overlay */}
                <div className="absolute inset-0 rounded-[36px] bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none z-20" />

                {/* Inner Screen Container */}
                <div className="h-full w-full flex flex-col justify-between relative overflow-hidden rounded-[28px] p-3 pt-6">
                  
                  {/* Dynamic Island / Camera Notch */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-45 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-slate-800 rounded-full ml-auto mr-2" />
                  </div>

                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-[8px] opacity-80 mb-2 font-mono">
                    <span>16:49</span>
                    <div className="flex items-center gap-1">
                      <span>5G</span>
                      <div className="w-4 h-2 border border-current rounded-sm p-0.5 flex items-center">
                        <div className="h-full w-2.5 bg-current rounded-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Mock App Header */}
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1.5">
                      <div 
                        className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {newClientName ? newClientName.substring(0, 1).toUpperCase() : 'V'}
                      </div>
                      <span className="text-[10px] font-bold truncate max-w-[120px]">
                        {newClientName.trim() || 'App de Ventas'}
                      </span>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center cursor-pointer">
                      <span className="text-[8px]">🔔</span>
                    </div>
                  </div>

                  {/* Mock Contents */}
                  <div className="flex-1 my-3 overflow-y-auto space-y-3.5 scrollbar-none pr-0.5">
                    {/* Hero Commission Dashboard inside app */}
                    <div 
                      className="p-3 rounded-2xl relative overflow-hidden transition-all duration-300 shadow-md border"
                      style={{ 
                        backgroundColor: `${secondaryColor}12`,
                        borderColor: `${primaryColor}25`
                      }}
                    >
                      <span className="text-[8px] opacity-75 uppercase font-bold tracking-wider block">Balance de Hoy</span>
                      <span className="text-lg font-black block mt-0.5 tracking-tight">$2,450,000</span>
                      <p className="text-[7px] opacity-80 mt-1">12 ventas procesadas exitosamente</p>
                      
                      {/* Decorative gradient spot inside card */}
                      <div 
                        className="absolute right-[-10%] bottom-[-10%] w-12 h-12 rounded-full blur-xl pointer-events-none opacity-40"
                        style={{ backgroundColor: secondaryColor }}
                      />
                    </div>

                    {/* Quick Action Button inside mockup */}
                    <button 
                      type="button"
                      className="w-full py-2 rounded-xl text-[9px] font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <span>⚡ Registrar Nueva Venta</span>
                    </button>

                    {/* Simulating Recent List */}
                    <div className="space-y-1.5">
                      <span className="text-[8px] opacity-70 uppercase font-bold tracking-wider block">Historial de Ventas</span>
                      {[
                        { title: 'iPhone 15 Pro Max', time: 'Hace 5 min', val: '$4,800,000' },
                        { title: 'Servicio Técnico Calzado', time: 'Hace 2 horas', val: '$150,000' },
                        { title: 'Licencia Premium SaaS', time: 'Ayer', val: '$350,000' }
                      ].map((item, i) => (
                        <div 
                          key={i} 
                          className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-[8px] hover:bg-white/10 transition-colors"
                        >
                          <div>
                            <p className="font-bold">{item.title}</p>
                            <p className="opacity-60 text-[7px]">{item.time}</p>
                          </div>
                          <span className="font-mono font-bold" style={{ color: primaryColor }}>{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Bar inside phone */}
                  <div className="border-t border-white/10 pt-2 flex justify-around text-[8px] opacity-80">
                    <div className="flex flex-col items-center gap-0.5" style={{ color: primaryColor }}>
                      <span>🏠</span>
                      <span className="font-bold">Inicio</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 opacity-60">
                      <span>📊</span>
                      <span>Ventas</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 opacity-60">
                      <span>⚙️</span>
                      <span>Ajustes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal de Selección de Fuentes (Google Fonts) */}
        {isFontModalOpen && (
          <div className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm animate-fade-in p-4">
            <div className="absolute inset-0" onClick={() => setIsFontModalOpen(false)} />
            
            <div className="relative w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl animate-scale-up max-h-[80vh] flex flex-col overflow-hidden transition-colors duration-300">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Palette size={16} />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm text-[var(--color-text)]">Seleccionar Tipografía</h3>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Explora la vista previa de cada fuente antes de aplicarla.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsFontModalOpen(false)}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] w-8 h-8 rounded-lg flex items-center justify-center font-bold border border-[var(--color-border)] cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Buscador de Fuentes */}
              <div className="mb-4 shrink-0">
                <div className="flex items-center gap-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] px-3.5 py-2 rounded-xl shadow-sm focus-within:border-indigo-500/50 transition-colors duration-300">
                  <Search size={14} className="text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Buscar tipografía..."
                    value={fontSearchQuery}
                    onChange={(e) => setFontSearchQuery(e.target.value)}
                    className="bg-transparent border-0 outline-none text-xs w-full text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:ring-0"
                  />
                </div>
              </div>

              {/* Listado de Fuentes con Vista Previa */}
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[250px]">
                {[
                  { value: 'Inter', desc: 'Sans-serif funcional y altamente legible a cualquier tamaño.' },
                  { value: 'Poppins', desc: 'Redondeada premium, excelente para interfaces amigables.' },
                  { value: 'Roboto', desc: 'Clásica, limpia, geométrica y balanceada.' },
                  { value: 'Montserrat', desc: 'Geométrica moderna, ideal para títulos impactantes.' },
                  { value: 'Outfit', desc: 'Moderna, estilizada y con personalidad geométrica.' },
                  { value: 'Plus Jakarta Sans', desc: 'Limpia, elegante y de estilo corporativo moderno.' },
                  { value: 'Sora', desc: 'Estilo tech muy marcado, ideal para productos de desarrollo.' },
                  { value: 'Manrope', desc: 'Grotesque contemporánea y de proporciones balanceadas.' },
                  { value: 'Space Grotesk', desc: 'Brutalista y futurista, con caracteres de gran impacto.' },
                  { value: 'Playfair Display', desc: 'Serif sumamente elegante, con alto contraste y clase.' },
                  { value: 'Lora', desc: 'Serif literaria y premium, con terminaciones suaves.' },
                  { value: 'Fira Sans', desc: 'Legible, humana y diseñada para pantallas de alta densidad.' },
                  { value: 'Cabin', desc: 'Neo-grotesque amigable con sutiles curvas humanistas.' },
                  { value: 'Nunito', desc: 'Suave, con esquinas redondeadas y tono cercano.' },
                  { value: 'Syne', desc: 'Artística, expresiva y diseñada para marcas de moda o creativas.' },
                  { value: 'DM Sans', desc: 'Limpia, neutra y corporativa de baja distracción.' },
                  { value: 'Quicksand', desc: 'Totalmente geométrica y redondeada con curvas amigables.' }
                ]
                .filter(f => f.value.toLowerCase().includes(fontSearchQuery.toLowerCase()))
                .map(font => {
                  const isSelected = googleFont === font.value;
                  return (
                    <button
                      key={font.value}
                      type="button"
                      onClick={() => {
                        setGoogleFont(font.value);
                        setIsFontModalOpen(false);
                        showToast(`Fuente cambiada a: ${font.value}`, { type: 'success' });
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col gap-2 hover:scale-[1.01] ${
                        isSelected 
                          ? 'bg-indigo-650/15 border-indigo-500 shadow-md ring-1 ring-indigo-500' 
                          : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/60'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-xs font-black text-[var(--color-text)]">{font.value}</span>
                        {isSelected && <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">Activa</span>}
                      </div>
                      
                      {/* Vista Previa de la Fuente */}
                      <div className="p-2.5 bg-[var(--color-bg)]/80 rounded-xl border border-[var(--color-border)] w-full text-center transition-colors">
                        <p 
                          className="text-sm font-semibold truncate text-[var(--color-text)]" 
                          style={{ fontFamily: `'${font.value}', sans-serif` }}
                        >
                          {font.value} Specimen
                        </p>
                        <p 
                          className="text-[9px] text-[var(--color-text-muted)] mt-1 truncate" 
                          style={{ fontFamily: `'${font.value}', sans-serif` }}
                        >
                          El veloz murciélago comía feliz cardo.
                        </p>
                      </div>
                      
                      <p className="text-[9px] text-[var(--color-text-muted)] leading-normal mt-0.5">{font.desc}</p>
                    </button>
                  );
                })}
              </div>
              
              {/* Footer */}
              <div className="pt-4 border-t border-[var(--color-border)] flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFontModalOpen(false)}
                  className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text)] rounded-xl text-xs font-bold border border-[var(--color-border)] cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // RENDER PANEL PRINCIPAL
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-sans pb-12 overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-300">
      {/* Background decorativos */}
      <div className="absolute top-0 right-0 w-[50%] h-[400px] rounded-full bg-gradient-to-b from-indigo-500/5 to-purple-500/0 blur-[150px] pointer-events-none opacity-50 dark:opacity-100" />
      <div className="absolute top-[20%] left-[-10%] w-[40%] h-[400px] rounded-full bg-indigo-500/2 blur-[150px] pointer-events-none opacity-50 dark:opacity-100" />

      {/* Barra de Navegación Premium */}
      <nav className="h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            <Layers size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">Consola SaaS Central</span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">SaaS Developer Cockpit</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Status Badge */}
          <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold ${
            dbStatus === 'conectado' && !isSimulated
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                dbStatus === 'conectado' && !isSimulated ? 'bg-emerald-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                dbStatus === 'conectado' && !isSimulated ? 'bg-emerald-500' : 'bg-amber-500'
              }`}></span>
            </span>
            {dbStatus === 'conectado' && !isSimulated ? 'Firestore Real-time' : 'Modo Sandbox Activo'}
          </div>

          <div className="h-6 w-px bg-slate-800" />

          <div className="flex items-center gap-3">
            <DarkModeToggle isDark={theme === 'dark'} onToggle={toggleTheme} />
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold text-[var(--color-text)]">{user.email}</span>
              <span className="text-[9px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">Root Dev</span>
            </div>
            <button 
              onClick={handleLogout}
              className="h-9 px-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95 shadow-md"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Cabecera y Herramientas */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-3xl shadow-sm transition-colors duration-300">
          <div>
            <h1 className="text-2xl font-black text-[var(--color-text)] flex items-center gap-2.5">
              Panel de Comisiones y Facturación
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Gestión administrativa del Core SaaS. Visualiza ingresos compartidos y estado de transferencias bancarias de tus clientes.</p>
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button 
              onClick={() => setIsOnboardingActive(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.2)] active:scale-[0.98] cursor-pointer"
            >
              <Plus size={14} />
              Nuevo Aprovisionamiento
            </button>
            <button 
              onClick={handleCreateTestReport}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-350 text-xs font-bold flex items-center gap-2 transition-all duration-200 border border-slate-700 active:scale-[0.98] cursor-pointer"
            >
              <Database size={14} />
              Enviar Telemetría de Prueba
            </button>
            <button
              onClick={() => {
                setIsSimulated(prev => !prev)
                addLog(`Modo de ejecución cambiado a: ${!isSimulated ? 'SANDBOX' : 'CONECTADO'}`, "warning")
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 transition-all duration-200 border border-slate-700 active:scale-[0.98] cursor-pointer"
            >
              <Server size={14} />
              Alternar Entorno
            </button>
          </div>
        </div>

        {/* Alerta de Simulación */}
        {isSimulated && (
          <div className="p-4.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3.5 text-xs text-amber-800 dark:text-amber-400/90 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            <AlertTriangle size={20} className="shrink-0 text-amber-600 dark:text-amber-500 animate-pulse mt-0.5" />
            <div className="space-y-1">
              <strong className="text-amber-900 dark:text-amber-300 font-bold block">Consola operando en Entorno Sandbox Local</strong>
              <p>
                Los cambios se realizarán de manera simulada en memoria y no impactarán en el Firestore central. Registra tus variables de entorno <code className="bg-[var(--color-bg)] text-indigo-600 dark:text-indigo-400 px-1 py-0.5 rounded font-mono border border-[var(--color-border)]">VITE_DEVELOPER_CENTRAL_*</code> en tu archivo <code className="bg-[var(--color-bg)] text-indigo-600 dark:text-indigo-400 px-1 py-0.5 rounded font-mono border border-[var(--color-border)]">.env.local</code> para activar la sincronización real de producción.
              </p>
            </div>
          </div>
        )}

        {/* Banner de Reintento CLI Pendiente */}
        {pendingCliProvisioning && (
          <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4 relative overflow-hidden shadow-sm animate-pulse-subtle">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-red-500/10 rounded-xl shrink-0 mt-0.5">
                <AlertTriangle size={16} className="text-red-500" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-extrabold text-red-400 uppercase tracking-wider">Aprovisionamiento físico pendiente</p>
                <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                  El cliente <strong className="text-[var(--color-text)] font-mono">{pendingCliProvisioning.clientId}</strong> fue registrado en Firestore correctamente, pero el daemon CLI (puerto 3001) no respondió. El proyecto aún no existe en disco.
                </p>
                <p className="text-[10px] text-red-400/70 font-mono mt-0.5">Asegúrate de que el CLI Bridge esté corriendo, luego presiona Reintentar.</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleRetryCliProvisioning}
                disabled={isProvisioning}
                className="px-3.5 py-2 bg-red-500 hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-[11px] font-extrabold cursor-pointer flex items-center gap-1.5 transition-all active:scale-95 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
              >
                {isProvisioning ? (
                  <><RefreshCw size={12} className="animate-spin" /> Reintentando...</>
                ) : (
                  <><RefreshCw size={12} /> Reintentar</>
                )}
              </button>
              <button
                onClick={handleDiscardPendingProvisioning}
                className="px-3 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text-muted)] rounded-xl text-[11px] font-bold cursor-pointer border border-[var(--color-border)] transition-colors"
              >
                Descartar
              </button>
            </div>
          </div>
        )}

        {/* Tarjetas de Métricas - Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Comisión Acumulada', val: totalComision, icon: TrendingUp, col: 'from-indigo-500/20 to-indigo-500/5 dark:from-indigo-500/10 dark:to-indigo-500/2', iconCol: 'text-indigo-600 dark:text-indigo-400', type: 'comision' },
            { label: 'Cobrado Exitoso', val: totalCobrado, icon: CheckCircle, col: 'from-emerald-500/20 to-emerald-500/5 dark:from-emerald-500/10 dark:to-emerald-500/2', iconCol: 'text-emerald-600 dark:text-emerald-400', type: 'cobrado' },
            { label: 'Saldo por Recaudar', val: totalPendiente, icon: Clock, col: 'from-amber-500/20 to-amber-500/5 dark:from-amber-500/10 dark:to-amber-500/2', iconCol: 'text-amber-600 dark:text-amber-400', type: 'pendiente' },
            { label: 'Clientes Registrados', val: clientesActivos, icon: Users, col: 'from-purple-500/20 to-purple-500/5 dark:from-purple-500/10 dark:to-purple-500/2', iconCol: 'text-purple-600 dark:text-purple-400', isNumber: true, type: 'clientes' }
          ].map((card, idx) => (
            <div 
              key={idx} 
              onClick={() => setActiveMetricModal(card.type)}
              className={`p-6 bg-gradient-to-br ${card.col} bg-[var(--color-surface)] rounded-3xl flex flex-col gap-2 shadow-sm relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer`}
              title={`Ver detalle de ${card.label}`}
            >
              {/* Glow en hover */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-[var(--color-text-muted)] uppercase tracking-widest leading-tight">{card.label}</span>
                <div className={`p-2 rounded-xl bg-[var(--color-bg)] ${card.iconCol}`}>
                  <card.icon size={16} />
                </div>
              </div>
              <p className="text-3xl font-extrabold mt-3 tracking-tight text-[var(--color-text)]">
                {card.isNumber ? card.val : `$${card.val.toLocaleString('es-CO')}`}
              </p>
            </div>
          ))}
        </div>

        {/* Sección de Gráficos e Historial de Eventos (Fila de 2 Columnas) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Gráfico de Barras Estilizadas de Comisiones */}
          <div className="lg:col-span-2 bg-[var(--color-surface)] p-6 rounded-3xl flex flex-col justify-between shadow-sm relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/3 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1 mb-6">
              <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Métricas de Rendimiento</span>
              <h3 className="font-extrabold text-lg text-[var(--color-text)] flex items-center gap-2">
                <BarChart3 size={18} className="text-indigo-500 dark:text-indigo-400" />
                Reparto de Comisiones por Cliente
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">Top 5 clientes ordenados por aportación de ingresos al desarrollador.</p>
            </div>

            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
                No hay datos suficientes para generar estadísticas.
              </div>
            ) : (
              <div className="space-y-3">
                {chartData.map((client, idx) => {
                  const pctWidth = (client.totalCommission / maxChartValue) * 100
                  const colorSet = [
                    { text: 'text-indigo-650 dark:text-indigo-400', bg: 'bg-indigo-500/10', bar: 'bg-indigo-500' },
                    { text: 'text-purple-650 dark:text-purple-400', bg: 'bg-purple-500/10', bar: 'bg-purple-500' },
                    { text: 'text-emerald-650 dark:text-emerald-400', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500' },
                    { text: 'text-amber-650 dark:text-amber-400', bg: 'bg-amber-500/10', bar: 'bg-amber-500' },
                    { text: 'text-pink-650 dark:text-pink-400', bg: 'bg-pink-500/10', bar: 'bg-pink-500' }
                  ][idx % 5]

                  return (
                    <div 
                      key={client.name} 
                      className="p-3 bg-[var(--color-surface-2)]/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--color-surface-2)]/50 transition-all duration-300 shadow-sm"
                    >
                      {/* Left: Avatar + Title */}
                      <div className="flex items-center gap-3 min-w-[150px]">
                        <div className={`w-9 h-9 rounded-xl ${colorSet.bg} ${colorSet.text} font-bold flex items-center justify-center text-xs tracking-wider uppercase shrink-0 shadow-sm`}>
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-[var(--color-text)] truncate max-w-[110px]" title={client.name}>
                            {client.name}
                          </h4>
                          <p className="text-[9px] text-[var(--color-text-muted)] font-medium">
                            {client.reportCount} {client.reportCount === 1 ? 'reporte' : 'reportes'}
                          </p>
                        </div>
                      </div>

                      {/* Center: Progress Bar + Sales Base */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between text-[9px] text-[var(--color-text-muted)]">
                          <span>Ventas brutas</span>
                          <span className="font-mono font-semibold">${client.totalSales.toLocaleString('es-CO')}</span>
                        </div>
                        <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden p-0.5 border border-[var(--color-border)]">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${colorSet.bar}`}
                            style={{ width: `${Math.max(pctWidth, 3)}%` }}
                          />
                        </div>
                      </div>

                      {/* Right: Commission Accum + Estatus Badge */}
                      <div className="sm:text-right min-w-[100px] flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--color-border)]">
                        <div>
                          <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] block">Comisión</span>
                          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">
                            ${client.totalCommission.toLocaleString('es-CO')}
                          </span>
                        </div>
                        
                        {client.pendingCount > 0 ? (
                          <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            {client.pendingCount} {client.pendingCount === 1 ? 'pendiente' : 'pendientes'}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Al día
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
              <span>Aportación sobre comisiones totales</span>
              <span className="font-bold font-mono text-indigo-400">Calculado en base a datos cargados</span>
            </div>
          </div>

          {/* Consola de Telemetría en Tiempo Real (Log feed) */}
          <div className="bg-[var(--color-surface)] p-6 rounded-3xl flex flex-col shadow-sm transition-colors duration-300">
            <div className="space-y-1 mb-4">
              <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Diagnóstico</span>
              <h3 className="font-extrabold text-lg text-[var(--color-text)] flex items-center gap-2">
                <Activity size={18} className="text-indigo-550 dark:text-indigo-400" />
                Consola de Telemetría
              </h3>
            </div>

            {/* Visual System Health Indicators */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl flex items-center gap-2.5 transition-colors duration-300">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    dbStatus === 'conectado' && !isSimulated ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    dbStatus === 'conectado' && !isSimulated ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}></span>
                </span>
                <div className="min-w-0">
                  <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Canal Base Datos</span>
                  <span className="text-[10px] font-bold text-[var(--color-text)] truncate block">
                    {dbStatus === 'conectado' && !isSimulated ? 'Firestore Central' : 'Sandbox (Bypass)'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl flex items-center gap-2.5 transition-colors duration-300">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${systemLogs.length > 0 ? (systemLogs[0].type === 'error' ? 'bg-red-500' : systemLogs[0].type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-500'}`} />
                <div className="min-w-0">
                  <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Último Estatus</span>
                  <span className="text-[10px] font-bold text-[var(--color-text)] truncate block">
                    {systemLogs.length > 0 ? (
                      `${systemLogs[0].client ? `[${systemLogs[0].client}] ` : ''}${
                        systemLogs[0].type === 'success' ? 'Éxito' : systemLogs[0].type === 'error' ? 'Error' : 'Transmisión Info'
                      }`
                    ) : 'Sin actividad'}
                  </span>
                </div>
              </div>
            </div>

            {/* Logs Area */}
            <div className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-3 h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950 flex flex-col gap-2 transition-colors duration-300">
              {systemLogs.length === 0 ? (
                <div className="text-[var(--color-text-muted)] italic text-xs text-center my-auto">No hay transmisiones registradas en esta sesión.</div>
              ) : (
                (() => {
                  const LOGS_PER_PAGE = 5;
                  const totalLogPages = Math.ceil(systemLogs.length / LOGS_PER_PAGE) || 1;
                  const currentPage = Math.min(logPage, totalLogPages);
                  const startIndex = (currentPage - 1) * LOGS_PER_PAGE;
                  const paginatedLogs = systemLogs.slice(startIndex, startIndex + LOGS_PER_PAGE);

                  return paginatedLogs.map((log, index) => {
                    const cardStyle = {
                      info: 'bg-[var(--color-surface-2)]/45 text-[var(--color-text-muted)] border-[var(--color-border)]',
                      warning: 'bg-amber-500/5 text-amber-700 dark:text-amber-400 border-amber-500/20',
                      error: 'bg-red-500/5 text-red-700 dark:text-red-400 border-red-500/20',
                      success: 'bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                    }[log.type]

                    const badgeStyle = {
                      info: 'bg-slate-500/10 text-slate-500 dark:text-slate-400',
                      warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                      error: 'bg-red-500/10 text-red-600 dark:text-red-400',
                      success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }[log.type]

                    const label = {
                      info: 'INFO',
                      warning: 'ALERTA',
                      error: 'ERROR',
                      success: 'ÉXITO'
                    }[log.type]

                    return (
                      <div key={index} className={`p-2.5 rounded-xl border ${cardStyle} transition-all duration-200 flex flex-col gap-1 text-[10px]`}>
                        <div className="flex items-center justify-between">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${badgeStyle}`}>{label}</span>
                          <span className="text-[8px] text-[var(--color-text-muted)] opacity-85 font-mono">{log.timestamp}</span>
                        </div>
                        <p className="font-mono leading-relaxed break-words">{log.message}</p>
                      </div>
                    )
                  })
                })()
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setSystemLogs([]); setLogPage(1); }}
                  className="text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Limpiar Consola
                </button>
                {systemLogs.length > 5 && (
                  (() => {
                    const LOGS_PER_PAGE = 5;
                    const totalLogPages = Math.ceil(systemLogs.length / LOGS_PER_PAGE) || 1;
                    const currentPage = Math.min(logPage, totalLogPages);

                    return (
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setLogPage(prev => Math.max(prev - 1, 1))}
                          className="px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed font-bold"
                        >
                          ◀
                        </button>
                        <span className="font-mono text-[9px] text-[var(--color-text-muted)]">
                          {currentPage}/{totalLogPages}
                        </span>
                        <button
                          disabled={currentPage === totalLogPages}
                          onClick={() => setLogPage(prev => Math.min(prev + 1, totalLogPages))}
                          className="px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed font-bold"
                        >
                          ▶
                        </button>
                      </div>
                    )
                  })()
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1">
                <Terminal size={11} className="text-slate-600" />
                Live Monitor
              </span>
            </div>
          </div>
        </div>

        {/* Listado de Facturación de Clientes */}
        <div className="bg-[var(--color-surface)] rounded-3xl overflow-hidden shadow-sm transition-colors duration-300">
          
          {/* Header del listado y filtros */}
          <div className="p-6 border-b border-[var(--color-border)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-base flex items-center gap-2 text-[var(--color-text)]">
                <Layers size={16} className="text-indigo-500 dark:text-indigo-400" />
                Consolidado Mensual de Comisiones
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">Historial general de facturas transmitidas por clientes.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Buscador */}
              <div className="flex items-center gap-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] px-3.5 py-2 rounded-xl w-full sm:w-60 shadow-sm focus-within:border-indigo-500/50 transition-all transition-colors duration-300">
                <Search size={14} className="text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Buscar cliente o periodo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 outline-none text-xs w-full text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:ring-0"
                />
              </div>

              {/* Selector Filtro de Estado */}
              <div className="flex bg-[var(--color-bg)] border border-[var(--color-border)] p-1 rounded-xl w-full sm:w-auto shadow-sm transition-colors duration-300">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'pendiente', label: 'Pendientes' },
                  { id: 'pagado', label: 'Pagados' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      statusFilter === tab.id 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-16 text-center text-slate-400 text-xs space-y-3">
              <RefreshCw size={24} className="mx-auto animate-spin text-indigo-400" />
              <p className="font-semibold uppercase tracking-wider text-[10px]">Descargando datos del servidor central...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-16 text-center text-slate-500 text-xs">
              Ningún reporte coincide con los criterios de búsqueda o filtrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] bg-[var(--color-surface-2)]/70 font-bold transition-colors duration-300">
                    <th className="p-4 pl-6 uppercase tracking-wider text-[10px]">Identificador de App</th>
                    <th className="p-4 uppercase tracking-wider text-[10px]">Periodo</th>
                    <th className="p-4 text-right uppercase tracking-wider text-[10px]">Ventas Totales</th>
                    <th className="p-4 text-center uppercase tracking-wider text-[10px]">Tarifa</th>
                    <th className="p-4 text-right uppercase tracking-wider text-[10px]">Comisión</th>
                    <th className="p-4 text-center uppercase tracking-wider text-[10px]">Estatus Pago</th>
                    <th className="p-4 pr-6 text-right uppercase tracking-wider text-[10px]">Última Transmisión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {filteredReports.map(report => (
                    <tr 
                      key={report.id} 
                      onClick={() => setSelectedReport(report)}
                      className={`hover:bg-[var(--color-surface-2)]/40 transition-colors cursor-pointer group ${
                        selectedReport && selectedReport.id === report.id ? 'bg-[var(--color-surface-2)]/60' : ''
                      }`}
                    >
                      <td className="p-4 pl-6 font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            report.estadoPago === 'pagado' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'
                          }`} />
                          {report.clientId}
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-[var(--color-text)] opacity-90">{report.periodo}</td>
                      <td className="p-4 text-right font-mono text-[var(--color-text)] font-medium">${report.totalVentas.toLocaleString('es-CO')}</td>
                      <td className="p-4 text-center font-bold text-[var(--color-text-muted)]">
                        {(() => {
                          const clientConfig = clientesSaas.find(c => c.id === report.clientId);
                          const mode = clientConfig?.billingMode || 'percentage';
                          if (mode === 'percentage') {
                            return `${report.comisionPorcentaje || clientConfig?.comisionPorcentaje || 1.5}%`;
                          } else if (mode === 'fixed_per_service') {
                            const fixed = clientConfig?.montoFijoServicio || 500;
                            return `$${fixed.toLocaleString('es-CO')} c/u`;
                          } else if (mode === 'flat_monthly') {
                            const flat = clientConfig?.pagoMensualFijo || 50000;
                            return `$${(flat / 1000).toFixed(0)}k/mes`;
                          }
                          return `${report.comisionPorcentaje || 1.5}%`;
                        })()}
                      </td>
                      <td className="p-4 text-right font-mono">
                        <div className="font-extrabold text-indigo-600 dark:text-indigo-300">${report.comisionValor.toLocaleString('es-CO')}</div>
                        {(() => {
                          const clientConfig = clientesSaas.find(c => c.id === report.clientId);
                          if (clientConfig?.enableDianBilling) {
                            const costPerDoc = clientConfig.costoPorFacturaDian || 150;
                            const dianCount = report.dianDocsCount || 0;
                            const dianCommission = dianCount * costPerDoc;
                            const baseCommission = Math.max(0, report.comisionValor - dianCommission);
                            return (
                              <div className="text-[9px] text-[var(--color-text-muted)] mt-0.5 font-sans leading-none">
                                Base: ${baseCommission.toLocaleString('es-CO')} + DIAN: ${dianCommission.toLocaleString('es-CO')}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </td>
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleTogglePayment(report)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all duration-300 cursor-pointer flex items-center gap-1.5 mx-auto ${
                            report.estadoPago === 'pagado'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${report.estadoPago === 'pagado' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {report.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente'}
                        </button>
                      </td>
                      <td className="p-4 pr-6 text-right font-mono text-[10px] text-[var(--color-text-muted)] opacity-80 group-hover:opacity-100 transition-colors">
                        {report.updatedAt?.toDate ? report.updatedAt.toDate().toLocaleString('es-CO') : 'Reciente'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Inspector de Reporte Lateral (Drawer Modal) */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          {/* Backdrop Tap */}
          <div className="absolute inset-0" onClick={() => setSelectedReport(null)} />
          
          <div className="relative w-full max-w-md bg-[var(--color-surface)] border-l border-[var(--color-border)] h-full p-6 shadow-2xl flex flex-col justify-between animate-slide-in overflow-y-auto transition-colors duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                    <Activity size={14} />
                  </div>
                  <h3 className="font-extrabold text-sm text-[var(--color-text)]">Ficha de Telemetría</h3>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] w-8 h-8 rounded-lg flex items-center justify-center font-bold border border-[var(--color-border)] cursor-pointer transition-colors duration-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">ID del Reporte</label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs font-mono font-bold text-[var(--color-text)] bg-[var(--color-bg)] p-2 rounded-lg border border-[var(--color-border)] flex-1 truncate">{selectedReport.id}</p>
                    <button 
                      onClick={() => { copy(selectedReport.id); showToast('ID de Reporte copiado', { type: 'success' }) }} 
                      className="h-8 w-8 shrink-0 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-border)] rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
                      title="Copiar ID"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] font-sans">Cliente ID</label>
                    <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{selectedReport.clientId}</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">Periodo</label>
                    <p className="text-sm font-mono font-bold text-[var(--color-text)] mt-1">{selectedReport.periodo}</p>
                  </div>
                </div>

                <div className="h-px bg-[var(--color-border)] my-2" />

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--color-text-muted)]">Ventas Registradas del Mes:</span>
                    <span className="font-mono font-bold text-[var(--color-text)]">${selectedReport.totalVentas.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--color-text-muted)]">Porcentaje de Comisión:</span>
                    <span className="font-bold text-[var(--color-text)]">{selectedReport.comisionPorcentaje}%</span>
                  </div>
                  
                  {(() => {
                    const clientConfig = clientesSaas.find(c => c.id === selectedReport.clientId);
                    if (clientConfig?.enableDianBilling) {
                      const costPerDoc = clientConfig.costoPorFacturaDian || 150;
                      // We can count DIAN invoices. In telemetry, we can save a field `dianDocsCount`. Let's default to a mock/read count, or calculate it.
                      const dianCount = selectedReport.dianDocsCount || 0;
                      const dianCommission = dianCount * costPerDoc;
                      const baseCommission = Math.max(0, selectedReport.comisionValor - dianCommission);
                      
                      return (
                        <>
                          <div className="flex justify-between items-center text-xs pl-2 border-l border-indigo-500/30">
                            <span className="text-[var(--color-text-muted)]">Comisión Base SaaS:</span>
                            <span className="font-mono font-medium text-[var(--color-text)]">${baseCommission.toLocaleString('es-CO')}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs pl-2 border-l border-indigo-500/30">
                            <span className="text-[var(--color-text-muted)]">Documentos DIAN ({dianCount} u.):</span>
                            <span className="font-mono font-medium text-[var(--color-text)]">${dianCommission.toLocaleString('es-CO')}</span>
                          </div>
                        </>
                      );
                    }
                    return null;
                  })()}

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--color-text-muted)]">Valor de Comisión Total:</span>
                    <span className="font-mono font-black text-indigo-600 dark:text-indigo-300 text-sm">${selectedReport.comisionValor.toLocaleString('es-CO')}</span>
                  </div>
                </div>

                <div className="h-px bg-[var(--color-border)] my-2" />

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] block">Token de Autenticación de Envío</label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] font-mono text-[var(--color-text-muted)] bg-[var(--color-bg)] p-2 rounded-lg border border-[var(--color-border)] break-all select-all flex-1 truncate">{selectedReport.token || 'Sandbox Mode (Bypass Token)'}</p>
                    {selectedReport.token && (
                      <button 
                        onClick={() => { copy(selectedReport.token); showToast('Token de Telemetría copiado', { type: 'success' }) }} 
                        className="h-8 w-8 shrink-0 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-border)] rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
                        title="Copiar Token"
                      >
                        <Copy size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] block">Última Transmisión</label>
                  <p className="text-xs text-[var(--color-text)] font-mono">{selectedReport.updatedAt?.toDate ? selectedReport.updatedAt.toDate().toLocaleString('es-CO') : 'Reciente'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-[var(--color-border)]">
              <button
                onClick={() => handleTogglePayment(selectedReport)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 border shadow-md active:scale-[0.98] ${
                  selectedReport.estadoPago === 'pagado'
                    ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/25'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/30'
                }`}
              >
                {selectedReport.estadoPago === 'pagado' ? (
                  <>
                    <Clock size={13} />
                    Marcar como Pendiente
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    Aprobar Pago y Recaudar
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  exportCommissionReceiptPDF(selectedReport)
                  showToast('Recibo PDF exportado con éxito', { type: 'success' })
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 border border-indigo-500/30 shadow-md active:scale-[0.98]"
              >
                <Download size={13} />
                Descargar Recibo PDF
              </button>
              
              <button
                onClick={() => setSelectedReport(null)}
                className="w-full py-2.5 rounded-xl bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text)] font-bold text-xs uppercase tracking-wider transition-colors duration-200 border border-[var(--color-border)] cursor-pointer"
              >
                Cerrar Detalles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Métrica */}
      {activeMetricModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm animate-fade-in p-4">
          {/* Backdrop */}
          <div className="absolute inset-0" onClick={() => setActiveMetricModal(null)} />
          
          <div className="relative w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl animate-scale-up max-h-[85vh] flex flex-col overflow-hidden transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  {activeMetricModal === 'comision' && <TrendingUp size={20} />}
                  {activeMetricModal === 'cobrado' && <CheckCircle size={20} />}
                  {activeMetricModal === 'pendiente' && <Clock size={20} />}
                  {activeMetricModal === 'clientes' && <Users size={20} />}
                </span>
                <h3 className="font-extrabold text-base text-[var(--color-text)]">
                  {activeMetricModal === 'comision' && 'Historial de Comisiones Acumuladas'}
                  {activeMetricModal === 'cobrado' && 'Reportes Cobrados Exitosamente'}
                  {activeMetricModal === 'pendiente' && 'Comisiones Pendientes por Recaudar'}
                  {activeMetricModal === 'clientes' && 'Directorio y Control de Clientes'}
                </h3>
              </div>
              <button 
                onClick={() => setActiveMetricModal(null)}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] w-8 h-8 rounded-lg flex items-center justify-center font-bold border border-[var(--color-border)] cursor-pointer transition-colors duration-200"
              >
                ✕
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {/* CASO 1: COMISION ACUMULADA */}
              {activeMetricModal === 'comision' && (() => {
                // Agrupar comisiones por periodo
                const periodGroups = reports.reduce((acc, r) => {
                  acc[r.periodo] = (acc[r.periodo] || 0) + (r.comisionValor || 0)
                  return acc
                }, {})
                const sortedPeriods = Object.entries(periodGroups).sort((a, b) => b[0].localeCompare(a[0]))

                return (
                  <div className="space-y-4">
                    <p className="text-xs text-[var(--color-text-muted)]">Historial comisional mensual consolidado del desarrollador.</p>
                    <div className="bg-[var(--color-bg)] rounded-2xl p-4 border border-[var(--color-border)] space-y-3">
                      {sortedPeriods.length === 0 ? (
                        <p className="text-xs text-[var(--color-text-muted)] italic text-center py-4">No hay datos de comisiones disponibles.</p>
                      ) : (
                        sortedPeriods.map(([period, val]) => (
                          <div key={period} className="flex justify-between items-center border-b border-[var(--color-border)]/50 pb-2 last:border-b-0 last:pb-0 text-xs">
                            <span className="font-bold text-[var(--color-text)] font-mono">{period}</span>
                            <span className="font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">${val.toLocaleString('es-CO')}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* CASO 2: COBRADO EXITOSO */}
              {activeMetricModal === 'cobrado' && (() => {
                const paidReports = reports.filter(r => (r.estadoPago || 'pendiente').toLowerCase() === 'pagado')
                return (
                  <div className="space-y-3">
                    <p className="text-xs text-[var(--color-text-muted)]">Lista de comprobantes de facturación ya recaudados.</p>
                    <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                      {paidReports.length === 0 ? (
                        <p className="text-xs text-[var(--color-text-muted)] italic text-center py-8">No hay facturas pagadas en este momento.</p>
                      ) : (
                        paidReports.map(report => (
                          <div key={report.id} className="p-3 bg-[var(--color-surface-2)]/40 rounded-xl flex items-center justify-between border border-[var(--color-border)] text-xs">
                            <div>
                              <p className="font-bold text-[var(--color-text)]">{report.clientId}</p>
                              <p className="text-[10px] text-[var(--color-text-muted)] font-mono">{report.periodo}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">${report.comisionValor.toLocaleString('es-CO')}</span>
                              <button 
                                onClick={() => {
                                  exportCommissionReceiptPDF(report)
                                  showToast('Recibo PDF exportado con éxito', { type: 'success' })
                                }}
                                className="p-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-border)] text-[var(--color-text)] rounded-lg transition-colors cursor-pointer"
                                title="Descargar PDF"
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* CASO 3: SALDO POR RECAUDAR */}
              {activeMetricModal === 'pendiente' && (() => {
                const pendingReports = reports.filter(r => (r.estadoPago || 'pendiente').toLowerCase() === 'pendiente')
                
                const handleCopyReminder = (report) => {
                  const valor = report.comisionValor.toLocaleString('es-CO')
                  const msj = `Hola *${report.clientId}*, te informamos que la comisión de tu servicio correspondiente al periodo *${report.periodo}* por un valor de *$${valor}* ya ha sido calculada y está pendiente de pago. ¡Agradecemos tu atención!`
                  copy(msj)
                  showToast('Recordatorio copiado al portapapeles', { type: 'success' })
                }

                return (
                  <div className="space-y-3">
                    <p className="text-xs text-[var(--color-text-muted)]">Facturas comisionales pendientes. Aprueba cobros o copia recordatorios para WhatsApp rápidamente.</p>
                    <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                      {pendingReports.length === 0 ? (
                        <p className="text-xs text-[var(--color-text-muted)] italic text-center py-8">Excelente: no hay saldos pendientes por recaudar.</p>
                      ) : (
                        pendingReports.map(report => (
                          <div key={report.id} className="p-3 bg-[var(--color-surface-2)]/40 rounded-xl flex items-center justify-between border border-[var(--color-border)] text-xs">
                            <div>
                              <p className="font-bold text-[var(--color-text)]">{report.clientId}</p>
                              <p className="text-[10px] text-[var(--color-text-muted)] font-mono">{report.periodo} • ${report.comisionValor.toLocaleString('es-CO')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleCopyReminder(report)}
                                className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                title="Copiar mensaje cobro WhatsApp"
                              >
                                <Mail size={13} />
                                Recordatorio
                              </button>
                              <button 
                                onClick={() => {
                                  setActiveMetricModal(null)
                                  handleTogglePayment(report)
                                }}
                                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer font-bold"
                              >
                                Registrar Pago
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* CASO 4: CLIENTES REGISTRADOS (MÓDULO CRM INTEGRAL) */}
              {activeMetricModal === 'clientes' && (() => {
                const uniqueClients = Object.values(clientAggregated)
                
                // Si hay un cliente seleccionado, mostrar su Portal/Ficha CRM
                if (selectedCrmClientId) {
                  const clientData = clientAggregated[selectedCrmClientId] || {
                    name: selectedCrmClientId,
                    totalSales: 0,
                    totalCommission: 0,
                    reportCount: 0,
                    pendingCount: 0
                  }
                  const clientReports = reports.filter(r => r.clientId === selectedCrmClientId)
                  const filteredClientReports = clientReports.filter(r => crmStatusFilter === 'todos' || r.estadoPago === crmStatusFilter)
                  
                  const handleSaveCrmConfig = async (clientId, updates) => {
                    addLog(`[CRM] Guardando configuración para ${clientId}: ${JSON.stringify(updates)}...`, "info")
                    
                    if (isSimulated) {
                      setClientesSaas(prev => {
                        const exists = prev.some(c => c.id === clientId)
                        if (exists) {
                          return prev.map(c => c.id === clientId ? { ...c, ...updates } : c)
                        } else {
                          return [...prev, { id: clientId, ...updates }]
                        }
                      })
                      addLog(`[Sandbox] Configuración actualizada en memoria local para ${clientId}.`, "success")
                      showToast(`Configuración de ${clientId} guardada localmente`, { type: 'success' })
                      return
                    }

                    const centralApp = getCentralApp()
                    if (!centralApp) return
                    const dbInstance = getFirestore(centralApp)

                    try {
                      const docRef = doc(dbInstance, 'clientes_saas', clientId)
                      await setDoc(docRef, {
                        ...updates,
                        updatedAt: serverTimestamp()
                      }, { merge: true })
                      addLog(`[Firestore] Configuración guardada para ${clientId} en la nube.`, "success")
                      showToast(`Configuración de ${clientId} actualizada`, { type: 'success' })
                    } catch (err) {
                      console.error("Error guardando configuración:", err)
                      addLog(`Error al guardar configuración: ${err.message}`, "error")
                      showToast(`Error al guardar configuración: ${err.message}`, { type: 'error' })
                    }
                  }

                  const handleTriggerTelemetry = async () => {
                    const testPeriod = new Date().toISOString().substring(0, 7)
                    const reportId = `${selectedCrmClientId}_${testPeriod}`
                    const sales = Math.floor(Math.random() * 8000000) + 2000000
                    
                    const clientConfig = clientesSaas.find(c => c.id === selectedCrmClientId) || {}
                    const mode = clientConfig.billingMode || 'percentage'
                    let comValue = 0
                    let pctVal = 1.5
                    
                    if (mode === 'percentage') {
                      pctVal = clientConfig.comisionPorcentaje !== undefined ? parseFloat(clientConfig.comisionPorcentaje) : 1.5
                      comValue = (sales * pctVal) / 100
                    } else if (mode === 'fixed_per_service') {
                      const fixed = clientConfig.montoFijoServicio !== undefined ? parseFloat(clientConfig.montoFijoServicio) : 500
                      comValue = fixed * 12 // Assume 12 transactions for test
                    } else if (mode === 'flat_monthly') {
                      comValue = clientConfig.pagoMensualFijo !== undefined ? parseFloat(clientConfig.pagoMensualFijo) : 50000
                    }

                    // Add DIAN billing cost to comisionValor if enabled
                    let dianDocsCount = 0;
                    if (clientConfig.enableDianBilling) {
                      dianDocsCount = Math.floor(Math.random() * 80) + 20; // 20 to 100 documents
                      const costPerDoc = clientConfig.costoPorFacturaDian !== undefined ? parseFloat(clientConfig.costoPorFacturaDian) : 150;
                      comValue += (dianDocsCount * costPerDoc);
                    }

                    addLog(`Generando telemetría de prueba para ${selectedCrmClientId} ($${sales.toLocaleString()} Ventas, Modo: ${mode}${clientConfig.enableDianBilling ? `, DIAN: ${dianDocsCount} docs` : ''})`, "info", selectedCrmClientId)

                    if (isSimulated) {
                      const newRep = {
                        id: reportId,
                        clientId: selectedCrmClientId,
                        periodo: testPeriod,
                        totalVentas: sales,
                        comisionPorcentaje: mode === 'percentage' ? pctVal : 0,
                        comisionValor: comValue,
                        dianDocsCount: dianDocsCount,
                        estadoPago: 'pendiente',
                        updatedAt: { toDate: () => new Date() }
                      }
                      setReports(prev => [newRep, ...prev.filter(r => r.id !== reportId)])
                      addLog(`[Sandbox] Telemetría enviada para cliente ${selectedCrmClientId}.`, "success", selectedCrmClientId)
                      showToast(`Telemetría enviada para ${selectedCrmClientId}`, { type: 'success' })
                      return
                    }

                    const centralApp = getCentralApp()
                    if (!centralApp) return
                    const dbInstance = getFirestore(centralApp)

                    try {
                      const tokenDoc = telemetryTokens.find(t => t.clientId === selectedCrmClientId)
                      const activeToken = tokenDoc ? tokenDoc.id : DEV_TOKEN
                      const docRef = doc(dbInstance, 'reportesBilling', reportId)
                      await setDoc(docRef, {
                        clientId: selectedCrmClientId,
                        token: activeToken,
                        periodo: testPeriod,
                        totalVentas: sales,
                        comisionPorcentaje: mode === 'percentage' ? pctVal : 0,
                        comisionValor: comValue,
                        dianDocsCount: dianDocsCount,
                        estadoPago: 'pendiente',
                        updatedAt: serverTimestamp()
                      })
                      addLog(`[Firestore] Telemetría enviada con éxito para ${selectedCrmClientId} a la nube central.`, "success", selectedCrmClientId)
                      showToast(`Telemetría enviada para ${selectedCrmClientId} a la nube`, { type: 'success' })
                    } catch (err) {
                      console.error("Error enviando telemetría:", err)
                      addLog(`Error al enviar telemetría: ${err.message}`, "error")
                      showToast(`Error al enviar telemetría: ${err.message}`, { type: 'error' })
                    }
                  }

                  const handleCombinedWhatsAppNudge = () => {
                    const pendingInvoices = clientReports.filter(r => (r.estadoPago || 'pendiente').toLowerCase() === 'pendiente')
                    if (pendingInvoices.length === 0) {
                      showToast('Cliente al día. Sin saldos por cobrar.', { type: 'success' })
                      return
                    }
                    const totalPendingVal = pendingInvoices.reduce((sum, r) => sum + r.comisionValor, 0)
                    const periodsText = pendingInvoices.map(r => r.periodo).join(', ')
                    const msj = `Hola *${selectedCrmClientId}*, te recordamos que tienes *${pendingInvoices.length}* facturas de comisión pendientes correspondientes a los periodos [${periodsText}] por un total acumulado de *$${totalPendingVal.toLocaleString('es-CO')}*. Agradecemos tu valioso pago.`
                    copy(msj)
                    showToast('Mensaje de cobro combinado copiado', { type: 'success' })
                  }

                  return (
                    <div className="space-y-5">
                      {/* Cabecera Ficha */}
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setSelectedCrmClientId(null)}
                          className="px-2.5 py-1.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-xs font-bold rounded-xl border border-[var(--color-border)] cursor-pointer text-[var(--color-text)] transition-colors"
                        >
                          ← Volver al CRM
                        </button>
                        <span className="text-xs text-[var(--color-text-muted)] font-bold">Portal del Cliente</span>
                      </div>

                      {/* Info general */}
                      <div className="p-4 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">Ventas brutas</span>
                          <p className="text-sm font-black font-mono text-[var(--color-text)]">${clientData.totalSales.toLocaleString('es-CO')}</p>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">Comisión Total</span>
                          <p className="text-sm font-black font-mono text-indigo-600 dark:text-indigo-400">${clientData.totalCommission.toLocaleString('es-CO')}</p>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">Reportes</span>
                          <p className="text-sm font-black text-[var(--color-text)]">{clientData.reportCount}</p>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">Pendientes</span>
                          <p className={`text-sm font-black font-mono ${clientData.pendingCount > 0 ? 'text-amber-500' : 'text-emerald-550'}`}>{clientData.pendingCount}</p>
                        </div>
                      </div>

                      {/* Configuración SaaS */}
                      <div className="p-4 bg-[var(--color-surface-2)]/40 rounded-2xl border border-[var(--color-border)] space-y-4">
                        <h4 className="font-extrabold text-xs text-[var(--color-text)]">Configuración SaaS del Cliente</h4>
                        
                        {/* Selector de modo de facturación */}
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Modelo de Facturación</label>
                          <CustomSelect
                            value={clientesSaas.find(c => c.id === selectedCrmClientId)?.billingMode || 'percentage'}
                            onChange={async (e) => {
                              const newMode = e.target.value;
                              await handleSaveCrmConfig(selectedCrmClientId, { billingMode: newMode });
                            }}
                            options={[
                              { id: 'percentage', name: 'Porcentaje de Venta' },
                              { id: 'fixed_per_service', name: 'Monto Fijo por Servicio' },
                              { id: 'flat_monthly', name: 'Pago Mensual Fijo' }
                            ]}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Inputs según el modo */}
                          {(() => {
                            const clientConfig = clientesSaas.find(c => c.id === selectedCrmClientId) || {};
                            const mode = clientConfig.billingMode || 'percentage';
                            
                            if (mode === 'percentage') {
                              return (
                                <div className="space-y-1 sm:col-span-2">
                                  <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Tasa de Comisión (%)</label>
                                  <div className="flex gap-2">
                                    <input 
                                      type="number" 
                                      step="0.1"
                                      defaultValue={clientConfig.comisionPorcentaje !== undefined ? clientConfig.comisionPorcentaje : 1.5}
                                      id="crm-comision-porcentaje"
                                      className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-xs text-[var(--color-text)] outline-none flex-1 focus:border-indigo-500 font-mono"
                                    />
                                    <button 
                                      onClick={async () => {
                                        const el = document.getElementById('crm-comision-porcentaje');
                                        const val = el ? parseFloat(el.value) : 1.5;
                                        await handleSaveCrmConfig(selectedCrmClientId, { comisionPorcentaje: val });
                                      }}
                                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                                    >
                                      Guardar
                                    </button>
                                  </div>
                                </div>
                              );
                            } else if (mode === 'fixed_per_service') {
                              return (
                                <div className="space-y-1 sm:col-span-2">
                                  <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Monto Fijo por Servicio ($)</label>
                                  <div className="flex gap-2">
                                    <input 
                                      type="number" 
                                      defaultValue={clientConfig.montoFijoServicio !== undefined ? clientConfig.montoFijoServicio : 500}
                                      id="crm-monto-fijo-servicio"
                                      className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-xs text-[var(--color-text)] outline-none flex-1 focus:border-indigo-500 font-mono"
                                    />
                                    <button 
                                      onClick={async () => {
                                        const el = document.getElementById('crm-monto-fijo-servicio');
                                        const val = el ? parseFloat(el.value) : 500;
                                        await handleSaveCrmConfig(selectedCrmClientId, { montoFijoServicio: val });
                                      }}
                                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                                    >
                                      Guardar
                                    </button>
                                  </div>
                                </div>
                              );
                            } else if (mode === 'flat_monthly') {
                              return (
                                <div className="space-y-1 sm:col-span-2">
                                  <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Pago Mensual Fijo ($)</label>
                                  <div className="flex gap-2">
                                    <input 
                                      type="number" 
                                      defaultValue={clientConfig.pagoMensualFijo !== undefined ? clientConfig.pagoMensualFijo : 50000}
                                      id="crm-pago-mensual-fijo"
                                      className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-xs text-[var(--color-text)] outline-none flex-1 focus:border-indigo-500 font-mono"
                                    />
                                    <button 
                                      onClick={async () => {
                                        const el = document.getElementById('crm-pago-mensual-fijo');
                                        const val = el ? parseFloat(el.value) : 50000;
                                        await handleSaveCrmConfig(selectedCrmClientId, { pagoMensualFijo: val });
                                      }}
                                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                                    >
                                      Guardar
                                    </button>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}

                          {/* Facturación Electrónica DIAN */}
                          <div className="sm:col-span-2 border-t border-[var(--color-border)]/50 pt-3 mt-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-[9px] uppercase font-bold text-[var(--color-text)] block">Facturación DIAN</label>
                                <span className="text-[8px] text-[var(--color-text-muted)]">Habilita módulo DIAN y cobro por documento.</span>
                              </div>
                              <input 
                                type="checkbox" 
                                checked={clientesSaas.find(c => c.id === selectedCrmClientId)?.enableDianBilling || false}
                                onChange={async (e) => {
                                  await handleSaveCrmConfig(selectedCrmClientId, { enableDianBilling: e.target.checked });
                                }}
                                className="w-4 h-4 text-indigo-650 bg-[var(--color-bg)] border-[var(--color-border)] rounded-md focus:ring-indigo-500 cursor-pointer"
                              />
                            </div>
                            
                            {clientesSaas.find(c => c.id === selectedCrmClientId)?.enableDianBilling && (
                              <div className="space-y-1 animate-fade-in">
                                <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Costo Por Factura DIAN ($)</label>
                                <div className="flex gap-2">
                                  <input 
                                    type="number" 
                                    defaultValue={clientesSaas.find(c => c.id === selectedCrmClientId)?.costoPorFacturaDian !== undefined ? clientesSaas.find(c => c.id === selectedCrmClientId)?.costoPorFacturaDian : 150}
                                    id="crm-costo-dian"
                                    className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-xs text-[var(--color-text)] outline-none flex-1 focus:border-indigo-500 font-mono"
                                  />
                                  <button 
                                    onClick={async () => {
                                      const el = document.getElementById('crm-costo-dian');
                                      const val = el ? parseFloat(el.value) : 150;
                                      await handleSaveCrmConfig(selectedCrmClientId, { costoPorFacturaDian: val });
                                    }}
                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                                  >
                                    Guardar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Token */}
                          <div className="sm:col-span-2">
                            <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Token de Telemetría</label>
                            <p className="text-[10px] font-mono text-[var(--color-text-muted)] truncate bg-[var(--color-bg)] p-2 rounded-xl border border-[var(--color-border)] mt-1">
                              {telemetryTokens.find(t => t.clientId === selectedCrmClientId)?.id || `${selectedCrmClientId}-token-development`}
                            </p>
                          </div>
                        </div>

                        {/* Acciones de cobro consolidado y simulación */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <button 
                            onClick={handleCombinedWhatsAppNudge}
                            className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
                          >
                            <Mail size={13} />
                            Copiar Recordatorio Integrado WhatsApp
                          </button>
                          <button 
                            onClick={handleTriggerTelemetry}
                            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
                          >
                            <Database size={13} />
                            Simular Transmisión de Envío
                          </button>
                        </div>
                      </div>

                      {/* Historial específico de este cliente */}
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)]/50 pb-2">
                          <h4 className="font-extrabold text-xs text-[var(--color-text)]">Historial de Reportes del Cliente</h4>
                          <div className="flex bg-[var(--color-bg)] border border-[var(--color-border)] p-0.5 rounded-lg text-[9px] font-bold shadow-sm self-start sm:self-auto transition-colors duration-300">
                            {[
                              { id: 'todos', label: 'Todos' },
                              { id: 'pendiente', label: 'Pendientes' },
                              { id: 'pagado', label: 'Pagados' }
                            ].map(tab => (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => setCrmStatusFilter(tab.id)}
                                className={`px-2 py-1 rounded-md uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                  crmStatusFilter === tab.id 
                                    ? 'bg-indigo-600 text-white shadow-sm' 
                                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2 max-h-[25vh] overflow-y-auto">
                          {filteredClientReports.length === 0 ? (
                            <p className="text-[10px] text-[var(--color-text-muted)] italic text-center py-6">Ningún reporte coincide con el filtro seleccionado.</p>
                          ) : (
                            filteredClientReports.map(report => (
                              <div key={report.id} className="p-3 bg-[var(--color-surface-2)]/30 rounded-xl flex items-center justify-between border border-[var(--color-border)] text-xs">
                                <div>
                                  <span className="font-bold text-[var(--color-text)] font-mono">{report.periodo}</span>
                                  <span className="text-[10px] text-[var(--color-text-muted)] ml-2">Ventas: ${report.totalVentas.toLocaleString('es-CO')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">${report.comisionValor.toLocaleString('es-CO')}</span>
                                  <button 
                                    onClick={() => handleTogglePayment(report)}
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold border transition-colors cursor-pointer ${
                                      report.estadoPago === 'pagado'
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                    }`}
                                  >
                                    {report.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente'}
                                  </button>
                                  <button 
                                    onClick={() => exportCommissionReceiptPDF(report)}
                                    className="p-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg cursor-pointer"
                                    title="PDF"
                                  >
                                    <Download size={12} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )
                }

                const filteredCrmClients = uniqueClients.filter(c => c.name.toLowerCase().includes(crmSearch.toLowerCase()))

                // Sumar totales globales CRM
                const totalGlobalSales = uniqueClients.reduce((sum, c) => sum + c.totalSales, 0)
                const totalGlobalCommissions = uniqueClients.reduce((sum, c) => sum + c.totalCommission, 0)
                const totalGlobalPending = reports.reduce((sum, r) => (r.estadoPago || 'pendiente').toLowerCase() === 'pendiente' ? sum + r.comisionValor : sum, 0)

                return (
                  <div className="space-y-4">
                    {/* Tarjetas Analíticas del CRM */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-[var(--color-surface-2)]/30 rounded-xl border border-[var(--color-border)] text-center">
                        <span className="text-[8px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] block">Ventas Globales</span>
                        <span className="text-xs font-black font-mono text-[var(--color-text)]">${totalGlobalSales.toLocaleString('es-CO')}</span>
                      </div>
                      <div className="p-3 bg-[var(--color-surface-2)]/30 rounded-xl border border-[var(--color-border)] text-center">
                        <span className="text-[8px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] block">Comisión Recaudada</span>
                        <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">${(totalGlobalCommissions - totalGlobalPending).toLocaleString('es-CO')}</span>
                      </div>
                      <div className="p-3 bg-[var(--color-surface-2)]/30 rounded-xl border border-[var(--color-border)] text-center">
                        <span className="text-[8px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] block">Saldo Pendiente</span>
                        <span className="text-xs font-black font-mono text-amber-500">${totalGlobalPending.toLocaleString('es-CO')}</span>
                      </div>
                    </div>

                    {/* Nuevo Aprovisionamiento y Onboarding CTA */}
                    <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex flex-col items-center text-center gap-3">
                      <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-full">
                        <Plus size={20} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-[var(--color-text)]">Nuevo Aprovisionamiento y Onboarding</h4>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">Configura el entorno de servidor, branding visual y módulos de un nuevo cliente a pantalla completa.</p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveMetricModal(null);
                          setIsOnboardingActive(true);
                        }}
                        className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        Iniciar Aprovisionamiento
                      </button>
                    </div>

                    {/* Buscador de clientes */}
                    <div className="flex items-center gap-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] px-3.5 py-2 rounded-xl shadow-sm focus-within:border-indigo-500/50 transition-all transition-colors duration-300">
                      <Search size={14} className="text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Buscar cliente en el CRM..."
                        value={crmSearch}
                        onChange={(e) => setCrmSearch(e.target.value)}
                        className="bg-transparent border-0 outline-none text-xs w-full text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:ring-0"
                      />
                    </div>
                    
                    {/* Lista del Directorio CRM */}
                    <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                      {filteredCrmClients.map(client => (
                        <div key={client.name} className="p-3 bg-[var(--color-surface-2)]/40 rounded-xl flex items-center justify-between border border-[var(--color-border)] text-xs">
                          <div>
                            <p className="font-bold text-[var(--color-text)]">{client.name}</p>
                            <p className="text-[10px] text-[var(--color-text-muted)]">
                              {client.reportCount} {client.reportCount === 1 ? 'reporte' : 'reportes'} • {client.pendingCount} pend.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setSelectedCrmClientId(client.name)}
                              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1 shadow-sm"
                            >
                              Gestionar en CRM
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-[var(--color-border)] flex justify-end shrink-0">
              <button
                onClick={() => setActiveMetricModal(null)}
                className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text)] rounded-xl text-xs font-bold border border-[var(--color-border)] cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Onboarding / Checklist */}
      {onboardingData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="relative w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl animate-scale-up space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="font-black text-sm uppercase text-indigo-500 tracking-wider flex items-center gap-2">
                <CheckCircle size={16} />
                Onboarding & Checklist de Integración
              </h3>
              <button 
                onClick={() => setOnboardingData(null)}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Checklist interactivo para Firestore, Auth y Storage */}
            <div className="p-4 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl space-y-3">
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest block">Verificación de Configuración Manual de Firebase</span>
              <div className="space-y-2 text-xs">
                {[
                  { id: 'fs', label: 'Habilitar Firestore Database y desplegar reglas/índices' },
                  { id: 'auth', label: 'Habilitar Firebase Authentication (Correo/Contraseña)' },
                  { id: 'storage', label: 'Habilitar Firebase Storage para subida de comprobantes' }
                ].map(step => (
                  <label key={step.id} className="flex items-start gap-2.5 cursor-pointer select-none text-[var(--color-text)]">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded accent-indigo-650 bg-[var(--color-bg)] border border-[var(--color-border)] mt-0.5"
                    />
                    <span>{step.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-widest">Token de Telemetría Generado</span>
                <div className="flex items-center justify-between gap-3 bg-[var(--color-bg)] p-3 rounded-xl border border-[var(--color-border)]">
                  <code className="text-[11px] font-mono text-slate-350 truncate">{onboardingData.token}</code>
                  <button 
                    onClick={() => {
                      copy(onboardingData.token)
                      showToast('Token copiado al portapapeles', { type: 'success' })
                    }}
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer flex items-center justify-center shrink-0"
                    title="Copiar Token"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>

              {onboardingData.prompt && (
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest block">Prompt de Arranque para Antigravity</span>
                    <button 
                      onClick={() => {
                        copy(onboardingData.prompt)
                        showToast('Prompt copiado al portapapeles', { type: 'success' })
                      }}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-extrabold cursor-pointer transition-all hover:shadow-[0_0_10px_rgba(99,102,241,0.3)] flex items-center gap-1 shrink-0"
                      title="Copiar Prompt"
                    >
                      <Copy size={10} />
                      Copiar Prompt
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto bg-slate-950 p-3 rounded-xl border border-slate-900 text-[10px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
                    {onboardingData.prompt}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block tracking-widest">Pasos para el Aprovisionamiento Manual</span>
                
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl flex gap-3 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-indigo-650/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="font-bold text-[var(--color-text)]">Configurar archivo `.env.local`</p>
                      <p className="text-[11px] text-[var(--color-text-muted)]">Agrega el token generado y el Client ID en el archivo local de la instancia del cliente:</p>
                      <pre className="bg-[var(--color-bg)] p-2 rounded-lg border border-[var(--color-border)] font-mono text-[10px] mt-1.5 text-slate-400 overflow-x-auto whitespace-pre-wrap break-all">
{`VITE_DEVELOPER_TELEMETRY_TOKEN=${onboardingData.token}
VITE_DEVELOPER_CLIENT_ID=${onboardingData.clientId}`}
                      </pre>
                    </div>
                  </div>

                  <div className="p-3 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl flex gap-3 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-indigo-650/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="font-bold text-[var(--color-text)]">Configurar archivo `.firebaserc`</p>
                      <p className="text-[11px] text-[var(--color-text-muted)]">Asegúrate de vincular el proyecto correcto de Firebase en la configuración local de la CLI:</p>
                      <pre className="bg-[var(--color-bg)] p-2 rounded-lg border border-[var(--color-border)] font-mono text-[10px] mt-1.5 text-slate-400 overflow-x-auto">
{`{
  "projects": {
    "default": "${CENTRAL_CONFIG.projectId || 'firebase-project-id'}"
  }
}`}
                      </pre>
                    </div>
                  </div>

                  <div className="p-3 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl flex gap-3 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-indigo-650/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="font-bold text-[var(--color-text)]">Configurar `public/firebase-messaging-sw.js` y VAPID Key</p>
                      <p className="text-[11px] text-[var(--color-text-muted)]">Establece las credenciales correspondientes de Firebase Messaging en el Service Worker. Tu clave VAPID pública es:</p>
                      {onboardingData.vapidKey ? (
                        <div className="flex items-center gap-2 mt-1.5 bg-[var(--color-bg)] p-2 rounded-lg border border-[var(--color-border)] min-w-0">
                          <code className="text-[10px] font-mono text-indigo-400 truncate flex-1 min-w-0">{onboardingData.vapidKey}</code>
                          <button
                            type="button"
                            onClick={() => {
                              copy(onboardingData.vapidKey)
                              showToast('VAPID Key copiada', { type: 'success' })
                            }}
                            className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[9px] font-bold shrink-0 cursor-pointer"
                          >
                            Copiar
                          </button>
                        </div>
                      ) : (
                        <p className="text-[10px] text-amber-500 italic mt-1.5">No se especificó clave VAPID key en la configuración del cliente.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setOnboardingData(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Completado / Cerrar
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Overlay de Carga de Aprovisionamiento */}
      {isProvisioning && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-955/90 backdrop-blur-md animate-fade-in p-6">
          <div className="bg-slate-900/90 border border-slate-800 p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-extrabold text-slate-100">Aprovisionando Entorno</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Aprovisionando entorno local e instalando dependencias npm... por favor espera un momento.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Toast de Notificaciones */}
      <GuidedToast 
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
        actionText={toast.actionText}
        onActionClick={toast.onActionClick}
      />
    </div>
  )
}
