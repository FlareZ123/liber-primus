# The uniquely consecutive F-headed words after the historical HTML p0 boundary: original-cipher decisions

**Agent44, 22 November 2026. Scope: original LP2 physical p0 words40–42, first-party historical HTML and authenticated solved-p56 encryption function. Status: exact source structure and finite negative cryptanalysis. Unknown plaintext, an authentic new key and the final Cicada destination remain unrecovered.**

## Source-constrained entry and original cipher

The archived 2014 Stage11 delivery HTML prints literal title **133** and container id **331**. As established separately in the [2014 Stage11 corridor study](lp2-2014-html133331-p0-36word-corridor.md), interpreting both as addresses modulo the 256 cells of the original pp49–51 base60 table gives `table[133]=141` and `table[331 mod256]=table[75]=177`. These are exact original physical p0 rune positions and delimit an intact eight-word, 36-rune ciphertext passage; the HTML does **not** independently instruct that address grammar. The right endpoint **177** is exactly the beginning of the following printed word40:

| Original physical p0 word | Rune start | Rune count | Original GP-transliterated cipher |
| ---: | ---: | ---: | --- |
| 40 | **177** | 6 | `FXAEPGX` |
| 41 | **183** | 6 | `FLWEOTAE` |
| 42 | **189** | 3 | `FGN` |
| 43 | **192** | 4 | `MEOLN` |

The initial rune of each of words40–42 is **F**, forming the sole three-consecutive-F-headed printed-word run among **2,896 complete original unknown-page LP2 words**. The third word starts at source table address189; **`table[189]=192`**, the following original p0 word begins at position192, and **`table[192]=00`**, the first of the original numeric table's only two literal zero cells (the other is 229). The historical first-party DH23 worked example independently supplies [23,8,5], which can be combined retrospectively as address `23×8+5=189`; it does not instruct that construction. This is a concrete convergence of source geometry. The alignment and uniqueness are literal properties of the source, but the chain of transfers and a deciphering opcode remain unselected.

The 2014 HTML concatenation `133331` is exactly `11×17×23×31`; the corresponding GP-prime runes read outside-in as `RIGH`, becoming `RIGHT` upon appending the GP rune T. This is a separate, retrospective interpretation; it does not provide an AES key or a cipher-specific instruction. The numerical table's 60-character alphabet uses every character except lowercase `f`, index41; p0 word41 is the middle F-headed word, another exact but weak positional connection. No claim that the repeated ciphertext F letters must be *plaintext* F is justified, because the original solved p56 authentic prime-totient cipher demonstrates that ciphertext F can encode a non-F plaintext rune.

## One-source-key AES128 original-data inverse

The three source F-headed words contain **12 noninitial rune indices**. Concatenate those exact indices in printed order with the four outside-in historical palindrome factor indices `RIGH`. The resulting source-frozen 16-byte key is

```
14 25 13 6 14 20 7 12 16 25 6 9 4 10 6 8
X AE P G X L W EO T AE G N R I G H
```

The minimally typed receiver chosen for this challenge is the canonical 256-byte numerical table, unchanged, under **AES-128-ECB**, no IV, padding disabled, no key/phase search. The full original 256-byte inverse gives SHA-256-anchored ciphertext and this decrypted beginning:

```
d4e9cbf89c4aeabcd1d1da746cfcdef7b915a38c867957aa67ff05680c85855e
```

All 256 original bytes encrypt back exactly, and a genuinely planted 256-byte AES positive round-trips. The output contains **88/256** printable ASCII bytes, **29/256** bytes under29, empirical byte entropy **7.15899421** bits, and no standard recognized leading archive/image/media file signature. It resembles ordinary unstructured bytes and does **not** recover a typed payload. AES is only a hypothesis; no historical creator source specifies this assembled AES key.

## Exhaustive original p0 FFF crib under the *authenticated* p56 mechanism

