import { useState, useEffect } from 'react';

export default function NamesModal({ players, onSave, onClose }) {
  const [vals, setVals] = useState({});

  useEffect(() => {
    const init = {};
    players.forEach(p => { init[`${p.team}-${p.num}`] = p.label || ''; });
    setVals(init);
  }, [players]);

  const locals = players.filter(p => p.team === 0);
  const visits = players.filter(p => p.team === 1);

  function handleSave() {
    onSave(vals);
  }

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <h3>Editar nombres</h3>

        <div className="team-section">
          <span className="team-label white">⬤ Equipo blanco</span>
          <div className="players-grid">
            {locals.map(p => (
              <div className="player-row" key={p.num}>
                <div className="player-num white">{p.num}</div>
                <input
                  className="player-inp"
                  type="text"
                  maxLength={10}
                  placeholder="Nombre..."
                  value={vals[`${p.team}-${p.num}`] || ''}
                  onChange={e => setVals(v => ({ ...v, [`${p.team}-${p.num}`]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="team-section">
          <span className="team-label red">⬤ Equipo rojo</span>
          <div className="players-grid">
            {visits.map(p => (
              <div className="player-row" key={p.num}>
                <div className="player-num red">{p.num}</div>
                <input
                  className="player-inp"
                  type="text"
                  maxLength={10}
                  placeholder="Nombre..."
                  value={vals[`${p.team}-${p.num}`] || ''}
                  onChange={e => setVals(v => ({ ...v, [`${p.team}-${p.num}`]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="mbtn ok" onClick={handleSave}>Guardar</button>
          <button className="mbtn cl" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
