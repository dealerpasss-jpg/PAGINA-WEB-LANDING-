/** Keep each explicit step change below the site's sticky navigation. */
export function focusCalculatorHeading(target: Pick<HTMLElement, 'focus' | 'scrollIntoView'> | null) {
  if (!target) return;
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: 'start', behavior: 'instant' });
}
