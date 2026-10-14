(function () {
  const DISPLAY = '"Fraunces", Georgia, serif';
  const TEXT = '"Inter", system-ui, -apple-system, sans-serif';
  const NAVY = '#0f1f3d';
  const GOLD = '#d4a72c';
  const PAPER = '#fbf6ea';

  function prep(id) {
    const c = document.getElementById(id);
    const x = c.getContext('2d');
    x.clearRect(0, 0, c.width, c.height);
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    return { x, w: c.width, h: c.height };
  }

  function wrap(x, text, cx, cy, maxW, lh) {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (x.measureText(t).width > maxW && line) { lines.push(line); line = w; } else { line = t; }
    }
    lines.push(line);
    const y0 = cy - ((lines.length - 1) * lh) / 2;
    lines.forEach((l, i) => x.fillText(l, cx, y0 + i * lh));
  }

  function fit(x, text, maxW, size, weight, family) {
    let s = size;
    do { x.font = `${weight} ${s}px ${family}`; s -= 4; } while (x.measureText(text).width > maxW && s > 20);
  }

  function rival() {
    const { x, w, h } = prep('tx-rival');
    x.fillStyle = '#b3261e';
    x.beginPath(); x.roundRect(8, 8, w - 16, h - 16, 40); x.fill();
    x.strokeStyle = '#ffffff'; x.lineWidth = 8; x.stroke();
    x.fillStyle = '#ffffff';
    fit(x, 'EL INVICTO DEL SALÓN', w - 120, 92, 800, DISPLAY);
    x.fillText('EL INVICTO DEL SALÓN', w / 2, h / 2 - 22);
    x.font = `600 40px ${TEXT}`;
    x.fillStyle = '#ffd9d4';
    x.fillText('Récord: 0 derrotas · hasta hoy', w / 2, h / 2 + 62);
  }

  function slide(id, kicker, title, sub, dark) {
    const { x, w, h } = prep(id);
    x.fillStyle = dark ? NAVY : PAPER;
    x.fillRect(0, 0, w, h);
    x.fillStyle = GOLD;
    x.fillRect(0, 0, w, 18);
    x.fillStyle = dark ? GOLD : '#8a6a12';
    x.font = `700 34px ${TEXT}`;
    x.fillText(kicker, w / 2, 90);
    x.fillStyle = dark ? '#ffffff' : NAVY;
    fit(x, title, w - 120, 104, 800, DISPLAY);
    x.fillText(title, w / 2, h / 2 - 10);
    x.fillStyle = dark ? '#c9d3e6' : '#3a4660';
    x.font = `600 46px ${TEXT}`;
    wrap(x, sub, w / 2, h / 2 + 120, w - 160, 56);
  }

  function palabra() {
    const { x, w, h } = prep('tx-palabra');
    x.fillStyle = PAPER;
    x.beginPath(); x.roundRect(6, 6, w - 12, h - 12, 28); x.fill();
    x.strokeStyle = GOLD; x.lineWidth = 10; x.stroke();
    x.fillStyle = '#6b5a33';
    x.font = `600 44px ${TEXT}`;
    x.fillText('La clave para recibirte es…', w / 2, 120);
    x.fillStyle = NAVY;
    fit(x, 'CONSTANCIA', w - 120, 150, 800, DISPLAY);
    x.fillText('CONSTANCIA', w / 2, h / 2 + 40);
    x.fillStyle = '#8a7a55';
    x.font = `600 32px ${TEXT}`;
    x.fillText('Anotala: el tribunal te la va a pedir', w / 2, h - 70);
  }

  function sello(id, materia) {
    const { x, w, h } = prep('tx-sello-' + id);
    const cx = w / 2, cy = h / 2;
    x.fillStyle = 'rgba(251,246,234,0.92)';
    x.beginPath(); x.arc(cx, cy, 240, 0, Math.PI * 2); x.fill();
    x.strokeStyle = '#1f7a3d'; x.lineWidth = 16;
    x.beginPath(); x.arc(cx, cy, 228, 0, Math.PI * 2); x.stroke();
    x.lineWidth = 5;
    x.beginPath(); x.arc(cx, cy, 196, 0, Math.PI * 2); x.stroke();
    x.fillStyle = '#1f7a3d';
    fit(x, 'APROBADA', 330, 72, 800, DISPLAY);
    x.fillText('APROBADA', cx, cy - 40);
    x.font = `700 30px ${TEXT}`;
    wrap(x, materia, cx, cy + 50, 300, 36);
    x.font = `700 26px ${TEXT}`;
    x.fillText('★ UCU ★', cx, cy + 140);
  }

  function tribunal() {
    const { x, w, h } = prep('tx-tribunal');
    x.fillStyle = NAVY;
    x.beginPath(); x.roundRect(8, 8, w - 16, h - 16, 30); x.fill();
    x.strokeStyle = GOLD; x.lineWidth = 8; x.stroke();
    x.fillStyle = GOLD;
    x.font = `800 96px ${DISPLAY}`;
    x.fillText('TRIBUNAL DE TESIS', w / 2, h / 2 - 16);
    x.fillStyle = '#c9d3e6';
    x.font = `600 36px ${TEXT}`;
    x.fillText('Tocá «Comenzar defensa»', w / 2, h / 2 + 66);
  }

  function diploma(nombre) {
    const { x, w, h } = prep('tx-diploma');
    x.fillStyle = PAPER;
    x.fillRect(0, 0, w, h);
    x.strokeStyle = GOLD; x.lineWidth = 14;
    x.strokeRect(22, 22, w - 44, h - 44);
    x.strokeStyle = NAVY; x.lineWidth = 3;
    x.strokeRect(46, 46, w - 92, h - 92);
    x.fillStyle = '#8a6a12';
    x.font = `700 30px ${TEXT}`;
    x.fillText('BÚSQUEDA DEL TESORO AR · UCU', w / 2, 120);
    x.fillStyle = NAVY;
    x.font = `800 72px ${DISPLAY}`;
    x.fillText('Título de Egreso', w / 2, 210);
    x.fillStyle = '#3a4660';
    x.font = `600 32px ${TEXT}`;
    x.fillText('Se certifica que', w / 2, 300);
    x.fillStyle = NAVY;
    fit(x, nombre || 'Estudiante UCU', w - 200, 84, 800, DISPLAY);
    x.fillText(nombre || 'Estudiante UCU', w / 2, 390);
    x.fillStyle = GOLD; x.fillRect(w / 2 - 260, 450, 520, 4);
    x.fillStyle = '#3a4660';
    x.font = `600 32px ${TEXT}`;
    wrap(x, 'completó las cuatro experiencias UCU y defendió su tesis ante el tribunal', w / 2, 530, w - 260, 42);
    x.fillStyle = '#8a6a12';
    x.font = `700 30px ${TEXT}`;
    x.fillText('Montevideo · ' + new Date().getFullYear(), w / 2, 640);
  }

  function refrescar() {
    document.querySelectorAll('[data-tex]').forEach((el) => {
      const mesh = el.getObject3D && el.getObject3D('mesh');
      if (mesh && mesh.material && mesh.material.map) mesh.material.map.needsUpdate = true;
    });
  }

  function dibujarTodo(nombre, materias) {
    rival();
    slide('tx-slide0', 'AUDITORIO', 'Tu presentación', 'Tocá «Empezar presentación» cuando estés listo', true);
    slide('tx-slide1', '1 / 3', 'Mi tesis', 'Un proyecto que va a cambiar el mundo (o al menos aprobar)', false);
    slide('tx-slide2', '2 / 3', 'Conclusión:', 'Funciona en mi máquina', false);
    slide('tx-slide3', '3 / 3', '¿Preguntas?', '(por favor no)', true);
    palabra();
    Object.keys(materias).forEach((id) => sello(id, materias[id].nombre));
    tribunal();
    diploma(nombre);
    refrescar();
  }

  window.Tex = { dibujarTodo, diploma: (n) => { diploma(n); refrescar(); }, refrescar };
})();
