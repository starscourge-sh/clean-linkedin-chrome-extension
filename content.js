
const removeSuggestedPosts = () => {
  const feedItems = document.querySelectorAll("[role=listitem]")
  feedItems.forEach(fi => {
    if (fi.outerHTML.includes(">Suggested</p>")) {
      fi.remove()
    }
  })
}

const removePromotedPosts = () => {
  const feedItems = document.querySelectorAll("[role=listitem]")
  feedItems.forEach(fi => {
    if (fi.outerHTML.includes(">Promoted</p>") || fi.outerHTML.includes(">Promoted by<span")) {
      fi.remove()
    }
  })
}

const removeRecommendedAccountsPosts = () => {
  const feedItems = document.querySelectorAll("[role=listitem]")
  feedItems.forEach(fi => {
    if (fi.outerHTML.includes(">Recommended for you</p>")) {
      fi.remove()
    }
  })
}

const removeRecommendedJobsPosts = () => {
  const feedItems = document.querySelectorAll("[role=listitem]")
  feedItems.forEach(fi => {
    if (fi.outerHTML.includes(">Jobs recommended for you</p>")) {
      fi.remove()
    }
  })
}

const cleanUp = (settings) => {
  if (!settings.master) return
  if (settings.suggested) removeSuggestedPosts()
  if (settings.promoted) removePromotedPosts()
  if (settings.followSuggestions) removeRecommendedAccountsPosts()
  if (settings.jobSuggestions) removeRecommendedJobsPosts()
}

let observer = null

const observeAndRemove = (settings) => {
  if (observer) observer.disconnect()

  cleanUp(settings)

  observer = new MutationObserver(() => cleanUp(settings))
  observer.observe(document.body, { childList: true, subtree: true })
}

// Start on page load
chrome.storage.sync.get('settings', ({ settings }) => {
  const defaultSettings = {
    suggested: true, promoted: true, followSuggestions: true,
    jobSuggestions: true, premium: true, games: true,
    sponsoredMessages: true, viewerSuggestions: true, pageSuggestions: true,
    master: true
  }
  observeAndRemove(settings ?? defaultSettings)
})

// Re-apply when settings change
chrome.storage.onChanged.addListener((changes) => {
  if (changes.settings) observeAndRemove(changes.settings.newValue)
})
