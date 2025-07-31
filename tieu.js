// ==== Âm thanh ====
const popSound = new Audio('Pop.mp3');
const menuSound = new Audio('Menu.mp3');
const goSound = new Audio('GO.mp3');
const rollSound = new Audio('Roll.mp3');
const noteSound = new Audio('Note.mp3');

// ==== Biến toàn cục ====
let names = [];
let angle = 0;
let isSpinning = false;
let repeatCount = 1;
let spinSpeed = 1;

const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const radius = canvas.width / 2;

const colors = [
  "#d5c3c7", "#ced6bd", "#f7eae4",
  "#f1dcca", "#e6ede3", "#f7e19a", "#cddae5"
];

// ==== Cập nhật danh sách tên người chơi ====
function updateNameList() {
  const input = document.getElementById("inputNames").value.trim();
  const rawNames = input.split("\n").map(n => n.trim()).filter(n => n);
  names = [];
  for (let i = 0; i < repeatCount; i++) {
    names = names.concat(rawNames);
  }
}

// ==== Vẽ bánh xe ====
function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const sliceAngle = (2 * Math.PI) / names.length;

  for (let i = 0; i < names.length; i++) {
    const startAngle = i * sliceAngle;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius, startAngle, endAngle);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();

    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#260b03";
    ctx.font = "16px sans-serif";
    ctx.fillText(names[i], radius - 10, 5);
    ctx.restore();
  }
}

function drawSpinningWheel(rotation) {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(radius, radius);
  ctx.rotate(rotation);
  ctx.translate(-radius, -radius);
  drawWheel();
  ctx.restore();
}

// ==== Bắt đầu quay ====
document.getElementById("spinButton").onclick = () => {
  if (isSpinning) return;
  isSpinning = true;

  goSound.currentTime = 0;
  goSound.play();

  updateNameList();
  if (names.length < 2) {
    alert("Cần ít nhất 2 lựa chọn.");
    isSpinning = false;
    return;
  }

  drawWheel();
  rollSound.currentTime = 0;
  rollSound.loop = true;
  rollSound.play();

  const spinTime = 3000 + (spinSpeed - 1) * 1000;
  const spinAngle = 10 + Math.random() * 10;
  const start = performance.now();

  function animateSpin(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / spinTime, 1);
    const easing = 1 - Math.pow(1 - progress, 3);
    angle = easing * spinAngle * 2 * Math.PI;

    drawSpinningWheel(angle);

    if (progress < 1) {
      requestAnimationFrame(animateSpin);
    } else {
      rollSound.pause();
      isSpinning = false;
      showResult(angle);
    }
  }

  requestAnimationFrame(animateSpin);
};

// ==== Hiện kết quả ====
function showResult(finalAngle) {
  const sliceAngle = (2 * Math.PI) / names.length;
  const adjusted = finalAngle % (2 * Math.PI);
  const index = Math.floor((2 * Math.PI - adjusted) / sliceAngle) % names.length;
  const winner = names[index];

  document.getElementById("resultText").textContent = `🎯 Tiêu chọn: ${winner}`;
  document.getElementById("vietlottNumbers").innerHTML = "";
  document.getElementById("vietlottTitle").textContent = "";

  document.getElementById("resultOverlay").style.display = 'flex';
  noteSound.currentTime = 0;
  noteSound.play();
}

// ==== Đóng overlay ====
document.getElementById("closeResult").onclick = () => {
  document.getElementById("resultOverlay").style.display = 'none';
};

// ==== Tải lại khi mở trang ====
window.onload = () => {
  updateNameList();
  drawWheel();
};

// ==== Khi thay đổi input ====
document.getElementById("inputNames").addEventListener("input", () => {
  updateNameList();
  drawWheel();
});

// ==== Nút chọn số lần lặp ====
document.querySelectorAll('.repeat-btn').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.repeat-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    repeatCount = parseInt(button.dataset.repeat);
    popSound.currentTime = 0;
    popSound.play();
  });
});

// ==== Nút chọn tốc độ ====
document.querySelectorAll('.speed-btn').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    spinSpeed = parseInt(button.dataset.speed);
    popSound.currentTime = 0;
    popSound.play();
  });
});

// ==== Sinh số Vietlott ====
function generateVietlottNumbers(type) {
  const max = type === 'mega' ? 45 : 55;
  const pool = Array.from({ length: max }, (_, i) => i + 1);
  const selected = [];

  while (selected.length < 6) {
    const index = Math.floor(Math.random() * pool.length);
    selected.push(pool.splice(index, 1)[0]);
  }

  return selected.sort((a, b) => a - b);
}

// ==== Nút Vietlott Mega / Power ====
document.querySelectorAll('.menu .vietlott-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    menuSound.currentTime = 0;
    menuSound.play();

    const type = btn.dataset.type;
    const result = generateVietlottNumbers(type);
    const container = document.getElementById('vietlottNumbers');
    const title = document.getElementById('vietlottTitle');

    document.getElementById("resultText").textContent = "";
    container.innerHTML = '';
    result.forEach(num => {
      const ball = document.createElement('div');
      ball.className = 'vietlott-ball';
      ball.textContent = num;
      container.appendChild(ball);
    });

    title.textContent = `🎯 Kết quả: ${type === 'mega' ? 'Mega 6/45' : 'Power 6/55'}`;
    document.getElementById('resultOverlay').style.display = 'flex';
    noteSound.currentTime = 0;
    noteSound.play();
  });
});
