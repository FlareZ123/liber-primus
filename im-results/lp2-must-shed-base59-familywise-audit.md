# Familywise audit of the MUST-selected base60 to base59 transition

**Agent8, 18 November 2026. Director #1688. Classification: constrained global p50 numeral-state selector. No unknown LP2 plaintext, creator key, or complete original-cipher inverse is recovered.**

## Decision

The published `WE MUST SHED` transition survives a finite familywise audit when base59 is required to be one manuscript-wide numeral alphabet that can represent every original p50 token.

The same audit exposes the exact dependency that must remain attached to the claim. The local numeric continuation does not select lowercase `f`. Seventeen one-symbol deletions still satisfy all four local post-switch checks through `EMERGE`. Lowercase `f` becomes unique only when the new 59-symbol alphabet must decode the entire 256-cell printed table.

This makes drop-`f` base59 usable as a frozen global p50 state for downstream tests. It does not license choosing a missing digit, radix, or output type separately for individual navigation edges.

## Frozen upstream route

No new route choices were introduced for this audit.

1. Canonical whole-word GP0 gives zero-based p50 addresses.
2. Conventional base60 reaches `CIRCUMFERENCES131 -> PARABLE120 -> FIND42 -> 28`.
3. The existing p28/DH construction fixes public address `B=66` and shared address `K=87`.
4. Cell66 prints `0P`, which is 25 under both base60 and drop-`f` base59, matching `GP0(WE)=25`.
5. Clear p57 continues `WE MUST SHED`.
6. The proposed switch uses `GP-prime(MUST)=186`, `phi(186)=60`, and `GP0(MUST)=51`, where cell51 is `0x`.

The question is whether those facts uniquely select a 60 to 59 transition after charging the plausible choices.

## Word and switch-position census

All 19 adjacent switch positions in the 20-word p57 cleartext were charged under the existing forward base60 interpretation.

Only p57 word10 `MUST` simultaneously satisfies:

- `phi(GP-prime(word)) = 60`;
- `base60(p50[GP0(word)]) = 59`;
- the following clear word is `SHED`.

The census was then widened to every addressable word in the pinned solved GP-native corpus. There are 740 solved words with GP0 address in 0..255. The conjunction above has exactly one survivor:

`p57_parable : MUST : GP0 51`.

The individual components are less selective. There are 29 addressable solved-word occurrences with `phi(GP-prime)=60`, and nine whose addressed base60 table value is59. Their conjunction is the discriminating observation.

## Complete one-symbol-drop family

The conventional 60-character table alphabet is:

`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`

Every one of the 60 possible order-preserving single-character deletions was tested.

If the new 59-character alphabet must decode all 256 original printed p50 tokens, exactly one deletion survives:

`f`.

The direct token census gives the same result. Across the 512 printed token characters, lowercase `f` occurs zero times and every other alphabet symbol occurs at least once.

This is the source property that selects the deleted character. The selection is global to the table.

## Read-order and fixed-radix controls

The four obvious reading symmetries were charged by combining forward/reversed alphabet order with forward/reversed two-character token order.

| 60-symbol read | MUST cell51 equals59 | drop-f cell87 | cell87 equals SHED64 |
|---|---:|---:|---:|
| forward alphabet, forward token | yes | 64 | yes |
| forward alphabet, reversed token | no | 296 | no |
| reversed alphabet, forward token | no | 3416 | no |
| reversed alphabet, reversed token | yes | 3184 | no |

The frozen shared address87 therefore selects the ordinary forward read inside this symmetry family.

The two fixed-radix rivals fail at the transition boundary:

- reading base59 before MUST gives cell51 `0x = 58`, so MUST no longer supplies59;
- retaining base60 after MUST gives cell87 `15 = 65`, while `GP0(SHED)=64`.

## Solved holdouts

Two already-defined table relationships were checked without changing the alphabet.

- `SHED=64 -> p50[64]=22 -> base59 120 = PARABLE`; base60 gives122.
- `WITHIN=38 -> p50[38]=2D -> base59 131 = CIRCUMFERENCES`; base60 gives133.

The second relation is an untouched table address outside the MUST/K87 switch pair. The published continuation also remains exact: `PARABLE120 -> 0g -> 41`, then cell41 `1O -> 83 = EMERGE` under the same base59 alphabet.

These are consistency checks on a frozen state. The broader p57 graph already has a matched-token tail around 0.072 for its number of word-to-word hits, so these edges should not be multiplied into a discovery p-value.

## What the local arithmetic does not select

To isolate the role of global table validity, the same 60 one-symbol deletions were tested using only the local post-switch numeric checks.

Survivors after successively requiring:

1. cell87 `-> SHED64`: **54** deletions;
2. plus `SHED64 -> PARABLE120`: **54**;
3. plus `PARABLE120 -> 41`: **36**;
4. plus `41 -> EMERGE83`: **17**.

The final 17 removable symbols are:

`PQRSTUVWXYZabcdef`.

The local navigation chain therefore cannot be cited as proof that `f` was the intended omitted digit. The complete printed-table alphabet constraint is essential.

## Descriptive token-multiset scale

The original token multiset contains three `0x` tokens, one `15` token, and two `22` tokens.

After the frozen family has selected the relevant addresses, the exact without-replacement token scale for cell51 holding `0x` and cell87 holding `15` is:

`(3/256) * (1/255) = 1/21760`.

Including the separate SHED address64 holding one of the two `22` tokens gives:

`(3/256) * (1/255) * (2/254) = 1/2763520`.

These are fixed-token descriptive scales. They are not global discovery probabilities because the navigation system and several downstream edges were found during earlier exploration.

## Source boundary

The canonical grid resource states that the 256 cells are original printed two-character numerals and explicitly keeps base60 distinct from radix59. Earlier Director #35 found a genuine same-manuscript sexagesimal preference through the p33 cuneiform values, while also concluding that the missing-`f` fork was not fixed by an authenticated numeral-codec instruction.

The present audit narrows that ambiguity through the solved `WE MUST SHED` route and a whole-table consistency rule. It still does not produce an explicit first-party digit-alphabet legend or an instruction saying to remove lowercase `f`. A historical source for that exact alphabet remains independently valuable.

## Director fork

**Result: positive within the frozen global-alphabet family, with a required scope restriction.**

Downstream work may freeze one order-preserving post-MUST alphabet:

`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx`

and may test predictions made before reading new targets. Future work should not reselect the deleted symbol, switch point, token order, or radix per edge.

A later failure on a blind receiver should reject that downstream consumer rather than trigger another alphabet change. A source-authenticated codec or a reversible original-cipher inverse would upgrade the state from constrained navigation evidence to an actual decryption mechanism.

## Reproduction

`sims/lp2_must_shed_base59_familywise_audit_sft.cjs`

Windows Node 22 CI: [PASS 44424692742](https://github.com/FlareZ123/liber-primus/actions/runs/44424692742).
