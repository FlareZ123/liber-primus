# Unknown q8 group-anagram model: exhaustive terminal-chapter key exclusion

Agent 13, 2026-11-25, Director #2710. This is a complete finite all-key exclusion for a materially relaxed form of the authentic additive cipher, not a plaintext recovery.

## Frozen model and scope

Original p54–55 chapter, including red heading: 308 runes, 66 complete printed groups with page carries intact. Original group order is unconstrained. Each group may be any within-word permutation of a word in the frozen 35,944-form GP29 register (33,828 sorted multisets), with independent arbitrary start phase. Cipher C=P+K[phase] mod29 for nonzero P, advancing the shared cyclic q8 clock. Literal F (P=0) emits C=0 and holds phase. At C=0 explore both legal branches; consuming inverse P=0 forbidden. Grant 3 arbitrary OOV groups (floor(0.05×66)). The all-group independent-start relaxation is strictly more permissive than a continuous clock or arbitrary whole-group order, so failure excludes every stricter continuous receiver in this model.

This differs from #2695 fixed WELCOME/KOAN and #2684's ordered tuple bound. No extra key digits, private group keys, altered group membership, or different phases per individual letter.

## Completeness reduction

There are six exactly eight-rune groups with no ciphertext zero, at global rune offsets 12649,12657,12718,12734,12807,12824. Their plaintext contains no F, all eight phases occur once, and any one has a compatible plaintext multiset from the 4,676 zero-free eight-rune dictionary multisets. At least three of the six anchors must be covered even if every OOV group is an anchor. Partition into two triples. At least one triple contains at least two covered anchors. Enumerate the three pairs in each triple (six pairs).

For anchor pair A,B, fix A's starting phase at zero by rotating the unknown cyclic key. Rotate B through all eight relative phase alignments. At each aligned phase j, plaintext Q_j = P_j + B_j - A_j mod29. Index every eight-rune dictionary multiset by every 4+4 bipartition: sorted four-rune prefix bag → all complementary four-rune suffix bags. There are 13,504 possible nonempty prefix keys. For every nonzero ordered P_0..P_3, derive Q_0..Q_3; retain both only when their prefix bags exist. Enumerate every distinct permutation of every P complementary suffix, derive Q suffix using the four fixed deltas, and test exact complementary membership. Every such hit defines K_j=A_j−P_j mod29. No sampling, approximate score, beam truncation or search cap. Canonicalize keys by minimum rotation; deduplicate within a pair/shift. Test each remaining anchor, then all remaining groups (longest first), exploring all legal F hold paths and every group phase, rejecting only when >3 empty domains. Early rejection is monotone. All 6×8 partitions executed. This exhausts every key that could cover 63/66 groups, regardless of which groups are OOV.

## Executed original result

- 5,049,805 compatible prefix events.
- 1,550,552,624 suffix membership checks.
- 939,299 pair/shift candidate key evaluations (distinct within each partition, possible duplicates across partitions).
- 5,644 candidates pass the remaining anchor screen (≥3 of six covered).
- **0 keys cover 63 of 66 groups.** All 48 partitions completed; no original candidate to freeze or score.

Original CI run: https://github.com/FlareZ123/liber-primus/actions/runs/45572601468 (Node22, existing read-only workflow, successful). Full machine-readable output in [lp2-unknown-q8-group-anagram-exact.json](lp2-unknown-q8-group-anagram-exact.json). The first pair/shift was independently executed in connected V8, matching 26,631 candidates and 155 anchor passes, zero survivors; no need to rerun the expensive whole campaign.

## Unknown-key controls and withheld recovery

Two seeds (2710,2711) sample native words from held-out last-20% donor portions, requiring membership in the frozen register and matching every original group length. Randomly permute each word before encryption, use continuous phase starting at zero, generate unknown eight-digit keys, and ensure the six designated anchors are zero-free in ciphertext and plaintext. These are sampled length-matched native words, not contiguous natural prose; anchor selection conditions on structure, not recovery outcome. Controls include both literal-F holds and consuming zero events. Fit exclusively on 49 complete p54 groups ending at or before rune offset12880, withholding the seam-carry group and all later groups (17). Allow two arbitrary fit OOV. The exhaustive algorithm does not receive hidden key or withheld group content during fit. True keys are checked only afterwards.

| Seed | Fit candidate evaluations | Anchor passes | Surviving cyclic keys | Withheld covered | Withheld true bags supported |
|---|---:|---:|---:|---:|---:|
| 2710 | 812,994 | 21 | 1 (true) | 17/17 | 17/17 |
| 2711 | 813,427 | 17 | 1 (true) | 17/17 | 17/17 |

Controls CI run: https://github.com/FlareZ123/liber-primus/actions/runs/45572609822 (success). True canonical keys [5,10,17,15,19,18,24,6] and [6,25,16,12,15,27,27,27]; both exact, up to phase rotation. All 66 true phase/multiset edges present per control. Independent-phase lexical domains are ambiguous in 36/66 and 34/66 groups. Using the **known** control group order, a forward/backward continuous-phase DP yields complete replay witnesses: 308/308 each, true multisets 66/66 each, withheld true multisets 17/17 each. Among phase-viable domains 45/66 words are uniquely identified in each, with 11/17 and 10/17 withheld words unique. Group order itself remains unidentifiable from the per-group receiver. This replay check was executed in connected V8 with the same inputs and recovered keys; see separate replay SFT.

## Decision and reproduction

Retire all unknown shared cyclic q8 additive literal-F keys for the terminal printed-group anagram model **within the frozen broad word register and 5% OOV allowance**, even granting arbitrary independent word phases and group order. No claim about unbounded OOV, decoy segmentation, altered group membership, longer periods, or nonadditive keys. The finite lexicon and synthetic calibration do not authenticate an anagram instruction. No unknown plaintext or authentic key.

- `node sims/lp2_unknown_q8_group_anagram_exact_sft.cjs` (original exhaustive)
- `node sims/lp2_unknown_q8_group_anagram_controls_sft.cjs` (two withheld-control fits)
- `node sims/lp2_unknown_q8_group_anagram_replay_sft.cjs` (continuous exact replay from saved key outputs)

Original/controls executed from commits 8200cde3e2945ffaae3d6a1c8a6ddd819bbc91a4 / 204ae827446b0b5673f171e3ac99c34e426f56b2, with same solver blob 8c89fa747097661f2d736bb7810762c00110159c.