A stronger consumer uses an existing, genuinely authenticated rule rather than a new cipher design: original solved p56 was encrypted with successive **(prime−1) modulo29** key residues, with **plaintext F passed through without consuming a key position**. The three original ciphertext F heads could each be literal F or an encrypted non-F; both cases must be kept. The test fixes the exact three original printed word lengths **6,6,3**, original ciphertext offsets **177–191**, and examines every **common continuous prime-key starting offset 0–199,999**, together with all **2³=8** possible literal-F masks, using the unchanged GP29 aliases and a named TextBlob-derived English word-frequency lexicon.

Across **1,600,000** original source cases, thirteen offset/mask cases decode the first six-rune word into a listed English word (examples: `LUSTER`, `RICHLY`, `CURTLY`, `LASTLY`). **Zero** produce two consecutive dictionary words and **zero** produce the complete three-word English phrase. The untouched original ciphertext gives no three-word decoder candidate under this finite family.

The test is not intrinsically unable to recognize three-word plaintext: a withheld, genuinely encrypted GP29 control **FOLLOW FREELY FAR**, with the exact **6,6,3** GP-rune word shape, planted at prime-key offset**133331** with all three Fs literal, is blindly recovered **exactly** at that starting clock and F mask**7**. The source script checks original plaintext-F encryption and exact inverse. This is a decisive negative for the defined finite authentic-p56-transfer family, not proof against clocks outside 200,000, other word-specific starts, unrelated ciphers or lexicon-absent historical prose.

## New source-derived GF257 primitive-field route from all three F-headed words

The original GP-*prime* sums, taking the exact existing rune prime values and the complete source words40–42, are:

```
word40 FXAEPGX   → 257 = 2^8 + 1, a Fermat prime
word41 FLWEOTAE  → 295 → 295 mod 257 = 38
word42 FGN       → 48
```

**A stronger interpage numerical bridge, identified only after exploring the GF257 route:** the independently original p39 **red three-rune inscription** has GP indices `[27,5,15]`, which forms the repeated-root quadratic `27+5x+15x² = 15(x−24)² (mod29)`. The oversized initial GP-A rune on original p54 is itself index **24**. Both original p29 ciphertext and original p50 table have vanishing polynomial value and first derivative at x=24 over GF29; that repeated-root relationship was already known separately. The new p0-GF257 source, however, supplies a numerical connection across those established clues:

```
38^24 mod 257 = 15                      (p39 quadratic leading coefficient)
38^48 mod 257 = 225 = 15^2 mod 257    (p0 third F-word sum = 2×24)
```

More decisively, the equation `g^24 = 15 (mod257)` has **exactly eight** solutions in the 256-unit field group: `38,94,105,119,138,152,163,219`. Its **least positive solution is 38**. Consequently, starting from the independently printed 256-cell table length, the existing p39 red quadratic and p54 oversized rune, the following *unfitted numerical construction* reproduces **all three FFF prime-word sums** in their printed order: `[256+1, (256+1)+min{g:g^24=15 mod257}, 2×24] = [257,295,48]`. The original p0 words carry these exact sums at the historical HTML-selected boundary. An exhaustive locked reading of all **2,896 complete original unknown-page printed words** finds the ordered three-word GP-prime-sum packet **[257,295,48] exactly once, at words40–42 of page0**, where the HTML-addressed path lands. Individually, sums257, 295 and48 occur 9, 5 and13 times in the entire corpus respectively. The consecutive ordered packet is unique. This is an exact, source-auditable coincidence that suggests a possible repeated-root/finite-field parameter derivation across p0, p29, p39, p50 and p54. The decision to use the minimum root, to combine the data in this manner, and to treat the result as a cipher key was **discovered retrospectively**. An intended author mechanism is not authenticated by the numerical fit.

