
const removeFeedDistractions = (settings) => {
  const feed = document.querySelector('[data-testid="mainFeed"]')
  if (feed) {
    if (settings.master && settings.nukeFeed) {
      feed.style.contentVisibility = 'hidden'
      return
    } else {
      feed.style.contentVisibility = 'visible'
    }
  }

  const feedItems = document.querySelectorAll("[role=listitem]")

  feedItems.forEach(fi => {
    const component = fi.outerHTML
    if (component.includes(">Jobs recommended for you</p>") && fi.parentElement.parentElement) {
      if (settings.master && settings.jobSuggestions) {
        fi.parentElement.parentElement.style.contentVisibility = 'hidden'
      } else {
        fi.parentElement.parentElement.style.contentVisibility = 'visible'
      }
    }

    if (component.includes(">Recommended for you</p>") && fi.parentElement.parentElement) {
      if (settings.master && settings.followSuggestions) {
        fi.parentElement.parentElement.style.contentVisibility = 'hidden'
      } else {
        fi.parentElement.parentElement.style.contentVisibility = 'visible'
      }
    }

    if ((component.includes(">Promoted</p>") || component.includes(">Promoted by<span")) && fi.parentElement.parentElement) {
      if (settings.master && settings.promoted) {
        fi.parentElement.parentElement.style.contentVisibility = 'hidden'
      } else {
        fi.parentElement.parentElement.style.contentVisibility = 'visible'
      }
    }

    if (component.includes(">Suggested</p>") && fi.parentElement.parentElement) {
      if (settings.master && settings.suggested) {
        fi.parentElement.parentElement.style.contentVisibility = 'hidden'
      } else {
        fi.parentElement.parentElement.style.contentVisibility = 'visible'
      }
    }
  })
}

const cleanUp = (settings) => {
  removeFeedDistractions(settings)
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
  // wait 250ms of DOM silence before running
  const debouncedCleanUp = debounce(() => cleanUp(settings), 250)

  observer = new MutationObserver(debouncedCleanUp)
  observer.observe(document.body, { childList: true, subtree: true })
}

// Start on page load
chrome.storage.sync.get('settings', ({ settings }) => {
  const defaultSettings = {
    suggested: false, promoted: false, followSuggestions: false,
    jobSuggestions: false, premium: false, games: false,
    sponsoredMessages: false, viewerSuggestions: false, pageSuggestions: false,
    master: true, nukeFeed: false
  }
  observeAndRemove(settings ?? defaultSettings)
})

// Re-apply when settings change
chrome.storage.onChanged.addListener((changes) => {
  if (changes.settings) observeAndRemove(changes.settings.newValue)
})

