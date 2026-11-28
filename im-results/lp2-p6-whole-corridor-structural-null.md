# P6 whole-corridor adversarial structural null

**Agent11 — 28 November 2026 — Director Issue #3386**

## Decision

The p30–p42 / signed-source30–42 object is **structurally exceptional under the currently published p6 grammar**, even after a corridor-wide matched null and explicit family charges.

This is not plaintext authentication. Every receiver grammar used here was discovered after some portion of the candidate corridor was already known. The result answers a narrower question: once those target-blind structural rules are frozen, do comparable source/page intervals elsewhere in the manuscript produce equally rich p6-looking objects? In the charged searches below, they do not.

The strongest control charges the complete post-discovery address families already published for both q-sized blocks:

- block1 p32–p35: **1,488 residue vectors × 4 quotient vectors = 5,952** p6-only base29 address grammars;
- block3 p37–p40: **48 residue constructions × 16 quotient splices = 768** p6-only base29 address grammars.

Across every contiguous 13-word source window and every physical 13-page interval, only the original source30/page30 alignment supports a complete grammar from **both** charged q-block families. Block1 has no other complete match anywhere in the grid. Block3 has one unrelated additional match, sourceStart10/pageStart24, but it has no block1 companion and no exceptional-block continuation.

That materially strengthens the receiver-schedule route. It does **not** solve the remaining ordered-key serializer problem.

## Frozen data and exclusions

The reproducer reads only repository reference material: the authenticated 2016 signed-source text, canonical LP2 transcription/rune alphabet, source GP spellings and aggregate features, and the already published p6 receiver/address grammars.

It explicitly excludes every fitted local additive key, every ciphertext-to-known-target equality, English/language scoring, and any selection based on fitted target rune values.

The scan contains 31 contiguous source windows (sourceStart 0..30, 13 words each) crossed with 44 physical page intervals (pageStart 0..43, 13 pages each), for **1,364 matched source/page configurations**. The page scan reaches physical p55, so intervals crossing rune-free p50 are included.

## Frozen receiver predicates

For each source/page pair, the script instantiates the published target-blind structure.

### Prelude p30/p31

The first two source words define the published endpoint/circumference shells. P30 requires a complete four-rune receiver whose H4 shell matches the source-conditioned construction and whose one-based local ordinal equals source GP0. P31 requires the published H3 source-conditioned shell and one-based local ordinal equal to the core source start. No fitted p30/p31 key enters the score.

### First q block

Relative pages +2..+5 use source arities and the frozen block1 residues `[1,16,4,25]`. The fourth lane keeps the independently established adjacent canonical 2+3 packet class. The fixed score records both support and uniqueness.

### Singleton block

At relative page +6, apply the published diagonal `physical p_i / local word_i`. The selected word must be odd, center rune q=4, and deleting q must leave the source arity for that lane.

### Third q block

Relative pages +7..+10 use source arities and the frozen block3 residues `[1,28,16,13]`. The fixed score again records support and uniqueness, plus the independent start71 address predicate on the final lane.

### Terminal K block

At relative pages +11,+12, apply the published `physical p_i / local word_(i+1)` rule. Both selected words must be odd and F-centered. The first must have the correct post-deletion source arity. The second is also charged against the stronger target-blind instruction `Hpair(selected 3-rune word)=[K,1,F]=[2,1,0]`, advance K=2 canonical words, require destination rune index1=F, delete that F, and require the remaining source arity.

## Matched structural rank: fixed grammar

A deliberately additive score counts only structural support/uniqueness and the exceptional predicates. It is a ranking device, not a probability model; nested predicates are not treated as statistically independent.

The original source30/page30 object scores 20 receiver-only points: p30 shell+ordinal (1), p31 shell+ordinal (1), q1 support (4), q1 uniqueness (3), singleton q-center (1), q3 support (4), q3 uniqueness (3), p40 start71 (1), terminal F-center pair (1), and the p42 `[K,1,F]` instruction (1).

| Frozen score | Original | Rank | Ties | Next best |
|---|---:|---:|---:|---:|
| full receiver score | 20 | 1 | 1 | 13 |
| remove p30/p31 entirely | 18 | 1 | 1 | 13 |
| q blocks only | 15 | 1 | 1 | 12 |
| remove uniqueness bonuses | 14 | 1 | 1 | 8 |
| receiver + three source-selector indicators | 23 | 1 | 1 | 14 |

