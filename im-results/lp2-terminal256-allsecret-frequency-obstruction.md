# Terminal 256: unconditional multiset obstruction to any stationary GP29 substitution and arbitrary position permutation

**Agent 35, 17 November 2026.** An exact original-source necessary-condition test excludes an entire secret-key family, preserving every 256! possible position permutation and 29! possible fixed GP29 symbol bijection. The physical-terminal association is hypothetical and is *not* an authenticated Cicada cipher instruction. **No new original unknown-page plaintext, valid p55 key or final destination is recovered.**

## Independent source facts and candidate relation

The physical LP2 table printed across pp49–51 contains 256 cells in 32 rows and eight columns. The last three rune-bearing pages have **76 p55 original encrypted + 85 p56 printed encrypted + 95 p57 already-clear GP29 runes = 256**. The table can inspire a human to re-read 256 terminal symbols in a different order; the conjectural link to the 256-cell grid and the printed last-three-page join are already documented in the earlier [terminal grid interior study](p50-32x8-interior-known-plaintext-compatibility.md).

A broad direct architecture is: concatenate the **original unchanged printed ciphertext** of p55 and p56, followed by original p57; apply any permutation of these 256 positions and any single alphabet-permutation key of all 29 runes to recover a message. The 180 known p56+p57 plaintext runes must then occur somewhere among the output, in any possible order, while all 76 unknown p55 outputs remain unconstrained. This *already grants more freedom than the original 32×8 table specifies*, and includes every table-selected 256-place order, inverse order and static Caesar/Atbash/affine or completely arbitrary GP29 relabelling.

## The exact key-independent exclusion

The source is [original GP29 LP2 corpus](../resources/liber-primus/lp2-corpus.json). Reproduce authentic solved p56: subtract the successive-prime totient key from all p56 ciphertext except the independently established **one plaintext F at local rune offset56**, which is printed as F and consumes no key. Exactly 84 prime-clock advances recover the 85 GP29 runes of the established AN END plaintext, beginning ANENDWITHIN. The p57 95 runes are already clear. Concatenate the resulting p56+p57 text as the **180-symbol withheld target**. Crucially, that known target is computed independently of the unknown p55 words.

An arbitrary position permutation preserves the multiset of printed source rune identities. An arbitrary **bijective** 29-rune alphabet substitution can only rename the 29 histogram bins. It consequently preserves the **largest rune multiplicity**, regardless of the two secret permutations. The original 256 source positions have **at most 22 occurrences of any rune**. The independently known 180-rune target alone contains **31 GP E runes**. Thus **31 > 22** contradicts a necessary output histogram condition under *every possible secret* position and alphabet permutation; no unused 76 symbols can lower the frequency of E.

Without even relabelling the rune alphabet, the original printed source has additional concrete deficits:

| GP rune in known plaintext | Original source count (all 256) | Required count (known 180 only) | Minimum symbols that must change identity |
| --- | ---: | ---: | ---: |
| I | 15 | 17 | 2 |
| T | 6 | 12 | 6 |
| E | 22 | 31 | 9 |
| A | 8 | 11 | 3 |
| **Combined** | | | **20** |

So an **unmodified-symbol whole-grid transposition** would require at least **20 rune identity changes** before fitting the actual known terminal plaintext. Allowing a completely secret alphabet permutation cannot overcome the stronger 31-versus-22 largest-frequency bound.

The original-source test checks every count, the exact p56 prime-clock state, the p55/p56/p57 sizes, and the source-only first ten cleartext runes. A positive planted test applies a full 256-position invertible affine permutation (index -> 17index+13 modulo256) and a full GP29 alphabet permutation (rune -> 7rune+3 modulo29) to a genuine 256-symbol target containing the actual 180 known terminal GP29 runes. It recovers **256/256 planted symbols** under the inverse and preserves the largest-frequency bound, demonstrating that the exclusion is a necessary property of real bijective encoders rather than a heuristic English score.

## Scope and decision

**Retire the entire literal printed-terminal-256 ciphertext → one arbitrary position permutation → one stationary GP29 rune permutation family** as a recovery route for the independently solved p56+p57 text, irrespective of all secret keys, p55 plaintext choices and output ordering. If a proposed source-table permutation or cipher claims this literal end-to-end model, the known 180 runes already falsify it without fitting p55.

**Do not extend this to all table routes.** An alternate model could first decipher p56 through its genuine *position-dependent* prime-totient operation, mix in bytes or additional external key material, permit a stateful/homophonic/length-changing operation, or avoid aligning the last three pages with the table entirely. Under predecoded p56, the tested input histogram is a different object, and the above impossibility does not apply. The manuscript itself has no authenticated 256-terminal transport instruction. A new original-source selector and complete independently checked unknown plaintext passage would be required before pursuing a different mechanism.

**Reproduction:** [single-file Node.js22 CommonJS original-source test](../sims/lp2_terminal256_allsecret_substitution_permutation_sft.cjs); execute from the repository under Windows 11. No external packages, key guesses, language scores or file mutations are involved. The histogram and exact-p56 calculations were also executed directly against the remotely retrieved original corpus; the program has a syntax-checked local copy and a hidden-permutation positive.
