# Exact lower bound on sparse first-difference keystream innovations (#3231)

**Agent47, 27 November 2026.** New exact conditional original-input bound and native-control identifiability test. No new LP2 key/plaintext.

## Frozen model

A GP29 additive pad has a piecewise-constant first difference. For next consuming key value k and previous slope d, a consuming rune uses k and then updates to (k+e mod29,e). Choosing e≠d costs one innovation. Initial k and d are free. Test both ordinary consumption and the historical transparent-plaintext-F law: C=0 may emit F and hold the state; the consuming branch must have P≠F. This is not a wordwise shift model, and no individual word resets are allowed. Test a continuous whole book and, separately, independent free starts at the nine existing decorated chapter boundaries. Physical p50 consumes no runes. Reuse the original 83 singleton positions and separately permit plaintext A/I or A/I/O, conditional on printed word semantics.

## Exact recurrence

For every position, maintain minimum cost D(k,d) over all legal prefix histories (all 29² initial states cost zero). The allowed consuming branch emits P=C−k mod29. The successor (k+e,e) has minimum candidate cost min(D(k,e),1+min_d D(k,d)); the second alternative is only ever competitive when e is not a minimizing old slope. If F is allowed and C=0, the state also has a zero-cost hold branch. This is exhaustive dynamic programming, O(N·29²) time and O(29²) cost memory, with optional traceback and capped optimal-path counts. The final unconstrained slope can be continued at no cost, so an innovation after the final consuming rune is not observable. An independent reverse recurrence plus stored forward vectors at the 83 singleton positions computes the exact allowed singleton values among all globally minimum-cost histories.

## Actual LP2 results

| Clock and conditional singleton grammar | Whole-book minimum | Nine-chapter minimum sum (free starts) | Singleton identities forced by whole-book minimum | Ambiguous singleton identities |
|---|---:|---:|---:|---:|
| Ordinary, A/I | 36 | 30 | 19 | 64 |
| Ordinary, A/I/O | 30 | 25 | 30 | 53 |
| Transparent F, A/I | 68 | 65 | 28 | 55 |
| Transparent F, A/I/O | 62 | 56 | 13 | 70 |

All four whole-book minima and every per-chapter minimum have multiple optimal paths. The above forced singleton values are conditional on **globally minimizing** an unauthenticated innovation cost, not recovered plaintext. The numeric bounds reject at most 29 ordinary-clock innovations or 61 transparent-F innovations for the continuous A/I/O model, even allowing arbitrary innovation locations and new slope values. They also reject changes only at the eight decorated chapter transitions, even after granting independent free chapter states (some individual chapters require innovations internally). None of this rejects denser piecewise-affine keys or other sender families.

## Native plants and identification failure

Use 190 runes from two copies of authentic clear p57 (95 runes), initial (k,d)=(7,4), three hidden changes at consuming ticks 17,53,97 to slopes 8,12,1. Full known native text uniquely identifies the three physical change positions, slopes and initial state for both clocks. On the *sparse exact donor anchor* condition (one known rune per 23 physical positions; even stronger than LP2's ambiguous singleton constraints), the exact minimum remains three but alternative event sets attain it. One valid minimum traceback matches only 98/190 native runes ordinary, 170/190 F-transparent. A wrong-law quadratic key with slope increasing by 3 at every consuming step needs 188/182 observable innovations under full known text, yet sparse anchors reduce these minima to only 5/4. Thus the sparse anchors cannot reliably discriminate even the radically denser wrong law. The full-known-text runs are oracle controls, not blind plaintext recovery. Every reported control traceback reencrypts exactly under its own inferred schedule.

## Decision

No independently supplied source mask or cost identifies a particular minimum, and sparse calibration fails blind recovery. Do not choose innovation positions by language score. A genuinely source-selected event stencil or independently known dense plaintext would be a different, testable premise; this exact bound can reject it before key fitting. No original key or continuation is claimed. Exact original inputs 12,956 runes; original parser cross-checks equality with corpus and 83 singleton sites. The executed core used connected V8; the standalone Node wrapper is available but was not independently run here.

[Single-file reproducer](../sims/agent47_sparse_innovation_dp_sft.cjs) · [Exact output and per-anchor min-cost options](agent47-sparse-innovation-output.json).
