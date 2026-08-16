const STORAGE_KEY = "study_mate_data";

const defaultData = {
  tasks: [],
  ddays: [],
  studyMinutes: 0,
  sessions: 0,
  streak: 0,
  lastStudyDate: null,
  subjectMinutes: {
    "수학": 0,
    "국어": 0,
    "영어": 0,
    "과학": 0,
    "사회": 0,
    "한국사": 0,
    "기타": 0
  },
  memo: ""
};

let data = JSON.parse(
  localStorage.getItem(STORAGE_KEY)
) || defaultData;

let timerSeconds = 25 * 60;
let timerInterval = null;
let timerRunning = false;

const quotes = [
  "작게 시작해도, 시작한 건 사라지지 않아.",
  "오늘의 30분이 내일의 자신감을 만든다.",
  "완벽하게 하는 것보다 계속하는 게 더 중요해.",
  "하나씩 끝내면 결국 다 끝난다.",
  "집중한 시간은 배신하지 않아.",
  "지금 하는 공부가 미래의 선택지를 만든다.",
  "오늘 조금이라도 한 사람이 결국 앞서간다."
];


// -------------------------
// 저장
// -------------------------

function save() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );
}


// -------------------------
// 타이머
// -------------------------

function startTimer() {

  if (timerRunning) {

    clearInterval(timerInterval);

    timerRunning = false;

    document.getElementById("startBtn").textContent = "시작";

    return;
  }

  timerRunning = true;

  document.getElementById("startBtn").textContent = "일시정지";

  timerInterval = setInterval(() => {

    timerSeconds--;

    updateTimer();

    if (timerSeconds <= 0) {

      clearInterval(timerInterval);

      timerRunning = false;

      completeStudy();

      alert("공부 시간 완료! 🎉");

      timerSeconds = 25 * 60;

      document.getElementById("startBtn").textContent = "시작";

      updateTimer();
    }

  }, 1000);
}


function resetTimer() {

  clearInterval(timerInterval);

  timerRunning = false;

  timerSeconds = 25 * 60;

  document.getElementById("startBtn").textContent = "시작";

  updateTimer();
}


function setTimer(minutes) {

  clearInterval(timerInterval);

  timerRunning = false;

  timerSeconds = minutes * 60;

  document.getElementById("startBtn").textContent = "시작";

  updateTimer();
}


function customTimer() {

  const value = prompt(
    "공부 시간을 몇 분으로 할까요?",
    "40"
  );

  const minutes = Number(value);

  if (
    Number.isInteger(minutes) &&
    minutes > 0 &&
    minutes <= 180
  ) {

    setTimer(minutes);

  } else {

    alert("1~180분 사이로 입력해주세요.");

  }
}


function updateTimer() {

  const minutes = Math.floor(
    timerSeconds / 60
  );

  const seconds =
    timerSeconds % 60;

  document.getElementById("timer").textContent =
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0");
}


// -------------------------
// 공부 기록
// -------------------------

function completeStudy() {

  const minutes = Math.round(
    timerSeconds / 60
  );

  data.studyMinutes += minutes;

  data.sessions++;

  const subject =
    document.getElementById("subject").value;

  if (!data.subjectMinutes[subject]) {
    data.subjectMinutes[subject] = 0;
  }

  data.subjectMinutes[subject] += minutes;

  updateStreak();

  save();

  render();
}


function updateStreak() {

  const today =
    new Date().toISOString().split("T")[0];

  if (data.lastStudyDate === today) {
    return;
  }

  if (!data.lastStudyDate) {

    data.streak = 1;

  } else {

    const last =
      new Date(data.lastStudyDate);

    const now =
      new Date(today);

    const difference =
      Math.floor(
        (now - last) /
        (1000 * 60 * 60 * 24)
      );

    if (difference === 1) {

      data.streak++;

    } else {

      data.streak = 1;

    }
  }

  data.lastStudyDate = today;
}


// -------------------------
// 할 일
// -------------------------

function showTaskInput() {

  document
    .getElementById("taskInputArea")
    .classList.toggle("hidden");
}


function addTask() {

  const input =
    document.getElementById("taskInput");

  const title =
    input.value.trim();

  if (!title) return;

  data.tasks.push({
    id: Date.now(),
    title,
    done: false
  });

  input.value = "";

  save();

  renderTasks();
  updateStats();
}


function toggleTask(id) {

  const task =
    data.tasks.find(
      task => task.id === id
    );

  if (!task) return;

  task.done = !task.done;

  save();

  renderTasks();
  updateStats();
}


function deleteTask(id) {

  data.tasks =
    data.tasks.filter(
      task => task.id !== id
    );

  save();

  renderTasks();
  updateStats();
}


