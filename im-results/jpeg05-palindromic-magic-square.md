# LP1 scan 05: hidden binary-reversed 5×5 magic square

**Classification: reproducible original-artifact structure; solved LP1 clue, no LP2 decryption.** The community-original JPEG file `resources/liber-primus/05.jpg`, SHA-256 `2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7`, has an unusual exact byte layout whose center includes a 5×5 numerical square *absent in numerical form from the visible image* (most visible cells are rune words).

Its exact file layout is:

| Byte offsets (0-based inclusive) | Length | Content |
|---|---:|---|
| 0–336352 | 336,353 | Complete decodable 2400×3600 JPEG; first JPEG EOI `FF D9` starts at 336351 |
| 336353–336712 | 360 | `0A 0A` followed by **358 ASCII hex characters** |
| 336713–673065 | 336,353 | **Byte-for-byte reversal** of the first 336,353 bytes |

The center payload is decoded by taking its 358 ASCII hex characters in *reverse character order*, converting each pair of hex characters into a byte, then reading the result as ASCII. The result is 179 characters representing the complete 25 numerical cells of the LP1 magic square:

```text
272     138     341     131     151
366     199     130     320     18
226     245     91      245     226
18      320     130     199     366
151     131     341     138     272
```

Every row, every column, and both diagonals sum to **1033**. The JPEG's original visible page displays the same square, partly in rune words whose Gematria Prime sums fill these 25 numerical cells. This internal reversible representation independently records those values and provides a concrete example of byte reversal plus hex encoding embedded in a manuscript artifact. A cross-round identity and a source-selected BASE29 lead are now established below; neither has yet produced LP2 plaintext.

**Caution on JPEG end markers:** using the *last* occurrence of `FF D9` in the raw file produces a misleading 600,366-byte supposed JPEG with 72,700 trailing mirrored bytes. That later marker is inside the appended reversed JPEG's bytes. The first actual complete JPEG ends at **336353**, and the **360-byte middle** disappears from view if the last-marker heuristic is used. The previously reported final 72,700 bytes do indeed reverse the first 72,700 bytes, but the longer full binary envelope gives the correct accounting.

**Reproducer:** [`sims/jpeg05_palindromic_magic.cjs`](../sims/jpeg05_palindromic_magic.cjs), a dependency-free CommonJS checker. It asserts the original source SHA-256, JPEG boundary, reversed-image symmetry, center decoding, exact numerical square and all 12 magic sums. The same file was verified locally against the original owner-provided 75-JPEG ZIP. The source image has been verified byte-for-byte against the GitHub copy in `resources/liber-primus/README.md`.



## Cross-round identity: 2014 OpenPuff and 2013 BASE29

The recovered LP1 p5 matrix is **identical cell-for-cell** to the third 5×5 matrix in `resources/cicada2014-openpuff-magic-squares.txt`. The first 2014 5×5 matrix has magic constant **3301**; the repeated third matrix and LP1 p5 square have magic constant **1033**. Thus the LP1 constant is the decimal reversal of 3301. Both are prime, and 1033 is the 174th prime; 174 = 6×29.

The signed 2013 BASE29 example converts **3301 → 3QO** (see [the 2013 terminal/prime source gate](2013-telnet-missing-primes-terminal-180-76.md)). The resulting human-readable path is specific: notice the 1033 magic sum, reverse it to 3301, then apply the historical BASE29 operation to obtain the three-symbol value 3QO. This connection does not depend on the unsigned reconstructed NUMBER command. It is an exact cross-round structural link, not yet a decryption instruction.

A bounded first use of 3QO and its reversal OQ3 as GP29 Vigenère/additive/Beaufort keys was negative: on the full 12,956-rune unsolved stream, p53+p54-Ac, and the 180-cell p50 table interior, none improved the language score or recovered the known pp56+57 plaintext. The best table match was 9/180. The LP1 5×5 matrix and the two 2014 5×5 matrices, their products and inverses, were also tested against the p50 interior; the best exact match was 11/180 for the direct LP1 matrix, and no product decoded the known text. The matrices are not inverses: their determinants 10 and 3 are inverse residues mod29, but their products are not identity.

Reproducer: [cross-round matrix/BASE29 gate](../sims/agent47_2014_square_base29_bridge.cjs). The earlier direct Hill screens remain in [the consolidated matrix report](clue-matrix-hill.md).

## Original LP1 sacred sentences: a 28-prime-rank progression and the immediate prime after 1033

