// Componentes compartidos: etiquetas, formularios, diálogos, estados vacíos, paginación.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TAGS, ROLES } from '../services/domain.jsx';

const palabras = (n = '') => n.split(' ').filter((w) => w && !w.endsWith('.'));
// Inicial del primer nombre + inicial del primer apellido ("Rosa Elena Quispe Mendoza" → RQ).
export const iniciales = (n) => { const p = palabras(n); return [p[0], p[p.length >= 4 ? 2 : 1]].filter(Boolean).map((w) => w[0]).join('').toUpperCase(); };

export const Avatar = ({ name, size = 36, dark }) => (
  <span className={`avatar${dark ? ' dark' : ''}`} style={{ width: size, height: size, fontSize: size * 0.36 }}>{iniciales(name)}</span>
);
export const Tag = ({ k, label }) => {
  const [l, c] = TAGS[k] || [k, 'st-muted'];
  return <span className={`tag ${c}`}>{label || l}</span>;
};
export const RolePill = ({ rol, children }) => <span className={`role-pill ${rol}`}>{children || `Rol: ${ROLES[rol]}`}</span>;
export const Progress = ({ value, tone = '', className = '' }) => (
  <div className={`progress-tfc ${tone} ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${Math.min(100, value)}%` }} /></div>
);
export const LineTags = ({ items = [] }) => <div>{items.map((l) => <span className="line-tag" key={l}>{l}</span>)}</div>;
export const inv = (e) => (e ? ' is-invalid' : '');

export function Field({ label, error, hint, children, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="form-label">{label}</label>}
      {children}
      {error ? <span className="field-error">{error}</span> : hint ? <div className="hint">{hint}</div> : null}
    </div>
  );
}

export function Modal({ title, onClose, children, footer, size = 'md' }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose && onClose();
    document.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <>
      <div className="modal-backdrop-tfc" />
      <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && onClose && onClose()}>
        <div className={`modal-dialog modal-dialog-centered${size === 'lg' ? ' modal-lg' : ''}`}>
          <div className="modal-content">
            <div className="modal-header border-0 pb-0">
              <h2 className="modal-title h-section">{title}</h2>
              {onClose && <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />}
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer border-0 pt-0">{footer}</div>}
          </div>
        </div>
      </div>
    </>
  );
}

// Diálogo de confirmación para acciones destructivas (con motivo opcional/obligatorio).
export function ConfirmModal({ title, children, confirmLabel = 'Confirmar', danger, onConfirm, onClose, motivo, minMotivo = 0, motivoLabel = 'Motivo (obligatorio)' }) {
  const [txt, setTxt] = useState('');
  const [err, setErr] = useState('');
  const go = () => {
    if (motivo && txt.trim().length < minMotivo) return setErr(`Mínimo ${minMotivo} caracteres · ${txt.trim().length} / 500`);
    onConfirm(txt.trim());
  };
  return (
    <Modal title={title} onClose={onClose} footer={<>
      <button className="btn btn-link" onClick={onClose}>Cancelar</button>
      <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={go}>{confirmLabel}</button>
    </>}>
      {children}
      {motivo && (
        <Field label={motivoLabel} error={err} hint={`Mínimo ${minMotivo} caracteres · ${txt.trim().length} / 500`} className="mt-3">
          <textarea className={`form-control${inv(err)}`} rows={3} maxLength={500} value={txt} onChange={(e) => { setTxt(e.target.value); setErr(''); }} />
        </Field>
      )}
    </Modal>
  );
}

export function EmptyState({ icon = '⌕', title, text, action, tone = '' }) {
  return (
    <div className={`empty ${tone}`}>
      <div className="icon">{icon}</div>
      <h2 className="h-section mb-2">{title}</h2>
      {text && <p className="text-muted2 mx-auto mb-3" style={{ maxWidth: 460 }}>{text}</p>}
      {action}
    </div>
  );
}

export function PageHeader({ crumbs = [], title, subtitle, actions }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
      <div>
        {crumbs.length > 0 && (
          <div className="crumbs">{crumbs.map(([l, to], i) => <span key={l}>{i > 0 && ' · '}{to ? <Link to={to}>{l}</Link> : l}</span>)}</div>
        )}
        <h1 className="mb-1">{title}</h1>
        {subtitle && <div className="text-muted2">{subtitle}</div>}
      </div>
      {actions && <div className="d-flex gap-2 align-items-center flex-wrap">{actions}</div>}
    </div>
  );
}

export function Pager({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="d-flex gap-2">
      <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => onChange(page - 1)}>Anterior</button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button key={n} className={`btn btn-sm ${n === page ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => onChange(n)}>{n}</button>
      ))}
      <button className="btn btn-sm btn-outline-secondary" disabled={page === pages} onClick={() => onChange(page + 1)}>Siguiente</button>
    </div>
  );
}

export function TagsInput({ value, onChange, max = 6, placeholder, invalid }) {
  const [txt, setTxt] = useState('');
  const add = () => {
    const v = txt.trim().toLowerCase();
    if (v && !value.includes(v) && value.length < max) onChange([...value, v]);
    setTxt('');
  };
  return (
    <div className={`tags-input${invalid ? ' invalid' : ''}`}>
      {value.map((t) => (
        <span className="line-tag" key={t}>{t}<button type="button" aria-label={`Quitar ${t}`} onClick={() => onChange(value.filter((x) => x !== t))}>×</button></span>
      ))}
      <input value={txt} placeholder={placeholder} onChange={(e) => setTxt(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } if (e.key === 'Backspace' && !txt && value.length) onChange(value.slice(0, -1)); }} onBlur={add} />
    </div>
  );
}

export const PwdChecks = ({ checks }) => (
  <div className="card-tfc flat p-2 px-3 aux">
    {checks.map((c) => <div key={c.label} className={c.ok ? 'text-ok' : ''}>{c.ok ? '✓' : '○'} {c.label}</div>)}
  </div>
);

export const Toasts = ({ toasts, dismiss }) => (
  <div className="toast-stack" aria-live="polite">
    {toasts.map((t) => (
      <div className={`toast-tfc ${t.type}`} key={t.id} role="status">
        <span aria-hidden>{t.type === 'success' ? '✔' : t.type === 'info' ? 'ℹ' : '!'}</span>
        <div className="flex-grow-1"><div className="fw-semibold">{t.title}</div>{t.text && <div className="small">{t.text}</div>}</div>
        <button className="btn-close btn-sm" onClick={() => dismiss(t.id)} aria-label="Cerrar" />
      </div>
    ))}
  </div>
);
