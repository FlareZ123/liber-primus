# P50 literal digit-letter grammar does not transfer on authenticated controls

**Agent24, 19 November 2026. Director #1743. Classification: negative semantics gate.** The target-specific readings of `2L`, `0s`, `0d`, and similar p50 tokens do not define a reusable literal digit-letter grammar under the frozen source-only family. No rule earned permission to be applied to unknown LP2 plaintext candidates.

## Question

Several recent local routes attach semantics to the two printed characters of a p50 token. Examples include:

- `2L` as “two L runes” in the authenticated successor WILL;
- `0s` and `0d` as zero-count checks in later authenticated successors;
- digit-as-position readings;
- a proposed A1Z26 reading of the letter component.

The rival explanation is semantic mining: each token is interpreted after a desired target is known. Director #1743 requires a rule learned on authenticated or solved controls before any such literal grammar may be reused on unknown pages.

## Inputs and source firewall

The test uses only:

- the exact 256-token p50 tape in `resources/liber-primus/lp2-grid-256.json`;
- the authenticated 43-word 2016 signed message;
- solved p56 plaintext, 25 GP words;
- solved p57 plaintext, 20 GP words;
- the already promoted operation `GP0(word) -> zero-based p50 cell`.

Unknown-page ciphertext and candidate unknown plaintext are absent from the model-selection code.

The p50 letter is interpreted case-insensitively only when it is a one-rune Gematria Primus transliteration symbol. A1Z26 is excluded because the existing WILL report itself classifies that conversion as unauthenticated.

## Frozen 15-rule grammar

The predeclared family contains fifteen literal rules. For token `dX` and each of previous/current/next GP word:

1. `count(X) = d`;
2. `X` occurs at position `d`, charging zero-based and one-based origins;
3. word rune length equals `d`, with `X` equal to the first or last rune.

Zero is allowed where the literal predicate naturally permits it. Positive-digit hits are tracked separately.

Each rule is calibrated against all 256 cyclic realignments of the exact token tape. Validation is corpus-level leave-one-out: select on two of {signed2016, p56, p57}, then score the exact rule on the untouched third corpus. A second calibration uses 50,000 deterministic full-token permutations preserving the exact token multiset.

The predeclared acceptance gate requires a positive-digit held-out hit and a familywise held-out tail no larger than 0.01.

## The obvious count rule is non-selective

The rule `count(X in next word) = d` reproduces the attractive signed-message examples:

| Source | Successor | p50 token |
|---|---|---|
| DEVOTED | LIBER | `0W` |
| ITS | WORDS | `1O` |
| YOU | WILL | `2L` |
| FOUND | GOOD | `0s` |
| GOOD | LUCK | `0d` |

That apparent coherence does not transfer selectively.

| Corpus | hits | positive-digit hits | exact cyclic upper tail |
|---|---:|---:|---:|
| signed 2016 | 5 | 2 | 199/256 = 0.777344 |
| solved p56 | 5 | 0 | 104/256 = 0.406250 |
| solved p57 | 7 | 1 | 13/256 = 0.050781 |

Across the combined 85 addressable word records, the same rule has 17 hits versus a cyclic-null mean of 14.55. Its exact cyclic upper tail is 80/256 = 0.3125. The zero-digit matches are especially easy to obtain because many candidate letters are absent from ordinary words.

## Leave-one-out failure

The complete 15-rule family also fails transfer.

| Held-out corpus | selected on other two | training hits | training cyclic tail | held-out hits | positive held-out | held-out cyclic tail |
|---|---|---:|---:|---:|---:|---:|
| signed 2016 | `pos0_next` | 3 | 26/256 = 0.1015625 | 2 | 2 | 81/256 = 0.31640625 |
| p56 | `pos1_prev` | 5 | 3/256 = 0.01171875 | 0 | 0 | 1 |
| p57 | `pos1_current` | 7 | 5/256 = 0.01953125 | 0 | 0 | 1 |

The two signed held-out hits are exactly `ITS -> WORDS` through `1O` and `YOU -> WILL` through `2L`. They fail selectivity once the complete control procedure is charged.

The corpus-local positional patterns do not generalize: the strongest training rule in the p56 fold has zero p56 hits, and the strongest training rule in the p57 fold has zero p57 hits.

## Exact-token-multiset permutation calibration

A deterministic 50,000-permutation Fisher-Yates calibration with seed `0x24c1cada` preserves every p50 token exactly.

For the leave-one-out selected rules, corrected upper tails are:

- signed held-out `pos0_next`: 15,159/50,000 null permutations meet or exceed the two observed hits, corrected tail 0.303194; positive-only corrected tail 0.182956;
- p56 held-out `pos1_prev`: observed zero, corrected tail 1;
- p57 held-out `pos1_current`: observed zero, corrected tail 1.

Charging the maximum hit count over all fifteen rules on each corpus gives corrected familywise tails:

- signed 2016: 0.666007;
- p56: 0.136617;
- p57: 0.115258.

None approaches the acceptance threshold.

## Decision

No literal p50 digit-letter grammar in the frozen family transfers from solved/authenticated controls. The required positive branch of #1743 does not fire, so there is no licensed frozen rule to apply to unknown p0, p38, or other candidate plaintext receivers.

Consequences:

- `2L -> two Ls in WILL` remains a local checksum inside the YOU/WILL candidate route;
- `0s` and `0d` zero-count wordplay remain local checks;
- `2L -> [K,K*a]` through A1Z26 remains unauthenticated and should not be used as a reusable token decoder;
- literal token characters may still matter where an independent source clue fixes their interpretation before the target is known, but generic digit-count, digit-position, and digit-length semantics are not learned by the controls.

This result does not reject GP0-to-p50 addressing, base59/base60 numeral readings, or independently source-selected token operations. It rejects only the predeclared literal digit-letter grammar as a general semantics layer.

## Reproduction

Run:

`node sims/lp2_p50_literal_token_grammar_control_sft.cjs`

The SFT reconstructs all three control corpora from committed source material, enumerates the fifteen frozen rules, executes all 256 cyclic tape realignments, performs leave-one-out selection, and runs the deterministic 50,000 exact-token-multiset permutations.
