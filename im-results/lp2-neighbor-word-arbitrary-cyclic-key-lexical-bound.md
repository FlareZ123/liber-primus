# Adjacent-word cyclic key: arbitrary private-key lexical obstruction

**24 November 2026, Agent18 — exact finite-vocabulary lower bound, no unknown LP2 plaintext or authentic key.** The whole-word autokey family now fails a substantially more generous test than the earlier affine/prime-coordinate search. Every printed group is granted its own entirely arbitrary independent cyclic GP29 key of the length of its preceding or following printed group. Thus the actual adjacent plaintext/ciphertext word, every possible symbolwise key map, every cyclic rotation and within-key permutation, and all shared-key consistency are relaxed away. Despite that freedom, every rune-bearing physical page contains at least one forced out-of-vocabulary (OOV) group in either fixed traversal direction under both ordinary and historical plaintext-F-hold emission. No amount of fitting a stationary or per-word map can repair those groups under the fixed native register and preserved printed group lengths.

## Exact test and its scope

The signed 2016 words/numbers/direction clue and authentic LP1 Vigenère and F-hold conventions motivate a whole-word autokey model, but neither specifies this recurrence. The [forward affine gate](lp2-affine-wordfed-autokey-allkey-original-gate.md) and [backward affine/prime gate](lp2-next-plaintext-word-autokey-fhold-exact-gate.md) exclude their nonzero continuous F-hold families by reachability. This test addresses the remaining arbitrary nonlinear key-map freedom without adding another parameter search.

Let C be one complete original printed group of length n, and L the length of its adjacent printed group in the selected traversal direction. Permit *all* private keys K in GF(29)^L. Ordinary emission is C[j]=P[j]+K[j mod L] mod29. With authentic F holds, plaintext 0 emits 0, does not consume a key position, and every nonzero plaintext consumes the next position. Given a trial complete plaintext P of length n, start all L key slots unassigned. For each consuming position assign K[t mod L]=C[j]-P[j] mod29, rejecting contradictory assignments. At a nonconsuming P[j]=0 require C[j]=0. If the scan succeeds, all remaining slots may be assigned arbitrarily. This is a **necessary and sufficient existence test** for a private length-L cyclic key and that exact P. It also handles the ambiguous nonzero preimage of ciphertext F correctly. A key-length-L neighbor-derived family is a subset of this private-key family even if the map is nonlinear, depends on both words, changes at every word, or permutes the key digits. It does not cover key expansion to another length, extra symbols or arbitrary resegmentation.

The original unchanged LP2 tape is parsed into **2,896 complete printed groups / 12,956 runes** with genuine page and line carries restored and checked against the independent page-index arrays. Use the same pinned **29,081** distinct GP29 forms as the affine studies (TextBlob frequency lexicon with the already frozen GP normalization, plus native solved donor words). Every possible dictionary form of the exact group length is tested; no beam, scoring or omitted key. A failed group must have plaintext outside this vocabulary for **every** key in the corresponding private family. Counts are simultaneously necessary, not independent statistical p-values.

## Original-input lower bounds

| Adjacent key source | Emitter | Groups tested | Forced OOV groups | Runes in forced groups | Forced groups of ≥4 runes | Forced groups with both complete neighbors inside one physical page |
|---|---|---:|---:|---:|---:|---:|
| Previous (forward) | Ordinary | 2,895 | 599 | 4,529 | 590 | 580 |
| Previous (forward) | F hold | 2,895 | 597 | 4,518 | 589 | 578 |
| Next (backward, terminal p56 AN length2) | Ordinary | 2,896 | 601 | 4,547 | 592 | 581 |
| Next (backward, terminal p56 AN length2) | F hold | 2,896 | 609 | 4,589 | 600 | 588 |

The F-hold lower bounds are **20.62% and 21.03%** of the tested groups, accounting for **34.87% and 35.42%** of the original rune inventory respectively. Only 1,241 and 1,238 groups are longer than their relevant key and thus supply nontrivial cyclic-repeat constraints; all failures occur in those groups. The ordinary and F-hold families are tested separately; a ciphertext zero does not force a hold. Every one of **55/55 rune-bearing physical pages** contains a local witness in each of the four cases. The final column excludes any pair touching a physical page boundary (2,809 eligible pairs per direction), so even arbitrary page-private keys, initial phases and fresh first-word keys do not repair the obstruction. With independently chosen forward/backward traversal on every group, 374 ordinary or 376 F-hold groups still fail *both* local key-length choices (whole-book boundaries as defined above). This is not a claim about allowing arbitrary different key lengths.

