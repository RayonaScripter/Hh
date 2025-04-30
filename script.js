

function generateHWID() {
  return btoa(navigator.userAgent).replace(/[^a-zA-Z0-9]/g, '');
}

function generateKey() {
  const hwid = generateHWID();
  const date = new Date().toDateString();
  return btoa(hwid + date).replace(/[^a-zA-Z0-9]/g, '');
}

function updateKey() {
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem('lastDate');
  
  if (today !== lastDate) {
    const key = generateKey();
    localStorage.setItem('key', key);
    localStorage.setItem('lastDate', today);
  }
  
  document.getElementById('key-display').textContent = localStorage.getItem('key');
}

updateKey();
setInterval(updateKey, 60000); // Check every minute