**38 is a primitive element of the field GF(257):** its successive powers visit all **256 nonzero field elements** exactly once, and `38^128 mod257=256`, `38^256 mod257=1`. This fits the original printed numeric table's exactly **256 byte cells, geometrically arranged 32×8**. The three printed words provide a complete candidate triple of finite-field parameters without parameter fitting: modulus **257**, primitive root **38**, start phase **48**. In particular, it supports a canonical 256-element multiplicative group and a 256-point Fermat transform; 32×8 tensor transforms follow from the printed table geometry.

The cross-field connection may be an accidental result of selecting algebraic relationships after noticing the original FFF typography. No Cicada instruction states that prime sums should represent field roles, so the following are **fixed hypothesis consumers**. Each processes all 256 original p50 numeric bytes; the discrete logarithm uses the unique conversion of source byte `b` to field unit `b+1`. The phase48 is fixed by the third printed word.

| Exact first-party fixed inverse or transform | Original printable ASCII bytes out of 256 | Outcome |
| --- | ---: | --- |
| Per-byte `log_38(b+1) − 48 mod256` | 98 | No source-readable text or known byte header |
| Full-period exponent-stream `log_38(b+1) − (i+48) mod256` | 96 | No typed original payload |
| Full-period multiplicative unit-stream `(b+1)×38^{−(i+48)} mod257 − 1` | 96 | No typed original payload |
| Forward / inverse 256-point GF257 number-theoretic transform | 96 / 94 | No typed original payload |
| Forward / inverse 256-slot primitive-root *index walk* with phase48 | 103 / 103 | No typed original payload |
| Physical 32×8 Fermat tensor transforms with row/column direction pairs `++`, `+−`, `−+`, `−−` | 80 / 99 / 99 / 103 | No typed original payload |

