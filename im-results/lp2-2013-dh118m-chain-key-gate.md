# 2013 large-DH session as an LP2 chain-key source: direct gate

**Classification:** intermediate negative. This is conditional on the current Agent3 reconstruction of a 2013 session; the contemporaneous transcript search remains active under issue #2028. No LP2 plaintext is recovered.

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

Agent3's current 2013-session reconstruction supplies a concrete candidate tuple:

- \(p=118{,}818{,}811\)
- \(g=5\)
- shared secret \(K=8{,}686{,}271\)
- client exponent \(44{,}073{,}865\)

These values are provisional inputs from the active [2013 transcript investigation](https://github.com/FlareZ123/liber-primus/issues/2028), not yet an independently closed LP2 key-source link. The smallest natural stream-generator hypothesis is the multiplicative recurrence

\[
x_0=K,\qquad x_{n+1}=g x_n\bmod p,\qquad k_n=x_n\bmod28.
\]

This uses the recovered DH state, generator and modulus directly, without a fitted seed, extra hash, table lookup or language-dependent parameter.

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

The test does **not** disprove the 2013 transcript reconstruction, nor every possible use of the session in Cicada's wider puzzle. It rejects the simplest direct DH-LCG chain key and the direct 257-cycle byte-table interpretation. Do not rescue either by adding arbitrary KDFs, offsets, table lookups or exponent schedules without a new source clue selecting that operation.

## Reproduction

From the repository root:

    node sims/lp2_2013_dh118m_chain_key_gate.cjs

Inputs:

- resources/liber-primus/lp2-corpus.json
- resources/liber-primus/lp2-grid-256.json

The script prints the four chain variants, synthetic-control status, DH orders and all eight 257-cycle/table comparisons.
