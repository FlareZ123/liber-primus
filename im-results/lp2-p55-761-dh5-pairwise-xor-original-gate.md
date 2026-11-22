# Terminal p55: source-anchored 2013 DH5 orbit XOR on 38 BASE29 pairs

**Agent 17, 16 November 2026. Evidence class: exact original-cipher input and six complete, fixed reversible-candidate obstructions.** No unknown plaintext, author-selected key, LP2 cipher architecture, or final destination recovered.

## Human-source premise and explicit alternative

An actual 2013 Cicada source teaches **BASE29**, a worked Diffie–Hellman example with generator **5**, and a source-file **byte XOR** operation. The distinct, source-preserved 2013 `761.MP3` title “THE INSTAR EMERGENCE” has exact GP-prime sum **761**. Thus a reader could consider using `p=761` and `g=5` with XOR. The group element 5 has multiplicative order **38** modulo761. LP2's penultimate unsolved physical page p55 contains **exactly 76 original runes**, enough for 38 pairs of two base29 digits. Moreover the original solved pp56 and57 headings `AN END` and `PARABLE` have GP-prime sums **311** and **449**, supplying two source-derived fixed exponents as alternatives to the neutral exponent zero.

The weakest premise is clear: no actual first-party LP2 instruction connects these *separately genuine* historic facts into a two-rune DH/XOR cipher, and the first p55 rune completes a word begun on p54. The experiment evaluates an inexpensive explicit plausible reading **without fitting any key**, rather than presuming this composition intended.

The source-exact candidate reads each consecutive pair `(a,b)` of original p55 indices in one of the two standard BASE29 orders:

- high digit first: `V=29a+b`, where `0≤V≤840`;
- low digit first: `V=29b+a`, same legal interval.

For each of the 38 pairs `i=0…37`, compute `K_i=5^(e+i) mod761` and the invertible integer XOR `P_i=V_i XOR K_i` (bitwise 10-bit; no modulo reduction). Freeze `e ∈ {0, 311, 449}`. To represent a full 76-rune GP29 inverse in this framing, **every resulting P must lie within 0–840**. Values 841–1023 have no two-digit GP29 representation; quietly reducing them modulo841 changes the ciphertext operation, destroys its stated XOR inverse and requires an independently selected protocol.

## Complete original-input result

| BASE29 digit order | Source-fixed exponent | Exact out-of-range pairs, zero-based | Legal 76-rune output? |
| --- | ---: | --- | --- |
| High-first | 0 | 8, 13, 14, 17, 20, 27 | **No, 6 invalid** |
| High-first | 311 | 0, 7, 9, 13, 18, 19, 20, 23, 37 | **No, 9 invalid** |
| High-first | 449 | 12, 14, 17, 20, 26, 28, 35 | **No, 7 invalid** |
| Low-first | 0 | 4, 30, 31, 32, 33, 37 | **No, 6 invalid** |
| Low-first | 311 | 8, 13, 17, 24, 27, 30 | **No, 6 invalid** |
| Low-first | 449 | 0, 11, 16, 24, 28, 34, 37 | **No, 7 invalid** |

Each source-fixed variant fails **before** language scoring. The 2013-base5 orbit is exactly38 and consists of 38 distinct elements. An original input of 76 runes yields 38 paired integers; all six reverse operations encounter at least six values that cannot be mapped back into any pair of GP29 runes. The negative follows directly from the original ciphertext, independently of unknown word meanings or key scoring.

A round-trip positive test uses the first76 genuine clear p57 runes as candidate plain digits where the proposed XOR would produce legal two-rune ciphertext. For any p57 pair that does not fit the 0–840 output range, the test replaces it with the **known key element itself**, guaranteeing an exact legal ciphertext pair zero. This explicitly acknowledges that unmodified XOR on the 841-value digit-pair domain is **not closed**: for a nonzero 10-bit key some legal plaintext values map to 841–1023. All six positive plants then decrypt their complete 38 legal encrypted pairs exactly. Such a conditioned plant is a code-function test, not evidence of actual historical encryption.

## Decision and provenance

**Retire the direct two-rune, base5/761 group-XOR model in both natural digit orders at e=0,311,449.** The actual original p55 ciphertext cannot be fully decoded under any of those six combinations. An arbitrary rejection/escape layer or position-dependent recoding could avoid the range constraint, but requires a new author-selected instruction and is not part of this test. The independent p55/DH5 additive and integer-base-conversion investigations are separately documented in `im-results/audio761-original-id3-frame-inventory.md` and `im-results/lp2-p55-dh5-whole-base29-radix-gate.md`; this experiment specifically tests the historically used **XOR** on source-shape-matched BASE29 pairs, which those reports do not.

**Reproduce:** `sims/lp2_p55_761_dh5_pairxor_sft.cjs` reads only the canonical original GP29 corpus, asserts the p55 length, multiplicative orbit and all six exact invalid-pair counts, and tests complete 38-pair legal positive round-trips. It writes no output files and requires no external downloads. The historical basis and original source title are pinned in `im-results/audio761-original-id3-frame-inventory.md`.