**The direct field-log key on original ciphertext also fails.** Since the 256-cell table might encode a repeating key rather than a separately encrypted file, the same unique primitive logarithms `log₃₈(tableByte+1)` were reduced modulo29 and applied to the **entire untouched original 262-rune p0 ciphertext** (the source-supplied log register has exactly256 cells). The source-fixed phase48 was applied, with two meaningful starting anchors: original p0 physical rune0 and original unique FFF word start177. Both modular signs and both literal source-log treatments (retaining the log or subtracting the source phase48) give eight fully invertible original-cipher candidates, without optimizing any word fragment. The complete 262-rune index-of-coincidence values range **0.03342985–0.03808020**, with no coherent original GP-English sentences or selected source words. Every original variant reproduces its 262-rune ciphertext exactly upon reversing its sign, and a genuine original p57 clear-rune plant of95 characters encrypts/decrypts **95/95** in all eight conditions. This is a direct negative downstream test of the possible GF257 *key register* interpretation, distinct from decrypting the p50 numeric data itself. [Windows Node22 PASS 44976451443](https://github.com/FlareZ123/liber-primus/actions/runs/44976451443).

The doubly inverse 32×8 transform contains a raw eight-letter alphabetic substring `nTrJOcZc`. It is **not intelligible** and cannot establish plaintext when the complete 256-element output remains untyped; selecting individual alphabetic runs after testing multiple transforms is an overfitting trap. The finite-field readouts often include field element256, which is outside the ordinary byte range; this is another reason not to call them conventional ASCII payloads.

All direct and inverse field operations return **256/256 original cells** exactly when reversed; a complete synthetic source-p57 plaintext-index plant encrypts and decrypts without error under all tested reversible models. The primitive cycle, the eight-solution root relationship, the five-source consistency and field-axis normalization are exact, independently of the negative plaintext conclusion. [Complete source-only Windows Node22 runnable GF257 SFT](../sims/lp2_p0_fff_gf257_grid_dlog_sft.cjs), [passing GitHub Actions run44976451443](https://github.com/FlareZ123/liber-primus/actions/runs/44976451443).

**Decision:** retain the unusual five-source repeated-root/primitive-field equality as an unconfirmed new mechanism lead, with the exact field parameters as a possible reconstruction. The straightforward reversible field-value maps, full-period streams, whole-grid and 32×8 Fourier receivers fail on the untouched original table, and direct GF257 discrete-log key-stream application fails against all 262 original p0 ciphertext runes. Future dependent work needs an independent indication of *which* cipher operation, input ordering or cross-artifact transformation the creator intended. Repeating more unconstrained phase/key combinations is not warranted.

## Historical five-share Shamir: exact original p50 GF257 holdout (Agent3, 22 November)

**Decisive negative:** The established unique FFF packet nominates modulus257, primitive generator38 and start48. A different interpretation would treat the original p50 256 printed numeric values as consecutive Shamir polynomial evaluation shares over GF257, borrowing from the documented **2013 Cicada 5-of-10 SSSS episode** ([historical reconstruction](https://connortumbleson.com/2021/01/25/the-cicada-3301-mystery-puzzle-2/)). Correction to the Director assignment premise: that five-share precedent is **2013**, rather than an independently documented 2014 LP2 stage. The source packet to secret-sharing operation remains conjectural.

**Frozen reconstruction:** Threshold t=5 gives an interpolating polynomial of degree at most four. All 256 original p50 decoded bytes serve as field y-coordinates 0..255. Two original-clue-compatible x clocks are tested independently: (a) conventional one-based share ordinal x_i=i+1, (b) source FFF primitive and phase x_i=38^(i+48) modulo257. Both provide 256 distinct nonzero x values. Freeze only the first five original cells0–4 as shares, interpolate GF257 by Lagrange, and predict all **251 untouched cells5–255**. Neither signs, byte values, threshold, addresses nor phase are adjusted for the output.

| Frozen x clock | First withheld cell5 prediction, actual237 | Matches among 251 held-out cells | Failures | Last cell255 prediction, actual80 |
| --- | ---: | ---: | ---: | ---: |
| One-based ordinal x=i+1 | 114 | **1/251**, source position118 | **250/251** | 168 |
| FFF x=38^(i+48) | 228 | **0/251** | **251/251** | 193 |

Both clocks **already contradict original cells5–7**, the untouched end of the first printed row. A true degree-four GF257 share codeword must interpolate all remaining evaluations exactly. One accidental match under the ordinal clock is not evidence of a common polynomial. The two-clock test thereby rejects these particular literal source-fixed 5-of-256 Shamir hypotheses, without needing to interpret ciphertext as language.

**Positive controls:** For each clock, a distinct source-shaped genuine degree-four polynomial with fixed coefficients [0,38,48,14,23] produces 256 field shares. Its first five reconstruct **all 251/251 held-out y values**, with exact interpolation. Field values equal256 are legal synthetic GF257 elements even though the original printed numeric table only contains 0..255. No original ciphertext is altered.

[Single-file Windows Node22 CJS SFT](../sims/lp2_p0_fff_gf257_shamir_t5_original_sft.cjs) and [successful GitHub Actions run 44976829658](https://github.com/FlareZ123/liber-primus/actions/runs/44976829658). This exact all-original holdout is separate from earlier exhausted dlog, 256-point Fermat transform, AES and whole-grid cipher families. A new first-party threshold, row-specific share groups or true serialized x-coordinate evidence would be required before another interpolation interpretation. Scanning degrees, x rotations or new field operators against the already-inspected 251 failures would be postselected.

## Original GF257 ElGamal cryptographic receiver: fixed adjacent-pair negative (Agent15, 22 November)

The source-selected *numerical* triple at the p0 FFF corridor is \`(257,38,48)\`, where the three authentic complete GP-prime word sums \`[257,295,48]\` supply field modulus 257, generator \`295 mod257=38\`, and candidate private exponent 48. In standard multiplicative ElGamal, this yields public key \`y=38^48 mod257=225\`; also \`38^24 mod257=15\`, the original p39 red quadratic's leading coefficient, and \`225=15²\`. These mathematical identities and the historic Cicada DH examples motivate exactly **one** straightforward cryptographic consumer, though no first-party instruction actually selects ElGamal.

Freeze all input and output semantics before decoding: read the original p50 source's 256 printed radix-60 tokens in its row-major 32×8 order as original bytes 0–255; pair adjacent bytes, giving **128 ciphertext pairs** \`(C1,C2)\`; inject each byte \`b\` into the nonzero GF257 multiplicative group via the exact bijection \`b↦b+1\`. Original private-exponent decryption is then

\`P_i = ((C2_i+1)·(C1_i+1)^208 mod257) −1\`, since \`208=256−48\`.

The complete original 128-byte output has **50/128 printable ASCII bytes**, only **29/128 ASCII letters**, and **13/128 values in GP29's 0–28 native plaintext alphabet**. The other natural *lossless* native-GP serialization treats a rune index as a power of the nominated primitive generator, `m=38^index mod257`; only **14/128** original ElGamal-decrypted group elements have a base-38 discrete logarithm in the 29-symbol GP range 0–28. Thus both fixed, exact native-text encodings fail independently. Its first 16 bytes are \`[140,22,68,91,223,120,193,66,141,33,187,168,199,51,94,80]\`; full 128-byte SHA-256 \`b66a0f2c609c2f93ea11486cfc6b569886d0307631f0b2873c508835e8ef9482\`. The original 256 decoded table bytes have SHA-256 \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`. **115/128** decoded output values cannot be native GP29 letters at all. This source-frozen ElGamal receiver therefore fails immediately as direct 128-rune GP plaintext and fails as a direct ASCII narrative.

A genuine solved-p57 GP-native **128-symbol** positive was encrypted with ElGamal and recovered **128/128** exactly using the frozen same \`(p,g,x)\`. All original 128 source ciphertext pairs are correctly reconstructed algebraically from the decoded values, which verifies the inverse's implementation but does not authenticate a cryptographic key: any valid private exponent has this property. This test does not exclude compressed or differently serialized messages and does not authorize post-hoc swapping of pairs, using token halves, changing private exponents, or taking a mod29 projection to rescue random output. There is still **no unknown LP2 plaintext or verified ElGamal key**. [Windows Node22 source-native single-file test](../sims/lp2_p0_fff_gf257_elgamal_original_sft.cjs).

## Research decision

The original HTML boundary → unique p0 FFF word run → original table first zero is a specifically localized original-artifact **route candidate**. Its consecutive F heads merit preservation for future source-selected operations. None of the source-frozen consumers recovers plaintext: the assembled AES128 key fails on the original 256-byte register; the 200,000-position authentic prime-totient/F-skip decoding fails the 6/6/3 original dictionary test despite a positive plant; and the three complete original F-headed words nominate a primitive GF257 group but its direct reversible consumers remain untyped.

**Avoid tuning AES modes, F masks, GF257 primitive-root phases, index orientations, key reorderings or word starts on these inspected original sources.** Advance the branch only on an independent source selecting an exact transition, new authentic plaintext from historical drafts, or a full original ciphertext inverse yielding readable untouched output.

**Reproducible source-only Windows Node22 tests**: [original p0 FFF source AES inverse](../sims/lp2_2014_html_f3_aes128_grid_source_sft.cjs) and [original p0 FFF 1.6-million prime-clock search](../sims/lp2_p0_fff_primeoffset_lexical_sft.cjs). These, the [source GF257 full-grid reversible gate](../sims/lp2_p0_fff_gf257_grid_dlog_sft.cjs) and the earlier [p0 36-rune Hill6/seven-share receiver](../sims/lp2_p0_36_hill6_shamir7_sft.cjs) all PASS [Windows CI run44976451443](https://github.com/FlareZ123/liber-primus/actions/runs/44976451443). Original data inputs are checked-in historical index, native LP2 transcription, GP29 corpus, original 256-byte base60 grid and explicit English word lexicon. The byte-level/original-cipher claims above were obtained from that run.
