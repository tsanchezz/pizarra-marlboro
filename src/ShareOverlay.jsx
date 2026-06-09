import { useEffect, useRef, useState } from 'react';

export default function ShareOverlay({ dataUrl, onClose }) {
  const blobRef = useRef(null);
  const [tip, setTip] = useState('');
  const [showShareBtn, setShowShareBtn] = useState(false);

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setShowShareBtn(!!navigator.share);
    if (navigator.share) {
      setTip(isTouch
        ? 'Tocá "Compartir" para enviarla, o mantené presionada la imagen para guardarla.'
        : 'Click derecho sobre la imagen para guardarla.');
    } else {
      setTip(isTouch
        ? 'Mantené presionada la imagen para guardarla o compartirla.'
        : 'Click derecho sobre la imagen → "Guardar imagen como…"');
    }

    // precompute blob
    if (dataUrl) {
      fetch(dataUrl).then(r => r.blob()).then(b => { blobRef.current = b; });
    }
  }, [dataUrl]);

  async function handleShare() {
    try {
      let blob = blobRef.current;
      if (!blob) {
        const r = await fetch(dataUrl);
        blob = await r.blob();
      }
      const file = new File([blob], 'tactica_libertadores.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: 'Libertadores de Marlboro', files: [file] });
      } else {
        setTip('Mantené presionada la imagen para guardarla');
      }
    } catch {
      setTip('Mantené presionada la imagen para guardarla');
    }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ov-title">Captura de la táctica</div>
      <img
        className="ov-img"
        src={dataUrl}
        alt="Táctica"
        style={{ WebkitTouchCallout: 'default', userSelect: 'auto', WebkitUserSelect: 'auto' }}
      />
      <div className="ov-tip">{tip}</div>
      <div className="ov-actions">
        {showShareBtn && (
          <button className="ov-btn primary" onClick={handleShare}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            Compartir
          </button>
        )}
        <button className="ov-btn ghost" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
