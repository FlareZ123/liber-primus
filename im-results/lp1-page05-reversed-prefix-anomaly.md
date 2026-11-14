# LP1 page 05 JPEG near-palindrome contains a decoded historical 2014 five-by-five square

**Agent24 and Agent35, 14 November 2026. Evidence class: source-exact byte identity and independently reproduced historical numerical plaintext.**

The uploaded 75-image JPEG archive was scanned byte-for-byte. Exactly one file has a nontrivial mirror structure: LP1 page 05, 05.jpg.

## Exact file structure

The 673,066-byte file decomposes exactly as:

\[
F=A\parallel M\parallel\operatorname{reverse}(A)
\]

where:

- \(|A|=336,353\) bytes;
- \(|M|=360\) bytes;
- the first 336,353 bytes equal the reverse of the last 336,353 bytes byte-for-byte;
- the central 360 bytes are the only part that breaks the symmetry.

The first block A is a complete 2400×3600 JPEG, ending with EOI at offset 336,351. The middle block M begins with two newline bytes followed by 358 ASCII hexadecimal characters. Those characters decode to a 179-byte binary block.

| Property | Observed value |
|---|---|
| Archive JPEG count | 75 |
| Files with nontrivial mirror structure | 1 |
| File | 05.jpg |
| Whole-file size | 673,066 |
| Mirror-shell length on each side | 336,353 |
| Central block length | 360 |
| Central block SHA-256 | b7673be762e3f1b0560b2735d1a0894029ce1a39abb130bf9947e81dbf733892 |
| Decoded binary length | 179 bytes |
| Decoded binary SHA-256 | 82c135148b6cf85e9b550afdbc6204be075ff67717356a8ae18b76f9cc3af5fa |
| Whole-file SHA-256 | 2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7 |

The exact central text is preserved in `im-results/lp1-p05-central-block.txt`. Its decoded 179 bytes have a simple **lossless two-step inverse**: swap the high and low 4-bit nibbles of every byte, which immediately yields 5 rows of ASCII decimal tokens; then reverse the decimal digits of each token. The result is an **exact, 25-cell match** to the third historical 2014 five-by-five table in `resources/cicada2014-openpuff-magic-squares.txt`, an independent research resource preserved before this decoding. No secret key, packet brute force or language-model scoring is needed.

The earlier observation of 72,700 post-EOI bytes is a consequence of this larger mirror structure: the trailing segment is the reverse of the first 72,700 bytes. Reversing it reconstructs that prefix exactly. It is not an independent hidden page. The other 74 JPEGs in the uploaded archive have no comparable mirror shell.

## Exact decoded 2014 square and source-selected operations (Agent35, 14 November 2026)

Treat the source's 358 hexadecimal characters as 179 bytes `B`. Set `A[i] = ((B[i] & 15) << 4) | (B[i] >> 4)`; ASCII-decoding `A` produces exactly:

```text

272     831     143     131     151
663     991     031     023      81
622     542      19     542     622
81     023     031     991     663
151     131     143     831     272
```

Reversing **the characters within each decimal token**, preserving even significant leading zeros as text, yields:

```text
272 138 341 131 151
366 199 130 320 18
226 245 91 245 226
18 320 130 199 366
151 131 341 138 272
```

Every row, every column, and both main diagonals of this newly recovered square sum **exactly to 1033** (12 independent equality checks), while the nibble-swapped but *digit-unreversed* intermediate lacks that property. Thus the numeric symmetry supplies an additional independent fixed-constant decoding check, beyond the external archive match. The 1033 magic sum is also the earlier visibly printed LP1 p05 Wisdom-square motif; this new hidden table independently reuses that constant. This 5×5 table exactly matches the **third** of the independently preserved historical 2014 original magic-square datasets in [`resources/cicada2014-openpuff-magic-squares.txt`](../resources/cicada2014-openpuff-magic-squares.txt). It is rotationally symmetric and includes all specific 25 numeric values. The first two preserved historical squares are different. The match is exact after whitespace normalization only; no numeric substitutions, guessed offsets, alphabet keys or value fitting occurred. The original near-palindromic A–M–reverse(A) carrier visibly motivates reversal, while the nibble interchange is the smallest operation that turns the observed `0xA0` newline, `0x02` space and `0x13` / `0x23` / `0x33` digit forms into normal ASCII.

