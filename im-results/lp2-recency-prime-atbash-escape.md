# Adaptive ciphertext-recency, prime clock and moving Atbash escape: original-input decision (#2791)

**No unknown LP2 plaintext or authentic key.** This is an executable changing-alphabet hypothesis, not a claimed historical cipher. Unlike the stationary preceding-ciphertext row receiver, the state retains the entire recency order of 29 distinct glyphs and a nonperiodic cursor; the escape depends on the recovered preceding plaintext. Unlike previous fixed and moving-escape rank receivers, the 28 legal nonrepeat output values are dynamically ordered by access history, rather than by cyclic differences or a discrete logarithm. The source independently provides an actual 2014 bzip2/MTF precedent, solved Atbash, the original adjacent-repeat suppression, and the authenticated p56 prime-minus-one clock. None of these selects their proposed composition, and the proposed repeat clock is an analogy to (not a reproduction of) native clear-F holds. No printed word breaks are used.

## Explicit reversible mechanism

Let A be an evolving permutation of GP29 ciphertext symbols, initially canonical. Let q be the previous plaintext and t a cursor into the ordinary primes. Define E=28-q (Atbash of the preceding recovered GP symbol). If P=E, emit A[0] and hold t; otherwise delete E from the plaintext alphabet to obtain r=P-[P>E], choose j=1+(S^{-1}(r)+prime[t]-1 mod28), emit A[j] and increment t. Move the emitted ciphertext glyph to front in A and set q=P. S is any fixed permutation of 0..27; the direct key-recovery test uses the canonical S. The first ciphertext is handled by the same rule.

The inverse finds the emitted glyph's current rank j in A. A rank zero yields E; otherwise z=(j-1-(prime[t]-1)) mod28, r=S(z), and P=r+[r>=E]. Apply identical state updates. Every source glyph roundtrips without hidden flags, rerolls, deletions or unobserved key bits. Once one ciphertext glyph has occurred, its recency rank is determined by the number of distinct subsequent glyphs; this is a public state, not a separate hidden per-position alphabet. The variable rank ordering escapes the fixed cyclic/logarithmic-difference receiver of [the earlier prime-clock escape experiment](lp2-primeclock-rank28-moving-escape-original-gate.md), and the cumulative public-state ordering and nonperiodic prime schedule escape stationary predecessor and low-period recency row bounds. This is not an extension of the constrained-code sidecar or shared-cycle word-permutation experiments.

## Actual ciphertext-only inverse

The frozen direct family uses canonical S and enumerates 464 prime origins (all primes <=3301) x 29 initial plaintext states. Fit only pp0–2 (729 runes), select by smoothed native GP trigram likelihood, freeze and decode pp40–53 (3008 runes) with full intervening history. Train the original scorer on nine pinned published solved-native records; positive-plant scoring excludes the entire plant section. Exact forward replay for every reported output.

| Planted solved-native section | Recovered prime origin | Total exact plaintext | Withheld exact |
|---|---:|---:|---:|
| WELCOME | 37 | 515/515 | 206/206 |
| KOAN 1 | 101 | 780/780 | 312/312 |
| LOSS OF DIVINITY | 229 | 755/755 | 302/302 |
| jpg107–167 | 401 | 319/319 | 128/128 |

All four origins recovered, all 2369 planted runes and 948 withheld runes recovered. The fitted IVs differ from the planted IVs (the initial-state maps coalesce before observable distinctions in these examples); do not claim IV identification. These are encryptions of published rune transcriptions, not original Cicada ciphertexts. Four further arbitrary-permutation plants replay exactly, but arbitrary S recovery is not claimed. Original train winner origin52, IV0 has mean -4.82622; its frozen holdout mean -5.01079, versus independent plants -2.6520 to -2.3789. Original heldout IoC .03438365. The output is nonprose. Complete selected output and exact replay are stored.

## Stronger finite all-key original decision without English word boundaries

Grant arbitrary S (28! possibilities), any escape E at every position (even unrelated to Atbash), any previous-plaintext IV, and each of the 464 prime origins. For any chosen plaintext glyph p, a nonrepeat may decode to p only if r=S(z) is p or p-1 (at extremes just one). Thus the count of ANY one plaintext glyph is bounded by the two most frequent distinct z labels plus every repeat. This holds even if the escape is freely chosen per rune; it does not depend on the proposed state law. Maximize the bound over origins independently for each interval. This is an exact necessary bound, not a linguistic optimization.

Further grant every secret starting alphabet A (29!): only the 29 first accesses can have unknown ranks. Grant each such site an arbitrary plaintext glyph and cover both possibilities for the initial rank-zero/hold event. All later ranks and clock advances are fixed by C. The resulting relaxation bounds every possible S and initial alphabet without enumerating either.

| Original interval | Public initial list cap | Arbitrary initial list cap | Minimum E count across all matched contiguous Gibran GP windows | Number of matched windows |
|---|---:|---:|---:|---:|
| Full 12956 | 1146 | 1174 | 1416 | 35129 |
| Development 729 | 90 | 118 | 55 | 47356 |
| Withheld 3008 | 293 | 293 | 304 | 45077 |

Thus even the very generous original decoder family cannot reproduce any of the matched full-book or held-out literary windows; the early 729-rune interval alone does not supply the same obstruction. The Gibran comparison is a single finite author/register, with normalization, not a proof over every possible language. Actual original candidate is much flatter (max483 occurrences among 12956, E433). The all-key ceiling does not establish the true encryption mechanism. A different public rank order, clock, hidden layer, or non-English register is outside this result.

## Reproduction / action

- [Single-file CJS experiment](../sims/lp2_recency_prime_atbash_escape_sft.cjs)
- [Complete raw output](lp2-recency-prime-atbash-escape-output.json)
- Executed against pinned repository sources in connected V8. No separate Node/Windows CI claimed.
- Retire this precise history-dependent rank-escape receiver and its all-secret relaxation, absent a new independent source selector. The concrete missing ingredient is an authored rule choosing an evolving alphabet order and a repeat/clock interpretation. The manuscript's low repeat count alone does not identify such a rule. The original #2791 task is complete as a failed specific generative law with discriminating continuation and exact all-key bound, not as a decryption.
