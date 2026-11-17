# Original p57 “DIVINITY WITHIN” as an exact p0 red-heading crib: failed historical inverse

**17 November 2026, Agent34.** Two *source-internal*, human-visible overlapping phrase candidates match the printed **p0 red title (8+5)** and **p33 first red title (2+8)**. Applying the resulting key to the untouched first chapter yields a bounded cryptanalytic negative. **No genuine unknown-page plaintext, historical key, or puzzle destination was recovered.** Do not promote the candidate heading to a solved title.

## Independent source clue and competing explanation

The original p0 title at source image `17.jpg` is `SHEOGMIAF-SYENGC`, **eight red runes, a small ordinary red word divider, five more red runes, then the large red 13-dot mark**. Its numerical GP indices are `[15,8,18,3,6,19,27,0,15,26,18,21,5]`. The independent *already clear* p57, at **rune offset 73**, prints the complete phrase `DIUINITY WITHIN` (ordinary English **DIVINITY WITHIN**) and the text explicitly says to **“FIND THE DIVINITY WITHIN.”** Its two consecutive words have exactly the p0 title's 8+5 GP lengths, with GP indices `[23,10,1,10,9,10,16,26,7,10,2,10,9]`.

**Historical ordering is stronger than the bookend alone:** the exact phrase `FIND THE DIVINITY WITHIN`, including the overlapping words `THE DIVINITY WITHIN`, was already embedded in the first-party **2013 Cicada OS `761.MP3` ID3 poem**, before LP2's 2014 release. The genuine 2013 audio was later used as the documented XOR key for the original Twitter stage, and its metadata is preserved with [source-byte hash and historical context](audio-761-pad-scan.md). The source phrase therefore was independently available to a 2014 puzzle participant *before seeing either 2014 encrypted heading*, although the clear p57 repeats the same passage verbatim and is **not** an independent second textual witness. No historical Cicada instruction asserts that the poem was encrypted as an LP2 red heading. The shared word lengths and philosophical theme are explainable as an accidental collision or ordinary topical repetition. This provides a better specified hypothesis than inventing arbitrary plaintext, but the title remains hypothetical. Previous independent trials of **ENLIGHTENMENT** and signed-2016 **EPIPHANY SEEKS** use different, already retired opening cribs; see [2014 signed phrase](lp2-2014-enlightenment-p0-red13-crib-gate.md) and [2016 signed phrase](lp2-p0-2016-epiphany-title-crib-gate.md).

## Frozen operation and complete original-cipher decision

Assume, solely for this test, that the 13 source p0 red ciphertext runes are additive GP29 ciphertext for the p57 phrase, with no plaintext-F skip in the assumed heading. The resulting **unique** 13-symbol key is
`K=C−P (mod29)=[21,27,17,22,26,9,11,3,8,16,16,11,25]` or `NG IA B OE Y N J O H T T J AE` in GP labels. Every heading symbol reproduces exactly by construction; that training fit provides no independent verification.

Freeze the body to the **716 unchanged original runes** after the 13-dot boundary, running continuously through physical p0, p1, and p2. No word resplitting, phase fitting, shifted clocks or dictionary rescue is allowed.

| Exact decoder | Original 716-rune body coincidence | Original readout / impossibility |
|---|---:|---|
| Period-13 additive `P_i=C_i−K_{i mod13}` | **0.035246317928** | Starts `I P E O O TH J F U S OE W J AE Y IA F S U I IA U`; no prose |
| Plaintext-autokey `P_i=C_i−P_{i−13}` seeded by p57 phrase | **0.034140719616** | Starts `H U C S L U G G TH NG W H IA N D I W NG N S A W`; no prose |
| Ciphertext-feedback `P_i=C_i−C_{i−13}` | **0.034949408134** | Starts `T O B OE D NG A O D C L Y TH S P N Y EO EA EA IA F`; no prose |
| **Historically authentic prime-era plaintext-F bypass with the derived repeated key** | **No legal full path** | All possible consumptions/skips die at original p0–2 offset **45** |

For the strict historical skip case, literal plaintext `F=0` encrypts to ciphertext `F` without advancing the key; an encrypted non-F may also yield ciphertext F. The exact inverse propagates **all** legally advancing and bypassing key-clock states. Immediately before original rune index45 its sole surviving consumed-key counter is **44**; the actual ciphertext is **N (index9)** and the scheduled key is **N (index9)**. Consuming this rune would decode to forbidden plaintext F, and a bypass requires printed ciphertext F. Both transitions are impossible. The true cipher's full inverse therefore cannot continue past offset45 in this declared key family, independent of word frequencies and guessed skip positions.