The inference is **fully reversible**: reverse every decimal token again, swap its ASCII high/low nibbles back, hex-encode, prepend the two original newlines, and recover all **360 central bytes**, including exact leading-zero digit strings. The [single-file Node22 SFT](../sims/lp1_p05_magic_square_nibble_inverse_sft.cjs) checks the 179-byte SHA-256, exact encoded central stream, 25 individual historical values, independent mismatch if token reversal is omitted, and 180° matrix symmetry. Its independent input is the historical square resource. It is a **recovered original 2014 stage numerical object** embedded as an overlooked binary appendage on LP1's prime/totient page, *not* unknown LP2 plaintext. The 2014 square already existed elsewhere in the public archival record. This newly established copy and its historical handoff may inform further cryptanalysis, but supplies no authenticated cipher operator connecting these 25 numbers to LP2's 12,956 unsolved runes.

## Source-selected two-moth passage refinement (14 November 2026, Agent36)

The same original moth image appears on **p53 and p55**. Source-ink segmentation of p53 yields a 51-rune red passage containing precisely one ciphertext F; p55's 76 original runes instead contain **three ciphertext Fs at local positions 15, 25 and 41**. **Only by provisionally skipping p53's sole F and just the p55 F at local25 (while retaining p55 Fs at 15 and 41 as encrypted runes)** do the art-linked passages consume **50+75=125** key symbols, or five cycles of the 25-number square. The selected p55 skip mask is not given by the original source. The p53 passage's matching rune-red color provides an original visual selector; the original does not instruct a two-page concatenation. Exact row-major `φ(square) mod29` decryption of both source passages under these hypothesized exceptions produces nonlinguistic original inputs, with p53 IoC **0.03529411764705882** and the previously reported p55 IoC **0.03333333333333333**. The separate full-p53 **179-rune** length also matches the central JPEG's original **179 decoded binary bytes**; four fixed direct byte-pad maps and both signs likewise fail on untouched p53 ciphertext (IoCs 0.03226–0.03590). See [five-cycle source analysis](lp1-p05-moth25-red51-p55-76-fivecycles-gate.md), [its executable](../sims/lp1_p05_moth25_p53red51_p55_76_sft.cjs) and [full-byte source test](lp1-p05-hidden179-p53-moth-rawpad-gate.md). These are explicitly conditional original-cipher negatives, without new authenticated unknown-page plaintext or key.

## Exact source-born 76-rune word tape and moth-linked p55 (14 November, Agent 2)

**New original-source observation, independently usable as a key-candidate operand:** The original LP1 p05's printed 5×5 mixed Wisdom square contains **13 verbal cells and 12 numeric cells**. Reading only the verbal cells in their unmodified row-major visual order and retaining their original GP rune spellings produces exactly **76 GP29 runes**. This equals the entire unaltered length of original LP2 p55, **76**, including its first NG rune carried over from p54. The original LP1 p05 moth illustration was independently pixel-registered on both LP2 p53 **and p55**; therefore the duplicated moth alone does not uniquely nominate p55, but the 76/76 source-length alignment selects a one-to-one candidate without the three-F skip or period fit required by the 25-cell numerical pad tests elsewhere in this report.

The exact source 13-word order and number of *runes per word* (not Latin letters) are:

| Source verbal cells in printed order | Rune counts |
| --- | --- |
| SHADOWS, AETHEREAL, BUFFERS, UOID, CARNAL, OBSCURA, FORM, MOBIUS, ANALOG, UOID, MOURNFUL, AETHEREAL, CABAL | **7, 6, 7, 4, 6, 7, 4, 6, 6, 4, 8, 6, 5** |
| Total | **76** |

This is a stricter cross-round operand than using the 25 **numeric** square values or the 179 embedded binary bytes: all 13 word cells are author-visible and their original rune concatenation fully covers a nearby same-art 76-rune ciphertext. **Strongest objection:** the exact 76 may be incidental to the 13 word spellings required for the solved 1033 square. Neither p05 nor p55 instructs a direct 76-symbol stream cipher, key sign, non-additive consumer, or starting phase. The word cells were historically used for their prime-value numeric sums. The same moth's appearance on p53 prevents a unique art-only source selector.

One frozen direct consumer uses the 76 GP rune values as a one-time printed-order key, starting at key offset zero, without moving or skipping any of the three ciphertext F runes. Since the p05 text explicitly discusses **primes and Euler's totient**, compare only three source-defined scalar interpretations of each source rune: GP ordinal, GP prime mod29, and \(\phi(\mathrm{GPprime})\bmod29\), with both addition and subtraction modulo29. All six original full-p55 inverses reconstruct the **76/76 original ciphertext**, and all six forward-planted native solved-p57 controls recover **76/76** real GP prose runes.

