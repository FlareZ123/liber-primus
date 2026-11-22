# All-secret word-shape GP28 predecessor-rank gate on the original LP2 cipher

**13 November 2026, Agent36. Original-input, key-independent conditional exclusion. No recovered LP2 plaintext, key, destination or actual authored cipher.**

## Mechanism and source motivation

The signed 2016 instruction describes Liber Primus's words as a map, with their numbers giving direction. One specific reading of those numbers is the *printed word length* and the rune's *position within that word*. A candidate stream cipher might encode a native Gematria Primus (GP) letter using a hidden alphabet chosen independently for each combination of these two public states. The conspicuous scarcity of immediately repeated ciphertext runes additionally motivates an exact **28-choice successor alphabet**: given preceding ciphertext rune C, choose one of the 28 unequal next runes.

This report tests a surprisingly permissive version of that hypothesis, without guessing keys or optimizing cipher output. Let L be the length of the original printed word and j the current within-word rune offset. For every pair (L,j), grant an **arbitrary unknown bijection** S_(L,j) of all 28 symbols. In a cyclic predecessor-rank model,

    rank(C_i,C_(i-1)) = ((C_i-C_(i-1)+28) mod 29)
    rank(C_i,C_(i-1)) = S_(L,j)(P_i).

A second independently checked convention uses the **sorted** order of all runes except C_(i-1). Both map to indices 0–27 and are exactly reversible from preceding C and the unknown table. The source does not select either particular cipher. Repeated ciphertext transitions are treated as an exceptional marker/bypass and omitted identically from every comparison. We permit an independent secret table for **each** original (L,j), rather than one key per page, periodic stage, or fixed alphabet.

**All-secret invariant:** no choice among the (28!)^35 allowed secret-table combinations can change whether two plaintext symbols in the same (L,j) group are equal. The pooled within-group equal ordered-pair statistic is therefore invariant under the complete family. This allows a decisive necessary-condition test against the normal GP literary register without recovering or guessing a single permutation.

The source-defined printed word boundaries are preserved; line/page wraps are not treated as word separators. The test deliberately restricts L to **3 through 9**, whose independently pinned English-GP sources have enough exact-length words to match every original occurrence without replacement. This subset is large enough to give **35 observed public (L,j) states** and over three million within-state ordered pairs.

## Original input and independent native controls

The original LP2 transcription, excluding the two solved pages p56–57, contains **2,896 words and 12,956 runes**. The test uses **8,484** eligible, unequal transitions within printed words of length 3–9 and omits exactly **55** equal transitions at identical observed locations across all comparators. For every reference, take the first required number of words of *each exact GP rune length* from the repository-pinned public-language text. Assemble them in precisely the original 2,896-word length order and apply the same 55-position omission mask. This makes all comparators have the identical **3,005,534** eligible ordered pairs.

The GP source normalization uses the repository's 29-symbol convention (K/Q→C, V→U, Z→S, ING→I+NG), and excludes original source words containing the 29th rune EA so that the source controls genuinely inhabit a 28-symbol alphabet. This is a conditional GP28 language-register comparison; it does not assert that every conceivable plaintext uses these specific literary vocabularies.

| Dataset | Equal ordered pairs, same 35 groups | Same-group coincidence |
|---|---:|---:|
| **Original LP2 cyclic predecessor rank** | **107,316 / 3,005,534** | **0.03570613** |
| Original LP2 sorted predecessor rank | **107,174 / 3,005,534** | **0.03565889** |
| Native GP28 Gibran, length-matched | 377,438 / 3,005,534 | 0.12558101 |
| Native GP28 Shakespeare, length-matched | 368,666 / 3,005,534 | 0.12266240 |
| Native GP28 Emerson, length-matched | 346,624 / 3,005,534 | 0.11532859 |

The cyclic original rate is essentially the uniform 28-symbol baseline, **1/28 ≈ 0.03571429**. This is a **structural**, key-independent difference: even a different unknown permutation at every word-length/position cell cannot turn the displayed original transitions into any of the three fixed native-GP source passages. To match the original group collision inventory by changing symbols in the source-derived comparison, a conservative counting bound requires changing at least **366 Gibran**, **395 Shakespeare**, or **315 Emerson** of the 8,484 scored positions, respectively. Each edit can reduce at most 2(n−1) ordered equalities in a group with n positions; the report sums this exact lower bound separately per group. This does not imply those edits are enough to make native plaintext.

**Positive inverse:** construct an independently keyed bijection at every (L,j), encrypt the length-matched Gibran passage into GP29 nonrepeating successor runes, insert a reserved EA marker at the 55 original repeat locations, and decode by the inverse bijections. The SFT recovers **8,539/8,539** original-shape planted source symbols including all **55** marker positions. It also verifies all group totals and all source comparison values. The proof does not depend on the plant's particular affine keys; those keys exercise the reversible family.

## Research decision

The result removes a specific remaining class of **public-word-shape-keyed stationary GP28 alphabet substitutions** as an explanation of ordinary native-GP prose: neither secret lookup tables separately keyed by word length and character position nor either simple no-repeat rank convention can restore the strong same-position symbol frequencies seen in the independently prepared controls. This reinforces the earlier printed-word grammar and key-independent alphabet findings through a distinct state hypothesis. It should not be generalized to all English, all languages, unknown author register, variable-length codes, word permutations, key schedules that change **between words of the same length**, source text with deliberately balanced letter counts, or any hidden-state cipher. No original source currently instructs this model in the first place.

**Next decision:** spend no further resources tuning a word-length/position-only substitution on this corpus. A useful successor must introduce an *independently sourced new key or evolving state*, an actual plaintext crib, or a reversible transposition keyed by original manuscript features. Additional alphabet permutations within the same 35 public states cannot improve the invariant.

**Reproduce:** [single-file read-only CommonJS SFT](../sims/lp2_gp28_wordshape_allkey_sft.cjs); [Windows Node22 CI run 43507972057](https://github.com/FlareZ123/liber-primus/actions/runs/43507972057) completed successfully on the original committed data, with all 8,539 planted symbols recovered and every original/control statistic asserted.
