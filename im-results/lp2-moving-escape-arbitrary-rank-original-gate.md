# Moving plaintext escape with arbitrary rank permutation: original-input key recovery gate

**Agent 6, 24 November 2026.** No unknown LP2 plaintext, key, or destination recovered. The fixed-order predecessor-exclusion architecture fails a new, much broader key envelope: even a different arbitrary 28! rank permutation per illuminated chapter, plus an independent unknown escape rune at every position, cannot fit the pinned ordinary native-GP singleton alphabet or all long-word dictionary constraints. Separate exact frequency bounds do not require printed plaintext word alignment; Agent18's rare-pair extension below also excludes page-private permutations under the fixed canonical GP29 output order.

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

## Source-visible page-clock rekey extension

The E and singleton bounds alone leave the page-private stationary envelope open, but the following two low-complexity shared-key page rotations independently fail. The complementary rare-pair bound below closes the fixed-output-order page-private case. Let k_i be either the physical page number (zero-based) or the totient of its corresponding prime (first page maps to prime 2). For nonzero difference d let q=d−1 or log_15(d) mod 28. Test both signs and both placements of the page rotation: rank R(q−k_i) or R(q)−k_i, modulo 28. These are sixteen frozen variants, with unrestricted shared 28! rank permutation and unrestricted moving escape.

For each plaintext category, construct a 28×28 matrix whose cell (q,r) counts sites compatible with assigning rank r to input q, accounting for the respective rotation. Maximum-weight perfect matching gives the exact attainable count across every shared permutation. Zero steps and the initial rune are granted free category membership. Singleton sites use the expanded A/I/O/T vocabulary.

| Page clock | Rotation placement | Maximum singleton sites (of 83) | Maximum E (of 12,956) |
|---|---|---:|---:|
| Physical label | Before R | 46 | 1,108 |
| Physical label | After R | 60 | 1,305 |
| Prime totient | Before R | 40 | 1,091 |
| Prime totient | After R | 55 | 1,275 |

Maxima within a row may occur under different variants or permutations. Every variant independently fails both the intact-singleton constraint and the minimum native E control count 1,397. This excludes these specific shared-key rekeys; unrestricted private page keys and other schedules are not excluded. The exact calculation ran in connected V8 on original corpus and transcript. The same SFT now emits all sixteen rows; source revision 1c27b49c86d387ef95b3139ad213ae149f58e906.

## Page-private arbitrary ranks: forced rare adjacent pair (Agent18, 24 November)

The previous E/singleton bounds did not eliminate completely private physical-page rank permutations. With the **original canonical GP29 output order**, a complementary lower bound closes that loophole for direct native English. The GP output indices 11 and 12 are adjacent: **J, EO**. Whatever escape symbol E_i is chosen, a nonrepeat rank r=11 must decode to either J or EO, because P_i=r+[r>=E_i]. This holds even with arbitrary hidden escape state and no plaintext word alignment.

Let h_{s,m}(r) count the 28 ordinary predecessor-exclusion input ranks in source region s, with m either cyclic difference or sorted GP ordinal deletion. Under any secret 28! bijection R_s, exactly one input rank maps to output rank 11. Thus every decoded region has at least min_r h_{s,m}(r) occurrences of J or EO. Grant all initial and repeated symbols arbitrary values, and even allow the decoder to choose its rank convention independently in every region. The minimum possible count over the entire book in this relaxed envelope is sum_s min_{m,r} h_{s,m}(r). It is a sharp histogram bound for the envelope with freely chosen per-occurrence escapes, regardless of the actual causal escape rule.

| Independently keyed original regions | Cyclic only | Sorted only | Either independently per region |
|---|---:|---:|---:|
| 55 physical rune-bearing pages | 177 | 178 | **151** |
| Pages plus the additional internal printed-section reset at global offset 3612 (56 regions) | 177 | 178 | **151** |

No original rune is deleted from the decoder; the 55/56 initial symbols and 86 within-page repeat events are simply granted free output for this necessary bound. The pinned original transcription and canonical corpus agree for all 12,956 runes and 2,896 complete groups. The extra internal reset is the same generous section start used in the earlier period-256 analysis.

Independently count J+EO in **every** 12,956-rune contiguous window from the same three literary sources and both GP spelling conventions pinned by the [native-E study](lp2-rank28-period1-256-allsecret-native-e-capacity.md). These overlapping windows are comparisons, not independent statistical trials.

| Native GP source | Legacy windows / maximum J+EO | Calibrated windows / maximum J+EO |
|---|---:|---:|
| Gibran | 50,159 / 83 | 49,537 / 83 |
| Shakespeare | 205,845 / 34 | 204,151 / 34 |
| Emerson | 311,675 / 82 | 308,372 / 82 |
| **All** | | **1,129,739 windows; 0 reach 151** |

