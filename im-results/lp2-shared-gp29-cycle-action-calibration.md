# Shared GP29 cycle-action calibration

**Status: no Liber Primus plaintext or key recovered. The p54–55 word-reset calibration basis is now corrected: the 48/17 JSON records physical fragments, not independent lexical words, and the earlier 49/222 + 17/86 fixture includes the red heading as body input. Both terminal profiles are withdrawn as evidence for the red-heading-key, per-word-reset model.** The strongest surviving result is the independently calibrated long-anchor receiver on p40–53. The red eight-rune p54 heading now supplies a concrete source-selected key candidate, Both fixed numeric interpretations and the positive alphabet-mapped interpretation with arbitrary word starts have now been conditionally excluded by blind-calibrated exact searches. The negative mapped interpretation and unrestricted q8 receiver have unresolved computational tails.

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

A useful exact representation is now implemented in `sims/lp2_shared_gp29_q8_cpsat_sft.py` as `--mode centralizer`. Choose a phase \(r\) with \(k_r\ne0\), rotate phase labels to put it at zero, and scale the alphabet coordinates so \(k_0=1\). The inverse phase maps are then powers of one 29-cycle \(g\). Conversely, every permutation commuting with a full 29-cycle is one of its powers: the centralizer of a 29-cycle is cyclic. Thus the common-cycle model can be represented exactly by one 29-cycle and seven commuting permutations, with primitive q8 enforced by requiring that at least one opposite pair \(f_j,f_{j+4}\) differs. This removes the explicit alphabet and shift variables. Its corrected blind controls terminated UNKNOWN on both plants after 1,200 seconds each ([run 45721006255](https://github.com/FlareZ123/liber-primus/actions/runs/45721006255)); no original fit was performed. A second exact encoding below keeps the alphabet coordinates and phase shifts explicitly and turns every consuming edge into one GF(29) linear equation.

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

The direct [linearized CP-SAT wrapper](../sims/lp2_shared_gp29_q8_carry_prefix_linearized_cpsat.py) and [blind-control workflow](../.github/workflows/lp2-shared-q8-linearized-blind.yml) tested this smaller formulation against the same two blind plants (run [45722459679](https://github.com/FlareZ123/liber-primus/actions/runs/45722459679)); both terminated UNKNOWN at 1,200 seconds. No original fit has been run. The remaining challenge is the discrete choice of dictionary word and per-word start phase; linear consistency can reject impossible choices before or during search.

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



### Mapped red8: calibrated fixed-clock inverse and line-clock frontier (Agent10, 26 November)

The original unconstrained per-word mapped receiver [run 45719465610](https://github.com/FlareZ123/liber-primus/actions/runs/45719465610) timed out on its first plant (15/5640 carry states, 600 seconds), then crashed before the second; it is not a negative. The positive mapped interpretation has a stronger structure: a consuming glyph is possible iff C != K[j] for every permutation fixing F. [Exact structural and lexical report](lp2-p54-mapped-red8-continuous-structural.md#source-mapped-positive-sign-minimal-printed-boundary-resets-agent10-26-november) gives two-change minima on p54 (11 line-only paths, 85 word-only), with all 11 line paths finishing phase7. A [known-clock affine inverse](../sims/lp2_red8_minimum_line_reset_sft.cpp) recovered both independent planted alphabets and their unique full holdouts, then exhaustively rejected all 11 original minimum line schedules (682/682 carry seeds, 94,884 nodes, 241,557 joins, no timeout; [run 45729059087](https://github.com/FlareZ123/liber-primus/actions/runs/45729059087)). Mandatory carry and 44/47 complete p54 words are required. It does not exclude arbitrary line resets or arbitrary word resets.

Independent p55 structural scoring rejects phase7 at offset8 before its first line end, so a shared line clock without a page-seam reset must end p54 at phase2; minimum jointly possible cost is four changes, three on p54 and one on p55. The terminal line then has exactly one possible clock history, as does one interior p54 line even with independent line starts. The minimum jointly feasible line-clock fit now exhausts all 88 p54 histories (83 in [45730165072](https://github.com/FlareZ123/liber-primus/actions/runs/45730165072), five in [45748363212](https://github.com/FlareZ123/liber-primus/actions/runs/45748363212)), with no key under the same lexical coverage. The independent [minimum word-mask inverse](lp2-p54-mapped-red8-continuous-structural.md#exact-shared-mask-inverse-of-minimum-printed-word-resets-agent10-26-november) recovered both blind planted alphabets and retained the correct full text among two clock-dependent outputs per control; it then exhausted all 85 original minimum word-reset histories, 126 carry states, no candidate ([45748605041](https://github.com/FlareZ123/liber-primus/actions/runs/45748605041)). The [deterministic affine boundary clock](lp2-p54-mapped-red8-continuous-structural.md#deterministic-affine-boundary-clock-agent10-26-november) exhausted 4096 initial/rune/word/line increment combinations; its sole surviving clock fails the p55 seam, and both p54 histories exhaust lexically with no key ([45747855538](https://github.com/FlareZ123/liber-primus/actions/runs/45747855538)). Arbitrary nonminimal starts remain distinct; no original plaintext is known.

A distinct ciphertext-GP-prime affine phase clock (Agent24) exhausts 32,768 parameter tuples, with one joint p54–55 structural survivor. Both known-clock hidden-alphabet controls pass, but the original two compatible p54 histories exhaust 1,702/1,702 carry seeds with no key at the same finite lexical threshold. This retires the compact positive mapped-red8 prime-driven clock, not arbitrary phase evolution. [Exact decision](lp2-p54-mapped-red8-continuous-structural.md#ciphertext-gp-prime-driven-affine-phase-clock-agent24-26-november).

### Negative-sign mapped red8 continuous specialization

The [negative-sign continuous inverse](../sims/lp2_red8_negative_continuous_inverse_sft.cpp) imposes pi(P)-pi(C)-pi(K[j])=0. Both known-clock control plants recover the exact normalized permutation and all heldout truths. The original p54 exhausts all 64 phase/hold histories, all 2,744 carry seeds, 59,956 nodes, 96,318 joins, zero completed permutations and zero candidates, with no timeout ([run 45730248546](https://github.com/FlareZ123/liber-primus/actions/runs/45730248546)). Thus the negative-sign continuous mapped-red8 specialization is conditionally excluded at the same frozen 38,938-form register, mandatory carry and <=3 OOV budget. This strengthens the structural finding above: the matching witnesses cannot extend to lexical solutions in this register.

The blind arbitrary-word-start receiver remains a different model. Earlier indexed positive/negative implementations timed out on both plants. The [both-sign posting-bitset inverse](../sims/lp2_red8_both_word_reset_bitset_sft.cpp) subsequently passed both blind controls for each sign (exact normalized alphabet, 47/47 training, 17/17 holdout, 12–14 unique). On the original, positive sign exhausts all 447 carry seeds, 5,604,640 nodes, 149,204,108 joins and 1,897 complete permutations without a qualifying key; negative sign times out at 304/343 seeds, 4,961,511 nodes, 127,920,341 joins and 770 complete permutations. [Run 45748837642](https://github.com/FlareZ123/liber-primus/actions/runs/45748837642). The positive mapped key is therefore conditionally excluded at the frozen register, mandatory carry and <=3 OOV complete words; negative sign remains incomplete. Parallel completion count alone is not a contiguous seed-prefix checkpoint.

### Unrestricted q8: calibrated symbolic key-difference inverse and carry-phase quotient

The [symbolic key-difference graph inverse](../sims/lp2_shared_gp29_q8_symbolic_graph_sft.cpp) represents consuming edges as pi(C)−pi(P)=k[j]. Component merges retain symbolic differences, cycles impose seven-dimensional gauge-fixed key equations, collision hyperplanes prune candidate joins, and residual keys are checked by disjoint component translation packing. The corrected zero-OOV blind controls pass: seed3301 47/47 training, 17/17 holdout, 13 unique; seed1033 identical; both recover the exact effective action up to rotation. Its 2,700 true-edge regression also passed. The original at <=3 OOV timed out after 7/720 carry seeds, 6,814,720 nodes, 45,799,424 joins, 7,171,990 key tests and 10 full permutations. [Run 45747412355](https://github.com/FlareZ123/liber-primus/actions/runs/45747412355). This is a computational timeout, not a negative cipher result.

A new exact symmetry reduction fixes phase zero at the first nonidentity consuming carry edge. Such an edge necessarily has nonzero k because pi is bijective, so scaling it to k0=1 is legal. Rotate every other word's arbitrary start by the same offset; this preserves the cipher and all F holds. If a candidate has no nonidentity consuming edge, retain all old starts. The p54 carry prefix has no ciphertext F and contains ten consuming positions, so a primitive q8 action must have a nonzero edge in that prefix. An independent full GF(29) RREF of the original carry constraints confirms **720 → 93 distinct necessary affine states**, retaining all 93 admissible lexical prefixes from the full 2,168-prefix register; all 93 canonical starts are zero. The speedup in carry count is 7.74× before any further lexical pruning. Commit 550febc12d32dbe0bbd17add66541b1ce2bce27a integrates this quotient and exact posting-bitset intersection; it adds 400 planted gauge regressions and retains both original blind action controls. [Run 45754156790](https://github.com/FlareZ123/liber-primus/actions/runs/45754156790) passed all 2,700 true-edge and 400 carry-gauge regressions and both blind controls (each 47/47 training, 17/17 holdout, 13 unique), but the original timed out after 11/93 carry seeds, 8,987,072 nodes, 66,104,316 joins, 8,101,619 key tests, 247 packing calls, and 12 complete permutations. The job reported `found=0`, `timed=1`, `exhausted=0`; no JSON artifact was uploaded. No original fit or family exclusion is claimed. The original search is still incomplete.

The independent [carry-gauge and counting SFT](../sims/lp2_shared_gp29_q8_carry_gauge_sft.cjs) also quantifies why a successful original training fit would be worth pursuing. The effective primitive q8 action family has exactly 28! × (29^8−29^4)/(28×8) = 680888772785240293485767621345280000000 members modulo the free scale and rotation gauges. For a fixed action, each length-n register word emits at most eight ciphertexts. With the 223-rune training shape, its exact continuous adjacent-equality mask (two equalities), the mandatory carry prefix, and at most three omitted complete groups, a union counting bound over all effective actions and every exactly-three omission subset gives log10(probability) ≤ −58.3292958341 under the uniform conditional-mask null. The numerator ignores cross-group equality constraints, so the bound is conservative for that null. This is a mathematical calibration of the fixed finite family, not a general p-value for all post-selected repository hypotheses or an authenticated cipher. The full 2,168 carry prefixes, not the 93 selected by the actual ciphertext, are used in this bound. The computation was executed in the connected V8 runtime using exact BigInt counts and canonical source inputs; the saved standalone wrapper has not yet been run.

### Incremental exact inverse (Agent29, 26 November)

The [incremental graph receiver](../sims/lp2_shared_gp29_q8_incremental_graph_sft.cpp) retains a safe superset of each parent's viable lexical options, filters it against the child's additional constraints, and never drops untested options when a capped minimum-domain query stops early. For direct packing, the largest component is anchored at coordinate zero and the final alphabet is translated to fix F; this is an exact translation gauge. Early enumeration is permitted when the bound on remaining key/packing choices is at most 8192. Both hidden controls recover the exact action, all 47 training words and all 17 held-out words (13 unique per plant), with successful inherited-domain regression checks ([run 45776866719](https://github.com/FlareZ123/liber-primus/actions/runs/45776866719)). The [manual original matrix](../.github/workflows/agent29-shared-q8-incremental-shards-manual.yml) pins the calibrated source commit, partitions all 93 original carry seeds into 31 disjoint three-seed shards, and retains actual completed seed IDs. [Run 45777297359](https://github.com/FlareZ123/liber-primus/actions/runs/45777297359) was dispatched. Original result pending; no exclusion or candidate is claimed. The model and frozen training/holdout split remain unchanged.

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

The earlier source-corrected CP-SAT implementation is `sims/lp2_shared_gp29_q8_carry_prefix_sft.py`. The manual workflow `.github/workflows/lp2-shared-q8-carry-prefix-blind.yml` runs the F-hold CP-SAT regression and two independent blind plants first; it emits a positive gate only if both recover the exact effective action, all 47 training words, the carry prefix and all 17 held-out words. It does not fit the original automatically.

1. Collect run 45777297359's actual completed seed IDs and candidates; only their exact union can establish original exhaustion. Do not duplicate its active shards or treat a timeout as a negative.
2. Fit only the original 47 complete p54 body words plus mandatory 10-rune carry prefix, at most three OOV complete words. Freeze any action before reading the p55 suffix and 16 complete words. Report all lexical candidates, action ambiguity and the exact forward replay.
3. Both fixed numeric vectors and the positive mapped-red8 model with arbitrary word starts are conditionally excluded on the corrected profile. Agent10 owns the negative mapped remainder; do not duplicate it. The general unrestricted q8 family is not source-selected and must be treated as exploratory even if it yields a lexical fit.
4. If a general q8 candidate appears, check the source heading relation, other independently withheld groups and whether an authored clock/order is recoverable. The original training-fit counting bound makes a full fit highly discriminating under its stated null; it does not authenticate a particular key.

**Current conclusion:** the common-cycle mechanism remains a hypothesis. Direct ordinal, prime-derived and positive alphabet-mapped red8 shifts are conditionally excluded at the corrected finite-register threshold. Negative mapped-red8 and unrestricted q8 searches have not exhausted their original domains. No unknown plaintext or key has been recovered.
