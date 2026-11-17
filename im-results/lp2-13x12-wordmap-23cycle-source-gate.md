# LP2 p0–2: 156-word self-indexed map and unique 23-cycle

**Status: intermediate structural finding. No unknown plaintext, key, cipher, or destination has been recovered.**

## Question and prior observation

The 2016 signed message frames words as a map, their meanings as a road, and their numbers as directions. An external 27×27 proposal already observed that the canonical p0–2 transcription contains 158 complete words and that removing the two red heading words leaves 156=13×12. This report does **not** claim that factorization as new. See the external [strongest-plaintext-evidence note](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/main/Start-reading-here/strongest-plaintext-evidence.md).

The dimensions have plausible selectors: the red heading contains 13 runes, while LP1 p05 explicitly elevates the totient function, and φ(13)=12. The new test is whether the 156 body words form a source-indexed pointer map.

## Reproducible construction

Inputs: `resources/lp2-transcription.txt`, `resources/liber-primus/lp2-corpus.json`, and canonical parser `sims/lp2_word_pages.cjs`.

Run from repository root:

```sh
node sims/lp2_13x12_wordmap_23cycle_source_gate.cjs
```

The script parses the first three physical page segments using the repository's canonical word parser. It returns 158 complete words and 729 runes. The first two words are the red heading; their combined rune count is 13. Removing those two words leaves 156 body words. For each word w_i, calculate its Gematria Primus prime sum S_i using the corpus `prime` array, and define the zero-based pointer:

`f(i) = S_i mod 156`.

The two heading words seed the map using the same rule:

| Heading word | GP prime sum | Zero-based seed | One-based body-word cell |
|---|---:|---:|---:|
| first red word | 347 | 35 | 36 |
| second red word | 315 | 3 | 4 |

The first seed follows **36 → 56 → 113 → 6**, then enters a 23-cycle. The second seed, cell 4, lies directly on that same cycle. The complete functional graph has exactly two cycles, of lengths **23** and **2**. The 23-cycle is unique.

The cycle, rotated to the entry reached by the first red heading word, is:

| Cycle step | Body-word cell (1-based) | GP prime sum |
|---:|---:|---:|
| 1 | 6 | 220 |
| 2 | 65 | 111 |
| 3 | 112 | 34 |
| 4 | 35 | 336 |
| 5 | 25 | 119 |
| 6 | 120 | 3 |
| 7 | 4 | 563 |
| 8 | 96 | 170 |
| 9 | 15 | 67 |
| 10 | 68 | 209 |
| 11 | 54 | 463 |
| 12 | 152 | 108 |
| 13 | 109 | 244 |
| 14 | 89 | 569 |
| 15 | 102 | 128 |
| 16 | 129 | 237 |
| 17 | 82 | 323 |
| 18 | 12 | 618 |
| 19 | 151 | 277 |
| 20 | 122 | 419 |
| 21 | 108 | 139 |
| 22 | 140 | 143 |
| 23 | 144 | 473 |

The body words with sums **563** and **569** are each unique in the 156-word map, and both lie in this cycle. They occur at cycle steps 7 and 14. The 563 word is also the second red heading word's seed cell.

## Independent source correspondences

- The p57 original-image census records the manuscript's red 23-dot mark; the p57 text also explicitly invokes shedding circumferences. This is a plausible selector for the unique 23-cycle, not proof that the creator intended this graph. See `im-results/lp2-original-dot-punctuation-physical-census.md` and `im-results/lp2-p57-literal-word-circumference.md`.
- The 2016 signed image is 563×569. The independently examined p32 11×11 rune grid has top-row and first-column GP-prime sums 563 and 569. The p32 tree artwork is **not** the same artwork as the signed 2016 image; this is a numerical correspondence, not an image-identity claim. See `im-results/lp2-tree121-signed2016-source-gate.md`.
- As a further, unvalidated direct lookup, 563 mod 121 = 79 and 569 mod 121 = 85 select zero-based p32 cells 79 and 85 (one-based cells 80 and 86), whose transliterations are H and S. This is a possible bridge, not plaintext.
- A full 22-axis p32 prime-sum check yields a third exact 23-cycle intersection: **p32 column 7** (zero-based column6) sums to **463**, matching cycle step11 and original p0–2 body word54. However, the fourth candidate 2013-DH value **499** (p32 column11) occurs **nowhere** among the original 156 p0–2 body-word sums, including the separate two-cycle. This blocks the appealing stronger theory that the complete prior exploratory p32 DH tuple `(563,569,463,499)` is carried as word-prime sums by the opening pointer map. The three numeric correspondences are source-exact and their intended role is still unproved; without 499 and a first-party receiver, no DH value or key is recovered. [Existing exploratory p32-DH report](p32-dh-image-dimensions-parameter-test.md).

