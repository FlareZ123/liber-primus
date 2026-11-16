# Rank-28 five-rune to 24-bit receiver: original-input capacity gate

**Agent24, 16 November 2026. Classification:** bounded original-cipher negative; no recovered LP2 plaintext, creator key, typed binary payload, or author-selected decoder.

## Source clue and precise hypothesis

The unchanged LP2 p0–55 manuscript has 12,956 ciphertext runes on 55 rune-bearing pages, with only 86 adjacent equalities *within physical pages*. The original five-circle vignette appears on p7, p23 and solved p56. Independently, Cicada's historical stages used BASE29 and transported byte streams. Those facts motivate, but do not authorize, a direct anti-repeat **rank-28** digitization followed by **five digits → three bytes**. The arithmetic is close: 28^5=17,210,368 and 2^24=16,777,216.

For each original rune-bearing page, retain its first rune as a predecessor-state seed. For each later rune `c` and previous printed rune `p`, output digit `c` when `c<p` and `c−1` when `c>p`. For a doublet `c=p`, place its original position in an explicit sidecar rather than inventing a rank outside 0–27. The full original rune source is exactly reconstructed using the 55 seeds, 86 copy positions, original page lengths and surviving 12,815 rank digits.

This treatment preserves all actual source glyphs and explicitly accounts for the excluded repeats; the discarded positional sidecar would itself need a historical storage mechanism if this were the intended cipher.

## Exact original test and decisive condition

The 12,815 nonrepeat rank digits form **2,563 consecutive quintets** at source phase zero. Interpret a quintet in fixed GP29 ordinal-exclusion order as one big-endian base-28 integer `v`. A direct three-byte payload can only represent `0 ≤ v < 2^24`. The source has **63** phase-zero quintets with `v≥2^24`; the first 24 low-order byte values (which would need 63 discarded overflow bits) are `50c38ef407aebd47fee138ef4bcde39df4886481083b50b4`.

The smallest source-plausible start-phase/orientation nuisance family was also tested without optimizing plaintext: five possible global starting offsets and the original versus reversed order of each five-digit group.

| Phase | Forward overflow groups | Reversed-quintet overflow groups |
| ---: | ---: | ---: |
| 0 | 63 / 2,563 | 70 / 2,563 |
| 1 | 58 / 2,562 | 59 / 2,562 |
| 2 | 69 / 2,562 | 58 / 2,562 |
| 3 | 65 / 2,562 | 69 / 2,562 |
| 4 | 64 / 2,562 | 72 / 2,562 |

Under independent uniform base-28 quintets, roughly 2.52% exceed three-byte capacity (about 64.5 of 2,563 groups), so the observed 63 is consistent with an unconstrained digit stream; it is not a rare signature of purposeful binary packing.

A tempting completion would use the 86 original equal-rune events as overflow flags. Its exact simplest version is also contradicted. Under each global phase, only **[15, 16, 17, 17, 21]** of the 86 copy events appear immediately after a completed quintet; just **[1, 2, 1, 0, 1]** of them follow an actual overflowing quintet at that phase. Hence the repeats are not one-for-one postpacket overflow sentinels under any of these five clocks. The same argument applies to a marker placed at that exact boundary *before* the next quintet only if an independent rule selects which neighboring group is flagged; that rule is presently missing.

## Positive control and inference scope

An independent **95-rune authentic clear p57** stream is compressed with ordinary zlib, padded to complete three-byte groups, encoded as five base-28 digits per three bytes, then passed through the same predecessor-excluding no-repeat rune encoder. The complete positive inverse has **zero overflow quintets**, restores its padded compressed bytes, inflates the original p57 GP-rune values and replays its planted ciphertext. The original 12,956-rune reconstruction also succeeds exactly with its declared 55 seeds and 86 copy positions.

**Decision:** Reject a direct, sidecar-free **five original predecessor ranks to fixed three-byte payload** under the ten source-order/phase conventions, and reject the simplest equal-rune-overflow-boundary rescue. This rules out neither a separately supplied overflow sidechannel nor a different value permutation, variable-length code, rank grammar, byte clock or subsequent genuine encryption. Such changes require original-source instructions rather than more inferred patches. No unknown LP2 plaintext or key is claimed.

**Reproducer:** [self-contained Windows Node22 CommonJS SFT](../sims/lp2_rank28_quintet_24bit_original_sft.cjs), reading the unchanged [canonical original rune indices](../resources/liber-primus/lp2-corpus.json). Distinct earlier work tested rank28 as one C0 byte per rune or as an unknown stationary GP29 substitution ([rank28/pack-C report](lp2-anti-repeat-frame29-packc-gate.md)), and independently tested **base29** five-rune/24-bit packets on p55 and chapter bodies ([terminal quintets](lp2-terminal-quintet-overflow-channel.md)). Neither previously established this specific **base28 predecessor-exclusion five-rune binary capacity test**.
