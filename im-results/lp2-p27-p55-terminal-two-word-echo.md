# The exact two-word echo from LP2 p27 to terminal p55

**Agent28, 16 November 2026.** The **source repetition was already known**: [pnotisdev's original Phase58 reused-key analysis](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase58_djubei_reuse.md) and Agent25's 11 November 2026 direct original-JPEG inspection at [`communications/agent28/20261111T0845Z_agent25_dju-bei-image-check.md`](../communications/agent28/20261111T0845Z_agent25_dju-bei-image-check.md) pin these exact p27/p55 occurrences, global offsets 6555 and 12950, and their terminal-page context. The latter confirms neither occurrence is a T6 repair. The **new work documented here** is an exhaustive print-boundary pair census with its conditional finite null and a source-selected p57 circumference removal check, not rediscovery of the string or a decoder. It offers a concrete cross-chapter plaintext/state-reuse target; it **does not** recover unknown plaintext or a cipher key. Keep the likelihood calculation conditional on its declared null. A copied encrypted phrase, a repeated plaintext phrase under coincident state, or an intentional author-side marker remain distinct explanations.

## Original seventh rune at the solved-page boundary: exact source-led handoff decision (Agent6, 17 November 2026)

The independently known six-rune, two-word DJU-BEI duplicate has a **seventh matching rune** in numerical page order: original p27 local 28–34 contains DJU-BEI-AE, whereas p55 local70–75 contains DJU-BEI and **the next physical page's very first ciphertext rune, p56 local0, is also AE** (GP index25). In the entire 13,136-rune serialization of LP2 p0–57, exactly one seven-rune window repeats, at global zero-based offsets **6555** and **12950**. No eight-rune window repeats; within the 12,956 unknown p0–55 runes alone no seven-rune window repeats. These are exhaustive exact index statements, not a p-value. The source is original scans 44.jpg, 72.jpg and 73.jpg, with the canonical original-index corpus. The fact that both echo copies are followed by AE had already been noted in early community records ([Uncovering Cicada ideas](https://uncovering-cicada.fandom.com/wiki/Liber_Primus_Ideas_and_Suggestions)); the formal full-corpus 7/8-window census is recorded here to fix its correct interpretation.

**The source boundary matters.** On p55 the six-rune phrase is followed by a printed period. The next AE belongs to a separate page's red AN END heading whose encryption is independently solved by a prime-totient cipher. Therefore the seven-rune match is only a **pseudo-continuation formed by omitting printed sentence, page and cryptographic boundaries**. It is not a physically uninterrupted seven-rune phrase or proof of a common state/key. The directly printed two-word/6-rune repetition remains the stronger puzzle-visible datum.

One exact **source-selected decoder** can be tested without phase fitting: use the authenticated p56 prime-totient first key φ(2)=1 at the matched AE on p27, with the authentic plaintext-F bypass. The p27 next two original printed words after DJU-BEI have ciphertext GP **[25,0] | [13]** (two runes then one). The only two possible inverses under the fixed p56 phase are **AF | J**, if the ciphertext F bypasses the prime clock, and **AIA | N**, if that F consumes the prime key and represents IA. Both fail GP-native English word grammar at the immediately following one-rune word (J or N, neither A/I/O), and the preceding two-rune units are nonwords. A separately planted native AN | I at the **same** source key phase decodes **3/3**. Hence the attractive direct p56 cipher/key handoff from the pseudo-continuation is concretely excluded within its stated GP-English and boundary-preserving scope, before any new key search.

**Research fork:** retain the printed DJU-BEI echo as a potential navigation cue linking the wing chapter to the terminal moth and AN END. An authored rule choosing an actual new address, semantic operand, or key receiver is still missing. The seventh rune itself does not recover p27/p55 plaintext and must not be conflated with an uninterrupted ciphertext duplicate. Reproducer: [read-only Node22 source SFT](../sims/lp2_p27_p55_p56_seam7_source_gate_sft.cjs).

## What is actually printed

| Source | Place | Original runes | Canonical GP29 positions |
| --- | --- | --- | --- |
| Physical p27, original JPEG `44.jpg` | Second text line, two complete adjacent three-rune words | **`ᛞᛄᚢ-ᛒᛖᛁ`** | p27 local 28–33, manuscript-global 6555–6560 |
| Physical p55, original JPEG `72.jpg` | **Final two words of the final unsolved page**, immediately before its period | **`ᛞᛄᚢ-ᛒᛖᛁ`** | p55 local 70–75, manuscript-global 12950–12955 |

The six identical GP29 runes are ᛞ (23), ᛄ (11), ᚢ (1), ᛒ (17), ᛖ (18), ᛁ (10) using the canonical zero-based alphabet. The printed word division is identical (**3+3**). These are separate original images, at clearly different places in the manuscript; the p27 image shows a wing form, while p55 shows a moth-like insect under a tree. The visual relationship is suggestive but does not independently select a key or plaintext.

The supplied original scan bytes have SHA-256:
- `44.jpg` = `c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e`;
- `72.jpg` = `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`.

The original transcription is `resources/liber-primus/lp2-transcription.txt`, parsed with the complete 29-rune alphabet including ᛡ (U+16E1); rune and global offsets are independently pinned by `resources/liber-primus/lp2-corpus.json`. The numeric-only physical p50 has no rune-text transcription block, so indices after p49 skip that absent block. The two verbatim occurrences are visible in the source JPEGs; their original word separator is a normal printed break, represented by a hyphen in the transcript.

## Finite exhaustive result and its qualified significance

A strict scan of the 55 rune-bearing unknown pages p0–p55 counts **2,584 adjacent word pairs** whose words are separated by exactly one literal transcription hyphen, with **2,583 distinct pairs**. Exactly **one** pair occurs twice, and it is `ᛞᛄᚢ-ᛒᛖᛁ` on p27 and p55. Page-end and line-wrap syntax are kept separate; this count does not claim to resolve all 2,896 authentic whole words.

The same strict tokenization has **789** three-rune word slots and **773** three-rune word types; exactly fourteen types occur twice and one occurs three times. The two constituents `ᛞᛄᚢ` and `ᛒᛖᛁ` each occur **only twice** and are adjacent both times. Of **164** literal-hyphen 3+3 pair slots, 26 unordered pairs of those slots share a word slot.

A strong *conditional* null randomly permutes the exact observed 789 three-rune word tokens across their fixed slots, leaving their 164 allowed adjacent 3+3 edges untouched. There are 13,340 unordered disjoint edge pairs and 26 overlapping pairs. With repeated word-type multiplicities fourteen times 2 and once 3, write `(m)_k` for the falling factorial, `A=Σ(m)_2=34`, `B=Σ((m)_2)^2=92`, and `C=Σ(m)_3=6`. The **exact expected number** of duplicated 3+3 edge pairs under that permutation is

```text
E = 13340 × (A²−B)/(789×788×787×786)
  + 26 × C/(789×788×787)
  = 0.0000372248191869.
```

Because no four-rune-or-longer word type repeats in this transcription, **any** repeated literal-hyphen word pair with total length six or more must be a 3+3 pair. Markov's inequality thus bounds the probability of *any such duplicate* in this specific null by `0.00003723`. A previous 100,000-trial simulation used an incomplete rune range and is superseded by this exact combinatorial calculation.

This is **not** a global post-selection-adjusted p-value for Cicada authorship: many other patterns have been investigated, ciphertext is not established as a random permutation of independent words, visual word boundaries can be meaningful, and an author may reuse ciphertext by design. The conditional null shows why this exact pair is worth a targeted source-to-inverse test; it does not identify what the six ciphertext runes mean.

## New source-linked numerical continuation: the terminal pair addresses solved DEEP (Agent2, 16 November)

The published Gematria Primus prime chart assigns the exact repeated first word `ᛞᛄᚢ` (DJU) **89+37+3 = 129**, and the second `ᛒᛖᛁ` (BEI) **61+67+31 = 159**. Thus the unchanged six original runes have combined prime sum **288** on both p27 and terminal p55. This is a source-exact arithmetic fact, independent of an English crib.

A *previously proposed but unverified* reading of the authentic 2016 signed hint "Its words are the map. Their meaning is the road, and their numbers are the direction" interprets a GP word-sum `S` as the physical LP2 page `S mod 58` and a zero-based word number `floor(S/58)`; the 58-image manuscript supplies the modulus. **288 = 58 × 4 + 56** therefore selects **physical p56, word index4**, whose ciphertext `ᚳᚦᚷᚹ` at offsets12–15 independently decrypts under the solved prime-totient rule to **DEEP**. More precisely, ciphertext indices `[5,2,6,7]` minus the consecutive prime-totient residues `[11,13,17,23]` recover the GP plaintext indices `[23,18,18,13]` (D E E P). The signed 2016 word **MEANING**, when spelled with the original solved-text ING rune, also happens to have GP sum **288**; its independent p56:word4 address had already been documented in [the signed-word map](lp2-2016-signed-message-base58-word-map.md). What is new is **the source-visible duplicated terminal ciphertext also has exactly that sum**. This gives a concrete possible route to the deep-web instruction immediately following p55, but the base58 addressing convention is **not authenticated** by the signed hint.

The correct local controls are discouraging for interpreting this as unique or confirmed: across all **2,584** original literal-hyphen adjacent pairs, **nine** have sum288, including the two repeated copies. Of **164** original complete 3+3 pairs, **three** have sum288: the two copies and an unrelated p46 pair. Under an exact *different* null, uniformly permuting the 29 published GP prime weights among rune identities while holding these six **distinct** ciphertext rune identities fixed, exactly **3,823 of the C(29,6)=475,020** possible six-prime subsets sum to288 (**0.00804808**). This is a **conditional fixed-target probability**, not a discovery-adjusted significance level; p56, its salient words, six-rune windows, other word sums and possible coordinate arithmetic were all available to investigators before choosing this comparison. A wrong-address or alternate-word check does not become independent just because two occurrences share the same six ciphertext runes. The signed message says the words of **Liber Primus** are the map; it never explicitly says that concatenating two printed words, summing prime weights or taking a quotient and remainder is its intended operation.

Printed context supplies a separate **hypothesis**, without plaintext recovery: p27 reads `ᛒᚠ-ᛞᛄᚢ-ᛒᛖᛁ-ᚫᚠ-ᛈ` (lengths **2–3–3–2–1**); p55 ends `ᚳᛉ-ᛞᛄᚢ-ᛒᛖᛁ` (lengths **2–3–3**), immediately before p56's independently decrypted **AN END**. The repeated **3+3** source word lengths provide a hard conditional crib constraint: canonical solved-text GP orthography writes **THE** as the single rune **TH** plus **E** (**2** GP signs), so **THE END** requires **2+3**, and **AN END** also requires **2+3**. Neither phrase can be the exact **3+3** `DJU-BEI` plaintext under ordinary GP-native word-boundary-preserving substitution/additive encoding. For example, **ONE END** (GP `O N E / E N D`, **3+3**) remains length-compatible and is a natural but **wholly unverified semantic guess** at the bookend. Historical source p57 explicitly spells `ᚦᛖ` for **THE**, and original p56's solved word3 has exactly two GP signs, so this is a direct genuine-register control, not an English-character count. A nonstandard T-H-E spelling, a changed boundary scheme or other unproved cipher layer could evade it. None of these semantic alternatives provides **a cryptographic inverse, source-selected key or authentic unknown plaintext**. No original unknown-page rune has thereby been decrypted. Preserve the 288→DEEP address as one bounded clue to be acted on **only when a source-selected word-combination or navigation rule predicts additional untouched ciphertext or a historical address**. The enlarged [original-source SFT](../sims/lp2_p27_p55_terminal_echo_sft.cjs) checks both original phrase copies, the nine and three 288-sum inventories, the exact 3823/475020 label-permutation null and the solved p56 DEEP inverse.

## Original pixel-font comparison at the copied six runes (Agent2, 16 November)

The source's two copies of `DJU-BEI` use the **same visible rune letterforms**. To test whether a reader could recognize a second typographic/allograph alphabet at this exact most unusual repetition, inspect the 2400×3600 original **44.jpg** (p27, line two) and **72.jpg** (p55, line four), with independently pinned original image SHA-256. Crop each of the six glyphs by their ink bounding columns, retain their full approximately 114px source-line height, downsample each cropped glyph to 60×114 with box averaging, and threshold at grayscale intensity 128. Do not infer glyph positions or boundaries from a desired matching score. This is a *visible original-ink shape* check, not a general JPEG steganography analysis.

| Source rune | Matched p27-to-p55 thresholded ink IoU | Nearest cross-site *wrong-letter* IoU |
| --- | ---: | ---: |
| D | **0.951170** | 0.647539 |
| J | **0.887586** | 0.337281 |
| U | **0.956985** | 0.654709 |
| B | **0.917476** | 0.501316 |
| E | **0.988839** | 0.661126 |
| I | **1.000000** | 0.489474 |

Each of the six source p27 glyphs matches the **same** source p55 rune more closely than any of the other five letters; the lowest true-identity IoU is 0.8876, while the largest wrong-identity overlap is 0.6612. All copies have the usual source rune shapes. There is **no visible variant letterform that selects a key or a second text**, under this exact six-glyph grayscale test. Small JPEG residuals, subthreshold interior marks, cryptographic pixel payloads, and the distinct artwork outside these glyphs are outside its scope. The repeated text is still a useful possible *navigation* anchor, but its own visible typography gives no next operation. [Read-only original-JPEG SFT](../sims/lp2_p27_p55_echo_glyph_ink_sft.py); full 44.jpg/72.jpg SHA-256 checking, original-ink positive and all 30 wrong-glyph comparisons were executed against the zipped 2014 original JPEG bytes before commit.

## Source-selected circumference cue: finite cross-page negative

The authenticated solved p57 parable says to **“shed our own circumferences”** and describes emergence from the **instar**. Its insect-molting theme makes it a plausible source-local operation to test against the detached wing on p27 and the moth-like insect on p55. Removing the **first and last rune of each printed word**, with line-wraps joined and actual word separators preserved, leaves **131 interior runes** on p27 (52 words) and **43 interior runes** on p55 (17 words). Their **longest common contiguous interior substring is at most two runes**; there are no exact three-rune interior repeats across those two page streams. The terminal six-rune echo itself reduces to the two single-rune word interiors `ᛄᛖ`. This finite source-cued operation provides **no additional ≥3-rune cross-page anchor** and produces no plaintext; other independently motivated operations remain open.

Existing key-reuse work had already tested **1,439 candidate numerical keystreams** and **686 offset/sign decodes** without an original-language hit: [Phase58 source and negative results](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase58_djubei_reuse.md). Future work must choose a different independently evidenced key or operation; rerunning those library scans is low-value.

## Independent half-book fold decision (Agent8, 16 November 2026)

Because p27 is the final physical page of the first 28-page half of LP2 p0–55, and p55 is the final page of the second half, an art-led speculation is that a solver should pair pages **p with p+28**. The original scans were reviewed as source constraints: p27 `44.jpg` actually depicts a **single insect wing**, while terminal p55 `72.jpg` displays a **bilaterally spread winged insect** plus a pale tree and decorative margin. The independently known solved p57 parable involves an instar/circumference. These facts can motivate considering metamorphosis, completion or bilateral reflection, but no authenticated instruction identifies a cipher, numeric key, wing orientation, mirror alphabet or reset clock. The images do not assert that two equal ciphertext phrases have equal plaintext.

A finite separate test asks whether the *entire* 28-page physical fold has more literal ciphertext in common than independently randomized page pairings, rather than scoring only the six-rune pair that motivated the hypothesis. On the exact `lp2-corpus.json` GP29 indices, count every shared contiguous k-gram occurrence between p0↔28, p1↔29, ..., p27↔55 for k=2,3,4,5,6. Compare each fixed total against **30,000** seed-13271337 Fisher–Yates random bijections between those two physical 28-page halves, preserving within-page sequences, page sizes, p50's zero runes and all authorial punctuation-free rune positions. These nulls are conditional page-pairing controls, not a global post-selection correction.

| k | Fixed paired matches | In p27↔55 | Other fixed matches | Random-pairing mean (30,000) | Add-one upper-tail p |
| --: | --: | --: | --: | --: | --: |
| 2 | 1,754 | 23 | 1,731 | 1,808.68 | 0.87660 |
| 3 | 66 | 4 | 62 | 61.95 | 0.32259 |
| 4 | 4 | 3 | 1 | 2.07 | 0.15566 |
| 5 | 2 | 2 | 0 | 0.109 | 0.03640 |
| 6 | 1 | 1 | 0 | 0.0364 | 0.03640 |

The only 4-rune match **outside** the anchor p27↔55 occurs at p9 offset99 ↔ p37 offset161 (`27,17,19,21`). Every 5- and 6-rune match in the chosen 28-page fold comes from the **one preselected terminal DJU-BEI** pair. Accordingly, the two nominal k5/k6 p-values merely remeasure a known match being assigned its one correct partner among 28. At the untouched k3 scale there is no unusual alignment. This specifically **retires the broader fixed 28-page ciphertext-correspondence premise** as an independent key-schedule signal; it cannot exclude a particular authored two-site marker, variable-state cipher or nonliteral page relation. The preexisting visual association remains interpretive rather than a plaintext recovery.

**Reproducer:** [`sims/lp2_p27_p55_halffold_sft.cjs`](../sims/lp2_p27_p55_halffold_sft.cjs), Node.js 22 CommonJS, original source JSON, exact seeded permutations. There is no new unknown-runic plaintext, source-selected key or valid >=150-rune original inverse. Further dependent fold-cipher sweeps are unwarranted unless a separate original clue fixes an operation and predicts untouched ciphertext.

## Corrected 3^8-prefix / suffix additive-pad gate (16 November 2026)

The exact duplicated DJU-BEI sequence appears at original global offsets 6555–6560 and 12950–12955. The first occurrence ends at **6,561 = 3^8** runes, inside physical p27 after its local rune33. The source-selected *rune cut* therefore divides the 12,956-rune unknown corpus into a **6,561-rune prefix** and a **6,395-rune suffix**. This is **not** the physical 28-page division: original p0–27 contain **6,761** runes, and p28–55 contain **6,195**. Physical p27 has 200 further runes after the first echo. The independent first 729-rune chapter length is 3^6, a numerical observation without an independently authenticated key instruction.

For the *rune cut* only, the end-aligned candidate key is prefix offsets166–6560 (length 6,395), and the start-aligned control uses prefix offsets0–6394. The original 6,395-rune suffix and both literal GP29 additive signs were tested without key selection against Shakespeare-native language scores:

| Alignment | Decoding sign | GP29 IoC | Unigram nats/rune | Bigram nats/rune |
| --- | --- | ---: | ---: | ---: |
| End | Cipher − key | 0.0345255 | −4.26684 | −4.83184 |
| End | Key − cipher | 0.0345255 | −4.26359 | −4.82880 |
| Start | Cipher − key | 0.0344956 | −4.27903 | −4.85053 |
| Start | Key − cipher | 0.0344956 | −4.26766 | −4.84004 |

All four direct outputs remain uniform-like. Same-length Shakespeare GP29 windows previously gave IoC first percentile 0.05740 and median 0.06152, with median bigram score −2.61831; an independent direct-additive positive plant round-tripped with English-like scores. Ordinary end-aligned subtraction necessarily yields six terminal zero-delta positions because the 6-rune pair was copied, yet no further plaintext appears. This is a finite negative for a **direct additive pad using this intra-page 3^8 cut**, without excluding other stateful consumers of the visible echo.

**Important cipher-law correction.** The original script's purported “p56-style F-transparent” mode was misimplemented. It encoded plaintext F as **ciphertext equal to the current key symbol** while leaving the pointer stationary, and its decoder interpreted **C=K** as plaintext F. Authentic Cicada LP1/p56 transparency instead emits **C=F (GP29 zero)** without consuming key; ciphertext F may alternatively encode a non-F plaintext. The earlier 0.0344747 IoC, 208 “F” outputs and synthetic round-trip describe a *zero-delta skip toy*, **not an authentic-p56 F-transparent test**, and must not be cited as excluding that authentic mechanism. The old script now labels its toy branch explicitly as nonhistorical.

**Exact authentic-F inverse on unchanged source.** A separate skip-aware dynamic program admits every original ciphertext-F either as transparent plaintext F (pointer unchanged) or as an encrypted non-F rune (pointer advanced), with both additive directions. For the 3^8 rune cut and end-aligned key, **all legal paths vanish at suffix rune offset 5 (zero-based)** under both signs; with the start-aligned key, both signs fail at suffix offset **69**. The authentic solved p56 cipher has a complete 85-rune legal path under its own original prime key, and a synthetic 97-rune planted p57-clear-text positive with five literal Fs passes under the tested prefix-derived key. The genuine-F negative is thus an exact source-input exclusion for this fixed key/clock, **stronger than a language score** and independent of any crib.

**Decision:** Retire this precise 3^8-cut direct GP29 additive consumer and its true-F-bypass extension. The coincident 3^8 end-of-first-echo position remains an unconfirmed structural clue. These tests do not justify reclassifying the first half of the book, generalizing to unknown keys, or declaring any original plaintext. [Direct-language SFT](../sims/lp2_p27_p55_end_aligned_halfpad_gate.cjs) · [Exact native-F SFT](../sims/lp2_p27_p55_authentic_f_bypass_sft.cjs).

## A discriminating route to plaintext

A simple globally deterministic word-substitution cipher is a weak explanation: none of the manuscript's 789 source three-rune tokens occurs more than **three** times, whereas ordinary natural-language function words recur frequently. A **fixed global period-five additive key** is also incompatible with the manuscript's nearly flat five residue-class rune distributions (GP IoCs about 0.0344–0.0347, close to 1/29); the mere difference of 6,395 original rune positions being divisible by five is insufficient evidence for a key.

The viable next step is to look for an **independently selected author-era operation or reset** that predicts why precisely these two original positions receive the same six-rune output. Freeze the rule on p27, then test **all six untouched original p55 runes** and more than one separate word/line, including a wrong-boundary control. Under a candidate reversible cipher, determine whether identical ciphertext here implies identical plaintext or an explicit state marker; demand coherent additional unknown-page plaintext and forward re-encryption before promoting either. Contextual guesses such as *THE END* or *THE KEY* are **unverified cribs**, not recovered plaintext, and do not determine the key.

The reproducible, read-only Node.js 22 CommonJS [single-file test](../sims/lp2_p27_p55_terminal_echo_sft.cjs) reconstructs the two original occurrences, all literal-hyphen pair counts, and the exact finite null expectation from the canonical corpus. Nothing has been altered in the reference manuscript.
