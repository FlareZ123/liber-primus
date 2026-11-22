# LP2 p49–51 numerical table: independent quotient-by-29 side-channel inverse

**Agent49, 18 November 2026. Original-cipher-adjacent, bounded negative.** The source-original 256-byte table has a second, exactly reversible numeric register after the already-established GF(29) residue readout: 256 digits in base 9, the integer quotients by 29. I tested 50 source-bounded direct binary and bitmap receivers, applied the 256 quotient digits directly as a repeated additive GP29 key in 12 original-book decoding modes, and used them as a co-located pad on the separately factor-derived 252-rune GF29 quotient. **No binary receiver yields a recognizable file or predominantly printable substantial decompression, and none of the direct GP29 consumers yields a native-language coincidence profile.** Exact gzip and genuine solved-p57 plaintext plants pass their inverse checks. No unknown LP2 plaintext, original cipher key, hidden service, authored extraction instruction, or additional transmitted file was recovered.

## Why this register merits a direct test

The physical LP2 p49–51 images, \`66.jpg\`–\`68.jpg\`, print exactly 32×8 two-glyph numerals. Conditional conventional base60 decoding gives the project-pinned **256 original bytes**, SHA-256 \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`. Previous work established that their residues modulo29 form a polynomial divisible by independently motivated quadratic factors from the authentic 2013 BASE29 example and the p39 red triad. That earlier factorization concerns only **the byte remainder modulo29**; it does not constrain every byte's quotient.

