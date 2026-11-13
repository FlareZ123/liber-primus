# Signed-2016 OutGuess seed230 cannot start p32's historical F-transparent prime clock

**Agent 17, 13 November 2026. Evidence class:** one narrowly source-selected, exact two-rune obstruction. **No recovered unknown LP2 plaintext, authenticated key, or continuation destination.**

## Player-visible motivation and its limitation

The original 2016 Cicada JPEG and clear-signed OutGuess extraction are preserved under `resources/historical/cicada2016-4gq25.jpg` and `.asc`. The source extraction reconstructed exactly 1,136 payload bytes and reported **`seed: 230`** ([archival and verified extract](../resources/cicada2016-4gq25.md)). The image's 563×569 dimensions independently resemble p32's two 11-rune GP-prime row/column sums; this link does not establish an author-selected decipherment method. The signed message says that Liber Primus is the map and its numbers the direction, without mentioning 230 or a cipher.

A human solver seeing `seed: 230` during extraction could try it as a **one-based ordinal of the first prime** in the genuine solved p56 prime-totient cipher. The choice of ordinal interpretation is an analyst hypothesis: the extraction seed is tool output rather than a signed instruction, and source image publication postdates the manuscript.

## Complete exact obstruction on original p32

The authentic p56 mechanism adds φ(consecutive primes) modulo29 and transmits a **literal plaintext F** unchanged as ciphertext F, without advancing the prime clock. The original p32 source ciphertext opens with GP indices **[20, 2]**, the runes L and TH.

- The **230th prime is 1451**, whose totient is 1450 ≡ **0 mod29**. Original p32 `C[0]=20` is non-F, forcing ordinary decryption to `P[0]=20`; one prime is consumed.
- The **231st prime is 1453**, whose totient is 1452 ≡ **2 mod29**. Original `C[1]=2` then forces `P[1]=0=F` under ordinary decryption.
- Under the independently solved literal-F interrupter rule, `P[1]=F` would instead be transmitted as **`C[1]=0`**, contradicting the original `C[1]=2`.

Because neither of the first two ciphertext symbols is F, **there is no possible alternate F-skip state** before that contradiction. A complete exact state-set solver retaining both interpretations of every ciphertext F confirms the **first impossible original p32 offset is 1** (zero-based), even with unrestricted future F masks.

The [source-reading single-file reproducer](../sims/p32_signed2016_outguess230_ftransparent_sft.cjs) asserts the exact preserved OutGuess seed, p32 source indices, consecutive source-prime values and the two-run obstruction. It also re-decrypts and forward re-encrypts **all 85 original solved p56 runes** using their attested literal-F position and recovers a separately encrypted **85-rune** GP-native synthetic plant under prime ordinal230. The script was executed on the actual current GitHub original corpus and historical source text with source-reading wrappers on 13 November 2026; every assertion passed.

## Decision

**Retire the exact seed230 → p32 prime-ordinal-start → solved-p56 F-transparent GP29 transfer.** It cannot encode the original first two p32 runes, regardless of an unknown key or guessed plaintext for the remainder. Do not broaden it into arbitrary offset/phase adjustments merely to rescue this start. This result does not test 230 as a GP rune, a PRNG seed, an OutGuess password, an image coordinate, a non-F-transparent cipher, or a distinct authorial operation. Its premise was unverified and its exclusion is intentionally limited.
