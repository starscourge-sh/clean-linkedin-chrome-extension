
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

const debounce = (fn, delay) => {
  let timer
  return () => {
    clearTimeout(timer)
    timer = setTimeout(fn, delay)
  }
}

const observeAndRemove = (settings) => {
  if (observer) observer.disconnect()

  cleanUp(settings)

  // by default runs your callback on every single DOM change. Expensive.
  // wait 500ms of DOM silence before running
  const debouncedCleanUp = debounce(() => cleanUp(settings), 500)

  observer = new MutationObserver(debouncedCleanUp)
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

