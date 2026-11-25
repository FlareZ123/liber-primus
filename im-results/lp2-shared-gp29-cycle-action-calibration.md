# Shared GP29 cycle-action calibration

**Status: no Liber Primus plaintext or key recovered. The p54–55 word-reset calibration basis is now corrected: the 48/17 JSON records physical fragments, not independent lexical words, and the earlier 49/222 + 17/86 fixture includes the red heading as body input. Both terminal profiles are withdrawn as evidence for the red-heading-key, per-word-reset model.** The strongest surviving result is the independently calibrated long-anchor receiver on p40–53. The red eight-rune p54 heading now supplies a concrete source-selected key candidate, Both fixed numeric interpretations have now been conditionally excluded by blind-calibrated exhaustive permutation searches; the alphabet-mapped interpretation remains unresolved.

## 1. Corrected original input

The legacy terminal fixture did not preserve the physical page boundaries or the red/black boundary on p54. The later 48/17 derived segmentation preserves physical fragments, but it still does not preserve the lexical carry as one word.

The original corpus records p54 as 232 runes and p55 as 76 runes. Reconstructing p54 from the complete corpus sequence gives an exact 232-rune match when the legacy terminal string is completed with its omitted final group, `63g2eis46q`. The original image visually separates the red heading from the adjacent black text:

- Red heading group 1: enlarged A, compact `o`.
- Red heading group 2: eight smaller red runes, compact `jlnr2eaj`.
- First black body group: `rndl17oj`.
- Final p54 body group: `63g2eis46q`.
- First p55 group: `l`.

The raw hyphen transcription merges the red eight-rune heading with the first black body word. Flattening the pages also hides the lexical carry: original image 71 (p54) ends with the ten-rune fragment `63g2eis46q` and no following divider; original image 72 (p55) begins with `l`, immediately followed by a divider. Therefore `63g2eis46q` + `l` is one 11-rune lexical word, `63g2eis46ql`, crossing the physical page boundary. A word-reset q8 clock continues through that seam; p55's first rune is neither a new word nor a new phase start.

The corrected derived transcription is `resources/liber-primus/lp2-page-groups-54-55-derived.json`. It is explicitly labelled derived, records its source files and segmentation rationale, and is verified against the p54/p55 corpus rune sequences.

| View | Groups / runes | Correct use |
|---|---:|---|
| p54 red heading | 2 / 9 | Source clue, not body training |
| p54 black-body physical fragments | 48 / 223 | Image segmentation; includes the 10-rune carry prefix |
| p55 physical fragments | 17 / 76 | Image segmentation; includes the 1-rune carry suffix |
| Word-reset p54 fit | 47 complete words / 213 runes + 10-rune carry prefix | Fit; prefix is constrained without revealing its final rune |
| Word-reset holdout | 1-rune carry suffix + 16 complete p55 words / 75 runes | Score the full 11-rune carry and all 16 p55 words after freezing the action |

A direct evaluation of the repository's exact local candidate predicate (`sims/lp2_shared_gp29_q8_smt.py::candidate`) over the 38,938-form dictionary finds nonempty necessary domains for **all 47 complete p54 body words**, **all 93/93 unique carry-prefix candidates**, and **all 16 complete p55 holdout words**. The smallest complete-word domains are 24 candidates for the one-rune p54 group and 178 for two-rune groups; the longest p55 group (13 runes) has 275. This is only per-group necessary consistency, not evidence that one shared q8 action satisfies the groups; it does show that a zero-domain/OOV obstruction is not already forcing the model to fail.

