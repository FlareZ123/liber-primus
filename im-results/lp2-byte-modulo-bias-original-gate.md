# Original LP2: 8-bit modulo-reduction fingerprint

**14 November 2026, Agent 12.** A narrow, fully original-input negative against two unkeyed **8-bit byte-to-rune random sampling contracts**. The output remains encrypted; no authentic plaintext, source-selected cipher, key or continuation was found. Reproduce with [the read-only CommonJS SFT](../sims/lp2_byte_modulo_bias_original_sft.cjs) and the pinned [canonical source](../resources/liber-primus/lp2-corpus.json).

## Why the test matters

The unknown LP2 stream has almost uniform GP29 frequencies, with only 86 equal-rune transitions among 12,901 same-physical-page opportunities. Two natural computer-era explanations are to sample a rune as `random_byte % 29`, or to avoid previous-rune repeats by taking `random_byte % 28` and selecting that rank from the remaining 28 symbols. The choice to consider 8-bit random bytes reflects contemporary byte-oriented software and the exact 29-symbol inventory, **not an authenticated instruction**. A high-bit-width generator or rejection sampler has a different statistical signature.

For independent uniform random bytes `B=0..255`, `B%29` is biased: residues 0..23 each have **9** byte preimages, residues 24..28 each have **8**. In `B%28`, ranks 0..3 each have **10** preimages, and ranks 4..27 each have **9**. This probability imbalance is intrinsic and does not require knowing any generator seed. Both hypotheses use only the canonical source GP29 alphabetical index order; an arbitrary secret output permutation is outside the stated test.

## Exact original readout

| Frozen output register | Original observations | Byte-modulo expectation | Standardized difference | Pearson χ², uniform versus byte-modulo |
| --- | --- | --- | --- | --- |
| Direct `B%29` for all **12,956** ciphertext runes | Last five GP symbols: **2,305** | **2,024.375** | **+6.7901** | **26.3617 vs 69.5316**, 29 classes |
| Predecessor-excluding `B%28`, 12,815 ordinary **within-page unequal transitions** | First four ascending nonrepeat ranks: **1,864** | **2,002.34375** | **−3.3658** | **26.2632 vs 37.2761**, 28 classes |

For the second row only, at each successor `c≠previous`, invert the ascending nonrepeat alphabet as `rank=c−1` when `c>previous`, otherwise `rank=c`. Exactly **86** original same-page repeat events are retained as exceptions, and **55** page-initial rune positions are not assigned rank values. The model assumes exceptional events do not selectively remove rank categories. If they are rank-dependent, this conditional binomial calculation cannot be applied without that event mechanism.

The displayed standardized differences use the exact binomial means and variances under independent byte sampling. They describe a **particular encoder distribution**; they are not a hypothesis-free probability for Cicada's design, and word/page correlations or an unknown byte source can invalidate the iid calibration. No candidate decoder is fitted.

## Positive controls and decision

The SFT uses 50 complete cycles of every byte 0..255, exactly validating the expected 9/8 and 10/9 residue preimage counts (29-symbol control 450/400 each; 28-rank control 500/450 each). It asserts original page/rune/doublet counts, rank round-trip on every ordinary transition, all aggregate observations, and both standardized differences.

**Decision:** The original is unlike these two direct canonical *uniform-8-bit modulo* generators. The direct `byte%29` explanation is especially disfavored in the wrong direction; the rank28 case is narrower because the 86 exception sites have no authenticated handling. Neither result constrains unbiased byte rejection, 32-bit modulo, a secret output alphabet, keyed transduction, compression or ciphertext generated from a biased/nonuniform source. Avoid extending this to speculative seed hunts. Any subsequent mechanism should bring a first-party selector and provide independent original plaintext evidence.

Related but separate earlier work: [predecessor-rank-to-file signatures](lp2-predecessor-rank-binary-original-gate.md), [blind 32-bit MT19937 rank28 linear obstruction](lp2-blind-mt19937-rank28-low2-original-gate.md), [all-secret predecessor-state English comparison](lp2-previous-cipher-row-collision-allsecret-gate.md).