| Source 76-rune key values | Decrypt by C−K, GP IoC | Decrypt by C+K, GP IoC |
| --- | ---: | ---: |
| GP rune ordinal | **0.038596491228** | **0.030175438596** |
| GP prime value mod29 | **0.040000000000** | **0.041052631579** |
| GP prime totient mod29 | **0.040000000000** | **0.041052631579** |

None reveals coherent GP prose or a typed instruction. A direct five-bit XOR of the original 76 rune ordinals similarly emits **eight** non-GP numeric codes 29–31, so it cannot be a complete 29-rune-only keyless XOR plaintext under this one-to-one representation. **The underlying 76-symbol source tape is a genuine, reproducible candidate key material; its use as the manuscript's actual key remains unestablished.**

**Stronger decision under the authenticated p56 prime-totient cipher, including every possible literal-F bypass.** The original p55 has ciphertext F at precisely zero-based local offsets **15, 25, 41**, and the solved historical forward encoder requires that *every plaintext F* be copied as ciphertext F without consuming key. Thus each of those three ciphertext Fs may be either a literal bypass or an encrypted non-F; this is **only eight complete possibilities**, all source-fixed with no language tuning. Exhaust all eight under the p05 76-rune tape and the original historical GP-prime-totient key values, with the known p56 decryption sign and zero phase. Test both the original printed order and the full reverse (the p05 JPEG has an authentic reversed-byte shell).

**Every one of the sixteen complete original-cipher candidates violates the strict historical F rule, independently of its linguistic score or the unknown plaintext.** For the printed tape, local **p55 cipher offset13 is TH/GP2**, while its p05 key rune is B/GP17 with \(\phi(\mathrm{GPprime}(B)) \equiv 2\pmod{29}\). Because no ciphertext F occurs before offset15, **every** bypass pattern decrypts local13 to plaintext F/GP0 even though the original ciphertext glyph is TH. That is impossible under the authentic forward emitter. For the fully reversed p05 tape, original cipher offset20 is U/GP1, and the two possible current key positions 19 and 20 (according to whether the earlier ciphertext F15 was bypassed) **both** have prime-totient key residue1. Thus reverse order likewise necessarily decrypts non-F ciphertext U20 to forbidden plaintext F, irrespective of later bypass choices. The [same original SFT](../sims/lp1_p05_wordcells76_p55_exact_sourcekey_sft.cjs) asserts these local contradictions, all **16/16** full-page strict failures, and an independently clear p57 76-rune positive encrypted and recovered under the exact historical plaintext-F rule.

**The independent p54 carry does not rescue the historical cipher.** Because p55 starts with a lone NG completing a word from p54, repeat the strict-source experiment on the **75 complete-word runes** p55 offsets1–75. Grant the only four end-aligned ways to take 75 consecutive source-key runes from the authentic 76 tape: printed/reversed order and dropping the first/last key rune. Ciphertext F positions in this natural body become 14, 24 and 40; all eight possible bypass masks are tested for each of the four key framings. **All 32/32 fail** the historical necessary condition that any plaintext F must have appeared as ciphertext F, with at least one forbidden non-F ciphertext position for every mask. Under printed-last75 and both reversed framings, a contradictory position is even common to all eight masks (body offsets12,12,19, respectively); the printed-first75 case is excluded by its complete eight-mask gate. This closes the natural printed page vs complete-word-body reset distinction for the exact φ(prime) source-tape transfer. No rune is discarded without accounting for the inherited NG, and no arbitrary interior phase is tried. [Reproducer](../sims/lp1_p05_wordcells76_p55_exact_sourcekey_sft.cjs).

**Decision:** the original **76/76 source correspondence survives**, but its natural historical φ(prime) running-key interpretation is now **formally excluded** for both visually selected orientations and *all* F-bypass masks, before considering natural-language scores. The six unconditional Vigenère negatives above also stand. Reopen only if an authentic source names a genuinely different reversible consumer of the 76-rune tape; an extra skipped non-F cipher rune, arbitrary rotated key, or edited source glyph would not follow from p56's actual rule.

 Do not claim a decryption or tune extra phases, masks, clocks, or alternate original word spellings to rescue the direct six negative outputs. [Exact single-file source/key/control SFT](../sims/lp1_p05_wordcells76_p55_exact_sourcekey_sft.cjs).


### 2016 words-map clue: value-directed and Möbius word-tape orders (Agent33, 14 November 2026)

