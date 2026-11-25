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

## #2866: relative-key bootstrap without a literal crib

The actual January key-discovery history above leaves the source of the partial numeric shifts unresolved. A separate, executable alternative uses the repeated rubric geometry, rather than supplying WELCOME as a guessed word. This is a retrospective known-artifact control, **not** an assertion about the private algorithm used in January 2014.

If two consecutive length-L native plaintext blocks are equal and consume every phase (no plaintext F), then for an additive period-q key
`C[i+L]−C[i] = K[(i+L) mod q]−K[i mod q] (mod 29)`.
For q=L+1 the L edges form a spanning path; setting K[0]=0 fixes all relative shifts, leaving only 29 global translations. The known WELCOME double rubric has L=7, q=8. Its original prefix [1,28,21,15,12,0,5,4,12,1,6,13,28,28] fixes relative key [0,16,7,16,15,16,22,3]. Every smaller period 1–7 is inconsistent with the repeated-block constraint. The assumption that the two words are equal and the period is eight is retrospective; literal word content is not supplied to the solver.

Train a smoothed native GP29 trigram model (alpha=.1) on the eight other solved source records, excluding the entire WELCOME section. Evaluate all 29 translations on only the first 40 original runes with exact F-hold Viterbi states; disallow F holds in the doubled prefix. Sixteen shifts admit that prefix. Freeze the unique best key and terminal state: shift23, [23,10,1,10,9,10,16,26]. Continue across the remaining original 475 runes without refitting. The continuation is 475/475 exact, with full 515-rune replay. This recovers the known key without a literal WELCOME crib.

### Actual LP2 transfer: p3 internal red rubric

Select only complete same-page red rubrics whose entire printed group-length sequence equals that of the immediately following groups. Join physical line wraps; preserve separators. The canonical transcription agrees with all 57 rune-bearing corpus pages. Among 16 annotated unsolved red spans there is exactly one match: p3 offset119, lengths [3] and [3]. Original scan 20.jpg visibly confirms the large red P-D-TH rubric, 13-dot punctuation and following black EO-D-EO group. The equality of their *plaintext* is a hypothesis; the analogue period q=4 is a research choice, not an organizer instruction.

Freeze the section p3[119:] + p4 + p5 + p6[:71], 693 runes up to the next red rubric. Prefix [13,23,2,12,23,12] contains no F. The relative key is [0,0,19,28]. Fit first40 only: six translations survive; the standalone scorer (including initial unigram and bigram terms) selects shift14 [14,14,4,13]. Its frozen continuation has no legal path. The first exploratory scorer selected shift3; the exact all-key negative is independent of this ranking. Stronger exact certificate: enumerate all 29 translations and every reachable phase under the native plaintext-F hold rule (hold only when C=0; consuming transition only when C differs from the current key value). All 29 die, without any language score or word constraints beyond the assumed initial equality. Zero-based first impossible offsets, indexed by shift 0..28:

`11,17,16,87,21,8,6,13,12,171,27,53,2,0,115,33,30,19,18,41,24,7,10,1,34,26,45,9,29`

Longest survivor shift9 [9,9,28,8] dies at 171 (p4:73), with reachable phases 0 and 1, both K=9 and C=9; a consuming transition would emit forbidden plaintext F, and a hold cannot emit nonzero C. Thus no such continuous four-phase key can decrypt the selected original subsection. This does not exclude other clocks, resets, periods, or non-identical plaintext rubrics. No unknown plaintext/key recovered.

Executable: [relative-key SFT](../sims/lp1_repeated_rubric_relative_key_sft.cjs). The corrected standalone executable was run in connected V8 with all assertions passing on fetched original corpus bytes. Initial Windows run 45717634915 exposed a too-narrow Unicode rune range in the wrapper; corrected at commit 17729b12. No passing Windows run is claimed for this second SFT. 

### Remaining LP1 key-discovery branches

- First KOAN: the original opening [7,26,28,7,22] and five-rune title hypothesis A COAN [24,5,3,24,9] uniquely identify affine (a,b)=(28,2) among all 812 invertible affine maps, independently matching all 99 withheld runes of the 104-rune known native prefix and replaying the 778-rune section. The archival SFT locates Jan29 12:32 L85568 already referring to the solved final instruction and Jan29 22:16 L88289 quoting narrative plaintext. It does **not** locate a pre-success statement selecting +3. The known first KOAN inverse is therefore executable from a semantic title guess, but its actual discovery sequence remains unestablished. [SFT](../sims/lp1_first_koan_key_discovery_sft.cjs), [passing Windows run](https://github.com/FlareZ123/liber-primus/actions/runs/45717271574).
- Second KOAN: the Feb6 contemporary chat records A KOAN DURING A LESSON at 18:37 L106639, CIRCUMFERENCE at L106660, exact FIRFUMFERENFE native key at L106704–711 and F holds later at L106742–755. The subtractive key [0,10,4,0,1,19,0,18,4,18,9,0,18] is not an authenticated separately issued keyword; the title/narrative crib is earlier in the captured sequence. See #2480 and #2494 for the independently bounded donor and crib work.
- SOME WISDOM, LOSS OF DIVINITY and AN INSTRUCTION are clear native GP; no key-discovery prerequisite. The thematic terms present in the clear text alone do not specify a target, spelling or key schedule. Earlier #2422 tested the seven-method transfer, #2506 found no source-selected period-specific tool and #646 tested the visible illustration transfers.
- The p56 AN END prime-stream solve is documented separately in the archive index above. Its actual prime clue and guessed opening are not supplied by an independently identified unknown-page analogue.

**Decision:** a repeated rubric offers a concrete ciphertext-only relative-key recovery primitive, but the unique direct source-layout analogue fails exactly. Do not reopen this same receiver by sweeping arbitrary periods or section boundaries. A different source cue must independently select a new equality, recurrence or key material.

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
