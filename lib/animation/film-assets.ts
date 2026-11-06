/** Motion is an enhancement; still modes only need the road and open hand. */
export function canAnimateFilm(reducedMotion: boolean, compactHeight: boolean) {
  return !reducedMotion && !compactHeight;
}

/** Ignore late decodes after a mode change or unmount, including Strict Mode cleanup. */
export function watchFilmAssets(
  images: readonly { decode(): Promise<void> }[],
  settled: (ready: boolean) => void,
) {
  let active = true;
  Promise.all(images.map(async image => image.decode())).then(
    () => { if (active) settled(true); },
    () => { if (active) settled(false); },
  );
  return () => { active = false; };
}
