document.addEventListener('DOMContentLoaded', () => {
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = false;
      this.initStorage();
    }

    initStorage() {
      const saved = localStorage.getItem('nexus_audio_enabled');
      this.enabled = saved === 'true';
      this.updateUI();
    }

    toggle() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.enabled = !this.enabled;
      localStorage.setItem('nexus_audio_enabled', this.enabled);
      this.updateUI();

      if (this.enabled) {
        this.playChime();
      }
    }

    updateUI() {
      const toggleBtn = document.getElementById('audio-toggle');
      const iconOn = toggleBtn?.querySelector('.icon-sound-on');
      const iconOff = toggleBtn?.querySelector('.icon-sound-off');
      const tooltip = toggleBtn?.querySelector('.audio-tooltip');

      if (this.enabled) {
        toggleBtn?.classList.add('active');
        iconOn?.classList.remove('hidden');
        iconOff?.classList.add('hidden');
        if (tooltip) tooltip.textContent = 'Áudio: Ligado 🔊';
      } else {
        toggleBtn?.classList.remove('active');
        iconOn?.classList.add('hidden');
        iconOff?.classList.remove('hidden');
        if (tooltip) tooltip.textContent = 'Áudio: Desligado 🔇';
      }
    }

    playClick() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
      } catch (e) {}
    }

    playBooster() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        const randomFreq = freqs[Math.floor(Math.random() * freqs.length)];
        osc.frequency.setValueAtTime(randomFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(randomFreq * 1.5, this.ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.16);
      } catch (e) {}
    }

    playChime() {
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.22);
      } catch (e) {}
    }
  }

  const sound = new SoundEngine();
  document.getElementById('audio-toggle')?.addEventListener('click', () => {
    sound.toggle();
  });

  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 12000), 90);
  let speedMultiplier = 1;

  const mouse = {
    x: null,
    y: null,
    radius: 140
  };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.baseRadius = Math.random() * 2 + 1;
      this.radius = this.baseRadius;
      this.color = Math.random() > 0.4 ? 'rgba(0, 242, 254,' : 'rgba(121, 40, 202,';
      this.alpha = Math.random() * 0.6 + 0.2;
    }

    update() {
      this.x += this.vx * speedMultiplier;
      this.y += this.vy * speedMultiplier;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 3.5;
          this.y -= Math.sin(angle) * force * 3.5;
          this.radius = this.baseRadius * 1.8;
        } else {
          this.radius = this.baseRadius;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${this.color} ${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < 110) {
          const opacity = (1 - dist / 110) * 0.25;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 242, 254, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    if (speedMultiplier > 1) {
      speedMultiplier -= 0.015;
      if (speedMultiplier < 1) speedMultiplier = 1;
    }

    requestAnimationFrame(animateParticles);
  }

  animateParticles();

  const cardWrapper = document.getElementById('card-wrapper');
  const glassCard = document.getElementById('glass-card');

  let bounds = null;

  function updateBounds() {
    if (glassCard) {
      bounds = glassCard.getBoundingClientRect();
    }
  }
  updateBounds();
  window.addEventListener('resize', updateBounds);
  window.addEventListener('scroll', updateBounds);

  window.addEventListener('mousemove', (e) => {
    if (!glassCard || !cardWrapper) return;
    if (!bounds) updateBounds();

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const leftX = mouseX - bounds.left;
    const topY = mouseY - bounds.top;

    glassCard.style.setProperty('--glare-x', `${leftX}px`);
    glassCard.style.setProperty('--glare-y', `${topY}px`);

    const isClose = (
      mouseX >= bounds.left - 100 &&
      mouseX <= bounds.right + 100 &&
      mouseY >= bounds.top - 100 &&
      mouseY <= bounds.bottom + 100
    );

    if (isClose) {
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const deltaX = (mouseX - centerX) / (bounds.width / 2);
      const deltaY = (mouseY - centerY) / (bounds.height / 2);

      const rotateY = deltaX * 6;
      const rotateX = -deltaY * 6;

      cardWrapper.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    } else {
      cardWrapper.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    }
  });

  const terminalLogs = document.getElementById('terminal-logs');
  const terminalToggle = document.getElementById('terminal-toggle-btn');
  const terminalSection = document.querySelector('.terminal-section');

  const sampleLogs = [
    { tag: 'SYS', msg: 'Core operacional iniciado sob protocolo seguro TLS 1.3', type: 'success' },
    { tag: 'CACHE', msg: 'Edge Caching distribuído ativo em 18 regiões globais', type: 'info' },
    { tag: 'BUILD', msg: 'Assets compilados com sucesso via Vite/SWC (1.24s)', type: 'success' },
    { tag: 'METRICS', msg: 'Tempo de resposta médio estimado em 8.4ms', type: 'info' },
    { tag: 'SHADERS', msg: 'Compilando pipelines de pós-processamento WebGL 2.0', type: 'warn' },
    { tag: 'DB', msg: 'Conexão réplica Postgres estabelecida sem gargalos', type: 'success' },
    { tag: 'DEV', msg: 'Café infusionado com sucesso na equipe de engenharia ☕', type: 'info' },
    { tag: 'API', msg: 'Testes de integração: 348/348 testes passando 100%', type: 'success' },
    { tag: 'SECURITY', msg: 'Zero vulnerabilidades críticas encontradas no scan', type: 'success' },
    { tag: 'SYNC', msg: 'WebSockets em tempo real prontos para transmissão', type: 'info' }
  ];

  function getTimestamp() {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  }

  function appendLog(logData) {
    if (!terminalLogs) return;

    const row = document.createElement('div');
    row.className = 'log-entry';

    let msgClass = 'log-msg';
    if (logData.type === 'success') msgClass += ' log-success';
    if (logData.type === 'warn') msgClass += ' log-warn';

    row.innerHTML = `
      <span class="log-time">[${getTimestamp()}]</span>
      <span class="log-tag">[${logData.tag}]</span>
      <span class="${msgClass}">${logData.msg}</span>
    `;

    terminalLogs.appendChild(row);

    while (terminalLogs.children.length > 20) {
      terminalLogs.removeChild(terminalLogs.firstChild);
    }

    terminalLogs.scrollTop = terminalLogs.scrollHeight;
  }

  sampleLogs.slice(0, 4).forEach((l) => appendLog(l));

  let logPointer = 4;
  setInterval(() => {
    appendLog(sampleLogs[logPointer]);
    logPointer = (logPointer + 1) % sampleLogs.length;
  }, 4200);

  terminalToggle?.addEventListener('click', () => {
    sound.playClick();
    terminalSection?.classList.toggle('collapsed');
  });

  const boosterBtn = document.getElementById('booster-btn');
  const coffeeCountEl = document.getElementById('coffee-count');
  let coffeeCount = 1420;

  boosterBtn?.addEventListener('click', (e) => {
    sound.playBooster();
    coffeeCount++;
    if (coffeeCountEl) {
      coffeeCountEl.textContent = coffeeCount.toLocaleString('pt-BR');
    }

    speedMultiplier = 3.5;

    spawnFloatingFeedback(e.clientX, e.clientY);

    const core = document.querySelector('.reactor-core');
    if (core) {
      core.style.transform = 'scale(1.25)';
      setTimeout(() => {
        core.style.transform = '';
      }, 250);
    }
  });

  function spawnFloatingFeedback(x, y) {
    const el = document.createElement('div');
    el.className = 'floating-coffee-particle';
    const texts = ['+1 Café ☕', '⚡ +0.1% Boost', '🔥 Modo Turbo!', '🚀 Acelerando!'];
    el.textContent = texts[Math.floor(Math.random() * texts.length)];
    el.style.left = `${x - 30}px`;
    el.style.top = `${y - 20}px`;
    document.body.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, 1200);
  }
});