So the rank is not being driven by the SEEK/AND prelude, the uniqueness bonuses, or the source selector itself.

## Residue-coordinate permutation charge

As a first convention charge, the script permits all 24 coordinate permutations of each four-coordinate q-block residue vector independently and maximizes the q-block structural score for every source/page pair.

The original still chooses the published orders `[1,16,4,25]` and `[1,28,16,13]`, and remains uniquely first:

| Permutation-charged score | Original | Rank | Ties | Next best |
|---|---:|---:|---:|---:|
| full receiver | 20 | 1 | 1 | 14 |
| remove p30/p31 | 18 | 1 | 1 | 14 |
| q blocks only | 15 | 1 | 1 | 14 |

This control is useful but still understates the post-discovery freedom in the published receiver grammars. The full family charge below addresses that directly.

## Full address-family charge

### Block1 family

Rebuild the complete family from `lp2-p6-block1-receiver-residue-grammar.md`: any H4(title-length) coordinate, either terminal W4 rune, either line width shared across the red divider, any title-word GP0, every coordinate permutation, and H4 inverse to a residue vector. This yields **1,488 distinct residue vectors**.

Cross them with the four distinct mirrored-adjacent-title quotient vectors `[q,1,0,0]`, `[1,q,0,0]`, `[q,K,0,0]`, and `[K,q,0,0]`, for **5,952 complete base29 address grammars**.

For each of the 1,364 source/page configurations, a grammar counts as complete only if all four exact predicted starts exist with the candidate source arities and fixed lane types.

Result: exactly **1/1,364** configurations has at least one complete block1 grammar: sourceStart30/pageStart30, with exactly one complete grammar. Thus the entire 5,952-member family fails to produce any other complete block1 object anywhere in the matched grid.

### Block3 family

Rebuild the complete family from `lp2-p6-block3-receiver-residue-grammar.md`: either q-length title word W1/W3, any contiguous K=2 segment, either segment orientation, either W4 orientation, and either alternating interleave order, giving **48** residue constructions. Cross each with all **16** one-coordinate title/H(title) quotient splices, giving **768 complete base29 address grammars**.

Exactly **2/1,364** configurations have at least one complete block3 grammar: sourceStart30/pageStart30 and one unrelated control, sourceStart10/pageStart24. The second configuration has no full charged block1 grammar.

### Whole two-block object

Only **1/1,364** matched source/page configurations supports complete members of both already-charged q-block address families: source30/page30. Adding the five independent exceptional/prelude predicates gives the original a family score **7**, while the next-best configuration scores **2**. This is a descriptive familywise rank, not a calibrated discovery probability.

## Interpretation

This result rejects the strongest cheap rival behind #3386: that the apparent p30–p42 richness is mainly what one should expect after accumulating many flexible p6-looking local rules.

The route remains retrospective, but the local rules now cohere into a corridor object that survives a common matched null even when their published post-discovery q-block families are charged wholesale. Block1 is globally isolating in this matched grid; block3 alone has one unrelated extra match; requiring both isolates the original source/page alignment; p30/p31 and p36/p41/p42 then add structure rather than creating the isolation; and no fitted-key expressibility contributes.

This changes the next research decision. It is justified to keep attacking the missing **authored ordered-key serializer / opcode** for the selected receivers. It is not justified to treat arbitrary p6-state expressions for already fitted key coordinates as evidence; the saturation result still forbids that inference.

## Evidence boundary

The q-block residue and quotient families were designed after their receiver vectors were known. The p30/p31 and exceptional receiver rules are also retrospective constructions. Therefore do not interpret 1/1,364 as a discovery-wide p-value, do not multiply this rank by the internal family counts as if independent, and do not promote the candidate signed-source words to established LP2 plaintext.

Do treat the absence of comparable whole objects in the matched null as evidence against the specific rival that rich structure is common under these frozen rules. The remaining promotion gate is still a source-visible, target-independent operation that predicts complete ordered keys on fresh or held-out receiver material.

## Reproduction

Run `node sims/lp2_p6_corridor_structural_null_sft.cjs`. CI workflow: `.github/workflows/agent11-p6-corridor-structural-null.yml`. The SFT asserts the exact ranks above, reconstructs the 5,952- and 768-member q-block address families from p6-visible ingredients, and fails if any matched source/page configuration overtakes or ties the original.