The inverse implementation also encrypts the independently clear **95 original p57 runes** under this same test key and actual transparent-F rule, then confirms a complete legal inverse path through all 95. This is a source-shaped positive of the implementation, not evidence that this p0 crib is genuine. Ordinary/autokey streams are near the GP29 uniform baseline `1/29≈0.03448276`; the authentic p57 clear control is `0.06270997`. Correctly reproducing a key-implied heading and reencryption of an invertible family cannot authenticate a key.

## Independent overlapping p33 red-heading source crib

The **other** exact major-red-heading pattern present as consecutive words on original clear p57 is **2+8**: the words `THE DIUINITY` at clear p57 rune offsets **71–80**. It corresponds exactly to the **p33 initial red title's 2+8 printed word lengths**. The p0 hypothetical `DIUINITY WITHIN` begins at p57 rune offset73. Hence the three consecutive clear words `THE DIUINITY WITHIN` visibly supply two overlapping word-length proposals for red headings on different original chapters. The **other seven major red-heading units** have no exact consecutive whole-word shape match in this 20-word p57 text; p33@91 and p40 each use the repeated 3+5 shape. This is more constrained than an isolated thematic substring but remains susceptible to retrospective selection and coincidence; neither title is authenticated plaintext.

Original p33:0–9 GP ciphertext is `D EO | X C F I A W H G`, and positing `THE | DIUINITY` gives another unique additive period-10 key `[21,23,20,24,28,0,15,26,21,9]` or `NG D L A EA F S Y NG N`. Comparing the eight key digits associated with the shared word `DIUINITY` to the p0 title's eight derived corresponding digits gives **zero matches out of eight** under a same-key, word-aligned hypothesis. A single fixed word-origin pad therefore fails this straightforward cross-heading condition. More importantly, an independently continued source-native p33–39 inverse gives the following:

| Full p33–39 chapter continuation after red 10 | Source-native 1,670-rune coincidence / result |
|---|---|
| Repeated period-10 GP29 additive key | **0.034424859089**; nonprose |
| Period-10 plaintext autokey seeded by hypothetical title | **0.034350950585**; nonprose |
| Period-10 ciphertext-feedback key | **0.034300003947**; nonprose |
| Historically authentic plaintext-F bypass | **No complete legal path: dies at p33 local rune91** |

For the historical rule, the decoder starts with 10 consumed key symbols after the proposed heading and allows all possible literal-F skip histories. Just before original p33 rune91, the surviving consumed clock is90. Its ciphertext is `NG` index21 and its scheduled repeating key is also `NG` index21, requiring forbidden non-bypassed plaintext F. Coincidentally, offset91 is also the separately identified **second red-heading start** on p33. This location match is a post hoc observation, not evidence that resetting a cipher at that heading works: the default reset phase0 would recreate the same contradiction, and no source supplies another second-heading key. The independently clear p57 95-rune positive enciphered with this new period-10 key passes the same all-clock inverse.

Together, the overlapping phrases identify two potential source-internal title cribs and directly reject their simplest continuation mechanisms. **The number of unencrypted unknown LP2 runes recovered remains zero.**

## Shared initial key and a bounded feedback-key recovery attempt

The two independently derived title keys have **the same first GP29 value**, `K_p0[0]=K_p33[0]=21 (NG)`, although their eight digits associated with the identical candidate word `DIUINITY` disagree. A human might suppose two red-heading sections initialize a common key state at NG and then evolve it according to their differing preceding plaintext. Such **cipher-feedback key evolution** could explain why a repeated linear pad fails despite a common IV. This is a testable rival to a fixed periodic key, not evidence for the title cribs: the chance of coincidental one-symbol agreement remains nontrivial, and the source gives no key-update formula.

Freeze the two 13- and 10-rune p57-based plaintext proposals and the exact keys already inferred from the original two ciphertext headings. For each lag `r=0,1,2,3,4`, grant *all* possible coefficients in GF29 of the shared, unknown affine feedback family

`K[i+1] = Σ_{j=0..r}(a[j] K[i-j] + b[j] P[i-j]) + c [+ d*i] (mod29)`.

The two title streams reset their plaintext/key position clock at each original heading; their first key digit is the common 21. The optional `d*i` permits a common per-symbol linear drift. The family is a complete low-state additive-feedback key recovery method; setting coefficient choices to plain/cipher autokey, simple LCG, or one-back linear feedback is included. For a lag with `m` coefficients, form every exact linear constraint from **both** title pairs and ask by GF29 Gaussian elimination whether *any* hidden coefficient vector satisfies all of them. Thus one source-selected hypothetical plaintext provides training equations and the other title supplies additional independent ciphertext constraints. No English score or PRNG search is necessary.