The legacy `lp2-shared-gp29-q8-smt-fixtures.json` has 66 groups / 308 runes: its 49 training groups include the two red heading groups, and its 17 holdout groups include the complete 11-rune carry plus 16 p55 words. It is not a red-heading-as-key body-only calibration. The later `lp2-shared-gp29-q8-terminal-corrected-fixtures.json` has 48 p54 and 17 p55 physical fragments; its synthetic carry prefix and suffix were encrypted as separate groups with separate starts. It is valid only for an explicitly physical-fragment-reset model, not the current per-word-reset model. The old CP-SAT run [45677161587](https://github.com/FlareZ123/liber-primus/actions/runs/45677161587) used that physical-fragment fixture and is therefore withdrawn as a word-reset calibration. Keep the fixture and generator as historical physical-fragment controls; do not reuse them for this model.

Consequently, neither the 49/222 + 17/86 complete-word fixture nor the 48/17 physical-fragment fixture is evidence for the red-heading-as-key, per-word-reset p54–55 model. Withdraw the p54 terminal CP-SAT, annealing/projection, fixed-source-pool, keyed-alphabet and red-heading-excluded results that used either incorrect training/holdout interpretation. The old numeric and mapped DIVINITY exclusions also treated the red heading as body input; their dependent p54 OOV contradictions are not evidence against a red-heading key. Earlier visual-chapter results not using p54/p55 are unaffected.

## 2. Cipher model

The tested common-cycle hypothesis is

\[
C_i=\pi^{-1}\bigl(\pi(P_i)+k_{\phi_i}\pmod{29}\bigr),
\]

with one permutation \(\pi\) fixing F, a primitive period-eight shift vector, arbitrary per-word starting phases, and transparent plaintext F holds that do not advance the phase. A page break does not reset a word's phase: the p54/p55 carry remains one 11-rune word. This differs from the nonlinear-common-cycle SFT with eight independent phase permutations and a separate evolving outer permutation.

A useful exact representation is now implemented in `sims/lp2_shared_gp29_q8_cpsat_sft.py` as `--mode centralizer`. Choose a phase \(r\) with \(k_r\ne0\), rotate phase labels to put it at zero, and scale the alphabet coordinates so \(k_0=1\). The inverse phase maps are then powers of one 29-cycle \(g\). Conversely, every permutation commuting with a full 29-cycle is one of its powers: the centralizer of a 29-cycle is cyclic. Thus the common-cycle model can be represented exactly by one 29-cycle and seven commuting permutations, with primitive q8 enforced by requiring that at least one opposite pair \(f_j,f_{j+4}\) differs. This removes the explicit alphabet and shift variables. Its corrected blind controls are still pending. A second exact encoding below keeps the alphabet coordinates and phase shifts explicitly and turns every consuming edge into one GF(29) linear equation.

### Literal-F bypass correctness (Agent18, 25 November)

The centralizer implementation had an independent semantic defect in both the base and source-corrected carry-prefix builders: the unconditional constraint `p==dec` applied even to a literal plaintext-F hold. At ciphertext F and nonzero shift, the consuming inverse necessarily gives a nonzero plaintext rune. The authentic native encoder nevertheless permits plaintext F to bypass the permutation and hold the phase. The old constraint prohibited that legal edge. Example: identity alphabet, shifts 1..8, start0, plaintext (0,1) encrypts to (0,2); the old first-position equality forces p=28 instead of the correct held p=0. The last-rune branch also needs this correction even though there is no following phase variable.

Both centralizer builders now impose the consuming equation only when the F-hold Boolean is false, including at the terminal rune. For a non-F ciphertext the equation remains unconditional and plaintext F is forbidden. The pre-existing rank/maps builder already uses the correct conditional equation.

[Exact regression](../sims/lp2_common_cycle_fhold_regression.py): local Python algebraic execution over identity plus 99 seeded conjugating alphabets, every shift 0..28, every ciphertext 0..28: 84,100 forward edges, corrected relation matches every edge, old relation permits 81,300 (exactly 2,800 valid held-F edges omitted). The same script's optional --cpsat mode pins actual maps and checks leading, terminal, sole and interior F holds plus a consuming ciphertext-F example in both builders. The earlier blind run 45708141866 used the pre-fix builder and timed out UNKNOWN after 900 seconds on both plants; because it omitted valid F-hold edges, it is not a valid negative. The corrected manual workflow .github/workflows/lp2-shared-q8-carry-prefix-blind.yml now runs the actual CP-SAT regression and two corrected blind plants with 1,200-second limits, and requires both to pass before any original fit. Other receiver families are not invalidated by this specific defect. No new original fit or plaintext is claimed.


### Exact GF(29) linearization

Let \(\phi=\pi\) be the unknown alphabet coordinate permutation, with \(\phi(F)=0\). For every consuming rune at phase \(j\), the common-cycle relation
\[
C=\pi^{-1}(\pi(P)+k_j)
\]
is exactly
\[
\phi(C)-\phi(P)=k_j\pmod{29}.
\]
After the same phase-rotation and generator-scaling gauge, \(k_0=1\); the unknowns are only 28 nonzero alphabet coordinates and seven remaining phase shifts. A CP-SAT encoding can use one all-different 29-vector, seven key variables, and for each consuming edge a Boolean wrap \(w\):
\[
\phi(C)-\phi(P)-k_j+29w=0.
\]
The unreduced difference lies in \([-56,28]\), so \(w\in\{0,1\}\) represents the modular equation exactly. Literal plaintext-F holds remain a separate conditional branch and do not advance phase.

The known-plaintext calibration [SFT](../sims/lp2_shared_gp29_q8_linearization_sft.py) and [workflow](../.github/workflows/lp2-shared-q8-linearization-calibration.yml) passed on two deterministic dictionary plants (workflow run [45722320538](https://github.com/FlareZ123/liber-primus/actions/runs/45722320538)). Both recoveries reached rank 35, recovered the exact planted action, retained all 47 training words and the 10-rune carry prefix, and recovered all 17 held-out words. This is an algebraic positive control with known word identities, not a blind dictionary solve.

The direct [linearized CP-SAT wrapper](../sims/lp2_shared_gp29_q8_carry_prefix_linearized_cpsat.py) and [blind-control workflow](../.github/workflows/lp2-shared-q8-linearized-blind.yml) now test this smaller formulation against the same two blind plants (run [45722459679](https://github.com/FlareZ123/liber-primus/actions/runs/45722459679)). No original fit has been run. The remaining challenge is the discrete choice of dictionary word and per-word start phase; linear consistency can reject impossible choices before or during search.

## 3. Source-selected p54 key candidate

The red heading's eight smaller runes are:

- Compact GP29: `jlnr2eaj`
- Transliteration: M, NG, D, IA, TH, X, I, M
- GP29 indices: `[19,21,23,27,2,14,10,19]`

The GP29 prime column assigns `[71,79,89,107,5,47,31,71]`; reducing these modulo 29 gives `[13,21,2,20,5,18,2,13]`, compact `dl2k5i2d`.

These give three motivated, distinguishable key hypotheses:

1. Direct numeric shifts: \(k_j=K_j\), using the eight GP29 indices.
2. Prime-derived numeric shifts: \(k_j=\operatorname{prime}(K_j)\bmod29\).
3. Alphabet-mapped shifts: \(k_j=\pi(K_j)\).

For the fixed numeric variants, normalize the phase origin by dividing every entry by the first entry modulo 29. This gives direct exponents **[1, 24, 18, 6, 23, 16, 28, 1]** and prime-derived exponents **[1, 15, 18, 6, 16, 17, 18, 1]**. The alphabet-mapped form has exponents \(e_j=\\pi(K_j)\\pi(K_0)^{-1}\\pmod{29}\), with \(e_0=e_7=1\); its remaining values are coupled to the unknown \(\\pi\).

The enlarged A is a separate visual marker; no offset or seed role has been established. A cheap necessary prefilter on the corrected body now checks the implications shared by all three variants: every red8-derived shift is nonzero, and equal shift values must reuse the same phase map. Under this fixed-point/injectivity filter, all 47 complete p54 words and all 16 complete p55 words retain nonempty dictionary domains, and 69/93 carry-prefix candidates survive. This does not enforce the exact numeric exponents or a common 29-cycle, so it neither supports nor excludes any variant. The fixed-vector graph receiver below strengthens this to calibrated exact exclusions for both fixed numeric interpretations. The alphabet-mapped interpretation remains unresolved; p55 remains held out from fitting.

### Fixed numeric red8 inverse (Agent10, 25 November)

The [fixed-vector graph receiver](../sims/lp2_red8_fixed_numeric_cycle_carry_sft.cpp) directly imposes `pi(C)-pi(P)=k[j]` on consuming edges. Weighted graph components represent exact GF29 relative coordinates, reject forced collisions, and enumerate disjoint component translations with `pi(F)=0`. The mandatory carry prefix uses only ten observed p54 runes; all 47 complete p54 words may contribute constraints, with at most three omissions. Any completed permutation is checked against the full training register. A capped packing leaf or timed-out seed would prevent a negative conclusion.

Original necessary local filtering reduces the 93 unique general-q8 prefixes to 67 for each numeric vector, with 376 direct and 401 prime graph states. All 47 complete words retain local support. In the more general arbitrary-key graph relaxation, the two longest complete groups (12 and 45) have 154,551 and 118,278 compatible carry/word pairs across relative phases, minimum supports 134 and 90; every prefix retains support. This explains why isolated/pairwise feasibility alone does not decide the key.

[Compiled run 45718447093](https://github.com/FlareZ123/liber-primus/actions/runs/45718447093) (the diagnostic program deliberately exits nonzero after printing results):

| Vector / input | Result | Held-out truth | Unique holdout |
|---|---|---:|---:|
| Direct ordinal / plant 3301 | Exact action, 0 OOV | 17/17 | 10 |
| Direct ordinal / plant 1033 | Exact action, 0 OOV | 17/17 | 11 |
| Direct ordinal / original | Exhaustive negative, 376/376 carry states | not scored | not scored |
| Prime / plant 3401 | Exact action after resume at seed 7357, 0 OOV | 17/17 | 13 |
| Prime / plant 1133 | Exact action, 0 OOV | 17/17 | 11 |
| Prime / original | Exhaustive negative, 401/401 carry states | not scored | not scored |

The direct original search traversed 161,265 nodes, 1,507,329 constraint extensions and 8,922 completed-permutation checks, with zero capped packings, zero unresolved residual leaves and no timeout. Thus **no common alphabet permutation under the direct ordinal red8 shift vector supports the mandatory carry prefix and at least 44 of the 47 complete p54 words in the specified register**. This is a conditional exact negative for the whole arbitrary-per-word-start fixed-vector family, including any consistent continuous clock. It is not a rejection of arbitrary q8, alternate key derivations, other word segmentation, or more than three OOV words. No original holdout was consumed to obtain the exclusion.

The prime original fit was initially gated off because plant 3401 timed out at 7357/7982 completed states. The [seed-resume receiver](../sims/lp2_red8_prime_resume_sft.cpp) resumed at index 7357 and recovered the exact planted action at seed 7911, with 17/17 held-out truths and 13 unique held-out words. The [continuation run 45719137322](https://github.com/FlareZ123/liber-primus/actions/runs/45719137322) then exhausted all 401/401 original carry graph states, 214,909 search nodes, 2,248,736 constraint extensions and 8,762 complete-permutation checks in 19.8911 seconds, without any timeout, capped packing or unresolved residual. Thus the prime-derived fixed red8 vector is also **conditionally exactly excluded** under the same dictionary and three-OOV profile. The general common-cycle and alphabet-mapped models remain separate hypotheses.

### Continuous-clock fixed-vector lexical propagation

The original p54 body has exactly three ciphertext F positions. A continuous clock with fixed numeric shifts has eight initial phases and eight literal-hold histories (64 scenarios per key). Each consuming token `(C,k)` has one plaintext value globally; different tokens with identical C or identical k cannot share P. The [OOV-aware lexical propagator](../sims/lp2_red8_continuous_clock_lexical_propagation_sft.cjs) combines same-token support and singleton inequality conflicts, removing candidate words only when they require more than three distinct omissions or omit the mandatory carry. Eight planted histories retained every in-register true word (six plants with three explicit OOV words). On the original [machine-readable result](lp2-red8-continuous-clock-lexical-propagation-output.json), all 64 scenarios per vector remain locally feasible: direct carry domains 41–51, prime 38–56. This relaxation is not a key fit; the subsequent exact exclusions for both fixed vectors supersede their apparent local feasibility, including every continuous-clock specialization of either fixed vector.

## 4. Evidence that remains valid

### Long-anchor arbitrary-q8 receiver, p40–53

The affine-space receiver maintains all alphabet coordinates and key entries as affine forms over GF(29), adds exact edge equations, rejects forced coordinate collisions and period-four keys, and enumerates residual dimensions up to two exactly.

On two independent blind literary controls, the receiver recovered the exact effective action:

| Plant | Exact action | Training support | Held-out truth present | Unique held-out words |
|---|---|---:|---:|---:|
| Gibran | Yes | 24/24 | 40/40 | 33/40 |
| Emerson | Yes | 24/24 | 40/40 | 31/40 |

The discovery profile is the 24 p40–53 groups of length at least ten (261 runes); the first 40 shorter-group lengths are withheld. No plaintext words or starts are supplied to the receiver.

On the original 24 long p40–53 groups, the exact search exhausts 131/131 first-anchor options, 2,221 states and 14,615 extensions, with no candidate key and no timeout. This is only a conditional exclusion: the full chapter has 669 groups and permits 33 omissions under a 5% rule, enough to omit all 24 selected anchors.

A separate long-anchor extension rejects every arbitrary common-cycle q8 key with up to three omissions among the 24 selected anchors (1,012/1,012 first-anchor branches, 326,552 nodes, 3,028,059 extensions, 69,803 residual-coordinate enumerations, no unresolved leaves). It forces at least four of those anchors outside the lexicon, still within the chapter-wide 33-omission allowance. The chapter-wide model is therefore not excluded. Six other visual chapters also have strict all-long-anchor-in-register exclusions; p0–2 timed out. These results do not depend on the p54 transcription and remain valid within their stated finite-register conditions.

### Other finite source families

The earlier fixed-keyword, mapped-DIVINITY, fixed keyed-alphabet and red-title terminal conclusions used the defective p54/p55 segmentation described above and are withdrawn for those pages. The corresponding results on earlier visual chapters remain separate evidence and are not changed by this correction. No source-selected alphabet or key has been authenticated.

## 5. Next discriminating experiments

The source-corrected CP-SAT implementation is `sims/lp2_shared_gp29_q8_carry_prefix_sft.py`. The manual workflow `.github/workflows/lp2-shared-q8-carry-prefix-blind.yml` runs the F-hold CP-SAT regression and two independent blind plants first; it emits a positive gate only if both recover the exact effective action, all 47 training words, the carry prefix and all 17 held-out words. It does not fit the original automatically.

1. Run blind controls on the exact word-reset profile: 47 complete p54 body words (213 runes), a 10-rune prefix of one 11-rune carry, then its held-out final rune plus 16 complete p55 words (75 runes). The carry must use one starting phase and continue across the physical page boundary. Require exact effective-action recovery, all training truth, and held-out truth on both plants before fitting the original.
2. For the original prefix, use the 93 unique ten-rune prefixes from the 96 prefix-compatible length-11 dictionary forms as a necessary domain only; do not treat the final p55 rune as a separate word or phase reset.
3. Only after both blind controls pass, fit the original 47 complete p54 words plus the carry prefix with at most three OOV complete words. Freeze the action, then score the full 11-rune carry and 16 complete p55 words. Report all candidate counts and action ambiguity; a feasible training fit alone is not a solution.
4. Both fixed numeric interpretations are now excluded on the corrected profile. Test the alphabet-mapped interpretation separately on the same corrected blind profile. For mapped shifts, normalize the hidden \(\pi\) and key together; do not leak the planted action or plaintext.
5. If controls fail, or the original fit has no independently predictive holdout, retire these exact interpretations rather than expanding unconstrained keyword pools. Keep arbitrary-q8 work separate from the red8 hypotheses.

**Current conclusion:** the common-cycle mechanism remains a hypothesis. Both direct ordinal and prime-derived red8 shift vectors are excluded within the corrected finite-register model; the mapped interpretation remains open. No original plaintext or key has been recovered.
