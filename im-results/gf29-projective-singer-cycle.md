# GF(29²) projective cycle and 13-dot marker alignment

**Classification (11 November 2026):** p3's quadratic field and the order-30 projective action of its generator u are exact. The earlier z=23+27u orbit also has order30, but its claimed source selection via p3/p39 cross-mark offsets is not established after corrected offsets; treat z as a comparison, not a selected element. The marker corpus has 31 layers, 30 page-local annotations, and 29 global offsets; the corrected 30-state map assigns states to 29 global boundaries plus the terminal fragment. The projective marker-to-fragment operation remains a hypothesis. Direct substitution, additive-key, and the tested old page-local grid-row/column lookups remain negative.

## Source-derived field construction

The two three-rune red inscriptions are p3 `[13,23,2]` and p39 `[27,5,15]`, both at local offset119. The p3 polynomial gives `u² = 3u + 8` over GF(29); u is primitive of order840. The p39 polynomial `27+5X+15X² = 15(X−24)²` has repeated root24. The earlier `z = 23 + 27u` is an exact primitive element / table-polynomial root, but its claimed selection by aligning p3 and p39 red-mark offsets was based on an offset arithmetic error. Corrected global offsets do not provide that source selector; z is a speculative comparison, not a source-selected element. Multiplication by z is the exact linear map

```text
M0 = [[23,13],
      [27,17]]  (mod 29)
```

`z` is primitive of order840 in GF(29²)×. The matrix has determinant11 and `M0^30 = 11 I`. Quotienting by the 28 nonzero scalar elements gives a projective action of order30 on `P¹(GF(29))`, consisting of the 29 finite coordinates and infinity.

The separately marked Ac coordinate24 on p54 fixes the start. In the established chart `x=a/b`, the exact forward orbit is

```text
24,22,13,4,2,9,12,25,27,15,26,19,20,16,21,8,23,∞,
3,18,5,10,6,7,0,11,28,1,14,17
```

This is a source-linked 30-state interpretation of the 29-rune alphabet plus one distinguished state. It is not, by itself, evidence that Cicada intended this quotient.

## Speculative z-orbit correspondence: thirteen-dot markers

The ink annotation corpus contains **31 thirteen-dot marker layers at 30 distinct (page, offset) sites**. The duplicated site is p7:194, where the black layer is listed before the red layer. In source order, the 30 unique sites receive the 30 orbit states above:

| Site | State | Site | State |
|---|---:|---|---:|
| p0:13 | 24 | p2:201 | 22 |
| p3:16 | 13 | p3:119 | 4 |
| p3:122 | 2 | p6:71 | 9 |
| p6:82 | 12 | p7:194 | 25 |
| p7:208 | 27 | p14:137 | 15 |
| p15:0 | 26 | p15:9 | 19 |
| p15:20 | 20 | p22:131 | 16 |
| p23:16 | 21 | p26:265 | 8 |
| p27:19 | 23 | p32:121 | ∞ |
| p33:10 | 3 | p33:91 | 18 |
| p33:99 | 5 | p39:119 | 10 |
| p39:122 | 6 | p39:240 | 7 |
| p53:179 | 0 | p54:9 | 11 |
| p55:76 | 28 | p56:5 | 1 |
| p56:85 | 14 | p57:7 | 17 |

The z-derived map has these exact retrospective alignments (not independent selectors):

- The orbit starts at Ac24 on p54.
- The p7:194 black/red overprint is state25. p0's second red-word prime sum is315, and `315 mod 29 = 25`.
- The following site p7:208 is state27, matching the first rune of the p39 red triad.
- The p32:121 site is infinity; p32 is the 121-rune (`11²`) tree page.
- The p55:76 site is state28, matching p0's first red-word prime sum: `347 mod 29 = 28`.

This is a **candidate marker-to-projective-state map**, not an independently proven instruction. The 30=|P¹(GF(29))| count alone is not sufficient; the cross-anchors make the correspondence worth investigating, but the mapping still needs an intended operation that predicts something beyond the selected sites.

## Mapping the 32 red fragments to the 32 grid rows

The 31 marker layers partition the 225 red-rune events into 32 fragments. Pair each fragment with its right-hand marker layer. The 30 unique projective states map to grid rows 0–29 (infinity maps to row29); the black duplicate layer at p7:194 receives extra row30; the trailing fragment receives row31. This produces the complete source-order fragment-to-grid-row permutation:

```text
[24,22,13,4,2,9,12,30,25,27,15,26,19,20,16,21,
 8,23,29,3,18,5,10,6,7,0,11,28,1,14,17,31]
```

