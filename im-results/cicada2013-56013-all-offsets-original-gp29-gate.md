# Full literal 2013 CicadaOS DATA/560.13 pad-source scan against the original LP2 opening

**Agent2, 23 November 2026. Classification: original-source, complete-offset, source-bounded negative with genuine 729-rune GP-native positives. No unknown LP2 plaintext, creator-selected key or destination recovered.**

## Why this was a plausible, finite key-source candidate

The preserved 2013 Cicada bootable ISO distributed unusually large non-system data objects, including `DATA/560.13`. Its original startup message tells a 2013 player, “The key is all around you.” That message does **not** specify using the large data object for Liber Primus, and neither the first-party LP2 pictures nor the archived ISO gives a GP29 byte-reduction or starting offset. Nevertheless, unlike a model-invented password, this is a finite actual historical Cicada-distributed high-entropy byte source. A direct running-byte key at an arbitrary offset could potentially decrypt an entire original LP2 chapter. Earlier independent [pnotisdev 2026 work](https://github.com/pnotisdev/cicada3301/blob/main/STATUS.md) had tested starting segments and sparse samples of `560.13` as a key, while explicitly leaving approximately **93% of positions** unscreened for additive models.

This experiment therefore searches **every possible 128-byte offset** of this exact original 2013 image member, with no hypothesized start index chosen from ciphertext. It evaluates precisely two source-defined GP29 decoders, then validates the best-ranked locations on the unchanged 729-rune opening chapter. The scan is a **key acquisition experiment**, not a decipherment claim.

## Original bytes and fixed decoder

[Deterministic read-only Python SFT](../sims/cicada2013_56013_full_literal_pad_scan_sft.py) uses the repository's already-preserved and validated [original-ISO join/download implementation](../sims/cicada2013_iso_rootfs_join_sft.py), which checks all three digests of the downloaded 2013 ISO. The exact file was extracted by the ISO9660 member byte extents, without launching its OS:

| Exact source property | Fixed result |
| --- | --- |
| Surviving original ISO | 136,398,848 bytes, SHA256 `784643558799dd8bb3e172f31df6d6ca2f397fd61cb8fc371bf930f1e5ae6b7f` |
| Data source | ISO member `/DATA/560.13;1` |
| Original ISO byte extent | offset **4,087,808**, length **118,818,811** |
| Source member SHA256 | `db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f` |
| First-pass candidate positions | **118,818,684** contiguous source offsets, every valid 128-byte window |
| Genuine LP2 target | Original physical pp0,1,2; **729 GP29 runes** with no ciphertext modifications |
| Original first-pass span | Fixed first **128 original runes** of that chapter; remaining **601** withheld for continuation |

The two explicit byte-key reductions are `K[j] = source[offset+j] mod 29`, and `P[j] = (X[j] - K[j]) mod29`, with the same original rune clock and no skip policy. Here `X[j]` is either (a) untouched GP29 ciphertext `C[j]` (**raw29**) or (b) its first-order predecessor difference `(C[j]-C[j-1]) mod29` (**difference29**, with first difference `X[0]=C[0]`). Neither model varies an alphabet, direction, seed, pad offset inside the file, per-word/page state or external transformation. Each candidate uses the contiguous source tape from that candidate's starting offset.

The single first-pass ranking is **129-position-independent** GP-native language-weighted likelihood. The source's independently known Gibran text was converted to the authenticated 29-rune orthographic convention: `QU→CW`, `K/Q→C`, `V→U`, `Z→S`, `ING→NG`, `IO→IA`. The frozen score weights are `round(12*ln(29*(source_frequency+0.5)/(source_total+29*0.5)))` per decoded GP symbol. No source-specific threshold was fitted to original LP2. The top **2,048** first-128 candidates in each model were subsequently checked on the original 729-runic source chapter, using the exact same fixed key clock, language scorer and IoC.

## Genuine planted-positive recoverability

The SFT independently plants a **729-GP-rune actual English source excerpt** under a known 729-byte keystream from a separate one-million-byte random tape at the frozen source offset **330,103**, once in the raw mode and once in the predecessor-difference mode. Both plants independently reencrypt and recover exactly all **729** original-register source runes and **rank the actual planted offset first** among all 999,873 full 128-byte windows under the same scorer. The independent known-plaintext GP-native chapter has an IoC of **0.0619092841**, a **first-128 score +640**, and a **whole-chapter score +3,380** on both modes.

This is a source-native positive test of both full-offset search algorithm and their inverse, not a decryption of LP2. The positive source and fixed values were never fitted to the unknown original ciphertext.

## Exact original source outcome

[Ubuntu GitHub Actions successful workflow run 45101510733](https://github.com/FlareZ123/liber-primus/actions/runs/45101510733) reproduced the ISO digests, extracted and independently digested the complete `118,818,811` source bytes, recovered both plants and completed both entire original-source scans in roughly 50 seconds of compute. Its [original code and pinned dependencies](../.github/workflows/agent2-2013-56013-full-direct-key.yml) and attached JSON report preserve the unchanged original sources and candidate ranks.

| Fixed model, exhaustive original scan | Highest first-128 source score | Average first-128 score, all positions | Best whole-729 score among first-128 top 2,048 | IoC of that 729-rune best |
| --- | ---: | ---: | ---: | ---: |
| GP29 raw byte pad | **−73** | −1,338.5100 | **−4,596** | 0.035699 |
| GP29 predecessor-difference byte pad | **−35** | −1,330.7483 | **−4,594** | 0.036411 |
| True original-register GP-native English plant | **+640** | n/a | **+3,380** | 0.061909 |

In particular, across the entire **118,818,684 candidate-offset** corpus, the **best 128-rune** scores (−73 / −35) were vastly below the same engine's first-128 genuine-language positive (+640), before any whole-chapter re-ranking. The strongest 729-rune candidates did not approach native-GP prose: each remained at approximately random-register IoC `0.035–0.036`, not the independent source-English `0.0619`. The best 40-rune outputs contained no original-authenticated English passage. The original full-chapter inverse did not recover any source-selected readable plaintext in either model.

The program's full first-pass top ranks, first-729 verification leaders, source checksums and positive-control outputs are in the attached `agent2-2013-original-56013-full-offset-cryptanalytic-report` artifact of the successful run. Source scan itself performed a complete byte-offset sweep; the 729-rune verification intentionally covered only the top-ranked 2,048 positions under the **precommitted** 128-rune language rule. A true plaintext segment in the tested ordinary GP-English register would have passed that first-pass rule with ample positive-control margin.

## Decision and honest limitations

**Retire direct, contiguous `DATA/560.13` bytes mod29 as an unknown-offset GP29 additive or predecessor-difference key for the 729-rune opening LP2 chapter in ordinary native-GP English.** This is stronger than earlier partial offset scans and covers every valid offset for the fixed 128-rune discriminator, with a genuine positive detector and a separate continuation check.

The original 2013 object is independently real but no known author instruction transfers it as an LP2 key. This negative does **not** exclude a hidden exact offset with a different native language, nonbinary/rank28 transport, original file transformations, skip-aware key pointer, a key independently selected from a different original, a cipher using data files other than `560.13`, or genuinely encrypted nontext payload. None of these possibilities should be promoted by inventing new search parameters merely to rescue this failed direct mode.

The right next action remains an independently source-selected operation and receiver, actual key-file disclosure, or complete authentic unknown-page plaintext recovered on the unchanged GP29 input, verified with a hold-out beyond the key construction.
