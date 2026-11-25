# p8 as a deleted-rune sidecar for p3–7: exact original receiver

**Agent 7, 25 November 2026. Decision:** reject forward one-for-one repeat removal and static-substitution reconstruction, even when sidecar symbols and their order are completely unconstrained, under the stated register/5% OOV budget. Authentic historical q8/q13 additive receivers also fail with arbitrary restoration positions. No authenticated key or new plaintext.

## Motivation and frozen source rule

The original five-page p3–7 scroll contains 255 complete printed groups, and physical p8 contains 255 GP29 glyphs. The manuscript-wide equality deficit motivates a specific *information-restoration* rival to using p8 as an address, word checksum or reset key: assume p8 rune i records a single ciphertext or plaintext rune omitted from scroll group i. The omission location is unknown, so enumerate every insertion position. Use raw p8 in printed order, including its red title; do not use the previously fitted GF4 correction or assume a new historical operation. A bijective symbol map preserves equality patterns. The 255 alignment is real but does not authenticate the omission rule.

The source parser joins cross-page groups and checks exact flattened rune identity against the canonical physical p3–7 arrays. Lexicon: 42,793 distinct rune sequences, lengths 2–13; all supported tokenizations of the pinned frequency dictionary plus solved Cicada and first 80% literary donors, with the repository's GP29 aliases. The vocabulary is finite and not claimed complete. Input Git blob IDs are in the raw result.

## Repeat-restoration test, no language model

If the removed rune was an adjacent repeat, its value necessarily occurs in the surviving group. This remains necessary even if there were more than two equal runes in the original group. Count an aligned sidecar label as supported only when it maps to some existing group rune.

| Relative alphabet mapping | Maximum supported / 255 |
|---|---:|
| Identical | 34 |
| Any bijection (29! keys) | 95 |
| Any deterministic function (including noninjective) | 103 |

For the bijective case form counts M[y,x] of groups labeled y containing x. The Hungarian integer primal/dual certificate proves the exact maximum assignment; independent row maxima give the exact arbitrary-function bound. At least 152 groups violate every deterministic same-label mapping. This excludes the hypothesis that every sidecar record restores a duplicate under a static alphabet relation, not mixed omission reasons or occurrence-dependent keys.

## Arbitrary omitted rune, arbitrary position, all static bijections

Each candidate word of length L+1 determines a partial permutation from the L observed glyphs plus one inserted glyph. For an independent sidecar alphabet, enumerate every deleted plaintext position and retain both the partial main map and the missing plaintext rune. All equal/unequal constraints are exact; no language score or proposed crib. Two domains conflict iff no pair of partial bijections is jointly extendable (including the independent side label constraint where relevant).

Enumerate all supported length>=8 anchor pairs and build their incompatibility graph. Any globally feasible set must be independent. Exact memoized branch recurrence chooses a vertex v and returns the larger of excluding v or including v and excluding its neighbors. Independent-set size is an upper bound on joint coverage, not proof that every independent set has a common key. Unsupported isolated groups and forced anchor omissions are disjoint.

| Alphabet model | Isolated lexical coverage | Supported long anchors | Incompatible pairs | Exact maximum independent set | Minimum OOV of 255 |
|---|---:|---:|---:|---:|---:|
| Shared | 249 | 21 | 133 | 7 | 20 |
| Separate main/sidecar maps | 253 | 25 | 124 | 14 | 13 |
| Arbitrary private missing rune, sidecar entirely ignored | 253 | 25 | 121 | 14 | 13 |

A 5% allowance permits at most floor(255×0.05)=12 OOV slots. Both fail; separate-alphabet rejection is narrow (one extra OOV) and must not be exaggerated. Even the greedy disjoint-pair bound for the shared model already gives 15 OOV. The exact independent-set search visits 33, 20 and 18 memo states, respectively. In the third model, the omitted plaintext rune may be chosen privately for every group, independently of p8; domains are deduplicated by the surviving-group map alone. Thus even an arbitrary reordering or relabeling of p8 cannot rescue the shared static main-alphabet model within the 12-slot OOV budget. Machine output preserves all graph edges and independent witnesses. This result grants arbitrary insertion locations and, in the third model, completely removes the sidecar pairing constraint. It retains order within each surviving group and the common static main alphabet. Within-group reordering, changed register, dynamic substitution and alternate segmentation escape.

## Historical additive decryption after insertion

Test the two historical GP29 keys DIUINITY (8) and FIRFUMFERENFE (13), signs ±, ordinary and literal plaintext-F holds. For each group and each insertion position, enumerate every start phase and every legal inverse path; store whether a native vocabulary candidate exists for each start/end phase. An exact max-plus DP carries phase across groups, allowing OOV legal paths. Also report the more permissive independent-phase word bound.

| Key | Sign | F hold | Independent maximum | Continuous maximum |
|---|---:|---|---:|---:|
| DIUINITY | + | No | 33 | 9 |
| DIUINITY | + | Yes | 32 | 14 |
| DIUINITY | − | No | 34 | 13 |
| DIUINITY | − | Yes | 34 | 19 |
| FIRFUMFERENFE | + | No | 42 | 14 |
| FIRFUMFERENFE | + | Yes | 41 | 21 |
| FIRFUMFERENFE | − | No | 44 | 11 |
| FIRFUMFERENFE | − | Yes | 43 | 16 |

All 255 groups have some legal inverse in each model; lexical coverage rejects these historical-key receivers under the stated register. The bounds allow unknown initial phase and unknown restoration positions, but no independent sidecar substitution in the additive receiver.

## Controls and limitations

Three held literary donors supply length-matched in-register examples (252 Gibran, 255 Shakespeare, 255 Emerson). The Gibran holdout lacks three 13-rune slots; exclude those only from its plant rather than manufacture donor words. All 762 controls retain the true partial main/sidecar key under both models. Synthetic repeat-membership controls pass all 762 under same and independent alphabets. Four independent continuous historic-key plants (Shakespeare, 255 words each, two keys × two clocks) all achieve 255/255 lexical coverage both independently and continuously. These are feasibility controls, not unique key recovery or original plaintext validation. All experiments ran directly in connected V8 with exact code core; standalone Node wrapper and CI not executed.

## Reproduction and decision

- [Read-only SFT](../sims/lp2_scroll255_p8_deleted_rune_sidecar_sft.cjs): run with Node from the repository.
- [Machine output, all graph edges, witnesses, input blob IDs and controls](lp2-scroll255-p8-deleted-rune-sidecar-output.json).
- Related, distinct prior receivers: [character-address](lp2-scroll255-direct-word-character-number-original-gate.md), [word-reset prefix](lp2-scroll255-p8-wordreset-prime-prefix-gate.md), [plaintext checksum](lp2-scroll255-p8-plaintext-checksum-original-gate.md).

Retire these particular deletion sidecars and the broader static main-alphabet single-omission architecture at the stated OOV budget. They do not establish that the 255-count alignment is accidental or exclude all deletion encodings. New work needs a source-selected omission rule or a different recipient; no tuning of the OOV threshold to rescue the static model. No change to authoritative plaintext frontier.