The signed 2016 message says: **"Its words are the map, their meaning is the road, and their numbers are the direction."** The original LP1 p05 Wisdom square has thirteen GP word cells whose prime sums are **[341, 366, 199, 130, 320, 245, 91, 226, 320, 130, 199, 366, 341]**. Their spellings total 76 runes, matching p55. This gives a human-visible reason to ask whether the numbers order the word cells; the word **MOBIUS** and the 5×5 grid also motivate a limited alternating-row traversal. The signed clue does **not** specify a sort direction, tie rule, Möbius walk, or cipher operator, so these remain exploratory interpretations rather than an authenticated instruction.

A frozen original-input test builds eight 76-rune key orders: ascending/descending prime-sum order with stable or reverse row-major tie handling; row-wise boustrophedon from either end; and the corresponding alternate-row orientation twist that also reverses each word's rune order on reversed rows. Each key is converted using the authentic solved-p56 prime-totient rule, phi(GP-prime(key rune)) mod 29, and applied to all 76 original p55 runes. The three original ciphertext Fs at local offsets **15, 25, 41** admit exactly eight possible literal-bypass masks. Under the p56 forward encoder, any non-bypassed position that decrypts to plaintext F is impossible, because plaintext F must be emitted as ciphertext F without consuming a key symbol.

**All 64 original candidates fail this exact necessary condition.** Every one of the eight key orders has zero viable F masks; each mask forces at least one forbidden plaintext F. The minimum number of contradictions across the eight masks is 1–3 depending on order; seven orders also have a forbidden position common to every mask. The independently solved p57 first-76-rune positive plant re-encrypts and recovers **76/76** under every key order, checking the implementation and F clock. Full per-mask witnesses are emitted by [the reproducer](../sims/lp1_p05_wordvalue_mobius_p55_phi_gate.cjs).

This is distinct from the 13-value columnar transposition and 76-rune XOR5 capacity tests in [the p05 13-unit key report](lp1-p05-wordcell13-p55-vigenere-gate.md): the present test reorders the full 76-rune word tape itself and applies the historical p56 prime-totient clock.

**Decision:** retire only these eight value-directed/Möbius/boustrophedon p05-tape orders as direct p56-style prime-totient keys for p55. Do not broaden to arbitrary permutations, rotations, phases or extra F exceptions. The 2016 sentence still motivates word-level navigation, and the p05 76-rune operand remains a real source correspondence, but no unknown p55 plaintext, key or author-selected operation is recovered. The original p05 row-major/reverse, additive, GP28 and changing-symbol feedback results remain as separately scoped above.
### Complete 76-rune source tape as a GP28 changing-predecessor key (Agent 30, 14 November)

The above source-born **76 GP-runic** printed-order tape also admits a different, reversible key consumer motivated by the **original ciphertext's suppressed adjacent duplicates**. Source p55 begins with a word carried from physical p54, whose **last original rune is GP index 26**; treating it as the initial ciphertext predecessor gives a complete predecessor for **all 76 p55 symbols** (first p55 index 21). Exactly **one** printed source output equals its predecessor, at **p55 local index 59**. For each other output, a human can encode the next ciphertext as one of 28 symbols by excluding the preceding output. Treat the single repeat as an escape symbol, GP index28, so no original ciphertext is lost. **Neither Cicada nor the LP1 Wisdom source establishes this operator**; it is one finite, executable use of the historical artwork, source-tape length, and observed anti-repeat shape.

The independent read-only [original-source SFT](../sims/lp1_p05_wordcells76_p55_gp28_source_inverse_sft.cjs) declares **two** exact predecessor-excluding ranks (cyclic and ordered), the source tape in **printed or fully reversed** order (the LP1 p05 JPEG itself has a reversible byte envelope), **three** source-native key values per rune (GP ordinal, GP prime, prime totient, each reduced modulo28), and the **two** additive signs. It tests all **24** frozen hypotheses, without fitted start phase, edited cells, selective F skips or unknown secret words. The repeated predecessor is decoded as one reserved symbol, independently of the key. Each candidate **re-encodes 76/76 original p55 runes** and exactly recovers an independent **76/76 solved-p57 GP plaintext plant** encrypted under that model; these are implementation checks, not cipher authentication.

All 24 original readouts are nonprose. Their 76-rune indices of coincidence range **0.028421052632–0.037543859649**, compared with the untouched p55 **0.037894736842**. Across all **20 overlapping, genuine 76-rune clear-text windows** within solved p57, native GP IoC ranges **0.059298245614–0.063859649123**. A hidden **fixed global permutation of the 29 GP symbols** cannot alter any of these IoCs; thus a secret outer alphabet alone cannot turn these outputs into p57-like clear GP. The 76-rune sample and single native source are too short to support a language-universal impossibility claim.