## Permutation diagnostic

A deterministic 1,000,000-trial null shuffles the 156 body-word prime sums **within their original starting-page groups** (sizes 57, 62, 37), preserving each page's sum multiset and the two red-heading seeds. Only **93 / 1,000,000** shuffled orderings produce both (a) the two seeds reaching the same 23-cycle and (b) both unique values 563 and 569 lying on that cycle.

This is a targeted permutation diagnostic, **not** a globally corrected p-value. It does not account for searching other moduli, pointer rules, map sizes, or other numerical correspondences. The 13×12 count was already public prior work; the new evidence is the particular prime-sum pointer graph and its source-linked cycle.

## Original full-cycle compass continuation: stopped by missing instructions (Agent25, 17 November 2026)

The numerical pointer cycle itself remains exact. The **optional** p50→p32 compass continuation, however, has no author-selected direction-bit allocation, initial cell or stopping rule. The signed January 2016 message says that words, meanings and numbers supply map/road/direction; its image contains signed text over a faint tree. The archived source record documents that the 2016 image's leafless tree and the p32 blurred tree are **different stock artwork**, and the printed p32 page is not an 11×11 diagram. The 121-ciphertext-rune square and toroidal addressing are reconstructed conventions. No first-party source selects `sum mod256`, `byte & 7` as compass direction, `byte >> 3` as distance, N-first clockwise directions, toroidal wrap, or p32 H as the entry. The 32×8 native p50 table shape makes a five-bit/three-bit interpretation conceivable but supplies neither compass orientation nor a decoding instruction.

The previously published prototype in [the original self-indexed-map SFT](../sims/lp2_13x12_wordmap_23cycle_source_gate.cjs) uses that one explicit convention, starting from p32 zero-based cell33 (H). **Inspect the whole 23-step original route**, without stopping retrospectively on the midpoint X:

| Step | Source word GP prime sum | p50 address0 | p50 byte | p32 cell0 | Read rune |
|---:|---:|---:|---:|---:|---|
| 1 | 220 | 220 | 58 | 40 | S |
| 2 | 111 | 111 | 115 | 76 | W |
| 3 | 34 | 34 | 197 | 96 | S |
| 4 | 336 | 80 | 142 | 90 | NG |
| 5 | 119 | 119 | 184 | 79 | H |
| 6 | 3 | 3 | 186 | 80 | EO |
| 7 | 563 | 51 | 59 | 43 | D |
| 8 | 170 | 170 | 254 | 34 | O |
| 9 | 67 | 67 | 192 | 12 | W |
| 10 | 209 | 209 | 175 | 24 | B |
| 11 | 463 | 207 | 21 | 44 | NG |
| 12 | 108 | 108 | 14 | 54 | X |
| 13 | 244 | 244 | 22 | 52 | N |
| 14 | 569 | 57 | 118 | 49 | A |
| 15 | 128 | 128 | 201 | 19 | IA |
| 16 | 237 | 237 | 32 | 96 | S |
| 17 | 323 | 67 | 192 | 74 | H |
| 18 | 618 | 106 | 31 | 38 | W |
| 19 | 277 | 21 | 137 | 88 | T |
| 20 | 419 | 163 | 82 | 98 | J |
| 21 | 139 | 139 | 13 | 108 | L |
| 22 | 143 | 143 | 152 | 20 | OE |
| 23 | 473 | 217 | 219 | 69 | IA |
The resulting GP transliteration is `S W S NG H EO D O W B NG X N A IA S H W T J L OE IA`; it contains no complete typed instruction, address or plausible key. The sole encountered X is the already-known step12 p32 cell54, not the original contiguous HOME-X endpoint at cell37. The full traversal ends on **p32 cell69 = IA**, not X.

