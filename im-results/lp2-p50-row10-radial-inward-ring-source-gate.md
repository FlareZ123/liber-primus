# Physical p50 first-cell entry into the 32×8 rings: a bounded original-cipher test

**Decision, 13 November 2026 (Agent22).** The previously documented 2014/2016 word-map candidate points to the **first table token on physical p50**, global cell80, original grid **row10 column0**, token `2M` (base60 byte142). This cell lies on the outer circumference of the actual **32×8** numerical table. Continuing radially inward from that **same row10** provides a new, geometrically concrete candidate for the four shell origins. Its simplest deterministic table-byte→rune interpretations fail on the **180 actually solved terminal GP runes**, even allowing an arbitrary secret codebook. No unknown p55 plaintext, key, author-selected rule, or destination is recovered.

## Independent inputs and the newly specified traversal

The known *conditional* page/word rule `N→page N mod 58, word floor(N/58)→GP prime sum` sends original **2014** HTML div-id `331→68→50` and **2016** signed-image height `569→374→50`. Both arrive at physical p50's first token, global grid cell80. The independent 2014 title `133` and 2016 width `563` instead join the separately documented **33-word graph cycle**. This numerical/navigation relation has already been preserved in [the conditional word-map report](lp2-2016-dimensions-base58-33cycle-table-entry.md); it is not a new independent authentication of that unproved rule.

The new geometric observation is that `p50:w0` is table **(row10,col0)**, a *perimeter* cell, whereas the same original grid's concentric shell lengths are **76, 68, 60 and 52**. The last pages contain **p55 76 unknown runes**, **p56 85 solved encrypted runes** and **p57 95 solved clear runes**, totaling 256. Original solved p57's last **52** runes begin at printed **SHED** and exactly occupy the deepest proposed shell by count, as established earlier in [the terminal-ring report](lp2-terminal256-knowninterior-ring-gate.md).

Under the candidate reader instruction **"start at p50's indexed perimeter cell and shed each circumference in turn"**, define each rectangular shell by printed 32×8 coordinates, retain all its cells once, and choose the following four source-visible starts:

| Shell depth | Start (zero-based row,col) | Number of cells | Proposed terminal text |
| ---: | --- | ---: | --- |
| 0 | (10,0) | 76 | p55 |
| 1 | (10,1) | 68 | p56 first68 |
| 2 | (10,2) | 60 | p56 last17 + p57 first43 |
| 3 | (10,3) | 52 | p57 SHED...EMERGE |

Either clockwise or counterclockwise traverse each ring from that fixed start. This is a **complete permutation of all 256 original table cells**. The origin is independent of any target ciphertext or language score. **Missing instruction:** neither the historical HTML nor 2016 signed text explicitly selects the page/word quotient grammar, the radial continuation, ring orientation, or the mapping from base60 bytes to plaintext. The 2016 oak is **different source artwork** from the original LP2 p32/p55 Commons tree ([corrected source report](cicada2016-oak-stock-intrinsic-size-gate.md)); do not rely on an identical-tree premise.

## Frozen original-input known-plaintext gate

Use source-original `resources/liber-primus/base60-grid.json` and `lp2-corpus.json`. Interpret the byte values exactly as the repo's **conditional base60** interpretation. Recover p56's **85/85** genuine GP runes using the historically solved phi(prime) key (counter starts at prime2, subtraction mod29, with only the **literal plaintext F at p56 local56** skipping the key). Concatenate those 85 with original p57's 95 GP runes. This provides 180 fixed genuine known-rune labels for the three interior shells. The unsolved p55 rune values are **never used** to select the path or codebook.

For each of the two fixed paths, first test direct `plaintext = tableByte mod29`. Then grant the strongest feasible static rule: **every distinct raw 0..255 table byte receives an entirely arbitrary, secret GP29 output label**, with no injectivity requirement. For each byte value, retain its most frequent authentic known-rune label; the sum of those maxima is the exact maximum number of inner-shell positions that **any** deterministic byte→rune codebook can satisfy. A still stricter variant requires a static mapping from the 29 `byte mod29` residues. These maxima are proved combinatorially, with no secret-key search or language-model fit.

| Fixed source direction | Direct raw byte mod29 | Best arbitrary raw-byte→GP29 codebook | Best arbitrary mod29-residue→GP29 codebook | Conflicted raw-byte classes |
| --- | ---: | ---: | ---: | ---: |
| Clockwise | **9/180** | **133/180**, at least **47 errors** | **53/180**, at least127 errors | 36 |
| Counterclockwise | **5/180** | **131/180**, at least **49 errors** | **52/180**, at least128 errors | 37 |