**Prior exclusion and decision:** The full-corpus [fixed-rune repeat-sentinel invariant](lp2-one-symbol-repeat-sentinel-source-gate.md) already rejects **every fixed one-symbol repeat sentinel**, independently of secret key, state updates and alphabet relabeling, against word-position-calibrated native GP registers. It therefore **subsumes** this GP28 model's reserved `28`/EA repeat rule; our 24 p55-only tests are a strictly narrower original-key application, **not an independent exclusion or novel generic cipher insight**. Their short-run IoCs are supplementary. Retire these readings without further variants. The independent GP29 76-tape source candidate and its additive/strict-F gates are distinct; a genuinely new cipher would need a changing exception rule or another independent author-selected consumer.

### A changing-symbol 29-way exception that retains all plaintext runes (Agent 30)

The previous GP28 test's fixed EA/28 repeat sentinel is already rejected by the whole-book native-language word-position invariant. The **same independent 76-rune source tape** permits a stronger, *different*, fully reversible cipher which avoids that fixed-sentinel assumption. Let the original predecessor C[-1] be p54's last GP rune **26** and let original p55's 76 rune values be C[i]. For each source key digit K[i] (GP ordinal, prime or prime-totient reduced modulo29, source p05 printed or fully reversed), define:

\[
P_i \equiv s_d(C_i-C_{i-1})+s_kK_i\pmod {29},\qquad
C_i \equiv C_{i-1}+s_d(P_i-s_kK_i)\pmod {29},
\]

with s_d and s_k each +1 or −1. This model has an exact original source-derived **changing repeat sentinel**: C[i] equals C[i−1] if and only if P[i] equals s_k K[i] modulo29. It is bijective on **all 29 plaintext runes**, needs **no separate escape side-channel**, consumes all **76** source key digits and uses one independently observed p54 initial state. A changing marker is necessary to evade the previously disproved fixed-symbol marker family, although the manuscript does **not** independently select this particular recurrence.

The integrated [original-source 48-model SFT](../sims/lp1_p05_wordcells76_p55_gp28_source_inverse_sft.cjs) evaluates **24** fixed-sentinel GP28 variants separately from **24** GP29 feedback variants here. All 24 feedback models exactly recover **76/76** genuine solved-p57 GP plants from freshly encrypted originals, re-encode all unchanged p55 glyphs, and require **no hand-fitted exception site or 29th-symbol special value**. The original decoded 76-rune IoCs range **0.031578947368–0.038245614035**, all below the **0.059298245614–0.063859649123** observed among p57's 20 overlapping 76-rune authentic plaintext windows. No model produces a readable unknown p55 passage, authenticated key or next-stage locator.

**Decision:** this source-matched, full-capacity changing-exception inverse is also a negative as a direct p55 cipher. It tests an independently instantiated moving-sentinel family left open by the universal fixed-sentinel exclusion; the short native reference and unselected historical operation limit the inference. Further rotations, alternative clocks, or new source key transformations require a separate original author-selected instruction.

### Three original complete-length 76-unit operands: source tape, numeric-table rim, moth page

One independent original artifact also has **76 source units**: the **outer perimeter** of the LP2 32×8 numeric table (physical pp49–51) contains **2×32+2×8−4=76** original printed cells. Its four-side clockwise walk begins at the upper-left source cell, reading top row right, right edge down, bottom row left and left edge up. Combined with the **76 original p05 verbal-cell GP runes** and **76 original p55 ciphertext runes**, this gives three *source-fixed* complete-length inputs. The p05 moth occurs on p55; the p50 table is also near the end of the original book. No Cicada instruction actually pairs the two putative key tapes.

Freeze this one short composite hypothesis:
\[
P_i=(C_i+s_1 W_i+s_2 (B_i\bmod29))\bmod29,
\]
where original p55 rune \(C_i\), p05 word-cell rune GP ordinal \(W_i\) and perimeter byte \(B_i\) each use printed physical order, except a second p05 orientation that reverses its whole tape because that original LP1 JPEG contains a reversed envelope. Test both signs independently for \(s_1,s_2\), eight configurations total, **no fitted phase, changed table cell, selective F mask or hidden offset**. For every candidate, the direct additive encoder exactly reconstructs **76/76 original glyphs** and separately recovers an independently planted **76/76 solved-p57 GP passage**.

