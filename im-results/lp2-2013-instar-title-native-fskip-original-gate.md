# Original 2013 Instar title as a native-F LP2 manuscript key

**17 November 2026, Agent7.** A small, independently historical and artwork-linked key hypothesis fails as a complete direct decoder. **No authentic unknown LP2 plaintext or creator-selected key recovered.**

## Why this original-input test is distinct

The original Cicada 2013 `761.MP3` audio carries the title **The Instar Emergence**. Original LP2 physical p14 and p23 depict mayflies, and p55 closes beside an insect/tree illustration. The phrase is thus a concrete, finite historical key candidate a 2014 player could obtain, without fitting any unknown ciphertext. Agent11 had already used precisely this title as an *OutGuess image password* on p14/p23 ([separate, completed gate](lp2-mayfly-2013-title-original-outguess.md)); the present test instead uses the **authentic solved-LP2 p56 cipher law** on the original rune messages, including its plaintext-F-transparent nonconsuming rule. The original material does not expressly tell solvers to reuse this title as an LP2 text key, so the key-selection premise remains hypothetical.

**Inputs:** complete original GP29 transcripts from `resources/liber-primus/lp2-corpus.json` for p14 (137 runes), p23 (213 runes), p55 (76 runes) and clear p57 (95 runes); unchanged title, uppercased without spaces. Historical GP29 digraph tokenization makes a **17-rune key** (`TH` one glyph); literal Roman letter-by-letter tokenization makes an **18-rune key** (`T`, `H` distinct). Both are source-readable interpretations. For each key test both addition and subtraction with phase zero at physical-page start, repeating the source phrase cyclically. No secret starting phase, cipher-text fitting, null, re-segmentation or extra key expansion is added.

At key index `j`, ciphertext `C=0` permits the plaintext-F transparent branch `P=0`, consuming no key symbol. Every other branch computes `P=(C±K[j]) mod29`, advances `j`, and disallows `P=0`. An exact dynamic enumeration covers every legal F branch.

## Twelve unmodified page inversions

Numbers report the **first zero-based original rune offset at which all legally decodable paths disappear**. A dash means the entire original page is legally decodable under the declared arithmetic rule.

| Title tokenization | GP operation | p14 / 137 | p23 / 213 | p55 / 76 |
| --- | --- | ---: | ---: | ---: |
| 17 GP glyphs | subtract key | 34 | 86 | 56 |
| 17 GP glyphs | add key | 1 | 25 | 2 |
| 18 literal Roman letters | subtract key | 0 | 41 | 3 |
| 18 literal Roman letters | add key | 8 | 5 | **whole page: 1 path** |

The **sole** complete case is 18 literal Roman key glyphs, addition, on 76-rune p55. Its inverse produces GP29 IoC **0.0389473684** (the untouched p55 source is **0.0378947368**), no grammatical original rune text, and first 36 GP labels:

`H R H L T U R N D R TH A IA H X N O P R P M B P O S A E EA N M N M Y U AE U`.

All other source-image targets are **mechanically impossible**, independent of English word frequencies, because a consuming branch landing on plaintext F violates the authentic rule, and the original ciphertext has no transparent F option at that position. The surviving p55 case reencrypts all **76/76** original runes exactly, but roundtrip and path existence alone are insufficient to call its noise-like output a plaintext.

**Controls:** for each of the four title-key/sign choices, encrypt the entire original *clear* p57 95-rune GP29 text while honoring the genuine plaintext-F bypass, then recover its exact **95/95** rune sequence among every allowed inverse branch. This tests the actual DP law and correct handling of ambiguous cipher-F. The full original tests and four planted native positives are asserted by [single-file CommonJS SFT](../sims/lp2_2013_instar_title_native_fskip_sft.cjs), successfully executed on the repository's [manual Node22 Windows runner 44126946942](https://github.com/FlareZ123/liber-primus/actions/runs/44126946942) (run completed successfully on 17 November 2026).

## Decision

The historical title **does not directly decrypt** the mayfly-artwork pages p14, p23, or p55 via the solved-p56 transparent-F Vigenère operation with the original phrase at phase zero. It remains a possible thematic clue, and a new authorial instruction could supply a different cipher operation or key derivation. Retire this **exact** finite title-to-native-F transfer; do not broaden its key shifts or historical keyword variants without new independent source evidence.