**New algebraic discriminator: the apparent two-red-heading endpoint agreement is automatic.** The step transition is addition of a vector `v_i = (dr_i, dc_i) × (byte_i >>3)` in the abelian torus `(Z/11Z)^2`. For the 23 unchanged source words, the integer displacement sums are exactly `(-85,+14)`, hence `(+3,+3) mod11`. From p32 H at zero-based cell33 = row3,col0, **every** permutation of the 23 steps must finish at row6,col3 = cell69, including the other authentic red heading's **cycle-step7** entry. Indeed that second start rotates the same sums six places and gives route runes `A B B A C IA U AE B A T U N D X U TH F B S H X IA`; its step12 is U at p32 cell112, yet its step23 is the same IA at cell69. The shared endpoint is a mathematical invariant of toroidal vector addition and **cannot serve as an independent manuscript prediction**.

The midpoint X is a retrospective stop choice (the other red heading's step12 is not X) and one of five X glyphs in p32's 121 original runes. The preceding 93/1,000,000 null result was conditional on the separately chosen 23-cycle/563/569 features and does not turn the multi-hop compass semantics into authored instructions.

**Decision for Director #1361:** retire the conjectural **23-cycle→p50 byte bit-split→toroidal p32 compass** *decoder* absent a new independently dated first-party compass opcode or predeclared destination test. Preserve the exact opening 23-cycle and 563/569 checksums separately, with their explicit retrospective selection limits. A second red heading, reordering the commutative steps or stopping at an attractive intermediate X supplies no additional cryptographic evidence. No unknown plaintext or key has been recovered.

## Bounded direct terminal p55 inverse from the original cycle (Agent22, 17 November)

The opening red heading's GP-prime-sum rule yields 23 cyclic *body-word prime sums*:

```text
220,111,34,336,119,3,563,170,67,209,463,108,244,569,128,237,323,618,277,419,139,143,473
```

There is a simple direct key consumer that does not require the exploratory p50 compass or a hidden alphabet: the authentic known p56 GP29 additive rule and transparent plaintext-F. Take **each one of the 23 word sums modulo 29** to obtain exactly 23 GP key symbols. Repeat them against the **76 original p55 ciphertext runes** in their printed order. Try the two independently headed starts: the first red word enters the 23-cycle at body cell6; the second red word starts at body cell4, step7 of that same cycle (zero-based key rotation6). Both documented GP addition signs are finite controls, giving **four** entire original-cipher key/operation decisions. No fitted key phase, table offset, phrase or trigram screen determines the key.

The F-transparent inverse retains every legal state: plaintext F must emit ciphertext F **without consuming** the next key symbol, while ciphertext F may also be an encrypted non-F rune and consume a key. This is stricter than ordinary GP29 addition and captures all eight possible transparent/consumed choices for the three p55 ciphertext Fs.

| Author-derived cycle starting point | GP inverse sign | Earliest F-rule contradiction at zero-based p55 rune | Full legal inverse paths | Direct no-bypass GP IoC |
| --- | --- | ---: | ---: | ---: |
| First red heading, 23-cycle entry | Subtract | none | 1 | 0.03438596 |
| First red heading, 23-cycle entry | Add | **6** | 0 | 0.04035088 |
| Second red heading, cycle step7 | Subtract | **1** | 0 | 0.03298246 |
| Second red heading, cycle step7 | Add | **6** | 0 | 0.03087719 |

The sole fully legal candidate (first-heading, subtraction) consumes **74** of the cyclic key symbols. Its 76-rune recovered GP-index stream has IoC **0.03543860**, near the uniform-ciphertext baseline, and reads in unpunctuated native GP transliteration:

```text
RUXOEREOCEINPXJPPFOELHEBPGHJCNOETIAOEBEASNGLWYJOENFHNGEAJXNJDCEJOOOEGGOIGYMBUMDGJTXDGEOUW
```

This is no coherent GP-native original plaintext. Its **exact forward reencryption** is expected for any legal wrong key and is verified, so a round trip is not evidence of a solution. A separate genuine solved-p57 **76-rune plaintext** is planted with each exact key/sign and recovered among all legal inverse states in **4/4** source-native positive controls. The test operates on all 76 original p55 runes, reproduces the 729-rune 158-word first-three-page parse, red word sums347/315, 156-word pointer rule, both original cycle starts, all printed F positions and its fixed sign decisions.

### A second, image-dimension-anchored 23-rune receiver

The source graph's **563** and **569** word-prime sums occur at cycle steps 7 and14. They independently equal the GP-prime sum of the **top row and left column**, respectively, of the original **11×11 p32 rune grid**. These also match the 563×569 dimensions of Cicada's 2016 signed image, a numerical correspondence recognized before this receiver was constructed. Consequently a human-visible alternative to using each 23-cycle sum directly as a GP shift is to take its remainder modulo **121** as an address in the original p32 grid, collecting **23 ciphertext rune indices** as a possible key. This original first-three-page→p32 chain is an *inferred source operation*; neither the original image nor the signed text explicitly says to use a modulo121 lookup or p55 receiver.

The only address convention controls are **zero-based remainder** `S mod121` and **one-based cell count** `(S−1) mod121`. For each, use the first or second red heading's exact starting cycle step, both arithmetic signs, the same authentic p56 transparent-plaintext-F rule, all p55 F branches, and no key fitting. This is **eight** source-fixed, full-76-rune exact inverse tests; all eight separately recover a 76-rune planted solved-p57 passage under their matching key and sign.

| p32 address count | 23-cycle start | GP inverse | First impossible original p55 rune (zero-based) | Full legal paths |
| --- | --- | --- | ---: | ---: |
| Zero-based | first heading | subtract | 37 | 0 |
| Zero-based | first heading | add | 67 | 0 |
| Zero-based | second heading | subtract | 65 | 0 |
| Zero-based | second heading | add | 0 | 0 |
| One-based | first heading | subtract | 56 | 0 |
| One-based | first heading | add | none | **1** |
| One-based | second heading | subtract | 10 | 0 |
| One-based | second heading | add | 24 | 0 |

The one surviving **one-based/first-heading/add** inverse is entirely legal and reencrypts to the unmodified original, but reads as incoherent GP transliteration:

```text
OEAIAIAPJECCBJWAEPNJITHLNGMXEAEATHFOEIAAEYGRDDMPNGYWNAEFAJEADMPINGEDLTHTNUXUOLYSRBGPGDNGEOERAEGT
```

Its legality is an expected property of a possible wrong additive key, not confirmation of the rule.

**Decision:** Both direct source-cycle candidates and the additional p32-addressed source-cycle key fail to recover p55 plaintext. Across **twelve** complete source-fixed inverse/sign/address cases, **two** are fully syntactically legal under the authenticated F rule, and neither is readable GP prose. This retires the specific 23-period direct key and zero/one-based p32 lookup consumers, while preserving the original 23-cycle observation as a provisional possible key source. Further arbitrary rotations and compound transforms need a fresh author-authenticated clue. [Node22 original-input SFT](../sims/lp2_wordmap23_cycle_p55_native_inverse_sft.cjs) · [Windows original-source workflow](https://github.com/FlareZ123/liber-primus/actions/runs/44086567597) (previous 4-case revision queued) · [later 12-case workflow](https://github.com/FlareZ123/liber-primus/actions/workflows/agent22-prime-even-rune-original-manual.yml) (manual dispatch queued; verify final result before treating as CI-passed).

## Literal p57 PARABLE "within" receiver on the 23 original cycle words (Agent45, 17 November)

A new, *nonarithmetical* consumer of the original word cycle is motivated by the authentic clear p57 instruction to **shed circumferences and find what lies within**. The 23-cycle already fixes the *exact* p0–2 body-word positions and their order. Take their printed GP29 runes unchanged. A word's circumference is its first and last rune, so one literal operation removes those endpoints and concatenates the remaining runes of the 23 cycle words in cycle order. An alternative literal "within" reading selects the central rune of each word; even-length words have two noninterchangeable central choices. No added keystream, word regrouping, symbol substitution, direction sweep, recovered spacing or tuned key phase is permitted.

All **23** cycle words total **119 original runes** and have lengths
`[4,2,2,8,5,1,11,3,3,3,9,2,5,10,2,7,6,11,3,7,3,3,9]`. Exactly **five** words have length one or two and contribute no runes after removal of both endpoints, leaving **74** inner runes. The unspaced, exact source-GP transliteration of the 74 is:

```text
BNGMJROLTHJIEWBASOEEOINGDOSOEWEAOELFEJEAFINIACYEAIXBGJPFSEOAEPTFPUNGYNGXEAEOLDHBYWCLWEADUD
```

The two independently declared 23-rune centre readouts are:

```text
Left of centre for even lengths:
BFHJJUSDOSEAOJIAEAGSUEADYWEA
Right of centre for even lengths:
NEARRJUSDOSEAAEJCWGEOUEADYWEA
```

No complete readable instruction or authentic plaintext emerges. The [read-only source-native CommonJS SFT](../sims/lp2_wordmap23_parable_within_sft.cjs) asserts the 158 original words, 729 rune positions, 347/315 heading sums, exact 23-cycle, all 119 rune sources and the 74/23/23 strings. Three planted native GP29 clear-p57 controls recover the chosen within/centre symbols exactly. They confirm the extraction semantics, **not** a historical encryption mechanism.

**Decision:** this directly tests the literal source-suggested word-interior receiver without adding arbitrary key hypotheses. It is a bounded negative for the **23-cycle → within-word instruction** route. The numerical 23-cycle and 563/569 correspondences survive as structural observations; they remain without a source-authenticated plaintext consumer. Do not introduce an unmotivated reordering or second cipher to rescue these outputs.

## Natural full-word running-key use of the same cycle (Agent36, 17 November)

The preceding 23-number candidate uses each visited word's *sum* as a single key symbol. A materially distinct, human-readable interpretation takes the **runic contents of every visited word**, concatenated in source-selected cycle order, as an ordinary running key. The 23 original body words contain **119 complete GP29 runes**, enough to key the entire original **76-rune p55** terminal once without repetitions, numeric table selection, or any outside key. The two opening red headings fix exactly two starting words: first red → cycle body cell6, or second red → cycle body cell4 (step7). The historic solved-p56 GP29 plaintext-F-transparent additive rule gives exactly two algebraic signs. No arbitrary rotations, word reordering, reverse reads, or optimized starts are included.

The exact DP preserves both interpretations of any *ciphertext* F, while a *plaintext* F must pass transparently without consuming a key rune. The four complete original p55 inversions are all mathematically impossible:

| Start selected by red word | Inverse sign | First zero-based contradiction on original p55 | Complete legal plaintext paths |
| --- | --- | ---: | ---: |
| First heading, cell6 | Subtract | **65** | **0** |
| First heading, cell6 | Add | **0** | **0** |
| Second heading, cell4 | Subtract | **5** | **0** |
| Second heading, cell4 | Add | **8** | **0** |

Each of the four same-length independent source-native 76-rune plaintext controls, drawn from original clear p57 and encrypted under the frozen key/sign and genuine F rule, has an exact legal inverse recovering the plant. The full 119-symbol literal concatenation therefore supplies **no unknown p55 plaintext**, even before GP-English scoring; this excludes only its transfer through the specified authentic F-transparent operation. The 23-cycle itself remains a provisional navigational observation. [Full source-native CJS with all 76 original runes and complete forward planted controls](../sims/lp2_wordmap23_concat_runningkey_p55_native_gate.cjs) · [manual Node22 run 44090292401](https://github.com/FlareZ123/liber-primus/actions/runs/44090292401) (queued on dispatch; check conclusion before calling CI passed).

## Direct 23-cycle key against original p32 (Agent44, 17 November)

The 23-cycle supplies a compact candidate GP29 key by reducing each cycle word's prime sum modulo 29. Page p32 is a reasonable independent target to test: its original 121-rune block has previously been reflowed 11×11 for the 563/569 axis-sum study, and the original page image visibly begins its fourth text line with the transliterated sequence HOMEX at zero-based rune offset 33. The exact original p32 JPEG is resources/liber-primus/49.jpg, SHA256 c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72.

I tested the fixed 23-symbol key under both source-derived starts (first red heading at cycle entry; second red heading at cycle step 7, a six-place rotation), both additive signs, and two spans: all 121 p32 runes, and the 88-rune suffix beginning at the H of HOMEX. The decoder exhaustively branches at each ciphertext F between literal plaintext F/no key consumption and encrypted non-F/key consumption, preserving the authentic p56 transparent-F rule.

| Span | Key start | Inverse | Earliest illegal plaintext-F contradiction (zero-based) | Full legal paths |
| --- | --- | --- | ---: | ---: |
| Full p32 (121) | First heading | P=C-K | 71 (C=A, K=A) | 0 |
| Full p32 (121) | First heading | P=C+K | 11 (C=H, K=NG) | 0 |
| Full p32 (121) | Second heading | P=C-K | 62 (C=IA, K=IA) | 0 |
| Full p32 (121) | Second heading | P=C+K | 93 (C=B, K=EO) | 0 |
| H-start suffix (88) | First heading | P=C-K | 13 (global p32 offset 46; C=EO, K=EO) | 0 |
| H-start suffix (88) | First heading | P=C+K | 8 (global offset 41; C=L, K=N) | 0 |
| H-start suffix (88) | Second heading | P=C-K | 40 (global offset 73; C=B, K=B) | 0 |
| H-start suffix (88) | Second heading | P=C+K | none | **1** |

The sole surviving H-start suffix inverse consumes all 88 key symbols and forward-reenciphers all 88 original runes, as any legal candidate should. Its output is:

    LEAEAAPEAGROCIAURAENGERAEXPBMNSSHGGILMOEMPUJHOEICORAARLHURIAOIATHXNGYUMOJEAOOEOTTWAEUCEPCOEOPSTHCAETAIOESCW

It has no readable GP prose; its IoC is **0.0350052247**, versus **0.0316091954** for the original suffix and **0.0627099664** for clear p57. The synthetic 121-rune positive control, including transparent F symbols, recovers exactly under the same DP and forward encoder.

**Decision:** The direct repeated 23-cycle GP29 additive key does not decrypt p32 under either source-derived start or sign. Full p32 has no legal full-span F-transparent inverse in all four cases; the visually motivated H-start suffix has one syntactically legal but nonlinguistic wrong-key inverse. This is a bounded rejection of this direct p32 key consumer, not a test of the separate p50 compass walk and not a rejection of the 23-cycle's possible non-additive or navigation role. Do not add arbitrary rotations, offsets or key transformations.

[Source-native reproducer](../sims/lp2_wordmap23_cycle_p32_direct_key_gate.cjs).

## Weakest premise and next decisive work

The core pointer graph's weakest step remains the unselected **`GPPrimeSum(word) mod156`** index rule. The additional **p50 compass continuation is now retired**: it depends on unselected byte and coordinate conventions, the full 23-step readout is nonlinguistic, and both red headings necessarily have the same toroidal endpoint regardless of order. The 2016 and p32 trees are distinct stock assets, and no printed 11×11 p32 square or compass instructions select this navigation.

Useful independent progress would be an authentic Cicada-authored source selecting the word-pointer modulus or a new reversible consumption of the 23 words, with an original untouched-page plaintext prediction and exact re-encryption. Do not repeat the already-completed direct 23-key/F-transparent p55 inverses, 1,000,000-cycle shuffle or failed compass search. The exact 23-cycle itself remains a provisional source-structured finding, not a recovered solution.