All **eight original readouts remain nonprose**, with 76-rune IoCs **0.029824561404–0.037894736842**, versus genuine solved-p57 native 76-rune windows **0.059298245614–0.063859649123**. The eight-model result and exact table-perimeter extraction are integrated into the [read-only CommonJS SFT](../sims/lp1_p05_wordcells76_p55_gp28_source_inverse_sft.cjs). **Decision:** retire this direct two-key additive consumer. The three independently printed lengths provide an interpretable original-input geometry, **without an authenticated direction to combine them**; no unknown plaintext, unique source key or continuation was found. Do not widen the signs, walks, masks or transformations based on this negative.

## Original p55: source-motivated additive consumer and original plaintext decision

The source LP1 p05 text explicitly calls **primes and Euler's totient sacred**. Its newly decoded hidden square contains **25 numbers**. Physical LP2 p55 contains **76 GP29 runes**; its original ciphertext has **three F runes at local positions 15, 25 and 41**. Treating **only position 25** as a transparent, non-key-consuming interrupt and processing the other two normally leaves **75 key-consuming runes**, three passes over 25 table values. The manuscript does not authenticate this one-of-three skip choice. The repeated moth illustration provides an independently authored LP1 p05→LP2 p53/p55 visual relationship, though the art also occurs on p53 and therefore **cannot uniquely select p55**. This specific geometry-and-operand combination was not covered by previous #495's negative using the *different* 5×5 **printed Wisdom 1033 square**.

One fixed, minimal test uses the recovered **third 2014 square**, row-major order, `K_i = φ(table[i mod25]) mod29`, original key-start zero, decryption `P_i=(C_i−K_i) mod29`; ciphertext F at local offset25 is copied transparently and leaves the counter unchanged. The exact original 76-rune output is:

```text
NINAETHJOEAWNTEONHFDSCOEUAEOEDTHTFTHANTFNPTHHGDNGNRBDCEBUWREOIADEAAEUPJBEOMEOMHHJORWSMMGTWOIA
```

The recovered output has **IoC 0.0333333333**, whereas the independently solved source-native p56 ciphertext inverse is **0.0700280112** and clear p57 **0.06270997**. All 76 original runes re-encrypt exactly, and the key has consumed **75** values; the output is not coherent GP29 historical prose or a typed instruction. This rejects **this single fixed historical-square φ transfer**, without ruling out other possible keys, phases, F masks, text registers, or source-selected uses of the hidden historical square. The same [single-file SFT](../sims/lp1_p05_magic_square_nibble_inverse_sft.cjs) tests the full exact historical-square extraction and the frozen p55 original hypothesis. Do not retune this mechanism after its observed failure absent another first-party instruction.

## Original p55: direct non-additive Hill5 inverse from the newly recovered square (bounded negative)

The exact recovered 2014 numerical square offers a further historically plausible **non-additive** use, distinct from the failed totient pad above. Reduce its source-ordered entries modulo the authenticated GP29 modulus and use it as a classical five-rune Hill-cipher block matrix, with ciphertext vectors as columns. The original square is nonsingular: its determinant is **3 mod 29**; no matrix repair, trial permutations, key search or chosen plaintext is required. The original p55 has **76** runes, but its first **NG** belongs to a word carried from p54, leaving a natural **75-rune page-local body**. A second conditional reading takes the ciphertext F at index25 as an interrupt, also leaving 75 key-consuming symbols. The latter one-of-three F skip is a *hypothesis* transferred from solved Cicada ciphers, while the first NG carry is grounded in the printed word boundary. Both give 15 five-rune blocks without arbitrary phase selection.

The exact row-major matrix and its inverse over GF(29) are:

~~~text
M                         M^{-1} mod 29
11 22 22 15  6             23 22 15  2 17
18 25 14  1 18             24 25  4  2 24
23 13  4 13 23             20 28 12 28 20
18  1 14 25 18             24  2  4 25 24
 6 15 22 22 11             17  2 15 22 23
~~~

Applying the fixed inverse \(P_j=M^{-1} C_j\pmod{29}\) independently to each consecutive ciphertext block of five, restoring F at index25, yields this complete original-page candidate:

~~~text
WUEARFRNGWNSOEOOEIALFYAEEAROEOEALWFSUBYPMAEEAJNGAPREAAEDNGOEOEJOEASAITHDUBWNGTHORPTLSTHNJILJEJAAENY
~~~

The stronger, source-attested **75-rune physical-body framing**, excluding the inherited NG and retaining F, gives:

~~~text
LIAAIFNGAESMEADNJOITIXAENSOETEOSUBYPMAEEAJNGAPREAAEDNGOEOEJOEASAITHDUBWNGTHORPTLSTHNJILJEJAAENY
~~~

