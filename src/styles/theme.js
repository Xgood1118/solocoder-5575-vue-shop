export function initTheme() {
  const savedTheme = localStorage.getItem('app-theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = savedTheme || (prefersDark ? 'dark' : 'light')
  applyTheme(theme)
}

export function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('theme-dark')
  } else {
    document.documentElement.classList.remove('theme-dark')
  }
  localStorage.setItem('app-theme', theme)
}

export function toggleTheme() {
  const isDark = document.documentElement.classList.contains('theme-dark')
  const newTheme = isDark ? 'light' : 'dark'
  applyTheme(newTheme)
  return newTheme
}
