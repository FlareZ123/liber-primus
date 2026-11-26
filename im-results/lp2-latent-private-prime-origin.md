# Latent private prime-origin word inverse

**Decision (26 November 2026): retire this fixed 3301-prime, per-word additive receiver on physical p40–p53 under both ordinary and literal-F-hold conventions.** This is a scoped negative, not a decryption.

## Hypothesis and human-visible motivation

The solved p56 page establishes a prime-minus-one stream with literal plaintext F held without advancing the key cursor. A separate historical Stage04 Vigenère reconstruction copies symbols absent from its GP lookup without advancing `keyIndex` (`sims/stage04_small_image_vigenere_repro.cjs:81–96`); that is a precedent for transparent non-rune symbols, not proof that LP2 uses the same rule.

The tested exploratory receiver gives every latent plaintext word an independent prime origin among the first 3,301 primes, either traversal direction without wrapping, either sign of the prime-minus-one value, either plaintext sign, and an independent additive offset. Printed group boundaries are ignored. The 3,301-origin bound and word-private origins are not authenticated source instructions.

## Exact inverse and decision statistic

Adjacent differences between active (key-consuming) positions cancel the private additive offset. The receiver indexes six-difference prefixes over 13,192 eligible prime routes, joins every longer lexical interval and both plaintext signs, reconstructs the offset, and forward-replays every accepted word/parameter witness. It then uses earliest-ending interval scheduling to compute the exact maximum number of disjoint anchors at each active-rune threshold. The fixed donor vocabulary, word-length cap, prime domain, and sign/direction choices are unchanged between the ordinary and literal-F runs.

For the literal-F branch, plaintext GP index 0 is held and must emit ciphertext 0. Every non-F plaintext position consumes the next prime shift **even when its observed ciphertext is also 0**. Thus ciphertext zero is not treated as an automatic hold: both the literal-F and consuming-non-F explanations remain available in the inverse.

## Calibration

Two held-out 716-rune native-text controls (Gibran ordinary and Shakespeare literal-F) retain every dictionary-covered true anchor at thresholds 7–11. The exact word and all private parameters are recovered for 5/5 and 7/7 eligible words with at least nine active runes, respectively. A fresh boundary-independent 716-rune literal-F plant recovers all 4/4 eligible nine-active-rune word/origin witnesses exactly. These establish receiver coverage, not unique plaintext recovery.

## Original p40–p53

The physical p40–p53 tape contains 3,008 runes. No printed segmentation is used.

**Ordinary consuming clock:** the exhaustive search covers 57,972,891 word/interval pairs, with 700 compatible parameter witnesses and 568 distinct intervals. Exact maximum disjoint-anchor counts for thresholds 7,8,9,10,11 are 260,22,1,0,0. The corresponding minimum counts across matched native donor windows are 50,20,6,0,0. At threshold 9, original maximum 1 is below native minimum 6. The sole nine-active-rune interval is `DIRECTIUE` at chapter-relative [2641,2650), with reverse traversal from origin 1518, prime sign −1, plaintext sign −1 and offset 25. It is an isolated unauthenticated lexical witness, not a plaintext continuation.

**Literal-F hold:** the exact original disjoint-anchor counts at thresholds 7,8,9,10,11 are **248,19,1,0,0**. At threshold 9, the original maximum is **1**, while the minimum matched native-window count is **5**: a strict gap of **4**. The existing Shakespeare hold control recovers 7/7 eligible long words, and the fresh boundary-independent plant recovers 4/4, so the original deficit is not explained by a broken hold implementation or failed positive controls.

The strict bound therefore fails in both clock conventions. Under the issue's completion rule, no dependent complete segmentation/path search on p54–p55 is warranted. The bounded family is retired for this p40–p53 native-register test.

## Scope and reproduction

The exclusion is limited to the fixed first-3,301-prime domain, both directions and prime signs, both plaintext signs, independent per-word additive offsets, the existing donor vocabulary and word-length cap, and the length-preserving latent-word anchor model. It does not exclude a different prime stream, source-selected origin/clock, variable-length or non-word framing, another language/register, or a different cipher architecture.

- Ordinary receiver: `sims/lp2_latent_private_prime_origin_sft.cjs`
- Literal-F original gate and assertions: `sims/lp2_latent_private_prime_origin_p40_hold_gate.cjs`
- Ordinary original output: `im-results/lp2-latent-private-prime-origin-p40-ordinary.json`
- Held Shakespeare control: `im-results/lp2-latent-private-prime-origin-1-hold.json`
- Machine-readable hold summary: `im-results/lp2-latent-private-prime-origin-p40-hold-summary.json`
- Node 22 Actions run: [45897301223](https://github.com/FlareZ123/liber-primus/actions/runs/45897301223), successful; commit `349d63b0c14f154905e48875a3f289ad00bc05c5`.

No unknown LP2 plaintext, authentic key, or destination was recovered.
