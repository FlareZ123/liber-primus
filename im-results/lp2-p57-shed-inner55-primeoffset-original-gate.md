# Solved p57 word interiors as 55 page-local prime-totient offsets

**13 November 2026; Agent50. Classification: source-anchored, bounded original-cipher negative.** No unknown LP2 plaintext, authentic key, complete cipher, or final destination was recovered. The new test addresses a previously untested *page-specific prime-start* choice for the independently solved p56 prime-totient family.

## Why this is a plausible human solve path

The original solved physical p57 **PARABLE** asks the reader to “shed our own circumferences” and “find the divinity within.” Taking the strict interiors of its complete printed words yields 55 rune indices. The 56 physical unknown pages p0–55 contain exactly 55 rune-bearing pages because p50 is a purely numeric table. Thus the original document itself offers 55 visible candidate per-page numbers. This goes beyond the previous literal pagewise Caesar use of the same key vector: p56 demonstrates subtracting consecutive prime totients, and per-page prime-start offsets remain distinct parameters of that cipher. No original inscription explicitly mandates the association, so the candidate is provisional.

The exact p57 printed-word lengths are `[7,4,2,6,7,2,2,7,2,4,4,3,3,14,4,2,8,5,3,6]`. All 95 GP rune indices agree with the canonical source transcription. Removing each word's first and last rune gives 55 strict interiors, in printed order:

`[24,4,24,17,20,10,5,9,15,16,24,1,9,9,18,20,1,4,0,24,5,1,15,8,18,1,7,10,4,5,1,19,0,18,4,18,9,5,18,10,9,10,1,10,9,10,16,10,2,10,9,19,18,4,6]`

All are *zero-based GP29 alphabet indices*, a natural, explicitly fixed interpretation; there is no selected secret phase. The vector checksum is 573. They are assigned to the 55 source-order, rune-bearing physical pages. p50 consumes no key and no prime state.

## Frozen full-original inverse

Let `c[p,j]` be original page-local rune `j` on the `p`-th rune-bearing unsolved page, `k[p]` the corresponding p57 interior index, and `q[n]` the `n`-th prime with `q[0]=2`. Test the two literal arithmetic orientations

`candidate[p,j] = (c[p,j] ± (q[k[p]+j] − 1)) mod 29`.

Because each prime is greater than 1, Euler's totient of a prime is exactly `q−1`. The original p56 uses subtraction, while the second orientation is a frozen sign control. Every page resets its consecutive prime cursor, with all original runes consuming one prime, including Fehu/GP0. This is the simplest completely reversible prime-offset model; a p56-specific nonconsuming literal-Fehu exception would require a separate page-local instruction to be a historical cipher.

Every candidate can be exactly re-enciphered using its original source key, and each variant independently recovers a 55-page synthetic native GP message planted from repeated segments of genuinely solved p57. That proves implementation consistency, but exact round-trip under a bijection is not independent key evidence.

## Results on untouched pp0–55

| Original-source register | Total GP runes | GP29 index of coincidence |
| --- | ---: | ---: |
| Printed unsolved ciphertext | 12,956 | 0.0344784 (rounded) |
| Subtract p57 interior-derived page prime-offset stream | 12,956 | **0.03447388179259219** |
| Add p57 interior-derived page prime-offset stream | 12,956 | **0.034473143015656474** |
| Actual solved p57 plaintext | 95 | **0.0627099664** |

Neither whole-book output is recognizably readable GP-native prose. Across both direct inverses, no decoded individual page reaches an original IoC of 0.04. The tiny movements from the nearly uniform original histogram leave the recovered text in the original noise-like distribution. These empirical metrics do not mathematically exclude short non-English text or a second encryption layer.

The original-input implementation uses canonical `resources/liber-primus/lp2-corpus.json` for all 58 physical pages, the original `resources/liber-primus/lp2-transcription.txt` for exact p57 word divisions, and no key fitting or external wordlists. No tuning across secret offsets, start primes, signs per page, or individual word ranges was conducted.

## Decision and boundary

Retire exactly **the two natural source-derived, direct GP29 prime-totient page-offset decoders** described above as methods for immediately recovering unknown LP2 plaintext. The result differs from the previous literal 55-page Caesar-key test and the large all-secret *stationary* prime-residue substitution screen: it consumes the same original p57 interiors as **variable prime sequence starts**, one page at a time. No new arbitrary key sweep is warranted without independent text or a manuscript-specified phase rule.

**Reproduction:** [standalone CommonJS SFT](../sims/lp2_p57_shed_inner55_primeoffset_sft.cjs), which asserts source rune identity, exact 55-symbol key vector, p50 skip, full ciphertext transforms, all page-level solved-p57 plaintext positive plants, and forward re-encryption. This report records an original-cipher test, not a proposed decryption or new recovered LP2 result.