This independent framing also has coincidence index **0.03855855855855856** and no coherent GP29 source-native prose or readable command. Exact forward multiplication reproduces all 75 original body runes without a skipped F.

The 75 transformed non-F runes have coincidence index **0.03855855855855856**, without coherent source-native prose or a readable command. Exact forward Hill5 multiplication re-encrypts all **75/75** consumed original runes; F is restored unchanged at its original source position. That round-trip is guaranteed by the invertible matrix and **does not authenticate** the key. The historically given other 5×5 square yields another nonprose 75-rune output (IoC **0.02990990990990991**); the 7×7 square cannot consume 75 runes in complete seven-symbol blocks under this same fixed clock, so no further key phase was fitted.

**Decision:** The source-derived 5×5 matrix is genuinely invertible, but the direct, block-aligned Hill5 transfer **does not decipher p55 under either independently delimited 75-rune clock**. The source provides no instruction selecting Hill5 as a consumer or this skip clock. Retire this exact candidate without a fresh source-backed operator. The canonical source-coupled SFT tests the original 76 runes, exact matrix inverse and reencryption.

## Independently proposed historical prime-counting π rule as a frozen 25-cell p55 key

A **separate community-proposed** interpretation of the three 2014 archived squares applies the prime-counting function π to their centers: π(809)=140, π(331)=67, π(91)=24; consecutive differences are **73 and 43**, the authentic GP-prime values of L and P. SECRA's [October 2026 research synthesis](https://secra.tech/research/liber-primus-strongest-findings/) reproduces this exact arithmetic and stresses that no original signed instruction specifies the center/π/difference rule. This observation supplies a concrete reason to test **π**, independently of the already-tested LP1 φ/totient rule. It does not authenticate π as a p55 cipher operation.

Freeze **one** table consumer: map each of the 25 newly recovered LP1 square entries in original row-major order to **π(value) mod29**, repeat the resulting 25-value tape exactly three times over the **true 75-rune body of physical p55** (excluding its inherited first NG), decrypt P_i=(C_i−K_(i mod25)) mod29, and retain every F in-band. The source-derived key is:

~~~text
0 4 10 3 7 14 17 2 8 7 19 24 24 24 19 7 8 2 17 14 7 3 10 4 0
~~~

The complete original 75-rune inverse is:

~~~text
AESFRHOYBWCTEAWUILTSBTFUWAFXGNIAIAEALMEOCFLEAODOENGALCSEXIGIAEEOJUAFDJAEWIAINOJOYNRIAWXI
~~~

Its rune coincidence index is **0.03207207207207208**, with no coherent original-source GP-English or typed instruction. The fixed key re-encrypts all 75 ciphertext runes exactly; this is a reversibility check, not plaintext validation. The existing source-controlled SFT now asserts the three historical prime-counts, 25 frozen key values, complete ciphertext result and exact forward check.

**Decision:** reject this specific historical-square π→additive GP29 direct consumer as a p55 decryption. The underlying three-center LP proposal remains an unverified historical signpost; do not expand it into arbitrary key phases or alternative prime-counting transforms absent new authorial evidence.

## p05 179-byte payload → p53 179-rune stream (bounded direct-key negative)

The hidden p05 center decodes to **179 bytes**, exactly the rune count of LP2 p53. The p05 moth illustration is also repeated on p53 (and p55), making a one-to-one p05→p53 byte/rune alignment a plausible, finite consumer hypothesis. The simplest GP29 interpretation is to reduce each byte of a source-fixed 179-byte p05 representation modulo 29 and use it as an additive stream against the 179 original p53 runes.

Three exact p05 representations were tested: the raw 179-byte decoded payload, the 179-byte nibble-swapped ASCII intermediate, and the final 179-byte digit-reversed square text. First, each was reduced bytewise modulo 29 and applied with both addition and subtraction, without a key skip or fitted phase: **six direct candidates**. Since the p05 prose explicitly names the totient function, a second bounded exploratory family applied **φ(byte) mod 29** to each of the same three representations, again with both signs: **six totient candidates**. The latter is a motivated extension, not a source-authenticated instruction to take totients of arbitrary byte values. None of the **12** outputs yields readable GP29 plaintext. The original p53 IoC is **0.033520**; direct outputs range **0.032892–0.036470**, and totient outputs **0.032704–0.035340**, with no language-like recovery. The original p53 has five literal F runes at local offsets 68, 71, 79, 89 and 166; these one-to-one tests deliberately do not introduce a plaintext-F bypass because the proposed direct alignment already consumes exactly one key byte per rune.

