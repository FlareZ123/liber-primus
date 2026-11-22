# Preceding original JPEG SHA256 as a page key for a reversible GP28 antirepeat cipher

**Original-input decision (16 November 2026, Agent21): bounded negative.** Twelve source-image-derived AES256-CTR key consumers were inverted on all **12,901 within-page transitions of the 12,956 original unknown LP2 runes**. Every consumer supports exact original-ciphertext round trips and a known-GP29 positive. All twelve authentic-source outputs remain near the random 29-symbol collision rate, without prose, authenticated key or destination. The tested operation is a conjecture, not a first-party instruction.

## Human-visible starting premise

The original 2014 second-release manuscript was a sequence of JPEG images. The complete preserved archive here places LP1's final scan at **16.jpg**, immediately before the first encrypted LP2 image **17.jpg**. Each following physical page has an accessible earlier image. The runeless numeric page p50, at original scan 67.jpg, naturally precedes the next rune page p51, scan 68.jpg. A 2014 technical solver could compute a previous-image hash without the paradox of hashing an image containing the ciphertext that depends on that same hash.

The hypothesis is exactly SHA256 of the previous original scan's **raw JPEG bytes**. For physical LP2 page p, hash original scan (16+p).jpg, then use its resulting 32-byte digest on encrypted page p in image (17+p).jpg. For the opening page, SHA256 of original 16.jpg is

    984668c680c6089b91587ef6d9eb2a1df1d2b7ee8ab3837655d3933f2adcbfbe

The strongest unsupported premise is that the author intended JPEG-file hashing, AES256CTR and this predecessor association. There is no original signed or printed instruction establishing those choices. This test is distinct from the published direct JPEG DCT-parity pad and original raw JPEG byte-pad experiments.

## Exact reversible operation

For each of the 55 rune-bearing unknown physical pages, initialize AES-256-CTR with its preceding image's SHA256 digest as key and an all-zero 16-byte counter. Decode its keystream bytes into GP28 key symbols using one of three fixed conventional projections: (1) byte mod28; (2) floor(byte times 28 divided by 256); (3) discard raw bytes 224–255, reduce the retained values mod28. Advance the key on **every** ciphertext transition, including repeats. There are no fitted offsets, IVs or private seeds.

For ciphertext runes C(i−1), C(i) in GP indices 0–28, infer literal plaintext **EA** (index28) precisely when the two ciphertext symbols match. On nonrepeats, compute either the cyclic rank R=(C(i)−C(i−1)−1) mod29 or the sorted rank R=C(i)−[C(i)>C(i−1)]. Both ranks are in 0–27. Then decode P(i)=(R−s·key(i)) mod28, for one of the two fixed signs s=+1,−1.

The forward cipher is exact: plaintext EA emits a repeated previous ciphertext rune; any other plaintext GP index emits the corresponding nonprevious rune according to its cyclic or sorted rank after adding the known key. The starting glyph of each source page is an IV. Its plaintext value remains unclaimed. Across 2 rank schemes × 3 byte reductions × 2 signs, all **12 complete reversible candidate models** are tested.

The SFT proves every one of the original 55 page ciphertexts exactly reencodes from its recovered symbols with unchanged runes, and checks independent synthetic encrypt→decrypt→encrypt plants against the **actual solved 95-rune p57**. This recovers all 94 post-initial known GP symbols for each model. Since genuine solved p57 has no EA runes, a second independent p57 plant changes three selected letters to EA and verifies that **all three new literal ciphertext repeats** are generated, recovered and re-encoded. The original 86 repeated pairs likewise survive every forward and inverse exactly. A positive control demonstrates implementation correctness only; it cannot authenticate the original hypothesized key or cipher.

## Executed original result

| Statistic | Exact value |
| --- | ---: |
| Original unknown LP2 ciphertext | 12,956 runes |
| Within-page GP transitions | 12,901 |
| Literal original adjacent repeats | 86 |
| Raw unknown GP29 IoC | 0.03447839786450569 |
| **Best of twelve original inverses** (sorted ranks, unbiased discard ≥224, sign +) | **0.035332024619208056** |
| Lowest of twelve original inverses | 0.035253585894729635 |
| Known cleartext p57 GP29 IoC | 0.06270996640537514 |
| Independently positive-tested complete source models | 12/12 |

The strongest candidate's first decrypted p0 symbols are **L NG W EO S A D L NG X M TH I P P F W…** in literal GP transliteration, without readable prose. All original candidate full-book outputs have near-flat GP29 unigram distributions, including the p55 terminal region. None recovers an independently recognizable sentence or genuine LP2 plaintext. The exact inferred 86 EA symbols are produced by the rank28 sentinel rule itself; they are not independent evidence in favor of the cipher.

**Decision:** retire these twelve specific preceding-file JPEG SHA256 → AES256CTR → page-local GP28 predecessor-exclusion native-GP inverses. The result does not exclude a different original source-selected file transform, a nonzero IV, an authenticated passphrase, byte-based intermediate plaintext, or a different cipher state. Such changes require additional author evidence rather than fitting the failed models against unknown text. The manuscript remains unsolved.

**Reproduction:** [complete read-only Node22 CommonJS SFT](../sims/lp2_previous_jpeg_sha_aes_rank28_sft.cjs), [manual Windows CI workflow](../.github/workflows/agent21-previous-jpeg-sha-aes-rank28.yml), and [second original-source CI run](https://github.com/FlareZ123/liber-primus/actions/runs/43778149794). The [first original CI run](https://github.com/FlareZ123/liber-primus/actions/runs/43777979867) validated all original inverses before the added EA sentinel synthetic positive.
