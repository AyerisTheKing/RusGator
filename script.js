// v2.3
const SUPABASE_URL = "https://tdlhwokrmuyxsdleepht.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkbGh3b2tybXV5eHNkbGVlcGh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDc3ODAsImV4cCI6MjA4NDk4Mzc4MH0.RlfUmejx2ywHNcFofZM4mNE8nIw6qxaTNzqxmf4N4-4";
const api = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const questions = [
  {
    id: 1,
    question: "На какой улице находится институт переподготовки и повышения квалификации?",
    answer: "зиё 6",
    display: "Зиё 6",
    phrase: "Именно",
    match: /^(зи[её]|хи[её])(\s*6)?$/i
  },
  {
    id: 2,
    question: "В какой стране Авлоний был консулом?",
    answer: "афганистан",
    display: "Афганистан",
    phrase: "родной язык и литература",
    match: /^афганистан/i
  },
  {
    id: 3,
    question: "Как называется школа, которую открыл Авлоний в 1902 году?",
    answer: "новометодная",
    display: "Новометодная",
    phrase: "показывают существование",
    match: /^новометодн/i
  },
  {
    id: 4,
    question: "Он ввёл модель... переходя из одного класса в другой.",
    answer: "экзамен",
    display: "Экзамен",
    phrase: "любой",
    match: /^экзамен/i
  },
  {
    id: 5,
    question: "Он ввёл между уроками...",
    answer: "перемены",
    display: "Перемены",
    phrase: "нации",
    match: /^перемен/i
  },
  {
    id: 6,
    question: "В каком году был указ президента Мирзиёева о посмертном награждении орденом «Буюк хизматлари учун»?",
    answer: "2020",
    display: "2020",
    phrase: "в мире.",
    match: /^2020/i
  }
];

let solved = new Set();
let activeCell = null;
let currentUser = null;
let dbUserRecord = null;
let cellStats = {}; // { time, errors }
let currentTimer = null;

function init() {
  const grid = document.getElementById('quiz-grid');
  grid.innerHTML = '';

  questions.forEach((q) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.id = `cell-${q.id}`;
    cell.setAttribute('data-id', q.id);

    cell.innerHTML = `
      <div class="cell-number">${q.id}</div>
      <div class="cell-phrase" id="phrase-${q.id}">${q.phrase}</div>
    `;

    if (solved.has(q.id)) {
      cell.classList.add('solved');
    }

    cell.addEventListener('click', () => openQuestion(q.id));
    grid.appendChild(cell);
  });

  updatePhrase();
}

function openQuestion(id) {
  if (solved.has(id)) return;
  activeCell = id;

  if (!cellStats[id]) {
    cellStats[id] = { time: 1, errors: 0 };
  }

  const q = questions.find(x => x.id === id);
  document.getElementById('modal-question').textContent = q.question;
  document.getElementById('modal-input').value = '';
  document.getElementById('modal-input').disabled = false;
  document.getElementById('btn-check').disabled = false;
  document.getElementById('modal-feedback').textContent = '';
  document.getElementById('modal-feedback').className = 'feedback';

  document.getElementById('modal-overlay').classList.add('active');
  document.getElementById('modal-input').focus();

  if (currentTimer) clearInterval(currentTimer);
  currentTimer = setInterval(() => {
    cellStats[id].time++;
  }, 1000);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  document.getElementById('modal-input').value = '';
  document.getElementById('modal-feedback').textContent = '';
  activeCell = null;
  if (currentTimer) {
    clearInterval(currentTimer);
    currentTimer = null;
  }
}

