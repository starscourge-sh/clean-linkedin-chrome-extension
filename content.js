const isRecommendedForYou = (component) => {
  const component = fi.outerHTML
  if (!component) return false
  return component.includes(">Recommended for you</p>")
}

const isJobsRecommendedForYou = (component) => {
  const component = fi.outerHTML
  if (!component) return false
  return component.includes(">Jobs recommended for you</p>")
}

const isPromoted = (component) => {
  const component = fi.outerHTML
  if (!component) return false
  return component.includes(">Promoted</p>") || component.includes(">Promoted by<span")
}

const isSuggested = (component) => {
  const component = fi.outerHTML
  if (!component) return false
  return component.includes(">Suggested</p>")
}

const containsFilteredPhrase = (component, phrases) => {
  try {
    const component = fi.outerHTML
    const phrasesArray = phrases.split(',').map(p => p.trim()).filter(p => p.length > 0)
    return phrasesArray.some(phrase => component.includes(phrase))
  } catch (e) {
    console.error("Error checking phrases:", e)
    return false
  }
}


const removeFeedDistractions = (settings) => {
  const feed = document.querySelector('[data-testid="mainFeed"]')
  try {
    if (feed) {
      if (settings.master && settings.nukeFeed) {
        feed.style.contentVisibility = 'hidden'
      } else {
        feed.style.contentVisibility = 'visible'
      }
    }

    const feedItems = document.querySelectorAll("[role=listitem]")

    feedItems.forEach(fi => {
      if (isJobsRecommendedForYou(fi.parentElement.parentElement)) {
        if (settings.master && (settings.jobSuggestions || containsFilteredPhrase(fi.parentElement.parentElement, settings.phrases))) {
          fi.parentElement.parentElement.style.contentVisibility = 'hidden'
        } else {
          fi.parentElement.parentElement.style.contentVisibility = 'visible'
        }
      }

      if (isRecommendedForYou(fi.parentElement.parentElement)) {
        if (settings.master && (settings.followSuggestions || containsFilteredPhrase(fi.parentElement.parentElement, settings.phrases))) {
          fi.parentElement.parentElement.style.contentVisibility = 'hidden'
        } else {
          fi.parentElement.parentElement.style.contentVisibility = 'visible'
        }
      }

      if (isPromoted(fi.parentElement.parentElement)) {
        if (settings.master && (settings.promoted || containsFilteredPhrase(fi.parentElement.parentElement, settings.phrases))) {
          fi.parentElement.parentElement.style.contentVisibility = 'hidden'
        } else {
          fi.parentElement.parentElement.style.contentVisibility = 'visible'
        }
      }

      if (isSuggested(fi.parentElement.parentElement)) {
        if (settings.master && (settings.suggested || containsFilteredPhrase(fi.parentElement.parentElement, settings.phrases))) {
          fi.parentElement.parentElement.style.contentVisibility = 'hidden'
        } else {
          fi.parentElement.parentElement.style.contentVisibility = 'visible'
        }
      }

    })
  } catch (e) {
    console.error("Error in removeFeedDistractions:", e)
    return
  }
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
  // wait 50ms of DOM silence before running
  const debouncedCleanUp = debounce(() => cleanUp(settings), 50)

  observer = new MutationObserver(debouncedCleanUp)
  observer.observe(document.body, { childList: true, subtree: true })
}

// Start on page load
chrome.storage.sync.get('settings', ({ settings }) => {
  const defaultSettings = {
    suggested: false, promoted: false, followSuggestions: false,
    jobSuggestions: false, premium: false, games: false,
    sponsoredMessages: false, viewerSuggestions: false, pageSuggestions: false,
    master: true, nukeFeed: false, phrases: ''
  }
  observeAndRemove(settings ?? defaultSettings)
})

// Re-apply when settings change
chrome.storage.onChanged.addListener((changes) => {
  if (changes.settings) observeAndRemove(changes.settings.newValue)
})

