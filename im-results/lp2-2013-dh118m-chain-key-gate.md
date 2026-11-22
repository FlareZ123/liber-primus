# 2013 large-DH session as an LP2 chain-key source: direct gate

**Classification:** intermediate negative for LP2 key use. The 26 January 2013 participant transcript is now byte-verified in the pinned 2024 community archive (raw SHA-256 `6d70a085df5909fd72a64490066c3453f345a87ff23adc2d36efe2208cdb41cd`; Git blob SHA-1 `8c0a93d7d620c35805d9be71206d593df8e15dca`). It is not OpenPGP-signed as a whole, the client identity is not authenticated, and no LP2 selector or receiver is established. No LP2 plaintext is recovered.

## Why this was tested

Independent work identifies a plausible chain-cipher architecture for the unsolved rune stream. For each adjacent ciphertext pair,

\[
d_i=(c_i-c_{i-1})\bmod29.
\]

The candidate model reserves the zero step for EA (GP29 index 28). For every other plaintext symbol \(p_i\in\{0,\ldots,27\}\), it emits

\[
s_i=1+(p_i+k_i)\bmod28,\qquad c_i=(c_{i-1}+s_i)\bmod29.
\]

This naturally explains the strong deficit of equal adjacent ciphertext runes, but the independent chain analysis has not found a key source. See the external [Liber Primus analysis report](https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/blob/main/docs/REPORT.md) and the repository's [GIMP/chain-stream gate](lp2-gimp-prng-chain-stream-gate.md).

The byte-verified January 26 participant transcript records the following live exchange:

- client-supplied modulus p = 118,818,811
- participant-server-selected base h = 65,551,251
- participant-server-selected secret a_s = 65,974,449
- server public share = 76,477,436
- client public share = 123
- returned shared value K = 8,686,271
- uniquely derived client exponent = 44,073,865 (not printed in the log)

The signed protocol assigns the modulus and client public share to the client and the base/secret to the participant server. These are participant-session values, not organizer-authenticated key material. The g=5 below is imported from the separate signed DH23 worked example; it is **not** the January session's actual base h=65,551,251. The following is a cross-session hybrid hypothesis, not a native transcript-derived keystream. The smallest natural stream-generator hypothesis is the multiplicative recurrence

\\[
x_0=K,\\qquad x_{n+1}=5 x_n\\bmod p,\\qquad k_n=x_n\\bmod28.
\\]

This deliberately uses the January shared value and modulus with the separate DH23 example's generator, without a fitted seed, extra hash, table lookup or language-dependent parameter.

## Frozen experiment

The canonical p0–p55 rune stream is concatenated in physical page order. The first rune is treated as an unknown chain IV; the 12,955 subsequent differences are tested.

For a nonzero difference, the inverse is

\[
p_i=(d_i-1-k_n)\bmod28.
\]

The opposite additive orientation is also tested. For a zero difference, the output is fixed to EA. The two plausible key-clock conventions are tested: consume a key at EA, or leave the key state unchanged. This gives exactly four variants:

| Decryption orientation | Advance key at EA? | Key symbols consumed | IoC of nonzero 28-symbol output |
|---|---:|---:|---:|
| subtract key | yes | 12,955 | 1.000146 |
| subtract key | no | 12,869 | 1.000345 |
| add key | yes | 12,955 | 1.000012 |
| add key | no | 12,869 | 1.000477 |

The corpus contains 12,956 runes, hence 12,955 adjacent differences: 86 zero steps and 12,869 nonzero steps. All four outputs have 28-symbol index of coincidence essentially 1.0, the uniform-random baseline. The first 96 decoded symbols are also non-linguistic in every variant. There is no indication of recovered plaintext.

The implementation includes a synthetic positive control containing all 29 GP symbols, including EA. Both EA key-consumption conventions recover the synthetic 400-symbol plaintext exactly. Thus the negative result is not caused by an inverse-formula or key-clock implementation error.

The recurrence has no short period over this corpus: the reconstructed modulus gives

