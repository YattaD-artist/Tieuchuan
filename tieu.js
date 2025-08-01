// Âm thanh
const popSound  = new Audio('Pop.mp3');
const menuSound = new Audio('Menu.mp3');
const goSound   = new Audio('GO.mp3');
const noteSound = new Audio('Note.mp3');

// Biến toàn cục
let names = [], angle = 0, isSpinning = false;
let repeatCount = 1, spinSpeed = 1;

const canvas = document.getElementById("wheelCanvas");
const ctx    = canvas.getContext("2d");
const radius = canvas.width / 2;
const colors = ["#d5c3c7","#ced6bd","#f7eae4","#f1dcca","#e6ede3","#f7e19a","#cddae5"];

// CẬP NHẬT danh sách từ textarea
function updateNameList() {
  const raw = document.getElementById("inputNames").value
                .trim().split("\n").map(s=>s.trim()).filter(s=>s);
  names = [];
  for (let i=0; i<repeatCount; i++) names.push(...raw);
}

// VẼ bánh
function drawWheel() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if (!names.length) return;
  const slice = 2*Math.PI / names.length;
  names.forEach((n,i)=>{
    const start = i*slice, end = start+slice;
    ctx.beginPath();
    ctx.moveTo(radius,radius);
    ctx.arc(radius,radius,radius,start,end);
    ctx.fillStyle = colors[i%colors.length];
    ctx.fill();
    // text
    ctx.save();
    ctx.translate(radius,radius);
    ctx.rotate(start + slice/2);
    ctx.textAlign="right";
    ctx.fillStyle="#260b03";
    ctx.font="16px sans-serif";
    ctx.fillText(n, radius-10,5);
    ctx.restore();
  });
}

// VẼ khi quay
function drawSpinningWheel(rot) {
  ctx.save();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.translate(radius,radius);
  ctx.rotate(rot);
  ctx.translate(-radius,-radius);
  drawWheel();
  ctx.restore();
}

// BẮT ĐẦU quay
document.getElementById("spinButton").onclick = () => {
  if (isSpinning) return;
  goSound.currentTime=0; goSound.play();
  isSpinning = true;
  document.getElementById("resultOverlay").style.display='none';
  updateNameList();
  if (names.length<2) {
    alert("Cần ít nhất 2 lựa chọn."); isSpinning=false; return;
  }
  drawWheel();
  const spinTime  = 3000 + (spinSpeed-1)*1000;
  const spinAngle = (10 + Math.random()*10) * 2*Math.PI;
  const start = performance.now();
  function animate(now) {
    const t = Math.min((now-start)/spinTime,1);
    const ease = 1 - Math.pow(1-t,3);
    angle = ease * spinAngle;
    drawSpinningWheel(angle);
    if (t<1) requestAnimationFrame(animate);
    else { isSpinning=false; showResult(angle); }
  }
  requestAnimationFrame(animate);
};

// HIỂN THỊ kết quả bánh
function showResult(finalAngle) {
  const slice = 2*Math.PI / names.length;
  const adj   = finalAngle % (2*Math.PI);
  const idx   = Math.floor((2*Math.PI - adj)/slice) % names.length;
  const win   = names[idx];
  document.getElementById("resultText").textContent = `🎯 Tiêu suy đi tính lại vài lần đã chọn được: ${win}`;
  document.getElementById("resultOverlay").style.display='flex';
  noteSound.currentTime=0; noteSound.play();
}

// Khởi tạo & sự kiện textarea
document.addEventListener('DOMContentLoaded',()=>{
  updateNameList();
  drawWheel();
});
document.getElementById("inputNames")
  .addEventListener("input",()=>{ updateNameList(); drawWheel(); });

// Nút lặp danh sách
document.querySelectorAll('.repeat-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.repeat-btn')
      .forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    repeatCount = parseInt(btn.dataset.repeat);
    updateNameList(); drawWheel();
    popSound.currentTime=0; popSound.play();
  });
});

// Nút tốc độ
document.querySelectorAll('.speed-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.speed-btn')
      .forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    spinSpeed = parseInt(btn.dataset.speed);
    popSound.currentTime=0; popSound.play();
  });
});

// VIETLOTT
function generateVietlottNumbers(type) {
  const max = (type==='mega'?45:55);
  const pool = Array.from({length:max},(_,i)=>i+1);
  const sel = [];
  while(sel.length<6) {
    const idx = Math.floor(Math.random()*pool.length);
    sel.push(pool.splice(idx,1)[0]);
  }
  return sel.sort((a,b)=>a-b);
}
document.querySelectorAll('.vietlott-menu .menu-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    menuSound.currentTime=0; menuSound.play();
    const type = btn.dataset.type;
    const nums = generateVietlottNumbers(type);
    const cont = document.getElementById('vietlottNumbers');
    document.getElementById('vietlottTitle').textContent =
      `Kết quả: ${type==='mega'?'Mega 6/45':'Power 6/55'}`;
    cont.innerHTML='';
    nums.forEach(n=>{
      const ball = document.createElement('div');
      ball.className='vietlott-ball'; ball.textContent=n;
      cont.appendChild(ball);
    });
    document.getElementById('vietlottOverlay').style.display='flex';
    noteSound.currentTime=0; noteSound.play();
  });
});
document.getElementById('vietlottClose').onclick = ()=>{
  document.getElementById('vietlottOverlay').style.display='none';
};

// ABCD
const abcdBtn       = document.getElementById('abcdBtn');
const abcdOverlay   = document.getElementById('abcdOverlay');
const closeAbcd     = document.getElementById('closeAbcd');
const startAbcd     = document.getElementById('startAbcd');
const questionInput = document.getElementById('questionCount');
const abcdResult    = document.getElementById('abcdResult');

abcdBtn.onclick = ()=>{
  abcdOverlay.style.display='flex';
  noteSound.currentTime=0; noteSound.play();
};
closeAbcd.onclick = ()=>{
  abcdOverlay.style.display='none';
  abcdResult.innerHTML=''; questionInput.value='';
};
startAbcd.onclick = ()=>{
  const c = parseInt(questionInput.value);
  if (isNaN(c)||c<1||c>50) {
    alert("Vui lòng nhập số từ 1 đến 50."); return;
  }
  abcdResult.innerHTML='';
  const cols = Math.min(Math.max(c,5),10);
  abcdResult.style.setProperty('--cols', cols);
  const opts = ['A','B','C','D'];
  for (let i=1; i<=c; i++){
    const cell = document.createElement('div');
    cell.className='abcd-cell';
    cell.textContent = `${i}: ${opts[Math.floor(Math.random()*4)]}`;
    abcdResult.appendChild(cell);
  }
};

// Đóng kết quả bánh
document.getElementById("closeResult").onclick = ()=>{
  document.getElementById("resultOverlay").style.display='none';
};