The nine actual solved-Cicada GP passages contain only 3 J+EO in 2,979 runes. The original lower bound is 68 above the maximum of the entire long native-control corpus. No language scoring or dictionary/word-boundary assumption is needed. The control sources are independent of the unknown ciphertext; J/EO was selected from the authentic output alphabet and solved-native rarity profile, not as an author-authenticated escape symbol. This is a deterministic incompatibility with those finite native distributions, not a statistical significance claim or a theorem about all English.

Three full-length genuine literary-GP plaintext plants (the first 12,956 calibrated runes from each source), using independently randomized page/section 28! permutations, independently selected cyclic/sorted ranks, and causal independently randomized 29-entry escape tables, each recover and reencrypt 12,956/12,956 runes exactly. Their true J+EO counts are 20, 12, 14; actual forced-rank counts are 14, 8, 9; the relaxed all-key minima are 0, 1, 1 respectively. These positive controls validate the inverse and the necessary bound; they do not recover unknown keys.

**Decision:** retire even fully private page/section stationary rank permutations with moving escape under the *fixed canonical GP29 output order* and direct native-GP prose. This does not exclude unknown reorderings of the plaintext alphabet separating J and EO, unknown source alphabet order, additional within-page key changes, altered representation, or alternative coding mechanisms. Changing only the escape schedule cannot help. No original plaintext/key recovered. [Executed read-only reproducer](../sims/lp2_page_private_moving_escape_rare_pair_sft.cjs) (connected V8; no Windows CI claim).


## Physical large-mark rekeying and cumulative dot clock (Agent18, 24 November)

The 31 original large punctuation events (28 thirteen-dot, three ten-dot; cumulative 394 dots) give an additional source-defined rekey schedule. Distinct nonempty rune intervals are 29 for large marks alone and 74 for the union with 55 physical rune-page starts. Grant each region its own unrestricted 28! rank permutation, allow either cyclic or ordinal-deletion input rank independently, and leave initials and repeats unconstrained.

| Reset schedule | Regions | Cyclic lower J/EO | Sorted lower J/EO | Mixed lower J/EO |
|---|---:|---:|---:|---:|
| Large marks alone | 29 | 308 | 306 | 290 |
| Pages plus large marks | 74 | 168 | 170 | 143 |

Even the most permissive of these physical reset schedules exceeds the previously measured native-window maximum of 83. Additional unmarked key changes are outside this claim.

A separate source-clock alternative uses cumulative printed dot count k, with one unrestricted shared permutation R and inverse rank R(q−sk) or R(q)−sk (mod 28), sign s=±1. All 74 interval initials and 86 repeats are granted arbitrary plaintext. For each input/output rank assignment, count positions forced to J/EO (output rank11) or capable of emitting E (rank17/18). Exact minimum/maximum weighted bijections give the bounds below, with free positions added to the E upper bound.

| Input rank | Sign | Rotation | Minimum J/EO | Maximum E |
|---|---:|---|---:|---:|
| Cyclic | + | Before | 420 | 1143 |
| Cyclic | + | After | 318 | 1307 |
| Cyclic | − | Before | 416 | 1169 |
| Cyclic | − | After | 318 | 1307 |
| Sorted | + | Before | 407 | 1148 |
| Sorted | + | After | 317 | 1304 |
| Sorted | − | Before | 418 | 1151 |
| Sorted | − | After | 317 | 1304 |

All eight fail both the native J/EO ceiling of 83 and the independently recorded native E floor of 1397 ([E-capacity gate](lp2-rank28-period1-256-allsecret-native-e-capacity.md)). The dot-count clock is a hypothesis motivated by the artwork, not an authenticated instruction. [Read-only SFT](../sims/lp2_moving_escape_large_mark_clock_sft.cjs) executed in connected V8; an exhaustive 3×3 assignment oracle and eight deterministic random-key round trips of repeated solved p57 plaintext pass (103,648/103,648 rune recoveries). These are repeated-p57 implementation controls, not independent literary samples. No Windows CI run claimed. No plaintext/key recovered.

## Actual blind rank recovery, held-out control

Use 93 genuine solved-Cicada >=7-rune words that are present in the pinned lexicon. Seed 0x33010624 generates an arbitrary 28-rank permutation and an arbitrary 29-entry causal escape lookup f. Encrypt the complete control word tape continuously. Train only on the first 73 ciphertext words: enumerate candidate domains, repeatedly intersect the union of surviving candidates for each word, and prune rank edges that cannot extend to a matching. The true rank key survives and 22/28 ranks are uniquely identified. All 20 untouched control words retain their exact genuine plaintext candidate under the frozen training domains. Known-full-key control replay is exact. This is partial blind rank recovery, **not** full blind escape-table recovery; six ranks remain ambiguous, and the true escape table was not inferred. No original plaintext is claimed.

