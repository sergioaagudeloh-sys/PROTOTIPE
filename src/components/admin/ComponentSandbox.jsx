import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAlertConfirm } from '../common/AlertConfirmContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Sliders, Eye, AlertTriangle, Info, CheckCircle, X, Check,
  Sun, Moon, Bell, ShoppingCart, Plus, Minus, Trash2, Star,
  ChevronDown, ChevronUp, Loader, Lock, User, Mail, Search,
  ToggleLeft, ToggleRight, Zap, Package, ArrowLeft,
  Receipt, ShoppingBag, Wallet, TrendingUp, BarChart3,
  ChevronRight, Save, Filter, Smartphone, RefreshCw
} from 'lucide-react';

// ─── Componentes Incrustados del Ecosistema ──────────────────────────────────

// DarkModeToggle (real, del ecosistema)
function SandboxDarkModeToggle({ isDark = false, onToggle = () => {}, className = '' }) {
  return (
    <button
      onClick={onToggle}
      className={`focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:scale-105 active:scale-95 p-2.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-center ${
        isDark
          ? 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-amber-400'
          : 'bg-white hover:bg-slate-50 border-slate-200 text-indigo-600 shadow-sm'
      } ${className}`}
      title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
    >
      <div className="transition-transform duration-500" style={{ transform: isDark ? 'rotate(360deg)' : 'rotate(0deg)' }}>
        {isDark ? <Moon size={18} /> : <Sun size={18} />}
      </div>
    </button>
  );
}

// GuidedToast (real, del ecosistema)
function SandboxGuidedToast({ isVisible, message, type = 'info', onClose, onActionClick, actionText }) {
  if (!isVisible || !message) return null;
  const config = {
    success: { bg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400', icon: <CheckCircle size={18} className="text-emerald-400" /> },
    warning: { bg: 'bg-amber-500/10 border-amber-500/25 text-amber-400', icon: <AlertTriangle size={18} className="text-amber-400" /> },
    error: { bg: 'bg-red-500/10 border-red-500/25 text-red-400', icon: <AlertTriangle size={18} className="text-red-400" /> },
    info: { bg: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400', icon: <Info size={18} className="text-indigo-400" /> },
  }[type] || { bg: 'bg-slate-900/90 border-slate-800 text-slate-100', icon: <Info size={18} /> };

  return (
    <div className={`w-full border backdrop-blur-xl p-4 rounded-2xl flex items-start gap-3 ${config.bg}`}>
      <div className="shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-xs font-bold leading-relaxed">{message}</p>
        {onActionClick && actionText && (
          <button onClick={onActionClick} className="mt-2 text-[10px] font-black uppercase tracking-wider hover:underline cursor-pointer">{actionText}</button>
        )}
      </div>
      <button onClick={onClose} className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"><X size={14} /></button>
    </div>
  );
}

// SwipeableBottomSheet (real, del ecosistema)
function SandboxSwipeableBottomSheet({ isOpen, onClose, title = '', children }) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setDragOffset(0);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchMove = (e) => {
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY > 0) setDragOffset(deltaY);
  };
  const handleTouchEnd = () => {
    if (dragOffset > 100) {
      onClose();
    } else {
      setDragOffset(0);
    }
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center">
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        style={{
          transform: isOpen ? `translateY(${dragOffset}px)` : 'translateY(100%)',
          transition: dragOffset === 0 ? 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
        }}
        className="relative w-full max-w-md bg-slate-900 border-t border-slate-800 rounded-t-[2rem] p-6 shadow-2xl flex flex-col max-h-[80vh] z-10 text-slate-100"
      >
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full py-2 cursor-grab active:cursor-grabbing shrink-0"
        >
          <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto" />
        </div>
        {title && (
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
            <h3 className="text-xs font-black tracking-wide text-slate-200">{title}</h3>
            <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:bg-slate-800 transition-all cursor-pointer"><X size={14} /></button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 scrollbar-thin text-xs leading-relaxed text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
}

// OTPInputField (real, del ecosistema)
function SandboxOTPInputField({ length = 4, onComplete = () => {}, disabled = false }) {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputsRef = useRef([]);

  useEffect(() => {
    setOtp(Array(length).fill(''));
  }, [length]);

  const handleChange = (index, value) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (!cleanValue) return;

    const newOtp = [...otp];
    newOtp[index] = cleanValue.substring(cleanValue.length - 1);
    setOtp(newOtp);

    const combinedOtp = newOtp.join('');
    if (combinedOtp.length === length) {
      onComplete(combinedOtp);
    }

    if (cleanValue && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index] === '') {
        if (index > 0) {
          newOtp[index - 1] = '';
          setOtp(newOtp);
          inputsRef.current[index - 1]?.focus();
        }
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '').substring(0, length);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < length; i++) {
        newOtp[i] = pastedData[i] || '';
      }
      setOtp(newOtp);
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputsRef.current[focusIndex]?.focus();
      if (pastedData.length === length) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div className="flex justify-center gap-2.5 w-full max-w-xs mx-auto">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={otp[idx]}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className={`w-11 h-11 sm:w-12 sm:h-12 text-center text-sm font-black bg-slate-900 border rounded-xl outline-none text-slate-100 transition-all focus:scale-105 ${
            otp[idx] ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-800'
          } focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 disabled:opacity-40 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
}

// InfiniteLogoMarquee (real, del ecosistema)
function InfiniteLogoMarquee({
  items = [],
  speed = 'fast',
  pauseOnHover = true,
  className = ''
}) {
  const speedDuration = {
    slow: '40s',
    medium: '25s',
    fast: '15s',
  }[speed] || '25s';
  const doubleItems = [...items, ...items, ...items];
  return (
    <div className={`relative w-full overflow-hidden py-4 ${className}`}>
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes customMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee-infinite {
          display: flex;
          width: max-content;
          animation: customMarquee var(--marquee-speed) linear infinite;
        }
        .marquee-container:hover .animate-marquee-infinite {
          animation-play-state: var(--marquee-hover-state, running);
        }
      `}} />
      <div 
        className="marquee-container w-full"
        style={{
          '--marquee-speed': speedDuration,
          '--marquee-hover-state': pauseOnHover ? 'paused' : 'running'
        }}
      >
        <div className="animate-marquee-infinite gap-6 flex items-center">
          {doubleItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex-shrink-0 group relative flex items-center justify-center p-5 min-w-[120px] h-16 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm hover:shadow-indigo-500/10 cursor-pointer overflow-hidden"
            >
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.alt || item.name} 
                  className="max-w-[80px] max-h-[32px] object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300 select-none pointer-events-none filter grayscale group-hover:grayscale-0"
                />
              ) : (
                <span className="text-xs font-mono font-black text-[var(--color-text-muted)] group-hover:text-indigo-400 transition-colors uppercase tracking-widest">
                  {item.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// RadialInteractiveMenu (real, del ecosistema)
const HelpIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

function RadialInteractiveMenu({
  position = 'bottom-right',
  radius = 90,
  angleRange = 90,
  startAngle = 180,
  items = [],
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  }[position] || 'bottom-6 right-6';

  return (
    <>
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/30 backdrop-blur-[2px] z-[990] transition-opacity duration-300"
        />
      )}
      <div 
        ref={menuRef} 
        className={`fixed z-[995] w-12 h-12 ${positionClasses} ${className}`}
      >
        {items.map((item, idx) => {
          const angleStep = items.length > 1 ? angleRange / (items.length - 1) : 0;
          const itemAngle = startAngle + (idx * angleStep);
          const angleInRadians = (itemAngle * Math.PI) / 180;
          const x = isOpen ? radius * Math.cos(angleInRadians) : 0;
          const y = isOpen ? radius * Math.sin(angleInRadians) : 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                item.onClick?.();
                setIsOpen(false);
              }}
              style={{
                transform: `translate(${x}px, ${y}px) scale(${isOpen ? 1 : 0})`,
                transitionDelay: `${isOpen ? idx * 45 : 0}ms`,
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
              className={`absolute w-9 h-9 left-1.5 top-1.5 flex items-center justify-center rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] hover:text-indigo-400 hover:border-indigo-500/40 shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 group z-[991] ${item.className || ''}`}
              title={item.label}
            >
              {item.icon || <HelpIcon />}
              <span className="absolute scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-900 border border-slate-800 text-[8px] font-black uppercase text-slate-100 rounded-lg px-2 py-1 -top-8 whitespace-nowrap shadow z-20 pointer-events-none">
                {item.label}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={toggleMenu}
          className={`absolute inset-0 flex items-center justify-center rounded-2xl shadow-xl hover:shadow-indigo-500/25 border border-[var(--color-border)] cursor-pointer text-white font-bold transition-all duration-300 hover:scale-105 active:scale-95 z-[992] ${
            isOpen
              ? 'bg-red-500 hover:bg-red-400 border-red-500/30 rotate-45'
              : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500/30 rotate-0'
          }`}
        >
          {isOpen ? (
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}

// HolographicTiltCard (real, del ecosistema)
function HolographicTiltCard({
  children,
  maxTilt = 15,
  perspective = 1000,
  scale = 1.02,
  className = ''
}) {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;

    const rotateX = (-yPct * maxTilt).toFixed(2);
    const rotateY = (xPct * maxTilt).toFixed(2);

    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: 'none'
    });

    const glareX = (mouseX / width * 100).toFixed(2);
    const glareY = (mouseY / height * 100).toFixed(2);

    setGlareStyle({
      opacity: 0.25,
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.4) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 80%)`,
      mixBlendMode: 'screen',
      transition: 'none'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
    });
    setGlareStyle({
      opacity: 0,
      transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className={`relative overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl transition-shadow shadow-md hover:shadow-indigo-500/10 cursor-pointer ${className}`}
    >
      <div 
        className="absolute inset-0 pointer-events-none z-10" 
        style={glareStyle} 
      />
      <div className="relative z-2">
        {children}
      </div>
    </div>
  );
}

// DatePickerPremium (real, del ecosistema)
const ChevronLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const PRESETS = [
  { id: 'today', label: 'Hoy' },
  { id: 'yesterday', label: 'Ayer' },
  { id: 'last7', label: 'Últimos 7 días' },
  { id: 'thisMonth', label: 'Este mes' },
  { id: 'lastMonth', label: 'Mes anterior' },
];

function DatePickerPremium({
  mode = 'single',
  value,
  onChange,
  disabledPast = false,
  minDate = null,
  maxDate = null,
  placeholder = 'Selecciona una fecha...',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  
  const [currentDate, setCurrentDate] = useState(() => {
    if (mode === 'single' && value instanceof Date) return new Date(value);
    if (mode === 'range' && value?.start instanceof Date) return new Date(value.start);
    return new Date();
  });

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const DAY_LABELS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, totalDaysInPrevMonth - i);
      days.push({ date: d, isCurrentMonth: false });
    }
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const d = new Date(currentYear, currentMonth, i);
      days.push({ date: d, isCurrentMonth: true });
    }
    const totalSlots = 42;
    const nextMonthSlots = totalSlots - days.length;
    for (let i = 1; i <= nextMonthSlots; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }
    return days;
  }, [currentMonth, currentYear]);

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    if (disabledPast && d < today) return true;
    if (minDate && d < new Date(minDate).setHours(0, 0, 0, 0)) return true;
    if (maxDate && d > new Date(maxDate).setHours(0, 0, 0, 0)) return true;
    return false;
  };

  const formatDateString = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const displayValue = useMemo(() => {
    if (mode === 'single') {
      return value instanceof Date ? formatDateString(value) : '';
    } else {
      if (value?.start instanceof Date && value?.end instanceof Date) {
        return `${formatDateString(value.start)} - ${formatDateString(value.end)}`;
      }
      if (value?.start instanceof Date) {
        return `${formatDateString(value.start)} - ...`;
      }
      return '';
    }
  }, [value, mode]);

  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;

    if (mode === 'single') {
      onChange(new Date(date));
      setIsOpen(false);
    } else {
      if (!value?.start || (value.start && value.end)) {
        onChange({ start: new Date(date), end: null });
      } else {
        const start = new Date(value.start);
        const end = new Date(date);
        if (end < start) {
          onChange({ start: end, end: start });
        } else {
          onChange({ start, end });
        }
      }
    }
  };

  const isDateSelected = (date) => {
    const d = new Date(date).setHours(0,0,0,0);
    if (mode === 'single') {
      return value instanceof Date && new Date(value).setHours(0,0,0,0) === d;
    } else {
      const start = value?.start instanceof Date ? new Date(value.start).setHours(0,0,0,0) : null;
      const end = value?.end instanceof Date ? new Date(value.end).setHours(0,0,0,0) : null;
      return (start && start === d) || (end && end === d);
    }
  };

  const isDateInRange = (date) => {
    if (mode !== 'range' || !value?.start || !value?.end) return false;
    const d = new Date(date).setHours(0,0,0,0);
    const start = new Date(value.start).setHours(0,0,0,0);
    const end = new Date(value.end).setHours(0,0,0,0);
    return d > start && d < end;
  };

  const applyPreset = (presetId) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    let start, end;

    switch (presetId) {
      case 'today':
        start = new Date(today);
        end = new Date(today);
        break;
      case 'yesterday':
        start = new Date(today);
        start.setDate(today.getDate() - 1);
        end = new Date(start);
        break;
      case 'last7':
        start = new Date(today);
        start.setDate(today.getDate() - 6);
        end = new Date(today);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        return;
    }
    onChange({ start, end });
    setCurrentDate(new Date(start));
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-sm ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-left bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-xs font-medium text-[var(--color-text)] hover:border-indigo-500/50 outline-none transition-all cursor-pointer shadow-sm min-h-[36px]"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="text-[var(--color-text-muted)] shrink-0"><CalendarIcon /></span>
          <span className={displayValue ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}>
            {displayValue || placeholder}
          </span>
        </div>
        <span className="text-[var(--color-text-muted)] transition-transform duration-250 shrink-0" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[999] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row max-w-[500px]">
          {mode === 'range' && (
            <div className="p-3 bg-[var(--color-surface-2)]/60 border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible shrink-0 md:w-32">
              <span className="hidden md:block text-[8px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2 px-1">Atajos</span>
              {PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className="px-2 py-1.5 text-left rounded-lg text-[9px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors shrink-0 whitespace-nowrap"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          <div className="p-4 flex-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-[var(--color-text)]">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg cursor-pointer transition-colors"
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg cursor-pointer transition-colors"
                >
                  <ChevronRightIcon />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DAY_LABELS.map(day => (
                <span key={day} className="text-[9px] font-black uppercase text-[var(--color-text-muted)] py-0.5">
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((item, idx) => {
                const isSelected = isDateSelected(item.date);
                const isInRange = isDateInRange(item.date);
                const isDisabled = isDateDisabled(item.date);
                const isCurrentMonth = item.isCurrentMonth;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleDateClick(item.date)}
                    className={`relative aspect-square flex items-center justify-center text-[10px] rounded-lg cursor-pointer select-none font-bold transition-all focus:outline-none ${
                      !isCurrentMonth ? 'text-[var(--color-text-muted)] opacity-35' : 'text-[var(--color-text)]'
                    } ${
                      isSelected
                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md hover:bg-indigo-500 rounded-lg scale-105 z-10'
                        : isInRange
                          ? 'bg-indigo-600/12 text-indigo-400 rounded-none'
                          : 'hover:bg-[var(--color-surface-2)]'
                    } ${
                      isDisabled ? 'opacity-20 pointer-events-none cross-through' : ''
                    }`}
                  >
                    <span>{item.date.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Botón Magnético Reactivo (MagneticButton)
function SandboxMagneticButton({
  children,
  onClick,
  className = '',
  range = 80,
  attraction = 0.35,
  innerAttraction = 0.18,
  variant = 'primary'
}) {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [innerPosition, setInnerPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseMove = (e) => {
      const rect = button.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;

      const distanceX = e.clientX - btnCenterX;
      const distanceY = e.clientY - btnCenterY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance < range) {
        setIsHovered(true);
        const targetX = distanceX * attraction;
        const targetY = distanceY * attraction;
        const innerTargetX = distanceX * innerAttraction;
        const innerTargetY = distanceY * innerAttraction;

        setPosition({ x: targetX, y: targetY });
        setInnerPosition({ x: innerTargetX, y: innerTargetY });
      } else {
        if (isHovered) {
          handleMouseLeave();
        }
      }
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setPosition({ x: 0, y: 0 });
      setInnerPosition({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [range, attraction, innerAttraction, isHovered]);

  const variantClasses = {
    primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-lg shadow-indigo-500/20 border-transparent',
    secondary: 'bg-[var(--color-surface-2)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-border)]',
    outline: 'bg-transparent text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
  }[variant] || 'bg-[var(--color-primary)] text-white';

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
      }}
      className={`relative inline-flex items-center justify-center px-6 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest cursor-pointer select-none active:scale-95 will-change-transform ${variantClasses} ${className}`}
    >
      <span
        className="relative block pointer-events-none will-change-transform"
        style={{
          transform: `translate3d(${innerPosition.x}px, ${innerPosition.y}px, 0)`,
          transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
        }}
      >
        {children}
      </span>
    </button>
  );
}

// SwipeableCardStack (Mazo de Tarjetas Deslizables)
function SandboxSwipeableCardStack({
  items = [],
  onSwipe = () => {},
  onEmpty = () => {},
  className = '',
  threshold = 120
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const topCardRef = useRef(null);

  const activeItem = items[currentIndex];

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    if (topCardRef.current) {
      topCardRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (topCardRef.current) {
      topCardRef.current.releasePointerCapture(e.pointerId);
    }

    if (Math.abs(dragOffset.x) > threshold) {
      const direction = dragOffset.x > 0 ? 'right' : 'left';
      swipeCard(direction);
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const swipeCard = (direction) => {
    const exitX = direction === 'right' ? 600 : -600;
    setDragOffset({ x: exitX, y: dragOffset.y });

    setTimeout(() => {
      onSwipe(direction, activeItem);
      setDragOffset({ x: 0, y: 0 });
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (nextIndex >= items.length) {
        onEmpty();
      }
    }, 200);
  };

  if (currentIndex >= items.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-[var(--color-border)] rounded-3xl h-52 text-center w-full">
        <span className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">Mazo Vacío</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full max-w-sm h-64 select-none touch-none ${className}`}>
      {currentIndex + 2 < items.length && (
        <div className="absolute inset-x-4 bottom-0 h-52 rounded-3xl bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] opacity-40 scale-90 translate-y-8 z-0 transition-all duration-300" />
      )}

      {currentIndex + 1 < items.length && (
        <div 
          style={{
            transform: isDragging 
              ? `scale(${0.95 + Math.min(Math.abs(dragOffset.x), threshold) / threshold * 0.05}) translate3d(0, ${16 - Math.min(Math.abs(dragOffset.x), threshold) / threshold * 16}px, 0)` 
              : 'scale(0.95) translate3d(0, 16px, 0)'
          }}
          className="absolute inset-x-2 bottom-0 h-52 rounded-3xl bg-[var(--color-surface-2)] border border-[var(--color-border)] opacity-85 z-10 transition-transform duration-300 pointer-events-none"
        />
      )}

      <div
        ref={topCardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${dragOffset.x * 0.08}deg)`,
          transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        className="absolute inset-x-0 top-0 h-52 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl z-20 cursor-grab active:cursor-grabbing overflow-hidden p-6 flex flex-col justify-between"
      >
        <div className="pointer-events-none h-full flex flex-col justify-between">
          {activeItem.render ? activeItem.render() : activeItem.content}
        </div>
      </div>
    </div>
  );
}

// InteractiveAmbientGlow (Fondo de Luces Orgánicas)
function SandboxInteractiveAmbientGlow({
  color1 = 'var(--color-primary)',
  color2 = 'var(--color-accent)',
  color3 = '#ec4899',
  sensitivity = 0.05,
  className = ''
}) {
  const containerRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const isPointerActiveRef = useRef(false);
  const gyroRef = useRef({ x: 0, y: 0 });
  const [glowOffset, setGlowOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!containerRef.current) return;
      isPointerActiveRef.current = true;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      mousePosRef.current = { x, y };
    };

    const handlePointerLeave = () => {
      isPointerActiveRef.current = false;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('pointermove', handlePointerMove);
      container.addEventListener('pointerleave', handlePointerLeave);
      container.addEventListener('pointerup', handlePointerLeave);
    }

    const handleOrientation = (e) => {
      if (e.beta !== null && e.gamma !== null) {
        // beta: inclinación adelante-atrás, gamma: izquierda-derecha
        const clampedGamma = Math.max(-45, Math.min(45, e.gamma));
        const clampedBeta = Math.max(-45, Math.min(45, e.beta - 45)); // Ajustado para ángulo natural de sujeción
        gyroRef.current = { x: clampedGamma, y: clampedBeta };
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      if (container) {
        container.removeEventListener('pointermove', handlePointerMove);
        container.removeEventListener('pointerleave', handlePointerLeave);
        container.removeEventListener('pointerup', handlePointerLeave);
      }
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  useEffect(() => {
    let animationFrameId;

    const updatePosition = () => {
      setGlowOffset((prev) => {
        // Decaer el puntero a 0 si no hay toque activo
        if (!isPointerActiveRef.current) {
          mousePosRef.current.x += (0 - mousePosRef.current.x) * 0.05;
          mousePosRef.current.y += (0 - mousePosRef.current.y) * 0.05;
        }

        const pointerTargetX = mousePosRef.current.x * sensitivity * 12;
        const pointerTargetY = mousePosRef.current.y * sensitivity * 12;

        const gyroTargetX = gyroRef.current.x * sensitivity * 40;
        const gyroTargetY = gyroRef.current.y * sensitivity * 40;

        const targetX = pointerTargetX + gyroTargetX;
        const targetY = pointerTargetY + gyroTargetY;

        const nextX = prev.x + (targetX - prev.x) * 0.08;
        const nextY = prev.y + (targetY - prev.y) * 0.08;
        return { x: nextX, y: nextY };
      });
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationFrameId);
  }, [sensitivity]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden bg-[var(--color-bg)] z-0 transition-colors duration-500 rounded-3xl ${className}`}
    >
      {/* Blob 1 */}
      <div 
        style={{
          transform: `translate3d(${glowOffset.x * 1.2}px, ${glowOffset.y * 1.2}px, 0)`,
        }}
        className="absolute w-64 h-64 top-[-10%] left-[5%] pointer-events-none will-change-transform z-1"
      >
        <div
          style={{
            backgroundColor: color1,
            animation: 'floatBlob1 25s ease-in-out infinite'
          }}
          className="w-full h-full rounded-full blur-[60px] opacity-45"
        />
      </div>

      {/* Blob 2 */}
      <div 
        style={{
          transform: `translate3d(${glowOffset.x * -0.9}px, ${glowOffset.y * -0.9}px, 0)`,
        }}
        className="absolute w-64 h-64 bottom-[-10%] right-[10%] pointer-events-none will-change-transform z-1"
      >
        <div
          style={{
            backgroundColor: color2,
            animation: 'floatBlob2 30s ease-in-out infinite'
          }}
          className="w-full h-full rounded-full blur-[70px] opacity-40"
        />
      </div>

      {/* Blob 3 */}
      <div 
        style={{
          transform: `translate3d(${glowOffset.y * 0.8}px, ${glowOffset.x * 0.8}px, 0)`,
        }}
        className="absolute w-48 h-48 top-[30%] left-[40%] pointer-events-none will-change-transform z-1"
      >
        <div
          style={{
            backgroundColor: color3,
            animation: 'floatBlob3 20s ease-in-out infinite'
          }}
          className="w-full h-full rounded-full blur-[50px] opacity-35"
        />
      </div>

      {/* Blur Overlay con baja opacidad de fondo para dar contraste sin tapar el brillo */}
      <div className="absolute inset-0 backdrop-blur-[40px] bg-[var(--color-bg)]/20 z-2 pointer-events-none" />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatBlob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes floatBlob2 {
          0%, 100% { transform: translate(0, 0) scale(1.1); }
          50% { transform: translate(-40px, 30px) scale(0.95); }
        }
        @keyframes floatBlob3 {
          0%, 100% { transform: translate(0, 0) scale(0.9); }
          50% { transform: translate(30px, 40px) scale(1.15); }
        }
      `}} />
    </div>
  );
}

// SandboxRaffleNumberSelector (Componente de Boletas de Rifa)
function SandboxRaffleNumberSelector({
  soldNumbers = [],
  reservedNumbers = [],
  selectedNumbers = [],
  clientDetails = {},
  color1 = 'var(--color-primary, #6366f1)',
  color2 = 'var(--color-accent, #3b82f6)',
  isAdmin = false,
  onNumberToggle = () => {},
  onAdminAction = () => {},
  onQuickPick = () => {}
}) {
  const [luckySpinning, setLuckySpinning] = useState(false);
  const [spinHighlight, setSpinHighlight] = useState(null);
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragSelectedRef = useRef(new Set());

  const numbersList = Array.from({ length: 100 }, (_, i) => {
    return i.toString().padStart(2, '0');
  });

  useEffect(() => {
    if (isAdmin) return;

    const handlePointerDown = (e) => {
      if (e.button !== 0) return;
      isDraggingRef.current = true;
      dragSelectedRef.current.clear();
      
      const cell = e.target.closest('[data-number]');
      if (cell) {
        const num = cell.getAttribute('data-number');
        if (!soldNumbers.includes(num) && !reservedNumbers.includes(num)) {
          dragSelectedRef.current.add(num);
          onNumberToggle(num);
          if (navigator.vibrate) navigator.vibrate(10);
        }
      }
    };

    const handlePointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (!element) return;
      
      const cell = element.closest('[data-number]');
      if (cell) {
        const num = cell.getAttribute('data-number');
        if (!soldNumbers.includes(num) && !reservedNumbers.includes(num) && !dragSelectedRef.current.has(num)) {
          dragSelectedRef.current.add(num);
          onNumberToggle(num);
          if (navigator.vibrate) navigator.vibrate(10);
        }
      }
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      if (container) {
        container.removeEventListener('pointerdown', handlePointerDown);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [soldNumbers, reservedNumbers, isAdmin, onNumberToggle]);

  const triggerLuckyDraw = (count = 1) => {
    if (luckySpinning) return;
    setLuckySpinning(true);

    const available = numbersList.filter(n => !soldNumbers.includes(n) && !reservedNumbers.includes(n) && !selectedNumbers.includes(n));
    if (available.length < count) {
      alert("No hay suficientes números disponibles.");
      setLuckySpinning(false);
      return;
    }

    let iterations = 0;
    const maxIterations = 20;
    const intervalTime = 60;

    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * available.length);
      setSpinHighlight(available[randomIdx]);
      iterations++;

      if (iterations >= maxIterations) {
        clearInterval(interval);
        setSpinHighlight(null);
        setLuckySpinning(false);

        const shuffled = [...available].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, count);
        selected.forEach(num => onNumberToggle(num));
      }
    }, intervalTime);
  };

  const getStatus = (num) => {
    if (soldNumbers.includes(num)) return 'sold';
    if (reservedNumbers.includes(num)) return 'reserved';
    if (selectedNumbers.includes(num)) return 'selected';
    if (luckySpinning && spinHighlight === num) return 'spinning';
    return 'available';
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-3xl text-white shadow-2xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-black tracking-tight uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Panel de Boletas
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {isAdmin ? 'Mapeo de ventas y asignación CRM' : 'Desliza o presiona para seleccionar boletas'}
          </p>
        </div>

        {!isAdmin && (
          <div className="flex items-center gap-1.5 self-end">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1">Azar:</span>
            {[1, 3, 5].map((qty) => (
              <button
                key={qty}
                onClick={() => triggerLuckyDraw(qty)}
                disabled={luckySpinning}
                className="px-2.5 py-1 text-[10px] font-black rounded-lg border border-white/5 bg-slate-950/40 hover:bg-slate-950 hover:border-white/10 transition duration-300 disabled:opacity-40"
              >
                +{qty}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="grid grid-cols-10 gap-1.5 touch-none select-none p-1.5 bg-slate-950/50 border border-white/5 rounded-2xl"
      >
        {numbersList.map((num) => {
          const status = getStatus(num);
          const detail = clientDetails[num];

          let cellClass = "";
          let cellStyle = {};

          if (status === 'sold') {
            cellClass = "bg-slate-800/40 border-slate-800 text-slate-600 cursor-pointer opacity-50";
          } else if (status === 'reserved') {
            cellClass = "bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse cursor-pointer";
          } else if (status === 'selected') {
            cellClass = "border-transparent text-white font-black scale-105";
            cellStyle = {
              background: `linear-gradient(135deg, ${color1}, ${color2})`,
              boxShadow: `0 0 12px ${color1}50`,
              animation: 'elasticPop 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            };
          } else if (status === 'spinning') {
            cellClass = "border-transparent text-white font-black scale-110";
            cellStyle = {
              background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              animation: 'elasticPop 150ms infinite'
            };
          } else {
            cellClass = "bg-slate-900/40 border-white/5 text-slate-300 hover:border-white/20 hover:scale-105 transition-all duration-200 cursor-pointer";
          }

          return (
            <div
              key={num}
              data-number={num}
              style={cellStyle}
              className={`aspect-square border flex items-center justify-center text-[11px] sm:text-xs font-bold rounded-lg relative ${cellClass}`}
              onPointerDown={() => {
                if (isAdmin && (status === 'sold' || status === 'reserved')) {
                  onAdminAction(num, 'detail', detail);
                }
              }}
            >
              {num}
              {status === 'sold' && (
                <svg className="absolute inset-0 w-full h-full text-slate-700/80 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="2" />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-5 text-[10px] font-medium text-slate-400 border-t border-white/5 pt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-slate-900/40 border border-white/10" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded" style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }} />
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-amber-500/10 border border-amber-500/30" />
          <span>Reservado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-slate-800/40 border border-slate-800 opacity-50 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-slate-700"><span className="text-[6px]">/</span></div>
          </div>
          <span>Vendido</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes elasticPop {
          0% { transform: scale(0.8); }
          70% { transform: scale(1.15); }
          100% { transform: scale(1.05); }
        }
      `}} />
    </div>
  );
}

