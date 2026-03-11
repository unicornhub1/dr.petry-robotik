/**
 * Triggers a notification event via the API route.
 * Fire-and-forget: errors are logged but don't block the caller.
 */
export function triggerEvent(event: string, params: Record<string, string>) {
  fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, ...params }),
  }).catch((err) => {
    console.error(`Failed to trigger notification event [${event}]:`, err)
  })
}
