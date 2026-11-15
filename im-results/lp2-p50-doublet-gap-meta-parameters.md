# Original pp49–51 numerical table as page-order or doublet-gap metadata

**Decision, 15 November 2026 (Agent33):** A previously parked finite interpretation of the 256 two-character cells has now been run on the canonical original-source inputs. Neither a direct 56-page permutation nor an 85-gap numerical readout survives its specified test. This is a scoped consumer exclusion, **not** recovered unknown plaintext or a general rejection of the table.

## Source-selected objects and hypothesis

The physical LP2 pp49–51 table has 32×8=256 two-character cells. The canonical image-adjudicated derived transcription is [`lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json), whose byte interpretation is two positional base60 digits per cell. An independently motivated alternative deletes lowercase `f`, absent from this source's actual cells, to give a radix59 control. Neither radix is a separately authenticated cipher instruction.

The unchanged [LP2 corpus](../resources/liber-primus/lp2-corpus.json) gives 12,956 ciphertext runes across pp0–55, including 86 consecutive equal-rune sites. The sites have 85 consecutive positional gaps, beginning **85, 249, 197, 129, 127, 23, 47, 59**. The 2014 LP2 release contains 56 unsolved physical pages, including rune-free p50.

The proposed straightforward numerical consumers are:
1. A 56-entry run of distinct original byte values 0–55, specifying a complete physical-page permutation. This was extended to an all-traversal necessary-condition test: the entire 256-byte multiset must at least contain each page ID.
2. A contiguous encoding of the 85 observed inter-doublet gaps. First compare bytes directly with gaps modulo256. Then allow any source-contiguous 85-byte window, or 85 adjacent 16-bit little/big-endian fields, and search for monotone correspondence by **Spearman rank correlation**, without choosing a particular offset afterwards. The 346 windows per radix comprise 172 byte windows plus 87 two-byte big-endian and 87 little-endian windows.

## Exact results

| Source reading | Distinct 0–55 raw IDs in all 256 values | Missing raw IDs | Missing after mod56 | Direct 56-ID consecutive windows | Best exact gap-mod256 matches of 85 |
| --- | ---: | ---: | --- | ---: | ---: |
| Canonical radix60 | **32/56** | **24** | **45** | **0** | **2**, offset 8 |
| Radix59 minus unused `f` | **33/56** | **23** | none | **0** | **3**, offset 80 |

For canonical radix60, absence of any of the 24 missing raw IDs prevents a complete 0–55 permutation under **any** mere permutation of its 256 byte cells. Even a separate `byte mod56` remapping omits ID45; thus it cannot yield the complete 56 IDs by reading, routing or discarding any subset of those reduced values. The radix59 control's modulo56 multiset does contain all 56 IDs, so this stronger exclusion must **not** be applied to that different normalization.

| Rank/similarity diagnostic | Original optimum; full tested family |
| --- | --- |
| Radix60 best Spearman | **+0.31331730** at byte start 150, contiguous byte stride |
| Radix59 best Spearman | **+0.31331730** at byte start 150, contiguous byte stride |
| Radix60 best Pearson (diagnostic only) | **+0.38736799** at byte start 151, contiguous byte stride |
| Radix59 best Pearson (diagnostic only) | **+0.38686528** at byte start 151, contiguous byte stride |

A deterministic **5,000-draw** null permutes the 85 source gap ranks while fixing every original radix60 table window, then uses the **maximum absolute Spearman correlation over all 346 windows**. Seed `0x33012014`, 3,132 surrogate maxima at least as extreme as the observed **0.31331730**, yielding add-one familywise **p=0.6264747051**. The rank-alignment route has no exceptional signal by that specified comparison. The small post-selected Pearson peak is not supported by a 2014 first-party start address or decoding operator; it must not be promoted to a key.

## Research decision and reproducibility

Reject the **literal raw-byte direct 56-page permutation** and **direct original-gap modulo256/rank-encoding** under these frozen readings. These finite negatives do not exclude alternate number-to-page mappings, original table ciphers, an external key, an explicitly chosen start address or other stateful consumers. The missing causal step remains a creator-selected inverse and a receiver on original unknown GP29 ciphertext.

[Read-only Node22 SFT](../sims/lp2_p50_doublet_gap_meta_sft.cjs) reconstructs the field, original doublet sites, all 346 candidate windows per radix and the seeded null directly from the checked-in source. [Original-source Windows success, run 43722196475](https://github.com/FlareZ123/liber-primus/actions/runs/43722196475) prints every exact count and correlation. No synthetic cipher/plaintext fit was used; no unknown LP2 cipher is asserted.
