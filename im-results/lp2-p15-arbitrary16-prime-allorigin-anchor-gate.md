# p15–22: arbitrary fixed 16-position permutation plus authentic p56 prime clock, all-origin intact-group gate

**Decision:** conditional exclusion, not plaintext recovery. This extends the source-selected reciprocal spiral exact reachability test to every 16! fixed block permutation, all 16 leading-fragment alignments and prime origins 0–3301, **only if two designated original printed groups are intact dictionary words**. The source does not establish that spaces are plaintext boundaries.

## Method

Use 1,883 original GP29 runes beginning at p15 offset20 and continuing through p22; preserve the physical transcription's word boundaries. Inner encryption is actual p56 transparent-F prime-minus-one: P=0 emits C=0 and holds; P≠0 consumes the next prime shift. Outer encryption maps every full consecutive 16-rune block through one unknown bijection, leaving leading/trailing fragments unchanged.

Select the two longest complete printed groups within the first 928 target runes, offsets139 (13 runes) and302 (12 runes). Lexicon: TextBlob word frequencies plus solved native GP sections excluding the plant donor; enumerate all valid GP tokenizations, including TH/NG/ING and historical normalization. There are 715 length-13 and 1,430 length-12 distinct spellings. For an anchor at i, the number h of previous literal-F holds cannot exceed the number of observed zeros through the block containing i (a conservative overbound). For every possible consuming-clock start j=origin+i-h, encipher every same-length dictionary word. For each resulting symbol, collect the physical block columns containing that symbol. The anchor covers distinct modulo16 slots, so an injective bipartite matching is a necessary and sufficient condition for extending that one anchor to some 16-slot bijection. Require an origin compatible with both anchors, deliberately allowing different permutation assignments and different relaxed hold histories between anchors. Thus an empty origin set excludes the much stronger shared-permutation model; a surviving set would not prove feasibility.

## Executed results

| Leading fragment | Survivors after 13-rune anchor | Survivors after 12-rune anchor |
|---|---:|---:|
| 0–3, 6–15 | 0 | not needed |
| 4 | 12 | 0 |
| 5 | 6 | 0 |

The longest anchor by itself rejects all 3,302 origins in fourteen alignments. In leads4/5 the second anchor rejects all remaining origins even with independent arbitrary per-anchor permutation assignments. No actual plaintext or key candidate remains in this precise dictionary/intact-group family.

Native GP plants of the same 1,883-rune length use a fixed non-spiral permutation, with (origin,lead)=(133,0),(1033,4),(3301,5). All twelve longest anchors retain the correct origins in every plant; final origin sets contain 25,23,9 candidates respectively. These are feasibility controls, not unique key recoveries. The origin0 single-anchor script additionally recovers the true partial mapping on each of twelve native anchors.

The first script's independent origin0 test rejects the three longest original groups. The stronger all-origin result supersedes it for decision purposes.

## Limits

This is a lexicon-conditional gate, not an English impossibility theorem. Printed spaces may be enciphered or nonlinguistic; specialized/archaic or out-of-vocabulary words may escape. Origins outside 0–3301, changing prime clocks, alternate block widths and nonconsecutive permutations are outside scope. The original free-permutation, language-independent SMT experiment timed out; do not treat it as UNSAT. No CI run claimed: the exact JS functions were executed on fetched repository source in the local V8 tool.

- [All-origin/phase reproducer](../sims/lp2_p15_arbitrary16_prime_allorigin_anchor_sft.cjs)
- [Origin0 per-anchor mapping reproducer](../sims/lp2_p15_arbitrary16_prime_anchor_sft.cjs)
- [Prior fixed source spiral reachability](lp2-p15-spiral-prime-fhold-allorigin-gate.md)

**Next:** do not fund further arbitrary permutations under this intact-group prime-clock interpretation without independent evidence that the printed groups are real plaintext words or a new author-selected operand.