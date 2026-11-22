# P7 GF(3) clock as a three-mode GP29 predecessor cipher: complete all-secret exclusion on long original receivers

**Agent4, 22 November 2026. Evidence class: exact source-conditional negative on original LP2 ciphertext. No recovered unknown plaintext, authentic cipher key or final destination.**

## Causal hypothesis and its independent rival

The physical p7 inscription ends with five visible red words split 2|4|3|2|3. Their unchanged GP29 ordinal-index products, computed from the original red glyphs, are **[11,26,8,15,2]**. Reducing modulo3 gives **[2,2,2,0,2]**, the coefficients of a primitive five-stage GF(3) linear feedback register. Its nonzero cycle covers **242 distinct states**. The immediately following p8 black body contains 243 runes. The recurrence and earlier failed direct p8 lookup/additive consumers are already documented in [the initial source study](lp2-p7-primitive-gf3-msequence-p8-original-table-gate.md).

One plausible reading is that the register emits a trit selecting among **three secret reversible alphabets**. The prior [all-secret predecessor-cipher theorem](lp2-cipherprev-quasigroup-majorization-allsecret-original-gate.md) excludes one or two fixed alphabets under natural GP plaintext controls, but its unconstrained three-mode bound does not exclude ordinary English. The actual p7 register might provide the missing three-mode clock.

A legitimate independent rival is that the p7/p8 lengths are coincidental, or that the source instead describes a changing-key, nonlinear or external-key operation. No first-party text explicitly instructs this ternary predecessor cipher. A negative on its original receiver retires only this exact proposed operation.

## All-secret reversible architecture

For an original ciphertext rune C_i within a real printed word, let s be the immediately preceding ciphertext rune, P_i the unknown plaintext rune, and m the trit supplied by the p7 register. Allow **every one of the 87 tables Q[m][s] to be an entirely unknown, independent permutation of the 29 GP symbols**:

    C_i = Q[m][s][P_i]
    P_i = inverse(Q[m][s])[C_i]

Each of the **2,896 original printed word starts** is granted wholly arbitrary ciphertext/plaintext initialization and excluded from the tested counts. The original transcript joins all printed line and page continuations before identifying the 10,060 remaining word-interior transitions.

For each register output m and predecessor s, count the observed original successor letters: n[m,s,t]. A bijection can map any fixed plaintext glyph to **at most one successor glyph t in each (m,s) row**. Therefore, without fitting any key, the attainable maximum frequency of any one recovered plaintext rune is exactly

    B1 = sum over all (m,s) of max_t n[m,s,t].

If natural GP prose requires more copies of its most common rune than B1, every secret key for this reversible architecture is excluded under that prose hypothesis.

### Exhaustively covering every affine output from the five-trit state

The source-derived primitive 242-cycle has a useful exact property. Every one of the **242 nonzero five-trit GF(3) linear output functionals** yields a rotation of the same 242-symbol m-sequence. The SFT explicitly enumerates every coefficient vector and proves a one-to-one correspondence with the 242 rotations. Adding any of the three possible affine output constants merely renames the three freely secret Q tables.

This covers all **726 nonconstant affine state-to-mode readouts**, every initial register phase and every hidden output coordinate, without enumerating 29! substitutions. Four source-visible reset conventions are charged: continuous book position, actual physical page position, eight printed section positions, and position within each real printed word. The same three alphabets apply to the whole receiver; independently changing the alphabets after each page or word is a different model.

### Exact completion of the missing zero state

The p8 body has 243 black runes, motivating a full ternary de Bruijn cycle of 243 outputs. From the source-fixed primitive m-sequence, there are **exactly two four-zero runs**, starting at positions **83 and 204**. Insert one zero after either run (positions **87 and 208**) to obtain two actual cyclic 243-trit sequences, each having **all 243 five-trit windows exactly once** and 81 appearances of each trit. These are the two source-valid zero-splice readings previously noted in [the register study](lp2-p7-primitive-gf3-msequence-p8-original-table-gate.md).

**New exact equivalence for the present cipher model:** the second 243-sequence is the first shifted by **122 positions** and then relabeled by the field permutation m → 2m modulo3. This has been asserted on all 243 original-state outputs. Since the three secret alphabets are arbitrary, the relabeling cannot affect B1. Every affine register-output readout is a cyclic shift of the underlying primitive m-sequence; its four-zero splice therefore belongs to one of these two equivalent phase families. Testing all **243 phases of just one complete cycle** covers **both possible splices**, all 242 nonzero linear source readouts, and their three affine output constants under the declared decoder.

This closes the same fixed-three-alphabet architecture under the full 243-state version without selecting an arbitrary zero insertion or hiding a tie-break. It does **not** test a general nonlinear map from a complete five-trit state to a GP rune; that is a different, more expressive consumer.

## Original-input exact result

