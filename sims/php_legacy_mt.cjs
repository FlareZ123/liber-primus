/**
 * Historical PHP 5.2.1–7.0 mt_rand() compatible implementation.
 * The twist deliberately tests the old-state u low bit, as ext/standard/rand.c did.
 * Uses exact uint32 operations, retains 31-bit output and pre-7.1 float range mapping.
 * @see https://github.com/php/php-src/blob/PHP-5.6.27/ext/standard/rand.c
 */
'use strict';

class LegacyPhpMt {
  /** @param {number} seed Unsigned 32-bit integer. */
  constructor(seed) {
    this.state = new Uint32Array(624);
    this.state[0] = seed >>> 0;
    for (let i = 1; i < 624; i++) {
      const s = this.state[i - 1];
      this.state[i] = (Math.imul(1812433253, s ^ (s >>> 30)) + i) >>> 0;
    }
    this.nextIndex = 624;
  }

  twist() {
    const a = this.state;
    for (let i = 0; i < 624; i++) {
      const u = a[i], v = a[(i + 1) % 624];
      const y = ((u & 0x80000000) | (v & 0x7fffffff)) >>> 1;
      a[i] = (a[(i + 397) % 624] ^ y ^ ((u & 1) ? 0x9908b0df : 0)) >>> 0;
    }
    this.nextIndex = 0;
  }

  /** @returns {number} 31-bit mt_rand() result. */
  next31() {
    if (this.nextIndex === 624) this.twist();
    let s = this.state[this.nextIndex++];
    s ^= s >>> 11;
    s ^= (s << 7) & 0x9d2c5680;
    s ^= (s << 15) & 0xefc60000;
    s ^= s >>> 18;
    return (s >>> 1) >>> 0;
  }

  /**
   * @param {number} min Inclusive minimum.
   * @param {number} max Inclusive maximum.
   * @returns {number} Historical RAND_RANGE result.
   */
  bounded(min, max) {
    return min + Math.floor(((max - min + 1) * this.next31()) / 2147483648);
  }
}
module.exports = { LegacyPhpMt };
