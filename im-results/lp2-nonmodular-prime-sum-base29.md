# Nonmodular prime-sum BASE29 transport (#2636)

**Decision: exact transport rejected in all nine original chapters even with arbitrary key symbols.** No plaintext or key recovered. No first-party instruction selects this composition of the authenticated Gematria chart and historical BASE29 conversion.

## Frozen model

For plaintext rune index p and key rune index k, emit ordinary most-significant-digit-first BASE29 digits of chartPrime[p]+chartPrime[k], with no padding, separators or reduction. The 841 ordered pairs yield 136 distinct tokens, each of width one or two because 4 <= sum <= 218. Twenty-one single digits are legal: 4,5,6,7,8,9,10,12,13,14,15,16,18,19,20,21,22,24,25,26,28. The remainder must be covered by a legal adjacent pair. Allow arbitrary independent keys, a strict superset of the q8 schedule in the issue.

Let W[0]=1. At each reachable boundary i, for each matching legal token t add W[i] to W[i+len(t)]. A second exact BigInt count weights each edge by the number of ordered plaintext/key pairs emitting t. Track the minimum and maximum number of tokens and maximum reachable boundary. No language model, key optimization, alternate framing, or phase search.

An even stronger independent certificate is a digit x at an interior offset i such that none of [x], [C[i-1],x], [x,C[i+1]] is an admissible token. Any complete tiling must cover x by one of exactly these three possibilities. Such a digit remains impossible under any chapter-start phase or subdivision at token boundaries; the conclusion assumes the unmodified continuous rune tape and fixed representation.

## Executed original-input results

Canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, corrected transcription f7b534a33edeb212d427329798438325307463d7, solved native reference 1b064ef6d85819b7d96adaff31a82d1ec551598f. The two original rune tapes agree at all 12,956 positions. Use the established chapter boundaries from #2627, not raw $ splits.

| Chapter | Runes | Farthest complete prefix | Full parses | Uncoverable interior digits | First impossible offset and triple (GP0) |
|---:|---:|---:|---:|---:|---|
| 1 | 729 | 3 | 0 | 135 | 3: [18,3,6] |
| 2 | 1145 | 1 | 0 | 179 | 1: [20,11,12] |
| 3 | 1729 | 8 | 0 | 293 | 8: [5,2,13] |
| 4 | 1903 | 0 | 0 | 345 | 18: [16,0,21] |
| 5 | 1021 | 0 | 0 | 169 | 6: [14,23,6] |
| 6 | 1433 | 27 | 0 | 276 | 27: [17,0,23] |
| 7 | 1680 | 0 | 0 | 265 | 4: [5,0,10] |
| 8 | 3008 | 0 | 0 | 556 | 5: [6,23,25] |
| 9 | 308 | 3 | 0 | 46 | 3: [21,23,27] |

The concatenated original tape contains 2,269 uncoverable interior digits (about 17.5%). Example: chapter 1's [18,3,6] cannot cover center 3: the single sum 3 is below minimum 4, [18,3] exceeds the maximum 218, and [3,6] is decimal 93, which cannot be the sum of two chart primes (its only even-prime possibility is 2+91). The rejection is therefore independent of lexical register, key length or plaintext language. No q8 fitting is warranted.

## Constructed controls

Nine native solved source sections were encrypted using the fixed GP0 q8 key [3,17,9,22,5,28,11,0]. All nine admit the true tokenization and source length; all have zero uncoverable digits. The unrestricted tokenization is often ambiguous. The p57 plant (95 source runes, 178 encoded digits) admits 113,246,208 tokenizations spanning 95–119 tokens, before ordered pair multiplicity. The p56 plant (85 source runes, 161 encoded digits) admits 1,179,648 tokenizations spanning 85–103 tokens. These are encoder-generated native controls, not independent evidence that authentic LP uses this encoder; no hidden q8 recovery was attempted because the original fails the more permissive exact gate.

## Reproduction and scope

Run `node sims/lp2_nonmodular_prime_sum_base29_sft.cjs` from the repository. Exact DP and independent local impossibility counts executed in the JS tool runtime against the pinned original and solved inputs. The CJS wrapper includes assertions for both original and plant outcomes; no new CI. This retires only canonical unpadded nonmodular prime addition with the chart and BASE29 as stated. Together with #2627 and #2629 it narrows literal numerical transports, but does not reject an independently indicated different framing or a different cipher mechanism. Do not add new parameters solely to repair this failure.
