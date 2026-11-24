# Moving plaintext escape with arbitrary rank permutation: original-input key recovery gate

**Agent 6, 24 November 2026.** No unknown LP2 plaintext, key, or destination recovered. The fixed-order predecessor-exclusion architecture fails a new, much broader key envelope: even a different arbitrary 28! rank permutation per illuminated chapter, plus an independent unknown escape rune at every position, cannot fit the pinned ordinary native-GP singleton alphabet or all long-word dictionary constraints. A separate exact frequency capacity bound does not require printed plaintext word alignment.

## Explicit candidate and strongest premise

The observed 86 equal adjacent ciphertext symbols motivate a continuous additive differential code on GP29. Earlier [Agent4 work](lp2-contextual-escape-rank28-lexical-gate.md) tested a moving escape with affine log-rank decoding; [Agent5 work](lp2-primeclock-rank28-moving-escape-original-gate.md) tested a shared arbitrary permutation with a fixed nonperiodic prime clock. The present independent test removes both the affine restriction and the proposed prime clock, testing a stationary arbitrary rank permutation. No original instruction selects this operator or an escape schedule.

Let d=(C_i-C_(i-1)) mod29 and let R be a bijection from the 28 nonzero d values to ranks 0..27. The escape E_i is a possibly changing plaintext rune. On d=0, P_i=E_i. Otherwise P_i=R(d)+[R(d)>=E_i]. A known causal escape rule (e.g. E_i=f(P_(i-1))) and the inverse rank permutation give a lossless forward decoder for all 29 symbols. The original necessary conditions are deliberately more generous: allow E_i to be arbitrary at every occurrence, without requiring a recoverable schedule. A nonzero d can only emit either r or r+1 for its fixed r=R(d). Zero steps and word-initial symbols are granted arbitrary values for the lexical test.

## Original lexical attack

The unchanged transcript and canonical corpus agree at every one of 12,956 unknown runes, in 2,896 complete printed words. The same 29,060-form native-GP TextBlob dictionary used in the earlier study is normalized with QU→CW, V→U, K/Q→C, Z→S, ING→NG and IO→IA. For a candidate word p and nonzero observed difference d, intersect the domain of R(d) with {p_j,p_j−1} clipped to 0..27. An augmenting-path bipartite matching is necessary and sufficient for extending these domains to a full rank permutation. This tests all 28! rank keys without listing them and leaves the escape independent per position.

| GP word length | Original count | Any lexicon candidate under even a private rank permutation |
|---:|---:|---:|
| 7 | 216 | 216 |
| 8 | 156 | 156 |
| 9 | 78 | 78 |
| 10 | 52 | 50 |
| 11 | 32 | 31 |
| 12 | 18 | 15 |
| 13 | 4 | 3 |
| 14 | 3 | 3 |

Seven original words already have no candidate even with private word keys (zero-based whole-word ordinals 189,700,874,1409,1458,2534,2752). For the shared chapter permutation, restrict to 109 original words of length >=10. After omitting those seven, sort the remaining words by candidate count and find disjoint pairs for which no combination of candidate rank domains admits a perfect matching; cap each attempted pair at 50,000 combinations, so the result is a conservative certified lower bound. The chapter intervals are p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53 and p54–55, assigning each complete carried word by its starting page. This finds 26 disjoint incompatible pairs, with at least one in each chapter. Consequently **at least 33/109 long words (30.28%) must be outside the pinned lexicon** for this architecture even with independent chapter keys. This is not a claim about all English vocabularies. For comparison, 17/18 of the >=10-rune words in the pinned authentic solved-native sample are in this lexicon.

The script emits every pair, candidate-list size, original empty-word vector and chapter propagation result. For example, p8–14 words 578 and 754 each have exactly one individual candidate; their combined domains have no matching. The long-word test does not rely on frequencies or scoring a guessed plaintext.

## Dictionary-independent singleton and frequency capacities

For a set S of plaintext singleton rune types, at most 2|S| exclusion ranks can emit S (possibly fewer if consecutive). Because a rank permutation is bijective, at most that many distinct nonzero differences can emit S in one key region. The exact maximum number of compatible singleton sites is the sum of the largest corresponding difference histogram bins, plus any zero sites. Across the entire original continuous tape, none of the 83 singleton words is a zero step.

| Independently keyed region | Maximum A/I/O out of 83 | Maximum A/I/O/T out of 83 |
|---|---:|---:|
| Whole book | 31 | 39 |
| Nine chapters | 59 | 71 |
| Physical page | 83 | 83 |

Even granting one additional free singleton at each chapter start (nine) yields at most 80/83 in the expanded vocabulary. This bound applies even with a secret fixed plaintext alphabet order in each region, since each allowed symbol still has at most two adjacent ranks. It is conditional on intact native singleton words. Page-private keys remain outside this singleton exclusion.

A separate frequency-only bound grants arbitrary plaintext E at every zero step and each region start. Because E can arise from at most two nonzero difference bins per stationary rank key, the largest two bins in each region plus free positions give an exact attainable upper bound under the arbitrary-escape envelope.

| Region | Free sites | Maximum E of 12,956 |
|---|---:|---:|
| Whole book | 87 | 1,101 |
| Nine chapters | 95 | 1,258 |
| Physical page | 141 | 1,659 |

The independently published [native-E study](lp2-rank28-period1-256-allsecret-native-e-capacity.md) reports a minimum 1,397 E among its 1,129,739 full-length independent Gibran/Shakespeare/Emerson GP control windows. Thus the global/chapter stationary rank envelope cannot reach even that weakest control, regardless of word boundaries, escape placement, or hidden fixed plaintext alphabet order. This is distinct from the earlier one-rank fixed-sentinel E bound. The source-native solved sample has 380 E in 2,979 runes. The page-private two-rank bound does not independently exclude English.

## Actual blind rank recovery, held-out control

Use 93 genuine solved-Cicada >=7-rune words that are present in the pinned lexicon. Seed 0x33010624 generates an arbitrary 28-rank permutation and an arbitrary 29-entry causal escape lookup f. Encrypt the complete control word tape continuously. Train only on the first 73 ciphertext words: enumerate candidate domains, repeatedly intersect the union of surviving candidates for each word, and prune rank edges that cannot extend to a matching. The true rank key survives and 22/28 ranks are uniquely identified. All 20 untouched control words retain their exact genuine plaintext candidate under the frozen training domains. Known-full-key control replay is exact. This is partial blind rank recovery, **not** full blind escape-table recovery; six ranks remain ambiguous, and the true escape table was not inferred. No original plaintext is claimed.

## Decision

Retire the continuous stationary-rank / arbitrary moving-escape family with global or chapter-private keys for direct ordinary native-GP prose; its two independent capacity obstructions avoid the assumption of a fixed rare sentinel. Do not expand the search by changing the escape schedule alone. A distinct source-selected within-chapter rank rekey, a genuinely evolving alphabet, or a changed plaintext register is required. No first-party rule currently supplies such a key.

[Executable read-only CommonJS SFT](../sims/lp2_moving_escape_arbitrary_rank_lexical_sft.cjs), run directly in connected V8 against the four pinned repository inputs. No CI run is claimed. The script includes exact matching, original parser agreement, all candidate counts, pair witnesses, native coverage, singleton/frequency bounds and the held-out plant. Source implementation commit 7ee66fdb829a266acf07e819cddac8c413859e76.