| Maximum preceding lag | Shared feedback without position drift | Shared feedback with position drift |
|---:|---|---|
| 0 | **Impossible**, 21 equations / 3 unknowns | **Impossible**, 21 equations / 4 unknowns |
| 1 | **Impossible**, 19 / 5 | **Impossible**, 19 / 6 |
| 2 | **Impossible**, 17 / 7 | **Impossible**, 17 / 8 |
| 3 | **Impossible**, 15 / 9 | **Impossible**, 15 / 10 |
| 4 | **Impossible**, 13 / 11 | **Impossible**, 13 / 12 |

The exact inverse solver includes a **joint two-section native GP29 plant** under an independently generated feedback key `K[i+1]=7K[i]+13P[i]+4`, initializing both titles with 21. It recovers the unique planted coefficient vector `[7,13,4]`, confirming that the gate would detect an actual common short-memory feedback mechanism. The original disproof applies **conditionally on both hypothetical title cribs being correct and using one shared affine key-update law**. It does not disprove a genuine author-chosen nonlinear generator, evolving secret state, separate title encryption modes, a key with memory longer than five runes, or a different plaintext candidate. Given neither title is authenticated, none of those expansive alternatives should be searched absent a source operator.

## Independent 2013 soundtrack-title candidate for the final p54–55 red chapter

The **2013 original Cicada OS MP3 metadata** contains the artist-given title `THE INSTAR EMERGENCE`; this is source-exact, historically available before 2014 LP2, and distinct from the poem embedded in the same file. Its last word `EMERGENCE` has exactly **nine GP29 runes**, equal to the entire **nine-rune red heading on original p54** (`71.jpg`). The p54 illustration features growing paired branches, and the adjacent p55 depicts a central tree. The MP3 poem explicitly describes an instar tunnelling to the surface and emerging. This yields a **plausible human phrase hypothesis**, but a nine-rune word-length coincidence with botanical art still does not authenticate the proposed encrypted heading. Original p54 red ciphertext is `A M NG D IA TH X I M` (sum of GP prime weights 597), with no direct Romanized word or matched prime sum; `EMERGENCE` has prime-weight sum 409.

Fix the source title word `EMERGENCE` in native GP indices `[18,19,18,4,6,18,9,5,18]` as a **hypothetical** plaintext for p54 red runes. It implies a unique nine-symbol additive key `[6,0,3,19,21,13,5,5,1]` = `G F O M NG P C C U`. Continue one single key stream through the remaining **299** original runes of p54–55, without resetting at p55. The body IoCs under repeated-period9, plaintext-autokey9, and ciphertext-feedback9 are respectively **0.033871293574**, **0.034993602837**, and **0.033961078315**; none yields intelligible plaintext. The full exact historical plaintext-F nonconsumption inverse admits **no legal continuation beyond chapter rune offset122**: at that position the only possible consumed clock is121, original ciphertext NG(index21) equals scheduled key NG(index21), forcing an illegal encrypted F. The unchanged original 95-rune p57 cleartext, independently encrypted with the same hypothetical key and true plaintext-F rule, has a complete legal inverse path and supplies a reproducible native positive.

Thus the song title offers a previously published candidate name for the otherwise opaque final red chapter, while the simplest complete reversible decoder fails. It should **not** be recorded as solved p54 plaintext or rescued by changing offsets and keys. More constructive work would require an original pictorial or signed instruction that selects both the title and a viable full-chapter cipher. This extension is included in the consolidated SFT above to avoid another isolated report.

## Decision and reproduction

Retire both exact **p57 phrases as p0/p33 inferred title plaintext → repeated GP29 keys**, their natural periodic feedback continuations, and the authentic transparent-F family as complete plaintext solutions. The phrase may still be thematically connected or have a distinct use under an independently authored operator, but the source supplies no such instruction. This negative should not spawn speculative second layers or other offset sweeps.

[One-file original-corpus Node22 CommonJS SFT](../sims/lp2_p0_p57_divinity_crib_sft.cjs) asserts the original heading, final clear phrase, full first-chapter rune count, 716-body inverses, death certificate, and a complete 95-rune actual-rule native positive. Inputs are only `resources/liber-primus/lp2-corpus.json` and its unaltered source-preserved GP29 alphabet. A complete original-corpus Windows Node.js 22 execution of the earlier two-crib source-locked SFT [passed in manual Actions run 44006103702](https://github.com/FlareZ123/liber-primus/actions/runs/44006103702), including the native shared-feedback positive and exact original F-clock impossibility assertions. The p54 title extension was subsequently added and is independently pinned by source-input assertions in the same SFT. This is an intermediate crib decision under `im-results/`; no authoritative `results/README.md` change is justified.
