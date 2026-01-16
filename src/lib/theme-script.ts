// This script runs before React hydration to prevent flash of wrong theme
export const themeScript = `
(function() {
  const STORAGE_KEY = 'ib-drpetry-theme';
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored === 'light') {
    document.documentElement.classList.add('light');
  } else if (!stored) {
    // Check system preference if no stored value
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.documentElement.classList.add('light');
    }
  }
})();
`