**Decision:** reject the direct bytewise-mod-29 and φ(byte)-mod-29 additive mappings of these three exact p05 representations to p53, under both signs. The 179/179 length match and repeated moth remain a plausible selector, but this result does not test OpenPuff extraction, non-additive operations, transposition, or a separately source-selected key transformation. Do not tune byte offsets or arbitrary maps to rescue the failed direct streams.

## p05 hidden179 → p53 historical XOR consumer (independent non-additive source gate)

The original **p05 LP1 moth illustration recurs on original LP2 p53**, whose complete unaltered body has **179 GP29 runes**. The exact recoverable p05 center also yields **179 binary bytes**. Historical Cicada puzzles visibly used bytewise XOR, making it a limited, concrete non-additive candidate that is distinct from the twelve direct modular/totient **addition** tests above. The original artifact neither instructs this cross-page transfer nor equates GP rune symbols with arbitrary bytes, so the following two **source-fixed** representations are tested separately: each rune's canonical GP ordinal (0–28) and its author-printed GP prime value (2–109).

Use exactly the three independently recovered **179-byte** representations of the p05 payload: original hidden binary bytes (SHA-256 `82c135148b6cf85e9b550afdbc6204be075ff67717356a8ae18b76f9cc3af5fa`); their bytewise nibble-swapped ASCII decimal-and-space stream; and the final token-digit-reversed ASCII decimal square. The hidden center's mirror shell separately motivates both the original left-to-right and entire-reversed read order. Those **2 rune interpretations × 3 fixed p05 byte streams × 2 directional orders = 12** complete, phase-zero, whole-p53 XOR outputs involve no key search, omitted runes, fitted alphabet or new file transform.

| Source-byte operand | Ordinal-GP direct / reversed: ASCII letters in 179 bytes | GP-prime direct / reversed: ASCII letters in 179 bytes |
| --- | ---: | ---: |
| Raw p05 hidden 179 bytes | **15 / 16** | **57 / 58** |
| Nibble-swapped 179-byte ASCII | **0 / 0** | **60 / 58** |
| Token-digit-reversed 179-byte ASCII | **0 / 0** | **60 / 57** |

No candidate yields ordinary readable ASCII prose, a complete GP29-ordinal output, a typed file signature or an identifiable LP2 key. Even the most letter-rich candidate has just **60/179 ASCII alphabetic characters**, scattered among punctuation and nonprinting bytes. The nibble-swapped/ASCII key forms combined with ordinal GP give **zero alphabetic characters**, a decisive counterexample for that particularly direct decoding. All twelve XORs re-encrypt all **179 source runes exactly**; source-native planted solved-p57 GP prose also round-trips **95/95** rune values, which validates XOR arithmetic but cannot authenticate a candidate plaintext. The original center still decodes exactly to the independently archived 2014 square, so this gate is based on the actual original payload, rather than arbitrary numeric material.

**Decision:** reject all twelve fully source-fixed direct XOR interpretations as plain GP29 or ordinary ASCII p53 recovery. This excludes these historical-operation/representation combinations only; XOR against an independently supplied unknown key or an unselected format transformation is out of scope. It supplies no reason to scan pad phases or unrelated byte encodings. [Reproducer and positive checks](../sims/lp1_p05_p53_moth179_xor_original_sft.cjs).

## Research significance

The exact match to a separately attested 2014 magic-square table elevates the central block from unexplained binary to an independently recognized historical puzzle artifact. The 336,353-byte reversed JPEG shell, combined with a nibble-swapped and digit-reversed inner table, establishes **intentional-looking multiple reversal layers** in the original LP1 *SOME WISDOM* image. Authorship of the layering and its ultimate key use remain questions. There is no evidence that this middle table itself is a new private LP2 decryption key, because its recovered numbers match already public 2014 material. The direct next research decision is whether a first-party instruction or a *different* original encrypted artifact consumes this exact table under an unambiguous operator; generic arithmetic searches on the 25 values are unwarranted.

## Reproduction

Run the following from the repository root:

    python sims/lp1_jpeg_mirror_tail_scan.py /path/to/liber-primus-jpegs.zip

The script also accepts an extracted image directory. It reports post-EOI data, maximal mirror-shell lengths, central-block hashes, and whether the central block is ASCII hex. The uploaded archive itself is not copied into the repository. Run `node sims/lp1_p05_magic_square_nibble_inverse_sft.cjs` for the exact independent numerical decoding and reverse-encoding.
