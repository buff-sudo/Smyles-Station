/* BEGIN CODE FROM https://github.com/cawa-93/vite-electron-builder */
import {type BinaryLike, createHash} from 'node:crypto';

export function sha256sum(data: BinaryLike) {
  return createHash('sha256').update(data).digest('hex');
}
/* END CODE FROM https://github.com/cawa-93/vite-electron-builder */
