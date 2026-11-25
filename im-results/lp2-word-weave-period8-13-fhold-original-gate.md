# Fixed geometric printed-word weave with native F-transparent Vigenère: original-cipher inverse

## Decision and scope

The solved p57 Parable says to shed our own circumferences; the earlier LP1 WELCOME and KOAN establish consuming GP29 additive keys of periods eight and thirteen with literal plaintext-F holds. An outside-in weave of each complete printed group is a literal, invertible interpretation of successive circumferences: positions 0,L−1,1,L−2,… . The author did **not** specify this ordering or this layered cipher. This is a conditional, finite-lexicon attack on that candidate, not an authenticated receiver. The two fixed layer orders are distinct from the earlier direct shell/interior arithmetic pad. It grants a new key per chapter and an independently free starting key phase for every long anchor.

Canonical input is the 58-page corpus and transcription under `resources/liber-primus` (all 58 per-page tapes exactly match), 2,896 complete unknown groups and 12,956 GP29 runes. Pages at chapter edges are joined only when the entire printed group is inside a tested chapter; cross-chapter groups are not anchors. A zero-free ciphertext group cannot contain a plaintext F-hold, even with a transposition. The frozen TextBlob lexicon plus the nine solved native registers, using the existing QU/V/K/Q/Z/ING/IO GP normalization and exact native spellings, yields 29,079 distinct GP words. The controls omit the target native section from the lexicon additions and trigram counts.

## Constructive inverse and result

For period 8 a zero-free word of length at least 8 fixes a candidate cyclic key up to phase rotation. Enumerate all dictionary spellings, undo the weave on the relevant layer, reject conflicting residues within each key slot, and count the number of distinct anchors admitting each key class. A fixed-key Viterbi over word-local native trigram score plus a finite lexical bonus allows every legal F-hold, keeps the consuming phase continuous, and exactly replays recovered paths. Key selection uses only the fitting prefix and the holdout begins at the frozen phase.

The two target-excluded native WELCOME and LOSS sections with two hidden constructed q8 keys in both layer orders recover all four keys, 1,250/1,250 fitting and **1,290/1,290 withheld** signs. The original nine chapters give 247 eligible long groups; in **all 18 chapter/order cases** the maximum key support is one, so at least **238/247** of these groups must fall outside the finite register, even under independent anchor phases and nine unrelated keys. No original fitting prefix admits a two-anchor key, so no original suffix was scored.

A broader relaxation independently chooses either layer order and any dihedral orientation of the outside-in order for each word (all rotations and both reading directions). The exact numeric key-class union (base29 integer, canonical rotation; 29^8 < 2^53) gives maximum support **two in every chapter**, forcing at least **229/247** eligible groups outside the same register. Two native controls with varying layer order/orientation retain 7/7 and 11/11 eligible in-register anchors under a unique maximum support key class. This is a necessary-condition relaxation: it does not decode arbitrary orientation sequences.

For period 13, all 73 zero-free original groups of length >=10 are processed with exact pair projection joins. For relative phase r, require equality of residues at the overlap; enumerate all 13 relative offsets. Pair unions covering all 13 slots supply full key classes. Incomplete unions remain graph edges, and maximum clique size is a rigorous upper bound on simultaneously lexical anchors (pairwise compatibility is only necessary). For fixed weave-before every chapter has zero compatible pairs; at least 64/73 eligible groups are forced out of register. For weave-after exactly two chapters have one compatible pair each (p27–32 and p33–39), with all other chapters having none; at least 62/73 groups are forced out of register. The first pair never covers all 13 slots. The latter produces one full class [0,4,19,20,11,8,26,12,11,0,9,1,21] on the fitting 80% of p33–39; it has no complete legal fitting path, even with all initial phases. No original suffix scored. Three of four target-excluded native q13 plants recover exact keys and **442/442 withheld** runes; the WELCOME weave-before plant had only one eligible fitting anchor and therefore failed to recover a key. This explicitly exposes the q13 algorithm's incompleteness where anchors do not cover the key.

| Chapter | q8 eligible | q8 arbitrary-dihedral max | q13 eligible | q13 fixed before / after maximum clique |
|---|---:|---:|---:|---:|
| 0–2 |15|2|3|1/1|
| 3–7 |19|2|7|1/1|
| 8–14 |30|2|9|1/1|
| 15–22 |40|2|12|1/1|
| 23–26 |18|2|4|1/1|
| 27–32 |28|2|11|1/2|
| 33–39 |34|2|10|1/2|
| 40–53 |55|2|15|1/1|
| 54–55 |8|2|2|1/1|

## Reproduction and next fork

Run the three read-only Node CommonJS SFTs from repository root:

- [Fixed q8 complete key classes and predictive inverse](../sims/lp2_word_weave_period8_fhold_exact_sft.cjs), [raw](lp2-word-weave-period8-fhold-exact.json)
- [All per-word dihedral orientations q8 exact bound](../sims/lp2_word_weave_dihedral_period8_fhold_bound_sft.cjs), [raw](lp2-word-weave-dihedral-period8-fhold-bound.json)
- [Fixed q13 partial projection joins and predictive inverse](../sims/lp2_word_weave_period13_fhold_projection_sft.cjs), [raw](lp2-word-weave-period13-fhold-projection.json)

All three sources actually executed in connected V8 with filesystem adapters serving the exact repository inputs. This is not a Windows/Node22 CI result. The original controls' decoded native text is from constructed encryptions, not unknown LP2. No authentic unknown plaintext or key recovered. Retire the specified layered word-weave hypotheses under intact printed groups and this finite lexical register. The broader q8 orientation result removes the need to tune shell orientation. Do not escalate to unconstrained word transposition or other period sweeps absent a source instruction. A genuine source-selected receiver, changed segmentation or different cipher architecture remains open.
