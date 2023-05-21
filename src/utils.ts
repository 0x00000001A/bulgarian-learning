export function clsx(...classList: unknown[]) {
  return classList.filter(Boolean).join(' ')
}
