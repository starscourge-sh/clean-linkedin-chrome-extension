const toggles = document.querySelectorAll('[data-key]');
const master = document.getElementById('masterToggle');
const nukeFeed = document.getElementById('nukeFeedToggle');
const resetBtn = document.getElementById('resetBtn');

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