The first 28 fragments cover the 12,956 unknown runes through p55:76 and use rows `[24,22,13,4,2,9,12,30,25,27,15,26,19,20,16,21,8,23,29,3,18,5,10,6,7,0,11,28]`. The remaining four fragments use rows `[1,14,17,31]`, corresponding to the p56/p57 markers and the trailing fragment. This is a compact way to align the marker sequence, the 32 fragments, and the 32×8 table without searching for a row permutation.

## Source-selected p3-generator u orbit and PATIENCE fragment-state test

The simpler p3-defined generator itself gives a source-selected projective map. Multiplication by `u` in basis `(1,u)` is `Mu=[[0,8],[1,3]]`; from Ac24 its projective orbit is:

```text
24,25,21,10,14,9,20,18,28,4,26,∞,0,22,27,8,6,17,12,16,5,1,2,19,3,11,13,15,23,7
```

Assigning these states to the 30 unique thirteen-dot sites in physical order, with row30 for the p7:194 black overprint and row31 for the trailing fragment, yields `[24,25,21,10,14,9,20,30,18,28,4,26,29,0,22,27,8,6,17,12,16,5,1,2,19,3,11,13,15,23,7,31]`. This differs from the speculative z-derived row schedule above.

The fixed u schedule was composed with the existing PATIENCE-ranked 32-state GP29 transducer: reset the row state at each of the first 28 marker-delimited fragments, while carrying the predecessor ciphertext rune continuously. A second source-compatible boundary variant also resets the predecessor to zero. The speculative z schedule was tested with continuous predecessor context. All three models remain ciphertext-like; their original IoCs are 0.034587–0.034595 and their Shakespeare-trained GP trigram scores are −4.470 to −4.473, worse than raw ciphertext (−4.450) and far below the independent English holdout (−2.306). Original forward replay and 12,956-rune native-English plants recover exactly. This rejects these exact fragment-state compositions, not the field or marker correspondence as a map ([full report](lp2-projective-fragment-rank-state.md); [reproducer](../sims/lp2_projective_fragment_rank_state_sft.cjs)).
## P3-selected projective predecessor wheel: complete GP29 inverse and all-secret marginal obstruction (Agent44, 12 November 2026)

A separate **complete-position** use of the exact p3 generator tests whether the 29 printed runes are ranked *relative to the previous ciphertext rune* around the original source-derived 30-point projective wheel. It has a stronger source premise than an arbitrary cyclic rotor: p3's red triad defines `u²=3u+8`, multiplication by `u` acts on the established chart `x=a/b` as `T(x)=8/(x+3)` over GF29 (with `T(∞)=0`, `T(26)=∞`), and the visible enlarged p54 Ac24 supplies an orbit start. Its **exact length-30** orbit is already established in the section above. The operation *hypothesizes* that a solver should read the orbit as a predecessor-relative alphabet; the manuscript does not explicitly supply that opcode. This is distinct from the previously rejected *30-phase absolute-position substitution*, and from the LP1 28-cycle/EA-fixed differential family.

For each finite predecessor glyph `c`, begin at `c`, walk the u-orbit in order, **skip ∞**, and rank the 29 finite states `0..28`. A plaintext GP index `p` selects the `p`-th finite state as the next ciphertext glyph. This gives **a unique bijection of all 29 GP symbols at every position**, including repeat output: if `p=0`, the next ciphertext equals its predecessor. At the beginning of each physical rune-bearing page, the first original rune is copied as the initial state. The exact inverse is the rank of each next observed rune in the predecessor's finite wheel. Use the one source-fixed p3 multiplication direction or its inverse, with no fitted phase, key, page substitutions or exceptions. The source page order holds **12,956 runes**, including **86 same-page repeated-rune transitions**; every original position is decoded and exactly re-encoded. A 12,956-rune source-shaped plant from independently solved p57 GP text also recovers every symbol under both directions; wrong-direction decode does not recover the plant.

| Original-input measure | Raw GP ciphertext | P3-u wheel decode | P3-u⁻¹ wheel decode | Solved native p57 control |
| --- | ---: | ---: | ---: | ---: |
| GP29 IoC | 0.03447840 | **0.03524785** | **0.03524792** | 0.06270997 |
| Top-12 rune frequency mass | 0.42976227 | **0.44033652** | **0.44025934** | **0.81052632** |
| Largest single-rune count | 492 / 12,956 | **490 / 12,956** | **489 / 12,956** | 15 / 95 |

The first output GP symbol occurs **88** times in either decoded original, consisting of the **86 observed repeated transitions** and two copied page starts. This is an exact algebraic consequence, not recovered plaintext. Importantly, **no unknown global stationary permutation of the 29 output rune names can improve the table's top-12 frequency mass or maximum symbol count**, since it only renames the same histogram. Even granting an *arbitrary secret 29-symbol alphabet*, the decoded source has <0.441 top-12 mass; authentic solved LP2 p56 and p57 native GP controls have top-12 masses 0.82353 and 0.81053. This is a strong direct-native-GP-English objection, independent of score fitting, and does **not** exclude an additional changing-state cipher, a non-GP intermediate, or specially frequency-balanced prose.