**New source-exact structural finding (Agent21, 15 November 2026): no cipher instruction, previously unknown LP2 plaintext, key, or destination is recovered.** The *same original source scan* as the hidden magic square also visibly prints three consecutive English sentences in GP29 runes. Summing their source-original GP prime weights and taking **one-based prime ordinal** produces:

| Exact source-rune transliteration | Printed semantic reading | Runes | GP-prime sum | Prime ordinal |
| --- | --- | ---: | ---: | ---: |
| `THEPRIMESARESACRED` | THE PRIMES ARE SACRED | 17 | **853** | **147** |
| `THETOTIENTFUNCTIANISSACRED` | THE TOTIENT FUNCTION IS SACRED | 24 | **1039** | **175** |
| `ALLTHNGSSHOULDBEENCRYPTED` | ALL THINGS SHOULD BE ENCRYPTED | 23 | **1237** | **203** |

The native rune `ᛡ` in FUNCTIAN has GP index27 / prime weight107, so this is the original spelling rather than an independently rewritten ASCII sentence; THNGS similarly uses the source's NG rune. All three numbers are prime, with consecutive **ordinal gaps 28 and 28**. Since the GP alphabet has 29 symbols, the rank stride is also `φ(29)=28`; in source order their rank residues modulo29 are `2,1,0`. This step and the modulus are exact source arithmetic, but no original instruction yet proves they constitute a cipher register.

The square's embedded original sum **1033 is the 174th prime**. The *same page's middle sentence* sums to **1039, the 175th prime**, the **immediate prime successor** of 1033. It also matches the Bach work number **BWV1039** alleged in a contemporary February 2014 participant's music transcription for the signed Cicada Onion5 score; its recovered original period note list names two flute parts plus harpsichord, consistent with the independently published BWV1039 instrumentation ([Bach Netherlands Society](https://www.bachvereniging.nl/en/bwv/bwv-1039), [IMSLP](https://imslp.org/wiki/Trio_Sonata_in_G_major%2C_BWV_1039_%28Bach%2C_Johann_Sebastian%29)). The *music number identification* remains participant-origin, as described in [the source audit](lp2-onion5-bach-musical-square-source-gate.md), and does not authenticate its relationship to LP1, despite the exact arithmetic. The first-release image was released after the January 2014 Onion5 score, so a historical solver might have used an earlier remembered Bach clue.

**Independent full-source clause comparison, without fitting unknown ciphertext:** split the exact pinned `resources/transcriptions/lp1_wulfic_canonical.txt` at its original full stops, retaining clauses of at least three GP runes. Among **87** such clauses, only **seven** consecutive three-clause windows have prime-valued GP sums for *all* three clauses. **Exactly one of those seven windows has prime ordinals in an arithmetic progression of any common difference:** this triple, with difference28. This is a source-level specificity observation, not a fully adjusted significance test across all possible textual partitions, numbers, later source artifacts or clue interpretations.

**One source-locked complete cipher consumer was tested:** extend the observed three prime ordinals with `K_i=prime(147+28i)` for every zero-based unknown-cipher rune position `i=0..12955`. The initial values are exactly `[853,1039,1237]`; the last required prime is 5,222,579. Apply the historically documented prime/totient GP29 additive inverse `P_i=(C_i±K_i) mod29`, or `P_i=(C_i±(K_i−1)) mod29`. As a register control, apply `primeOrdinal_i=147+28i` directly with both signs. On the **untouched 12,956 original LP2 rune symbols**, all six reversible modes yield full-book IoCs only **0.034459–0.034521** (raw original **0.034478**, solved native p57 **0.062710**); disjoint early/late original fragments likewise stay ciphertext-like. Every inverse perfectly re-encodes the original, and genuine p57 native GP runes can be planted and recovered under each exact key. **No contiguous unknown plaintext or instruction emerges**. This narrowly retires the complete-symbol constant-sign, no-skip, whole-book prime(147+28i) source clock, not the underlying 28-step clue or a differently instructed recipient/operation.

**Reproduction:** [standalone Node.js 22 CommonJS SFT](../sims/lp1_wisdom_three_sacred_prime_ranks_sft.cjs) reads the authoritative original LP1 runes, the exact 05.jpg JPEG (including its binary reversed-hex payload), all original LP2 cipher runes and solved p57 native positive. It checks source GP sums, prime ordinals, entire 87-clause census, complete 1033 square, source-generated 12,956-position inverse, and a true-text planted control. This finding strengthens a possible *intended route selector* but does not establish a cryptographic solution.

### Rank28 source clock under the genuine F exception: exact original p0 obstruction (Agent49, 15 November 2026)