function checkAnswer() {
  if (!activeCell || document.getElementById('btn-check').disabled) return;
  const q = questions.find(x => x.id === activeCell);
  
  const normalize = (str) => {
    return str.trim().toLowerCase().replace(/ё/g, 'е');
  };

  const inputStr = document.getElementById('modal-input').value.trim();
  const inputNorm = normalize(inputStr);
  const feedback = document.getElementById('modal-feedback');

  const isCorrect = q.match ? q.match.test(inputStr) : (inputNorm === normalize(q.answer));

  if (isCorrect) {
    if (currentTimer) clearInterval(currentTimer);
    
    document.getElementById('modal-input').disabled = true;
    document.getElementById('btn-check').disabled = true;

    feedback.textContent = '✓ Верно! ' + q.display;
    feedback.className = 'feedback correct';

    saveStatsForBlock(activeCell);
    const correctId = activeCell;

    setTimeout(() => {
      solved.add(correctId);
      const cell = document.getElementById(`cell-${correctId}`);
      if (cell) cell.classList.add('solved');
      updatePhrase();
      closeModal();
      checkWin();
    }, 1000);
  } else {
    cellStats[activeCell].errors++;
    feedback.textContent = '✗ Неверно. Попробуйте ещё раз.';
    feedback.className = 'feedback wrong';
    document.getElementById('modal-input').select();
  }
}

function updatePhrase() {
  questions.forEach(q => {
    const el = document.getElementById(`phrase-${q.id}`);
    const cell = document.getElementById(`cell-${q.id}`);
    if (el && cell) {
      if (solved.has(q.id)) {
        el.classList.add('revealed');
        if (!cell.querySelector('.cell-time')) {
          const timeEl = document.createElement('div');
          timeEl.className = 'cell-time';
          const stat = cellStats[q.id] || {time: 0};
          timeEl.textContent = `⏱️ ${stat.time} сек`;
          cell.appendChild(timeEl);
        }
      } else {
        el.classList.remove('revealed');
        const timeEl = cell.querySelector('.cell-time');
        if (timeEl) timeEl.remove();
      }
    }
  });
}

function checkWin() {
  if (solved.size === questions.length) {
    setTimeout(() => {
      document.getElementById('win-overlay').classList.add('active');
    }, 400);
  }
}

function closeWin() {
  document.getElementById('win-overlay').classList.remove('active');
}

function resetGame() {
  solved.clear();
  cellStats = {};
  if (currentTimer) clearInterval(currentTimer);
  closeWin();
  init();
}

// Enter key support
document.addEventListener('DOMContentLoaded', () => {
  checkSession();

  document.getElementById('modal-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkAnswer();
    if (e.key === 'Escape') closeModal();
  });

  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });
});

// -------------- AUTH & DATABASE LOGIC -------------- //

async function handleAuth() {
  const feedback = document.getElementById('auth-feedback');
  feedback.className = 'feedback';
  feedback.textContent = 'Загрузка...';

  try {
    const display_name = document.getElementById('reg-display-name').value.trim();
    if (!display_name) {
      feedback.textContent = 'Введите имя';
      feedback.className = 'feedback wrong';
      return;
    }

    const username = 'player_' + Math.random().toString(36).substring(2, 10);
    const password = Math.random().toString(36).substring(2, 12) + "A1!"; 
    const email = `${username}@rusgator.local`;
    
    const { data, error } = await api.auth.signUp({
      email,
      password,
      options: {
        data: { display_name, username }
      }
    });

    if (error) throw error;

    if (data.user) {
      const { error: dbError } = await api.from('Rus_Users').insert([
        { id: data.user.id, display_name, username }
      ]);
      if (dbError && dbError.code !== '23505') {
        throw dbError;
      }
    }
    
    localStorage.setItem('rusgator_username', username);
    localStorage.setItem('rusgator_password', password);
    feedback.textContent = 'Вход выполнен!';
    feedback.className = 'feedback correct';
    checkSession();
  } catch (err) {
    feedback.textContent = err.message || 'Произошла ошибка';
    feedback.className = 'feedback wrong';
  }
}

