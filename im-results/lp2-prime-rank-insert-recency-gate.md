# Prime-position adaptive alphabet: exact inverse and all-initial-order original gate

**Decision:** retire the ordinary-consuming receiver defined here under the native GP29 reference register. Its literal-F extension has an exact full-book canonical-list nondegenerate exclusion and an all-initial-list rank28 concentration exclusion; arbitrary initial lists with F at another rank remain unresolved. No unknown LP2 plaintext, authentic key, or source-selected insertion operation.

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

## Literal-F extension: rank28 degeneration and remaining nondegenerate case

When P=F, emit C=0 and hold the list and prime cursor. A visible zero may also be an ordinary consuming ciphertext. Let f=S(F); every consuming event must select a rank other than f.

A pooled abstract reachability pass maintains rank domains and allowed f masks per current prime cursor, with unions at held/consuming-zero merges. This safely relaxes correlations. Two secret-key F plants retain all 174,464 true list positions and the actual f at every step. The original p40–53 and book still have 15,190 and 18,902 terminal cursor/rank pairs in the relaxation; these are **not** actual feasible histories. The first implementation stopped on an empty domain, corrected to eliminate that infeasible abstract branch before the reported run.

An exact bounded DFS starting from the canonical GP29 list instead tracks actual lists, prime cursors and the intersection of ranks not selected at consuming steps. The only original complete path found for either scope uses f=28 (whole-book origin2, chapter origin9). Retesting with f28 removed gives:

| Original scope | Exhausted origins | Unresolved (2M-step cap) | Legal nondegenerate paths found |
| --- | ---: | ---: | ---: |
| Whole book | 464 | 0 | 0 |
| p40–53 reset | 461 | 3 | 0 |

The two canonical-list F plants also reach the cap before finding a witness, so this is an exact original exhaustion for the stated domains, **not** a calibrated key-recovery attack. Their true paths are known feasible by construction. The earlier ordinary plants remain exact recoveries.

**Why rank28 is degenerate.** R_i=28 requires prime[o+i] ≡0 mod29; only prime29 qualifies. Once that step is past, rank28 can change only if selected for removal, which is forbidden if f=28. The bottom glyph is permanent. Since all 28 nonzero ciphertext glyphs occur in each tested suffix, that permanent glyph must be C=0. Therefore every later C=0 is held and every nonzero C consumes in the upper 28-rank list. This conclusion does not depend on knowing the original secret initial list or choosing an F mask.

Grant the first64 positions completely free, all 28! upper-list orders, every possible suffix prime cursor (prefix nonzero count through 463+64), and any fixed S mapping the non-F plaintext glyphs to upper ranks. The same rank-domain bound yields:

| Original scope | Suffix cursors | Top-two cap including arbitrary prefix and literal Fs | Matched native floor |
| --- | ---: | ---: | ---: |
| Whole book | 468 | 1,203 | 2,555 |
| p40–53 | 467 | 489 | 563 |

All tested cursor cases synchronize. Thus the f28 degeneration fails under the finite native reference register **for every initial list and every secret rank chart**, not just the canonical list. Arbitrary initial lists with f≠28 remain unexcluded by the pooled F relaxation.

## Reproduction and next action

- [SFT](../sims/lp2_prime_rank_insert_recency_sft.cjs), `node sims/lp2_prime_rank_insert_recency_sft.cjs`.
- [Exact output](lp2-prime-rank-insert-recency-output.json). Executed the exact core in connected V8 using the fetched pinned repository inputs. The standalone Node wrapper was not independently executed; no CI run.
- The new reusable contribution is the rank-domain synchronization proof and exact repeat-anchor key inference for *any public insertion-rank schedule*. Avoid widening arbitrary unselected prime functions. The nondegenerate arbitrary-initial-list F extension remains mathematically unresolved; do not interpret the pooled domain survivors as a recovered key. A future exact constraint may exploit public state synchronization, but no independently selected insertion operation is established. This does not exclude all adaptive alphabets, arbitrary changing rank labels, or other plaintext registers.
