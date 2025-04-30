
function generateHWID() {
  const nav = window.navigator;
  const screen = window.screen;
  const hwidData = [
    nav.userAgent,
    nav.language,
    screen.colorDepth,
    screen.pixelDepth,
    screen.height,
    screen.width,
    new Date().getTimezoneOffset()
  ].join('###');
  
  let hash = 0;
  for (let i = 0; i < hwidData.length; i++) {
    const char = hwidData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function generateKey(hwid) {
  const date = new Date().toDateString();
  const seed = hwid + date;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function updateKey() {
  const hwid = generateHWID();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const storedDate = localStorage.getItem(`keyDate_${hwid}`);
  let key = localStorage.getItem(`currentKey_${hwid}`);
  
  if (!storedDate || today.getTime() !== new Date(storedDate).getTime()) {
    key = generateKey(hwid);
    localStorage.setItem(`currentKey_${hwid}`, key);
    localStorage.setItem(`keyDate_${hwid}`, today.toISOString());
  }
  
  document.getElementById('key-display').textContent = key;
}

updateKey();
setInterval(updateKey, 60000); // Check every minute
