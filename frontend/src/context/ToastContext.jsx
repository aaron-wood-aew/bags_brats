import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X, HelpCircle } from 'lucide-react';

const ToastContext = createContext(null);

let globalShowToast = null;

// Global helper for non-React files (e.g., axios response interceptors)
export const showGlobalToast = (message, type = 'info', duration = 4000) => {
  if (globalShowToast) {
    globalShowToast(message, type, duration);
  } else {
    // Fallback if provider is not yet mounted
    console.warn("Global toast called before ToastProvider was mounted:", message);
    alert(message);
  }
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// NOTICEABLE TOASTS REFINEMENTS (Purple Complementary Success Toast)
const TOAST_STYLES = {
  success: {
    borderColor: '#8b5cf6', // Striking Violet border
    glowColor: 'rgba(139, 92, 246, 0.25)', // Deep Purple aura glow
    icon: CheckCircle,
    iconColor: '#a78bfa' // Neon Purple icon
  },
  error: {
    borderColor: '#f43f5e', // Neon Crimson border
    glowColor: 'rgba(244, 63, 94, 0.25)',
    icon: AlertCircle,
    iconColor: '#f43f5e'
  },
  warning: {
    borderColor: '#fbbf24', // Amber Gold border
    glowColor: 'rgba(251, 191, 36, 0.25)',
    icon: AlertTriangle,
    iconColor: '#fbbf24'
  },
  info: {
    borderColor: '#06b6d4', // Teal/Cyan border
    glowColor: 'rgba(6, 182, 212, 0.25)',
    icon: Info,
    iconColor: '#06b6d4'
  }
};

const Toast = ({ id, message, type, duration = 4000, onDismiss }) => {
  const style = TOAST_STYLES[type] || TOAST_STYLES.info;
  const Icon = style.icon;

  React.useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.9, x: 50 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.85, x: 50, transition: { duration: 0.2 } }}
      whileHover={{ scale: 1.02 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        background: 'rgba(10, 17, 30, 0.88)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        borderLeft: `6px solid ${style.borderColor}`, // Thicker Left Border
        borderRadius: '14px',
        padding: '16px 20px',
        color: '#f3f4f6',
        boxShadow: `0 15px 35px -5px rgba(0, 0, 0, 0.5), 0 0 20px ${style.glowColor}`, // Boosted Glow Shadow
        minWidth: '300px',
        maxWidth: '460px',
        pointerEvents: 'auto',
        fontFamily: "'Outfit', sans-serif"
      }}
    >
      <Icon size={22} style={{ color: style.iconColor, flexShrink: 0 }} />
      <span style={{ fontSize: '14px', fontWeight: '600', flexGrow: 1, lineHeight: '1.4', letterSpacing: '-0.01em' }}>
        {message}
      </span>
      <button
        onClick={() => onDismiss(id)}
        style={{
          background: 'none',
          border: 'none',
          color: '#9ca3af',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.2s',
          borderRadius: '4px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#f3f4f6'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

// PREMIUM GLASSMORPHIC CONFIRM MODAL COMPONENT
const ConfirmModal = ({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'purple', onConfirm, onCancel }) => {
  const isDanger = type === 'danger';
  const isWarning = type === 'warning';

  const accentColor = isDanger ? '#ef4444' : isWarning ? '#fbbf24' : '#8b5cf6';
  const glowColor = isDanger ? 'rgba(239, 68, 68, 0.15)' : isWarning ? 'rgba(251, 191, 36, 0.15)' : 'rgba(139, 92, 246, 0.15)';
  const gradient = isDanger 
    ? 'linear-gradient(135deg, #ef4444, #b91c1c)' 
    : isWarning 
      ? 'linear-gradient(135deg, #fbbf24, #d97706)' 
      : 'linear-gradient(135deg, #8b5cf6, #6366f1)';

  const btnTextColor = isWarning ? '#111827' : '#ffffff';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'rgba(5, 8, 15, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        pointerEvents: 'auto',
        fontFamily: "'Outfit', sans-serif"
      }}
    >
      {/* Click outside to cancel */}
      <div 
        onClick={onCancel}
        style={{ position: 'absolute', inset: 0, zIndex: -1 }} 
      />

      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10, transition: { duration: 0.15 } }}
        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
        style={{
          background: 'rgba(13, 21, 32, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderTop: `4px solid ${accentColor}`,
          borderRadius: '24px',
          padding: '28px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 35px ${glowColor}`,
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div
            style={{
              background: isDanger ? 'rgba(239, 68, 68, 0.1)' : isWarning ? 'rgba(251, 191, 36, 0.1)' : 'rgba(139, 92, 246, 0.1)',
              borderRadius: '12px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <HelpCircle size={24} style={{ color: accentColor }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.02em', margin: 0, color: '#f3f4f6' }}>
              {title}
            </h3>
            <p style={{ fontSize: '14px', fontWeight: '400', color: '#94a3b8', lineHeight: '1.5', margin: 0 }}>
              {message}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '12px 20px',
              color: '#94a3b8',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.color = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            style={{
              background: gradient,
              border: 'none',
              borderRadius: '12px',
              padding: '12px 22px',
              color: btnTextColor,
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: `0 4px 14px ${glowColor}`,
              transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.filter = 'brightness(1.1)';
              e.currentTarget.style.boxShadow = `0 6px 20px ${glowColor}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.filter = 'none';
              e.currentTarget.style.boxShadow = `0 4px 14px ${glowColor}`;
            }}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  
  // Custom Confirm Dialog States
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // PROMISE-BASED CONFIRM BRIDGE
  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmConfig({
        ...options,
        resolve: (value) => {
          setShowConfirm(false);
          resolve(value);
        }
      });
      setShowConfirm(true);
    });
  }, []);

  // Register internal state setter globally
  globalShowToast = showToast;

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, confirm }}>
      {children}
      
      {/* Toast container portal/overlay */}
      <div className="toast-container">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              {...toast}
              onDismiss={dismissToast}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Center-aligned custom confirmation modal portal */}
      <AnimatePresence>
        {showConfirm && confirmConfig && (
          <ConfirmModal
            {...confirmConfig}
            onCancel={() => confirmConfig.resolve(false)}
            onConfirm={() => confirmConfig.resolve(true)}
          />
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};