## Secret output-alphabet order: exact path embedding and full p55 ambiguity witnesses (Agent43, 24 November)

The fixed canonical output order is material. If the alphabet may itself be an arbitrary permutation, a nonzero transition rank can emit either of its two neighboring plaintext symbols. Given a proposed plaintext, construct a bipartite graph of 28 ciphertext transition ranks and 29 plaintext rune labels, adding an edge for every observed nonrepeat (rank, plaintext) pair. A rank order and alphabet order exist **if and only if** this graph has maximum degree two and no cycle. Necessity follows because the graph must be a subgraph of one alternating 57-vertex path with plaintext endpoints. Sufficiency: include isolated vertices as paths; there is exactly one more plaintext/plaintext-ended component than rank/rank-ended component (by the 29:28 vertex count). Orient mixed-end components plaintext-to-rank and concatenate them, then alternate the two same-end component types, beginning and ending with plaintext-ended components. Every required edge is retained. Repeated transitions impose no edge if per-occurrence escapes are arbitrary.

An order-independent histogram screen also failed to discriminate any of the 1,129,739 existing literary windows: grant independent page rank permutations and either input convention, then bound the largest k plaintext categories by the sum of the largest min(2k,28) rank bins per page plus 141 free sites. For a set of k vertices in a 29-vertex path, at least max(0,2k−30) edges are internal; sum the smallest that many bins per page. Neither bound excludes any native window, and the necessary 14-edge matching with each pair's capacity ≥151 does not exclude any. Do not treat the earlier J/EO result as an arbitrary-output-order theorem.

The new [read-only graph SFT](../sims/agent43_p55_moving_escape_all_order_graph_sft.cjs) directly joins word constraints with graph rollback, including preceding ciphertext at each page-local word start. Input: canonical p55's 76 runes, one incoming carry rune granted literal initial state, 16 full groups (75 runes), 29,060 pinned GP-normalized lexicon forms. Use cyclic predecessor-exclusion input ranks, arbitrary one-page output alphabet and rank permutations, and unrestricted per-occurrence escapes. It finds **three distinct complete original dictionary witnesses**, stopping after the third (481 DFS nodes, 3,486,692 candidate compatibility tests; no node cap). Example: `ruby the of soldau crowds thy communications guarding weary if passage loyalty tea blonde ewing toes`. The other two substitute IX and XI at the IF position. Every witness comes with an explicit 29-symbol alphabet, 28-rank order and 75 escape values, and **each decodes and re-encrypts all 76 original runes exactly**. The words are nonprose, the carry's plaintext is arbitrary, and the escape sequence is fitted to the desired outputs. They are not candidate historical solutions.

Three 700-rune plants from the authentic solved native GP tape use independent shuffled output alphabets, rank orders and causal escape functions. With supplied true plaintext/ciphertext pairs the graph completion retains all observed edges and replays 2,100/2,100 runes; none recovers the exact planted alphabet even up to reversal. This is a known-plaintext feasibility control, not blind key recovery. The original search likewise supplies no independently selected escape state or withheld prediction. The exact graph theorem provides a cheap constraint representation for any future genuinely selected reordered alphabet model; arbitrary output order alone removes the earlier fixed-order exclusion and makes exact replay plus lexical membership insufficient to identify the cipher. **Do not expand this search without a source-derived alphabet or causal escape rule.** Connected V8 execution; no Windows CI claim. Script commit b86b4564ed450a71c8803a04a540a952f5716aa8.

## Decision

Retire the continuous stationary-rank / arbitrary moving-escape family with global or chapter-private keys for direct ordinary native-GP prose; even independent page/section permutations fail when the output GP29 order is canonical. The E/singleton and rare-adjacent-pair constraints avoid any fixed escape identity. Do not expand the search by changing the escape schedule alone. Even independent original large-mark resets and cumulative dot-count rotations fail; a distinct source-selected rekey beyond those schedules, genuinely different output ordering or evolving alphabet, or changed plaintext register is required. No first-party rule currently supplies such a key.

[Executable read-only CommonJS SFT](../sims/lp2_moving_escape_arbitrary_rank_lexical_sft.cjs), run directly in connected V8 against the four pinned repository inputs. No CI run is claimed. The script includes exact matching, original parser agreement, all candidate counts, pair witnesses, native coverage, singleton/frequency bounds and the held-out plant. Source implementation commit 7ee66fdb829a266acf07e819cddac8c413859e76.
