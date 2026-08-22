import posthog from 'posthog-js'

// Analytics is opt-in via env vars. When VITE_POSTHOG_KEY is absent (local dev,
// CI) every call is a no-op so the app runs cleanly without sending any data.
let ready = false

export function initAnalytics(): void {
  const key  = import.meta.env.VITE_POSTHOG_KEY  as string | undefined
  const host = import.meta.env.VITE_POSTHOG_HOST as string | undefined
  if (!key) return

  posthog.init(key, {
    api_host:        host ?? 'https://us.i.posthog.com',
    capture_pageview: true,   // automatic pageview on init
    autocapture:     false,   // no DOM click capture — only explicit events
    persistence:     'localStorage',
  })
  ready = true
}

// Track a custom event. Properties must never contain user-authored text
// (story names, roadmap names, tag names, etc.) — only numeric/categorical values.
export function track(event: string, properties?: Record<string, unknown>): void {
  if (!ready) return
  try {
    posthog.capture(event, properties)
  } catch {
    // Swallow silently: analytics must never break the app.
  }
}
