/* ============================================================
   FAKE BLADE BALL — HTML5 Canvas refleks oyunu
   Murat Kaan Game Center
   ============================================================ */

(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  // --- UI elemanları ---
  const ui = {
    score: document.getElementById("score"),
    parries: document.getElementById("parries"),
    speed: document.getElementById("speed"),
    best: document.getElementById("best"),
    overlay: document.getElementById("overlay"),
    startBtn: document.getElementById("start-btn"),
  };

  // --- Sabitler ---
  const PLAYER_RADIUS = 16;
  const PLAYER_SPEED = 320;          // px / s
  const BALL_RADIUS = 13;
  const BALL_BASE_SPEED = 180;       // px / s
  const BALL_SPEED_STEP = 28;        // her parry'de artış
  const PARRY_WINDOW = 0.18;         // parry aktif süresi (s)
  const PARRY_COOLDOWN = 0.45;       // parry bekleme süresi (s)
  const PARRY_RADIUS = 64;           // parry yarıçapı
  const BEST_KEY = "fbb_best";

  // --- Girdi ---
  const keys = {};
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    keys[k] = true;
    if (k === " " || k === "arrowup" || k === "arrowdown" || k === "arrowleft" || k === "arrowright") {
      e.preventDefault();
    }
    if (k === " ") tryParry();
  });
  window.addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; });

  // Dokunmatik / fare: tıkla = parry
  canvas.addEventListener("pointerdown", () => { if (state.running) tryParry(); });

  // --- Oyun durumu ---
  let best = Number(localStorage.getItem(BEST_KEY) || 0);
  ui.best.textContent = best;

  const state = {
    running: false,
    last: 0,
    elapsed: 0,
  };

  const player = { x: W / 2, y: H / 2, vx: 0, vy: 0 };

  const ball = {
    x: 0, y: 0, vx: 0, vy: 0,
    speed: BALL_BASE_SPEED,
    homing: true,        // oyuncuya kitlenmiş mi
  };

  const parry = {
    active: 0,           // kalan aktif süre
    cooldown: 0,         // kalan bekleme süresi
  };

  let score = 0;
  let parries = 0;
  let speedMult = 1;
  let shake = 0;
  const particles = [];

  // ============================================================
  //  Yardımcılar
  // ============================================================
  function rand(a, b) { return a + Math.random() * (b - a); }
  function len(x, y) { return Math.hypot(x, y); }

  function spawnParticles(x, y, color, n, power) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2);
      const s = rand(0.3, 1) * power;
      particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 1,
        color,
      });
    }
  }

  // ============================================================
  //  Oyun akışı
  // ============================================================
  function resetGame() {
    player.x = W / 2; player.y = H / 2; player.vx = 0; player.vy = 0;
    score = 0;
    parries = 0;
    speedMult = 1;
    shake = 0;
    particles.length = 0;
    parry.active = 0;
    parry.cooldown = 0;
    state.elapsed = 0;

    // Topu rastgele kenardan başlat
    spawnBall();
  }

  function spawnBall() {
    const edge = Math.floor(rand(0, 4));
    if (edge === 0) { ball.x = rand(0, W); ball.y = -BALL_RADIUS; }
    else if (edge === 1) { ball.x = W + BALL_RADIUS; ball.y = rand(0, H); }
    else if (edge === 2) { ball.x = rand(0, W); ball.y = H + BALL_RADIUS; }
    else { ball.x = -BALL_RADIUS; ball.y = rand(0, H); }
    ball.speed = BALL_BASE_SPEED;
    ball.homing = true;
    aimBallAtPlayer();
  }

  function aimBallAtPlayer() {
    const dx = player.x - ball.x;
    const dy = player.y - ball.y;
    const d = len(dx, dy) || 1;
    ball.vx = (dx / d) * ball.speed;
    ball.vy = (dy / d) * ball.speed;
  }

  function startGame() {
    resetGame();
    state.running = true;
    ui.overlay.classList.remove("active");
    state.last = performance.now();
    requestAnimationFrame(loop);
  }

  function gameOver() {
    state.running = false;
    spawnParticles(player.x, player.y, "#ff4d6d", 40, 320);
    shake = 18;

    if (score > best) {
      best = score;
      localStorage.setItem(BEST_KEY, String(best));
    }

    ui.overlay.innerHTML = `
      <div class="panel gameover">
        <h1>OYUN BİTTİ</h1>
        <p class="tagline">Top seni yakaladı!</p>
        <ul class="controls">
          <li>Skor: <b>${score}</b></li>
          <li>Parry sayısı: <b>${parries}</b></li>
          <li>Ulaşılan hız: <b>${speedMult.toFixed(1)}x</b></li>
        </ul>
        <button id="start-btn">TEKRAR OYNA</button>
        <p class="best">En iyi skor: <span>${best}</span></p>
      </div>`;
    ui.overlay.classList.add("active");
    document.getElementById("start-btn").addEventListener("click", startGame);
  }

  // ============================================================
  //  Parry
  // ============================================================
  function tryParry() {
    if (!state.running) return;
    if (parry.cooldown > 0) return;
    parry.active = PARRY_WINDOW;
    parry.cooldown = PARRY_COOLDOWN;
    spawnParticles(player.x, player.y, "#4dd0ff", 12, 140);
  }

  function checkParry() {
    if (parry.active <= 0) return;
    const dx = ball.x - player.x;
    const dy = ball.y - player.y;
    const d = len(dx, dy);
    if (d <= PARRY_RADIUS + BALL_RADIUS) {
      // Başarılı! Topu geri savuştur ve hızlandır.
      parries++;
      score += 10 + Math.floor(speedMult * 5);
      speedMult += 0.08;
      ball.speed = BALL_BASE_SPEED * speedMult + parries * BALL_SPEED_STEP * 0.0; // hız çarpanla artıyor

      // Topu oyuncudan dışarı, biraz rastgele saçılmayla fırlat
      const nd = d || 1;
      const baseAng = Math.atan2(dy, nd === 0 ? 1 : dx);
      const ang = baseAng + rand(-0.4, 0.4);
      ball.speed = BALL_BASE_SPEED * speedMult;
      ball.vx = Math.cos(ang) * ball.speed;
      ball.vy = Math.sin(ang) * ball.speed;
      ball.homing = false;

      parry.active = 0;
      shake = 8;
      spawnParticles(ball.x, ball.y, "#ffd24d", 24, 260);

      // Kısa süre sonra tekrar oyuncuya kitlen
      setTimeout(() => { ball.homing = true; }, 520);
    }
  }

  // ============================================================
  //  Güncelleme
  // ============================================================
  function update(dt) {
    state.elapsed += dt;

    // --- Oyuncu hareketi ---
    let ix = 0, iy = 0;
    if (keys["a"] || keys["arrowleft"]) ix -= 1;
    if (keys["d"] || keys["arrowright"]) ix += 1;
    if (keys["w"] || keys["arrowup"]) iy -= 1;
    if (keys["s"] || keys["arrowdown"]) iy += 1;
    const il = len(ix, iy);
    if (il > 0) { ix /= il; iy /= il; }
    player.x += ix * PLAYER_SPEED * dt;
    player.y += iy * PLAYER_SPEED * dt;
    player.x = Math.max(PLAYER_RADIUS, Math.min(W - PLAYER_RADIUS, player.x));
    player.y = Math.max(PLAYER_RADIUS, Math.min(H - PLAYER_RADIUS, player.y));

    // --- Parry zamanlayıcıları ---
    if (parry.active > 0) parry.active -= dt;
    if (parry.cooldown > 0) parry.cooldown -= dt;

    // --- Top ---
    if (ball.homing) {
      // Yumuşak homing: yön vektörünü oyuncuya doğru çevir
      const dx = player.x - ball.x;
      const dy = player.y - ball.y;
      const d = len(dx, dy) || 1;
      const tx = (dx / d) * ball.speed;
      const ty = (dy / d) * ball.speed;
      const turn = Math.min(1, dt * 3.0); // dönüş yumuşaklığı
      ball.vx += (tx - ball.vx) * turn;
      ball.vy += (ty - ball.vy) * turn;
    }
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Savuşturulmuş top kenardan sekiyor
    if (!ball.homing) {
      if (ball.x < BALL_RADIUS) { ball.x = BALL_RADIUS; ball.vx *= -1; }
      if (ball.x > W - BALL_RADIUS) { ball.x = W - BALL_RADIUS; ball.vx *= -1; }
      if (ball.y < BALL_RADIUS) { ball.y = BALL_RADIUS; ball.vy *= -1; }
      if (ball.y > H - BALL_RADIUS) { ball.y = H - BALL_RADIUS; ball.vy *= -1; }
    }

    // --- Parry kontrolü ---
    checkParry();

    // --- Çarpışma (ölüm) ---
    const cd = len(ball.x - player.x, ball.y - player.y);
    if (cd <= PLAYER_RADIUS + BALL_RADIUS) {
      gameOver();
      return;
    }

    // --- Hayatta kalma skoru ---
    score += dt * 4;

    // --- Parçacıklar ---
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.life -= dt * 1.8;
      if (p.life <= 0) particles.splice(i, 1);
    }

    if (shake > 0) shake = Math.max(0, shake - dt * 60);

    // --- HUD ---
    ui.score.textContent = Math.floor(score);
    ui.parries.textContent = parries;
    ui.speed.textContent = speedMult.toFixed(1) + "x";
  }

  // ============================================================
  //  Çizim
  // ============================================================
  function draw() {
    ctx.clearRect(0, 0, W, H);

    ctx.save();
    if (shake > 0) {
      ctx.translate(rand(-shake, shake), rand(-shake, shake));
    }

    // Çimen zemin
    drawGrass();

    // Parçacıklar
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 * p.life + 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Tehlike çizgisi: top -> oyuncu (homing iken uyarı)
    if (ball.homing) {
      ctx.strokeStyle = "rgba(255,77,109,0.18)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.moveTo(ball.x, ball.y);
      ctx.lineTo(player.x, player.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Parry halkası
    if (parry.active > 0) {
      const t = parry.active / PARRY_WINDOW;
      ctx.strokeStyle = `rgba(77,208,255,${0.3 + 0.6 * t})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(player.x, player.y, PARRY_RADIUS, 0, Math.PI * 2);
      ctx.stroke();
    } else if (parry.cooldown > 0) {
      // Cooldown göstergesi (ince yay)
      const frac = 1 - parry.cooldown / PARRY_COOLDOWN;
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(player.x, player.y, PLAYER_RADIUS + 8, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
      ctx.stroke();
    }

    // Oyuncu (ayı kafalı karakter avatarı)
    drawPlayer(player.x, player.y);

    // Top (tehlike)
    glowCircle(ball.x, ball.y, BALL_RADIUS, ball.homing ? "#ff4d6d" : "#ffd24d", "#fff");

    ctx.restore();
  }

  function glowCircle(x, y, r, color, core) {
    ctx.save();
    ctx.shadowBlur = 24;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Çimen zemin: biçilmiş çim kareleri + ince çim tutamları
  function drawGrass() {
    // Taban yeşil degrade
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#4a9e3f");
    g.addColorStop(1, "#357a2e");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Biçilmiş çim deseni (dama tahtası tonları)
    const tile = 56;
    for (let ty = 0, ry = 0; ty < H; ty += tile, ry++) {
      for (let tx = 0, rx = 0; tx < W; tx += tile, rx++) {
        if ((rx + ry) % 2 === 0) {
          ctx.fillStyle = "rgba(255,255,255,0.05)";
          ctx.fillRect(tx, ty, tile, tile);
        }
      }
    }

    // Sabit dağılımlı çim tutamları (deterministik, titremesin diye)
    ctx.strokeStyle = "rgba(30,90,25,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    let seed = 1337;
    const rng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    const blades = Math.floor((W * H) / 1400);
    for (let i = 0; i < blades; i++) {
      const bx = rng() * W;
      const by = rng() * H;
      const lean = (rng() - 0.5) * 3;
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + lean, by - 4);
    }
    ctx.stroke();
  }

  // Yuvarlatılmış dikdörtgen (dolu)
  function fillRoundRect(x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
    }
    ctx.fill();
  }

  // Oyuncu avatarı: ayı kafalı, kırmızı kapüşonlu, biri kırmızı/biri beyaz gözlü karakter
  function drawPlayer(x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(0.92, 0.92);

    // Yere düşen gölge
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(0, 23, 13, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bacaklar (kot)
    ctx.fillStyle = "#8aabd6";
    fillRoundRect(-7.5, 7, 6, 15, 2);
    fillRoundRect(1.5, 7, 6, 15, 2);
    // Ayakkabılar (gri)
    ctx.fillStyle = "#cfd2d7";
    ctx.beginPath(); ctx.ellipse(-4.5, 22, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4.5, 22, 5, 3, 0, 0, Math.PI * 2); ctx.fill();

    // Kollar (kırmızı kapüşon)
    ctx.fillStyle = "#cf2b2b";
    fillRoundRect(-14.5, -4, 5, 12, 2.5);
    fillRoundRect(9.5, -4, 5, 12, 2.5);
    // Eller (kahverengi)
    ctx.fillStyle = "#6b4a3a";
    ctx.beginPath(); ctx.arc(-12, 9, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(12, 9, 2.6, 0, Math.PI * 2); ctx.fill();

    // Gövde (kırmızı kapüşon)
    ctx.fillStyle = "#d62828";
    fillRoundRect(-11, -7, 22, 16, 5);
    // Fermuar çizgisi
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(0, 9); ctx.stroke();

    // --- Kafa ---
    // Kulaklar
    ctx.fillStyle = "#7a5a48";
    ctx.beginPath(); ctx.arc(-8.5, -20, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8.5, -20, 4.5, 0, Math.PI * 2); ctx.fill();
    // Yüz (krem)
    ctx.fillStyle = "#e9dac2";
    ctx.beginPath(); ctx.arc(0, -16, 10.5, 0, Math.PI * 2); ctx.fill();

    // Siborg göz yaması (koyu)
    ctx.fillStyle = "rgba(70,72,82,0.6)";
    ctx.beginPath(); ctx.arc(-4.2, -17, 4.6, 0, Math.PI * 2); ctx.fill();
    // Kırmızı parlayan göz
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#ff2b2b";
    ctx.fillStyle = "#ff2b2b";
    ctx.beginPath(); ctx.arc(-4.2, -17, 2.1, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // Normal beyaz göz
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(4.4, -17, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#222";
    ctx.beginPath(); ctx.arc(4.4, -17, 1.1, 0, Math.PI * 2); ctx.fill();

    // Burun
    ctx.fillStyle = "#d0563b";
    ctx.beginPath(); ctx.arc(0, -13, 1.6, 0, Math.PI * 2); ctx.fill();

    // Sırıtan ağız (dişler)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, -12.5, 4.2, 0.12 * Math.PI, 0.88 * Math.PI, false);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3a2a22";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, -12.5, 4.6, 0.1 * Math.PI, 0.9 * Math.PI, false);
    ctx.stroke();

    ctx.restore();
  }

  // ============================================================
  //  Ana döngü
  // ============================================================
  function loop(now) {
    let dt = (now - state.last) / 1000;
    state.last = now;
    if (dt > 0.05) dt = 0.05; // büyük sıçramaları sınırla

    if (state.running) {
      update(dt);
    }
    draw();

    if (state.running) requestAnimationFrame(loop);
    else if (particles.length) {
      // ölüm patlaması bitene kadar çizmeye devam et
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vx *= 0.92; p.vy *= 0.92;
        p.life -= dt * 1.8;
        if (p.life <= 0) particles.splice(i, 1);
      }
      requestAnimationFrame(loop);
    }
  }

  // İlk çizim (menü arkasında sahne görünsün)
  ball.x = W / 2; ball.y = 120;
  draw();

  ui.startBtn.addEventListener("click", startGame);
})();
