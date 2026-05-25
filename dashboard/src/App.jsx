import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const API = 'http://35.172.87.68:8001'

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function pct(val, total) {
  if (!total) return 0
  return Math.round((val / total) * 100)
}

function score(lot) {
  return pct(lot.alta, lot.total_detections)
}

function verdict(sc) {
  if (sc >= 80) return { label: 'EXPORTABLE', cls: 'badge-exp',   bar: '#C8F04A' }
  if (sc >= 50) return { label: 'MEDIO',      cls: 'badge-media', bar: '#FACC15' }
  return              { label: 'BAJO',        cls: 'badge-baja',  bar: '#F87171' }
}

function recommendation(lot) {
  const sc = score(lot)
  const bajaPct = pct(lot.baja, lot.total_detections)
  const mediaPct = pct(lot.media, lot.total_detections)

  if (sc >= 80) return {
    icon: '✅',
    title: 'Lote apto para exportación',
    text: `El ${sc}% de los granos son de alta calidad. Este lote cumple estándares de exportación. Se recomienda proceder con la venta a precio premium.`,
    color: '#4ADE80'
  }
  if (sc >= 60) return {
    icon: '⚠️',
    title: 'Lote con calidad aceptable',
    text: `El ${sc}% son granos de alta calidad. Con un ${bajaPct}% de defectos, se recomienda separar manualmente los granos malos antes de la venta para mejorar el precio.`,
    color: '#FACC15'
  }
  if (sc >= 40) return {
    icon: '🔶',
    title: 'Lote con defectos moderados',
    text: `Solo el ${sc}% son granos aptos. El ${bajaPct}% presenta defectos graves. Se recomienda no vender aún y revisar el proceso de secado o despulpado.`,
    color: '#FACC15'
  }
  return {
    icon: '❌',
    title: 'Lote no apto para venta',
    text: `El ${bajaPct}% de los granos presentan defectos graves. Este lote sería rechazado o pagado al mínimo. Se recomienda revisar el proceso de beneficio y esperar más tiempo de secado.`,
    color: '#F87171'
  }
}

function fmtDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function fmtShort(str) {
  if (!str) return '—'
  return new Date(str).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

// ─────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────
const Icon = ({ d, size = 18, cls = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={cls}>
    <path d={d} />
  </svg>
)

const Icons = {
  grid:    'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  list:    'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  refresh: 'M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15',
  eye:     'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z',
  close:   'M18 6L6 18M6 6l12 12',
  warn:    'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
  coffee:  'M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3',
  chart:   'M18 20V10M12 20V4M6 20v-6',
  check:   'M20 6L9 17l-5-5',
  img:     'M21 19a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2-3h4l2 3h4a2 2 0 012 2z M12 13a3 3 0 100-6 3 3 0 000 6z',
}

// ─────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────
function Sidebar({ view, setView, total }) {
  const links = [
    { id: 'overview', icon: Icons.grid,  label: 'Resumen' },
    { id: 'lots',     icon: Icons.list,  label: 'Lotes', badge: total },
  ]
  return (
    <aside style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      className="fixed left-0 top-0 h-full w-52 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-800 text-sm"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}>CV</div>
          <div>
            <p className="font-display font-700 text-sm" style={{ color: 'var(--text)' }}>CaféVision</p>
            <p className="text-xs font-mono" style={{ color: 'var(--subtle)' }}>Sistema IA</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ id, icon, label, badge }) => {
          const active = view === id
          return (
            <button key={id} onClick={() => setView(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150"
              style={{
                background: active ? 'rgba(200,240,74,0.10)' : 'transparent',
                color: active ? '#C8F04A' : 'var(--subtle)',
                border: active ? '1px solid rgba(200,240,74,0.2)' : '1px solid transparent',
              }}>
              <Icon d={icon} size={15} />
              <span className="font-body font-500 flex-1 text-left">{label}</span>
              {badge > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(200,240,74,0.15)', color: '#C8F04A' }}>{badge}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Status */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: '#4ADE80' }} />
          <span className="text-[11px] font-mono" style={{ color: 'var(--subtle)' }}>API activa</span>
        </div>
        <p className="text-[10px] font-mono truncate" style={{ color: 'var(--muted)' }}>{API}</p>
      </div>
    </aside>
  )
}

// ─────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────
function Skel({ h = 'h-6', w = 'w-full', rounded = 'rounded-lg' }) {
  return <div className={`skeleton ${h} ${w} ${rounded}`} />
}

// ─────────────────────────────────────────────
// KPI CARD
// ─────────────────────────────────────────────
function KpiCard({ label, value, sub, color = 'var(--text)', delay = '' }) {
  return (
    <div className={`glass rounded-xl p-5 fade-up-${delay}`}
      style={{ border: '1px solid var(--border)' }}>
      <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--subtle)' }}>{label}</p>
      <p className="font-display text-3xl font-700 leading-none" style={{ color }}>{value}</p>
      {sub && <p className="text-xs mt-1.5 font-body" style={{ color: 'var(--subtle)' }}>{sub}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────
// BAR ROW
// ─────────────────────────────────────────────
function BarRow({ label, count, total, color }) {
  const p = pct(count, total)
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-body" style={{ color: 'var(--subtle)' }}>{label}</span>
        <span className="text-xs font-mono" style={{ color }}>{count} <span style={{ color: 'var(--muted)' }}>({p}%)</span></span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${p}%`, background: color }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// LOT MODAL
// ─────────────────────────────────────────────
function LotModal({ lot, onClose }) {
  const sc   = score(lot)
  const vrd  = verdict(sc)
  const rec  = recommendation(lot)
  const altP = pct(lot.alta,  lot.total_detections)
  const medP = pct(lot.media, lot.total_detections)
  const bajP = pct(lot.baja,  lot.total_detections)

  useEffect(() => {
    const fn = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="w-full max-w-3xl rounded-2xl overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <p className="font-display font-700 text-base" style={{ color: 'var(--text)' }}>
              Lote #{lot.id}
            </p>
            <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--subtle)' }}>{lot.filename}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono font-700 px-2.5 py-1 rounded-lg ${vrd.cls}`}>{vrd.label}</span>
            <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:opacity-70"
              style={{ color: 'var(--subtle)' }}>
              <Icon d={Icons.close} size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Imagen procesada */}
          {lot.image_url && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--subtle)' }}>Imagen procesada por IA</span>
                <a href={lot.image_url} target="_blank" rel="noreferrer"
                  className="text-[11px] font-mono transition-opacity hover:opacity-70" style={{ color: '#C8F04A' }}>
                  Ver original ↗
                </a>
              </div>
              <img src={lot.image_url} alt={`Lote ${lot.id}`}
                className="w-full object-contain"
                style={{ maxHeight: '320px', background: '#000' }}
                onError={e => { e.target.style.display = 'none' }}
              />
            </div>
          )}

          {/* Quality Score */}
          <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--subtle)' }}>Quality Score</p>
            <div className="flex items-end gap-4 mb-4">
              <span className="font-display font-800 text-5xl leading-none text-gradient">{sc}%</span>
              <div className="mb-1">
                <p className="font-display font-600 text-base" style={{ color: 'var(--text)' }}>{vrd.label}</p>
                <p className="text-xs font-body" style={{ color: 'var(--subtle)' }}>{lot.total_detections} granos detectados</p>
              </div>
            </div>
            <div className="progress-track" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${sc}%`, background: `linear-gradient(90deg, ${vrd.bar}, #C8F04A)` }} />
            </div>
          </div>

          {/* Distribución */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Alta calidad', count: lot.alta,  color: '#4ADE80', bg: 'rgba(74,222,128,.08)',  border: 'rgba(74,222,128,.2)' },
              { label: 'Media calidad', count: lot.media, color: '#FACC15', bg: 'rgba(250,204,21,.08)', border: 'rgba(250,204,21,.2)' },
              { label: 'Baja calidad',  count: lot.baja,  color: '#F87171', bg: 'rgba(248,113,113,.08)',border: 'rgba(248,113,113,.2)' },
            ].map(({ label, count, color, bg, border }) => (
              <div key={label} className="rounded-xl p-4" style={{ background: bg, border: `1px solid ${border}` }}>
                <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--subtle)' }}>{label}</p>
                <p className="font-display text-3xl font-700" style={{ color }}>{count}</p>
                <p className="text-xs font-body mt-0.5" style={{ color: 'var(--subtle)' }}>
                  {pct(count, lot.total_detections)}% del lote
                </p>
                <div className="progress-track mt-2">
                  <div className="progress-fill" style={{ width: `${pct(count, lot.total_detections)}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Recomendación */}
          <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: `1px solid ${rec.color}33` }}>
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">{rec.icon}</span>
              <div>
                <p className="font-display font-600 text-sm mb-1.5" style={{ color: rec.color }}>{rec.title}</p>
                <p className="text-sm font-body leading-relaxed" style={{ color: 'var(--subtle)' }}>{rec.text}</p>
              </div>
            </div>
          </div>

          {/* Detalle de distribución con barras */}
          <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--subtle)' }}>Distribución detallada</p>
            <BarRow label="Alta calidad"  count={lot.alta}  total={lot.total_detections} color="#4ADE80" />
            <BarRow label="Media calidad" count={lot.media} total={lot.total_detections} color="#FACC15" />
            <BarRow label="Baja calidad"  count={lot.baja}  total={lot.total_detections} color="#F87171" />
          </div>

          {/* Metadata */}
          <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--subtle)' }}>Información del análisis</p>
            <div className="space-y-2">
              {[
                { k: 'ID del lote',      v: `#${lot.id}` },
                { k: 'Archivo',          v: lot.filename },
                { k: 'Fecha análisis',   v: fmtDate(lot.created_at) },
                { k: 'Total detecciones', v: lot.total_detections },
              ].map(({ k, v }) => (
                <div key={k} className="flex justify-between items-center py-1.5"
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-xs font-mono" style={{ color: 'var(--subtle)' }}>{k}</span>
                  <span className="text-xs font-mono" style={{ color: 'var(--text)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// LOT CARD (grid)
// ─────────────────────────────────────────────
function LotCard({ lot, onClick }) {
  const sc  = score(lot)
  const vrd = verdict(sc)
  const [imgError, setImgError] = useState(false)

  return (
    <button onClick={() => onClick(lot)}
      className="glass card-hover rounded-xl overflow-hidden text-left w-full"
      style={{ border: '1px solid var(--border)' }}>
      {/* Image */}
      <div className="relative" style={{ background: '#000', aspectRatio: '16/9' }}>
        {!imgError
          ? <img src={lot.image_url} alt={`Lote ${lot.id}`}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)} />
          : <div className="w-full h-full flex flex-col items-center justify-center gap-2"
              style={{ color: 'var(--muted)' }}>
              <Icon d={Icons.img} size={28} />
              <span className="text-xs font-mono">Sin imagen</span>
            </div>
        }
        {/* Badges overlay */}
        <div className="absolute top-2 left-2">
          <span className="text-[10px] font-mono font-700 px-2 py-1 rounded-md"
            style={{ background: 'rgba(0,0,0,.75)', color: 'var(--subtle)' }}>
            Lote #{lot.id}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className={`text-[10px] font-mono font-700 px-2 py-1 rounded-md ${vrd.cls}`}>
            {vrd.label}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        {/* Score row */}
        <div className="flex items-center justify-between">
          <span className="font-display font-700 text-xl" style={{ color: vrd.bar }}>{sc}%</span>
          <span className="text-xs font-mono" style={{ color: 'var(--subtle)' }}>
            {lot.total_detections} granos
          </span>
        </div>

        {/* Mini bars */}
        <div className="space-y-1.5">
          {[
            { label: 'Alta',  v: lot.alta,  c: '#4ADE80' },
            { label: 'Media', v: lot.media, c: '#FACC15' },
            { label: 'Baja',  v: lot.baja,  c: '#F87171' },
          ].map(({ label, v, c }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-[10px] font-mono w-8" style={{ color: 'var(--muted)' }}>{label}</span>
              <div className="progress-track flex-1">
                <div className="progress-fill" style={{ width: `${pct(v, lot.total_detections)}%`, background: c }} />
              </div>
              <span className="text-[10px] font-mono w-6 text-right" style={{ color: c }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Date */}
        <p className="text-[10px] font-mono" style={{ color: 'var(--muted)' }}>{fmtShort(lot.created_at)}</p>

        {/* CTA */}
        <div className="flex items-center gap-1.5 pt-1" style={{ color: '#C8F04A', fontSize: 11 }}>
          <Icon d={Icons.eye} size={12} cls="opacity-70" />
          <span className="font-mono opacity-70">Ver análisis completo</span>
        </div>
      </div>
    </button>
  )
}

// ─────────────────────────────────────────────
// OVERVIEW VIEW
// ─────────────────────────────────────────────
function OverviewView({ lots, metrics, loading, onSelectLot }) {
  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="glass rounded-xl p-5" style={{ border: '1px solid var(--border)' }}><Skel h="h-8" w="w-16" /><Skel h="h-4" w="w-24" /></div>)}
      </div>
    </div>
  )

  const totalLotes   = lots.length
  const avgScore     = totalLotes ? Math.round(lots.reduce((s, l) => s + score(l), 0) / totalLotes) : 0
  const exportables  = lots.filter(l => score(l) >= 80).length
  const medios       = lots.filter(l => score(l) >= 50 && score(l) < 80).length
  const bajos        = lots.filter(l => score(l) < 50).length
  const recent5      = [...lots].slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-700" style={{ color: 'var(--text)' }}>Resumen general</h1>
        <p className="text-sm mt-1 font-body" style={{ color: 'var(--subtle)' }}>
          Estadísticas de todos los lotes analizados por el sistema IA
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Lotes analizados"    value={totalLotes}     sub="imágenes procesadas"          color="var(--text)"  delay="1" />
        <KpiCard label="Score promedio"      value={`${avgScore}%`} sub="calidad alta promedio"         color="#C8F04A"      delay="2" />
        <KpiCard label="Granos detectados"   value={metrics?.total_detections ?? '—'} sub="total histórico"  color="var(--text)"  delay="3" />
        <KpiCard label="Lotes exportables"   value={exportables}    sub={`de ${totalLotes} lotes`}     color="#4ADE80"      delay="4" />
      </div>

      {/* Distribution global */}
      {metrics && (
        <div className="grid grid-cols-2 gap-4">
          <div className="glass rounded-xl p-5 fade-up-1" style={{ border: '1px solid var(--border)' }}>
            <p className="text-[10px] font-mono uppercase tracking-widest mb-4" style={{ color: 'var(--subtle)' }}>
              Distribución global de granos
            </p>
            <div className="space-y-4">
              <BarRow label="Alta calidad"  count={metrics.distribution.alta}  total={metrics.total_detections} color="#4ADE80" />
              <BarRow label="Media calidad" count={metrics.distribution.media} total={metrics.total_detections} color="#FACC15" />
              <BarRow label="Baja calidad"  count={metrics.distribution.baja}  total={metrics.total_detections} color="#F87171" />
            </div>
          </div>

          <div className="glass rounded-xl p-5 fade-up-2" style={{ border: '1px solid var(--border)' }}>
            <p className="text-[10px] font-mono uppercase tracking-widest mb-4" style={{ color: 'var(--subtle)' }}>
              Estado de los lotes
            </p>
            <div className="space-y-3">
              {[
                { label: 'Exportables (≥80%)', count: exportables, color: '#4ADE80', cls: 'badge-exp' },
                { label: 'Medios (50–79%)',     count: medios,      color: '#FACC15', cls: 'badge-media' },
                { label: 'Bajos (<50%)',         count: bajos,       color: '#F87171', cls: 'badge-baja' },
              ].map(({ label, count, color, cls }) => (
                <div key={label} className="flex items-center justify-between py-2"
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-xs font-body" style={{ color: 'var(--subtle)' }}>{label}</span>
                  <span className={`text-xs font-mono font-700 px-2 py-0.5 rounded-md ${cls}`}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lotes recientes */}
      {recent5.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--subtle)' }}>
            Lotes más recientes
          </p>
          <div className="space-y-2">
            {recent5.map(lot => {
              const sc  = score(lot)
              const vrd = verdict(sc)
              return (
                <button key={lot.id} onClick={() => onSelectLot(lot)}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors text-left"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--muted)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <span className="text-xs font-mono w-10" style={{ color: 'var(--muted)' }}>#{lot.id}</span>
                  <span className="text-xs font-body flex-1 truncate" style={{ color: 'var(--subtle)' }}>{lot.filename}</span>
                  <span className="text-xs font-mono" style={{ color: 'var(--subtle)' }}>{lot.total_detections} granos</span>
                  <span className={`text-[10px] font-mono font-700 px-2 py-0.5 rounded ${vrd.cls}`}>{vrd.label}</span>
                  <span className="font-display font-700 text-sm w-12 text-right" style={{ color: vrd.bar }}>{sc}%</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// LOTS VIEW
// ─────────────────────────────────────────────
function LotsView({ lots, loading, onSelectLot, onRefresh, refreshing }) {
  const [filter, setFilter] = useState('all')

  const filtered = lots.filter(l => {
    const sc = score(l)
    if (filter === 'exportable') return sc >= 80
    if (filter === 'medio')      return sc >= 50 && sc < 80
    if (filter === 'bajo')       return sc < 50
    return true
  })

  if (loading) return (
    <div className="grid grid-cols-3 gap-4">
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="glass rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <Skel h="h-36" rounded="rounded-none" />
          <div className="p-4 space-y-2"><Skel h="h-5" w="w-20" /><Skel h="h-3" /><Skel h="h-3" w="w-3/4" /></div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-700" style={{ color: 'var(--text)' }}>Lotes analizados</h1>
          <p className="text-sm mt-1 font-body" style={{ color: 'var(--subtle)' }}>
            {filtered.length} de {lots.length} lotes · Haz clic en uno para ver el análisis completo
          </p>
        </div>
        <button onClick={onRefresh} disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-opacity hover:opacity-70"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--subtle)' }}>
          <Icon d={Icons.refresh} size={13} cls={refreshing ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { id: 'all',        label: 'Todos' },
          { id: 'exportable', label: 'Exportables' },
          { id: 'medio',      label: 'Medios' },
          { id: 'bajo',       label: 'Bajos' },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setFilter(id)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
            style={{
              background: filter === id ? 'rgba(200,240,74,.1)' : 'var(--card)',
              color: filter === id ? '#C8F04A' : 'var(--subtle)',
              border: filter === id ? '1px solid rgba(200,240,74,.2)' : '1px solid var(--border)',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0
        ? <div className="flex flex-col items-center justify-center h-64 gap-3"
            style={{ color: 'var(--subtle)' }}>
            <Icon d={Icons.warn} size={32} cls="opacity-40" />
            <p className="text-sm font-body">No hay lotes con ese filtro</p>
          </div>
        : <div className="grid grid-cols-3 gap-4">
            {filtered.map(lot => (
              <LotCard key={lot.id} lot={lot} onClick={onSelectLot} />
            ))}
          </div>
      }
    </div>
  )
}

// ─────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────
export default function App() {
  const [view, setView]           = useState('overview')
  const [lots, setLots]           = useState([])
  const [metrics, setMetrics]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedLot, setSelected]  = useState(null)
  const [error, setError]           = useState(null)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    setError(null)
    try {
      const [histRes, metRes] = await Promise.all([
        axios.get(`${API}/history`),
        axios.get(`${API}/metrics`),
      ])
      setLots(histRes.data)
      setMetrics(metRes.data)
    } catch (err) {
      setError('No se pudo conectar con el backend. Verifica que la API esté corriendo.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => fetchData(true), 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleSelectLot = (lot) => {
    setSelected(lot)
    // si estás en overview, abre el modal
  }

  return (
    <div className="flex min-h-screen dot-bg" style={{ background: 'var(--bg)' }}>
      <Sidebar view={view} setView={setView} total={lots.length} />

      <main className="flex-1 p-8 overflow-y-auto" style={{ marginLeft: '208px', minHeight: '100vh' }}>
        {/* Error banner */}
        {error && (
          <div className="mb-6 rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.25)' }}>
            <Icon d={Icons.warn} size={16} cls="text-baja flex-shrink-0" />
            <p className="text-sm font-body" style={{ color: '#F87171' }}>{error}</p>
          </div>
        )}

        {view === 'overview' && (
          <OverviewView lots={lots} metrics={metrics} loading={loading} onSelectLot={handleSelectLot} />
        )}
        {view === 'lots' && (
          <LotsView lots={lots} loading={loading} onSelectLot={handleSelectLot} onRefresh={() => fetchData(true)} refreshing={refreshing} />
        )}
      </main>

      {/* Modal */}
      {selectedLot && <LotModal lot={selectedLot} onClose={() => setSelected(null)} />}
    </div>
  )
}