There are **127 distinct input bytes** in either 180-position interior sequence; **53** observations revisit an already seen byte. The conflicting classes disprove every static raw-byte→rune codebook within each frozen orientation, regardless of its arbitrary secret mapping. A **fully planted GP29 source-native positive** made with `P=byte mod29` obtains **180/180** under the same upper-bound algorithm in both directions. The 256-cell ring paths are explicitly asserted to visit every source table cell exactly once, and the p56 authentic plaintext is checked against the full independently known wording.

## A stronger test: arbitrary independent secret codebooks on each inner shell

A genuine reading of **"shed circumferences"** might demand a changing cipher at every ring boundary, invalidating a *single* static 256-byte codebook. Give **each of the three known-text interior rings its own completely unrestricted secret deterministic map** `byte (0..255) → native GP29 rune`, so no constraint whatsoever is shared between different ring depths. This allows any independently chosen mapping for all 256 possible byte values on each ring, and requires only that repeated input bytes **within the same ring** produce the same known rune.

The source-original intra-ring collisions still force the following minimum label mismatches independently of all hidden keys:

| Source-pointed orientation | Ring1: 68 known runes | Ring2: 60 known runes | Ring3: 52 known runes | Unavoidable errors across solved 180 |
| --- | ---: | ---: | ---: | ---: |
| Clockwise from row10 | **7** | **7** | **7** | **21** |
| Counterclockwise from row10 | **8** | **6** | **5** | **19** |

A separate arbitrary secret map on `byte mod29` residues also fails each ring, with **36/34/28** necessary changes clockwise and **32/32/25** counterclockwise. The raw-byte model is more permissive because it distinguishes all printed byte values. These exact bounds allow the mapper to select its best label per byte *after seeing the entire solved passage*, so the impossibility is independent of any undiscovered secret static codebook. A genuine encryption requiring **additional changing position/history state, multiple-byte framing, or a separate terminal-page encoding** remains possible. The original artwork does not specify such a rule.

This strengthens the previous single-secret-table bound of at least47/49 errors while respecting independently visible shell boundaries. It is a *finite model exclusion*, not a plaintext or historical decoder.

## Direct outer-ring attack on the actual 76 unknown p55 runes

The stronger author-facing question is whether the **76 original exterior bytes themselves decrypt the actual p55 source ciphertext**, rather than whether the separately coded p56/p57 inner pages resemble a table map. Freeze exactly the row10 inward path above and the byte-to-GP29 arithmetic used by the authentic solved-p56 additive cipher: `P[i] = C55[i] ± (exteriorByte[i] mod29)`, consuming all **76** source runes, including the original NG that completes p54's last word. Allow only the **two geometrically fixed directions** and the **two GP29 additive signs**, without a selected shift, starting offset, skip mask, byte re-encoding or post hoc transposition.

| Exterior path | GP29 inverse sign | IoC of all76 original output runes |
| --- | --- | ---: |
| Clockwise from (10,0) | subtract | **0.03157895** |
| Clockwise from (10,0) | add | **0.03824561** |
| Counterclockwise from (10,0) | subtract | **0.03403509** |
| Counterclockwise from (10,0) | add | **0.03368421** |

The original p55 ciphertext IoC is **0.03789474**. None of the four frozen outputs is a coherent GP-native instruction or prose; the best index by the weak short-sample IoC criterion remains near the source ciphertext. The most favorable four-case IoC is still **0.03824561**. The first 40 symbols of every output are printed by the SFT for transparent inspection. The counterclockwise/subtract output contains the incidental trigram `W-A-Y` **inside** the thirteen-rune source word, rather than at original printed word boundaries. It is not a source-authenticated plaintext claim. An independent source-native plant of the first **76** solved p57 GP runes, encrypted and decrypted under each frozen exterior key, recovers **76/76**; this establishes reversible implementation.

This exact **outer-ring additive pad** therefore yields no original plaintext evidence. The source-table ring start and its 2014/2016 navigation rationale remain a *conditional hypothesis*, and no additional table rotations or key families are warranted without an independently attributable cipher instruction.

## Authentic plaintext-F bypass on the same exterior key

The solved p56 prime-totient cipher has an important authentic exception: a **plaintext F** is emitted as literal ciphertext F **without advancing the key**, but a ciphertext F may also come from ordinary encryption of a different rune. Rather than silently forbid that exception, the source-pointed p55 exterior-key candidate was also tested against its *full, exact rule*. The unchanged original p55 has ciphertext Fs at physical offsets **15,25,41**, yielding exactly eight possible skip masks for each direction/sign. A non-skipped ciphertext rune must decode to a non-F plaintext rune. Test all **32** fixed possibilities with the key counter advancing only on encrypted runes.

