const isRecommendedForYou = (component) => {
  if (!component) return false
  const markup = component.outerHTML
  return markup.includes(">Recommended for you</p>")
}

const isJobsRecommendedForYou = (component) => {
  if (!component) return false
  const markup = component.outerHTML
  return markup.includes(">Jobs recommended for you</p>")
}

const isPromoted = (component) => {
  if (!component) return false
  const markup = component.outerHTML
  return markup.includes(">Promoted</p>") || markup.includes(">Promoted by<span")
}

const isSuggested = (component) => {
  if (!component) return false
  const markup = component.outerHTML
  return markup.includes(">Suggested</p>")
}

const containsFilteredPhrase = (component, phrases) => {
  if (!component) return false
  const markup = component.outerHTML
  const phrasesArray = phrases.split(',').map(p => p.trim()).filter(p => p.length > 0)
  return phrasesArray.some(phrase => markup.includes(phrase))
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

      if (settings.master && (containsFilteredPhrase(fi.parentElement.parentElement, settings.phrases))) {
        fi.parentElement.parentElement.style.contentVisibility = 'hidden'
        return
      } else {
        fi.parentElement.parentElement.style.contentVisibility = 'visible'
        return
      }


      if (isJobsRecommendedForYou(fi.parentElement.parentElement)) {
        if (settings.master && (settings.jobSuggestions || containsFilteredPhrase(fi.parentElement.parentElement, settings.phrases))) {
          fi.parentElement.parentElement.style.contentVisibility = 'hidden'
          return
        } else {
          fi.parentElement.parentElement.style.contentVisibility = 'visible'
          return
        }
      }

      if (isRecommendedForYou(fi.parentElement.parentElement)) {
        if (settings.master && (settings.followSuggestions || containsFilteredPhrase(fi.parentElement.parentElement, settings.phrases))) {
          fi.parentElement.parentElement.style.contentVisibility = 'hidden'
          return
        } else {
          fi.parentElement.parentElement.style.contentVisibility = 'visible'
          return
        }
      }

      if (isPromoted(fi.parentElement.parentElement)) {
        if (settings.master && (settings.promoted || containsFilteredPhrase(fi.parentElement.parentElement, settings.phrases))) {
          fi.parentElement.parentElement.style.contentVisibility = 'hidden'
          return
        } else {
          fi.parentElement.parentElement.style.contentVisibility = 'visible'
          return
        }
      }

      if (isSuggested(fi.parentElement.parentElement)) {
        if (settings.master && (settings.suggested || containsFilteredPhrase(fi.parentElement.parentElement, settings.phrases))) {
          fi.parentElement.parentElement.style.contentVisibility = 'hidden'
          return
        } else {
          fi.parentElement.parentElement.style.contentVisibility = 'visible'
          return
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

