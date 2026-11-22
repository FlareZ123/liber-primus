# Terminal p55|p56|p57 = 256: original table residues against the authentic p56 key

**Agent4, 22 November 2026. Classification: exploratory source-typed key-concordance anomaly with a direct-original-plaintext negative, not an authenticated key or original-cipher solution.** All 56 unresolved LP2 pages remain unsolved. The independent p56 known-plaintext test distinguishes one specified 76|85|95 table alignment from an unrestricted 1,024-reading offset search; the strongest fixed-alignment concordance does **not** transfer into a full p55 decoder.

## Source-visible starting decision

The original terminal physical LP2 pages contain exactly **76 GP29 runes on unsolved p55**, **85 GP29 ciphertext runes on independently decrypted p56**, and **95 unencrypted GP29 runes on p57**. Together this is **256** consecutive runes. An independently printed source object, the 32×8 two-character numeral table on physical pp49–51, has exactly **256** cells. These identities admit one economical test, without looking at an unknown-page plaintext: align p55 with table addresses 0–75, p56 with 76–160 and p57 with 161–255. Page reading and row-major table reading use the original physical order. This **alignment is an analyst hypothesis**; there is no original instruction pairing each table cell with each terminal rune.

Use the two historically contemplated numeric readings of the same 256 original printed tokens: conventional radix60 with alphabet \`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx\`, and radix59 obtained by deleting lowercase \`f\`, the only conventional radix60 digit absent from the full original table. For each token \`xy\`, take \`B * digit(x) + digit(y)\`, then reduce modulo29. The source does **not** authoritatively select base59, or command subtracting numeric table residues from a cipher key.

The completed original p56 decryption supplies an independently known **85-rune authentic prime-totient encryption**. Under source GP29 spelling its cleartext is:

> AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE

For every plaintext rune other than F, the authentic ciphertext is \`C[i]=(P[i]+prime[k]−1) mod29\` with prime clock \`k\` advancing; literal F (GP index0) is printed transparently and does **not** consume a prime. The one transparent F is p56 local offset56. Applying this exact rule re-encrypts all **85/85 original p56 ciphertext runes**, consuming exactly **84 primes**. Thus the key vector and its F-hole are known without fitting the table.

## Original key-residue concordance

Freeze table receiver offset **76** from physical p55's rune count. At every one of the 84 p56 prime-consuming positions, ask whether \`table[76+i] mod29\` equals the authentic positive or negative prime shift \`±(prime[k]−1) mod29\`. No unknown ciphertext is used to choose the sign; **both** signs and **both** source-plausible radices are charged.

| Numeric reading and sign | Exact matches to 84 authentic p56 prime-key slots |
| --- | ---: |
| Conventional base60, plus prime shift | **3/84** |
| Conventional base60, minus prime shift | **5/84** |
| Source-missing-\`f\` base59, plus prime shift | **6/84** |
| Source-missing-\`f\` base59, minus prime shift | **11/84** |

The base59-minus exact p56 *local rune offsets*, zero-based, are **3, 16, 20, 29, 33, 41, 60, 63, 64, 71, 76**. Their table indices are **79, 92, 96, 105, 109, 117, 136, 139, 140, 147, 152**, with source tokens \`1M 3u 3g 13 34 2p 0A 0D 45 2r 3p\`. All remain legible without interpolating a table value.

The fixed-offset result is unusual under a specifically *preselected* 76|85|95 alignment. A 100,000-trial exact-token-multiset permutation of original table cells, preserving all 256 literal values and both radix readings, produced **18/100,000** permutations with at least11 matches in the specified base59-minus mode; a four-mode family maximum produced **62/100,000**. Plus-one Monte Carlo upper tails are approximately **0.000190** and **0.000630**, respectively. These are conditional controls of this exact source alignment, not calibrated probabilities that Cicada intended the relationship.

The critical rival is free receiver selection. Across **all 256 circular source offsets × two radices × two signs =1,024** complete original-key comparisons, the actual **offset76/base59/minus** is indeed the **unique highest score at11**; the next best has10. But the same exhaustive 1,024-model maximum on **1,800 shuffled-table controls** reaches11 or more in **266/1,800** trials, plus-one upper tail **0.14825**. Thus the anomaly is informative **only if** the terminal page lengths really do specify the offset, before examining key matches. Other candidate page cuts, table transforms, alternate serializations, sparse key phases and freely selected matched subsets have **not** been charged. Do not promote the small conditional p as an overall historical authorship probability.

## Direct whole-page original cipher decisions

The natural plaintext-producing consumer \`P55[i]=C55[i] ± (table[i] mod29)\`, with **no hidden fitting**, was evaluated under both numeric bases and both signs. All four 76-rune inverse attempts forward-reencrypt every source rune, and a source-native 95-rune p57 planted-key control exactly recovers its plaintext. Their normalized GP29 index of coincidence is **0.97684–1.06842**; genuinely clear original p57's is **1.81859**. None of the four source-original 76-rune outputs provides a coherent English/Gematria Primus passage. On the separately known clear p57 tail, \`table[161+i] mod29 == P57[i]\` occurs only **4/95** under base60 and **2/95** under base59. Therefore no one-position-one-rune direct terminal-table channel is validated by the two known-text controls.

Most importantly, the promising p56 base59-minus key relation is **wrong at 73 of its 84 independently known positions**. The 11 local coincidences cannot be treated as a recovered complete key, even under the correctly aligned 256-rune source hypothesis. An independent authentic instruction must identify a **sparse selection, correcting mask, different algebraic operation, or other exact consuming rule** before the table can be used to decrypt p55. Arbitrary selection of just the matching positions after seeing the p56 plaintext has no cryptanalytic force.

## Reproduction and decision

The read-only Windows Node22 CommonJS SFT [\`sims/lp2_terminal_256_p56_primekey_original_sft.cjs\`](../sims/lp2_terminal_256_p56_primekey_original_sft.cjs) reads only existing original corpus and table JSON, reconstructs source p56 with the exact transparent F, asserts **85/85** authentic reencryption, verifies all 11 match indices, scans all 1,024 competing offsets, recovers the original p55 ciphertext under four reversible direct pads, and runs two declared fixed-multiset permutation nulls. [Manual Windows workflow](../.github/workflows/agent4-terminal-256-p56-key-original.yml). The original files are unchanged.

**Research disposition:** Retain the **source-typed 76|85|95 page-to-table alignment and 11-position known-key concordance as a conditional intermediate lead**, suitable for a genuinely new visual or first-party key-selection rule. Retire its four exact direct additive p55 decoders, and do not tune table offsets or match subsets based on already-known p56 plaintext. Nothing here recovers unknown p55 text, an LP2 cipher inverse, a reusable source key, or the final destination.
