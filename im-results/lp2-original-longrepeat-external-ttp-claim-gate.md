# Original LP2 rune stream falsifies reported long ciphertext reuse

**Scope and prior-art correction (17 November 2026):** The external Wulfic project **already publicly withdrew the old duplicate-ciphertext claim by its 2026-09-29 canonical-data rebuild**. Its live 2026-11-14 [MASTER_TRACKER §4.3](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md) explicitly states the older \`page_27\` was the first page of a section redundantly copied into old \`page_44\`, and marks both the 234-rune prefix and six long two-time-pad overlaps invalid. This record is a **local independent source-input regression**, not a novel correction to an active Wulfic claim or a cryptanalytic breakthrough.\n\n**Decision (17 November 2026):** The unchanged canonical original ciphertext has **12,956** GP29 runes over physical pages p0–p55, with **no repeated consecutive seven-rune sequence anywhere**. The longest identical contiguous passage is **six runes**, appearing at global unknown-runic offsets **6555** and **12950**. Therefore the proposed 234-rune p27/p44 copied ciphertext and any claimed 1,312-rune exact repeated ciphertext blocks are incompatible with the source corpus used by this project. This decisively blocks direct two-time-pad or exact-keystream-reuse attacks whose necessary premise is such an identical original ciphertext passage. It does not exclude *key* reuse on distinct ciphertexts, near matches, variant preprocessing, or other source-defined ciphers.

## Independent source inputs

1. Original LP2 physical-source transcriptions in [`resources/liber-primus/lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json), already independently image-audited and summarized in [`results/README.md`](../results/README.md).
2. An **obsolete April 2026 version** of the [external Wulfic/Cicada3301-Liber_Primus MASTER_TRACKER](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md) reported a 234-rune p27/p44 exact prefix repeat and 1,312/1,468-rune longer matches. The **current live version retracts those exact claims as consequences of old duplicate page-file placement**. The April claims surfaced in a stale public web index and prompted this local regression.

The canonical physical **p27** contains **234 runes** and starts at GP indices `19,13,26,20,15,3,24,25,8,20,18,12`. Physical **p44** contains **273 runes** and starts `28,1,6,2,26,2,9,22,26,3,18,8`. Their first runes already differ (index19 versus index28). The original p27/p44 matching-prefix length is **zero**. This is a deterministic source assertion, independent of guessed plaintext, English reference frequencies, any cipher key or a statistical p-value.

## Full-corpus falsification

Read the 58 corpus page objects, concatenate `indices` for `page <= 55` in physical page order, and index all contiguous source substrings with an exact tuple/byte-string key. With 12,956 original indices:

| Exact pattern length | Repeated source substrings |
| --- | --- |
| 6 | One: global rune offsets **6555** and **12950**, vector `[23,11,1,17,18,10]` |
| 7 | **Zero** |
| 8 or more | **Zero**, since every longer repeat would imply a seven-rune repeat |

Original punctuation and printed words are not removed by a cipher transform; this test concatenates the unchanged canonical runes only, preserving their order and original physical page sequence. An alternative concatenation ordering might create new matches across joins, but cannot establish the alleged literal p27/p44 equality because their intact source runes differ at the outset. The 6-rune cross-book echo has already motivated scoped work on p27/p55; its occurrence is **not** a 234-rune copied ciphertext.

**Runnable exact-source regression:** [`sims/lp2_original_longrepeat_source_gate_sft.cjs`](../sims/lp2_original_longrepeat_source_gate_sft.cjs), CommonJS / Node22; consumes only the source corpus and asserts all numerical claims above. The algorithm does no probabilistic language scoring and chooses no key or parameter from a proposed plaintext.

## Interpretation and action

The long-repetition claim cannot be transferred from the external tracker into original LP2 as evidence. A proponent must produce independently attributable original source bytes, an explicit page/index map, and a reversible normalization explaining the discrepancy before its two-time-pad decryptions are considered. The origin of the historical mismatch is **known from the author's own corrected source record**: prior to its September 2026 rebuild, section text was duplicated across historical page files. See the live MASTER_TRACKER correction. No new source-selected cipher is implied. Existing shorter genuine source echoes remain valid and independent.

**Result category:** independent local regression of a historical, **already retracted** external dataset error; the project already knew the single six-rune echo. **Cryptanalytic status:** no new unknown-page plaintext, creator key, full inverse or destination recovered.