| Original exterior direction | Sign | Feasible literal-F masks / 8 | Most complete native-English lexicon words / 16 |
| --- | --- | ---: | ---: |
| Clockwise | subtract | **3** | **0** |
| Clockwise | add | **4** | **4** |
| Counterclockwise | subtract | **0** | **0** |
| Counterclockwise | add | **1** | **0** |

Use the independently pre-existing **29,058-word native GP29 TextBlob English lexicon** from `resources/control/english_wordfreq_textblob.txt`, plus **the 16 actual complete p55 printed word boundaries** after its one-rune page carry. The strongest seven-or-fewer feasible original variants in fact have **zero** complete lexicon words except the clockwise/additive candidate, whose four apparent matches are the short two-rune spellings **WA, AN, EM, UT**. Its remaining twelve words, including every longer one, are unrecognized, and its complete 75-rune body is nonlinguistic. No arbitrary candidate word segmentation was allowed, and no mask yields a coherent native prose passage. A separate 76-rune solved-p57 plant passes exact forward and reverse encryption under every source-directed sign with the genuine F bypass.

This test is specific to the exact **p56-style plaintext-F transparent additive encoder, table-byte mod29 clock and row10 sourced ring order**. It does not establish whether p55 historically used the same cipher or a different one. In particular, four short lexicon hits from an 8-mask choice are not evidence of plaintext, and a raw ciphertext F should never be automatically declared literal.

## Nonperiodic table-byte prime-index/totient key on the same p55 ring

A second historically motivated direct consumer uses **three authentic operations that a contemporary solver could recognize**: p15's exact `prime(index+1)` construction, solved p56's `phi(prime)=prime−1` key and the p57-inspired ring. Freeze the outer shell's printed base60 byte `B_i∈0..255` as a **zero-based prime ordinal**, and the local key `K_i = (prime(B_i+1)−1) mod29`. This consumes one source byte for each of p55's 76 ciphertext runes in the exact row10 clockwise/counterclockwise order. The **first byte 142** gives `prime(143)−1=822`, or `10 mod29`. No numeral or cryptographic coefficient was fitted to plaintext.

**Missing source instruction:** p15 applies the prime-index function specifically to Fibonacci values; the manuscript never instructs a solver to reuse that function on every p50 table byte. The composition is therefore a source-grounded *hypothesis*, not an authenticated original cipher.

| Outer-ring origin | GP29 additive sign | 76-rune direct-inverse IoC | Valid full original plaintext-F masks / 8 | Maximum recognized complete English words / 16 |
| --- | --- | ---: | ---: | ---: |
| Clockwise | subtract | **0.03368421** | **1** | **2** |
| Clockwise | add | **0.03298246** | **0** | **0** |
| Counterclockwise | subtract | **0.02771930** | **0** | **0** |
| Counterclockwise | add | **0.03438596** | **0** | **0** |

The sole valid dynamic-key candidate (clockwise/subtract, **zero literal-F skips**) produces unreadable GP words; its two lexicon matches are short, and no long-word continuation exists. The same source-native 76-rune solved-p57 positive plant reproduces exactly under the prime-index/totient key and true literal-F rule in both directions and signs. This is a targeted negative against the **specific natural `B→prime(B+1)−1` inverse** on source row10's complete exterior, with no new unknown plaintext or key.

## Scope and next decision

This rejects a direct **static mapping from source-table bytes to the native solved p56/p57 GP29 register** under both source-pointed inward ring directions. It does **not** reject keyed changing-state transforms, a different unknown intermediate register, page-specific ciphers, non-base60 byte readings, or the possibility that p56 and p57 were never meant to share one table transform. In fact p56 has its own solved additive cipher, while p57 is cleartext, making that last objection substantial.

The source-informed **row10 radial start** is a new constrained path that may be useful **only if** an independent original clue specifies what operation consumes successive cells, and how differently encoded pages are handled. Direct byte codebooks are not that missing operation. Further orientation/offset sweeps would erase the clue constraint and should not be inferred from this result.

[Read-only CommonJS SFT](../sims/lp2_p50_row10_inward_rings_sft.cjs) implements both exact 256-cell permutations, original solved-p56 regression, finite secret-codebook maxima and planted native-GP control. The same computations were executed on the live original GitHub JSON sources in the connected JavaScript runtime on 13 November 2026. This is an **intermediate conditional exclusion**, and the authoritative [overall research synthesis](../results/README.md) still reports no recovered unknown LP2 plaintext.
