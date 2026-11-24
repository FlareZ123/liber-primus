# Thirteen-state plaintext-prime clock: independent-anchor shared-key intersection

## Exact inference

Test the exploratory changing-state model C_i=(P_i+K[s_i]) mod29 and s_(i+1)=(s_i+GPprime(P_i)) mod13. The thirteen-dot ornaments motivate the number 13 but do not authenticate this state update.

Allow the unknown state at each long-word anchor to be independently arbitrary. Fix its local start to zero; all rotations of the second sparse key cover every relative state. Every dictionary word candidate determines partial table entries, rejecting conflicts on repeated states. Retain candidates assigning at least seven entries. Join distinct anchors only for masks overlapping in at least four positions and assigning at least 12/13 entries in union. Shared entries must agree exactly. Enumerate all 29 possible missing entries when necessary; canonicalize cyclic rotations and rank complete tables by the number of distinct training anchors they support, permitting arbitrary local starts.

## Positive controls

Dictionary: 28,695 GP-native entries from the repository TextBlob list, solved LP1 vocabulary and actual clear p57 words. Twelve independently selected LP1-reference long words are encrypted with separately chosen unknown initial states for each of three unrelated 13-entry keys. The true key is used only for post-ranking equality checking.

The three runs produce 405,471 / 400,534 / 406,014 eligible comparisons, eight compatible one-missing-entry joins and 141 distinct complete rotation classes each. In every run the correct table is the unique candidate supporting all twelve anchors; the strongest wrong key supports eight. On independent actual clear p57 (95 runes), choose the initial state using only the first five printed words (26 runes). All three recover 95/95 original runes, including 69/69 untouched continuation, and replay exactly.

## Original decision

Use every internal physical-page word of length >=10 in original p0–39. The parsed transcription and canonical tape agree. 77 anchors yield 890 distinct partial tables across 62 compatible anchors. The declared pair search checks **4,330,367** eligible relative rotations with **zero** compatible joins. No complete key is generated; untouched p40/p54/p55 are therefore not scored. No unknown original plaintext or authentic key follows.

This excludes every common table with at least two dictionary-compatible anchors satisfying the declared coverage and overlap. It does not exclude OOV anchors, smaller-overlap multi-anchor inference, different state laws, moved boundaries, or section-private tables. Neither modulus nor state law is authenticated. Retire this particular route; do not repeatedly enlarge the table or tune its update on the same original anchors.

The transferable technique is sparse secret-table intersection, which identifies exact keys without a 29^13 sweep. Reuse only for separately motivated changing-state hypotheses.

Reproduce: `node sims/lp2_primeclock13_sparse_anchor_keyrecovery_sft.cjs`. Executed against repository inputs in connector JS runtime; no Windows CI run claimed.