async function checkSession() {
  const { data: { session } } = await api.auth.getSession();
  if (session && session.user) {
    currentUser = session.user;
    
    // Fetch user record
    const { data: userData, error: userError } = await api
      .from('Rus_Users')
      .select('*')
      .eq('id', currentUser.id)
      .single();
      
    if (userData) {
      dbUserRecord = userData;
      document.getElementById('user-display-name').textContent = userData.display_name;
      
      solved.clear();
      for (let i = 1; i <= 6; i++) {
        const blk = userData[`block_${i}`];
        if (blk) {
          cellStats[i] = { time: blk.time || 0, errors: blk.errors || 0 };
          if (blk.time > 0) {
            solved.add(i);
          }
        } else {
          cellStats[i] = { time: 0, errors: 0 };
        }
      }
    } else {
      // User is authenticated but not in our DB. This means the account was deleted.
      await api.auth.signOut();
      localStorage.removeItem('rusgator_username');
      localStorage.removeItem('rusgator_password');
      currentUser = null;
      dbUserRecord = null;
      checkSession();
      return;
    }

    document.getElementById('auth-overlay').classList.remove('active');
    document.getElementById('user-controls').style.display = 'flex';
    init(); 
  } else {
    currentUser = null;
    dbUserRecord = null;
    cellStats = {};
    solved.clear();
    
    const cachedUser = localStorage.getItem('rusgator_username');
    const cachedPass = localStorage.getItem('rusgator_password');
    
    if (cachedUser && cachedPass) {
      document.getElementById('auth-feedback').textContent = 'Вход...';
      try {
        const email = `${cachedUser}@rusgator.local`;
        const { data, error } = await api.auth.signInWithPassword({ email, password: cachedPass });
        if (!error && data.user) {
          checkSession();
          return;
        } else {
          localStorage.removeItem('rusgator_username');
          localStorage.removeItem('rusgator_password');
        }
      } catch (err) {
         console.log("Silent login failed", err);
         localStorage.removeItem('rusgator_username');
         localStorage.removeItem('rusgator_password');
      }
    }

    document.getElementById('auth-feedback').textContent = '';
    document.getElementById('auth-overlay').classList.add('active');
    document.getElementById('user-controls').style.display = 'none';
  }
}

async function logout() {
  await api.auth.signOut();
  resetGame();
  setTimeout(checkSession, 100);
}

// -------------- STATS & LEADERBOARD -------------- //

async function saveStatsForBlock(blockId) {
  if (!currentUser || !dbUserRecord) return;
  try {
    let updateData = {};
    updateData[`block_${blockId}`] = cellStats[blockId];
    
    dbUserRecord[`block_${blockId}`] = cellStats[blockId];
    
    let totalTime = 0;
    let totalErrors = 0;
    for (let i = 1; i <= 6; i++) {
        const block = dbUserRecord[`block_${i}`] || { time: 0, errors: 0 };
        totalTime += block.time;
        totalErrors += block.errors;
    }
    updateData['total_score'] = { time: totalTime, errors: totalErrors };

    await api
      .from('Rus_Users')
      .update(updateData)
      .eq('id', currentUser.id);

  } catch (error) {
    console.error("Error saving stats", error);
  }
}

async function openLeaderboard() {
  document.getElementById('leaderboard-overlay').classList.add('active');
  const list = document.getElementById('leaderboard-list');
  list.innerHTML = '<div style="text-align:center; padding: 20px;">Загрузка...</div>';
  
  const { data, error } = await api
    .from('Rus_Users')
    .select('display_name, username, total_score');
    
  if (error) {
     list.innerHTML = `<div style="color:var(--red); padding: 20px;">Ошибка загрузки: ${error.message}</div>`;
     return;
  }
  
  const players = data.filter(p => p.total_score && (p.total_score.time > 0 || p.total_score.errors > 0));
  
  players.sort((a,b) => {
     if (a.total_score.errors !== b.total_score.errors) return a.total_score.errors - b.total_score.errors;
     return a.total_score.time - b.total_score.time;
  });
  
  if (players.length === 0) {
      list.innerHTML = '<div style="text-align:center; padding: 20px;">Нет данных</div>';
      return;
  }
  
  list.innerHTML = players.map((p, index) => `
    <div class="lb-row ${currentUser && p.username === dbUserRecord.username ? 'lb-current' : ''}">
      <div class="lb-left">
        <span class="lb-rank">${index + 1}</span>
        <div class="lb-user">
          <span class="lb-name">${p.display_name}</span>
        </div>
      </div>
      <div class="lb-right">
        <span class="lb-stat-errors">Ошибок: ${p.total_score.errors}</span>
        <span class="lb-stat-time">⏱️ ${p.total_score.time} с</span>
      </div>
    </div>
  `).join('');
}

function closeLeaderboard() {
  document.getElementById('leaderboard-overlay').classList.remove('active');
}