The source-derived 2014 LP1 prime-rank arithmetic above gives a concrete candidate clock beginning at ordinal **147** and advancing by **28** per consumed key symbol: `prime(147+28k)`, `prime(147+28k)−1` (the prime's totient), or `147+28k` itself. The six direct whole-book signs/registers in the preceding study all had ciphertext-like outputs, but had not allowed the authenticated original p56 **plaintext-F exception**: a printed ciphertext F can represent literal plaintext F without advancing the key. The true original p56 has exactly one such exception, at its fourth ciphertext-F occurrence; its other runes use `P=C−(prime(k)−1) mod29`. Therefore there is one legitimate, source-derived way a whole-book fixed phase could *appear* wrong even after a correct inverse: a mixture of F bypass choices that alters the cumulative prime index.

The [exact single-file original-source SFT](../sims/lp1_28prime_staircase_lp2_fskip_dp_sft.cjs) enumerates **every possible** F bypass/shift path on the **first unsolved original physical p0** (262 runes, 14 ciphertext F). It uses dynamic programming on the number of key elements consumed; two paths with the same consumed-key count have identical future permitted moves. For every non-bypassed rune, `P=C±K(k) mod29` must be **non-F**, since plaintext F is the explicitly unshifted literal. Every printed C=F may instead bypass and keep `k` fixed. This is an *exhaustive* finite feasibility check across all `2^14` nominal bypass masks, including the ambiguity when C=F might also be an encrypted non-F. The first prime rank and step are fixed from the newly discovered source triad, the key clock starts at the first printed rune, and there are no freely chosen page IVs, offset searches, remappings or word resets.

| Source register, P=C±K | Earliest original p0 rune index (zero-based) where **all** F paths become impossible |
| --- | ---: |
| prime(147+28k), minus | **3** |
| prime(147+28k), plus | **172** |
| prime(147+28k)−1, minus | **2** |
| prime(147+28k)−1, plus | **55** |
| 147+28k, minus | **35** |
| 147+28k, plus | **39** |

All **six** source-fixed modes reject the authentic complete original p0 under every possible F mask: the problem is a **mandatory shifted output F from some non-F ciphertext**, which contradicts the actual solved-page bypass protocol regardless of how English is scored. Two independent positives protect against a false obstruction. First, the actual original p56 with its published fourth-F bypass decodes and re-encodes **85/85** runes, recovers the complete known text and remains a valid path in the same exhaustive dynamic program (consumes 84 key elements). Second, under all six proposed source-derived clocks, the intact native GP29 p57 solved text is encrypted with literal-F bypass and its true key-consumption path is retained by the exact same dynamic program.

**Decision:** this completes and more decisively closes the simple *zero-phase 28-prime-ordinal full-book* additive clocks under the only independently authenticated F exception, for every way of interpreting p0's 14 F ciphertext glyphs. This does **not** disprove the real arithmetic correspondence in the 2014 LP1 clauses; a different receiver, page initial offset, word clock, new author-selected cipher operation or different plaintext alphabet remains untested. No unknown plaintext, key or destination recovered. The result removes the specific temptation to rescue the prior whole-book no-skip failure with an unexamined F-branch beam search.

## Direct 179-byte LP1 to 179-rune LP2 p53 bridge

The JPEG's original reversed-hex middle decodes to **179 ASCII bytes**, including padding spaces and newlines. The separately sourced LP2 physical page 53 contains **179 GP runes**, and its 256-byte numerical table has repeated factor **179²**. This triplet was assembled retrospectively and the hidden ASCII text's length depends on arbitrary layout spacing; its intended use is unknown.

The [source-locked CommonJS test](../sims/jpeg05_hidden179_p53_direct_key_sft.cjs) reconstructs those exact original 179 bytes and tests a literal p53 positional additive key, with four mechanical byte→GP29 reductions, both original/reversed orders, and signs ±: **16 distinct inverses**. The largest original IoC is **0.03571653** versus **0.03351955** for untouched page53. A 179-rune native Shakespeare control has IoC **0.06214299**. Every original result is unreadable. All 16 source-native GP prose plants recover exactly. The [GitHub Actions run 42904848785](https://github.com/FlareZ123/liber-primus/actions/runs/42904848785) passed. The literal direct key bridge is therefore unsupported, leaving other source-defined uses unresolved.

**Implication for further cryptanalysis:** LP1's overt magic square includes a mirrored hexadecimal encoding in the JPEG file itself. If checking related LP1/LP2 image-derived keys or reversal conventions, this file is a grounded construction to generalize. Do not assume its 25-cell text is unknown plaintext or that repeating its operations on LP2 ciphertext will work without independent constraints.
