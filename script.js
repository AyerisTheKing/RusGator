// v1.2
const questions = [
  {
    id: 1,
    question: "На какой улице находится институт переподготовки и повышения квалификации?",
    answer: "зиё 6",
    display: "Зиё 6",
    phrase: "Именно"
  },
  {
    id: 2,
    question: "В какой стране Авлоний был консулом?",
    answer: "афганистан",
    display: "Афганистан",
    phrase: "родной язык и литература"
  },
  {
    id: 3,
    question: "Как называется школа, которую открыл Авлоний в 1902 году?",
    answer: "новометодная",
    display: "Новометодная",
    phrase: "показывают существование"
  },
  {
    id: 4,
    question: "Он ввёл модель... переходя из одного класса в другой.",
    answer: "экзамен",
    display: "Экзамен",
    phrase: "любой"
  },
  {
    id: 5,
    question: "Он ввёл между уроками...",
    answer: "перемены",
    display: "Перемены",
    phrase: "нации"
  },
  {
    id: 6,
    question: "В каком году был указ президента Мирзиёева о посмертном награждении орденом «Буюк хизматлари учун»?",
    answer: "2020",
    display: "2020",
    phrase: "в мире."
  }
];

let solved = new Set();
let activeCell = null;

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

  const q = questions.find(x => x.id === id);
  document.getElementById('modal-question').textContent = q.question;
  document.getElementById('modal-input').value = '';
  document.getElementById('modal-feedback').textContent = '';
  document.getElementById('modal-feedback').className = 'feedback';

  document.getElementById('modal-overlay').classList.add('active');
  document.getElementById('modal-input').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  document.getElementById('modal-input').value = '';
  document.getElementById('modal-feedback').textContent = '';
  activeCell = null;
}

function checkAnswer() {
  if (!activeCell) return;
  const q = questions.find(x => x.id === activeCell);
  
  const normalize = (str) => {
    return str.trim().toLowerCase().replace(/ё/g, 'е');
  };

  const input = normalize(document.getElementById('modal-input').value);
  const feedback = document.getElementById('modal-feedback');

  if (input === normalize(q.answer)) {
    feedback.textContent = '✓ Верно! ' + q.display;
    feedback.className = 'feedback correct';

    setTimeout(() => {
      solved.add(activeCell);
      const cell = document.getElementById(`cell-${activeCell}`);
      cell.classList.add('solved');
      updatePhrase();
      closeModal();
      checkWin();
    }, 1000);
  } else {
    feedback.textContent = '✗ Неверно. Попробуйте ещё раз.';
    feedback.className = 'feedback wrong';
    document.getElementById('modal-input').select();
  }
}

function updatePhrase() {
  questions.forEach(q => {
    const el = document.getElementById(`phrase-${q.id}`);
    if (el) {
      if (solved.has(q.id)) {
        el.classList.add('revealed');
      } else {
        el.classList.remove('revealed');
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
  closeWin();
  init();
}

// Enter key support
document.addEventListener('DOMContentLoaded', () => {
  init();

  document.getElementById('modal-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkAnswer();
    if (e.key === 'Escape') closeModal();
  });

  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });
});
