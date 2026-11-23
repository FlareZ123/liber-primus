# Full original 2013 CicadaOS DATA/560.13 byte-key source against LP2: four exhaustive GP29 and GP28 inverses

**Agent2 (original Python scans) + Agent5 (independent C++ GP28 reproduction), 23 November 2026. Classification: original-source, complete-offset, source-bounded negative with genuine 729-rune GP-native positives. The two GP28 transports now have a second implementation and a full-search familywise null calibration. No unknown LP2 plaintext, creator-selected key or destination recovered.**

## Why this was a plausible, finite key-source candidate

The preserved 2013 Cicada bootable ISO distributed unusually large non-system data objects, including `DATA/560.13`. Its original startup message tells a 2013 player, “The key is all around you.” That message does **not** specify using the large data object for Liber Primus, and neither the first-party LP2 pictures nor the archived ISO gives a GP29 byte-reduction or starting offset. Nevertheless, unlike a model-invented password, this is a finite actual historical Cicada-distributed high-entropy byte source. A direct running-byte key at an arbitrary offset could potentially decrypt an entire original LP2 chapter. Earlier independent [pnotisdev 2026 work](https://github.com/pnotisdev/cicada3301/blob/main/STATUS.md) had tested starting segments and sparse samples of `560.13` as a key, while explicitly leaving approximately **93% of positions** unscreened for additive models.

This experiment therefore searches **every possible 128-byte offset** of this exact original 2013 image member, with no hypothesized start index chosen from ciphertext. The first experiment evaluates two native GP29 direct decoders, followed by a second, independent full-offset experiment covering two 28-successor no-repeat transports. Both validate the best-ranked locations on the unchanged 729-rune opening chapter. The scan is a **key acquisition experiment**, not a decipherment claim.

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

The first experiment's two explicit byte-key reductions are `K[j] = source[offset+j] mod 29`, and `P[j] = (X[j] - K[j]) mod29`, with the same original rune clock and no skip policy. Here `X[j]` is either (a) untouched GP29 ciphertext `C[j]` (**raw29**) or (b) its first-order predecessor difference `(C[j]-C[j-1]) mod29` (**difference29**, with first difference `X[0]=C[0]`). Neither model varies an alphabet, direction, seed, pad offset inside the file, per-word/page state or external transformation. Each candidate uses the contiguous source tape from that candidate's starting offset.

The single first-pass ranking is **128-position unigram** GP-native language-weighted likelihood. The source's independently known Gibran text was converted to the authenticated 29-rune orthographic convention: `QU→CW`, `K/Q→C`, `V→U`, `Z→S`, `ING→NG`, `IO→IA`. The frozen score weights are `round(12*ln(29*(source_frequency+0.5)/(source_total+29*0.5)))` per decoded GP symbol. No source-specific threshold was fitted to original LP2. The top **2,048** first-128 candidates in each model were subsequently checked on the original 729-runic source chapter, using the exact same fixed key clock, language scorer and IoC.

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

## Second exact full-file experiment: GP28 anti-repeat successors

The ordinary GP29 additive model cannot itself account for the **86 genuine adjacent repeated runes** against approximately 447 independent-random expectations. An independently distinct, source-constrained next test uses the 29-symbol **predecessor-exclusion alphabet**. For each later rune, permit **28 non-repeating successors** of the preceding original ciphertext rune; the remaining equality event is mapped literally to plaintext ordinal **28 (EA)**, an illustrative hypothesized rare-rune escape. The first rune remains an ordinary mod29 byte-key operation. This is a concrete invertible algorithm consistent with the gross anti-repeat fingerprint, **not an attested author encoding**. In particular, literal EA-at-doublet conflicts with other tested word-boundary statistics, so success would require true plaintext rather than an ad hoc special-rune interpretation.

The original source bytes are *identical* to experiment 1, SHA-256 `db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f`. Fixed contiguous key clock `source[offset+i] mod28` at all positions, including equal-rune markers; no key skips or word reset. For every `C_i != C_{i-1}`, consider precisely two source-independent natural orderings of the 28 available ciphertext successors:

1. **Circular difference rank:** `r_i = (C_i-C_(i-1)-1) mod29` lies in 0..27; `P_i = (r_i-K_i) mod28`.
2. **Ordinal excluded-predecessor rank:** `r_i = C_i-[C_i>C_(i-1)]` lies in 0..27, the ordered alphabet with preceding rune deleted; the same `P_i=(r_i-K_i) mod28` inverse.

Each fixed rank scheme has an *exact and independently proved* planted 729-GP-rune English positive: original-language sample encrypted at independent byte source offset **220,103**, then exactly recovered **729/729** rune indices under the unchanged inversion and ranked **first** among 999,873 synthetic offset windows. Both positives score **+640** over first128 and **+3,380** over entire 729 runes, with IoC **0.061909**. These are actual source-native GP positive controls with a fully reversible, runnable cipher.

The second successful [118 MB GP28 Ubuntu CI 45101857887](https://github.com/FlareZ123/liber-primus/actions/runs/45101857887) runs the complete original read-only ISO extraction and both 118,818,684-offset native scans. Exact [standalone decoder and original-source SFT](../sims/cicada2013_56013_full_rank28_sft.py) and [on-push workflow](../.github/workflows/agent2-2013-56013-full-rank28.yml) preserve original byte digests, both decoder definitions, both true plants, and the full top candidates with the 729-rune held-out tests in its attached JSON.

| GP28 source-key consumer | Highest first128 original score across **all 118,818,684** offsets | Best original full729 score among top2,048 first128 | Associated original IoC |
| --- | ---: | ---: | ---: |
| Circular difference successor rank | **−46** | **−4,376** | 0.036238 |
| Ordinal excluded-predecessor successor rank | **+2** | **−4,313** | 0.036785 |
| Known 729-rune GP-native positive in both variants | **+640** | **+3,380** | 0.061909 |

### Independent C++ reproduction and max-statistic null (Agent5, 23 November 2026)

The two GP28 transports above were reimplemented independently in C++20/OpenMP, rather than calling the original Python decoder or scanner. The [input preparer](../sims/cicada2013_56013_rank28_independent_prepare.py) parses the ISO9660 primary volume descriptor and directory records itself, locates /DATA/560.13;1 at LBA 1996 (byte offset 4,087,808), and verifies the original ISO (136,398,848 bytes; SHA256 784643558799dd8bb3e172f31df6d6ca2f397fd61cb8fc371bf930f1e5ae6b7f) and member (118,818,811 bytes; SHA256 db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f). It extracts the unchanged 729-rune GP29 receiver from physical pp0–2. The C++ scanner uses position-major 256-entry lookup tables and exhaustively self-tests both inverse orderings across all 29 previous symbols × 29 plaintext values × 256 key bytes.

The scoring model is independently rebuilt from 62,492 GP29 runes of Gibran's *The Prophet*, with add-0.5 smoothing and integer weights round-to-nearest/ties-to-even: [-3, 5, 0, 11, 8, -1, -10, -4, -2, 8, 6, -33, -55, -8, -47, 8, 7, -10, 15, -6, 2, -17, -58, 3, 8, -87, -2, -26, -15]. The exact receiver, source tape and fixed 128-rune probe are the same as above. Both modes scan all **118,818,684** valid offsets:

| Independent C++ result | Circular difference rank | Ordered excluded-predecessor rank |
| --- | ---: | ---: |
| Global first128 maximum | −46 | +2 |
| Best full729 candidate offset | **81,152,333** | **251,599** |
| That candidate's first128 score | −297 | −263 |
| Best full729 language score | −4,376 | −4,313 |
| Best full729 IoC | 0.036238110312 | 0.036784546044 |

The full 729-rune GP29 index arrays for the top five full-chapter candidates in each mode, the top 20 first-pass offsets, and both positive-control plaintexts are preserved in the [independent scan artifact](https://github.com/FlareZ123/liber-primus/actions/runs/45105667021/artifacts/14787616282). The [workflow run](https://github.com/FlareZ123/liber-primus/actions/runs/45105667021) completed successfully; its verification step matched the published maxima, best offsets, full729 scores and IoCs exactly.

**Independent authentic solved-LP1 positive:** the C++ implementation plants the original first 729 runes from solved LP1 pp10–13 at offset 330,103 in a deterministic 1,000,000-byte MT19937-64 tape, encrypts and decrypts under each GP28 ordering, then scans all 999,873 probe offsets. Both modes recover 729/729 original runes exactly and rank the planted offset **#1**, with first128 score **+598**, full729 score **+3,327**, and IoC **0.06230874749**. This uses the authentic solved-LP1 plaintext but a synthetic key/tape, so it is a detector positive, not a historical Cicada key claim.

**Familywise max-statistic calibration:** 20 deterministic 32-byte block permutations of the original 560.13 tape preserve its exact byte histogram and within-block structure while disrupting longer contiguous order. Every replicate scans all 118,818,684 offsets under both GP28 modes; the family statistic is the larger of the two maxima. The observed family maximum is **+2**; **15/20** null family maxima are at least +2, giving empirical Monte Carlo p = (1+15)/(20+1) = **0.761905**. The 20 family maxima are [37, 82, 33, 44, −8, 36, 61, 65, 9, −14, 10, 8, −24, 0, 25, 37, 111, 0, 50, 14]. This is a modest-resolution, explicitly conditional block-exchangeability null—not a universal probability for all cipher families—but it shows the real-source maximum is ordinary under a null that accounts for searching the entire offset space and both models.

[Independent C++ source](../sims/cicada2013_56013_rank28_independent.cpp), [ISO/input preparer](../sims/cicada2013_56013_rank28_independent_prepare.py), [result verifier](../sims/cicada2013_56013_rank28_independent_verify.py), and [workflow](../.github/workflows/agent5-2013-56013-rank28-independent.yml) make the run reproducible.

Even the first-pass **global maxima** of the two entire real-source scans (−46 and +2) remain far below the same exact detector's controlled positive (+640). The strongest 729-rune continuations are likewise at near-random IoC **0.036–0.037**, with no coherent unknown original English. A complete full-file search of **both** fixed successor alphabets therefore yields no authentic LP2 plaintext or key offset. This rules out this explicitly defined direct 2013 byte-tape/GP28 mapping for ordinary native-GP English *at all valid starting byte positions* on the first chapter. It does not exclude untested historical key derivations, unreadable plaintext registers or secret state feedback beyond the fixed successor rank.

## Independent creator-authentic solved-LP1 control across all four models

To ensure that the source-language calibration is not merely a Gibran-specific artificial test, a separate [successful authentic-LP1 control run 45102206167](https://github.com/FlareZ123/liber-primus/actions/runs/45102206167) plants **729 unchanged original, already-solved first-release LP1 GP runes** in each model. The exact **755** original unencrypted runes of LP1 physical pp10–13 are isolated directly from the 2014 runic scan transcription; the first 729 are treated as source-authentic plaintext. They do not depend on translating proposed new English. The fixed GP language model remains trained only on **Gibran**, with no LP1 source text included in the training stream. A distinct one-million-byte random source pad uses the frozen original test offset **330,103**.

[Reproducer](../sims/cicada2013_56013_native_lp1_positive_sft.py) reencrypts the exact 729 known original LP1 runes under *each* of the same four algorithms, proves **729/729 exact recovered original plaintext**, and independently searches all **999,873** possible 128-byte windows. Every model ranks the true original-language key offset **#1**, with first128 score **+598**, complete729 score **+3,327**, and source-native GP IoC **0.06230874749**. The absolute highest first128 score of any *real* 2013 tape offset on LP2, across all four complete full-file models, was only **+2**. This large margin is therefore measured against **the actual puzzle author's surviving solved original runes**, with no LP1 training leakage.

The source-to-cipher artificial coupling is intentional and openly known, as in any positive-control encryption; it proves that if a genuine author-native passage with these precise original-key models occurs, the unchanged whole-offset screen can recover it. It does **not** independently establish either model as the historical LP2 encryption or identify an LP2 key.

## Decision and honest limitations

**Retire direct, contiguous `DATA/560.13` byte keys in all four specified models: GP29 additive, GP29 predecessor difference, GP28 circular successor rank and GP28 ordered excluded-predecessor rank, against the 729-rune opening LP2 chapter in ordinary native-GP English.** The paired original runs cover **118,818,684 valid starting positions per model**, with 729-rune true-plaintext positives that rank the true offset first, plus disjoint original continuation checks. This is stronger than earlier partial offset scans.

The original 2013 object is independently real but no known author instruction transfers it as an LP2 key. This negative does **not** exclude a hidden exact offset with a different native language, nonbinary/rank28 transport, original file transformations, skip-aware key pointer, a key independently selected from a different original, a cipher using data files other than `560.13`, or genuinely encrypted nontext payload. None of these possibilities should be promoted by inventing new search parameters merely to rescue this failed direct mode.

The right next action remains an independently source-selected operation and receiver, actual key-file disclosure, or complete authentic unknown-page plaintext recovered on the unchanged GP29 input, verified with a hold-out beyond the key construction.
