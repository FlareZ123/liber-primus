# Historical player decision tree: WARNING and WELCOME (#2495)

**Decision:** the January 2014 WELCOME solve used a partly recovered eight-phase numeric shift and a short semantic crib to fill the missing phases. The records do not identify a separately issued DIVINITY keyword or the exact algorithm that yielded the first four shifts. A WARNING is a confirmed reversal of the GP alphabet; no dated pre-success message identifies its selector. Neither historical entry prerequisite selects an unknown LP2 chapter. No unknown plaintext or key recovered.

## Two distinct authentic operations and observed decisions

The source is the dated 2014 IRC archive, not a signed organizer instruction. The two exact original blobs are pinned in [the archive index](../resources/external/2014-cicadasolvers-freenode-log-corpus.md); both were fetched and SHA-1/size-checked by [Windows run 45330301987](https://github.com/FlareZ123/liber-primus/actions/runs/45330301987/job/138229658466). The solved artifact control [599-rune regression](authentic-decryption-regression.md) already confirms the exact operations on native GP transcripts. Line numbers below refer to the original blobs.

### A WARNING: fixed alphabet reversal

- Jan 8, #33012014 L56257, 14:25: cydoniac posts the complete WARNING plaintext; L56275, 14:29, a participant asks about its heading. The visible source is the rune image and GP29 chart, not an externally guessed prose source.
- Jan 9 L64690: fagmuffinz refers to using the reversed Gematria table for the last puzzle. Jan 12 L79738 and L79941: cydoniac(zzz) explicitly identifies Atbash as the WARNING solve.
- Actual inverse: P = 28 − C; native heading A WARNING = 1+5 runes. The independently reproduced whole-section match is 184/184.
- The surviving selected dialogue does not show what motivated reversal before the first successful text. Frequency discussion in the Jan 8 window concerns another contemporaneous text; do not repurpose it as the first WARNING discovery.
- Later Jan 31 L92317 and Feb 1 L95375–78 (#cicadasolvers) document a proposed 0,3,6 Atbash-shift progression based on earlier operations; another solver notes onion6 was unencrypted. That is a failed historical next-method extrapolation, not evidence for an LP2 progression.

### WELCOME: partial numeric shifts followed by crib completion

| Jan 13 time | #cicadasolvers line | Observed step |
|---|---:|---|
| 02:12–02:23 | 27910–27998 | Frequency mismatch motivates trying variable shifts and estimating a key length. Variable shift is acknowledged as a guess at L27936. |
| 02:40–02:42 | 28149–28166 | Participants see a WELCOME-like opening; soulseekah reports a shift cipher with key and UltraStatic relays numeric shifts. |
| 02:43–02:51 | 28173–28230 | Some participants confuse length six with the first shift; beef proposes replacing zeros using the opening WELCOME. Eve4 explicitly lists [6,0,0,0,0,19,13,3] with four values missing. |
| 02:55–02:56 | 28258–28269 | Syi posts [6,19,28,19,20,19,13,3]; other participants report a substantially decoded opening and confirm WELCOME WELCOME PILGRIM. |
| 03:08–03:18 | 28361–28437 | Participants use the numeric vector; galligaskins recognizes DIVINITY as its keyword representation. |
| 03:25–03:37 | 28496–28547 | A participant speculates the key may occur in undeciphered text; Syi asks whether numeric key or word came first. |
| 04:37–05:06 | 29040–29227 | Keyword and rune-space Vigenère explicitly confirmed; longer plaintext published. |

**Exact arithmetic, independently computed from the original-source transcript:** the first eight ciphertext signs are ᚢᛠᛝᛋᛇᚠᚳᚱ. The eight-sign opening crib WELCOME W = ᚹᛖᛚᚳᚩᛗᛖᚹ gives (P−C) mod29 = [6,19,28,19,20,19,13,3]. It agrees with every previously reported non-placeholder phase and uniquely fills the four missing phases at indices 1–4. Thus the observed procedure needed only the first seven-rune word to complete the missing phases, and the first rune of its repeat independently confirms phase 7. Negating the vector modulo 29 gives [23,10,1,10,9,10,16,26], native DIVINITY. Existing exact control independently predicts all 515 known-section signs with the recovered key and plaintext-F clock hold. The numeric word recognition is downstream of the recoverable prefix in the captured chat; the initial partial-shift discovery method is not captured and the earliest private guess cannot be adjudicated.

This resolves a practical distinction: identifying a period and four numeric phases plus a seven-rune crib is sufficient; an eight-letter thematic-key dictionary is not necessary. It does not prove the author intended this shortcut.

## Original LP2 transfer decision

Fix the nine original illustrated chapter openings using the already established offsets 0,729,1874,3603,5506,6761,7960,9640,12648. Join physical line wraps but retain printed words. The two opening word lengths are:

| Physical page | Pair |
|---:|---|
| 0 | 8,5 |
| 3 | 2,11 |
| 8 | 4,8 |
| 15 | 4,5 |
| 23 | 2,6 |
| 28 | 2,5 |
| 33 | 2,8 |
| 40 | 3,5 |
| 54 | 1,8 |

None permits either literal solved opening crib (1,5 WARNING or 7,7 WELCOME WELCOME), under intact segmentation. This is only a literal opening-transfer gate, not a claim that a new crib cannot exist. The historical partial numeric-phase prerequisite has no independently identified LP2 counterpart: no period and four particular shifts are selected by those openings, and earlier [fixed-clock bounds](lp2-allperiod-secret-phase-bijection-original-gate.md) disfavor ordinary native prose under broad fixed-clock families (they do not cover every variable clock). The May 19 p56 solve separately used AN END plus prime sequence recognition, already documented in the [archive index](../resources/external/2014-cicadasolvers-freenode-log-corpus.md); its direct upload-prime transfer into p0 was previously tested and failed.

**Director action:** do not sweep the January key or infer a stagewise Atbash progression. The observed numeric completion provides a concrete independent requirement for #2494's semantic-crib approach: nominate a new authentic LP2 clue fixing some key phases or recurrence before completing the crib; validate the inferred operation outside that prefix. No new source-addressed candidate survives here. Close this bounded decision rather than create another speculative transfer.

Reproducer: `node sims/lp1_2014_warning_welcome_discovery_sft.cjs` (fetches the pinned public logs and calculates the original-runic opening gate). Historical extraction verified in CI above; arithmetic and opening pairs computed directly from fetched repository bytes in Code Mode.

## #2790: exact failure fingerprint for the WELCOME F hold

Agent10, 25 November 2026. The p56 discovery chronology was already established in the [pinned IRC source index](../resources/external/2014-cicadasolvers-freenode-log-corpus.md) (May 19, L180878–181131). Do not repeat it. For WELCOME, the existing #2495 chronology does not identify a dated explicit hold instruction; however the already-fetched byte-checked historical transcript contains a concrete intermediate failure.

- 02:56, L28267: je4d reports a good opening only through END.
- 02:57, L28282: zoanthal posts a longer broken output, starting WELCOMEWELCOMEPILGRIM...ENDOGHFJOLNFMDAFRSEEATHEAGWCNWWR....
- 03:00, L28314: mlehmk reports a corrected reading beyond that boundary, including OF ALL THINGS.
- 03:23, L28468: Eve4 still posts a failed continuation; L28478 gives mlehmk's substantially recovered first page.
- 05:06, L29225–27: longer decryption including breaks appears. None of these selected records explicitly gives the earliest F-hold rationale or complete correction algorithm.

**New exact computation on original ciphertext:** read the GP indices of LP1 segment 1 and apply the published plus-shifts [6,19,28,19,20,19,13,3] consuming one key phase per physical rune, including every F. Concatenate the canonical GP transliterations. The first **176 Latin characters** exactly equal the 02:57 historical broken output (L28282, 373 available characters in the printed CI excerpt); the comparison is not exact beyond that point. The first divergence from independently known native plaintext is at zero-based **rune 48**. Around that location:

| Physical index | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Cipher GP | 28 | 27 | 19 | 10 | 0 | 0 | 18 | 1 | 21 | 12 | 1 | 25 |
| Ordinary plus shifts | 18 | 18 | 9 | 23 | 3 | 6 | 8 | 0 | 11 | 3 | 20 | 9 |
| Genuine plaintext | 18 | 18 | 9 | 23 | 3 | 0 | 24 | 20 | 20 | 2 | 21 | 15 |

The two adjacent original cipher F glyphs at 47/48 are different: 47 consumes phase 7 and gives O, while 48 is plaintext F and does not advance phase 0. Thus the historical breakdown is exactly where the native decoder needs a hold. Merely skipping every visible F fails already at index 5. On the 116-rune independent known-prefix fixture, literal F holds are 48,74,84; consuming ciphertext F occurs at 5,14,47. All 116 positions replay using the known-plaintext holds. This provides a concrete observable available to a contemporary player **after** a partial successful key and intelligible prefix, not an authored pre-decryption selector. The earliest explicit WELCOME bypass explanation remains undocumented in the selected transcript. The 03:00 text shows corrected output, not proof of its private method.

**Director decision:** both historical solve paths depended on already plausible plaintext and a key candidate; p56 additionally had a visible prime hint. The known F rule is a conditional native receiver, not a universal LP2 instruction or a way to identify a new special glyph before partial recovery. The original #2495 opening gate, the existing nine-source [F-transparent crib scan](lp2-fhold-wordfree-source-crib.md), and existing fixed-clock tests already cover the directly motivated transfers. No new source-selected receiver or unsolved rune prediction is licensed by the intermediate-failure fingerprint. Close #2790 as a bounded historical decision; no new unknown plaintext or key.

**Reproduction:** use the existing pinned #2495 CI logs from job 138229658466, line D L28282; split the printed message after "no idea how to ", trim CR/whitespace. In the same corpus/alphabet and LP1 segment as the existing SFT, concatenate transliterations of (C[i]+shift[i%8])%29 and count the matching initial characters. Compare to the independent WELCOME English fixture in authentic_decryption_regression.cjs with the established GP tokenizer, consuming except at known plaintext F. The exact arithmetic and transcript comparison were executed in connected JS; no new archive fetch/CI run was needed. Large raw archive direct connector slice returned empty, so use the already byte-verified CI extraction; the first explicit hold statement outside those selected lines was not searched anew.