| Source region and phase clock | Word-interior sites | Smallest B1 across phases | Largest B1 across phases |
| --- | ---: | ---: | ---: |
| P0–p55, book continuous | 10,060 | 724 | **775 (7.70%)** |
| P0–p55, page reset | 10,060 | 729 | **784 (7.79%)** |
| P0–p55, section reset | 10,060 | 722 | **775 (7.70%)** |
| P0–p55, word reset | 10,060 | 660 | **756 (7.51%)** |
| **P9–p55, book continuous** | **8,395** | 642 | **688 (8.20%)** |
| P9–p55, page reset | 8,395 | 641 | **686 (8.17%)** |
| P9–p55, word reset | 8,395 | 577 | **676 (8.05%)** |

The corresponding **complete 243-state zero-spliced** mode clocks give the following exact all-phase envelopes (both valid splices are covered by the relabel-and-shift identity):

| Source region and 243-clock scope | Word-interior sites | Smallest B1 | Largest B1 |
| --- | ---: | ---: | ---: |
| P0–p55, book continuous | 10,060 | 720 | **781 (7.76%)** |
| P0–p55, page reset | 10,060 | 722 | **782 (7.77%)** |
| P0–p55, section reset | 10,060 | 728 | **772 (7.67%)** |
| P0–p55, word reset | 10,060 | 660 | **756 (7.51%)** |
| **P9–p55, book continuous** | **8,395** | 635 | **691 (8.23%)** |
| P9–p55, page reset | 8,395 | 638 | **689 (8.21%)** |
| P9–p55, word reset | 8,395 | 577 | **676 (8.05%)** |

The p9–p55 receiver is the historically more motivated test because the ternary clue is first printed on p7. All input ciphertext runes and printed boundaries remain untouched. No unknown cipher key or English target word contributes to these maxima.

### Calibrated word-preserving plaintext controls

For independently sourced controls, use the repository's solved-LP1/p57-calibrated GP orthography to encode genuine Gibran and Shakespeare source words. Use the separately already-encoded GP29 Latin Vulgate words without reconverting them. Draw complete words matching **every one of the 2,896 original GP word lengths** in 60 deterministic seeded trials per source, preserving the exact positions selected for the p9–p55 subset.

| GP-native prose control | Most frequent interior GP rune, whole manuscript: 60-draw range | Most frequent interior GP rune, p9–p55: 60-draw range |
| --- | ---: | ---: |
| Gibran, The Prophet | **1,419–1,575** | **1,186–1,317** |
| Shakespeare | **1,434–1,549** | **1,193–1,309** |
| Latin Vulgate | **1,181–1,295** | **974–1,086** |

The **smallest** of all 180 source-native whole-manuscript counts is 1,181, while even the most permissive original-clock capacity is **784** for the 242-cycle and **782** for the two 243-cycles. For the downstream p9–p55 receiver, every control requires at least **974**, against the strongest original capacities **688** (242) and **691** (243). This is a strong exact rejection of the proposed three-mode architecture as a direct decoder for the tested natural GP prose and Latin registers. It does not rule out deliberately flattened or atypical plaintext.

A positive plant encrypts a full source-sized **12,956-rune** sequence using original solved p57 GP runes and arbitrary generated secret GP29 permutations for all 87 state/predecessor rows. Both 242-cycle and zero-spliced 243-cycle versions recover all **12,956** planted symbols and exactly reencrypt them. Their row-count bounds correctly accommodate the plant's most common known rune.

## Decision

The primitive p7 register, under **any affine GF(3) output coordinate/constant/phase**, cannot simply select one of three stationary ciphertext-predecessor substitution tables to decode the natural-language original LP2 p9–p55 or p0–p55 as long continuous source registers. This closes the specific three-mode escape left by the earlier one/two-mode capacity theorem.

The **complete 243-state zero-spliced ternary clock**, under either author-plausible insertion, is **also excluded as the sole selector for these same three stationary predecessor alphabets**. The proof does not address short p8/p9–p14-only inscriptions, nonlinear five-trit-state-to-rune output, per-page independently changing secret alphabets, plaintext-dependent state updates, external keys, or non-GP intermediate messages. None is made more credible merely by escaping this exclusion. A further experiment needs its own visually or historically selected operation and plaintext-producing receiver.

**Fully reproducible single-file test:** [SFT, Windows/Node 22 CommonJS](../sims/lp2_p7_gf3_affine_three_mode_allsecret_sft.cjs). It derives p7's actual red products, verifies original 12,956 rune/2,896 word identities, enumerates all affine readouts and phases, computes all 242-state and both 243-state source-clock capacity bounds, uses 180 matched native-source controls and confirms exact positive recovery for both period types.

**Verified Windows/Node 22 workflow:** [PASS, full 242/243-clock SFT, run 45010878894](https://github.com/FlareZ123/liber-primus/actions/runs/45010878894). Classification remains intermediate research in im-results, with no claim of new plaintext.