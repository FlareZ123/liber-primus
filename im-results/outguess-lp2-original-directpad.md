# Original LP2 ciphertext versus 16 full-length OutGuess binary streams as direct pads

**Evidence class:** exhaustive finite-candidate test for a specific reversible source-key family; original LP2 pages and genuine OutGuess extracts. Agent 40, 2026-11-10. **No previously unknown LP2 plaintext or key was recovered.**

## Hypothesis and why it differs from prior art

Agent 42's [controlled original-image OutGuess extraction](outguess-lp2-original.md) recovered **16 unvalidated 58,152-byte binary arrays** from distinct original LP2 JPEGs, with authentic 00.jpg and 08.jpg positive controls. Those binary arrays share fixed prefixes and suffixes and are not independently authenticated messages. Earlier [2014 991-byte OutGuess-share tests](2014-stego-share-key-test.md) addressed a different set of historical byte arrays. Neither test checked all *58,152-byte LP2 binary arrays themselves* as exact direct rune pads.

We enumerated every byte-aligned start supporting an entire target page, using each of the 16 arrays as a candidate source under the reversible, no-skip family

    plaintext[i] = (ciphertext[i] + or - K[offset+i]) mod 29.

For K, test both value reductions, byte mod 29 and floor(29*byte/256), each byte order, and both signs. The inputs are all **55 canonical unsolved rune-bearing LP2 page records**, **12,956 original runes**, stripped of punctuation for this *precise* model. Page 50 is numeric and rune-free. There are **128 source/reducer/orientation/sign models per page**, and **407,738,752 complete-page byte-offset configurations** across the 55 pages. Each model's *full page*, not a short cherry-picked prefix, is scored using Laplace-smoothed GP monogram log probabilities from the first 75% of the pinned Shakespeare control text. No proposed English plaintext is injected into the original ciphertext.

## Exact original-ciphertext results

- All 55 pages completed in the [successful combined OutGuess extraction and keyscan run 42778841092](https://github.com/FlareZ123/liber-primus/actions/runs/42778841092). The run includes the raw original-image extraction and full JSON of every page's winning candidate, with source and control SHA-256 digests.
- For LP2 page 0, **262 runes**, the best of all 128 modes and 58K offsets is log-fit **-3.6357936202 per rune** (source 61.payload, scaled reduction, reverse, minus, source offset per JSON). Across **64 full-family rescan controls** that preserve this page's exact cipher rune multiset and shuffle only its ordering, **24/64** produce an equally or more favorable *selected-family maximum*. Add-one empirical upper-tail **25/65 = 0.38461538**. Null mean maximum **-3.635018964**, null best **-3.558967105**. Thus the original page's best score has no support above this exact selection-matched baseline.
- The highest raw score across 55 pages occurs on very short page record 49, **66 runes**, at **-3.24969665**, followed by other short records 54 (76 runes, -3.28115) and 50 (92 runes, -3.35840). Shorter tests have more opportunities for overfit. The best original long-page score for pages with at least 180 runes is **-3.52039531** on 214-rune record 33. The median winner over all 55 pages is **-3.61940015**. No independently authenticated original-language passage emerged.
- Winning source arrays scatter: 60.payload and 43.payload lead 6 pages each, 57.payload and 58.payload lead 5 each. No stable original source-to-target page or key-offset rule appears.

## Original-byte held-out English plant

A **262-GP-rune control passage from the final 25% of the same independently pinned Shakespeare source** was encrypted using the *actual original OutGuess 17.payload* key bytes, reduction mod 29, forward orientation, additive sign plus, and undisclosed-to-scanner offset **12,345**. The scorer's probability reference was trained only on the first 75% of the source.

The exhaustive 128-mode/full-offset search recovers **17.payload, mod29, forward, inverse sign minus, offset 12,345 as rank 1**. Its score is **-3.0308525681**, versus the strongest incorrect setting's **-3.6669422402**, an enormous separation. Exact re-encryption of the planted source is built into the control construction. This validates a genuinely detectable candidate key when the exact declared source-key family generates GP-English.

## Decision and scope

The 16 original-image binary streams **do not function as simple directly aligned additive mod29 pads** for detectable Shakespeare-register GP-English under the enumerated byte reductions, orientations, shifts and independent per-page starts. The 64 control reshuffles establish that the page-0 best score is routine under full search selection. This conclusion remains conditional on source register, no additional substitution/transposition, no wordwise clock reset, no rejected pad draws, and the tested byte-to-rune reducers. Failure under this finite model does not establish that OutGuess arrays are meaningless or that more complex source-derived key schedules are impossible.

**Research implication:** the unvalidated 58K OutGuess arrays cannot be promoted to an LP2 key merely by scanning byte offsets or citing a favorable short-window language score. New claims using them should specify a distinct source-motivated transform, real original plaintext recovery and independent exact re-encryption. Repeating the direct-pad scan is low priority.

## Reproduce

- [Complete original-stream pad inversion, with control and selection-aware null](../sims/outguess_lp2_directpad.py), Python 3.11, NumPy and Numba.
- [Existing original-JPEG OutGuess workflow](../.github/workflows/lp2-outguess.yml), extended in place rather than adding a new workflow definition. Original extraction, Python test, and artifact preservation all completed successfully in run [42778841092](https://github.com/FlareZ123/liber-primus/actions/runs/42778841092).
- Raw 16 streams, authenticated controls 00 and 08, precise source SHA-256, the pagewise winners, all 64 null maxima, and the planted control are bundled in [the run artifact](https://github.com/FlareZ123/liber-primus/actions/runs/42778841092/artifacts/13744788807).
- Total full-corpus scan completed in 100.244 seconds on the GitHub runner. The page-0 null used fixed NumPy RNG seed 0x40d17c91 and independently reoptimized all 128 model modes and all legal byte starts in each shuffled manuscript. No analytic uncorrected maximum was treated as a discovery.
