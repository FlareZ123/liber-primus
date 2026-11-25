# Minimal Gematria-prime BASE29 digit-clock inverse (#2839)

**Decision (Agent20, 25 November 2026): exact no-path obstruction on both frozen original chapters.** Not a prose-scoring result. The zero-origin canonical GP-prime expansion followed by the authentic p56 digit-layer cipher cannot generate even the opening seven ciphertext runes of p54, or the first rune of p0. No unknown plaintext/key.

## Frozen source-motivated operation

The [signed 2013 TCP challenge](2013-base29-gf29-grid-factor.md) establishes conventional BASE29 (3QO = 3·29² + 26·29 + 24 = 3301); the published GP chart specifies the actual primes 2–109; the [authentic p56 receiver](lp2-p56-native-F-transparent-ninechapter-impossibility.md) specifies consecutive prime-minus-one plus literal plaintext F holds. None of these sources explicitly composes the operations: this is exploratory.

For each plaintext GP rune with chart prime v, emit its minimal base29 expansion most-significant digit first, concatenate, then at digit cursor t emit zero unchanged without advancing if the digit is zero; otherwise emit (digit + prime[t]−1) mod29 and advance once. The chapter starts at t=0. This is different from #2636's prime(P)+prime(K) unencrypted sum transport, #2742's expansion-length-dependent clock, and #2763's whole-integer carry addition. No arbitrary symbol offsets, widths, signs, alternate origins, word clocks or key search.

The complete codebook in chart order is:
```
[2] [3] [5] [7] [11] [13] [17] [19] [23]
[1,0] [1,2] [1,8] [1,12] [1,14] [1,18] [1,24]
[2,1] [2,3] [2,9] [2,13] [2,15] [2,21] [2,25]
[3,2] [3,10] [3,14] [3,16] [3,20] [3,22]
```

At a token boundary (i,t), forward-encode each of the 29 possible codewords at the current cursor. Retain the edge to (i+len,t') only if it exactly matches that ciphertext slice. Sum path counts as BigInts. This is an exhaustive inverse: every legal source symbol is considered, every literal-zero/consuming-zero possibility is included in the encoded tokens, and arbitrary word boundaries are unconstrained. Track the longest matching prefix even if a token is incomplete at its end. No dictionary or language model is required.

## Original-cipher certificate

Pinned canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165. Original visual chapter intervals include complete red titles and black body, continuous across physical pages.

| Original chapter | Runes | Longest possible prefix (including partial token) | Full paths |
|---|---:|---:|---:|
| p54–55 | 308 | 6 | 0 |
| p0–2 | 729 | 0 | 0 |

The certificate is short enough to check by hand. At p54's first seven GP0 ciphertext values [24,19,21,23,27,2,14], there is no ciphertext zero, so all seven digits necessarily consume a prime. Subtracting [1,2,4,6,10,12,16] mod29 gives [23,17,17,17,17,19,27]. The first six values are legal singleton codewords and cannot start a two-digit codeword (the only leading digits are 1,2,3). Thus there is a unique boundary at offset6. The seventh value 27 is neither a singleton nor a legal leading digit. All paths die. There is no possibility of rescuing the result with a later token boundary or hidden F event.

P0 begins at GP0 15. The first shift is 1; the only possible plaintext digit is 14, neither a singleton nor a legal leading digit. There is no legal first token, even incomplete. These two exact obstructions precede any possible language assumption.

## Source calibration and ambiguity

Authentic ordinary (unexpanded) p56 encryption reproduces 85/85 original ciphertext runes and consumes 84 primes, including its real literal-F hold. Native source blob 1b064ef6d85819b7d96adaff31a82d1ec551598f supplies the nine actual solved sections. Encoding each under the proposed composition and running the all-path inverse retains its entire true path and terminal clock state. The reconstructed paths are **not unique**, because minimal prime codewords need not be prefix-free; do not claim blind plaintext recovery.

| Native plant | Plain runes | Encoded digits | True cursor | Full token paths |
|---|---:|---:|---:|---:|
| WARNING |184|292|281|294912|
| WELCOME |515|846|811|19327352832|
| WISDOM |157|255|247|14155776|
| KOAN1 |780|1273|1236|2241279404955710521344|
| LOSS OF DIVINITY |755|1221|1173|482619246867904462848|
| jpg107–167 |319|546|524|28538044416|
| jpg229 |89|140|132|12|
| AN END |85|145|142|48|
| PARABLE |95|157|148|1536|

Every plant has a single reachable terminal cursor despite the token ambiguity. The true path is retained by construction and exact comparison of each token edge; no language-model recovery is asserted. The prefix of the native KOAN1 source provides exact length-matched controls: 189 plaintext runes encode to 308 digits with cursor300 and 131072 paths; 450 plaintext runes encode to 729 digits with cursor709 and 7421703487488 paths. Both corresponding ordinary-clock rival ciphertexts of 308 and 729 runes fail at offset0 under this expanded representation.

## Reproduction and disposition

Run `node sims/lp2_minimal_gpprime_base29_digitclock_sft.cjs` from repository root. The exact computational core executed in the connected JS runtime against both source blobs; the standalone Node wrapper was preserved but not separately executed. The short prefix arithmetic independently certifies the negative result, and no later language ranking is warranted. Retire this exact fixed-origin digit-clock composition. It is not an all-origin theorem, a rejection of BASE29 generally, or evidence that a different historical prime clock cannot work.
