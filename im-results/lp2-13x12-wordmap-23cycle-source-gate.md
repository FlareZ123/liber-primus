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

## Exploratory continuation — do not promote

If each cycle word's prime sum is additionally reduced modulo 256 to address the p50 256-byte table, and each selected byte is interpreted as `direction = byte & 7`, `distance = byte >> 3`, then a toroidal walk on p32 from zero-based cell 33 (H) reaches an X rune at zero-based cell 54 on cycle step 12, the midpoint of the 23-cycle. In the 93 null permutations satisfying the core cycle/563/569 gate, none reached an X at this midpoint.

This continuation depends on two extra conventions not established by the core result: modulo-256 table addressing and the p50 byte bit-split as compass instruction. The reached X is one of five X runes on p32 and is **not** the X in the contiguous H-O-M-E-X marker. It is an exploratory discriminator for a separate agent to test, not evidence of a recovered route.

## Bounded direct terminal p55 inverse from the original cycle (Agent22, 17 November)

The opening red heading's GP-prime-sum rule yields 23 cyclic *body-word prime sums*:

```text
220,111,34,336,119,3,563,170,67,209,463,108,244,569,128,237,323,618,277,419,139,143,473
```

There is a simple direct key consumer that does not require the exploratory p50 compass or a hidden alphabet: the authentic known p56 GP29 additive rule and transparent plaintext-F. Take **each one of the 23 word sums modulo 29** to obtain exactly 23 GP key symbols. Repeat them against the **76 original p55 ciphertext runes** in their printed order. Try the two independently headed starts: the first red word enters the 23-cycle at body cell6; the second red word starts at body cell4, step7 of that same cycle (zero-based key rotation6). Both documented GP addition signs are finite controls, giving **four** entire original-cipher key/operation decisions. No fitted key phase, table offset, phrase or trigram screen determines the key.

The F-transparent inverse retains every legal state: plaintext F must emit ciphertext F **without consuming** the next key symbol, while ciphertext F may also be an encrypted non-F rune and consume a key. This is stricter than ordinary GP29 addition and captures all eight possible transparent/consumed choices for the three p55 ciphertext Fs.

| Author-derived cycle starting point | GP inverse sign | Earliest F-rule contradiction at zero-based p55 rune | Full legal inverse paths | Direct no-bypass GP IoC |
| --- | --- | ---: | ---: | ---: |
| First red heading, 23-cycle entry | Subtract | none | **2** | 0.03438596 |
| First red heading, 23-cycle entry | Add | **6** | 0 | 0.04035088 |
| Second red heading, cycle step7 | Subtract | **1** | 0 | 0.03298246 |
| Second red heading, cycle step7 | Add | **6** | 0 | 0.03087719 |

The first-heading/subtraction case has **two legal F-branch plaintexts**, each consuming **74** cyclic key symbols. Its 76-rune recovered GP-index stream has IoC **0.03543860**, near the uniform-ciphertext baseline, and reads in unpunctuated native GP transliteration:

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
| One-based | first heading | add | none | **3** |
| One-based | second heading | subtract | 10 | 0 |
| One-based | second heading | add | 24 | 0 |

The **three** surviving one-based/first-heading/add F-branch inverses are legal and all exactly reencrypt to the unmodified original, but all are incoherent GP transliterations. One representative branch reads:

```text
OEAIAIAPJECCBJWAEPNJITHLNGMXEAEATHFOEIAAEYGRDDMPNGYWNAEFAJEADMPINGEDLTHTNUXUOLYSRBGPGDNGEOERAEGT
```

Its legality is an expected property of a possible wrong additive key, not confirmation of the rule.

**Decision:** Both direct source-cycle candidates and the additional p32-addressed source-cycle key fail to recover p55 plaintext. Across **twelve** complete source-fixed inverse/sign/address cases, **two model variants** permit an original F-bypass inverse, yielding **five distinct full plaintext candidates** (two direct, three grid-indexed). All five are nonprose. This retires the specific 23-period direct key and zero/one-based p32 lookup consumers, while preserving the original 23-cycle observation as a provisional possible key source. Further arbitrary rotations and compound transforms need a fresh author-authenticated clue. [Node22 original-input SFT](../sims/lp2_wordmap23_cycle_p55_native_inverse_sft.cjs) · [Windows original-source workflow](https://github.com/FlareZ123/liber-primus/actions/runs/44086567597) (previous 4-case revision queued) · [later 12-case workflow](https://github.com/FlareZ123/liber-primus/actions/workflows/agent22-prime-even-rune-original-manual.yml) (manual dispatch queued; verify final result before treating as CI-passed).

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

The weakest premise remains the proposed pointer rule f(i)=S_i mod 156: it is motivated by the exact 156-word map and the 2016 message, but no creator-authored instruction explicitly specifies this modulus or zero-based convention. The direct repeated 23-symbol GP29 additive consumer has now also failed on both p55 and p32; the p32 H-start suffix's sole legal path is nonlinguistic.

Highest-value next actions:
1. Seek an independent Cicada-authored selector for the modulo-156 word pointer, rather than sweeping alternative moduli or tuning conventions.
2. Keep the p50 compass continuation parked unless an original clue independently fixes both the byte-to-direction/distance encoding and the toroidal boundary rule; its midpoint-X observation is not plaintext.
3. Do not expand direct 23-symbol additive key consumers, arbitrary rotations or offsets. A new 23-cycle use needs a separate source-selected operation and a locked prediction on untouched ciphertext.
4. Prefer recovery of authenticated historical key/decoder material or a source-selected reversible operation over additional numerical correspondences.

The opening red-heading to 156-word to 23-cycle construction remains a provisional structural clue with the 563/569 p32/2016 correspondence. It has not recovered plaintext, a key or the intended destination, and does not decipher any of the 56 unknown pages.
