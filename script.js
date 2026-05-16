const categoryMap = {
  "General_Knowledge": 9,
  "Movies": 11,
  "Sports": 21,
  "Art": 25,
  "Science_and_nature": 17,
  "Anime": 31,
  "Mathematics": 19,
  "Gadgets": 30
};

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 15;

function startQuiz(topic) {
  const categoryId = categoryMap[topic];
  if (!categoryId) {
    alert("Invalid topic");
    return;
  }

  document.getElementById("category-select").style.display = "none";
  document.getElementById("quiz-title").textContent = "Quiz Time!";

  fetch(`https://opentdb.com/api.php?amount=10&category=${categoryId}&difficulty=easy&type=multiple`)
    .then(res => res.json())
    .then(data => {
      questions = data.results.map(q => ({
        question: decodeHTML(q.question),
        options: shuffle([...q.incorrect_answers, q.correct_answer].map(decodeHTML)),
        answer: decodeHTML(q.correct_answer)
      }));
      currentQuestionIndex = 0;
      score = 0;
      showQuestion();
    })
    .catch(err => {
      console.error("Failed to load quiz", err);
    });
}

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function showQuestion() {
  clearInterval(timer);
  timeLeft = 15;
  updateTimerDisplay();

  const q = questions[currentQuestionIndex];
  const quizBody = document.getElementById("quiz-body");

  quizBody.innerHTML = `
    <h2>Q${currentQuestionIndex + 1}: ${q.question}</h2>
    <div class="options" id="answers">
      ${q.options.map(opt =>
        `<button onclick="checkAnswer(this, '${opt.replace(/'/g, "\\'")}')">${opt}</button>`).join("")}
    </div>
  `;

  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timer);
      moveToNextQuestion();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerDisplay = document.getElementById("time-left");
  if (timerDisplay) {
    timerDisplay.textContent = timeLeft;
  }
}

function checkAnswer(button, selected) {
  clearInterval(timer);
  const correctAnswer = questions[currentQuestionIndex].answer;
  const buttons = document.querySelectorAll("#answers button");

  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === correctAnswer) {
      btn.classList.add("correct");
    } else if (btn.textContent === selected) {
      btn.classList.add("wrong");
    }
  });

  if (selected === correctAnswer) {
    score++;
  }

  setTimeout(moveToNextQuestion, 1500);
}

function moveToNextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  clearInterval(timer);
  const quizBody = document.getElementById("quiz-body");
  quizBody.innerHTML = `
    <h2>Quiz Completed!</h2>
    <p>Your Score: ${score} / ${questions.length}</p>
    <button onclick="location.reload()">Try Another Quiz</button>
  `;
}

window.onload = () => {
  const username = localStorage.getItem("quizUser");
  if (username) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("quiz-content").style.display = "block";
    document.getElementById("quiz-title").textContent = `Welcome, ${username}! Ready for Quiz Time?`;
  }

  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("username").value.trim();
    if (user) {
      localStorage.setItem("quizUser", user);
      document.getElementById("login-screen").style.display = "none";
      document.getElementById("quiz-content").style.display = "block";
      document.getElementById("quiz-title").textContent = `Welcome, ${user}! Ready for Quiz Time?`;
    } else {
      alert("Please enter your name.");
    }
  });

  document.getElementById("theme-toggle").addEventListener("change", (e) => {
    document.body.classList.toggle("dark-mode", e.target.checked);
  });
};

document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("quizUser");
  location.reload();
});