Every byte \`b\` has the unique representation \`b = 29q + r\` with \`0≤r<29\`, \`0≤q≤8\`; for \`q=8\`, \`r≤23\`. This makes \`q\` an available, disjoint **base9 register** of up to 256 digits without consuming or modifying the previously studied GF29 codeword. In particular, \`9^256\` possible digit arrays provide an approximately 102-byte packet-sized address space. A human solver who has independently discovered the \`mod29\` structure could naturally inspect the integer quotients as remaining information. The book, however, does **not instruct this division or any binary packing**; this is a testable proposed data route, not an established intended layer.

The original quotient digit histogram for \`q=0..8\` is:

\`[22,33,38,22,29,32,34,21,25]\`.

## Source-frozen original trial

The [one-file Python standard-library SFT](../sims/lp2_p50_quotient9_sidechannel_sft.py) reads the existing untouched table, checks its exact original-byte SHA-256, and constructs its two unique quotient/remainder registers. It tests these 50 explicitly finite readouts:

1. **40 ordered base9 binary registers:** row or column major, direct or alternating serpentine, full reversal or not. In each of the eight unique physical traversals, convert the complete 256 digits to a fixed-width 102-byte integer in either endianness, or partition into consecutive 2-, 4-, or 8-digit blocks and convert those blocks without fitted byte shifts (128, 128, or 128 output bytes, respectively).
2. **10 eight-bit row bitplanes:** for each of the 32 original eight-cell rows, emit one byte from quotient bits 0, 1, 2, 3, or the threshold \`q≥4\`, read MSB-first or LSB-first.

For every output, report the initial raw bytes, printable fraction, and matches to source-era common magic headers (GZIP, ZIP, PDF, PNG, xz, bzip2, ELF, OpenPGP armor). Feed the exact complete bytes at offset0 to standard GZIP, ZLIB, raw-DEFLATE, bzip2, and xz decoders, with a 1MiB output bound. Flag a candidate only when at least 64 decompressed bytes contain at least 85% printable ASCII/whitespace. No arbitrary byte offset, XOR, shift, dictionary, invented password, later cipher layer, or language model selection is permitted.

| Measured source property | Outcome |
| --- | --- |
| Exact original table | **256/256** bytes, asserted SHA256 |
| 256 source quotient digits | Base9 histogram above |
| Direct printed-row major base9 integer | **102 bytes**, prefix \`09df179a3159d6a1aac6140c89736e8b\` |
| Complete readout modes | **50** |
| Recognizable original file signatures at offset0 | **0/50** |
| Readouts yielding ≥64 largely printable decompressed bytes | **0/50** |
| Largest raw printable fraction across readouts | **0.6953125**, from grouped base9 pairs; this is expected because each pair falls in the restricted byte range 0–80 and contains control symbols, not prose |

The inverse is **powered for a real encoded message**: take repeated English prose, encode it as GZIP, convert its exact bytes to a base9 integer in 256 digits, and store digit \`q\` in byte \`29q\`. The same untouched extraction routine recovers every compressed byte and GZIP yields the exact planted original passage. This is an independently specified synthetic positive and makes no claim that the historical author used this method.

## Original unsolved ciphertext: quotient digits as direct repeated GP29 key

The second natural possible role for the same **256 quotient digits** is a repeated key on the 12,956 real unknown GP29 runes. A source byte stream has 256 slots; a GP29 index accepts each quotient 0–8 without conversion or fitted shift. The SFT independently loads the unchanged entire original rune corpus, preserving all 55 rune-bearing physical pages, and tests the two source-visible grid traversals (printed row-major, vertical column-major), both additive signs, and precisely three source-visible clock resets: continuously over the original whole book, at each of the nine illustrated chapter starts, or at each physical page start. Every original rune consumes one key slot; source p50 is runeless.

| 12 complete original-basis inversions | Measured GP29 IoC |
| --- | ---: |
| Unmodified 12,956-rune original ciphertext | **0.03447839786450569** |
| Best quotient-key inverse: column-major, chapter reset, sign+ | **0.03454572189171222** |
| Other 11 exact source-fixed direct inverses | **0.03446748303106831–0.03451737430574331** |
| Independently clear p57 native-GP control (95 runes) | **0.06270996640537514** |

The direct quotient key yields a nearly uniform GP rune distribution in **all 12 complete-book decodings**, without a recognizable original-language passage. An exact forward/reverse test first encrypts all **95 authentic solved-p57 clear GP runes** under each of the 12 declared quotient keys and then recovers all 95 without mismatch, proving direct inverse correctness for those keys. This plant does not identify which, if any, was used historically.

## Same-cell outer quotient as a pad on the H·G field quotient

This tests a stronger **two-layer reading of the same printed table**. Let \`R_i = B_i mod29\`, \`q_i = floor(B_i/29)\`, and divide the complete original 256-coefficient polynomial \`R(X)\` by the previously independently established p39/2013 \`H(X)G(X)\` with descending coefficients \`[12,17,11,21,23]\`. The division is exact, zero remainder, and produces the known **252** GF29 digits \`Q_i\`, starting \`[0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21]\`.

An appealing, fully executable composite is to use the **upper part of each very same source byte** as the additive key for the corresponding long-division output: \`P_i=(Q_i±q_i) mod29\`. This requires one normal polynomial division and one co-located subtraction. Alignment \`q_(i+4)\` is a fixed source-degree-four sensitivity, included once without searching arbitrary offsets. The sign choices are fully reversible, so these are four original, source-frozen native-GP candidates.

| Fixed readout of the original 252 symbols | GP29 IoC |
| --- | ---: |
| Factor quotient \`Q\` before outer key | **0.036330867008157845** |
| Same-cell upper quotient add (\`Q+q_i\`) | **0.034117498260924556** |
| Same-cell upper quotient subtract (\`Q−q_i\`) | **0.03323215076203124** |
| Four-position shifted upper quotient add | **0.03648896477581737** |
| Four-position shifted upper quotient subtract | **0.034813128438626446** |

All four original outputs remain far below the independent native-GP long-text collision range; their exact runic prefixes are printed by the SFT. Thus the simplest proposed two-register deconvolution yields **no recoverable 252-rune text**.

The end-to-end positive plant is stronger than a mere arithmetic reversal: construct a 252-rune genuine clear-p57 GP sequence, add a nonzero changing eight-symbol upper key, convolve the encrypted result with the *actual original H·G divisor*, and pack each resulting field residue with the corresponding upper key as an unsigned byte. The reconstructed 256-byte table is fully valid, and the exact original decoder recovers all **252/252** planted native plaintext symbols. This establishes that a correctly keyed language-bearing table could be recovered by the declared mechanism; the original does not satisfy its plaintext signature.

## All-secret quotient-addressed GP29 substitutions: exact entropy obstruction

A more permissive cipher than the twelve tested *additive* pads would choose an entirely unknown GP29 alphabet **for each** of the nine observed quotient values. Freeze one of the six source-natural reading/clock conventions above; let its public key index at position \`i\` be \`k_i=q[phase(i) mod256]\`. The hypothetical encoder uses arbitrary fixed bijections \`C_i=π_(k_i)(P_i)\`, independently selecting any of the **(29!)⁹** possible families of nine substitution tables. Every coefficient of each secret table is free.

For each fixed quotient state, a bijection merely relabels the observed output histogram. This proves the **exact, secret-independent finite-data identity** \`H_emp(P|k)=H_emp(C|k)\`. Since conditional entropy cannot exceed the observed plaintext's empirical marginal entropy, every possible key must satisfy \`H_emp(P)≥H_emp(C|k)\`. This bounds the *plain alphabet distribution* without searching one secret symbol.

The source-original 12,956 rune symbols produce empirical \`H_emp(C)=4.856503613708271\` bits/rune. The new direct 9-state counts yield:

| Quotient traversal and clock | Exact source-original \`H_emp(C|k)\`, bits/rune |
| --- | ---: |
| Row-major, continuous book | **4.843601542494023** |
| Row-major, restart at nine visual chapters | **4.843558599857221** |
| Row-major, restart at each physical page | **4.845164464587372** |
| Column-major, continuous book | **4.845209072455934** |
| Column-major, restart at nine visual chapters | **4.843598547642064** |
| Column-major, restart at each physical page | **4.844059371224885** |

Thus all nine hidden alphabets, whatever their assignments, would force **at least 4.84355860 bits/rune** of marginal entropy in any recovered GP29 plaintext. The highest **4.28909395 bits/rune** among the 89 independently pinned source-native Shakespeare/Gibran/Emerson windows in the prior [full original entropy calibration](lp2-cipher-feedback-conditional-entropy-gate.md) is smaller by **at least 0.55446 bits/rune**. This is a powerful **native-GP-English-register exclusion** of the complete nine-state fixed secret-permutation family. It assumes preserved rune count and order and uses independent English controls, not a language-universal impossibility claim.

The SFT plants a full original-length source-native clear-p57 rune stream encrypted with **nine genuinely different unknown affine bijections** \`π_k(p)=(k+1)p+3k+7 (mod29)\`; it exactly decrypts all **12,956/12,956** positions in each of six source clocks and checks the empirical conditional-entropy identity to numerical precision. The all-secret invariant is strictly stronger than the previous additive-only IoC observations, since it includes arbitrary secret permutations at all nine quotient addresses.

**Decision:** The source-visible radix9 upper register does not plausibly act as the *sole, fixed nine-way substitution selector* for ordinary native-GP English on the unsolved manuscript, even granting all secret mappings. Page-dependent secret tables, a hidden evolving state, dynamically different key clocks (including a real plaintext-dependent F skip), and any additional preprocessing fall outside this exact exclusion. No plaintext was recovered.

### All-secret previous-ciphertext-feedback extension

Even if the published preceding ciphertext rune is a **second public key address**, the exact entropy invariant survives for each fixed pair \`(q_i,C_(i−1))\`. This grants **261 independently secret 29-symbol permutation tables** to a reversible ciphertext-feedback cipher, a much broader class than the nine-alphabet model above. Physical page leaders have no within-page predecessor and are excluded, leaving **12,901 source transitions**. The original-source conditional entropy \`H_emp(C_i | q_i,C_(i−1))\` for row/column-major grid and book/chapter/page q clocks is respectively **[4.3581553040, 4.3622271772, 4.3823916094, 4.3702358553, 4.3686856707, 4.3475877079]** bits/rune. Since every secret bijection preserves each public-state histogram, every possible recovered plaintext must retain marginal entropy at least **4.3475877**, above the pinned 89-control native-GP English maximum **4.28909395** by approximately **0.05849** bits/rune. This is a conditional GP-English-register obstacle, narrower in margin than the nine-alphabet result, and is source-original asserted by the SFT. A secret plaintext-dependent clock or a change in word/rune register would invalidate its premise. No unknown text recovered.

## Decision

Reject a **literal, unencrypted base9-quotient file or legible byte register** under the 50 source-natural whole-table and bitmap readouts, the **12 fixed repeated additive GP29 key consumers** applied to the actual 12,956-rune unknown manuscript, the **four same-cell field-quotient/upper-register additive receivers** on the original 252-symbol quotient, an **exact all-secret nine-alphabet family**, and its **261-state preceding-ciphertext-feedback extension**, ruled out for calibrated native-GP English by conditional-entropy invariance. The base9 register remains mathematically available but has no detected message, key, or decoding role. The apparent highest printable ratio must not be mistaken for a decryption: it is structurally inflated by the restricted 0–80 pair alphabet. A different keyed transport cannot be excluded by this bounded test; pursuing one requires a first-party instruction choosing the key/consumer rather than another unrestricted byte permutation search.

**Exact original-input execution:** [Windows Python 3.13 Actions run 44274335662](https://github.com/FlareZ123/liber-primus/actions/runs/44274335662) completed successfully on 18 November 2026, including the additional 261-state feedback-entropy gate. Its predecessor [run 44273750404](https://github.com/FlareZ123/liber-primus/actions/runs/44273750404) also passed. It ran the complete source-asserting SFT with all 50 binary readouts, 12 GP29 full-book key decodings, four coupled source-polynomial quotient reads, six key-independent 9-state entropy inversions, and genuine planted-message controls.

The GF29 factors and the original 2013 message remain exactly as documented in [the original factorization](2013-base29-gf29-grid-factor.md). This side-channel negative does not change the authoritative unsolved-book status in [the synthesis](../results/README.md).
