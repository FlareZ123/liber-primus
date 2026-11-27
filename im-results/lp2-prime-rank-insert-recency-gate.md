# Prime-position adaptive alphabet: exact inverse and all-initial-order original gate

**Decision:** retire the ordinary-consuming receiver defined here under the native GP29 reference register. No unknown LP2 plaintext, authentic key, or source-selected insertion operation. The actual historical F-hold mechanism is outside this result.

## Motivation and explicit reversible sender

The solved p56 supplies the successive prime-minus-one clock, the solved p57 mentions circumferences, and ciphertext adjacency equality is suppressed. Prior [recency](lp2-recency-alphabet-original-inversion.md) and [prime-clock moving escape](lp2-recency-prime-atbash-escape.md) tests hold the insertion rank fixed; this distinct receiver instead inserts at a public changing rank. The combination is a hypothesis, not a historical instruction.

Let A be a secret 29-glyph list, S a secret bijection plaintext glyph→rank, and o a prime-index origin. At step i, emit C=A[S(P)], delete it, then insert it at R_i=(prime[o+i]−1) mod29. Inverse: find j=index_A(C), emit S^{-1}(j), and perform the same update. One rune consumes one clock step; no literal F holds. All ranks and initial order are zero-based. Reversing both list and ranks gives the equivalent reflected insertion convention.

## Exact repeat-anchor key recovery

For every i>0, C_i=C_{i−1} iff S(P_i)=R_{i−1}. This identity follows directly because the previous glyph was placed at R_{i−1}, regardless of initial list. Each equality establishes a bidirectional plaintext/rank assignment; each inequality forbids a pair. In a proposed donor alignment, first test the positive assignments for injectivity, then reject any assigned negative conflicts. Complete the remaining rank labels using their forbidden sets. Given a full S, propagate an initial-slot permutation rather than guessing A: each observed glyph binds the initial slot currently at rank S(P_i), and the positional update moves that slot to R_i. Reject conflicting forward or reverse bindings; complete unobserved slots if needed, and exactly re-encrypt. The completion search has a 200,000-node cap, explicitly counted as unresolved if hit; no actual original or plant survivor hits it.

| Test | Origin/donor combinations | Positive pass | Positive+negative pass | Exact full replay |
| --- | ---: | ---: | ---: | ---: |
| Whole LP2, 12,956 runes, 86 repeats | 16,299,856 | 0 | 0 | 0 |
| p40–53 independent chapter, 3,008 runes, 18 repeats | 20,915,728 | 3 | 0 | 0 |
| Hidden-key plant A | 16,299,856 | 1 | 1 | 1 |
| Hidden-key plant B | 16,299,856 | 1 | 1 | 1 |

Donors: all 35,129 full-length and 45,077 chapter-length contiguous windows of the pinned 48,084-rune greedy-GP Gibran corpus; all 464 origins (primes ≤3301). Plants use disjoint 12,956-rune Gibran intervals starting at offsets 1001 and 20001, independently seeded secret rank maps and initial lists, origins 37/229. Both recover both exact secret permutations, origin, donor start, and all 12,956 plaintext runes; repeat anchors identify 23/24 rank labels before exact completion. Controls are synthetic encryptions of one literary work, not authentic Cicada ciphertext. Donor membership is supplied to the attack, so these do not establish open-language recovery.

## All-secret initial-order bound without donor alignment

For each original ciphertext glyph g, maintain a bitmask of possible current list positions. Start all 29 domains at every rank (all 29! initial lists are included). If the selected glyph's old rank is a and another glyph's is b, removal gives b'=b−[a<b], insertion gives b''=b'+[R_i≤b']. Union over distinct a,b. For each b the possibilities a<b and a>b depend only on min/max of the selected domain. The bitset update is therefore a sound relaxation of all permutations, dropping cross-glyph correlations. Set the selected glyph's domain to {R_i}. When all masks become singleton the initial list has been completely forgotten; thereafter the rank sequence is known for *every* initial order. This is a constructive synchronization proof, not a sampled convergence claim.

Count every position in every rank admitted by its selected glyph's domain. The two largest counts upper-bound the total occurrences of any two plaintext runes under *any* fixed secret S. Ambiguous positions may be counted multiple times, making the bound conservative. A separate 12-random-list containment control checks 174,000 actual glyph positions, with no lost true position.

| Original scope (all 464 origins) | Maximum top-two cap | Synchronization after start (zero-based step, range) | All matched Gibran-window minimum |
| --- | ---: | ---: | ---: |
| Whole book, one continuous state | 1,188 | 176–1,307 | 2,555 |
| p40–53 with book state carried | 272 | 176–1,307 in book | 563 |
| p40–53 independently reset | 476 | 176–1,448 in chapter | 563 |

All 464 origins synchronize in all three tested scopes. No carried-chapter rank remains ambiguous. The fixed arbitrary S cannot change rank concentration. Thus no initial order, no shared secret chart, and no tested prime origin can produce even the top-two frequency of any matched Gibran window, independently of its rune sequence or printed boundaries. This is stronger than the exact donor-alignment rejection but still conditional on the finite native reference floor. Canonical order/chart direct inversion fitted on p0–2 selects origin134, fit −4.8054109 and carried p40–53 −5.0556278 nats/rune (solved-native trigram scorer); it replays all 12,956 original runes but is nonprose. Reencryption alone is not evidence for the key.

## Reproduction and next action

- [SFT](../sims/lp2_prime_rank_insert_recency_sft.cjs), `node sims/lp2_prime_rank_insert_recency_sft.cjs`.
- [Exact output](lp2-prime-rank-insert-recency-output.json). Executed the exact core in connected V8 using the fetched pinned repository inputs. The standalone Node wrapper was not independently executed; no CI run.
- The new reusable contribution is the rank-domain synchronization proof and exact repeat-anchor key inference for *any public insertion-rank schedule*. Avoid widening arbitrary unselected prime functions. Reopen only with a source-selected different insertion schedule, or a well-specified F-hold receiver that predicts the low-repeat exceptions. Neither has been established here. This does not exclude all adaptive alphabets, arbitrary changing rank labels, or other plaintext registers.
