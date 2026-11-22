# Original p32 HOME/HOMEX: whole-book English-prefix familywise decision

**Completed Director Issue #798, 14 November 2026. No authenticated unknown plaintext, key or selected compass rule.**

## Decision

The four-rune GP29 string **HOME** is genuinely present exactly once across all 12,956 unknown original LP2 runes, at **physical p32 offset 33**, immediately after a full stop and as the start of the eleven-rune ciphertext word **HOMEXWDSLFD**. The fifth rune is the ordinary **X** of that original word. This original-text fact is stable.

When the clue is scored **after including every comparable English-looking GP prefix after a full stop throughout the 55 unknown rune-bearing pages**, its rank is unremarkable. The full-stop word-start scan contains **six English-lexicon four-rune prefixes**, including HOME, at **174 original post-period word starts**. A 10,000-replicate page-marginal/word-length/punctuation-preserving randomization yielded **at least six** such matches on **708/10,000** trials (plus-one one-sided p = **0.07089291**). More directly, the observed maximum GP-English prefix length at any post-period start is only **4**, whereas the randomized page-preserving full search reached length **4 or more on 9,456/10,000** trials (familywise p = **0.94560544**). HOME is **not a statistically selected original navigation start** under this frozen family and should **not** be used to validate the already-retired five-byte p32 compass route.

## Exact locked source and spelling contract

- Original input: checked-in [LP2 rune transcription](../resources/liber-primus/lp2-transcription.txt) and independently length-verified [indexed corpus](../resources/liber-primus/lp2-corpus.json). Original printed hyphens, periods, and illustrated section marks separate words; physical line wraps are transparent, and physical p50 has no runes.
- Exactly **55** rune-bearing unsolved pages and **12,956** unknown runes, **2,896** authentic rune words, including 32 that continue across original physical page breaks, **175** literal full-stop marks, and **174** printed words following full stops, including at physical page breaks. Both source parsing and full original-rune sequence are validated against the indexed corpus per page.
- Fixed named English dictionary: **cmudict 1.1.3**, documented [PyPI source release](https://pypi.org/project/cmudict/1.1.3/); exactly **117,168** unique uppercase alphabetic entries after the disclosed filter, SHA-256 of the newline-separated sorted normalized-source entry list: **4efb3e4bf99bec3e92ea4f90f724f5ceda819e14ef1e8baf97d297dc4547c79c**. Pronunciation variants and punctuation-containing entries are excluded.
- Greedy two-letter GP symbols **TH, NG, EO, OE, AE, IA, EA**, then single rune; period GP phoneme equivalences are normalized **K/Q→C, V→U, Z→S**. Prefixes are measured in **GP runes**, lengths **3, 4, 5 and 6**. The fixed dictionary produces **4,555**, **21,385**, **46,285**, **56,470** distinct GP-spelled prefix strings at those lengths. This intentionally broad lexicon includes rare names and is a conservative test of selected English-looking prefix status.

## All-book matched inspection

| Fixed GP prefix statistic | Original LP2 | One-sided 10,000-shuffle result |
|---|---:|---:|
| Four-rune English prefixes at all original printed word starts | **68** | ≥68 in 71 shuffles, p=0.00719928 |
| Four-rune English prefixes immediately following an original full stop | **6** | ≥6 in 708 shuffles, p=0.07089291 |
| Maximum English prefix length after a full stop, across 3–6 and every eligible position | **4** | ≥4 in 9,456 shuffles, p=0.94560544 |
| Maximum English prefix length among all original word starts | **6** | ≥6 in 764 shuffles, p=0.07649235 |
| Specifically pre-picked four-rune string HOME after a stop | **1** | ≥1 in 2 shuffles, p=0.00029997 **post-hoc and inadmissible as selector evidence** |

The six post-period four-rune GP prefixes are, in physical-page, rune-offset order:

| Physical page | Original zero-based page-rune offset | Four GP indices | Literal GP rendering |
|---|---:|---|---|
| p15 | 0 | 0,1,20,19 | FULM |
| p19 | 152 | 4,10,0,16 | RIFT |
| p30 | 177 | 23,24,20,13 | DALP |
| p31 | 231 | 2,12,4,18 | THEORE... |
| **p32** | **33** | **8,3,19,18** | **HOME** |
| p40 | 96 | 15,3,15,16 | SOST |

These transliterations are **ciphertext renderings**, with no semantic or decryption claim. The prefix THEO/TH+EO+R+E can be odd under greedy GP digraph parsing; this is why the complete dictionary and spelling rules are disclosed, not an independently selected English phrase.

### Null construction and calibration

For each replicate, independently permute the existing 29-symbol rune multiset **within each original physical page**. Preserve every printed word-start coordinate, printed word length, page boundary and punctuation mark, including whether a start follows a period. This controls page-level rune frequency and the numerous selection opportunities. Random generator: Python Mersenne Twister seed **33013279**; 10,000 draws; exact reproducible p-value formula **(exceedances+1)/10001**.

A predeclared source-native positive plant replaces the first four runes in **twelve** original eligible post-period words with genuine GP HOME, leaving printed boundaries and word lengths fixed. The plant then contains **twelve additional** post-period HOME markers and **18** post-period four-rune lexicon prefixes. **Zero** of 10,000 page-shuffle null draws reached that count; plus-one p=**0.00009999**. This verifies the calibrated scoring detects an enriched native-codebook marker under the same test.

The all-word four-rune lexicon excess (68, p=0.0072) is an **independent exploratory structural observation**. Page-only shuffling changes the strong real LP2 anti-repeat transition pattern and can therefore give a false positive for readable-looking prefixes. This lexical excess does **not** rescue HOME's position-specific marker claim, prove partial plaintext, or justify fitting a new substitution. A future test would require a distinct original-source clue and a transition-matched null before interpreting global lexical excess.

## Reproduction, decisive scope and fork

- [Self-contained original-input Python SFT](../sims/lp2_p32_home_english_prefix_familywise_sft.py), using documented cmudict 1.1.3 and exact repository original corpus; includes source sequence assert and positive plant.
- [Manual-only controlled GH Actions workflow](../.github/workflows/lp2-p32-home-prefix-familywise-manual.yml).
- [Corrected final 10,000-replicate run 43541105568](https://github.com/FlareZ123/liber-primus/actions/runs/43541105568) (supersedes the page-fragment-count run 43540575334), complete JSON evidence and counts.
- The specific exact-string HOME 0.0003 post-hoc number has **no** independent prior selection basis. The correct familywise maximum-over-prefix/position null is 0.9456. The 11×11 reflow, compass stop and unselected table bit packet are not validated by the original word-start occurrence.

**Decision:** retire p32 HOME/HOMEX as an *authenticated* map-start/stop mechanism, pending an **independent authored instruction** selecting that exact byte sequence and a unique original-cipher operation. The original five printed runes remain factual, and no unknown page has been decrypted. Stop dependent HOMEX compass work without such a new independent selector.
