# Original 2014 missing prime 19 as a transparent W: exact 2016-style cipher decision

**Agent 5, 15 November 2026. Source-driven finite cipher-family exclusion with authentic solved-page positive. No unknown LP2 plaintext or creator-selected new key recovered.**

The preserved May 2014 Stage11 PGP-clearsigned redirect has horizontal whitespace widths **2,3,5,7,11,13,17,23,29,31,37**. The missing prime is **19**, whose Gematria Primus symbol is **W**, index7. This exact source observation and its critical limitation were [already documented](cicada2014-signed19-onion7-title133-source-gate.md): trailing and blank-line whitespace is **not bound by the PGP signature**. We do not claim new authentication of this archival-byte channel.

The known LP2 p56 cipher advances the Euler-totient sequence **φ(2), φ(3), φ(5),… modulo29** when encrypting non-F plaintext runes. A literal plaintext F passes through as ciphertext F and **does not advance the prime clock**. The newly tested human-solvable possibility is that the absent source prime19 designates an alternative transparent rune, **W**, on unknown LP2 pages. Freeze all other parts of the authentic p56 operation, including phase zero starting at prime2. The missing 19 is the only candidate symbol; nothing is tuned to the unknown ciphertext.

## Complete original-input contradiction

For each original ciphertext rune C and current prime clock index k, the exact all-secret inverse branches as follows. If **C=W**, a literal plaintext W could be transparent and leave k unchanged. For *any* C, the key could be consumed and reveal plaintext P = (C − φ(prime[k])) mod29, but **P cannot equal W** because W would have been transmitted literally. Keep **all** possible history states; discard a branch only when it contradicts this necessary condition.

Original physical p0 begins GP ciphertext **S H E O G M**, with no W among its first six characters. All six must therefore consume the key, exactly in the order of primes 2,3,5,7,11,13. The sixth original ciphertext is **M**, GP index19; φ(13)=12, so the inverse plaintext is **19−12=7**, GP **W**. A transparent plaintext W would necessarily emit ciphertext W; the actual ciphertext is M. Thus **no legal hidden skip history exists by p0 rune offset5**, a complete algebraic contradiction before any language model, word segmentation or guessed key.

The original page-local source tests with the same prime2 reset give:

| Physical LP2 page | GP ciphertext runes | First impossible offset with transparent W | First impossible offset with transparent F |
| --- | ---: | ---: | ---: |
| p0 | 262 | **5** | 235 |
| p19, source-suggested by the missing 19 | 271 | **47** | 36 |
| p55 | 76 | **71** | 39 |
| p56, genuinely solved | 85 | **5** | **none** |

All offsets are zero-based within each physical page. Failure on p0 independently excludes this exact chapter- or page-reset source-key cipher for a full-book LP2 decoder. The p19 and p55 checks are useful bounded confirmations, not additional assumptions about chapter clocks.

## Authentic cipher-positive and matched planted-positive

The [complete CommonJS source reproducer](../sims/lp2_2014_missing19_Wtransparent_primephi_sft.cjs) derives the actual solved English p56 plaintext from the checked-in original reference, excluding the two intervening hexadecimal hash lines. With **the genuine F-transparent key schedule**, it forward encrypts and **exactly matches all 85/85 original p56 ciphertext runes**, consuming exactly 84 successive prime-totient shifts. The exhaustive inverse correctly retains that historical key-clock state.

The same program independently plants **262 original-shaped runes of genuine GP English**, applies the proposed *W*-transparent cipher, and confirms that the all-history decoder includes its true consumed-key count. Both source-original and planted positives **passed [Windows Node.js 22 run 43726026548](https://github.com/FlareZ123/liber-primus/actions/runs/43726026548)**. All source-input assertions and no-editing constraints passed. This positive prevents a failure arising from a broken prime generator or an implementation that disallows legitimate transparent skips.

## Distinct direct interpretation: omit prime19 from the original prime clock

A simpler interpretation of the same already-known archival prime gap changes **the key schedule itself** instead of designating a new transparent plaintext rune. Retain the genuinely solved **F-transparent** rule and all other p56 operations, but delete exactly prime19 from the consecutive-prime totient stream, so shifts run **φ(2),φ(3),φ(5),φ(7),φ(11),φ(13),φ(17),φ(23),…**. The source selects the missing prime; no arbitrary phase, rotation, or language fitting is introduced.

The same exhaustive all-skip-state inverse, independently initialized at prime2 per page, fails at original **p0 offset235, p19 offset82 and p55 offset39**. As a separate historical negative control, it fails on actually solved **p56 offset19**, whereas the genuine unmodified p56 clock recovers all 85 original runes exactly. A source-native 262-rune plant genuinely encrypted with *this modified clock* survives the inverse and preserves its true key-consumption count. This distinguishes a real original-source contradiction from an incorrectly coded deletion.

Both source-locked readings of prime19 have now been tested, with no plaintext from original unsolved pages. The expanded SFT passed [Windows Node22 run 43726354635](https://github.com/FlareZ123/liber-primus/actions/runs/43726354635).

## Decision and limits

The source-selected **missing prime19 → W** cannot rescue a direct transfer of p56's prime/totient cipher to unchanged unknown p0. The contradiction occurs at the sixth rune and survives every possible later skip choice. An independently chosen starting prime, changed key schedule, different punctuation clock, or prior cipher layer is another mechanism that the historical source does not currently select. No unknown plaintext, authenti­c key material, or final destination was obtained. Do not multiply variants of the unauthenticated whitespace interpretation. These two original-cipher gates complement, rather than rerun, the earlier literal-prime Vigenère and p19 RIFT tests in the [historical source report](cicada2014-signed19-onion7-title133-source-gate.md).

**Reproduction:** Run the linked CommonJS file under Node.js 22 from the repository root. It reads the original May2014 signed redirect, the canonical original GP index corpus, and the known LP1/LP2 plaintext reference. It creates no files.