function renderTasks() {

  const container =
    document.getElementById("tasks");

  container.innerHTML = "";

  data.tasks.forEach(task => {

    const div =
      document.createElement("div");

    div.className =
      "task" +
      (task.done ? " done" : "");

    div.innerHTML = `
      <button class="task-check"></button>

      <div class="task-title">
        ${escapeHTML(task.title)}
      </div>

      <button class="delete">×</button>
    `;

    div
      .querySelector(".task-check")
      .onclick = () =>
        toggleTask(task.id);

    div
      .querySelector(".delete")
      .onclick = () =>
        deleteTask(task.id);

    container.appendChild(div);

  });
}


// -------------------------
// D-DAY
// -------------------------

function showDdayInput() {

  document
    .getElementById("ddayInputArea")
    .classList.toggle("hidden");
}


function addDday() {

  const title =
    document
      .getElementById("ddayTitle")
      .value.trim();

  const date =
    document
      .getElementById("ddayDate")
      .value;

  if (!title || !date) {

    alert("이름과 날짜를 입력해주세요.");

    return;
  }

  data.ddays.push({
    id: Date.now(),
    title,
    date
  });

  document.getElementById("ddayTitle").value = "";
  document.getElementById("ddayDate").value = "";

  save();

  renderDdays();
}


function deleteDday(id) {

  data.ddays =
    data.ddays.filter(
      dday => dday.id !== id
    );

  save();

  renderDdays();
}


function calculateDday(date) {

  const target =
    new Date(date + "T00:00:00");

  const today =
    new Date();

  today.setHours(0, 0, 0, 0);

  const difference =
    Math.ceil(
      (target - today) /
      (1000 * 60 * 60 * 24)
    );

  if (difference === 0) {

    return "D-DAY";

  }

  if (difference > 0) {

    return `D-${difference}`;

  }

  return `D+${Math.abs(difference)}`;
}


function renderDdays() {

  const container =
    document.getElementById("ddays");

  container.innerHTML = "";

  data.ddays
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date)
    )
    .forEach(dday => {

      const div =
        document.createElement("div");

      div.className = "dday";

      div.innerHTML = `
        <div>
          <div class="dday-name">
            ${escapeHTML(dday.title)}
          </div>

          <div class="dday-date">
            ${dday.date}
          </div>
        </div>

        <div>
          <span class="dday-number">
            ${calculateDday(dday.date)}
          </span>

          <button
            class="delete"
            onclick="deleteDday(${dday.id})">
            ×
          </button>
        </div>
      `;

      container.appendChild(div);

    });
}


// -------------------------
// 통계
// -------------------------

function updateStats() {

  document.getElementById(
    "studyTime"
  ).textContent =
    formatMinutes(data.studyMinutes);

  const total =
    data.tasks.length;

  const completed =
    data.tasks.filter(
      task => task.done
    ).length;

  document.getElementById(
    "completed"
  ).textContent =
    `${completed} / ${total}`;

  document.getElementById(
    "streak"
  ).textContent =
    `${data.streak}일`;
}


function renderSubjectStats() {

  const container =
    document.getElementById(
      "subjectStats"
    );

  container.innerHTML = "";

  const subjects =
    data.subjectMinutes;

  const values =
    Object.values(subjects);

  const max =
    Math.max(...values, 1);

  Object.entries(subjects)
    .forEach(([subject, minutes]) => {

      const percentage =
        Math.round(
          minutes / max * 100
        );

      const row =
        document.createElement("div");

      row.className =
        "subject-row";

      row.innerHTML = `
        <span>${escapeHTML(subject)}</span>

        <div class="bar">
          <span
            style="width:${percentage}%">
          </span>
        </div>

        <strong>
          ${minutes}분
        </strong>
      `;

      container.appendChild(row);

    });
}


// -------------------------
// 메모
// -------------------------

function setupMemo() {

  const memo =
    document.getElementById("memo");

  memo.value =
    data.memo || "";

  memo.addEventListener(
    "input",
    () => {

      data.memo =
        memo.value;

      save();

    }
  );
}


// -------------------------
// 오늘의 문장
// -------------------------

function newQuote() {

  const index =
    Math.floor(
      Math.random() *
      quotes.length
    );

  document.getElementById(
    "quote"
  ).textContent =
    quotes[index];
}


// -------------------------
// 초기화
// -------------------------

function resetToday() {

  const answer =
    confirm(
      "오늘의 공부 기록과 할 일 완료 상태를 초기화할까요?"
    );

  if (!answer) return;

  data.studyMinutes = 0;

  data.sessions = 0;

  data.tasks.forEach(
    task => task.done = false
  );

  Object.keys(
    data.subjectMinutes
  ).forEach(
    subject =>
      data.subjectMinutes[subject] = 0
  );

  save();

  render();
}


// -------------------------
// 보안용 HTML 처리
// -------------------------

function escapeHTML(text) {

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// -------------------------
// 전체 렌더링
// -------------------------

function render() {

  updateTimer();

  renderTasks();

  renderDdays();

  updateStats();

  renderSubjectStats();

}


// 시작
render();

setupMemo();