- \(p-1=2\cdot3^2\cdot5\cdot11\cdot257\cdot467\)
- \(\operatorname{ord}_p(5)=59{,}409{,}405\)
- \(\operatorname{ord}_p(K)=720{,}114\)

The actual January base h=65551251 is a primitive root with order p−1 = 118,818,810. It is distinct from g=5 used in the frozen hybrid test and is not an LP2 generator candidate absent a source selector.

The failure is therefore not explained by a trivially short key period.

## The tempting 257/256 connection

The factor 257 in \(p-1\) is one greater than the p50 table's 256 cells. I tested the direct interpretation that the p50 table is the byte projection of a 257-cycle.

Both natural order-257 roots were generated:

\[
h_g=5^{(p-1)/257}\bmod p,\qquad
h_K=K^{\operatorname{ord}(K)/257}\bmod p.
\]

For each root, both 256-element windows \(h^0,\ldots,h^{255}\) and \(h^1,\ldots,h^{256}\) were projected modulo 256 and compared position-for-position with the p50 table under both base60 and base59 token interpretations. The eight comparisons produce at most **3 exact matches out of 256**. The table itself has 161 distinct values under either radix. This does not support a direct 257-cycle-to-p50-byte identity; the 256/257 size relation should not be treated as a key derivation.

## Decision

Reject this specific cross-round construction:

- DH state \(K\) as the seed;
- multiplier \(g=5\) modulo \(p\);
- direct output projection \(x\bmod28\);
- the independently proposed 28-symbol chain inverse.

The test does **not** disprove the January transcript or every possible use of the session in Cicada's wider puzzle. It rejects only the specified hybrid that seeds from the January shared value but multiplies by g=5 from the separate DH23 example, plus the direct 257-cycle byte-table interpretation. The actual January server base h=65551251 has order p−1; it was **not** tested as an LP2 stream generator because no source selects that use. Do not add that or arbitrary KDFs, offsets, table lookups or exponent schedules without a new source clue selecting the operation.

## Transcript byte provenance and finite session census

The January record is the raw file irc-logs/clientlog-1359224026-2.txt at pinned archive commit ade9a02889ef8acbc8cde8edbfd0a785c369f4c3: **1,759 bytes**, raw SHA-256 **6d70a085df5909fd72a64490066c3453f345a87ff23adc2d36efe2208cdb41cd**, Git blob SHA-1 **8c0a93d7d620c35805d9be71206d593df8e15dca**. The raw bytes retain CRLF; the recomputed Git blob hash matches the pinned tree. The file was first added by unsigned commit f403afb9e6db2a2fb3825c7b4801c2af0ddd7228 on 24 April 2024; the pinned archive snapshot is 3 May 2024. Its embedded 2013 timestamps are not independent proof of contemporaneous capture or custody.

A complete census of the ten irc-logs/clientlog-* files at that commit is preserved in 2013-tcp-live-test-vectors.json. Exactly three contain executed DH requests: 26 January DH 118818811, 26 January DH 5, and 3 March DH 3301. Only the March record contains an executed NEXT request; its separately signed payload does not sign the surrounding log. The other seven clientlogs contain no executed DH request; three contain the string DH only inside server-source text sent to the client. The companion mainlog.txt lists ten loopback connections matching the clientlog timestamps. Loopback is expected under the signed protocol's Tor hidden-service instructions and does not establish a local self-test.

The January exchange itself contains no NEXT, no signed response, and no authenticated client identity. Its modulus and client share are client inputs; its base and secret are participant-server choices. The exact file-size correspondence with DATA/560.13 is a participant-era hypothesis, not a source-authenticated LP2 selector. No candidate value is to be tested against LP2 until a separate original clue selects a typed receiver and operation.

## Reproduction

From the repository root:

    node sims/lp2_2013_dh118m_chain_key_gate.cjs

Inputs:

- resources/liber-primus/lp2-corpus.json
- resources/liber-primus/lp2-grid-256.json

The script prints the four chain variants, synthetic-control status, DH orders and all eight 257-cycle/table comparisons.