**Decision:** retire this complete p3-projective **predecessor-wheel as a direct GP plaintext decoder**, in either authentic group orientation, including stationary secret output relabelings. The exact 30-state group structure remains useful as mathematical source material. A different field consumer requires a new original-source instruction or independently fixed intermediate register; do not sweep starting phases or unmotivated word clocks. [Source-pinned single-file CommonJS reproducer](../sims/lp2_p3_projective_predecessor_wheel_sft.cjs).

## Cipher tests and negative result

The existing direct tests remain negative:

1. **30-phase projective substitution:** 8 variants over all 12,956 unknown runes, testing the finite-point completion, direct and Ac-centred coordinates, forward/reverse action, and continuous/page-reset clocks.
2. **30-step additive orbit key:** 32 variants, testing GP-index, Ac-centred, prime-mod-29 and totient-prime-mod-29 projections, both signs, forward/reverse orbit, and continuous/page-reset clocks.

Neither produces a coherent passage. The best previous trigram scores improve on raw ciphertext by only about0.02 nats/rune; IoC and top-12 symbol mass remain at ciphertext levels. Do not repeat these fixed families with cosmetic offsets or language-fitted parameters.

The new marker-to-row map was then tested as a **per-fragment grid-row IV schedule** for all 28 unknown fragments. `sims/projective_marker_gridrow_nonce_probe.cjs` ran 256 variants: four fragment-length key orders, four row/zero IV layouts, AES-256-CTR and ChaCha20, additive and predecessor-exclusion families, both signs, and both pad projections. The best normalized IoCs were only about1.027 on the training segment and1.026 on heldout, versus a planted-control value of2.077; output prefixes remained incoherent. Thus this particular direct key/IV use is rejected. It does not invalidate the marker-state correspondence as a possible map or routing instruction.

## Additional source-ordered grid-row/column tests

**New original-input test (Agent 35, 11 November 2026).** The 32-fragment row map was tested as an eight-column lookup, not only as a cipher IV. Two simple uses were frozen:

1. **Repeating row key:** use the mapped grid row as an 8-symbol additive key within each fragment. Test zero, state, next-state and state-difference phase; forward/reverse column order; mod-29/scaled byte reduction; both signs (32 variants). Best trigram score is **−11.13583** nats/rune, versus raw ciphertext **−11.15402**; IoC is **0.034485**, effectively unchanged from **0.034478**. No coherent plaintext.
2. **Ciphertext-residue column:** for each rune, use the mapped fragment row and select one of eight columns by (C\bmod8), ((C+1)\bmod8), ((C+s)\bmod8), or ((C+1+s)\bmod8), where (s) is the fragment's projective state (infinity represented by 29). Test mod-29/scaled byte reductions and both signs (16 variants). The best score is **−11.06713**, with IoC **0.040141** and top-12 mass **0.570856**; the prefix remains incoherent. The concentration increase alone is not evidence of plaintext.

**Source-map null control.** For each of **500** deterministic random permutations of the 32 grid rows (LCG seed 3301), maximize the trigram score over the same 16 ciphertext-residue variants. The source map's best score is exceeded or matched by **213/500** random maps; random mean best is **−11.06903**, maximum **−10.97639**, and the add-one empirical tail probability is **0.42715**. Thus the apparent score/concentration improvement is not specific to the projective row order. The straightforward repeating-row and ciphertext-residue lookup families are rejected as decryptions; the projective marker-to-row correspondence remains an unproved map, not a key.

**Reproduction:** `sims/projective_marker_gridrow_column_probe.cjs` reconstructs the marker orbit, row map and fragment boundaries from the original corpus/ink annotations, runs both fixed families, and reproduces the 500-permutation family-wise null. It uses the same LP1 GP trigram reference as the projective-cycle probe.

**Reproducers:**

- `sims/gf29_projective_singer_cycle_probe.cjs` — field construction, 30-cycle, direct substitution and additive tests.
- `sims/projective_marker_gridrow_nonce_probe.cjs` — the superseded page-local marker map and its 256-variant negative IV test; not the corrected global-offset schedule.
- `sims/projective_marker_gridrow_column_probe.cjs` — repeating-key and ciphertext-residue lookup tests, plus the 500-permutation null, all on the superseded page-local map.
- GitHub Actions run: https://github.com/FlareZ123/liber-primus/actions/runs/42944677668

**Related studies:** `lp2-red-triad-primitive-840-phase-gate.md`, `red-triad-gf841-840-phase-gate.md`, and `red-256-event-grid-correspondence.md`.
