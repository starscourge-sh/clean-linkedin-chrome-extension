const toggles = document.querySelectorAll('[data-key]');
const master = document.getElementById('masterToggle');
const nukeFeed = document.getElementById('nukeFeedToggle');
const resetBtn = document.getElementById('resetBtn');

console.log("[🐛][toggles]: ", toggles)
console.log("[🐛][master]: ", master)

// function loadSettings() {
// chrome.storage.sync.get(null, (settings) => {
// if (settings.enabled === false) master.checked = false;
// toggles.forEach(t => {
// if (settings[t.dataset.key] === false) t.checked = false;
// });
// });
// }

// function save(key, value) {
// chrome.storage.sync.set({ [key]: value });
// }

// master.addEventListener('change', () => {
// save('enabled', master.checked);
// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
// chrome.tabs.sendMessage(tabs[0].id, { type: 'toggle', enabled: master.checked });
// });
// });

// toggles.forEach(t => {
// t.addEventListener('change', () => {
// save(t.dataset.key, t.checked);
// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
// chrome.tabs.sendMessage(tabs[0].id, { type: 'update', key: t.dataset.key, value: t.checked });
// });
// });
// });

// resetBtn.addEventListener('click', () => {
// master.checked = true;
// toggles.forEach(t => { t.checked = true; });
// const defaults = { enabled: true };
// toggles.forEach(t => { defaults[t.dataset.key] = true; });
// chrome.storage.sync.set(defaults);
// });

// Load blocked count from background
// chrome.runtime.sendMessage({ type: 'getCount' }, (response) => {
// if (response) document.getElementById('blockedCount').textContent = response.count || 0;
// });

// loadSettings();
//

const defaultSettings = {
  suggested: false,
  promoted: false,
  followSuggestions: false,
  jobSuggestions: false,
  premium: false,
  games: false,
  sponsoredMessages: false,
  viewerSuggestions: false,
  pageSuggestions: false,
  master: true,
  nukeFeed: false
}

async function loadSettings() {
  let { settings } = await chrome.storage.sync.get('settings') || defaultSettings
  settings = settings ?? defaultSettings
  master.checked = settings.master
  nukeFeed.checked = settings.nukeFeed
  toggles.forEach(t => { t.checked = settings[t.dataset.key] })
}

async function saveSettings() {
  const { settings: currentSettings } = await chrome.storage.sync.get('settings')
  const updated = currentSettings ?? defaultSettings

  toggles.forEach(t => updated[t.dataset.key] = t.checked)
  updated.master = master.checked
  updated.nukeFeed = nukeFeed.checked

  await chrome.storage.sync.set({ settings: updated })
}

async function reset() {
  console.log("[reset]")
  await chrome.storage.sync.set({ settings: defaultSettings })
  await loadSettings()
}

master.addEventListener('change', saveSettings)
nukeFeed.addEventListener('change', saveSettings)
toggles.forEach(opt => opt.addEventListener('change', saveSettings))
resetBtn.addEventListener('click', reset)

loadSettings()
