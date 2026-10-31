import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { canAnimateFilm, watchFilmAssets } from '../lib/animation/film-assets.ts';

test('film motion is disabled for reduced motion and short viewports', () => {
  assert.equal(canAnimateFilm(false, false), true);
  assert.equal(canAnimateFilm(true, false), false);
  assert.equal(canAnimateFilm(false, true), false);
  assert.equal(canAnimateFilm(true, true), false);
});

test('film assets decode together before motion becomes ready', async () => {
  const called: number[] = [];
  const results: boolean[] = [];
  const images = Array.from({ length: 7 }, (_, index) => ({ decode: async () => { called.push(index); } }));
  watchFilmAssets(images, ready => results.push(ready));
  assert.equal(called.length, 7);
  assert.deepEqual(results, []);
  await setImmediate();
  assert.deepEqual(results, [true]);
});

test('a failed or synchronously throwing decode selects a usable still fallback', async () => {
  for (const decode of [() => Promise.reject(new Error('unavailable')), () => { throw new Error('decode failed'); }]) {
    const results: boolean[] = [];
    watchFilmAssets([{ decode }], ready => results.push(ready));
    await setImmediate();
    assert.deepEqual(results, [false]);
  }
});

test('late asset success or failure cannot alter a cleaned up motion session', async () => {
  for (const failed of [false, true]) {
    let finish!: () => void;
    const pending = new Promise<void>((resolve, reject) => { finish = () => failed ? reject(new Error('late failure')) : resolve(); });
    const results: boolean[] = [];
    const cancel = watchFilmAssets([{ decode: () => pending }], ready => results.push(ready));
    cancel();
    finish();
    await setImmediate();
    assert.deepEqual(results, []);
  }
});
