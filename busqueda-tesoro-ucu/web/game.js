(function () {
  const KEY = 'ucu-ar-tesoro-v1';
  const ORDEN = ['pingpong', 'aulamagna', 'cantina', 'biblioteca'];

  const MATERIAS = {
    pingpong: {
      icono: '🏓',
      nombre: 'Educación Física Universitaria',
      acertijo: 'Acá se viene a encontrarse, pero muchos terminan jugando. Una red parte la mesa en dos.',
      pista: 'Salón de Encuentros, en la mesa de ping pong.'
    },
    aulamagna: {
      icono: '🎤',
      nombre: 'Oratoria y Presentación',
      acertijo: 'El escenario más grande del edificio. Los que presentan nunca miran lo que hay debajo de su mesa.',
      pista: 'Aula Magna: mirá abajo de la mesa del presentador.'
    },
    cantina: {
      icono: '🥐',
      nombre: 'Nutrición Estudiantil',
      acertijo: 'Ningún parcial se rinde con la panza vacía. Buscame justo cuando te toque pagar.',
      pista: 'Cantina, junto a la caja.'
    },
    biblioteca: {
      icono: '📚',
      nombre: 'Investigación Aplicada',
      acertijo: 'Donde el silencio es ley y hay salas que se reservan. Pedí una y mirá el mostrador.',
      pista: 'Biblioteca, en el mostrador donde se piden las salas.'
    }
  };

  const PREGUNTAS = [
    { q: '¿Contra quién jugaste al ping pong?', ok: 'El Invicto del Salón', no: ['El Rey de la Red', 'La Paleta Veloz'] },
    { q: '¿Cuál fue la conclusión de tu presentación?', ok: 'Funciona en mi máquina', no: ['Hay que agregar más tests', 'El deadline era ayer'] },
    { q: '¿Cuántos mordiscos le diste a la medialuna?', ok: '5', no: ['3', '7'] },
    { q: '¿Qué palabra apareció en el libro de la biblioteca?', ok: 'CONSTANCIA', no: ['PACIENCIA', 'EXCELENCIA'] }
  ];

  const TPL_TRIBUNAL = `
    <a-entity class="g-tribunal" visible="false">
      <a-box position="0 0.18 -0.15" width="1.5" height="0.36" depth="0.45" color="#4a2c17"></a-box>
      ${[-0.45, 0, 0.45].map((x) => `
      <a-entity position="${x} 0 -0.55">
        <a-cylinder radius="0.13" height="0.55" position="0 0.28 0" color="#1f2937"></a-cylinder>
        <a-sphere radius="0.12" position="0 0.66 0" color="#e0b48a"></a-sphere>
        <a-cylinder radius="0.1" height="0.06" position="0 0.77 0" color="#111111"></a-cylinder>
        <a-box width="0.3" height="0.02" depth="0.3" position="0 0.8 0" rotation="0 45 0" color="#111111"></a-box>
      </a-entity>`).join('')}
      <a-plane position="0 0.02 0.45" rotation="-90 0 0" width="1.4" height="0.35"
               material="src: #tx-tribunal; shader: flat; transparent: true" data-tex></a-plane>
    </a-entity>`;

  const TPL_GRAD = `
    <a-entity class="g-grad" visible="false">
      <a-plane position="0 0.03 0.1" rotation="-90 0 0" width="1.4" height="0.99"
               material="src: #tx-diploma; shader: flat" data-tex></a-plane>
      <a-entity class="birrete" position="0 0.45 -0.2"
                animation="property: position; dir: alternate; loop: true; to: 0 0.58 -0.2; dur: 1200; easing: easeInOutSine">
        <a-box width="0.5" height="0.025" depth="0.5" rotation="0 45 0" color="#111111"></a-box>
        <a-cylinder radius="0.16" height="0.12" position="0 -0.07 0" color="#111111"></a-cylinder>
        <a-cylinder radius="0.008" height="0.2" position="0.22 -0.1 0" color="#d4a72c"></a-cylinder>
        <a-sphere radius="0.03" position="0.22 -0.21 0" color="#d4a72c"></a-sphere>
      </a-entity>
    </a-entity>`;

  const $ = (id) => document.getElementById(id);
  let S = cargar();
  let actual = null;

  function cargar() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function guardar() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
  }
  function nuevo(nombre) {
    return {
      nombre,
      inicio: Date.now(),
      jugadoMs: 0,
      finMs: null,
      materias: {},
      pistas: {},
      defensa: { intentos: 0, aciertos: 0, aprobada: false },
      graduado: false,
      birrete: false
    };
  }
  const aprobadas = () => ORDEN.filter((id) => S.materias[id]);
  const todasAprobadas = () => aprobadas().length === ORDEN.length;
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const barajar = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);
  const vibrar = (ms) => { if (navigator.vibrate) navigator.vibrate(ms); };

  function fmt(ms) {
    const s = Math.floor((ms || 0) / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = String(s % 60).padStart(2, '0');
    return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
  }

  const Sfx = {
    ctx: null,
    init() {
      try {
        if (!this.ctx) {
          const C = window.AudioContext || window.webkitAudioContext;
          if (!C) return;
          this.ctx = new C();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
      } catch (e) {}
    },
    tono(f, d, tipo = 'sine', vol = 0.2, t = 0) {
      const c = this.ctx;
      if (!c) return;
      const o = c.createOscillator();
      const g = c.createGain();
      const t0 = c.currentTime + t;
      o.type = tipo;
      o.frequency.setValueAtTime(f, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(g).connect(c.destination);
      o.start(t0);
      o.stop(t0 + d + 0.05);
    },
    ruido(d, vol, frec, t = 0) {
      const c = this.ctx;
      if (!c) return;
      const n = Math.max(1, Math.floor(c.sampleRate * d));
      const buf = c.createBuffer(1, n, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const s = c.createBufferSource();
      s.buffer = buf;
      const f = c.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = frec;
      f.Q.value = 0.8;
      const g = c.createGain();
      g.gain.value = vol;
      s.connect(f).connect(g).connect(c.destination);
      s.start(c.currentTime + t);
    },
    golpe() { this.tono(1200, 0.05, 'square', 0.12); this.tono(600, 0.08, 'sine', 0.15); },
    error() { this.tono(260, 0.18, 'sawtooth', 0.08); this.tono(180, 0.3, 'sawtooth', 0.08, 0.15); },
    click() { this.tono(700, 0.06, 'triangle', 0.12); },
    mordisco() { this.ruido(0.14, 0.7, 1800); this.ruido(0.08, 0.5, 3500, 0.05); },
    magia() { [784, 988, 1175, 1568].forEach((f, i) => this.tono(f, 0.35, 'sine', 0.1, i * 0.07)); },
    aprobado() { [523, 659, 784, 1047].forEach((f, i) => this.tono(f, 0.3, 'triangle', 0.16, i * 0.1)); },
    fanfarria() {
      [[523, 0], [523, 0.15], [523, 0.3], [659, 0.45], [784, 0.75], [659, 1.0], [784, 1.15], [1047, 1.35]]
        .forEach(([f, t]) => this.tono(f, 0.35, 'triangle', 0.16, t));
    },
    aplausos(seg = 2.5) {
      for (let i = 0; i < seg * 40; i++) {
        this.ruido(0.02 + Math.random() * 0.03, 0.15 + Math.random() * 0.35, 1200 + Math.random() * 2500, Math.random() * seg);
      }
    }
  };

  function confeti(dur = 4000) {
    const c = $('confeti');
    const x = c.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    c.width = innerWidth * dpr;
    c.height = innerHeight * dpr;
    c.style.display = 'block';
    const cols = ['#d4a72c', '#ffffff', '#1f7a3d', '#3b82f6', '#ef4444', '#f59e0b'];
    const ps = Array.from({ length: 180 }, () => ({
      x: Math.random() * c.width,
      y: -Math.random() * c.height * 0.6,
      vx: (Math.random() - 0.5) * 4 * dpr,
      vy: (2 + Math.random() * 4) * dpr,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      w: (6 + Math.random() * 6) * dpr,
      h: (3 + Math.random() * 4) * dpr,
      col: cols[Math.floor(Math.random() * cols.length)]
    }));
    const t0 = performance.now();
    (function cuadro(now) {
      x.clearRect(0, 0, c.width, c.height);
      ps.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.05 * dpr; p.r += p.vr;
        x.save(); x.translate(p.x, p.y); x.rotate(p.r);
        x.fillStyle = p.col; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        x.restore();
      });
      if (now - t0 < dur) requestAnimationFrame(cuadro);
      else { x.clearRect(0, 0, c.width, c.height); c.style.display = 'none'; }
    })(t0);
  }

  let toastTimer = 0;
  function toast(msg, ms = 2200) {
    const t = $('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, ms);
  }

  function crearBotones(cont, botones, alTocar) {
    cont.innerHTML = '';
    botones.forEach((b) => {
      const el = document.createElement('button');
      el.className = 'btn ' + (b.cls || '');
      el.textContent = b.t;
      el.addEventListener(b.rapido ? 'pointerdown' : 'click', (ev) => {
        ev.preventDefault();
        Sfx.init();
        alTocar();
        if (b.fn) b.fn();
      });
      cont.appendChild(el);
    });
  }

  function modal(html, botones = [{ t: 'Seguir', cls: 'primario' }]) {
    $('modal-cuerpo').innerHTML = html;
    crearBotones($('modal-botones'), botones, cerrarModal);
    $('modal').hidden = false;
  }
  function cerrarModal() { $('modal').hidden = true; }

  function setAccion(html, botones = []) {
    $('accion').hidden = false;
    $('accion-texto').innerHTML = html;
    crearBotones($('accion-botones'), botones, () => {});
  }
  const setTexto = (html) => { $('accion-texto').innerHTML = html; };

  function estadoMarcador(id) {
    if (S.graduado) return 'grad';
    if (todasAprobadas()) return 'tribunal';
    if (S.materias[id]) return 'aprobada';
    return 'juego';
  }

  function renderMarcadores() {
    if (!S) return;
    document.querySelectorAll('a-marker').forEach((m) => {
      const e = estadoMarcador(m.dataset.materia);
      ['juego', 'aprobada', 'tribunal', 'grad'].forEach((k) => {
        const g = m.querySelector('.g-' + k);
        if (g) g.setAttribute('visible', k === e);
      });
    });
  }

  function actualizarHud() {
    if (!S) return;
    $('hud-progreso').textContent = `${aprobadas().length}/4`;
    $('hud-tiempo').textContent = '⏱ ' + fmt(S.graduado ? S.finMs : S.jugadoMs);
  }

  function actualizarAccion() {
    if (!actual || !S) { $('accion').hidden = true; return; }
    const e = estadoMarcador(actual);
    if (e === 'juego') return JUEGOS[actual].accion();
    if (e === 'aprobada') {
      const f = ORDEN.length - aprobadas().length;
      return setAccion(
        `Ya aprobaste <b>${MATERIAS[actual].nombre}</b>. Te ${f === 1 ? 'falta 1 materia' : `faltan ${f} materias`}.`,
        [{ t: '📜 Ver escolaridad', fn: abrirEscolaridad }]
      );
    }
    if (e === 'tribunal') {
      return setAccion(
        'El tribunal ya está sentado. Va a preguntarte por lo que viviste en cada experiencia.',
        [{ t: '⚖️ Comenzar defensa', cls: 'primario', fn: defensa }]
      );
    }
    if (S.birrete) return setAccion('Ya sos egresado/a de las experiencias UCU. 🎓', [{ t: 'Ver mi título', fn: mostrarTitulo }]);
    setAccion('¡Aprobaste la defensa! Es tu momento:', [{ t: '🎓 Tirar el birrete', cls: 'primario', fn: tirarBirrete }]);
  }

  const PP = { iniciado: false, activo: false, fase: 'espera', t0: 0, hasta: 0, dur: 1500, hits: 0, x0: 0, x1: 0, posX: 0, xv: 0, raf: 0, enZona: null };
  const PP_MIN = 0.62;
  const PP_MAX = 1.12;

  function ppTextoMarcador() {
    return `Tocá <b>«¡Pegale!»</b> cuando la pelota esté en la zona amarilla. Devoluciones: <b>${PP.hits}/3</b>`;
  }
  function ppSaque(delay) { PP.fase = 'espera'; PP.hasta = performance.now() + delay; }
  function ppLoop() { cancelAnimationFrame(PP.raf); PP.raf = requestAnimationFrame(ppCuadro); }

  function ppCuadro() {
    if (!PP.activo) return;
    const now = performance.now();
    const pelota = $('pp-pelota').object3D.position;
    let enZona = false;
    if (PP.fase === 'espera') {
      pelota.set(0, 0.25, -0.85);
      if (now >= PP.hasta) {
        PP.fase = 'ida';
        PP.t0 = now;
        PP.dur = Math.max(950, 1500 - PP.hits * 200);
        PP.x0 = (Math.random() - 0.5) * 0.3;
        PP.x1 = (Math.random() - 0.5) * 0.5;
      }
    } else if (PP.fase === 'ida') {
      const p = (now - PP.t0) / PP.dur;
      if (p > PP_MAX) {
        Sfx.error();
        toast('¡Se te pasó! El Invicto saca de nuevo');
        ppSaque(900);
      } else {
        PP.posX = PP.x0 + (PP.x1 - PP.x0) * p;
        pelota.set(PP.posX, 0.1 + 0.3 * Math.abs(Math.sin(Math.PI * 1.5 * Math.min(p, 1))), -0.85 + 1.75 * p);
        enZona = p >= PP_MIN;
      }
    } else if (PP.fase === 'vuelta') {
      const p = Math.min(1, (now - PP.t0) / PP.dur);
      pelota.set(PP.xv * (1 - p), 0.1 + 0.35 * Math.sin(Math.PI * p), 0.9 - 1.75 * p);
      if (p >= 1) {
        if (PP.hits >= 3) {
          PP.activo = false;
          aprobar('pingpong');
          return;
        }
        ppSaque(450);
      }
    }
    if (enZona !== PP.enZona) {
      PP.enZona = enZona;
      $('pp-zona').setAttribute('material', 'color', enZona ? '#3ddc84' : '#ffd54a');
    }
    PP.raf = requestAnimationFrame(ppCuadro);
  }

  function ppTocar() {
    if (!PP.iniciado) {
      PP.iniciado = true;
      PP.activo = true;
      ppSaque(700);
      ppLoop();
      return JUEGOS.pingpong.accion();
    }
    if (PP.fase !== 'ida') return;
    const p = (performance.now() - PP.t0) / PP.dur;
    if (p >= PP_MIN && p <= PP_MAX) {
      PP.hits++;
      Sfx.golpe();
      vibrar(30);
      PP.fase = 'vuelta';
      PP.t0 = performance.now();
      PP.dur = 650;
      PP.xv = PP.posX;
      setTexto(PP.hits >= 3 ? '¡Tercera devolución! El Invicto no lo puede creer…' : ppTextoMarcador());
    } else {
      toast('¡Muy temprano! Esperá a que llegue a la zona amarilla');
    }
  }

  function ppPausar() { PP.activo = false; cancelAnimationFrame(PP.raf); }
  function ppReanudar() {
    if (PP.iniciado && !S.materias.pingpong) {
      PP.activo = true;
      ppSaque(800);
      ppLoop();
    }
  }

  const AU = { slide: 0 };
  function auSiguiente() {
    Sfx.click();
    if (AU.slide === 3) {
      Sfx.aplausos(2.5);
      toast('👏 👏 👏', 1800);
      AU.slide = 4;
      setAccion('El Aula Magna te aplaude de pie…', []);
      setTimeout(() => aprobar('aulamagna'), 1800);
      return;
    }
    AU.slide++;
    $('aula-pantalla').setAttribute('material', 'src', '#tx-slide' + AU.slide);
    JUEGOS.aulamagna.accion();
  }

  const ML = { mordiscos: 0 };
  function mlMorder() {
    if (ML.mordiscos >= 5) return;
    ML.mordiscos++;
    Sfx.mordisco();
    vibrar(20);
    const segs = $('medialuna').querySelectorAll('.ml-seg');
    const seg = segs[[0, 4, 1, 3, 2][ML.mordiscos - 1]];
    seg.setAttribute('visible', false);
    if (ML.mordiscos < 5) {
      setTexto(`Ñam. Mordiscos: <b>${ML.mordiscos}</b>`);
    } else {
      setAccion('¡Riquísima! No quedó ni una miga.', []);
      setTimeout(() => aprobar('cantina'), 900);
    }
  }

  const BI = { abierto: false };
  function biAbrir() {
    if (BI.abierto) return;
    BI.abierto = true;
    Sfx.magia();
    const libro = $('libro-brilla');
    libro.setAttribute('animation__subir', { property: 'position', to: '0 0.9 0', dur: 600, easing: 'easeOutQuad' });
    setTimeout(() => {
      libro.setAttribute('visible', false);
      const pag = $('libro-pagina');
      pag.setAttribute('visible', true);
      pag.setAttribute('animation__aparecer', { property: 'scale', from: '0.1 0.1 0.1', to: '1 1 1', dur: 500, easing: 'easeOutBack' });
      window.Tex.refrescar();
      JUEGOS.biblioteca.accion();
    }, 650);
  }

  const JUEGOS = {
    pingpong: {
      accion() {
        if (!PP.iniciado) {
          return setAccion('<b>El Invicto del Salón</b> te desafía. Devolvé 3 pelotas para aprobar.',
            [{ t: '🏓 Empezar el partido', cls: 'primario grande', fn: ppTocar, rapido: true }]);
        }
        setAccion(ppTextoMarcador(), [{ t: '🏓 ¡Pegale!', cls: 'primario grande', fn: ppTocar, rapido: true }]);
      }
    },
    aulamagna: {
      accion() {
        if (AU.slide === 0) {
          return setAccion('Subiste al escenario del Aula Magna. Presentá tus <b>3 diapositivas</b>.',
            [{ t: '🎤 Empezar presentación', cls: 'primario grande', fn: auSiguiente }]);
        }
        if (AU.slide < 3) {
          return setAccion(`Diapositiva <b>${AU.slide}/3</b>. Mirá la pantalla y seguí.`,
            [{ t: '▶ Siguiente diapositiva', cls: 'primario grande', fn: auSiguiente }]);
        }
        if (AU.slide === 3) {
          return setAccion('Última diapositiva. ¿Te animás a cerrar?',
            [{ t: '🙇 Terminar presentación', cls: 'primario grande', fn: auSiguiente }]);
        }
        setAccion('El Aula Magna te aplaude de pie…', []);
      }
    },
    cantina: {
      accion() {
        if (ML.mordiscos >= 5) return setAccion('¡Riquísima! No quedó ni una miga.', []);
        setAccion(ML.mordiscos ? `Ñam. Mordiscos: <b>${ML.mordiscos}</b>` : 'Llegó tu medialuna. Tocá <b>«Morder»</b> hasta terminarla.',
          [{ t: '🥐 Morder', cls: 'primario grande', fn: mlMorder, rapido: true }]);
      }
    },
    biblioteca: {
      accion() {
        if (!BI.abierto) {
          return setAccion('Entre tantos libros, uno brilla. ¿Qué esconde?',
            [{ t: '📖 Abrir el libro que brilla', cls: 'primario grande', fn: biAbrir }]);
        }
        setAccion('Anotá la palabra: <b>el tribunal te la va a pedir</b>.',
          [{ t: '✅ Ya la anoté', cls: 'primario grande', fn: () => aprobar('biblioteca') }]);
      }
    }
  };

  function aprobar(id) {
    if (S.materias[id]) return;
    S.materias[id] = { at: Date.now() };
    guardar();
    Sfx.aprobado();
    vibrar([60, 40, 60]);
    renderMarcadores();
    actualizarHud();
    actualizarAccion();
    const n = aprobadas().length;
    const cabeza = `<div class="sello">APROBADA</div><p class="kicker">${MATERIAS[id].icono} Materia aprobada</p><h3>${MATERIAS[id].nombre}</h3>`;
    if (n === ORDEN.length) {
      modal(cabeza + '<p>¡Completaste las 4 materias! El tribunal se está sentando. Apuntá a <b>cualquier marcador del juego</b> para defender tu título.</p>',
        [{ t: '¡Vamos!', cls: 'primario' }]);
    } else {
      modal(cabeza + `<p>Llevás <b>${n}/4</b>. Revisá tu escolaridad para ver qué te falta.</p>`,
        [{ t: 'Ver escolaridad', fn: abrirEscolaridad }, { t: 'Seguir', cls: 'primario' }]);
    }
  }

  function defensa() {
    const preguntas = barajar(PREGUNTAS).map((p) => ({ q: p.q, ok: p.ok, ops: barajar([p.ok, ...p.no]) }));
    let i = 0;
    let aciertos = 0;
    const paso = () => {
      const p = preguntas[i];
      modal(`<p class="kicker">Defensa de tesis · Pregunta ${i + 1} de ${preguntas.length}</p><h3>${p.q}</h3>`,
        p.ops.map((o) => ({
          t: o,
          cls: 'opcion',
          fn: () => {
            Sfx.click();
            if (o === p.ok) aciertos++;
            i++;
            if (i < preguntas.length) paso(); else veredicto(aciertos);
          }
        })));
    };
    paso();
  }

  function veredicto(a) {
    S.defensa.intentos++;
    if (a >= 3) {
      S.defensa.aprobada = true;
      S.defensa.aciertos = a;
      S.graduado = true;
      S.finMs = S.jugadoMs;
      guardar();
      Sfx.fanfarria();
      renderMarcadores();
      actualizarHud();
      actualizarAccion();
      modal(`<p class="kicker">Veredicto del tribunal</p><h3>¡Aprobado/a!</h3><p>Acertaste <b>${a} de 4</b>. El tribunal te otorga el título: miralo sobre el marcador y tirá el birrete.</p>`,
        [{ t: '🎓 Ver mi diploma', cls: 'primario' }]);
    } else {
      guardar();
      Sfx.error();
      modal(`<p class="kicker">Veredicto del tribunal</p><h3>Vuelva en el próximo período</h3><p>Acertaste <b>${a} de 4</b> y necesitás al menos 3. Pensalo bien e intentá de nuevo.</p>`,
        [{ t: 'Más tarde' }, { t: 'Reintentar defensa', cls: 'primario', fn: defensa }]);
    }
  }

  function tirarBirrete() {
    if (!actual) return;
    const b = $('m-' + actual).querySelector('.birrete');
    b.removeAttribute('animation');
    b.setAttribute('animation__subir', { property: 'position', to: '0 2.4 -0.2', dur: 900, easing: 'easeOutQuad' });
    b.setAttribute('animation__girar', { property: 'rotation', to: '0 720 25', dur: 1800, easing: 'easeInOutSine' });
    b.addEventListener('animationcomplete__subir', () => {
      b.setAttribute('animation__bajar', { property: 'position', to: '0 0.45 -0.2', dur: 900, easing: 'easeInQuad' });
    }, { once: true });
    Sfx.aplausos(3);
    Sfx.fanfarria();
    confeti();
    vibrar([80, 50, 80, 50, 160]);
    S.birrete = true;
    guardar();
    actualizarAccion();
    setTimeout(mostrarTitulo, 2600);
  }

  function mencion() {
    const pistas = Object.keys(S.pistas).length;
    if (S.defensa.intentos > 1) return 'Título en período de recuperación';
    if (S.defensa.aciertos === 4 && pistas === 0) return 'Con honores';
    if (S.defensa.aciertos === 4) return 'Aprobación';
    return 'Raspando… pero con título';
  }

  function mostrarTitulo() {
    modal(`
      <div class="diploma">
        <p class="kicker">Título de egreso · Experiencias UCU</p>
        <h3>${esc(S.nombre)}</h3>
        <p>completó las cuatro experiencias y defendió su tesis ante el tribunal.</p>
        <div class="mencion">${mencion()}</div>
        <dl>
          <div><dt>Tiempo de cursado</dt><dd>${fmt(S.finMs)}</dd></div>
          <div><dt>Defensa</dt><dd>${S.defensa.aciertos}/4</dd></div>
          <div><dt>Pistas usadas</dt><dd>${Object.keys(S.pistas).length}</dd></div>
        </dl>
      </div>`, [{ t: 'Cerrar', cls: 'primario' }]);
  }

  function renderEscolaridad() {
    $('esc-nombre').textContent = S.nombre;
    $('esc-lista').innerHTML = ORDEN.map((id) => {
      const m = MATERIAS[id];
      const ok = !!S.materias[id];
      const detalle = ok ? '' : `
        <p class="acertijo">“${m.acertijo}”</p>
        ${S.pistas[id] ? `<p class="pista">📍 ${m.pista}</p>` : `<button class="link" data-pista="${id}">Pedir pista extra</button>`}`;
      return `
        <li class="materia ${ok ? 'ok' : ''}">
          <div class="m-head">
            <span class="m-icono">${m.icono}</span>
            <div class="m-nombre"><strong>${m.nombre}</strong></div>
            <span class="estado">${ok ? 'Aprobada' : 'Pendiente'}</span>
          </div>
          ${detalle}
        </li>`;
    }).join('');
    let estado = 'Se habilita al aprobar las 4 materias.';
    if (todasAprobadas()) estado = 'Habilitada: apuntá a cualquier marcador del juego.';
    if (S.graduado) estado = `Mención: ${mencion()}`;
    $('esc-defensa').innerHTML = `
      <div class="materia defensa ${S.graduado ? 'ok' : ''}">
        <div class="m-head">
          <span class="m-icono">⚖️</span>
          <div class="m-nombre"><strong>Defensa de tesis</strong><span class="sub">${estado}</span></div>
        </div>
        ${S.graduado ? '<button class="btn primario" id="btn-titulo">🎓 Ver mi título</button>' : ''}
      </div>`;
    const bt = $('btn-titulo');
    if (bt) bt.onclick = () => { $('escolaridad').hidden = true; mostrarTitulo(); };
  }

  function abrirEscolaridad() {
    renderEscolaridad();
    $('escolaridad').hidden = false;
  }

  function pedirPista(id) {
    modal('<h3>¿Pedís una pista?</h3><p>Usar pistas te baja la mención final del título.</p>',
      [{ t: 'Mejor no' }, {
        t: 'Sí, mostrame', cls: 'primario', fn: () => {
          S.pistas[id] = true;
          guardar();
          renderEscolaridad();
        }
      }]);
  }

  function activarLinterna() {
    const v = document.querySelector('video');
    const track = v && v.srcObject && v.srcObject.getVideoTracks && v.srcObject.getVideoTracks()[0];
    if (!track || !track.getCapabilities) return;
    const caps = track.getCapabilities();
    if (!caps.torch) return;
    const btn = $('btn-linterna');
    let on = false;
    btn.hidden = false;
    btn.onclick = () => {
      on = !on;
      track.applyConstraints({ advanced: [{ torch: on }] }).catch(() => {});
      btn.classList.toggle('activo', on);
    };
  }

  function mostrarJuego() {
    $('intro').hidden = true;
    $('hud').hidden = false;
    $('buscando').hidden = !!actual;
    actualizarHud();
    renderMarcadores();
    actualizarAccion();
  }

  function inscribir() {
    const nombre = $('nombre').value.trim();
    if (!nombre) {
      $('nombre').focus();
      toast('Escribí tu nombre: va en tu título');
      return;
    }
    Sfx.init();
    Sfx.aprobado();
    S = nuevo(nombre);
    guardar();
    window.Tex.diploma(nombre);
    mostrarJuego();
    abrirEscolaridad();
  }

  function onFound(id) {
    actual = id;
    window.Tex.refrescar();
    if (!S) return;
    $('buscando').hidden = true;
    renderMarcadores();
    actualizarAccion();
    if (id === 'pingpong') ppReanudar();
  }

  function onLost(id) {
    if (actual !== id) return;
    actual = null;
    if (id === 'pingpong') ppPausar();
    if (!S) return;
    $('accion').hidden = true;
    $('buscando').hidden = false;
  }

  function dibujarTexturas() {
    window.Tex.dibujarTodo(S ? S.nombre : '', MATERIAS);
  }

  document.querySelectorAll('a-marker').forEach((m) => {
    m.insertAdjacentHTML('beforeend', TPL_TRIBUNAL + TPL_GRAD);
    m.addEventListener('markerFound', () => onFound(m.dataset.materia));
    m.addEventListener('markerLost', () => onLost(m.dataset.materia));
  });

  dibujarTexturas();
  const escena = document.querySelector('a-scene');
  if (escena.hasLoaded) dibujarTexturas(); else escena.addEventListener('loaded', dibujarTexturas);
  if (document.fonts) {
    Promise.all([
      document.fonts.load('800 40px Fraunces'),
      document.fonts.load('600 40px Inter'),
      document.fonts.load('700 40px Inter')
    ]).then(dibujarTexturas).catch(() => {});
  }

  window.addEventListener('camera-init', () => setTimeout(activarLinterna, 800));
  window.addEventListener('camera-error', () => {
    modal('<h3>No pudimos usar la cámara</h3><p>Revisá que le diste permiso al navegador y que abriste el juego desde el link <b>https</b>. En iPhone usá Safari; en Android, Chrome.</p>',
      [{ t: 'Reintentar', cls: 'primario', fn: () => location.reload() }]);
  });

  $('btn-empezar').addEventListener('click', inscribir);
  $('nombre').addEventListener('keydown', (e) => { if (e.key === 'Enter') inscribir(); });
  $('btn-escolaridad').addEventListener('click', abrirEscolaridad);
  document.querySelectorAll('[data-cerrar]').forEach((b) => b.addEventListener('click', () => { $(b.dataset.cerrar).hidden = true; }));
  $('escolaridad').addEventListener('click', (e) => {
    if (e.target.id === 'escolaridad') $('escolaridad').hidden = true;
    const pista = e.target.closest('[data-pista]');
    if (pista) pedirPista(pista.dataset.pista);
  });
  $('btn-reiniciar').addEventListener('click', () => {
    modal('<h3>¿Reiniciar la partida?</h3><p>Se borra todo tu progreso en este celular.</p>',
      [{ t: 'Cancelar' }, {
        t: 'Reiniciar', cls: 'peligro', fn: () => {
          S = null; // si no, pagehide/visibilitychange vuelven a guardar la partida al recargar
          try { localStorage.removeItem(KEY); } catch (e) {}
          location.reload();
        }
      }]);
  });
  document.addEventListener('pointerdown', () => Sfx.init(), { passive: true });

  setInterval(() => {
    if (!S || S.graduado || document.hidden) return;
    S.jugadoMs += 1000;
    if ((S.jugadoMs / 1000) % 5 === 0) guardar();
    actualizarHud();
  }, 1000);
  document.addEventListener('visibilitychange', () => { if (document.hidden && S) guardar(); });
  window.addEventListener('pagehide', () => { if (S) guardar(); });

  if (S) {
    mostrarJuego();
    toast(`¡Hola de nuevo, ${S.nombre}!`);
  } else {
    $('intro').hidden = false;
  }
})();
