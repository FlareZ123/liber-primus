# READ OUT H-packet self-index recovers p0 THE exactly

**Agent14, 19 November 2026. Classification: source-constrained local value-changing inverse on original p0. This independently recovers the already navigation-predicted plaintext `THE`; it does not yet extend through `ROAD` or decrypt the page globally.**

## Frozen upstream state

Before this test, independent repository work had already fixed:

- the p28 plaintext candidate **READ OUT**;
- the split navigation `READ -> GP0 55 -> p50[55]=80`, `OUT -> GP0 20 -> p50[20]=102`, selecting p0 offsets80..102;
- the reversible word-shell map `H(x,y)=(x-y,x+y) mod29`;
- the DH23 state `p=23,g=5,a=6,A=8,B=19,b=15,K=2`;
- the ordered DH coordinate **(A,K)=(8,2)**, already used elsewhere in the current p50/DH route;
- an independent navigation prediction that the immediately following p0 word at offsets103..104 is `THE`.

The selected four-word receiver transformed word-by-word under H is the 23-rune packet:

`[19,23,25,4,16,12,9,6,10,14,15,8,24,5,21,5,28,26,22,9,0,18,2]`.

This packet and the ordered DH coordinate were fixed before checking the following ciphertext values.

## Self-indexing extraction

The packet has length exactly `p=23`, so use the already ordered values `(A,K)=(8,2)` as one-based positions.

- packet[8] = **6 = a**
- packet[2] = **23 = p**

Therefore the packet emits the two-rune additive key:

`[a,p] = [6,23]`.

The immediately following original p0 ciphertext word is:

`[H,EO] = [8,12]`.

Apply the ordinary GP29 additive inverse:

`[8,12] - [6,23] mod29 = [2,18] = [TH,E] = THE`.

Forward verification is exact:

`[2,18] + [6,23] mod29 = [8,12]`.

No plaintext letter, coefficient, phase, or key symbol is fitted.

## Origin/order controls

Two nearby conventions fail:

- zero-based positions8 and2 produce packet values `[10,25]`, not the required key;
- reversing the ordered DH coordinate to `(K,A)` produces `[23,6]`, not the required key.

The one-based convention is natural for a length-p packet indexed by nonzero DH values1..23, while the A-before-K order was already part of the established DH route. These controls are reported to expose the remaining convention dependence rather than hide it.

## Manuscript-wide fixed-family census

Across all 2,763 contiguous four-complete-word windows on unsolved p0..p55, applying the same word-shell H serialization gives only three windows whose one-based positions8 and2 equal `[a,p]`:

- p0 word18, start80, packet length23;
- p0 word30, start127, packet length18;
- p40 word12, start49, packet length19.

Only the first is the independently selected READ OUT receiver.

Among 422 four-word windows followed immediately by a two-rune word, the same fixed self-indexing rule decrypts the next word to `THE` in three places. Again, only p0 word18 is the independently selected READ OUT receiver, and it is the only one simultaneously emitting the independently fixed key `[a,p]`.

These counts are post-discovery controls, not unconditional authorship probabilities.

## Prospective continuation gate

A tempting recursion is to feed the extracted values `[a,p]=[6,23]` back as one-based packet positions. This predicts the next two key values:

`[packet[6], packet[23]] = [12,2]`.

The independently navigation-predicted `ROAD` requires additive increments beginning `[12,5,...]`. The first rune agrees and the second fails.

Therefore **do not repair the recursion** with a new index order, phase, exception, or fitted update. The useful result is the exact local recovery of `THE`; the state transition needed for ROAD remains unresolved.

## Decision

The current causal chain now reaches an original plaintext word through a reversible value-changing operation:

`READ OUT -> p0 80..102 -> H packet -> index by (A,K) -> [a,p] -> decrypt p0[103..104] -> THE`.

This is stronger than a checksum or positional prediction because it supplies the exact two key residues and re-encrypts the original ciphertext. Since `THE` was already predicted by a separate navigation route, classify it as **independent cryptographic recovery/corroboration**, not a newly discovered unknown phrase.

Reproducer: `sims/lp2_readout_hpacket_ak_the_inverse_sft.cjs`.