// CommandPaletteKBar (real, del ecosistema)
function SandboxCommandPaletteKBar({ isOpen, onClose, commands = [] }) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDownGlobal = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => window.removeEventListener('keydown', handleKeyDownGlobal);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => { setSelectedIndex(0); }, [search]);

  const handleKeyDown = (e) => {
    if (filteredCommands.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const targetCmd = filteredCommands[selectedIndex];
      if (targetCmd) {
        targetCmd.action();
        onClose();
      }
    }
  };

  useEffect(() => {
    if (listRef.current) {
      const activeElement = listRef.current.children[selectedIndex];
      if (activeElement) activeElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[360px] mt-[10vh] overflow-hidden z-10 text-slate-100">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800 shrink-0">
          <Search size={16} className="text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un comando o navega..."
            className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder-slate-500"
          />
          <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[9px] font-bold text-slate-400">ESC</kbd>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1" ref={listRef}>
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => {
              const showCategory = idx === 0 || filteredCommands[idx - 1].category !== cmd.category;
              return (
                <div key={cmd.id}>
                  {showCategory && (
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-3 py-1.5 mt-2">{cmd.category}</div>
                  )}
                  <div
                    onClick={() => { cmd.action(); onClose(); }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer ${
                      selectedIndex === idx ? 'bg-indigo-600/15 text-indigo-400 font-bold' : 'text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="text-xs">{cmd.title}</span>
                    {cmd.shortcut && (
                      <span className="font-mono text-[9px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">{cmd.shortcut}</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10">
              <p className="text-xs text-slate-500">No se encontraron resultados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// InteractiveCouponBadge (real, del ecosistema)
function SandboxInteractiveCouponBadge({ onValidate, onApply, onRemove }) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isShaking, setIsShaking] = useState(false);

  const triggerConfetti = async () => {
    try {
      const module = await import('canvas-confetti');
      const confetti = module.default || module;
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.75 }, colors: ['#6366f1', '#10b981', '#f59e0b'] });
    } catch (e) {
      console.warn(e.message);
    }
  };

  const handleApply = async () => {
    const cleanCode = code.toUpperCase().trim();
    if (!cleanCode) return;
    setStatus('validating');
    setErrorMessage('');
    try {
      const result = await onValidate(cleanCode);
      if (result.success) {
        setStatus('success');
        setAppliedCoupon({ code: cleanCode, ...result });
        onApply(result);
        triggerConfetti();
      } else {
        setStatus('error');
        setErrorMessage(result.message);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Error al validar.');
    }
  };

  return (
    <div className="w-full space-y-2">
      {status === 'success' && appliedCoupon ? (
        <div className="flex items-center justify-between p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl animate-fade-in-up text-slate-100">
          <div>
            <p className="text-xs font-black text-emerald-400">🎟️ Cupón: {appliedCoupon.code}</p>
            <p className="text-[10px] text-slate-400">Descuento aplicado: -{appliedCoupon.value}%</p>
          </div>
          <button onClick={() => { setStatus('idle'); setCode(''); setAppliedCoupon(null); onRemove(); }} className="px-2 py-1 bg-slate-900 border border-slate-800 text-[10px] font-bold text-red-400 rounded-lg hover:bg-slate-800 transition-all cursor-pointer">Eliminar</button>
        </div>
      ) : (
        <div className="space-y-1">
          <div className={`flex items-center bg-slate-950 border rounded-2xl p-1 gap-2 border-slate-800 focus-within:border-indigo-500/50 ${isShaking ? 'animate-shake' : ''}`}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="CUPÓN DE PRUEBA"
              className="bg-transparent outline-none text-xs text-slate-100 placeholder-slate-650 flex-1 pl-3 uppercase"
            />
            <button onClick={handleApply} className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl cursor-pointer">Aplicar</button>
          </div>
          {status === 'error' && <p className="text-[9px] text-red-400 font-semibold pl-2">{errorMessage}</p>}
        </div>
      )}
    </div>
  );
}

// InteractiveTutorialTour (real, del ecosistema)
function SandboxInteractiveTutorialTour({ active, steps = [], onComplete = () => {} }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState(null);
  const [tooltipStyle, setTooltipStyle] = useState(null);

  useEffect(() => {
    if (!active || steps.length === 0) return;
    const updatePosition = () => {
      const step = steps[currentStep];
      const targetElement = document.querySelector(step.selector);
      if (targetElement) {
        targetElement.scrollIntoView({ block: 'center', behavior: 'smooth' });
        const rect = targetElement.getBoundingClientRect();
        const padding = 6;
        setHighlightStyle({
          left: `${rect.left + window.scrollX - padding}px`,
          top: `${rect.top + window.scrollY - padding}px`,
          width: `${rect.width + padding * 2}px`,
          height: `${rect.height + padding * 2}px`,
          position: 'absolute',
          boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.65)',
          borderRadius: '12px',
          pointerEvents: 'auto'
        });
        setTooltipStyle({
          left: `${Math.max(12, Math.min(window.innerWidth - 290, rect.left + window.scrollX))}px`,
          top: `${rect.bottom + window.scrollY + 10}px`,
          width: '260px',
          position: 'absolute',
          pointerEvents: 'auto'
        });
      } else {
        setHighlightStyle({ width: 0, height: 0, opacity: 0 });
        setTooltipStyle({ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '260px', position: 'fixed', pointerEvents: 'auto' });
      }
    };
    const timer = setTimeout(updatePosition, 300);
    return () => clearTimeout(timer);
  }, [active, currentStep, steps]);

  if (!active || steps.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] pointer-events-none">
      {highlightStyle && <div style={highlightStyle} className="border-2 border-indigo-500/40 ring-4 ring-indigo-500/10" />}
      <div style={tooltipStyle} className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 shadow-2xl flex flex-col gap-3.5 text-slate-100">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black uppercase text-indigo-400">Paso {currentStep + 1} de {steps.length}</span>
          <button onClick={onComplete} className="text-slate-500 hover:text-slate-350 cursor-pointer"><X size={12} /></button>
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-100">{steps[currentStep]?.title}</h4>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{steps[currentStep]?.content}</p>
        </div>
        <div className="flex justify-between items-center gap-2 border-t border-slate-850 pt-2.5">
          <button onClick={onComplete} className="text-[9px] font-bold text-slate-500 hover:text-slate-400 cursor-pointer">Saltar</button>
          <div className="flex gap-1">
            {currentStep > 0 && (
              <button onClick={() => setCurrentStep(p => p - 1)} className="px-2 py-1 bg-slate-800 border border-slate-700 text-[9px] font-bold rounded-lg text-slate-300">Atrás</button>
            )}
            <button onClick={() => currentStep < steps.length - 1 ? setCurrentStep(p => p + 1) : onComplete()} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-[9px] font-black rounded-lg text-white">
              {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// useDebounceValue (real, del ecosistema)
function useDebounceValue(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// StockHeatmap (real, del ecosistema)
function SandboxStockHeatmap({ stock, threshold = 5, showLabel = true, variant = 'badge' }) {
  const getStatus = () => {
    if (stock <= 0) {
      return {
        label: 'Agotado',
        colorClass: 'bg-slate-800/80 text-slate-400 border-slate-700/30',
        dotClass: 'bg-slate-500'
      };
    }
    if (stock < threshold) {
      return {
        label: `¡Solo quedan ${stock} u!`,
        colorClass: 'bg-red-500/10 text-red-400 border-red-500/25 animate-pulse',
        dotClass: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
      };
    }
    if (stock <= threshold * 2) {
      return {
        label: 'Pocas unidades',
        colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        dotClass: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
      };
    }
    return {
      label: 'Disponible',
      colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dotClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
    };
  };

  const status = getStatus();

  if (variant === 'dot') {
    return (
      <div className="flex items-center gap-1.5" title={`${status.label} (${stock} unidades)`}>
        <span className={`w-2 h-2 rounded-full transition-all ${status.dotClass}`} />
        {showLabel && <span className="text-[10px] font-bold text-[var(--color-text-muted)]">{status.label}</span>}
      </div>
    );
  }

  return (
    <div className={`px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 transition-all ${status.colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
      {showLabel && <span>{status.label}</span>}
    </div>
  );
}

// SandboxBentoGrid & BentoCard
function SandboxBentoGrid({ children, className = '' }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[160px] w-full ${className}`}>
      {children}
    </div>
  );
}

function SandboxBentoCard({ title, description, icon, colSpan = 'sm:col-span-1', rowSpan = 'row-span-1', children, className = '', cta }) {
  return (
    <div className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-4 transition-all duration-300 hover:scale-[1.01] hover:border-indigo-500/20 hover:shadow-xl ${colSpan} ${rowSpan} ${className}`}>
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/4 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-1.5">
        <div className="space-y-1">
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-indigo-400 border border-slate-700/40 group-hover:bg-indigo-600/10">
              {icon}
            </div>
          )}
          <h4 className="text-[10px] font-black text-slate-100 tracking-tight pt-1.5">{title}</h4>
          {description && (
            <p className="text-[8px] text-slate-500 leading-normal max-w-[180px]">{description}</p>
          )}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center py-2">
        {children}
      </div>
      {cta && (
        <div className="mt-1.5 flex items-center gap-0.5 text-[8px] font-black uppercase tracking-wider text-indigo-400 group-hover:translate-x-0.5 transition-transform duration-300">
          {cta}
        </div>
      )}
    </div>
  );
}

// Local useLocalStorageState implementation for sandbox
function useLocalStorageState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : (typeof defaultValue === 'function' ? defaultValue() : defaultValue);
    } catch {
      return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    }
  });
  const keyRef = useRef(key);
  keyRef.current = key;
  const setPersistedState = useCallback((value) => {
    try {
      setState((prevState) => {
        const newValue = typeof value === 'function' ? value(prevState) : value;
        window.localStorage.setItem(keyRef.current, JSON.stringify(newValue));
        return newValue;
      });
    } catch (e) {
      console.warn(e);
    }
  }, []);
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === keyRef.current && e.newValue !== null) {
        try {
          setState(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  return [state, setPersistedState];
}

// --- Componente Facturación Comisional Portable ---
function DeveloperBillingPanel({
  billingMetrics,
  isLoading = false,
  orders = [],
  config = {},
  onExportPDF = () => {},
  onClose = () => {}
}) {
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);

  const formatMoney = (value) => {
    return `$${Number(value || 0).toLocaleString('es-CO', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    })}`;
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    if (!clientX || !clientY) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    if (!clientX || !clientY) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureDataUrl = canvas.toDataURL('image/png');
    onExportPDF({ signatureDataUrl });
    setIsSignatureModalOpen(false);
  };

  const handleOpenSignature = () => {
    setIsSignatureModalOpen(true);
    setTimeout(() => {
      clearCanvas();
    }, 80);
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-900 to-teal-500/5 p-5">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/5 -translate-y-8 translate-x-8" />
        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center shrink-0">
            <Receipt size={24} className="text-emerald-500" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <p className="text-sm font-bold text-slate-100 mb-1">Módulo de Facturación</p>
              {onClose && (
                <button 
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Resumen financiero, tasas de comisiones de la plataforma y firma digital de conformidad para exportación de recibos.
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-pulse">
              <div className="h-3 bg-slate-800 rounded-full w-16 mb-3" />
              <div className="h-7 bg-slate-800 rounded-full w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ShoppingBag size={14} className="text-blue-500" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Ventas del mes</p>
            </div>
            <p className="text-xl font-black text-slate-100">{formatMoney(billingMetrics?.totalMes)}</p>
          </div>

          <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Wallet size={14} className="text-emerald-500" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Mi comisión del mes</p>
            </div>
            <p className="text-xl font-black text-emerald-500">{formatMoney(billingMetrics?.comisionMes)}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp size={14} className="text-purple-500" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Pedidos completados</p>
            </div>
            <p className="text-xl font-black text-slate-100">{billingMetrics?.pedidosMes ?? 0}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">este mes</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <BarChart3 size={14} className="text-amber-500" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Comisión acumulada</p>
            </div>
            <p className="text-xl font-black text-slate-100">{formatMoney(billingMetrics?.comisionHistorica)}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">histórico total</p>
          </div>
        </div>
      )}

      <div className="bg-slate-900 rounded-2xl border border-slate-850 overflow-hidden">
        <div className="px-5 py-4">
          <p className="text-sm font-bold text-slate-200 mb-1">Modelo de Facturación SaaS</p>
          <p className="text-xs text-slate-400 mb-4">Configuración del esquema de monetización del cliente.</p>
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-400">Método Activo:</span>
              <span className="font-bold text-emerald-500 uppercase">
                {billingMetrics?.billingMode === 'percentage' && 'Porcentaje por Venta'}
                {billingMetrics?.billingMode === 'fixed_per_service' && 'Valor Fijo por Servicio'}
                {billingMetrics?.billingMode === 'flat_monthly' && 'Pago Mensual Fijo'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-850 pt-2.5">
              <span className="font-semibold text-slate-400">Tarifa Pactada:</span>
              <span className="font-bold text-slate-200">
                {billingMetrics?.billingMode === 'percentage' && `${billingMetrics?.comisionPorcentaje}%`}
                {billingMetrics?.billingMode === 'fixed_per_service' && `${formatMoney(billingMetrics?.montoFijoServicio)} por pedido`}
                {billingMetrics?.billingMode === 'flat_monthly' && `${formatMoney(billingMetrics?.pagoMensualFijo)} al mes`}
              </span>
            </div>
            {billingMetrics?.enableDianBilling && (
              <div className="flex justify-between items-center text-xs border-t border-slate-850 pt-2.5">
                <span className="font-semibold text-slate-400">Facturación DIAN:</span>
                <span className="font-bold text-amber-500">{formatMoney(billingMetrics?.costoPorFacturaDian)} por factura</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isLoading && billingMetrics && (
        <div className="bg-slate-900 rounded-2xl border border-slate-850 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-850">
            <p className="text-sm font-bold text-slate-200">Resumen de comisiones</p>
            <p className="text-xs text-slate-400">Totales calculados sobre pedidos completados</p>
          </div>
          <div className="divide-y divide-slate-850">
            {[
              { label: 'Ventas del mes', value: formatMoney(billingMetrics.totalMes), sub: `${billingMetrics.pedidosMes} pedidos completados` },
              { label: 'Comisión del mes', value: formatMoney(billingMetrics.comisionMes), highlight: true },
              { label: 'Total ventas histórico', value: formatMoney(billingMetrics.totalHistorico), sub: 'Todos los tiempos' },
              { label: 'Comisión histórica acumulada', value: formatMoney(billingMetrics.comisionHistorica), highlight: true },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-xs font-semibold text-slate-200">{row.label}</p>
                  {row.sub && <p className="text-[10px] text-slate-400 mt-0.5">{row.sub}</p>}
                </div>
                <p className={`text-sm font-black ${row.highlight ? 'text-emerald-500' : 'text-slate-200'}`}>{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="bg-slate-900 rounded-2xl border border-slate-850 p-5 space-y-4">
          <div>
            <p className="text-sm font-bold text-slate-200 mb-1">Generar Recibo y Firma de Conformidad</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Genera el recibo de comisiones de la plataforma firmado digitalmente para su archivo legal.
            </p>
          </div>
          <button
            onClick={handleOpenSignature}
            className="w-full h-11 px-5 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer shadow-sm"
          >
            <Receipt size={16} />
            Firmar y Exportar Recibo del Mes
          </button>
        </div>
      )}

      {isSignatureModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[99999] p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSignatureModalOpen(false)}
          />
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-w-sm w-full space-y-4 z-10 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold">Firma de Conformidad</h3>
                <p className="text-[10px] text-slate-400">Dibuja la firma táctil del cliente en el recuadro</p>
              </div>
              <button 
                onClick={() => setIsSignatureModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="relative border border-slate-800 rounded-2xl overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={330}
                height={160}
                className="w-full h-[160px] block touch-none cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={clearCanvas}
                className="flex-1 h-10 border border-slate-800 hover:bg-slate-850 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} /> Limpiar
              </button>
              <button
                onClick={handleExport}
                className="flex-1 h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Save size={14} /> Confirmar y Exportar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// SandboxEmptyState (real, del ecosistema)
function SandboxEmptyState({ 
  title, 
  description, 
  icon: Icon, 
  actionLabel, 
  onAction,
  illustration: Illustration
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto">
      {/* Ilustración o Icono animado */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
        className="mb-6 relative flex items-center justify-center w-24 h-24 rounded-full bg-indigo-500/5 text-indigo-400"
      >
        {Illustration ? (
          <Illustration />
        ) : Icon ? (
          <Icon size={40} className="stroke-[1.5]" />
        ) : (
          <span className="text-4xl">📦</span>
        )}
      </motion.div>

      {/* Textos */}
      <h3 className="text-xs font-black text-[var(--color-text)] mb-1.5 uppercase tracking-wider">
        {title}
      </h3>
      <p className="text-[11px] text-[var(--color-text-muted)] mb-6 leading-relaxed max-w-[280px]">
        {description}
      </p>

      {/* Botón de acción elástico */}
      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          {actionLabel}
        </motion.button>
      )}
    </div>
  );
}

// ─── Playgrounds ─────────────────────────────────────────────────────────────

const SANDBOXES = {

  // ── DarkModeToggle ──────────────────────────────────────────────────────
  'dark_mode_toggle': () => {
    const [isDark, setIsDark] = useState(false);
    const [size, setSize] = useState('md');
    const sizes = { sm: 'p-1.5 rounded-lg', md: 'p-2.5 rounded-xl', lg: 'p-3.5 rounded-2xl' };
    return (
      <SandboxLayout
        title="DarkModeToggle"
        description="Interruptor de tema claro/oscuro con animación de rotación."
        controls={[
          { label: 'Estado', type: 'toggle', value: isDark, onChange: setIsDark, labels: ['Claro', 'Oscuro'] },
          { label: 'Tamaño', type: 'select', value: size, options: ['sm', 'md', 'lg'], onChange: setSize },
        ]}
      >
        <div className="flex flex-col items-center gap-6">
          <div className={`transition-all duration-500 ${isDark ? 'bg-slate-900 p-8 rounded-2xl' : 'bg-white p-8 rounded-2xl shadow-md'}`}>
            <SandboxDarkModeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} className={sizes[size]} />
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)] font-mono">
            isDark: <span className={isDark ? 'text-amber-400' : 'text-indigo-400'}>{String(isDark)}</span>
          </p>
        </div>
      </SandboxLayout>
    );
  },

  // ── GuidedToast ─────────────────────────────────────────────────────────
  'guided_toast': () => {
    const { showAlert } = useAlertConfirm();
    const [type, setType] = useState('success');
    const [message, setMessage] = useState('¡Operación completada exitosamente!');
    const [hasAction, setHasAction] = useState(false);
    const [visible, setVisible] = useState(true);
    return (
      <SandboxLayout
        title="GuidedToast"
        description="Notificación contextual con soporte para acciones y 4 variantes semánticas."
        controls={[
          { label: 'Tipo', type: 'select', value: type, options: ['success', 'error', 'warning', 'info'], onChange: setType },
          { label: 'Con Acción', type: 'toggle', value: hasAction, onChange: setHasAction, labels: ['No', 'Sí'] },
          { label: 'Mensaje', type: 'text', value: message, onChange: setMessage },
        ]}
      >
        <div className="space-y-4 w-full">
          <div className="flex justify-center gap-2 flex-wrap">
            {['success', 'error', 'warning', 'info'].map(t => (
              <button
                key={t}
                onClick={() => { setType(t); setVisible(true); }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all ${
                  type === t ? 'bg-indigo-600 text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]/80'
                }`}
              >{t}</button>
            ))}
          </div>
          {visible ? (
            <SandboxGuidedToast
              isVisible={true}
              message={message}
              type={type}
              onClose={() => setVisible(false)}
              onActionClick={hasAction ? () => showAlert({ title: 'Detalles', message: '¡Acción ejecutada desde el Toast Premium!', variant: 'success' }) : null}
              actionText={hasAction ? 'Ver detalles →' : ''}
            />
          ) : (
            <div className="text-center py-6">
              <button
                onClick={() => setVisible(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                Mostrar Toast
              </button>
            </div>
          )}
        </div>
      </SandboxLayout>
    );
  },

  // ── Botón Premium (Átomo Genérico) ──────────────────────────────────────
  'boton_premium': () => {
    const [variant, setVariant] = useState('primary');
    const [size, setSize] = useState('md');
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [label, setLabel] = useState('Guardar Cambios');
    const [hasIcon, setHasIcon] = useState(true);

    const variants = {
      primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30',
      secondary: 'bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-2)]/80 text-[var(--color-text)] border border-[var(--color-border)]',
      danger: 'bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30',
      ghost: 'bg-transparent hover:bg-[var(--color-surface-2)]/40 text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
      gradient: 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg',
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-[10px] rounded-lg gap-1',
      md: 'px-4 py-2.5 text-xs rounded-xl gap-1.5',
      lg: 'px-6 py-3.5 text-sm rounded-2xl gap-2',
    };

    return (
      <SandboxLayout
        title="Botón Premium"
        description="Átomo de botón con 5 variantes, 3 tamaños, estado loading/disabled e ícono opcional."
        controls={[
          { label: 'Variante', type: 'select', value: variant, options: Object.keys(variants), onChange: setVariant },
          { label: 'Tamaño', type: 'select', value: size, options: ['sm', 'md', 'lg'], onChange: setSize },
          { label: 'Con Ícono', type: 'toggle', value: hasIcon, onChange: setHasIcon, labels: ['No', 'Sí'] },
          { label: 'Loading', type: 'toggle', value: loading, onChange: setLoading, labels: ['Off', 'On'] },
          { label: 'Disabled', type: 'toggle', value: disabled, onChange: setDisabled, labels: ['Off', 'On'] },
          { label: 'Texto', type: 'text', value: label, onChange: setLabel },
        ]}
      >
        <div className="flex flex-col items-center gap-8">
          <button
            disabled={disabled || loading}
            className={`flex items-center font-bold transition-all duration-200 active:scale-95 cursor-pointer ${sizes[size]} ${variants[variant]} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
          >
            {loading
              ? <Loader size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} className="animate-spin" />
              : hasIcon && <Zap size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} />
            }
            {label}
          </button>
          <div className="flex gap-2 flex-wrap justify-center">
            {Object.keys(variants).map(v => (
              <button
                key={v}
                onClick={() => setVariant(v)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  variant === v ? 'bg-indigo-600 text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
                }`}
              >{v}</button>
            ))}
          </div>
        </div>
      </SandboxLayout>
    );
  },

  // ── Modal de Confirmación ───────────────────────────────────────────────
  'modal_confirmacion': () => {
    const [isOpen, setIsOpen] = useState(false);
    const [variant, setVariant] = useState('danger');
    const [title, setTitle] = useState('Eliminar registro');
    const [body, setBody] = useState('Esta acción es irreversible. ¿Deseas continuar?');

    const variants = {
      danger: { icon: <Trash2 size={22} className="text-red-400" />, bg: 'bg-red-600', label: 'Eliminar', ring: 'ring-red-500/30' },
      warning: { icon: <AlertTriangle size={22} className="text-amber-400" />, bg: 'bg-amber-500', label: 'Continuar', ring: 'ring-amber-500/30' },
      info: { icon: <Info size={22} className="text-indigo-400" />, bg: 'bg-indigo-600', label: 'Confirmar', ring: 'ring-indigo-500/30' },
    };
    const v = variants[variant];

    return (
      <SandboxLayout
        title="Modal de Confirmación"
        description="Modal con overlay y 3 variantes semánticas (danger, warning, info) con focus trap simulado."
        controls={[
          { label: 'Variante', type: 'select', value: variant, options: Object.keys(variants), onChange: setVariant },
          { label: 'Título', type: 'text', value: title, onChange: setTitle },
          { label: 'Cuerpo', type: 'text', value: body, onChange: setBody },
        ]}
      >
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={() => setIsOpen(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
          >
            Abrir Modal
          </button>

          {isOpen && (
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
              onClick={e => { if (e.target === e.currentTarget) setIsOpen(false); }}
            >
              <div className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-7 max-w-sm w-full mx-4 shadow-2xl ring-1 ${v.ring} animate-fade-in-up`}>
                <div className="flex items-start gap-4 mb-5">
                  <div className="p-3 bg-[var(--color-surface-2)] rounded-2xl shrink-0">{v.icon}</div>
                  <div>
                    <h3 className="font-black text-sm text-[var(--color-text)]">{title}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed">{body}</p>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-2.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-2)]/80 text-[var(--color-text-muted)] text-xs font-bold rounded-xl cursor-pointer transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`flex-1 py-2.5 ${v.bg} hover:opacity-90 text-white text-xs font-bold rounded-xl cursor-pointer transition-all`}
                  >
                    {v.label}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SandboxLayout>
    );
  },

  // ── Selector de Atributos ───────────────────────────────────────────────
  'selector_atributos': () => {
    const [selected, setSelected] = useState({});
    const [layout, setLayout] = useState('chips');
    const [multiSelect, setMultiSelect] = useState(false);
    const [openGroup, setOpenGroup] = useState(null);
    const atributos = {
      Talla: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      Color: ['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde'],
      Material: ['Algodón', 'Poliéster', 'Lana'],
    };

    const colorMap = {
      'Negro': '#1e293b', // slate-800
      'Blanco': '#ffffff',
      'Azul': '#3b82f6',
      'Rojo': '#ef4444',
      'Verde': '#10b981',
    };

    const handleSelect = (group, value) => {
      setSelected(prev => {
        if (multiSelect) {
          const curr = prev[group] || [];
          const exists = curr.includes(value);
          return { ...prev, [group]: exists ? curr.filter(v => v !== value) : [...curr, value] };
        }
        return { ...prev, [group]: prev[group] === value ? null : value };
      });
    };

    const isSelected = (group, value) => {
      const s = selected[group];
      return Array.isArray(s) ? s.includes(value) : s === value;
    };

    return (
      <SandboxLayout
        title="Selector de Atributos"
        description="Selector dinámico de variantes de producto (tallas, colores, materiales). Modo chips o dropdown."
        controls={[
          { label: 'Layout', type: 'select', value: layout, options: ['chips', 'dropdown'], onChange: setLayout },
          { label: 'Multi-select', type: 'toggle', value: multiSelect, onChange: setMultiSelect, labels: ['Off', 'On'] },
        ]}
      >
        <div className="space-y-5 w-full">
          {Object.entries(atributos).map(([group, values]) => (
            <div key={group}>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2">{group}</p>
              {layout === 'chips' ? (
                <div className="flex flex-wrap gap-2 items-center">
                  {values.map(v => {
                    const isColor = group === 'Color';
                    if (isColor) {
                      const active = isSelected(group, v);
                      const colorHex = colorMap[v];
                      return (
                        <button
                          key={v}
                          onClick={() => handleSelect(group, v)}
                          className={`w-9 h-9 rounded-full border transition-all duration-300 cursor-pointer flex items-center justify-center relative ${
                            active
                              ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/10 bg-indigo-500/5'
                              : 'border-[var(--color-border)] hover:border-indigo-500/40 hover:scale-105 bg-transparent'
                          }`}
                          title={v}
                        >
                          <span
                            style={{ backgroundColor: colorHex }}
                            className={`w-6 h-6 rounded-full border border-black/5 block transition-transform duration-300 ${
                              active ? 'scale-100' : 'scale-90 hover:scale-95'
                            }`}
                          />
                          {active && (
                            <motion.span
                              layoutId="activeColorBorder"
                              className="absolute inset-0 rounded-full border-2 border-indigo-500"
                              transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            />
                          )}
                        </button>
                      );
                    }
                    return (
                      <button
                        key={v}
                        onClick={() => handleSelect(group, v)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected(group, v)
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-indigo-500/50 hover:text-[var(--color-text)]'
                        }`}
                      >{v}</button>
                    );
                  })}
                </div>
              ) : (
                <div className="relative w-full" style={{ zIndex: openGroup === group ? 50 : 'auto' }}>
                  {/* Botón Disparador */}
                  <button
                    type="button"
                    onClick={() => setOpenGroup(current => current === group ? null : group)}
                    className="w-full h-11 pl-4 pr-10 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer flex items-center justify-between relative hover:border-indigo-500/50"
                    style={{ borderColor: openGroup === group ? 'var(--color-primary, #6366f1)' : undefined }}
                  >
                    <span className="flex items-center gap-2">
                      {group === 'Color' && selected[group] ? (
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: colorMap[selected[group]] }} />
                          <span className="font-semibold">{selected[group]}</span>
                        </div>
                      ) : (
                        <span className={selected[group] ? 'text-[var(--color-text)] font-semibold' : 'text-[var(--color-text-muted)]'}>
                          {selected[group] || `Selecciona ${group}`}
                        </span>
                      )}
                    </span>
                    <span className={`absolute right-3 text-[var(--color-text-muted)] transition-transform duration-200 ${openGroup === group ? 'rotate-180' : ''}`}>
                      <ChevronDown size={16} />
                    </span>
                  </button>

                  {/* Menú Animado Flotante */}
                  <AnimatePresence>
                    {openGroup === group && (
                      <>
                        {/* Tap-shield para capturar clics exteriores y cerrar */}
                        <div 
                          className="fixed inset-0 bg-transparent cursor-default z-[48]" 
                          onClick={() => setOpenGroup(null)} 
                        />
                        
                        {/* Lista Desplegable */}
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.97 }}
                          transition={{ duration: 0.12, ease: 'easeOut' }}
                          className="absolute left-0 right-0 mt-1.5 rounded-xl border border-[var(--color-border)] overflow-hidden shadow-xl z-[49] bg-[var(--color-surface)]"
                        >
                          <button
                            type="button"
                            onClick={() => { setSelected(p => ({ ...p, [group]: null })); setOpenGroup(null) }}
                            className="w-full px-4 py-2.5 text-left text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors border-b border-[var(--color-border)]/20 cursor-pointer"
                          >
                            Selecciona {group}
                          </button>
                          
                          {values.map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => { setSelected(p => ({ ...p, [group]: v })); setOpenGroup(null) }}
                              className={`w-full px-4 py-2.5 text-left text-xs transition-colors flex items-center justify-between cursor-pointer
                                ${selected[group] === v
                                  ? 'bg-indigo-600 text-white font-bold'
                                  : 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                                }
                              `}
                            >
                              {group === 'Color' ? (
                                <div className="flex items-center gap-2">
                                  <span className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: colorMap[v] }} />
                                  <span className={selected[group] === v ? 'text-white' : 'text-[var(--color-text)]'}>{v}</span>
                                </div>
                              ) : (
                                <span>{v}</span>
                              )}
                              {selected[group] === v && <Check size={14} className="text-white" />}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          ))}
          <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] font-mono text-[10px] text-indigo-400">
            {JSON.stringify(selected, null, 2)}
          </div>
        </div>
      </SandboxLayout>
    );
  },

  // ── Gestor de Categorías ────────────────────────────────────────────────
  'gestor_categorias': () => {
    // Diccionario de íconos SVG autocontenidos
    const SVG_ICONS = {
      Plus: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      ),
      Trash2: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      ),
      Edit2: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      ),
      Search: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
      Tag: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
      Shirt: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M20.38 3.46L16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a2 2 0 0 0 .99 1.42L7 12v7a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-7l3.15-1.42a2 2 0 0 0 .99-1.42l.58-3.47a2 2 0 0 0-1.34-2.23z" />
        </svg>
      ),
      Footprints: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M4 16v-2.38C4 11.5 5.88 9.85 6 7.07l.09-2.13A1.91 1.91 0 0 1 8.18 3.2a1.91 1.91 0 0 1 2 1.62l.6 5.1c.14 1.2-.3 2.45-1.2 3.32L8 15" />
          <path d="M12 11.5V9.12c0-2.13 1.88-3.78 2-6.56l.09-2.13A1.91 1.91 0 0 1 16.18-1.3c1 .09 1.91 1.62 2 1.62l.6 5.1c.14 1.2-.3 2.45-1.2 3.32L16 10.5" />
        </svg>
      ),
      Gem: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M6 3h12l4 6-10 12L2 9z" />
          <path d="M11 3 8 9l4 12 4-12-3-6" />
          <path d="M2 9h20" />
        </svg>
      )
    };

    const CATEGORY_ICONS = [
      { name: 'Shirt', label: 'Moda y Ropa', tags: ['ropa', 'camisa', 'moda', 'vestir'] },
      { name: 'Footprints', label: 'Calzado', tags: ['zapatos', 'tenis', 'botas', 'calzado'] },
      { name: 'Gem', label: 'Joyas y Accesorios', tags: ['joyas', 'accesorios', 'gema'] },
      { name: 'Tag', label: 'General / Oferta', tags: ['etiqueta', 'descuento', 'general'] }
    ];

    const [categories, setCategories] = useState([
      { id: '1', nombre: 'Calzado', iconName: 'Footprints' },
      { id: '2', nombre: 'Camisetas', iconName: 'Shirt' },
      { id: '3', nombre: 'Accesorios', iconName: 'Gem' }
    ]);

    const [nombre, setNombre] = useState('');
    const [iconName, setIconName] = useState('Tag');
    const [editingId, setEditingId] = useState(null);
    const [searchTermIcon, setSearchTermIcon] = useState('');

    const filteredIcons = useMemo(() => {
      const term = searchTermIcon.toLowerCase().trim();
      if (!term) return CATEGORY_ICONS;
      return CATEGORY_ICONS.filter(icon => 
        icon.name.toLowerCase().includes(term) ||
        icon.label.toLowerCase().includes(term) ||
        icon.tags.some(tag => tag.includes(term))
      );
    }, [searchTermIcon]);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!nombre.trim()) return;

      if (editingId) {
        setCategories(prev => prev.map(cat => cat.id === editingId ? { ...cat, nombre: nombre.trim(), iconName } : cat));
        setEditingId(null);
      } else {
        setCategories(prev => [...prev, { id: String(Date.now()), nombre: nombre.trim(), iconName }]);
      }
      setNombre('');
      setIconName('Tag');
      setSearchTermIcon('');
    };

    const handleEdit = (cat) => {
      setEditingId(cat.id);
      setNombre(cat.nombre);
      setIconName(cat.iconName || 'Tag');
    };

    const handleDelete = (id) => {
      setCategories(prev => prev.filter(cat => cat.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setNombre('');
        setIconName('Tag');
      }
    };

    const handleCancel = () => {
      setEditingId(null);
      setNombre('');
      setIconName('Tag');
      setSearchTermIcon('');
    };

    const TagIcon = SVG_ICONS.Tag;
    const SearchIcon = SVG_ICONS.Search;
    const PlusIcon = SVG_ICONS.Plus;

    return (
      <SandboxLayout
        title="Gestor de Categorías (CategoryManager)"
        description="Administrador interactivo de categorías con selector integrado de iconos SVG nativos."
        controls={[
          { label: 'Total Cat.', type: 'number', value: String(categories.length), onChange: () => {} }
        ]}
      >
        <div className="bg-[var(--color-surface)] rounded-2xl p-4 border border-[var(--color-border)] shadow-sm space-y-4 w-full">
          <h2 className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
            <TagIcon className="w-4 h-4 text-indigo-500" /> Categorías del Catálogo
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Camisetas, Jeans..."
                className="flex-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 h-9 text-xs text-[var(--color-text)] focus:outline-none focus:border-indigo-500 transition-colors placeholder-[var(--color-text-muted)]/50"
              />
              {editingId ? (
                <div className="flex gap-1">
                  <button type="submit" className="h-9 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all text-[10px] cursor-pointer">Guardar</button>
                  <button type="button" onClick={handleCancel} className="h-9 px-3 bg-[var(--color-surface-2)] text-[var(--color-text)] rounded-xl font-bold transition-all text-[10px] cursor-pointer">X</button>
                </div>
              ) : (
                <button type="submit" disabled={!nombre.trim()} className="h-9 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-1 transition-all text-[10px] disabled:opacity-50 cursor-pointer">
                  <PlusIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Icono de la Categoría</label>
                <span className="text-[8px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full">
                  {CATEGORY_ICONS.find(i => i.name === iconName)?.label || iconName}
                </span>
              </div>

              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  value={searchTermIcon}
                  onChange={(e) => setSearchTermIcon(e.target.value)}
                  placeholder="Buscar ícono..."
                  className="w-full h-7 pl-7 pr-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-4 gap-1 p-1.5 bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] max-h-24 overflow-y-auto no-scrollbar">
                {filteredIcons.map(({ name, label }) => {
                  const IconComp = SVG_ICONS[name] || SVG_ICONS.Tag;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setIconName(name)}
                      className={`h-7 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                        iconName === name
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-indigo-500/40'
                      }`}
                      title={label}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </form>

          <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
            {categories.map(cat => {
              const IconComp = SVG_ICONS[cat.iconName] || SVG_ICONS.Tag;
              return (
                <div key={cat.id} className="flex items-center justify-between p-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-7 h-7 rounded-lg bg-[var(--color-surface)] flex items-center justify-center text-indigo-500 border border-[var(--color-border)]">
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-[var(--color-text)] text-xs truncate">{cat.nombre}</span>
                  </div>
                  <div className="flex gap-0.5">
                    <button onClick={() => handleEdit(cat)} className="w-6 h-6 rounded flex items-center justify-center text-[var(--color-text-muted)] hover:text-indigo-400 cursor-pointer">
                      <SVG_ICONS.Edit2 className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="w-6 h-6 rounded flex items-center justify-center text-[var(--color-text-muted)] hover:text-red-400 cursor-pointer">
                      <SVG_ICONS.Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SandboxLayout>
    );
  },

  // ── Campo de Input Premium ──────────────────────────────────────────────
  'input_premium': () => {
    const [value, setValue] = useState('');
    const [type, setType] = useState('text');
    const [hasLabel, setHasLabel] = useState(true);
    const [hasIcon, setHasIcon] = useState(true);
    const [error, setError] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [placeholder, setPlaceholder] = useState('Escribe algo aquí...');

    const icons = { text: <User size={14} />, email: <Mail size={14} />, password: <Lock size={14} />, search: <Search size={14} /> };

    return (
      <SandboxLayout
        title="Input Premium"
        description="Campo de entrada con validación visual, ícono contextual y soporte para múltiples tipos."
        controls={[
          { label: 'Tipo', type: 'select', value: type, options: ['text', 'email', 'password', 'search'], onChange: setType },
          { label: 'Con Label', type: 'toggle', value: hasLabel, onChange: setHasLabel, labels: ['No', 'Sí'] },
          { label: 'Con Ícono', type: 'toggle', value: hasIcon, onChange: setHasIcon, labels: ['No', 'Sí'] },
          { label: 'Error', type: 'toggle', value: error, onChange: setError, labels: ['Off', 'On'] },
          { label: 'Disabled', type: 'toggle', value: disabled, onChange: setDisabled, labels: ['Off', 'On'] },
        ]}
      >
        <div className="w-full space-y-2">
          {hasLabel && <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Campo de entrada</label>}
          <div className={`flex items-center gap-2.5 bg-[var(--color-surface)] border rounded-xl px-3.5 py-2.5 transition-all ${
            error ? 'border-red-500/60 focus-within:ring-1 focus-within:ring-red-500/40' :
            disabled ? 'border-[var(--color-border)] opacity-50' :
            'border-[var(--color-border)] focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/20'
          }`}>
            {hasIcon && <span className="text-[var(--color-text-muted)] shrink-0">{icons[type]}</span>}
            <input
              type={type}
              value={value}
              onChange={e => setValue(e.target.value)}
              disabled={disabled}
              placeholder={placeholder}
              className="bg-transparent outline-none text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] w-full disabled:cursor-not-allowed"
            />
            {value && !disabled && (
              <button onClick={() => setValue('')} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"><X size={12} /></button>
            )}
          </div>
          {error && <p className="text-[10px] text-red-400 font-semibold">Este campo es requerido.</p>}
          <p className="text-[10px] text-[var(--color-text-muted)] font-mono">value: "{value}"</p>
        </div>
      </SandboxLayout>
    );
  },

  // ── Contador de Cantidad ────────────────────────────────────────────────
  'contador_cantidad': () => {
    const [qty, setQty] = useState(1);
    const [min, setMin] = useState(1);
    const [max, setMax] = useState(10);
    const [size, setSize] = useState('md');

    const sizes = { sm: 'p-1', md: 'p-2', lg: 'p-3' };
    const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

    const increment = () => setQty(q => Math.min(q + 1, max));
    const decrement = () => setQty(q => Math.max(q - 1, min));

    return (
      <SandboxLayout
        title="Contador de Cantidad"
        description="Selector numérico con límites min/max, validación y 3 tamaños. Usado en carrito y pedidos."
        controls={[
          { label: 'Mínimo', type: 'number', value: min, onChange: v => { setMin(Number(v)); if (qty < Number(v)) setQty(Number(v)); } },
          { label: 'Máximo', type: 'number', value: max, onChange: v => { setMax(Number(v)); if (qty > Number(v)) setQty(Number(v)); } },
          { label: 'Tamaño', type: 'select', value: size, options: ['sm', 'md', 'lg'], onChange: setSize },
        ]}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={decrement}
              disabled={qty <= min}
              className={`${sizes[size]} px-3 hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-[var(--color-text)]`}
            ><Minus size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} /></button>
            <span className={`${textSizes[size]} font-black text-[var(--color-text)] px-4 tabular-nums min-w-[3ch] text-center`}>{qty}</span>
            <button
              onClick={increment}
              disabled={qty >= max}
              className={`${sizes[size]} px-3 hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-[var(--color-text)]`}
            ><Plus size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} /></button>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs font-mono text-[var(--color-text-muted)]">qty: <span className="text-indigo-400 font-bold">{qty}</span></p>
            <div className="flex gap-1 justify-center">
              {Array.from({ length: max - min + 1 }, (_, i) => i + min).map(n => (
                <div key={n} className={`w-1.5 h-1.5 rounded-full transition-all ${n <= qty ? 'bg-indigo-500' : 'bg-[var(--color-surface-2)]'}`} />
              ))}
            </div>
          </div>
        </div>
      </SandboxLayout>
    );
  },

  // ── Stepper de Seguimiento de Pedidos ──────────────────────────────────
  'stepper_pedidos': () => {
    const STEPS = [
      { id: 0, label: 'Recibido', icon: '📥', desc: 'Pedido registrado en el sistema.' },
      { id: 1, label: 'Alistamiento', icon: '📦', desc: 'Preparando los productos del pedido.' },
      { id: 2, label: 'En Ruta', icon: '🚚', desc: 'El pedido está en camino al cliente.' },
      { id: 3, label: 'Entregado', icon: '✅', desc: 'Entrega confirmada exitosamente.' },
    ];
    const [active, setActive] = useState(1);
    const [cancelled, setCancelled] = useState(false);

    return (
      <SandboxLayout
        title="Stepper de Seguimiento de Pedidos"
        description="Línea de tiempo reactiva de 4 hitos operativos. Soporta cancelaciones y microanimaciones."
        controls={[
          { label: 'Paso activo', type: 'select', value: String(active), options: ['0', '1', '2', '3'], onChange: v => { setActive(Number(v)); setCancelled(false); } },
          { label: 'Cancelado', type: 'toggle', value: cancelled, onChange: v => { setCancelled(v); if (v) setActive(0); }, labels: ['No', 'Sí'] },
        ]}
      >
        <div className="w-full space-y-4">
          {/* Timeline visual */}
          <div className="flex items-center w-full">
            {STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base border-2 transition-all ${
                    cancelled && idx === 0 ? 'border-red-500 bg-red-500/10 text-red-400' :
                    idx < active ? 'border-indigo-500 bg-indigo-600 text-white' :
                    idx === active ? 'border-indigo-500 bg-indigo-600/20 text-indigo-400 ring-2 ring-indigo-500/30' :
                    'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
                  }`}>
                    {cancelled && idx === 0 ? '❌' : step.icon}
                  </div>
                  <span className={`text-[9px] font-bold text-center leading-tight ${
                    idx === active && !cancelled ? 'text-indigo-400' : 'text-[var(--color-text-muted)]'
                  }`}>{cancelled && idx === 0 ? 'Cancelado' : step.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 transition-all duration-500 ${
                    cancelled ? 'bg-red-500/20' :
                    idx < active ? 'bg-indigo-500' : 'bg-[var(--color-border)]'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          {/* Descripción del paso activo */}
          {!cancelled && (
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
              <p className="text-[10px] font-semibold text-indigo-400">{STEPS[active]?.desc}</p>
            </div>
          )}
          {cancelled && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
              <p className="text-[10px] font-semibold text-red-400">Pedido cancelado por el administrador.</p>
            </div>
          )}
          {/* Navegación rápida */}
          <div className="flex gap-2 justify-center">
            <button onClick={() => { setActive(a => Math.max(0, a - 1)); setCancelled(false); }} disabled={active <= 0 || cancelled}
              className="px-3 py-1.5 text-[10px] font-bold bg-[var(--color-surface-2)] text-[var(--color-text-muted)] rounded-xl cursor-pointer disabled:opacity-30 hover:bg-[var(--color-surface-2)]/80 transition-all">
              ← Atrás
            </button>
            <button onClick={() => { setActive(a => Math.min(3, a + 1)); setCancelled(false); }} disabled={active >= 3 || cancelled}
              className="px-3 py-1.5 text-[10px] font-bold bg-indigo-600 text-white rounded-xl cursor-pointer disabled:opacity-30 hover:bg-indigo-500 transition-all">
              Siguiente →
            </button>
          </div>
        </div>
      </SandboxLayout>
    );
  },

  // ── Paginación ──────────────────────────────────────────────────────────
  'paginacion': () => {
    const [page, setPage] = useState(3);
    const [total, setTotal] = useState(10);
    const [showEllipsis, setShowEllipsis] = useState(true);

    const getPages = () => {
      const pages = [];
      const delta = 1;
      for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= page - delta && i <= page + delta)) {
          pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
          if (showEllipsis) pages.push('...');
        }
      }
      return pages;
    };

    return (
      <SandboxLayout
        title="Paginación Fluida"
        description="Paginador adaptativo con elipsis y navegación por página. Responsive a cualquier total."
        controls={[
          { label: 'Total págs.', type: 'number', value: total, onChange: v => { setTotal(Math.max(1, Number(v))); setPage(1); } },
          { label: 'Página', type: 'number', value: page, onChange: v => setPage(Math.min(Math.max(1, Number(v)), total)) },
          { label: 'Elipsis', type: 'toggle', value: showEllipsis, onChange: setShowEllipsis, labels: ['No', 'Sí'] },
        ]}
      >
        <div className="space-y-4 w-full">
          <div className="flex items-center justify-center gap-1 flex-wrap">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-2.5 py-1.5 text-[10px] font-bold bg-[var(--color-surface-2)] text-[var(--color-text-muted)] rounded-lg cursor-pointer disabled:opacity-30 hover:bg-[var(--color-surface-2)]/80 transition-all">
              ‹
            </button>
            {getPages().map((p, idx) => (
              p === '...'
                ? <span key={`el-${idx}`} className="px-1 text-[10px] text-[var(--color-text-muted)]">…</span>
                : <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                      p === page ? 'bg-indigo-600 text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]/80'
                    }`}>
                    {p}
                  </button>
            ))}
            <button onClick={() => setPage(p => Math.min(total, p + 1))} disabled={page === total}
              className="px-2.5 py-1.5 text-[10px] font-bold bg-[var(--color-surface-2)] text-[var(--color-text-muted)] rounded-lg cursor-pointer disabled:opacity-30 hover:bg-[var(--color-surface-2)]/80 transition-all">
              ›
            </button>
          </div>
          <p className="text-center text-[10px] text-[var(--color-text-muted)] font-mono">
            Página <span className="text-indigo-400 font-bold">{page}</span> de <span className="text-indigo-400 font-bold">{total}</span>
          </p>
        </div>
      </SandboxLayout>
    );
  },

  // ── Tarjeta de Producto ─────────────────────────────────────────────────
  'tarjeta_producto': () => {
    const [layout, setLayout] = useState('grid');
    const [isPromo, setIsPromo] = useState(false);
    const [outOfStock, setOutOfStock] = useState(false);
    const [isFav, setIsFav] = useState(false);
    const [loading, setLoading] = useState(false);

    const product = { name: 'Camiseta Premium Oversize', price: 89900, originalPrice: 120000, image: null };

    return (
      <SandboxLayout
        title="Tarjeta de Producto"
        description="Tarjeta adaptativa con layout grid/list, glow de neón para promociones, favoritos y estado de agotado."
        controls={[
          { label: 'Layout', type: 'select', value: layout, options: ['grid', 'list'], onChange: setLayout },
          { label: 'Promoción', type: 'toggle', value: isPromo, onChange: setIsPromo, labels: ['No', 'Sí'] },
          { label: 'Agotado', type: 'toggle', value: outOfStock, onChange: setOutOfStock, labels: ['No', 'Sí'] },
          { label: 'Skeleton', type: 'toggle', value: loading, onChange: setLoading, labels: ['Off', 'On'] },
        ]}
      >
        {loading ? (
          // Skeleton shimmer
          <div className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden ${layout === 'list' ? 'flex gap-3 p-3' : 'p-0'}`}>
            <div className={`bg-slate-800 animate-pulse ${layout === 'list' ? 'w-20 h-20 rounded-xl shrink-0' : 'w-full h-40 rounded-t-2xl'}`} />
            <div className={`space-y-2 ${layout === 'list' ? 'flex-1 py-1' : 'p-3'}`}>
              <div className="h-3 bg-slate-800 rounded animate-pulse w-3/4" />
              <div className="h-2.5 bg-slate-800 rounded animate-pulse w-1/2" />
              <div className="h-5 bg-slate-800 rounded animate-pulse w-1/3" />
            </div>
          </div>
        ) : (
          <div className={`bg-[var(--color-surface)] border rounded-2xl overflow-hidden transition-all ${
            isPromo ? 'border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-[var(--color-border)]'
          } ${outOfStock ? 'grayscale opacity-70' : ''} ${layout === 'list' ? 'flex gap-3 p-3 items-center' : ''}`}>
            {/* Imagen */}
            <div className={`bg-gradient-to-br from-indigo-900/30 to-violet-900/30 flex items-center justify-center relative ${layout === 'list' ? 'w-20 h-20 rounded-xl shrink-0' : 'h-40'}`}>
              <span className="text-4xl">{outOfStock ? '😔' : isPromo ? '🔥' : '👕'}</span>
              {isPromo && !outOfStock && <span className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-lg">-25%</span>}
              <button onClick={() => setIsFav(!isFav)} className="absolute top-2 right-2 cursor-pointer">
                <Star size={14} className={isFav ? 'text-amber-400 fill-amber-400' : 'text-slate-500'} />
              </button>
              {outOfStock && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><span className="text-[10px] font-black text-white bg-black/60 px-2 py-1 rounded-lg">AGOTADO</span></div>}
            </div>
            {/* Info */}
            <div className={`${layout === 'list' ? 'flex-1' : 'p-3'}`}>
              <p className="text-xs font-bold text-[var(--color-text)] line-clamp-1">{product.name}</p>
              {isPromo && <p className="text-[9px] text-[var(--color-text-muted)] line-through">${product.originalPrice.toLocaleString('es-CO')}</p>}
              <p className={`text-sm font-black mt-0.5 ${isPromo ? 'text-indigo-400' : 'text-[var(--color-text)]'}`}>
                ${product.price.toLocaleString('es-CO')}
              </p>
              {!outOfStock && layout !== 'list' && (
                <button className="mt-2 w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-xl cursor-pointer transition-all">
                  Agregar al Carrito
                </button>
              )}
            </div>
          </div>
        )}
      </SandboxLayout>
    );
  },

  // ── Tarjeta de Pedido Admin ─────────────────────────────────────────────
  'tarjeta_pedido_admin': () => {
    const [status, setStatus] = useState('pendiente');
    const [expanded, setExpanded] = useState(false);

    const statuses = {
      pendiente: { label: 'Pendiente', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
      en_preparacion: { label: 'En Preparación', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
      en_ruta: { label: 'En Ruta', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
      entregado: { label: 'Entregado', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
      cancelado: { label: 'Cancelado', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
    };
    const st = statuses[status];

    return (
      <SandboxLayout
        title="Tarjeta de Pedido Admin"
        description="Tarjeta colapsable para gestión de pedidos en panel admin. Incluye chip de estado y acciones rápidas."
        controls={[
          { label: 'Estado', type: 'select', value: status, options: Object.keys(statuses), onChange: setStatus },
          { label: 'Expandida', type: 'toggle', value: expanded, onChange: setExpanded, labels: ['No', 'Sí'] },
        ]}
      >
        <div className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
          {/* Header colapsable */}
          <button onClick={() => setExpanded(!expanded)} className="w-full p-3 flex items-center justify-between gap-2 hover:bg-[var(--color-surface-2)]/40 transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-600/20 rounded-xl flex items-center justify-center text-sm font-black text-indigo-400">#</div>
              <div className="text-left">
                <p className="text-xs font-bold text-[var(--color-text)]">Pedido #A1B2C</p>
                <p className="text-[9px] text-[var(--color-text-muted)]">Carlos Gómez · 3 items</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${st.color}`}>{st.label}</span>
              <ChevronDown size={12} className={`text-[var(--color-text-muted)] transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </div>
          </button>
          {/* Panel expandido */}
          {expanded && (
            <div className="border-t border-[var(--color-border)] p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div><p className="text-[var(--color-text-muted)]">Total</p><p className="font-bold text-[var(--color-text)]">$125.000</p></div>
                <div><p className="text-[var(--color-text-muted)]">Dirección</p><p className="font-bold text-[var(--color-text)]">Cra 15 #45-23</p></div>
              </div>
              <div className="flex gap-1.5">
                <button className="flex-1 py-1.5 bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold rounded-xl cursor-pointer hover:bg-emerald-600/20 transition-all">✓ Completar</button>
                <button className="flex-1 py-1.5 bg-red-600/10 border border-red-500/30 text-red-400 text-[9px] font-bold rounded-xl cursor-pointer hover:bg-red-600/20 transition-all">✕ Cancelar</button>
                <button className="px-2.5 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-[9px] font-bold rounded-xl cursor-pointer hover:bg-[var(--color-surface-2)]/80 transition-all">📱 WA</button>
              </div>
            </div>
          )}
        </div>
      </SandboxLayout>
    );
  },

  // ── Carrusel de Anuncios ────────────────────────────────────────────────
  'carrusel_anuncios': () => {
    const [active, setActive] = useState(0);
    const [autoPlay, setAutoPlay] = useState(false);
    const [mode, setMode] = useState('gradient');

    const banners = [
      { title: '🔥 Sale de Temporada', desc: 'Hasta 40% de descuento en toda la tienda', color: 'from-indigo-600 to-violet-600' },
      { title: '🚚 Envío Gratis', desc: 'En pedidos mayores a $80.000', color: 'from-emerald-600 to-teal-600' },
      { title: '⭐ Nuevos Productos', desc: 'Descubre lo último de nuestra colección', color: 'from-amber-500 to-orange-600' },
    ];

    React.useEffect(() => {
      if (!autoPlay) return;
      const t = setInterval(() => setActive(a => (a + 1) % banners.length), 2000);
      return () => clearInterval(t);
    }, [autoPlay]);

    const b = banners[active];

    return (
      <SandboxLayout
        title="Carrusel de Anuncios Promocionales"
        description="Hero banner con auto-rotación, glow pulsante, 3 modos de fondo y navegación por dots y flechas."
        controls={[
          { label: 'Auto-play', type: 'toggle', value: autoPlay, onChange: setAutoPlay, labels: ['Off', 'On'] },
          { label: 'Modo', type: 'select', value: mode, options: ['gradient', 'dark', 'light'], onChange: setMode },
        ]}
      >
        <div className="w-full space-y-3">
          {/* Banner */}
          <div className={`relative rounded-2xl overflow-hidden h-28 flex items-center px-5 transition-all duration-500 ${
            mode === 'gradient' ? `bg-gradient-to-r ${b.color}` :
            mode === 'dark' ? 'bg-slate-900 border border-slate-800' :
            'bg-white border border-slate-200'
          }`}>
            <div className="relative z-10">
              <p className={`text-sm font-black ${mode === 'light' ? 'text-slate-900' : 'text-white'}`}>{b.title}</p>
              <p className={`text-[10px] mt-0.5 ${mode === 'light' ? 'text-slate-600' : 'text-white/75'}`}>{b.desc}</p>
              <button className={`mt-2 px-3 py-1 text-[10px] font-black rounded-xl cursor-pointer transition-all ${
                mode === 'light' ? 'bg-indigo-600 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
              }`}>Ver más</button>
            </div>
            {/* Decoración */}
            {mode === 'gradient' && <div className="absolute right-5 text-5xl opacity-30">🛍️</div>}
          </div>
          {/* Navegación */}
          <div className="flex items-center justify-between">
            <button onClick={() => setActive(a => (a - 1 + banners.length) % banners.length)}
              className="p-1.5 bg-[var(--color-surface-2)] rounded-lg text-[var(--color-text-muted)] cursor-pointer hover:bg-[var(--color-surface-2)]/80 text-xs">‹</button>
            <div className="flex gap-1.5">
              {banners.map((_, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`rounded-full cursor-pointer transition-all ${active === i ? 'w-5 h-2 bg-indigo-500' : 'w-2 h-2 bg-[var(--color-border)] hover:bg-indigo-400/50'}`} />
              ))}
            </div>
            <button onClick={() => setActive(a => (a + 1) % banners.length)}
              className="p-1.5 bg-[var(--color-surface-2)] rounded-lg text-[var(--color-text-muted)] cursor-pointer hover:bg-[var(--color-surface-2)]/80 text-xs">›</button>
          </div>
        </div>
      </SandboxLayout>
    );
  },

  // ── SwipeableBottomSheet ────────────────────────────────────────────────
  'swipeable_bottom_sheet': () => {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('Detalles del Servicio');
    return (
      <SandboxLayout
        title="SwipeableBottomSheet"
        description="Panel táctil inferior responsivo diseñado para pantallas móviles. Arrastra la barra hacia abajo para cerrar."
        controls={[
          { label: 'Título', type: 'text', value: title, onChange: setTitle },
        ]}
      >
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={() => setIsOpen(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
          >
            Abrir Panel Deslizable
          </button>

          <SandboxSwipeableBottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} title={title}>
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Este es el área de contenido del Bottom Sheet con scroll independiente. Se adapta de forma elástica al arrastre.</p>
              <div className="h-20 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-center font-black text-indigo-400">Sección de Variantes</div>
              <div className="h-20 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-center font-black text-indigo-400">Métodos de Pago</div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                Aceptar y Continuar
              </button>
            </div>
          </SandboxSwipeableBottomSheet>
        </div>
      </SandboxLayout>
    );
  },

  // ── OTPInputField ───────────────────────────────────────────────────────
  'otp_input_field': () => {
    const [length, setLength] = useState('4');
    const [disabled, setDisabled] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    return (
      <SandboxLayout
        title="OTPInputField"
        description="Campo de entrada especializado de 4 o 6 dígitos numéricos. Maneja pegado directo y retroceso inteligente."
        controls={[
          { label: 'Dígitos', type: 'select', value: length, options: ['4', '6'], onChange: setLength },
          { label: 'Deshabilitado', type: 'toggle', value: disabled, onChange: setDisabled },
        ]}
      >
        <div className="space-y-5 w-full">
          <SandboxOTPInputField
            key={`${length}-${disabled}`}
            length={Number(length)}
            disabled={disabled}
            onComplete={(code) => setOtpCode(code)}
          />
          <div className="text-center">
            {otpCode ? (
              <p className="text-xs text-emerald-400 font-bold">Código Completado: <span className="font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">{otpCode}</span></p>
            ) : (
              <p className="text-xs text-slate-500">Ingresa el código OTP para verificar</p>
            )}
          </div>
        </div>
      </SandboxLayout>
    );
  },

  // ── CommandPaletteKBar ──────────────────────────────────────────────────
  'command_palette_kbar': () => {
    const { showAlert } = useAlertConfirm();
    const [isOpen, setIsOpen] = useState(false);
    const mockCommands = [
      { id: '1', title: 'Ir al CRM de Clientes', category: 'Navegación', action: () => showAlert({ title: 'Navegación', message: 'Redirección simulada al CRM de Clientes.', variant: 'info' }), shortcut: 'G + C' },
      { id: '2', title: 'Ver Facturación Comisional', category: 'Navegación', action: () => showAlert({ title: 'Navegación', message: 'Redirección simulada a Facturación Comisional.', variant: 'info' }), shortcut: 'G + B' },
      { id: '3', title: 'Crear Nuevo Producto', category: 'Acciones', action: () => showAlert({ title: 'Acción Ejecutada', message: 'Formulario de Creación de Producto abierto en segundo plano.', variant: 'success' }), shortcut: 'N + P' },
      { id: '4', title: 'Ver Diagnóstico de Latencia', category: 'Sistema', action: () => showAlert({ title: 'Diagnóstico de Red', message: 'Latencia central: 24ms (Excelente)\nFirestore: Conectado\nStorage: Conectado', variant: 'success' }), shortcut: 'D + P' }
    ];
    return (
      <SandboxLayout
        title="CommandPaletteKBar"
        description="Barra de búsqueda flotante de comandos globales. Presiona el botón o usa CMD+K / CTRL+K para probar."
        controls={[]}
      >
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={() => setIsOpen(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
          >
            Abrir Paleta de Comandos
          </button>
          <p className="text-[10px] text-slate-500 font-mono">O presiona Ctrl+K / Cmd+K en tu teclado.</p>

          <SandboxCommandPaletteKBar isOpen={isOpen} onClose={() => setIsOpen(false)} commands={mockCommands} />
        </div>
      </SandboxLayout>
    );
  },

  // ── InteractiveCouponBadge ──────────────────────────────────────────────
  'interactive_coupon_badge': () => {
    const [discount, setDiscount] = useState(0);
    const mockValidate = async (code) => {
      await new Promise(r => setTimeout(r, 600));
      if (code === 'BIENVENIDO10') return { success: true, value: 10, type: 'percent' };
      if (code === 'GLAMOUR20') return { success: true, value: 20, type: 'percent' };
      return { success: false, message: 'Cupón inválido, vencido o expirado' };
    };
    return (
      <SandboxLayout
        title="InteractiveCouponBadge"
        description="Campo de cupones con validación simulada. Escribe 'BIENVENIDO10' o 'GLAMOUR20' para activar el confeti."
        controls={[]}
      >
        <div className="space-y-4 w-full">
          <SandboxInteractiveCouponBadge
            onValidate={mockValidate}
            onApply={(res) => setDiscount(res.value)}
            onRemove={() => setDiscount(0)}
          />
          <div className="text-center font-mono text-[10px] text-slate-400">
            Descuento actual en caja: <span className="text-indigo-400 font-black">{discount}%</span>
          </div>
        </div>
      </SandboxLayout>
    );
  },

  // ── InteractiveTutorialTour ─────────────────────────────────────────────
  'interactive_tutorial_tour': () => {
    const { showAlert } = useAlertConfirm();
    const [active, setActive] = useState(false);
    const steps = [
      { selector: 'h1', title: 'Título Principal', content: 'Este es el título de la biblioteca de componentes. Organiza todo el catálogo.' },
      { selector: '.grid-cols-2', title: 'Playgrounds del Sandbox', content: 'Aquí puedes seleccionar directamente las demos jugables activas.' },
      { selector: 'button', title: 'Botón de Inicialización', content: 'Presiona este botón en cualquier momento para reiniciar la guía de inducción.' }
    ];
    return (
      <SandboxLayout
        title="InteractiveTutorialTour"
        description="Guía de onboarding paso a paso que resalta y enfoca elementos específicos del DOM."
        controls={[]}
      >
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={() => setActive(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
          >
            Iniciar Tour de Prueba
          </button>
          <SandboxInteractiveTutorialTour
            active={active}
            steps={steps}
            onComplete={() => { setActive(false); showAlert({ title: '¡Onboarding Completado!', message: '¡Has recorrido exitosamente el tour guiado interactivo de inducción!', variant: 'success' }); }}
          />
        </div>
      </SandboxLayout>
    );
  },

  // ── useDebounceValue ────────────────────────────────────────────────────
  'use_debounce_value': () => {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounceValue(search, 500);
    return (
      <SandboxLayout
        title="useDebounceValue"
        description="Retrasa la propagación de entrada para optimizar búsquedas. El valor debounced se actualiza tras 500ms de inactividad de teclado."
        controls={[
          { label: 'Input búsqueda', type: 'text', value: search, onChange: setSearch },
        ]}
      >
        <div className="space-y-4 w-full">
          <div className="flex items-center gap-2.5 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5">
            <Search size={14} className="text-slate-500 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Escribe rápido aquí..."
              className="bg-transparent outline-none text-xs text-slate-100 placeholder-slate-600 w-full"
            />
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-[10px] font-mono text-slate-300">
            <p>Valor en caliente: <span className="text-indigo-400 font-bold">"{search}"</span></p>
            <p>Valor debounced: <span className="text-emerald-400 font-bold">"{debouncedSearch}"</span></p>
          </div>
        </div>
      </SandboxLayout>
    );
  },

  // ── StockHeatmap ────────────────────────────────────────────────────────
  'stock_heatmap': () => {
    const [stock, setStock] = useState(3);
    const [threshold, setThreshold] = useState(5);
    const [showLabel, setShowLabel] = useState(true);
    const [variant, setVariant] = useState('badge');
    return (
      <SandboxLayout
        title="StockHeatmap"
        description="Semáforo visual de stock. Modifica las unidades en los controles para ver los cambios de color y animación."
        controls={[
          { label: 'Unidades Stock', type: 'number', value: stock, onChange: v => setStock(Math.max(0, Number(v))) },
          { label: 'Umbral Crítico', type: 'number', value: threshold, onChange: v => setThreshold(Math.max(1, Number(v))) },
          { label: 'Mostrar texto', type: 'toggle', value: showLabel, onChange: setShowLabel },
          { label: 'Variante', type: 'select', value: variant, options: ['badge', 'dot'], onChange: setVariant },
        ]}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col items-center gap-3 w-full">
            <span className="text-3xl">{stock === 0 ? '📦 ❌' : '📦'}</span>
            <SandboxStockHeatmap
              stock={stock}
              threshold={threshold}
              showLabel={showLabel}
              variant={variant}
            />
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            stock: {stock} | threshold: {threshold}
          </p>
        </div>
      </SandboxLayout>
    );
  },

  // ── BentoGrid ───────────────────────────────────────────────────────────
  'bento_grid': () => {
    return (
      <SandboxLayout
        title="BentoGrid & BentoCard"
        description="Tablero en mosaico responsivo premium con hover glow y bordes HSL adaptativos."
        controls={[]}
      >
        <div className="w-full">
          <SandboxBentoGrid className="grid-cols-1 sm:grid-cols-3 gap-2">
            <SandboxBentoCard
              title="Ventas COP"
              description="Ingresos acumulados de hoy"
              colSpan="sm:col-span-2"
              icon={<Zap size={13} className="text-amber-400" />}
            >
              <div className="text-right w-full pr-2">
                <span className="text-xs font-black text-white">$ 1.280.000</span>
                <p className="text-[7px] text-emerald-400 font-bold">+18.4% vs ayer</p>
              </div>
            </SandboxBentoCard>
            <SandboxBentoCard
              title="Alertas"
              description="Acciones requeridas"
              icon={<Bell size={13} className="text-red-400" />}
            >
              <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-black rounded-lg">3 Críticos</span>
            </SandboxBentoCard>
            <SandboxBentoCard
              title="Clientes"
              description="Nuevos usuarios"
              icon={<User size={13} className="text-indigo-400" />}
              cta="Ver CRM →"
            >
              <span className="text-xs font-mono font-black text-indigo-400">14 nuevos</span>
            </SandboxBentoCard>
            <SandboxBentoCard
              title="Conversión"
              description="Embudo de ventas"
              colSpan="sm:col-span-2"
              icon={<ShoppingCart size={13} className="text-emerald-400" />}
            >
              <div className="w-full text-center">
                <span className="text-xs font-mono font-black text-emerald-400">3.4% ratio</span>
              </div>
            </SandboxBentoCard>
          </SandboxBentoGrid>
        </div>
      </SandboxLayout>
    );
  },

  // ── useLocalStorageState ────────────────────────────────────────────────
  'use_local_storage_state': () => {
    const [name, setName] = useLocalStorageState('sandbox_user_name', 'Sergio');
    const [count, setCount] = useLocalStorageState('sandbox_counter', 0);
    return (
      <SandboxLayout
        title="useLocalStorageState"
        description="Mantiene el estado sincronizado con localStorage. Abre otra pestaña del dashboard para ver los cambios sincronizarse en tiempo real."
        controls={[]}
      >
        <div className="space-y-4 w-full">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-500">Nombre Persistente</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500/50"
              placeholder="Escribe tu nombre..."
            />
          </div>
          <div className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800/80 rounded-2xl">
            <div className="space-y-0.5">
              <span className="text-[9px] font-black uppercase text-slate-500">Contador Persistente</span>
              <p className="text-xs font-mono text-indigo-400 font-bold">Valor: {count}</p>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setCount(c => c - 1)}
                className="p-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg cursor-pointer transition-all active:scale-95"
              >
                <Minus size={12} />
              </button>
              <button
                onClick={() => setCount(c => c + 1)}
                className="p-1.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-lg cursor-pointer transition-all active:scale-95"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>
      </SandboxLayout>
    );
  },

  // ── Facturación Comisional ──────────────────────────────────────────────
  'facturacion_comisional': () => {
    const [billingMode, setBillingMode] = useState('percentage');
    const [commissionPercent, setCommissionPercent] = useState('1.5');
    const [fixedFee, setFixedFee] = useState('500');
    const [flatFee, setFlatFee] = useState('50000');
    const [enableDian, setEnableDian] = useState(false);
    const [dianFee, setDianFee] = useState('150');
    
    const totalMes = 2500000;
    const pedidosMes = 45;
    
    let comisionMes = 0;
    if (billingMode === 'percentage') {
      comisionMes = (totalMes * Number(commissionPercent)) / 100;
    } else if (billingMode === 'fixed_per_service') {
      comisionMes = pedidosMes * Number(fixedFee);
    } else if (billingMode === 'flat_monthly') {
      comisionMes = Number(flatFee);
    }
    
    if (enableDian) {
      comisionMes += 20 * Number(dianFee);
    }
    
    const billingMetrics = {
      totalMes,
      comisionMes,
      pedidosMes,
      comisionHistorica: comisionMes * 3.4,
      totalHistorico: totalMes * 3.4,
      billingMode,
      comisionPorcentaje: Number(commissionPercent),
      montoFijoServicio: Number(fixedFee),
      pagoMensualFijo: Number(flatFee),
      enableDianBilling: enableDian,
      costoPorFacturaDian: Number(dianFee)
    };

    const handleExportPDF = async ({ signatureDataUrl }) => {
      try {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();

        // Estilos y Colores Premium
        const primaryColor = [99, 102, 241]; // Indigo
        const darkColor = [15, 23, 42]; // Slate 900

        // Encabezado
        doc.setFillColor(...darkColor);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("PROTOTIPE", 15, 20);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("MOTOR DE APLICACIONES A LA MEDIDA", 15, 26);

        // Detalles del Reporte
        doc.setFontSize(10);
        doc.text(`Nº RECIBO: REC-${Math.floor(100000 + Math.random() * 900000)}`, 140, 15);
        doc.text(`FECHA: ${new Date().toLocaleDateString('es-CO')}`, 140, 21);
        doc.text(`ENTORNO: PRODUCCIÓN`, 140, 27);

        // Datos del Cliente
        doc.setTextColor(...darkColor);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("INFORMACIÓN DEL COMERCIO", 15, 52);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Cliente ID: smartfix-ventas`, 15, 60);
        doc.text(`Modelo Comercial: ${
          billingMode === 'percentage' ? 'Porcentaje de Comisión' :
          billingMode === 'fixed_per_service' ? 'Valor Fijo por Pedido' : 'Tarifa Plana Mensual'
        }`, 15, 66);
        doc.text(`Tarifa Pactada: ${
          billingMode === 'percentage' ? `${commissionPercent}%` :
          billingMode === 'fixed_per_service' ? `$${fixedFee} por pedido` : `$${flatFee} al mes`
        }`, 15, 72);

        // Desglose Económico
        doc.setFont("helvetica", "bold");
        doc.text("RESUMEN DE COMISIONES DEL PERÍODO", 15, 88);
        
        const summaryData = [
          ["Ventas Consolidadas del Mes:", `$${totalMes.toLocaleString()}`],
          ["Pedidos Completados:", `${pedidosMes} transacciones`],
          ["Comisión de Plataforma:", `$${comisionMes.toLocaleString()}`]
        ];

        let startY = 96;
        summaryData.forEach(([label, val]) => {
          doc.setFont("helvetica", "normal");
          doc.text(label, 15, startY);
          doc.setFont("helvetica", "bold");
          doc.text(val, 140, startY);
          startY += 8;
        });

        // Tabla de Auditoría (Simulada para el recibo)
        doc.setFont("helvetica", "bold");
        doc.text("HISTORIAL DE PEDIDOS AUDITADOS (MOCK)", 15, 132);

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setFillColor(241, 245, 249);
        doc.rect(15, 138, 180, 8, 'F');
        doc.setTextColor(71, 85, 105);
        doc.text("ID PEDIDO", 20, 143);
        doc.text("FECHA", 60, 143);
        doc.text("MONTO VENTA", 110, 143);
        doc.text("COMISIÓN", 160, 143);

        const mockOrders = [
          { id: "ORD-0891", date: "06-06 10:15", amount: 150000, comm: billingMode === 'percentage' ? 150000 * Number(commissionPercent) / 100 : Number(fixedFee) },
          { id: "ORD-0892", date: "06-06 10:30", amount: 280000, comm: billingMode === 'percentage' ? 280000 * Number(commissionPercent) / 100 : Number(fixedFee) },
          { id: "ORD-0893", date: "06-06 10:45", amount: 95000,  comm: billingMode === 'percentage' ? 95000 * Number(commissionPercent) / 100 : Number(fixedFee) }
        ];

        let orderY = 152;
        mockOrders.forEach(o => {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...darkColor);
          doc.text(o.id, 20, orderY);
          doc.text(o.date, 60, orderY);
          doc.text(`$${o.amount.toLocaleString()}`, 110, orderY);
          doc.text(`$${o.comm.toLocaleString()}`, 160, orderY);
          orderY += 8;
        });

        // Firma de Conformidad
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("FIRMA DE CONFORMIDAD DEL CLIENTE", 15, 190);
        
        doc.rect(15, 195, 80, 35);
        doc.addImage(signatureDataUrl, 'PNG', 20, 198, 70, 28);

        // Leyenda
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text("Este recibo digital ha sido firmado y certificado electrónicamente.", 15, 245);
        doc.text("Verificación con Telemetry Token único del cliente.", 15, 250);

        doc.save(`Recibo_Comisiones_smartfix_${new Date().toISOString().slice(0, 7)}.pdf`);
      } catch (err) {
        console.error("Error al exportar PDF:", err);
        alert("Fallo al exportar PDF: " + err.message);
      }
    };

    return (
      <SandboxLayout
        title="Facturación Comisional"
        description="Panel de comisiones de plataforma con soporte multiesquema y captura de firma táctil para recibo."
        controls={[
          { label: 'Esquema', type: 'select', value: billingMode, options: ['percentage', 'fixed_per_service', 'flat_monthly'], onChange: setBillingMode },
          { label: 'Comisión %', type: 'text', value: commissionPercent, onChange: setCommissionPercent },
          { label: 'Fijo x Servicio', type: 'text', value: fixedFee, onChange: setFixedFee },
          { label: 'Pago Plano', type: 'text', value: flatFee, onChange: setFlatFee },
          { label: 'Cobro DIAN', type: 'toggle', value: enableDian, onChange: setEnableDian, labels: ['No', 'Sí'] },
        ]}
      >
        <div className="w-full bg-slate-950/40 p-2 rounded-2xl">
          <DeveloperBillingPanel 
            billingMetrics={billingMetrics}
            isLoading={false}
            orders={[]}
            config={{}}
            onExportPDF={handleExportPDF}
          />
        </div>
      </SandboxLayout>
    );
  },

  // ── Telemetría Centralizada ──────────────────────────────────────────────
  'telemetria_centralizada': () => {
    const [logs, setLogs] = useState([
      { time: new Date().toLocaleTimeString(), type: 'info', msg: 'Telemetry Service Inicializado (Entorno Sandbox)' }
    ]);
    const [clientId, setClientId] = useState('smartfix-ventas');
    const [salesAmount, setSalesAmount] = useState('150000');
    const [billingMode, setBillingMode] = useState('percentage');
    const [commissionPercent, setCommissionPercent] = useState('1.5');
    const [isSending, setIsSending] = useState(false);

    const addLog = (type, msg) => {
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type, msg }]);
    };

    const handleSendTelemetry = async () => {
      setIsSending(true);
      addLog('info', `Disparando envío de telemetría para cliente: "${clientId}"...`);
      await new Promise(r => setTimeout(r, 800));
      
      const sales = Number(salesAmount);
      let value = 0;
      if (billingMode === 'percentage') {
        value = (sales * Number(commissionPercent)) / 100;
      }
      
      const payload = {
        clientId,
        timestamp: new Date().toISOString(),
        metadata: {
          userAgent: navigator.userAgent,
          screenResolution: `${window.innerWidth}x${window.innerHeight}`
        },
        billing: {
          salesAmount: sales,
          commissionValue: value,
          billingMode
        }
      };

      addLog('success', `Datos de facturación calculados: Comisión = $${value.toLocaleString()}`);
      addLog('info', `Enviando payload JSON al servidor central...`);
      await new Promise(r => setTimeout(r, 500));
      addLog('success', `Telemetría enviada con éxito. Documento guardado. ID: telemetry_mock_${Math.random().toString(36).substring(7)}`);
      setIsSending(false);
    };

    return (
      <SandboxLayout
        title="Telemetría Centralizada"
        description="Simula el servicio centralizado de telemetría y envío asíncrono de reportes de facturación de marca blanca."
        controls={[
          { label: 'Cliente ID', type: 'text', value: clientId, onChange: setClientId },
          { label: 'Monto Venta', type: 'text', value: salesAmount, onChange: setSalesAmount },
          { label: 'Esquema', type: 'select', value: billingMode, options: ['percentage', 'fixed_per_service', 'flat_monthly'], onChange: setBillingMode },
          { label: 'Comisión %', type: 'text', value: commissionPercent, onChange: setCommissionPercent },
        ]}
      >
        <div className="w-full space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              </div>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">telemetry_terminal.log</span>
            </div>
            
            {/* Terminal Logs */}
            <div className="p-4 h-48 overflow-y-auto space-y-2 font-mono text-[10px] leading-relaxed scrollbar-thin">
              {logs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-slate-600 shrink-0">[{log.time}]</span>
                  <span className={
                    log.type === 'success' ? 'text-emerald-400 font-semibold' :
                    log.type === 'error' ? 'text-red-400 font-semibold' :
                    log.type === 'info' ? 'text-cyan-400' : 'text-slate-300'
                  }>
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSendTelemetry}
            disabled={isSending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-all active:scale-[0.98]"
          >
            {isSending ? (
              <>
                <Loader size={13} className="animate-spin" />
                Enviando Telemetría...
              </>
            ) : (
              <>
                <Zap size={13} />
                Enviar Reporte de Telemetría (Simulación)
              </>
            )}
          </button>
        </div>
      </SandboxLayout>
    );
  },

  // ── Calendario Premium ──────────────────────────────────────────────────
  'calendario_premium': () => {
    const [mode, setMode] = useState('single');
    const [singleDate, setSingleDate] = useState(() => new Date());
    const [rangeDate, setRangeDate] = useState({ start: new Date(), end: null });
    const [disabledPast, setDisabledPast] = useState(false);

    const debugValue = mode === 'single'
      ? (singleDate ? singleDate.toLocaleDateString('es-ES') : 'sin selección')
      : `${rangeDate?.start ? rangeDate.start.toLocaleDateString('es-ES') : 'sin selección'} - ${rangeDate?.end ? rangeDate.end.toLocaleDateString('es-ES') : '...'}`;

    return (
      <SandboxLayout
        title="DatePickerPremium"
        description="Calendario de marca blanca para selección de fecha única o rangos de fecha con presets dinámicos."
        controls={[
          { label: 'Modo', type: 'select', value: mode, options: ['single', 'range'], onChange: setMode },
          { label: 'Bloquear Pasado', type: 'toggle', value: disabledPast, onChange: setDisabledPast, labels: ['No', 'Sí'] },
        ]}
      >
        <div className="space-y-4 w-full">
          {mode === 'single' ? (
            <DatePickerPremium
              mode="single"
              value={singleDate}
              onChange={setSingleDate}
              disabledPast={disabledPast}
              placeholder="Selecciona una fecha..."
            />
          ) : (
            <DatePickerPremium
              mode="range"
              value={rangeDate}
              onChange={setRangeDate}
              disabledPast={disabledPast}
              placeholder="Selecciona un rango..."
            />
          )}
          
          <div className="p-3 bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-2xl space-y-1.5 font-mono text-[9px] text-[var(--color-text)]">
            <p className="text-[var(--color-text-muted)] font-black uppercase tracking-widest text-[8px]">Datos Seleccionados:</p>
            <p>Modo: <span className="text-indigo-400 font-black">{mode}</span></p>
            <p>Valor: <span className="text-emerald-400 font-black">{debugValue}</span></p>
          </div>
        </div>
      </SandboxLayout>
    );
  },

  // ── Marquesina de Logos (InfiniteLogoMarquee) ───────────────────────────
  'infinite_logo_marquee': () => {
    const [speed, setSpeed] = useState('fast');
    const [pauseOnHover, setPauseOnHover] = useState(true);
    const mockItems = [
      { id: '1', name: 'Nike' },
      { id: '2', name: 'Adidas' },
      { id: '3', name: 'Puma' },
      { id: '4', name: 'Reebok' },
      { id: '5', name: 'Under Armour' },
      { id: '6', name: 'Fila' },
    ];
    return (
      <SandboxLayout
        title="Marquesina de Logos"
        description="Marquesina de logos infinita con animación fluida en CSS, configurable en velocidad y pausa al hover."
        controls={[
          { label: 'Velocidad', type: 'select', value: speed, options: ['slow', 'medium', 'fast'], onChange: setSpeed },
          { label: 'Pausa hover', type: 'toggle', value: pauseOnHover, onChange: setPauseOnHover, labels: ['No', 'Sí'] },
        ]}
      >
        <div className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-2">
          <InfiniteLogoMarquee
            items={mockItems}
            speed={speed}
            pauseOnHover={pauseOnHover}
          />
        </div>
      </SandboxLayout>
    );
  },

  // ── Botón Magnético Reactivo (MagneticButton) ──────────────────────────
  'magnetic_button': () => {
    const { showAlert } = useAlertConfirm();
    const [range, setRange] = useState(80);
    const [attraction, setAttraction] = useState(0.35);
    const [innerAttraction, setInnerAttraction] = useState(0.18);
    const [variant, setVariant] = useState('primary');

    return (
      <SandboxLayout
        title="Botón Magnético Reactivo"
        description="Botón premium de conversión que se magnetiza y atrae suavemente hacia el cursor del ratón."
        controls={[
          { label: 'Radio de atracción', type: 'number', value: range, onChange: v => setRange(Number(v)) },
          { label: 'Atracción exterior', type: 'number', value: attraction, min: 0.1, max: 0.9, step: 0.05, onChange: v => setAttraction(Number(v)) },
          { label: 'Atracción interna', type: 'number', value: innerAttraction, min: 0.05, max: 0.5, step: 0.02, onChange: v => setInnerAttraction(Number(v)) },
          { label: 'Variante', type: 'select', value: variant, options: ['primary', 'secondary', 'outline'], onChange: setVariant },
        ]}
      >
        <div className="flex items-center justify-center p-16 w-full h-full min-h-[160px]">
          <SandboxMagneticButton
            range={range}
            attraction={attraction}
            innerAttraction={innerAttraction}
            variant={variant}
            onClick={() => showAlert({ title: 'Éxito', message: '¡Botón magnético activado!', variant: 'success' })}
          >
            Púlsame
          </SandboxMagneticButton>
        </div>
      </SandboxLayout>
    );
  },

  // ── Mazo de Tarjetas Deslizables (SwipeableCardStack) ───────────────────
  'swipeable_card_stack': () => {
    const { showAlert } = useAlertConfirm();
    const [threshold, setThreshold] = useState(120);
    const [empty, setEmpty] = useState(false);
    const [resetKey, setResetKey] = useState(0);

    const mockCards = [
      {
        id: '1',
        render: () => (
          <div className="flex flex-col justify-between h-full w-full">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">Cupones</span>
              <h4 className="text-sm font-black text-[var(--color-text)] mt-3">Cupón de Bienvenida</h4>
              <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed">Obtén 10% de descuento en tu primera compra en la tienda.</p>
            </div>
            <div className="text-[10px] font-mono font-bold tracking-widest text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-2.5">Desliza para descartar</div>
          </div>
        )
      },
      {
        id: '2',
        render: () => (
          <div className="flex flex-col justify-between h-full w-full">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">Destacado</span>
              <h4 className="text-sm font-black text-[var(--color-text)] mt-3">Zapatillas Sport Pro</h4>
              <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed">Diseñadas para máximo confort y amortiguación elástica.</p>
            </div>
            <div className="text-[10px] font-mono font-bold tracking-widest text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-2.5">Desliza para descartar</div>
          </div>
        )
      },
      {
        id: '3',
        render: () => (
          <div className="flex flex-col justify-between h-full w-full">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">Evento</span>
              <h4 className="text-sm font-black text-[var(--color-text)] mt-3">Envío Gratis</h4>
              <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed">Solo por el fin de semana en todas las categorías de calzado.</p>
            </div>
            <div className="text-[10px] font-mono font-bold tracking-widest text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-2.5">Desliza para descartar</div>
          </div>
        )
      }
    ];

    return (
      <SandboxLayout
        title="Mazo de Tarjetas Deslizables"
        description="Mazo apilado interactivo que responde a gestos táctiles y de ratón para descartes elásticos."
        controls={[
          { label: 'Umbral descarte (px)', type: 'number', value: threshold, onChange: v => setThreshold(Number(v)) },
        ]}
      >
        <div className="flex flex-col items-center justify-center p-8 w-full h-full min-h-[280px]">
          {empty ? (
            <button
              onClick={() => {
                setEmpty(false);
                setResetKey(prev => prev + 1);
              }}
              className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-black uppercase rounded-xl transition-all cursor-pointer"
            >
              Reiniciar Mazo
            </button>
          ) : (
            <SandboxSwipeableCardStack
              key={resetKey}
              items={mockCards}
              threshold={threshold}
              onSwipe={(dir, item) => showAlert({ title: 'Descarte', message: `Tarjeta descartada hacia la ${dir === 'right' ? 'derecha' : 'izquierda'}`, variant: 'info' })}
              onEmpty={() => setEmpty(true)}
            />
          )}
        </div>
      </SandboxLayout>
    );
  },

  // ── Fondo de Luces Orgánicas (InteractiveAmbientGlow) ───────────────────
  'interactive_ambient_glow': () => {
    const [sensitivity, setSensitivity] = useState(0.05);

    return (
      <SandboxLayout
        title="Fondo de Luces Orgánicas"
        description="Fondo estético de marca blanca con blobs HSL animados que siguen al puntero con inercia elástica."
        controls={[
          { label: 'Sensibilidad ratón', type: 'number', value: sensitivity, min: 0.01, max: 0.2, step: 0.01, onChange: v => setSensitivity(Number(v)) },
        ]}
      >
        <div className="relative w-full h-64 border border-[var(--color-border)] rounded-3xl overflow-hidden flex items-center justify-center">
          <SandboxInteractiveAmbientGlow sensitivity={sensitivity} />
          <div className="relative z-10 text-center p-6 bg-slate-950/40 backdrop-blur-md rounded-2xl border border-white/5 max-w-[240px]">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Capa Superior</h4>
            <p className="text-[10px] text-slate-300 mt-1.5 leading-relaxed">Mueve el cursor dentro del área para ver las luces seguir tu puntero.</p>
          </div>
        </div>
      </SandboxLayout>
    );
  },

  // ── Selector de Boletas de Rifa (RaffleNumberSelector) ──────────────────
  'selector_boletas_rifas': () => {
    const [soldNumbers, setSoldNumbers] = useState(['07', '18', '24', '42', '55', '73', '89']);
    const [reservedNumbers, setReservedNumbers] = useState(['14', '33', '67']);
    const [selectedNumbers, setSelectedNumbers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [color1, setColor1] = useState('var(--color-primary)');
    const [color2, setColor2] = useState('var(--color-accent)');
    const [crmDetail, setCrmDetail] = useState(null);

    const clientDetails = {
      '07': { name: 'Juan Carlos Pérez', phone: '+57 300 481 9283', time: '06-06 09:12', email: 'juan.perez@email.com' },
      '18': { name: 'María Alejandra Gómez', phone: '+57 312 902 3847', time: '06-06 09:30', email: 'mar.gomez@email.com' },
      '24': { name: 'Andrés Felipe Restrepo', phone: '+57 315 882 1092', time: '06-06 09:45', email: 'andres.f@email.com' },
      '42': { name: 'Clara Inés Córdoba', phone: '+57 320 736 1827', time: '06-06 10:05', email: 'clara.c@email.com' },
      '55': { name: 'Sergio Agudelo', phone: '+57 300 123 4567', time: '06-06 10:20', email: 'sergio.a@email.com' },
      '73': { name: 'Diana Marcela Rincón', phone: '+57 310 938 1827', time: '06-06 10:45', email: 'diana.r@email.com' },
      '89': { name: 'Luis Fernando Castro', phone: '+57 322 839 2038', time: '06-06 11:05', email: 'luis.c@email.com' },
      '14': { name: 'Reserva temporal: Carlos', phone: 'Expira en 4 min', time: '06-06 11:25', email: 'En carrito' },
      '33': { name: 'Reserva temporal: Liliana', phone: 'Expira en 7 min', time: '06-06 11:22', email: 'En carrito' },
      '67': { name: 'Reserva temporal: Roberto', phone: 'Expira en 9 min', time: '06-06 11:20', email: 'En carrito' },
    };

    const handleNumberToggle = (num) => {
      setSelectedNumbers(prev => 
        prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
      );
    };

    const handleAdminAction = (num, action, detail) => {
      if (action === 'detail') {
        setCrmDetail({ number: num, ...detail });
      }
    };

    return (
      <SandboxLayout
        title="Selector de Boletas de Rifa"
        description="Cuadrícula táctil interactiva 10x10 para rifas (00-99). Permite selección fluida por arrastre, sorteo rápido al azar y gestión CRM de clientes en tiempo real."
        controls={[
          { label: 'Modo Administrador', type: 'boolean', value: isAdmin, onChange: v => { setIsAdmin(v); setCrmDetail(null); } },
          { label: 'Color Gradiente 1', type: 'select', value: color1, options: ['var(--color-primary)', 'var(--color-accent)', '#ec4899', '#10b981'], onChange: v => setColor1(v) },
          { label: 'Color Gradiente 2', type: 'select', value: color2, options: ['var(--color-accent)', 'var(--color-primary)', '#8b5cf6', '#f97316'], onChange: v => setColor2(v) },
        ]}
      >
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          <div className="flex-1 w-full">
            <SandboxRaffleNumberSelector
              soldNumbers={soldNumbers}
              reservedNumbers={reservedNumbers}
              selectedNumbers={selectedNumbers}
              clientDetails={clientDetails}
              color1={color1}
              color2={color2}
              isAdmin={isAdmin}
              onNumberToggle={handleNumberToggle}
              onAdminAction={handleAdminAction}
            />

            {!isAdmin && selectedNumbers.length > 0 && (
              <div className="mt-4 p-4 bg-slate-950/50 border border-white/5 rounded-2xl flex items-center justify-between animate-fade-in">
                <div>
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">Boletas Seleccionadas</h5>
                  <p className="text-lg font-black text-indigo-400 mt-1.5 flex gap-1.5 flex-wrap">
                    {selectedNumbers.sort().map(n => (
                      <button
                        key={n}
                        onClick={() => handleNumberToggle(n)}
                        className="flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/20 hover:bg-red-500/20 border border-indigo-500/30 hover:border-red-500/30 rounded-lg text-xs text-white hover:text-red-200 transition duration-200 group cursor-pointer"
                        title={`Eliminar boleta ${n}`}
                      >
                        <span>{n}</span>
                        <span className="text-[10px] text-indigo-400 group-hover:text-red-400 font-black">×</span>
                      </button>
                    ))}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-w-[160px] self-center">
                  <button 
                    onClick={() => alert(`Procediendo a comprar boletas: ${selectedNumbers.sort().join(', ')}`)}
                    className="relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 rounded-xl text-xs font-black text-white uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/25 hover:shadow-purple-500/50 cursor-pointer text-center"
                  >
                    Confirmar {selectedNumbers.length} boleta(s)
                  </button>
                  <button
                    onClick={() => setSelectedNumbers([])}
                    className="px-3 py-1.5 bg-slate-950/40 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 rounded-lg text-[10px] font-bold text-slate-400 hover:text-red-400 tracking-wider uppercase transition-all duration-200 cursor-pointer text-center"
                  >
                    Limpiar Selección
                  </button>
                </div>
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="w-full lg:w-72 bg-slate-950/40 border border-white/5 p-5 rounded-3xl min-h-[300px] flex flex-col justify-between self-stretch">
              {crmDetail ? (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-black">
                        Boleta #{crmDetail.number}
                      </span>
                      <button 
                        onClick={() => setCrmDetail(null)}
                        className="text-[10px] text-slate-500 hover:text-white transition uppercase font-bold"
                      >
                        Cerrar
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-slate-500 font-black">Comprador</label>
                        <p className="text-sm font-bold text-white">{crmDetail.name}</p>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-slate-500 font-black">Teléfono</label>
                        <p className="text-xs text-slate-300 font-semibold">{crmDetail.phone}</p>
                      </div>
                      {crmDetail.email && (
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-slate-500 font-black">Email</label>
                          <p className="text-xs text-slate-400">{crmDetail.email}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-slate-500 font-black">Fecha de Adquisición</label>
                        <p className="text-[10px] text-slate-400">{crmDetail.time}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        if (confirm(`¿Liberar boleta #${crmDetail.number}?`)) {
                          setSoldNumbers(prev => prev.filter(n => n !== crmDetail.number));
                          setReservedNumbers(prev => prev.filter(n => n !== crmDetail.number));
                          setCrmDetail(null);
                        }
                      }}
                      className="w-full py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-[10px] font-black text-red-400 tracking-wider uppercase transition"
                    >
                      Liberar Boleta
                    </button>
                    <button
                      onClick={() => alert(`Enviando comprobante de boleta #${crmDetail.number} al WhatsApp: ${crmDetail.phone}`)}
                      className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-xl text-[10px] font-black text-emerald-400 tracking-wider uppercase transition"
                    >
                      Enviar WhatsApp
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-full py-10">
                  <div className="w-12 h-12 rounded-full border border-dashed border-white/10 flex items-center justify-center text-slate-600 mb-3">
                    #
                  </div>
                  <h5 className="text-xs font-bold text-slate-400">Detalles de Boleta</h5>
                  <p className="text-[10px] text-slate-500 max-w-[180px] mt-1 leading-relaxed">
                    Toca cualquier número marcado como vendido (/) o reservado para ver la información del cliente.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </SandboxLayout>
    );
  },

  // ── Menú Radial Interactivo (RadialInteractiveMenu) ─────────────────────
  'radial_interactive_menu': () => {
    const { showAlert } = useAlertConfirm();
    const [position, setPosition] = useState('bottom-right');
    const [radius, setRadius] = useState(90);
    const [angleRange, setAngleRange] = useState(90);
    const [startAngle, setStartAngle] = useState(180);

    const menuItems = [
      { id: '1', label: 'Mensajes', icon: <Mail size={16} />, onClick: () => showAlert({ title: 'Acción', message: 'Mensajes abiertos', variant: 'info' }) },
      { id: '2', label: 'Perfil', icon: <User size={16} />, onClick: () => showAlert({ title: 'Acción', message: 'Perfil abierto', variant: 'info' }) },
      { id: '3', label: 'Carrito', icon: <ShoppingCart size={16} />, onClick: () => showAlert({ title: 'Acción', message: 'Carrito abierto', variant: 'info' }) },
      { id: '4', label: 'Notificaciones', icon: <Bell size={16} />, onClick: () => showAlert({ title: 'Acción', message: 'Notificaciones abiertas', variant: 'info' }) },
    ];

    return (
      <SandboxLayout
        title="Menú Radial Interactivo"
        description="Menú circular animado que se expande radialmente en abanico con retrasos coordinados."
        controls={[
          { label: 'Posición', type: 'select', value: position, options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'], onChange: setPosition },
          { label: 'Radio (px)', type: 'number', value: radius, onChange: v => setRadius(Number(v)) },
          { label: 'Ángulo abanico', type: 'number', value: angleRange, onChange: v => setAngleRange(Number(v)) },
          { label: 'Ángulo inicio', type: 'number', value: startAngle, onChange: v => setStartAngle(Number(v)) },
        ]}
      >
        <div className="flex flex-col items-center justify-center p-8 h-full min-h-[160px] w-full">
          <p className="text-[10px] text-[var(--color-text-muted)] text-center max-w-[200px]">
            Haz clic en el botón flotante en la esquina {position === 'bottom-right' ? 'inferior derecha' : position === 'bottom-left' ? 'inferior izquierda' : position === 'top-right' ? 'superior derecha' : 'superior izquierda'} de este sandbox.
          </p>
          <RadialInteractiveMenu
            position={position}
            radius={radius}
            angleRange={angleRange}
            startAngle={startAngle}
            items={menuItems}
            className="!absolute"
          />
        </div>
      </SandboxLayout>
    );
  },

  // ── Tarjeta 3D Holográfica (HolographicTiltCard) ────────────────────────
  'holographic_tilt_card': () => {
    const [maxTilt, setMaxTilt] = useState(15);
    const [perspective, setPerspective] = useState(1000);
    const [scale, setScale] = useState(1.05);

    return (
      <SandboxLayout
        title="Tarjeta 3D Holográfica"
        description="Efecto de inclinación 3D realista basado en coordenadas del ratón con capa reflectante de brillo."
        controls={[
          { label: 'Inclinación máx', type: 'number', value: maxTilt, onChange: v => setMaxTilt(Number(v)) },
          { label: 'Perspectiva', type: 'number', value: perspective, onChange: v => setPerspective(Number(v)) },
          { label: 'Escala hover', type: 'text', value: String(scale), onChange: v => setScale(Number(v)) },
        ]}
      >
        <div className="flex justify-center items-center py-4">
          <HolographicTiltCard
            maxTilt={maxTilt}
            perspective={perspective}
            scale={scale}
            className="w-56 h-32 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border-slate-750 flex flex-col justify-between p-4 text-white"
          >
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black tracking-widest text-indigo-400">PROTOTIPE PREMIUM</span>
                <span className="text-xs">💳</span>
              </div>
              <p className="text-[8px] font-mono text-slate-400 mt-1">NÚMERO DE SOCIO</p>
              <p className="text-[10px] font-mono font-bold tracking-wider text-slate-200">**** **** **** 2026</p>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[7px] text-slate-500 font-mono">SOCIO</p>
                <p className="text-[9px] font-black text-slate-150">SERGIO AGUDELO</p>
              </div>
              <span className="text-[10px] font-black text-indigo-400">GOLD VIP</span>
            </div>
          </HolographicTiltCard>
        </div>
      </SandboxLayout>
    );
  },

  // ── Empty State Premium Interactivo (empty_state) ───────────────────────
  'empty_state': () => {
    const { showAlert } = useAlertConfirm();
    const [title, setTitle] = useState('No hay productos');
    const [description, setDescription] = useState('Tu catálogo está vacío por ahora. Registra un nuevo producto para comenzar.');
    const [iconName, setIconName] = useState('Package');
    const [actionLabel, setActionLabel] = useState('Crear Producto');
    const [hasAction, setHasAction] = useState(true);

    const icons = {
      Package: Package,
      ShoppingBag: ShoppingBag,
      Receipt: Receipt,
      Search: Search,
      Info: Info
    };

    const SelectedIcon = icons[iconName] || Package;

    return (
      <SandboxLayout
        title="Empty State Premium Interactivo"
        description="Pantalla de estado vacío premium con animaciones elásticas y botón de llamada a la acción."
        controls={[
          { label: 'Título', type: 'text', value: title, onChange: setTitle },
          { label: 'Descripción', type: 'text', value: description, onChange: setDescription },
          { label: 'Icono', type: 'select', value: iconName, options: Object.keys(icons), onChange: setIconName },
          { label: 'Con Acción', type: 'toggle', value: hasAction, onChange: setHasAction, labels: ['No', 'Sí'] },
          { label: 'Texto Acción', type: 'text', value: actionLabel, onChange: setActionLabel },
        ]}
      >
        <div className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-4">
          <SandboxEmptyState
            title={title}
            description={description}
            icon={SelectedIcon}
            actionLabel={hasAction ? actionLabel : null}
            onAction={hasAction ? () => showAlert({ title: 'Acción', message: `¡Botón "${actionLabel}" pulsado!`, variant: 'success' }) : null}
          />
        </div>
      </SandboxLayout>
    );
  },

  // ── Ruleta de la Fortuna (ruleta_suerte) ──────────────────────────────────
  'ruleta_suerte': () => {
    const { showAlert } = useAlertConfirm();
    const [prizesText, setPrizesText] = useState('10% OFF, Bebida Gratis, Postre Gratis, Café Gratis, Reintenta, Descuento $5k');
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [prizeResult, setPrizeResult] = useState(null);
    const [couponCode, setCouponCode] = useState('');

    const slices = useMemo(() => {
      const colors = [
        'var(--color-primary, #6366f1)',
        'var(--color-accent, #3b82f6)',
        '#10b981',
        '#f59e0b',
        '#ec4899',
        '#8b5cf6',
        '#64748b'
      ];
      return prizesText.split(',').map((p, i) => ({
        label: p.trim(),
        color: colors[i % colors.length]
      })).filter(p => p.label.length > 0);
    }, [prizesText]);

    const spin = () => {
      if (isSpinning || slices.length === 0) return;
      setIsSpinning(true);
      setPrizeResult(null);
      setCouponCode('');

      const winningIndex = Math.floor(Math.random() * slices.length);
      const angle = 360 / slices.length;
      const spins = 6;
      
      const targetRotation = (spins * 360) - (winningIndex * angle) - 90;
      const relativeRotation = targetRotation + (Math.ceil(rotation / 360) * 360);
      setRotation(relativeRotation);

      setTimeout(() => {
        setIsSpinning(false);
        const win = slices[winningIndex];
        setPrizeResult(win.label);
        
        if (!win.label.toLowerCase().includes('reintenta') && !win.label.toLowerCase().includes('intenta')) {
          const code = `PROMO-${win.label.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
          setCouponCode(code);
          import('canvas-confetti').then(module => {
            module.default({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 }
            });
          });
        }
      }, 5000);
    };

    const angle = 360 / slices.length;
    const rad = (angle * Math.PI) / 180;
    const x1 = 100 + 84 * Math.cos(-rad / 2);
    const y1 = 100 + 84 * Math.sin(-rad / 2);
    const x2 = 100 + 84 * Math.cos(rad / 2);
    const y2 = 100 + 84 * Math.sin(rad / 2);
    const pathD = `M 100 100 L ${x1.toFixed(2)} ${y1.toFixed(2)} A 84 84 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

    return (
      <SandboxLayout
        title="Ruleta de la Fortuna (Fidelización)"
        description="Ruleta de premios de marca blanca para restaurantes y comercios. Fideliza clientes otorgando cupones de descuento interactivos con física de inercia."
        controls={[
          { label: 'Premios (CSV)', type: 'text', value: prizesText, onChange: setPrizesText },
        ]}
      >
        <div className="flex flex-col items-center gap-6 py-4 select-none">
          <style>{`
            @keyframes bulbGlow {
              0%, 100% { fill: #fef08a; filter: drop-shadow(0 0 2px #d97706); opacity: 0.6; }
              50% { fill: #fbbf24; filter: drop-shadow(0 0 8px #f59e0b); opacity: 1; }
            }
            .bulb-glow {
              animation: bulbGlow 0.9s infinite alternate;
            }
          `}</style>

          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Pointer Pin / Indicador Premium */}
            <div className="absolute -top-3.5 z-30 flex flex-col items-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
              <svg width="28" height="36" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="goldPointer" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#ca8a04" />
                    <stop offset="100%" stopColor="#854d0e" />
                  </linearGradient>
                </defs>
                <path d="M12 32L22 12C24 8 22 0 12 0C2 0 0 8 2 12L12 32Z" fill="url(#goldPointer)" />
                <path d="M12 28L19 13C20.2 10.5 19 3 12 3C5 3 3.8 10.5 5 13L12 28Z" fill="#f43f5e" />
                <circle cx="12" cy="10" r="3.5" fill="#ffffff" opacity="0.9" />
              </svg>
            </div>

            {/* Sombra / Glow de Fondo */}
            <div className="absolute inset-2 bg-gradient-to-tr from-amber-500/10 to-indigo-500/15 rounded-full blur-2xl z-0" />

            {/* Contenedor Giratorio con el SVG */}
            <div
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 5000ms cubic-bezier(0.1, 0.8, 0.1, 1)' : 'none'
              }}
              className="w-full h-full rounded-full overflow-hidden z-10 filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
            >
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <defs>
                  <linearGradient id="goldMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="30%" stopColor="#eab308" />
                    <stop offset="50%" stopColor="#ca8a04" />
                    <stop offset="70%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#854d0e" />
                  </linearGradient>
                  <radialGradient id="wheelCenter" cx="50%" cy="50%" r="50%">
                    <stop offset="60%" stopColor="#1e1b4b" />
                    <stop offset="100%" stopColor="#030712" />
                  </radialGradient>
                  <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="1.2" stdDeviation="1" floodOpacity="0.8" />
                  </filter>
                </defs>

                {/* Slices / Segmentos */}
                {slices.map((slice, i) => (
                  <g key={i} transform={`rotate(${i * angle}, 100, 100)`}>
                    <path d={pathD} fill={slice.color} stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5" />
                    <text
                      x="176"
                      y="100"
                      textAnchor="end"
                      dominantBaseline="middle"
                      fill="#ffffff"
                      fontSize="5"
                      fontWeight="900"
                      filter="url(#shadowFilter)"
                      className="uppercase tracking-wider fill-white font-sans select-none"
                    >
                      {slice.label}
                    </text>
                  </g>
                ))}

                {/* Outer Ring / Aro dorado exterior */}
                <circle cx="100" cy="100" r="95" fill="none" stroke="url(#goldMetallic)" strokeWidth="5" />
                <circle cx="100" cy="100" r="91.5" fill="none" stroke="url(#goldMetallic)" strokeWidth="1" opacity="0.4" />

                {/* Bulbs / Bombillos LED dorados animados */}
                {Array.from({ length: 24 }).map((_, idx) => {
                  const bulbAngle = (360 / 24) * idx;
                  const radBulb = (bulbAngle * Math.PI) / 180;
                  const cx = 100 + 91.5 * Math.cos(radBulb);
                  const cy = 100 + 91.5 * Math.sin(radBulb);
                  const delay = (idx % 4) * 220;
                  return (
                    <circle
                      key={idx}
                      cx={cx}
                      cy={cy}
                      r="1.8"
                      className="bulb-glow"
                      style={{
                        animationDelay: `${delay}ms`
                      }}
                    />
                  );
                })}

                {/* Bezel de separación interior */}
                <circle cx="100" cy="100" r="84" fill="none" stroke="url(#goldMetallic)" strokeWidth="1.2" />

                {/* Centro Decorativo */}
                <circle cx="100" cy="100" r="28" fill="url(#wheelCenter)" stroke="url(#goldMetallic)" strokeWidth="2.5" className="drop-shadow-md" />
              </svg>
            </div>

            {/* Central Button / Botón de acción */}
            <button
              onClick={spin}
              disabled={isSpinning}
              className={`absolute z-30 w-14 h-14 rounded-full flex flex-col items-center justify-center text-[10px] font-black uppercase shadow-[0_6px_20px_rgba(217,119,6,0.3)] transition-all duration-300 cursor-pointer ${
                isSpinning
                  ? 'bg-slate-900 text-slate-500 border-slate-800'
                  : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 text-white hover:scale-105 active:scale-95 hover:shadow-[0_6px_24px_rgba(217,119,6,0.5)] border border-white/20'
              }`}
              style={{
                fontFamily: "'Outfit', 'Inter', sans-serif",
                letterSpacing: '0.05em'
              }}
            >
              <span className="relative z-10">{isSpinning ? 'GIRO...' : 'GIRAR'}</span>
            </button>
          </div>

          {prizeResult && (
            <div className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-3 text-center space-y-2 animate-fade-in shadow-xl max-w-xs">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">¡Felicidades, ganaste!</span>
              <p className="text-sm font-black text-amber-400 uppercase">{prizeResult}</p>
              {couponCode && (
                <div className="flex flex-col items-center gap-1.5 pt-1 border-t border-white/5">
                  <span className="text-[8px] text-slate-500 font-mono">CÓDIGO DE CUPÓN:</span>
                  <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs font-mono font-bold text-amber-400 select-all cursor-pointer">
                    {couponCode}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </SandboxLayout>
    );
  },

  // ── Selector de Reservas tipo Agenda (reservas_agenda) ────────────────────
  'reservas_agenda': () => {
    const { showAlert } = useAlertConfirm();
    const [startHour, setStartHour] = useState('08:00');
    const [endHour, setEndHour] = useState('18:00');
    const [slotDuration, setSlotDuration] = useState('45');
    const [occupiedRate, setOccupiedRate] = useState('40');

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [occupiedSlots, setOccupiedSlots] = useState({});
    const [clientName, setClientName] = useState('');
    const [clientService, setClientService] = useState('Corte de Cabello 💈');
    const [isSelectOpen, setIsSelectOpen] = useState(false);


    const daysList = useMemo(() => {
      const list = [];
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        list.push({
          dateString: d.toISOString().split('T')[0],
          dayName: days[d.getDay()],
          dayNumber: d.getDate().toString().padStart(2, '0'),
          monthName: months[d.getMonth()],
          fullDate: d
        });
      }
      return list;
    }, []);

    useEffect(() => {
      if (daysList.length > 0 && !selectedDate) {
        setSelectedDate(daysList[0].dateString);
      }
    }, [daysList, selectedDate]);

    const timeSlots = useMemo(() => {
      const slots = [];
      const [sh, sm] = startHour.split(':').map(Number);
      const [eh, em] = endHour.split(':').map(Number);
      const duration = Number(slotDuration);

      let current = new Date();
      current.setHours(sh, sm, 0, 0);

      const end = new Date();
      end.setHours(eh, em, 0, 0);

      while (current < end) {
        const timeString = current.toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        slots.push(timeString);
        current.setMinutes(current.getMinutes() + duration);
      }
      return slots;
    }, [startHour, endHour, slotDuration]);

    const getOccupiedForDate = (dateStr) => {
      if (occupiedSlots[dateStr]) return occupiedSlots[dateStr];
      const rate = Number(occupiedRate) / 100;
      const occupied = timeSlots.filter(() => Math.random() < rate);
      setOccupiedSlots(prev => ({
        ...prev,
        [dateStr]: occupied
      }));
      return occupied;
    };

    const currentOccupied = selectedDate ? getOccupiedForDate(selectedDate) : [];

    const handleConfirmBooking = () => {
      if (!selectedDate || !selectedSlot) {
        alert("Por favor selecciona una fecha y hora");
        return;
      }
      if (!clientName) {
        alert("Por favor ingresa tu nombre");
        return;
      }
      
      showAlert({
        title: '¡Reserva Confirmada!',
        message: `Cita reservada para ${clientName} el día ${selectedDate} a las ${selectedSlot} para: ${clientService}`,
        variant: 'success'
      });

      setOccupiedSlots(prev => ({
        ...prev,
        [selectedDate]: [...(prev[selectedDate] || []), selectedSlot]
      }));
      
      setSelectedSlot(null);
      setClientName('');
    };

    return (
      <SandboxLayout
        title="Agenda & Reservador de Citas Premium"
        description="Selector de fechas y horas interactivo en formato agenda para citas y servicios técnicos (barberías, mantenimiento, spa). Soporta visualización de slots ocupados/libres."
        controls={[
          { label: 'Apertura', type: 'text', value: startHour, onChange: setStartHour },
          { label: 'Cierre', type: 'text', value: endHour, onChange: setEndHour },
          { label: 'Duración (min)', type: 'select', value: slotDuration, options: ['15', '30', '45', '60'], onChange: setSlotDuration },
          { label: 'Ocupación (%)', type: 'text', value: occupiedRate, onChange: setOccupiedRate },
        ]}
      >
        <div className="w-full space-y-4 text-[var(--color-text)]">
          <div>
            <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-2">Selecciona un día:</span>
            <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
              {daysList.map((day) => {
                const isActive = selectedDate === day.dateString;
                return (
                  <button
                    key={day.dateString}
                    onClick={() => {
                      setSelectedDate(day.dateString);
                      setSelectedSlot(null);
                    }}
                    className={`flex flex-col items-center justify-center min-w-[54px] p-2.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/10'
                        : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-indigo-500/30 hover:text-[var(--color-text)]'
                    }`}
                  >
                    <span className={`text-[9px] uppercase font-bold tracking-wider ${isActive ? 'text-white/80' : 'text-[var(--color-text-muted)]'}`}>{day.dayName}</span>
                    <span className={`text-sm font-black mt-1 ${isActive ? 'text-white' : 'text-[var(--color-text)]'}`}>{day.dayNumber}</span>
                    <span className={`text-[8px] mt-0.5 font-mono ${isActive ? 'text-white/80' : 'text-[var(--color-text-muted)]'}`}>{day.monthName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-2">Horas disponibles:</span>
            <div className="grid grid-cols-3 gap-1.5">
              {timeSlots.map((slot) => {
                const isOccupied = currentOccupied.includes(slot);
                const isSelected = selectedSlot === slot;
                
                let btnClass = "";
                if (isOccupied) {
                  btnClass = "bg-[var(--color-surface-2)] border-[var(--color-border)]/40 text-[var(--color-text-muted)] opacity-35 cursor-not-allowed line-through";
                } else if (isSelected) {
                  btnClass = "bg-purple-600/15 border-purple-500 text-purple-600 dark:text-purple-300 font-black scale-105 shadow-md shadow-purple-500/5";
                } else {
                  btnClass = "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text)] hover:border-indigo-500/30 hover:scale-[1.02] cursor-pointer";
                }

                return (
                  <button
                    key={slot}
                    disabled={isOccupied}
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-2 py-2.5 text-[10px] text-center font-bold rounded-xl border transition-all duration-200 ${btnClass}`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedSlot && (
            <div className="p-3 bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-2xl space-y-3 animate-fade-in">
              <div>
                <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Resumen de Cita:</span>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1 uppercase">
                  📅 {selectedDate} a las ⏰ {selectedSlot}
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Tu Nombre"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-indigo-500 transition placeholder-[var(--color-text-muted)]/50"
                />

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] flex items-center justify-between transition cursor-pointer hover:border-indigo-500/50"
                  >
                    <span>{clientService}</span>
                    <ChevronDown size={14} className={`text-[var(--color-text-muted)] transition-transform duration-300 ${isSelectOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isSelectOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsSelectOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 right-0 mt-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-[var(--color-border)]/50"
                        >
                          {[
                            "Corte de Cabello 💈",
                            "Mantenimiento de Barba 🪒",
                            "Servicio Técnico Premium 🛠️",
                            "Lavado & Peinado 🧼"
                          ].map((service) => (
                            <button
                              key={service}
                              type="button"
                              onClick={() => {
                                setClientService(service);
                                setIsSelectOpen(false);
                              }}
                              className={`w-full px-3 py-2.5 text-xs text-left transition-colors flex items-center justify-between hover:bg-[var(--color-surface-2)] cursor-pointer ${
                                clientService === service ? 'text-indigo-400 font-bold bg-indigo-500/5' : 'text-[var(--color-text)]'
                              }`}
                            >
                              <span>{service}</span>
                              {clientService === service && <span className="text-indigo-400 font-bold">✓</span>}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold uppercase rounded-xl tracking-wider transition-all duration-300 shadow-lg shadow-indigo-500/15 cursor-pointer text-center text-white"
              >
                Confirmar Reserva
              </button>
            </div>
          )}
        </div>
      </SandboxLayout>
    );
  },

  // ── Sistema de Notificaciones Premium ──────────────────────────────────────
  'sistema_notificaciones': () => {
    // ── Estado del configurador ──────────────────────────────────────────────
    const [toastType, setToastType] = useState('success');
    const [toastTitle, setToastTitle] = useState('Pedido confirmado');
    const [toastMessage, setToastMessage] = useState('Tu pedido #1234 fue procesado exitosamente.');
    const [duration, setDuration] = useState('4500');
    const [showProgress, setShowProgress] = useState(true);
    const [pauseOnHover, setPauseOnHover] = useState(true);
    const [hasAction, setHasAction] = useState(false);
    const [actionLabel, setActionLabel] = useState('Ver pedido');
    const [addToHistory, setAddToHistory] = useState(true);

    // ── Toasts en vivo (estado local del playground) ────────────────────────
    const [liveToasts, setLiveToasts] = useState([]);
    const [history, setHistory] = useState([]);
    const [badgeCount, setBadgeCount] = useState(0);
    const [trayOpen, setTrayOpen] = useState(false);

    const removeToast = (id) => setLiveToasts(prev => prev.filter(t => t.id !== id));

    const fireToast = () => {
      const id = `toast-${Date.now()}`;
      const toast = {
        id, type: toastType, title: toastTitle,
        message: toastMessage,
        duration: Number(duration),
        showProgress, pauseOnHover,
        action: hasAction ? { label: actionLabel, onClick: () => {} } : null,
        createdAt: Date.now(),
      };
      setLiveToasts(prev => [...prev.slice(-4), toast]);
      if (addToHistory) {
        setHistory(prev => [{ ...toast, read: false }, ...prev].slice(0, 20));
        setBadgeCount(c => c + 1);
      }
      if (Number(duration) > 0) {
        setTimeout(() => removeToast(id), Number(duration));
      }
    };

    const TYPES = ['success', 'error', 'warning', 'info', 'event', 'mention'];
    const TYPE_CONFIG = {
      success: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500', border: 'border-emerald-500/40', label: 'Éxito ✓' },
      error:   { color: 'text-red-400',     bg: 'bg-red-500/10',     bar: 'bg-red-500',     border: 'border-red-500/40',     label: 'Error ✕' },
      warning: { color: 'text-amber-400',   bg: 'bg-amber-500/10',   bar: 'bg-amber-500',   border: 'border-amber-500/40',   label: 'Alerta ⚠' },
      info:    { color: 'text-blue-400',    bg: 'bg-blue-500/10',    bar: 'bg-blue-500',    border: 'border-blue-500/40',    label: 'Info ℹ' },
      event:   { color: 'text-purple-400',  bg: 'bg-purple-500/10',  bar: 'bg-purple-500',  border: 'border-purple-500/40',  label: 'Evento 🛒' },
      mention: { color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    bar: 'bg-cyan-500',    border: 'border-cyan-500/40',    label: 'Mención @' },
    };

    const cfg = TYPE_CONFIG[toastType] || TYPE_CONFIG.info;

    // Código generado dinámicamente
    const generatedCode = `notify.${toastType}(
  "${toastTitle}",
  "${toastMessage}",
  {
    duration: ${duration},
    showProgress: ${showProgress},
    pauseOnHover: ${pauseOnHover},${hasAction ? `\n    action: { label: "${actionLabel}", onClick: () => navigate('/orders') },` : ''}
  }
);`;

    return (
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h4 className="text-xs font-black text-[var(--color-text)]">Sistema de Notificaciones Premium</h4>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">
            Configura cada parámetro en vivo. El código generado debajo es el que debes usar con el cliente.
          </p>
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-4">

          {/* ── Columna izquierda: Configurador ─────────────────────────────── */}
          <div className="space-y-4">

            {/* Tipo de Toast */}
            <div className="bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
              <p className="text-[10px] font-black text-[var(--color-text)] uppercase tracking-wider">1. Tipo de notificación</p>
              <div className="grid grid-cols-3 gap-1.5">
                {TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => {
                      setToastType(t);
                      // Sugerir textos contextuales por tipo
                      const presets = {
                        success: { title: 'Operación exitosa', message: 'Los cambios fueron guardados correctamente.' },
                        error:   { title: 'Error al procesar', message: 'No se pudo completar la acción. Intenta de nuevo.' },
                        warning: { title: 'Atención requerida', message: 'Esta acción no se puede deshacer. ¿Continuar?' },
                        info:    { title: 'Actualización disponible', message: 'Una nueva versión del sistema está lista.' },
                        event:   { title: 'Nuevo pedido #4821', message: 'Mesa 3 acaba de realizar un pedido.' },
                        mention: { title: 'Te mencionaron', message: 'Carlos: "@usuario revisa el inventario"' },
                      };
                      setToastTitle(presets[t].title);
                      setToastMessage(presets[t].message);
                    }}
                    className={`px-2 py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                      toastType === t
                        ? `${TYPE_CONFIG[t].bg} ${TYPE_CONFIG[t].border} ${TYPE_CONFIG[t].color}`
                        : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]'
                    }`}
                  >
                    {TYPE_CONFIG[t].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contenido */}
            <div className="bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
              <p className="text-[10px] font-black text-[var(--color-text)] uppercase tracking-wider">2. Contenido</p>
              <div className="space-y-2">
                <div>
                  <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Título</label>
                  <input
                    value={toastTitle}
                    onChange={e => setToastTitle(e.target.value)}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-[11px] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                    placeholder="Título del toast..."
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Mensaje</label>
                  <textarea
                    value={toastMessage}
                    onChange={e => setToastMessage(e.target.value)}
                    rows={2}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-[11px] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 resize-none"
                    placeholder="Descripción del evento..."
                  />
                </div>
              </div>
            </div>

            {/* Comportamiento */}
            <div className="bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
              <p className="text-[10px] font-black text-[var(--color-text)] uppercase tracking-wider">3. Comportamiento</p>
              <div className="space-y-2.5">

                {/* Duración */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-[var(--color-text)]">Auto-descarte</p>
                    <p className="text-[9px] text-[var(--color-text-muted)]">0 = permanente hasta X</p>
                  </div>
                  <div className="flex gap-1">
                    {[['0', 'Perm.'], ['3000', '3s'], ['4500', '4.5s'], ['7000', '7s']].map(([val, lbl]) => (
                      <button
                        key={val}
                        onClick={() => setDuration(val)}
                        className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all cursor-pointer ${
                          duration === val
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-indigo-400/40'
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle: Barra de progreso */}
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-[var(--color-text)]">Barra de progreso</p>
                  <button
                    onClick={() => setShowProgress(v => !v)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-200 ease-in-out cursor-pointer outline-none focus:outline-none ${
                      showProgress ? 'bg-indigo-600 border-indigo-500' : 'bg-[var(--color-surface-2)] border-[var(--color-border)]'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ml-0.5 ${showProgress ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Toggle: Pausar en hover */}
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-[var(--color-text)]">Pausar al hacer hover</p>
                  <button
                    onClick={() => setPauseOnHover(v => !v)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-200 ease-in-out cursor-pointer outline-none focus:outline-none ${
                      pauseOnHover ? 'bg-indigo-600 border-indigo-500' : 'bg-[var(--color-surface-2)] border-[var(--color-border)]'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ml-0.5 ${pauseOnHover ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Toggle: Guardar en historial */}
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-[var(--color-text)]">Guardar en historial (bandeja)</p>
                  <button
                    onClick={() => setAddToHistory(v => !v)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-200 ease-in-out cursor-pointer outline-none focus:outline-none ${
                      addToHistory ? 'bg-indigo-600 border-indigo-500' : 'bg-[var(--color-surface-2)] border-[var(--color-border)]'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ml-0.5 ${addToHistory ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Toggle: Botón de acción */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-[var(--color-text)]">Botón de acción clickeable</p>
                    <button
                      onClick={() => setHasAction(v => !v)}
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-200 ease-in-out cursor-pointer outline-none focus:outline-none ${
                        hasAction ? 'bg-indigo-600 border-indigo-500' : 'bg-[var(--color-surface-2)] border-[var(--color-border)]'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ml-0.5 ${hasAction ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <AnimatePresence>
                    {hasAction && (
                      <motion.input
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        value={actionLabel}
                        onChange={e => setActionLabel(e.target.value)}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-[11px] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                        placeholder="Texto del botón (ej: Ver pedido)"
                      />
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </div>

            {/* Código generado */}
            <div className="bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-2xl p-4 space-y-2">
              <p className="text-[10px] font-black text-[var(--color-text)] uppercase tracking-wider">4. Código generado</p>
              <pre className="text-[10px] font-mono text-emerald-400 bg-[var(--color-bg)]/60 rounded-xl p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap">{generatedCode}</pre>
            </div>
          </div>

          {/* ── Columna derecha: Preview + Campana + Historial ───────────────── */}
          <div className="flex flex-col gap-4">

            {/* Preview del toast */}
            <div className="bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
              <p className="text-[10px] font-black text-[var(--color-text)] uppercase tracking-wider">Preview en vivo</p>

              {/* Vista previa estática del toast */}
              <div className={`rounded-2xl border-l-[3px] ${cfg.border} bg-[var(--color-surface)] shadow-xl overflow-hidden`} style={{ borderColor: '' }}>
                {showProgress && Number(duration) > 0 && (
                  <div className="h-0.5 bg-[var(--color-border)]">
                    <div className={`h-full ${cfg.bar} w-[60%] transition-all`} />
                  </div>
                )}
                <div className="flex items-start gap-3 p-3.5 pt-4">
                  <div className={`p-1.5 rounded-xl shrink-0 ${cfg.bg}`}>
                    <div className={`w-3.5 h-3.5 rounded-full ${cfg.bar} opacity-80`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-[var(--color-text)] leading-tight">{toastTitle || 'Título del toast'}</p>
                    {toastMessage && <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{toastMessage}</p>}
                    {hasAction && actionLabel && (
                      <button className={`mt-1.5 flex items-center gap-1 text-[10px] font-bold ${cfg.color} cursor-pointer`}>
                        {actionLabel} <ChevronRight size={9} />
                      </button>
                    )}
                  </div>
                  <div className="shrink-0 p-1 rounded-lg bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
                    <X size={12} />
                  </div>
                </div>
              </div>

              {/* Botón de disparo */}
              <button
                onClick={fireToast}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-[11px] font-black uppercase rounded-xl text-white shadow-lg shadow-indigo-500/20 transition-all cursor-pointer tracking-wider"
              >
                🚀 Disparar Toast
              </button>
            </div>

            {/* Campana con badge */}
            <div className="bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
              <p className="text-[10px] font-black text-[var(--color-text)] uppercase tracking-wider">Campana + Bandeja</p>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => { setTrayOpen(v => !v); setBadgeCount(0); }}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                      trayOpen
                        ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-400'
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    <Bell size={16} strokeWidth={1.8} />
                  </button>
                  <AnimatePresence>
                    {badgeCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full shadow-lg"
                      >
                        {badgeCount > 99 ? '99+' : badgeCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)]">
                  {badgeCount > 0 ? `${badgeCount} sin leer — clic para ver` : 'Sin notificaciones nuevas'}
                </p>
              </div>

              {/* Mini-bandeja inline */}
              <AnimatePresence>
                {trayOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border border-[var(--color-border)] rounded-xl overflow-hidden max-h-[200px] overflow-y-auto">
                      {history.length === 0 ? (
                        <div className="py-6 text-center text-[10px] text-[var(--color-text-muted)] opacity-50">Sin historial aún</div>
                      ) : (
                        history.map(n => {
                          const c = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
                          return (
                            <div key={n.id} className="flex items-start gap-2.5 px-3 py-2.5 border-b border-[var(--color-border)]/40 hover:bg-[var(--color-surface-2)]/40 transition-colors">
                              <div className={`p-1 rounded-lg shrink-0 ${c.bg} mt-0.5`}>
                                <div className={`w-2.5 h-2.5 rounded-full ${c.bar} opacity-80`} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-[var(--color-text)] truncate">{n.title}</p>
                                {n.message && <p className="text-[9px] text-[var(--color-text-muted)] truncate">{n.message}</p>}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    {history.length > 0 && (
                      <button
                        onClick={() => setHistory([])}
                        className="mt-1.5 w-full text-[9px] text-[var(--color-text-muted)] hover:text-red-400 transition-colors cursor-pointer text-center"
                      >
                        Limpiar historial
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Toasts en vivo flotantes (en el propio panel) */}
            <div className="relative">
              <AnimatePresence>
                {liveToasts.map((toast, i) => {
                  const c = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info;
                  return (
                    <motion.div
                      key={toast.id}
                      initial={{ opacity: 0, x: 40, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 40, scale: 0.9 }}
                      className={`mb-2 rounded-2xl border-l-[3px] ${c.border} bg-[var(--color-surface)] shadow-lg overflow-hidden`}
                    >
                      {toast.showProgress && toast.duration > 0 && (
                        <div className="h-0.5 bg-[var(--color-border)]">
                          <motion.div
                            className={`h-full ${c.bar}`}
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                          />
                        </div>
                      )}
                      <div className="flex items-start gap-2.5 p-3">
                        <div className={`p-1 rounded-lg shrink-0 ${c.bg} mt-0.5`}>
                          <div className={`w-2.5 h-2.5 rounded-full ${c.bar} opacity-80`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-[var(--color-text)]">{toast.title}</p>
                          {toast.message && <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5">{toast.message}</p>}
                          {toast.action && (
                            <span className={`text-[9px] font-bold ${c.color} mt-1 block`}>{toast.action.label} →</span>
                          )}
                        </div>
                        <button onClick={() => removeToast(toast.id)} className="shrink-0 p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer">
                          <X size={10} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    );
  },

};


// ─── Control Panel ────────────────────────────────────────────────────────────

function ControlPanel({ controls }) {
  if (!controls || controls.length === 0) return null;
  return (
    <div className="bg-[var(--color-bg)]/60 border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Sliders size={11} className="text-indigo-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Controles</span>
      </div>
      {controls.map((ctrl, idx) => (
        <div key={idx} className="flex items-center justify-between gap-3">
          <label className="text-[10px] font-semibold text-[var(--color-text-muted)] shrink-0 w-20">{ctrl.label}</label>
          {ctrl.type === 'toggle' && (
            <button
              onClick={() => ctrl.onChange(!ctrl.value)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                ctrl.value ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-400' : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)]'
              }`}
            >
              {ctrl.value ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
              {ctrl.value ? (ctrl.labels?.[1] || 'On') : (ctrl.labels?.[0] || 'Off')}
            </button>
          )}
          {ctrl.type === 'select' && (
            <select
              value={ctrl.value}
              onChange={e => ctrl.onChange(e.target.value)}
              className="bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] text-[10px] rounded-xl px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
            >
              {ctrl.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
          {(ctrl.type === 'text' || ctrl.type === 'number') && (
            <input
              type={ctrl.type}
              value={ctrl.value}
              onChange={e => ctrl.onChange(e.target.value)}
              className="bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] text-[10px] rounded-xl px-2 py-1 flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 min-w-0"
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Layout del Sandbox ──────────────────────────────────────────────────────

function SandboxLayout({ title, description, controls, children }) {
  return (
    <div className="space-y-4 h-full">
      <div>
        <h4 className="text-xs font-black text-[var(--color-text)]">{title}</h4>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{description}</p>
      </div>
      <div className="flex flex-col gap-4 h-full">
        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center min-h-[180px] bg-[var(--color-bg)]/40 border border-dashed border-[var(--color-border)] rounded-2xl p-6 relative">
          <div className="absolute top-2 left-3">
            <span className="text-[8px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest">preview</span>
          </div>
          <div className="w-full max-w-xs">{children}</div>
        </div>
        {/* Controls */}
        <ControlPanel controls={controls} />
      </div>
    </div>
  );
}

// ─── Componente Principal: ComponentSandbox ──────────────────────────────────

// ─── Metadatos para componentes SIN playground (estado informativo) ───────────
// Clasifica el componente por tipo para mostrar un mensaje honesto y útil
const COMPONENT_META = {
  // ── Servicios / Firebase (no renderizables) ──
  'sincronización de firestore en tiempo real': { type: 'hook', label: 'Hook Firebase', color: 'amber', note: 'Hook reactivo. Requiere conexión a Firestore y un proyecto Firebase activo para ejecutarse.' },
  'sistema de transacciones atómicas de inventario': { type: 'service', label: 'Servicio', color: 'amber', note: 'Servicio puro JS. Orquesta runTransaction en Firestore. No tiene UI propia.' },
  'motor dinámico de cupones': { type: 'service', label: 'Servicio', color: 'amber', note: 'Lógica CRUD sobre Firestore. Sin interfaz visual propia. Se integra en el Checkout.' },
  'omnicanalidad whatsapp': { type: 'service', label: 'Servicio', color: 'amber', note: 'Módulo de redirección a WhatsApp. Sin UI propia, se llama desde botones de acción.' },
  'generación pdf': { type: 'service', label: 'Servicio', color: 'amber', note: 'Utilidad de generación de PDF con jsPDF. Sin UI renderizable de forma aislada.' },
  'exportador centralizado pdf': { type: 'service', label: 'Servicio', color: 'amber', note: 'Módulo de generación de PDF. Sin UI propia.' },
  'servicio unificado de whatsapp': { type: 'service', label: 'Servicio', color: 'amber', note: 'Módulo JS puro de sanitización y redirección. Sin interfaz visual.' },
  // ── Hooks (lógica pura) ──
  'hook de control de inactividad': { type: 'hook', label: 'Custom Hook', color: 'violet', note: 'Hook puro de React. Detecta inactividad vía eventos del DOM. Integrar en el componente padre.' },
  'hook de copiado al portapapeles': { type: 'hook', label: 'Custom Hook', color: 'violet', note: 'Custom hook para gestionar copiado al portapapeles con reset temporizado.' },
  'hook de ubicación guardada': { type: 'hook', label: 'Custom Hook', color: 'violet', note: 'Hook reactivo con estado persistido en localStorage y Firestore.' },
  'alertas y confirmaciones globales': { type: 'hook', label: 'Context + Hook', color: 'violet', note: 'Provider de Context React con modal promesificado. Debe envolverse en el árbol de componentes.' },
  // ── Páginas completas (demasiado scope para sandbox) ──
  'página de login híbrida': { type: 'page', label: 'Página Completa', color: 'blue', note: 'Vista completa de login con autenticación Firebase. Requiere Firebase Auth configurado.' },
  'seguimiento de pedido público': { type: 'page', label: 'Página Completa', color: 'blue', note: 'Vista pública con consulta de pedidos por token. Requiere Firestore con datos reales.' },
  // ── Componentes complejos con dependencias externas ──
  'mapa interactivo': { type: 'complex', label: 'Dependencia Externa', color: 'teal', note: 'Requiere Leaflet.js y Nominatim. No renderizable en sandbox sin las librerías cargadas.' },
  'mapa desplegable': { type: 'complex', label: 'Dependencia Externa', color: 'teal', note: 'Wrapper animado del LeafletMapPicker. Requiere Leaflet y Framer Motion.' },
  'carrito de compras completo': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Store Zustand + CartDrawer con Framer Motion. Requiere store inicializado y productos reales.' },
  'modal de checkout multipaso': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Wizard de 3 pasos con validaciones, cupones y Firestore. Requiere store de carrito activo.' },
  'sistema de temas dinámicos': { type: 'complex', label: 'Sistema CSS', color: 'teal', note: 'Inyecta variables CSS en :root. Su efecto es global y ya está activo en todo el dashboard.' },
  'restaurador de aplicación a fábrica': { type: 'complex', label: 'Herramienta Destructiva', color: 'red', note: '⚠️ Borra datos de Firestore en lotes. Solo se ejecuta con confirmación explícita del admin.' },
  'compra rápida por código qr': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Vista pública con lógica de variantes y carrito. Requiere datos de producto de Firestore.' },
  'sistema integral de monetización del desarrollador v2.0': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Sistema de 3 sub-componentes con Firestore y lógica de comisiones. Integración compleja.' },
  'consola de diagnóstico de desarrollador': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Panel de diagnóstico en tiempo real con code-splitting. Ya disponible en el dashboard.' },
  'formulario de producto con ia': { type: 'complex', label: 'Dependencia IA', color: 'teal', note: 'Formulario con integración de Gemini API para sugerencias automáticas.' },
  'creador de filtros de catálogo': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Extrae atributos dinámicamente de una colección de Firestore.' },
  'panel de filtros de catálogo': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Bottom sheet con filtros extraídos de productos reales. Requiere datos de catálogo.' },
  'banner de instalación pwa': { type: 'complex', label: 'API del Navegador', color: 'teal', note: 'Usa el evento beforeinstallprompt del navegador. Solo se activa en contexto real de PWA.' },
};

// Mapa: nombre en minúsculas → clave de playground
export const COMPONENT_SANDBOX_MAP = {
  // ── DarkModeToggle ──
  'switch de modo oscuro (darkmodetoggle)': 'dark_mode_toggle',
  'darkmodetoggle': 'dark_mode_toggle',
  'switch de modo oscuro': 'dark_mode_toggle',
  'dark_mode_toggle': 'dark_mode_toggle',
  'modo oscuro': 'dark_mode_toggle',
  // ── GuidedToast ──
  'notificación toast interactiva (guidedtoast)': 'guided_toast',
  'guidedtoast': 'guided_toast',
  'notificación toast interactiva': 'guided_toast',
  'guided_toast': 'guided_toast',
  'toast guiado': 'guided_toast',
  // ── Botón / BackButton ──
  'boton premium': 'boton_premium',
  'boton_premium': 'boton_premium',
  'botón premium': 'boton_premium',
  'botón de regreso (backbutton)': 'boton_premium',
  'botón de regreso': 'boton_premium',
  'backbutton': 'boton_premium',
  // ── Modal Base ──
  'modal base premium (portals & scroll lock)': 'modal_confirmacion',
  'modal base premium': 'modal_confirmacion',
  'modal_base': 'modal_confirmacion',
  'modal de confirmación': 'modal_confirmacion',
  'modal confirmacion': 'modal_confirmacion',
  'modal base': 'modal_confirmacion',
  // ── Selector de Variantes / Categorías ──
  'selector de categorías (categorymanager)': 'gestor_categorias',
  'selector de categorías': 'gestor_categorias',
  'selector_categorias': 'gestor_categorias',
  'selector de variantes de producto (variantselector)': 'selector_atributos',
  'selector de variantes de producto': 'selector_atributos',
  'selector de variantes': 'selector_atributos',
  'selector desplegable premium (customselect)': 'selector_atributos',
  'selector desplegable premium': 'selector_atributos',
  'selector desplegable': 'selector_atributos',
  // ── Input ──
  'input premium': 'input_premium',
  'input_premium': 'input_premium',
  'campo de texto': 'input_premium',
  // ── Contador / Cantidad ──
  'selector de cantidad (quantityselector)': 'contador_cantidad',
  'selector de cantidad': 'contador_cantidad',
  'quantityselector': 'contador_cantidad',
  'contador': 'contador_cantidad',
  'cantidad': 'contador_cantidad',
  // ── Stepper de pedidos ──
  'stepper de seguimiento de pedidos (ordertracingtimeline)': 'stepper_pedidos',
  'stepper de seguimiento de pedidos (ordertrackingtimeline)': 'stepper_pedidos',
  'stepper de seguimiento de pedidos': 'stepper_pedidos',
  'stepper pedidos': 'stepper_pedidos',
  // ── Paginación ──
  'paginación fluida (pagination)': 'paginacion',
  'paginación fluida': 'paginacion',
  'paginación': 'paginacion',
  'pagination': 'paginacion',
  // ── Tarjeta de Producto ──
  'tarjeta de producto adaptativa y skeleton shimmer (productcard)': 'tarjeta_producto',
  'tarjeta de producto adaptativa y skeleton shimmer': 'tarjeta_producto',
  'tarjeta de producto': 'tarjeta_producto',
  'productcard': 'tarjeta_producto',
  // ── Tarjeta de Pedido Admin ──
  'tarjeta de pedido admin (ordercard)': 'tarjeta_pedido_admin',
  'tarjeta de pedido admin': 'tarjeta_pedido_admin',
  'ordercard': 'tarjeta_pedido_admin',
  // ── Carrusel de Anuncios ──
  'carrusel de anuncios promocionales (catalogbanner)': 'carrusel_anuncios',
  'carrusel de anuncios promocionales': 'carrusel_anuncios',
  'catalogbanner': 'carrusel_anuncios',
  // ── SwipeableBottomSheet ──
  'panel deslizable inferior táctil (swipeablebottomsheet)': 'swipeable_bottom_sheet',
  'panel deslizable inferior táctil': 'swipeable_bottom_sheet',
  'swipeablebottomsheet': 'swipeable_bottom_sheet',
  'swipeable_bottom_sheet': 'swipeable_bottom_sheet',
  'bottom sheet': 'swipeable_bottom_sheet',
  // ── OTPInputField ──
  'entrada de código de verificación celular (otpinputfield)': 'otp_input_field',
  'entrada de código de verificación celular': 'otp_input_field',
  'otpinputfield': 'otp_input_field',
  'otp_input_field': 'otp_input_field',
  'otp': 'otp_input_field',
  // ── CommandPaletteKBar ──
  'paleta de comandos globales (commandpalettekbar)': 'command_palette_kbar',
  'paleta de comandos globales': 'command_palette_kbar',
  'commandpalettekbar': 'command_palette_kbar',
  'command_palette_kbar': 'command_palette_kbar',
  // ── InteractiveCouponBadge ──
  'aplicador animado de cupones con confeti (interactivecouponbadge)': 'interactive_coupon_badge',
  'aplicador animado de cupones con confeti': 'interactive_coupon_badge',
  'interactivecouponbadge': 'interactive_coupon_badge',
  'interactive_coupon_badge': 'interactive_coupon_badge',
  // ── InteractiveTutorialTour ──
  'guía de onboarding paso a paso (interactivetutorialtour)': 'interactive_tutorial_tour',
  'guía de onboarding paso a paso': 'interactive_tutorial_tour',
  'interactivetutorialtour': 'interactive_tutorial_tour',
  'interactive_tutorial_tour': 'interactive_tutorial_tour',
  // ── useDebounceValue ──
  'hook de optimización de búsqueda (usedebouncevalue)': 'use_debounce_value',
  'hook de optimización de búsqueda': 'use_debounce_value',
  'usedebouncevalue': 'use_debounce_value',
  'use_debounce_value': 'use_debounce_value',
  // ── StockHeatmap ──
  'indicador de stock crítico (stockheatmap)': 'stock_heatmap',
  'indicador de stock crítico': 'stock_heatmap',
  'stockheatmap': 'stock_heatmap',
  'stock_heatmap': 'stock_heatmap',
  // ── BentoGrid ──
  'cuadrícula bento responsiva (bentogrid)': 'bento_grid',
  'cuadrícula bento responsiva': 'bento_grid',
  'bentogrid': 'bento_grid',
  'bento_grid': 'bento_grid',
  'bento grid': 'bento_grid',
  // ── useLocalStorageState ──
  'hook de estado auto persistente (uselocalstoragestate)': 'use_local_storage_state',
  'hook de estado auto persistente': 'use_local_storage_state',
  'uselocalstoragestate': 'use_local_storage_state',
  'use_local_storage_state': 'use_local_storage_state',
  'local storage state': 'use_local_storage_state',
  // ── Facturación Comisional ──
  'facturación comisional del desarrollador (developerbillingpanel)': 'facturacion_comisional',
  'facturación comisional del desarrollador': 'facturacion_comisional',
  // ─── Ruleta de la Fortuna ───
  'ruleta de la fortuna de premios': 'ruleta_suerte',
  'ruleta de la fortuna': 'ruleta_suerte',
  'ruleta de la suerte': 'ruleta_suerte',
  'ruleta': 'ruleta_suerte',
  'ruleta_suerte': 'ruleta_suerte',
  'wheel of fortune': 'ruleta_suerte',
  'rafflewheeloffortune': 'ruleta_suerte',
  // ─── Selector de Reservas tipo Agenda ───
  'selector de reservas tipo agenda': 'reservas_agenda',
  'selector de reservas agenda': 'reservas_agenda',
  'selector de reservas': 'reservas_agenda',
  'reservas_agenda': 'reservas_agenda',
  'agenda': 'reservas_agenda',
  'reservas': 'reservas_agenda',
  'agendareservationcalendar': 'reservas_agenda',
  // ── Telemetría Centralizada ──
  'telemetría centralizada (centralfirebaseservice + telemetryservice)': 'telemetria_centralizada',
  'telemetría centralizada': 'telemetria_centralizada',
  'telemetria centralizada': 'telemetria_centralizada',
  'centralfirebaseservice': 'telemetria_centralizada',
  'telemetryservice': 'telemetria_centralizada',
  'telemetria_centralizada': 'telemetria_centralizada',
  // ── Calendario Premium ──
  'selector de fecha y rangos premium (datepickerpremium)': 'calendario_premium',
  'selector de fecha y rangos premium': 'calendario_premium',
  'datepickerpremium': 'calendario_premium',
  'calendario_premium': 'calendario_premium',
  'calendario premium': 'calendario_premium',
  'datepicker': 'calendario_premium',
  // ── Marquesina de Logos ──
  'marquesina de marcas (infinitelogomarquee)': 'infinite_logo_marquee',
  'marquesina de marcas': 'infinite_logo_marquee',
  'marquesina de marcas infinita': 'infinite_logo_marquee',
  'marquesina de marcas infinita (infinitelogomarquee)': 'infinite_logo_marquee',
  'infinitelogomarquee': 'infinite_logo_marquee',
  'infinite_logo_marquee': 'infinite_logo_marquee',
  'marquesina': 'infinite_logo_marquee',
  // ── Menú Radial ──
  'menú radial interactivo (radialinteractivemenu)': 'radial_interactive_menu',
  'menú radial interactivo': 'radial_interactive_menu',
  'radialinteractivemenu': 'radial_interactive_menu',
  'radial_interactive_menu': 'radial_interactive_menu',
  'menú radial': 'radial_interactive_menu',
  'menú de acción flotante radial': 'radial_interactive_menu',
  'menu de accion flotante radial': 'radial_interactive_menu',
  'menú de acción flotante radial (radialinteractivemenu)': 'radial_interactive_menu',
  // ── Tarjeta 3D Holográfica ──
  'tarjeta 3d holográfica (holographictiltcard)': 'holographic_tilt_card',
  'tarjeta 3d holográfica': 'holographic_tilt_card',
  'tarjeta 3d holografica': 'holographic_tilt_card',
  'holographictiltcard': 'holographic_tilt_card',
  'holographic_tilt_card': 'holographic_tilt_card',
  'tarjeta holografica': 'holographic_tilt_card',
  'tarjeta holográfica': 'holographic_tilt_card',
  // ── Botón Magnético ──
  'botón magnético reactivo (magneticbutton)': 'magnetic_button',
  'botón magnético reactivo': 'magnetic_button',
  'boton magnetico reactivo': 'magnetic_button',
  'magneticbutton': 'magnetic_button',
  'magnetic_button': 'magnetic_button',
  'boton magnetico': 'magnetic_button',
  'botón magnético': 'magnetic_button',
  // ── Mazo de Tarjetas Deslizables ──
  'mazo de tarjetas deslizables (swipeablecardstack)': 'swipeable_card_stack',
  'mazo de tarjetas deslizables': 'swipeable_card_stack',
  'mazo tarjetas deslizables': 'swipeable_card_stack',
  'swipeablecardstack': 'swipeable_card_stack',
  'swipeable_card_stack': 'swipeable_card_stack',
  'mazo tarjetas': 'swipeable_card_stack',
  // ── Fondo de Luces Orgánicas ──
  'fondo de luces orgánicas interactivas (interactiveambientglow)': 'interactive_ambient_glow',
  'fondo de luces orgánicas interactivas': 'interactive_ambient_glow',
  'fondo de luces organicas interactivas': 'interactive_ambient_glow',
  'interactiveambientglow': 'interactive_ambient_glow',
  'interactive_ambient_glow': 'interactive_ambient_glow',
  'fondo luces': 'interactive_ambient_glow',
  'fondo luces organicas': 'interactive_ambient_glow',
  'fondo de luces organicas': 'interactive_ambient_glow',
  // ── Empty State ──
  'empty state premium interactivo (emptystate)': 'empty_state',
  'empty state premium interactivo': 'empty_state',
  'empty_state': 'empty_state',
  'empty state': 'empty_state',
  // ── Selector de Boletas de Rifa ──
  'selector de boletas de rifa (rafflenumberselector)': 'selector_boletas_rifas',
  'selector de boletas de rifa': 'selector_boletas_rifas',
  'selector de boletas': 'selector_boletas_rifas',
  'selector_boletas_rifas': 'selector_boletas_rifas',
  'rafflenumberselector': 'selector_boletas_rifas',
  'rifas': 'selector_boletas_rifas',
  'boletas': 'selector_boletas_rifas',
  // ── Ruleta de la Fortuna ──
  'ruleta de la fortuna': 'ruleta_suerte',
  'ruleta de la suerte': 'ruleta_suerte',
  'ruleta': 'ruleta_suerte',
  'ruleta_suerte': 'ruleta_suerte',
  'wheel of fortune': 'ruleta_suerte',
  // ── Selector de Reservas tipo Agenda ──
  'selector de reservas tipo agenda': 'reservas_agenda',
  'selector de reservas agenda': 'reservas_agenda',
  'selector de reservas': 'reservas_agenda',
  'reservas_agenda': 'reservas_agenda',
  'agenda': 'reservas_agenda',
  'reservas': 'reservas_agenda',
  // ── Sistema de Notificaciones Premium ──
  'sistema de notificaciones premium': 'sistema_notificaciones',
  'sistema de notificaciones': 'sistema_notificaciones',
  'sistema_notificaciones': 'sistema_notificaciones',
  'notificaciones': 'sistema_notificaciones',
  'notification system': 'sistema_notificaciones',
  'toaststack': 'sistema_notificaciones',
  'notificationbell': 'sistema_notificaciones',
  'notificationtray': 'sistema_notificaciones',
  'campana de notificaciones': 'sistema_notificaciones',
  'bandeja de notificaciones': 'sistema_notificaciones',
};

export function getSandboxKey(name = '', technicalName = '') {
  const normName = name.toLowerCase().trim();
  const normTech = (technicalName || '').toLowerCase().trim();
  
  let key = COMPONENT_SANDBOX_MAP[normName] || COMPONENT_SANDBOX_MAP[normTech] || null;
  if (key) return key;
  
  const check = (str) => {
    if (!str) return null;
    if (str.includes('marquee') || str.includes('marquesina')) return 'infinite_logo_marquee';
    if (str.includes('radial') || str.includes('menú radial') || str.includes('menu radial')) return 'radial_interactive_menu';
    if (str.includes('tilt') || str.includes('holograf') || str.includes('holográf')) return 'holographic_tilt_card';
    if (str.includes('magnét') || str.includes('magnet') || str.includes('magnetic')) return 'magnetic_button';
    if (str.includes('swipe') || str.includes('desliza') || str.includes('mazo')) return 'swipeable_card_stack';
    if (str.includes('glow') || str.includes('fondo luces') || str.includes('luces orgán') || str.includes('ambient')) return 'interactive_ambient_glow';
    if (str.includes('empty') || str.includes('vacio') || str.includes('vacío')) return 'empty_state';
    if (str.includes('rifa') || str.includes('boleta') || str.includes('ticket') || str.includes('numberselector')) return 'selector_boletas_rifas';
    if (str.includes('ruleta') || str.includes('fortuna') || str.includes('suerte') || str.includes('wheel')) return 'ruleta_suerte';
    if (str.includes('agenda') || str.includes('reserva') || str.includes('cita') || str.includes('calendario')) return 'reservas_agenda';
    if (str.includes('notif') || str.includes('toast') || str.includes('campana') || str.includes('bandeja') || str.includes('bell') || str.includes('tray')) return 'sistema_notificaciones';
    return null;
  };
  
  return check(normName) || check(normTech);
}

export default function ComponentSandbox({ componentName = '', technicalName = '' }) {
  const normalizedName = componentName.toLowerCase().trim();
  console.log('[ComponentSandbox] Received componentName:', componentName, 'technicalName:', technicalName);
  
  const sandboxKey = getSandboxKey(componentName, technicalName);
  
  console.log('[ComponentSandbox] Resolved sandboxKey:', sandboxKey);

  const SandboxComponent = sandboxKey ? SANDBOXES[sandboxKey] : null;
  const meta = COMPONENT_META[normalizedName] || null;

  if (!SandboxComponent) {
    // Detectar color del tipo
    const colorMap = {
      amber: { badge: 'bg-amber-500/10 border-amber-500/25 text-amber-400', icon: '⚙️', pill: 'bg-amber-500/15 text-amber-400' },
      violet: { badge: 'bg-violet-500/10 border-violet-500/25 text-violet-400', icon: '🪝', pill: 'bg-violet-500/15 text-violet-400' },
      blue: { badge: 'bg-blue-500/10 border-blue-500/25 text-blue-400', icon: '📄', pill: 'bg-blue-500/15 text-blue-400' },
      teal: { badge: 'bg-teal-500/10 border-teal-500/25 text-teal-400', icon: '🧩', pill: 'bg-teal-500/15 text-teal-400' },
      red: { badge: 'bg-red-500/10 border-red-500/25 text-red-400', icon: '⚠️', pill: 'bg-red-500/15 text-red-400' },
      default: { badge: 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)]', icon: '📦', pill: 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]' },
    };
    const c = meta ? (colorMap[meta.color] || colorMap.default) : colorMap.default;

    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[360px] p-6 space-y-5">
        {/* Ícono y badge de tipo */}
        <div className="flex flex-col items-center gap-3">
          <div className={`p-5 border rounded-3xl text-3xl ${c.badge}`}>
            {c.icon}
          </div>
          {meta && (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${c.pill}`}>
              {meta.label}
            </span>
          )}
        </div>

        {/* Mensaje principal */}
        <div className="text-center max-w-[320px] space-y-2">
          <p className="text-sm font-bold text-[var(--color-text)]">
            {meta ? 'Sandbox No Aplicable' : 'Playground No Configurado'}
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
            {meta
              ? meta.note
              : 'Este componente aún no tiene un playground interactivo asignado. Consulta la pestaña Documentación para ver el código completo y los casos de uso.'}
          </p>
        </div>

        {/* Sugerencia de acción */}
        <div className={`w-full max-w-sm p-3.5 rounded-2xl border text-center ${c.badge}`}>
          <p className="text-[10px] font-bold leading-relaxed">
            {meta?.type === 'hook' && '→ Importa el hook en tu componente y pásale los parámetros de configuración.'}
            {meta?.type === 'service' && '→ Importa el servicio como módulo JS y llama sus funciones directamente.'}
            {meta?.type === 'page' && '→ Registra esta vista como ruta en tu router y pásale las props requeridas.'}
            {meta?.type === 'complex' && '→ Instala las dependencias indicadas en la documentación antes de integrar.'}
            {!meta && '→ Revisa la pestaña Documentación para ver el código completo y copiarlo.'}
          </p>
        </div>

        {/* Playgrounds disponibles */}
        <div className="w-full max-w-sm">
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] text-center mb-2">Playgrounds disponibles</p>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.keys(SANDBOXES).map(k => (
              <div key={k} className="px-2.5 py-1.5 bg-indigo-600/8 border border-indigo-500/15 rounded-xl text-[9px] text-indigo-400/70 font-mono text-center">
                {k.replace(/_/g, ' ')}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <SandboxComponent />
    </div>
  );
}