A particularly small exact terminal witness is p55 group2893, printed GP indices [5,28,10,19,5,14] (CEAIMCX), followed by the complete three-rune group DJU. No ciphertext F occurs. Hence every possible backward cyclic key of length3, even with arbitrary digits and no map consistency, forces

    P[3]-P[0] = 14, P[4]-P[1] = 6, P[5]-P[2] = 4 (mod29).

None of the 4,665 fixed six-rune dictionary forms satisfies these three equalities with no plaintext F. The ordinary case fails too (even when F is an ordinary symbol). It is not a mathematical impossibility for a six-rune nonword, foreign word or unlisted English spelling.

## Actual AN-anchored arbitrary-map inverse

To pursue key recovery rather than merely use the relaxation, grant one arbitrary stationary noninjective f:GP29→GP29 (29^29 possibilities), initialized to 29 unassigned slots, from solved p56's actual first plaintext group AN=[24,9]. Work backward through the original p55 terminal words. Each candidate dictionary plaintext and the next recovered plaintext word fixes the required f values for its consuming positions. Reject inconsistent assignments; merge states only if the entire current plaintext word and all 29 partial f entries are identical. This is exhaustive over lexical trajectories and unassigned table values. There is no bound on the number of assigned values and no optimization of the dictionary.

| Original group | Source text | Exact compatible (current word, partial f) states |
|---|---|---:|
| 2895 | BEI | 17 |
| 2894 | DJU | 6,499 |
| 2893 | CEAIMCX | 0 |

Thus the full arbitrary stationary map cannot give an all-vocabulary backward inverse, and the relaxed key-independent witness explains why the search dies. No key is recovered from the 6,499 partial states; every one is eliminated at the next group. This is distinct from the algebraic all-key reachability exclusions for affine and mixed-prime maps.

## Calibration on authentic native text

Nine source-native solved sections (published GP29 donor) are encrypted synthetically under one genuinely nonlinear table f(x)=x²+17x+3 mod29 for each direction and emitter. Every true plaintext group satisfies the exact private-key compatibility condition, including F holds. All target-exclusive donor words are omitted when evaluating the vocabulary calibration, while the fixed TextBlob vocabulary and the eight other source sections remain. Across **731** tested native groups per direction:

- Forward ordinary/F-hold: 9/731 forced OOV in either mode; the true native corpus itself has 20/731 OOV.
- Backward ordinary: 15/731 forced OOV; F hold: 14/731; true native OOV 21/731.
- The native section2 has 10 true OOV among 30 eligible groups, an atypical small section containing nonstandard vocabulary; do not infer that every English section must have a ≤2% OOV fraction.

The manuscript-wide forced OOV rates (at least 20.6%) greatly exceed the pooled calibrated 1.2–2.1% necessary bound; the comparison is conditional on source-native word statistics and vocabulary, not an English-language universal theorem. The same true-word compatibility check passes all native plants even when their words are omitted from the scoring dictionary. The exact source-private-key test uses no independent linguistic frequency score.

## Reproduction and decision

[CommonJS SFT](../sims/lp2_neighbor_word_arbitrary_cyclic_key_lexical_bound_sft.cjs), commit 33e4b036781a10625612e9f4c1821689e3d169b2. Run from repository root:

    node sims/lp2_neighbor_word_arbitrary_cyclic_key_lexical_bound_sft.cjs

The exact function was executed on the fetched original repository files in the connected JavaScript runtime, including all native controls and terminal key-recovery state enumeration. No Windows CI run is claimed. The output contains local-page counts, chapter counts, original witness indices, and per-section donor calibration.

**Decision:** retire neighbor-word-length cyclic additive keys as the whole-book native printed-word architecture, including arbitrary word-private key alphabets and both directions. This does not exclude an actual different key length/clock, resegmentation, non-native register or non-additive cipher. The all-key result is a bounded but substantial architectural obstruction, not a recovered LP2 passage. The p56 AN anchor does not supply a working key table. Do not repeat narrower affine, prime or arbitrary stationary-map searches under the same framing.
