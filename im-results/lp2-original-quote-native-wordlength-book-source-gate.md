# LP2 quoted-source fingerprints and p40/p53 shared-prefix test

**Current decision, 15 November 2026.** The independently visible **shared five-word prefix-length fingerprint** at original physical p40 and p53 remains a genuine original-image observation. However, a new finite comparison of twelve archived first-party signed Cicada text bodies and the independently selected historical literary corpus finds **no attributed 21-rune common quotation**, nor a source-text six-word opening that matches either original quotation's first six printed-word lengths. The same five-word lengths occur among demonstrably different natural literary phrases, including three distinct passages within one original Emerson essay. Therefore a **shared plaintext crib is currently unsupported and should not be used for further key fitting** until an independent creator/source clue selects the same phrase. Earlier exact keyless gates still reject deterministic 1–5-phase per-page substitution/affine consumers conditional on equal plaintext. No unknown original LP2 plaintext, author-selected key, or intended destination is recovered.

## Exact original input and comparator

The canonical [LP2 rune transcription](../resources/liber-primus/lp2-transcription.txt) uses `/\n` as a visual line wrap and `%` as a physical page marker. Neither must end a word. Only `-`, `.`, `$`, `&` and `§` terminate words. The seven image-annotated [quotation spans](../resources/liber-primus/lp2-quote-punctuation-spans.json) have **4,5,2,14,13,34,14** words and **18,19,12,58,68,160,70** original runes. The longest p42→43 quote is 34 whole words, including a carried word across the physical page break. Source orthography treats the graphemes ING, TH, NG, EO, OE, AE, EA, IA as single GP runes. The longest quote's fixed target sequence is

`4 2 4 6 6 8 8 3 5 5 9 2 2 4 3 3 2 8 4 7 4 4 3 2 5 3 3 6 3 11 4 4 8 5`.

An independently known complete original-p57 English passage beginning `PARABLE LIKE THE INSTAR TUNNELING` matches all 20/20 GP-projected word lengths. This is a positive for this precise original English spelling, not a universal runic spelling theorem.

The test compares each complete quoted word-length sequence against every uninterrupted equal-number-of-words window in each source, with an absolute-difference sum and **zero as the only exact-match criterion**. It does not insert or delete words, edit plaintext, fit a substitution alphabet, or choose a different target window after seeing a source result.

## Results

The previously committed source screen compared the [original LP1 rune book](https://github.com/rtkd/iddqd/blob/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/liber-primus__transcription--master/liber-primus__transcription--master.txt) (2,797 GP runes/694 whole words before the LP2 prefix), [Emerson's Essays First Series](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/521cb08a689d2159cf54e3c569fd59588601f875/data/corpora/emerson_essays.txt) (95,422 tokens) and an [incomplete archived Crowley Liber AL excerpt](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/521cb08a689d2159cf54e3c569fd59588601f875/data/corpora/liber_al_vel_legis.txt) (2,247 tokens). Their minima for [p40, p42, p42→43, p53] were respectively **[14,19,58,19]**, **[8,10,44,13]**, **[11,18,53,18]**. None matched exactly.

The same frozen four windows were then compared with original round-selected literary works already preserved in [resources/external](../resources/external/). The table reports the minimum error for each window, in order:

| Archived source | p40 (14 words) | p42 (13) | p42→43 (34) | p53 (14) |
| --- | ---: | ---: | ---: | ---: |
| Crowley, *Book of the Law* I, II, III, minimum across three chapters | 8 | 16 | 50 | 12 |
| Blake, *The Marriage of Heaven and Hell* (1906 source) | 11 | 15 | 50 | 14 |
| *Mabinogion* 2012 selected corpus (105,582 derived GP words) | 8 | 11 | 42 | 12 |
| KJV Passion/Gospels excerpt | 9 | 14 | 45 | 14 |
| Tennyson, *Lady of Shalott*, 1832/1842 edition minimum | 12 | 17 | 51 | 16 |
| *Sefer Yetzirah*, Westcott archive | 10 | 15 | 51 | 15 |

All distances are positive. The Crowley text files provide more complete previous-round material than the earlier excerpt. The Mabinogion row uses a previously pinned derived GP-length array; the other rows project archived source text. Editorial wrappers, different editions, apostrophes, author-specific spellings and paraphrase are outside the strict exact-match hypothesis.


## Newly isolated source-marked bookend quotation pair

The source-annotated original-ink quote opening on **p40** starts at global unknown+solved LP2 rune index **9811** and spans **14 printed words / 58 runes**; the second on **p53** starts at **12522** and spans **14 words / 70 runes**. Their first five complete printed words have the *identical GP lengths*

`5 7 2 3 4`,

and the sixth words have different lengths **6** (p40) and **10** (p53). Complete patterns are respectively

- p40: `5 7 2 3 4 6 4 3 3 4 4 4 5 4`.
- p53: `5 7 2 3 4 10 3 9 7 3 7 4 3 3`.

The original ciphertext opening of the five words at p40 is `F D R EA G | P O EO O M EA B | J IA | S M F | T F AE O`. At p53 it is `EA X Y EO R | O P S C AE M EO | N J | E F S | E F A NG`. Only **1/21** corresponding original cipher runes is equal. It is therefore unsafe to claim that two plaintexts or cipher keys repeat.

The original full LP2 transcription has **2,941 complete printed words** once the solved p56/p57 words are also included; the unknown p0–55 portion alone has the established **2,896**. Its **2,937 possible five-word windows** contain this `5,7,2,3,4` pattern exactly **twice**, at the two marked quote openings and nowhere else. Among the **21 pairs of seven source-marked quote starts**, this is the sole pair with an equal length prefix of five or more whole words; the next best match is one word. The observed unconditioned five-word *window-pair collision frequency* in this exact book is **0.0000619272**. Restricting alternative complete 14-word starts to the two original physical pages gives **41×26** eligible pairs and **2/1,066 = 0.00187617** five-word prefix collisions, one being these actual quote starts. These are **reference frequencies under specified empirical selections**, with no correction for the wider historical search over many possible structural observations. They are evidence to investigate a repeated utterance, not a decoded quotation or an author-intent probability.

### First-party attribution and natural-language counterexamples (Agent18, 15 November 2026)

The exact source-visible five-word shape **[5,7,2,3,4]** remains an observable shared feature, but **it contains no authenticated plaintext characters**. The two original quote starts have separately anchored sixth-word lengths **6 (p40)** and **10 (p53)**. A six-word original-source match would therefore be more informative than discovering another text with only the common five-length shape.

A new deterministic original-source comparison uses the same frozen GP29 word-length convention `ING, TH, NG, EO, OE, AE, EA, IA` as single runes, with all original word boundaries unchanged. Twelve surviving **archived Cicada clear-signed texts** contain 701 cleartext word tokens in total, after explicitly removing PGP signatures and any embedded encrypted armored blocks. They include the 2012 countdown/MIDI, archived 2013 onion and forest messages, 2014 Stage09/Stage11 messages, the complete long 2013 “do not share” text, and the signed 2016 and 2017 clues. **None contains [5,7,2,3,4] as five consecutive source words**, so no first-party phrase is available to assert for either quote. Several records reproduce related signed wording; 701 counts archive text tokens, not independent trials.

The frozen historically associated literary text panel also yields no 14-word match (as documented above). A distinct question is whether their first *five* words can match this profile. The exact answer is:

| Independent archived text | Exact five-word-length windows |
| --- | ---: |
| Blake, *Marriage of Heaven and Hell* | 0 |
| Crowley, *Book of the Law*, all three archived chapters | 0 |
| KJV Passion/Gospels selection | **1** |
| Tennyson, *Lady of Shalott*, 1832 and 1842 | 0 |
| Gibran, *The Prophet* | 0 |
| Shakespeare, first 300,000 characters | **4** |
| Emerson, *Essays: First Series* | **5** |
| Sefer Yetzirah, Westcott source | 0 |
| Solved LP1 plaintext reference | 0 |
| *Mabinogion*, archived 2012 GP-length array (105,582 words) | **5** |

The ten actual phrase matches available from KJV/Shakespeare/Emerson are **ten distinct five-word phrases**, none repeated across this finite panel. The *Mabinogion* only has a previously pinned derived GP word-length array, so those five matches supply offsets and lengths, **not independently readable source phrases**. None of the fifteen literary matches has the actual original p40 sixth-word length **6** or p53 sixth-word length **10**; source-matched sixth lengths are KJV **4**, Shakespeare **4/3/2/3**, Emerson **2/2/2/2/3**, and *Mabinogion* **3/2/3/5/3**. This is a deliberately bounded negative with original, frozen word positions; a paraphrase, missing historical document, edition difference or entirely new source could still provide a phrase.

A particularly informative **counterexample to equating the shared profile with shared plaintext** occurs in the independently selected Emerson text. Three distinct natural five-word utterances within 91 words have **exactly the same** GP lengths [5,7,2,3,4], yet visibly differ in actual lexical contents: `EVERY GESTURE OF HIS HAND` (source token 30398), `EVERY QUALITY OF HIS MIND` (30476), and `EVERY EMOTION OF HIS HEART` (30488). Each naturally continues with a two-rune sixth word. These are **original literary source counterexamples**, not proposals for either LP2 quotation's plaintext or an attribution of Liber Primus to Emerson.

**Decision and next route:** Within the actual surviving signed source set and the historically selected finite literary inputs, there is **no independently sourced same-plaintext 21-rune crib** for the two quotations. Retire further p40/p53 same-phrase key-cancellation, page phase fitting or decoder construction **until a new attributable creator/source clue identifies the same exact 21-rune GP29 text and a genuine state/clock rule**. This does not prove the two unknown plaintexts differ. A future independent source quotation can be checked against both full 14-word patterns and then against an explicit, reversible, original-cipher inverse.

The source-exact [CommonJS SFT](../sims/lp2_p40_p53_quote_source_attribution_sft.cjs) asserts both original quote offsets, five- and six-word original shapes, the twelve clear-signed source bodies, all archived literary counts, the exact Mabinogion length-only offsets, the distinct Emerson counterexamples and no six-word source matches. It was run with unchanged tracked files on [Windows Node22 via GitHub Actions](https://github.com/FlareZ123/liber-primus/actions/runs/43733652962); an additional same-workflow run after the sixth-word assertions is linked in the repository Actions history.

### Exact necessary-condition cipher checks

If these five printed words represent the *same* 21 GP29 plaintext symbols in the same orthography, then two fixed page-specific **monoalphabetic permutations** must preserve the original rune-equality structure. They cannot: p40's first, seventeenth and nineteenth ciphertext symbols are all F, while p53's corresponding symbols are EA, S and F. Thus two distinct static page alphabets cannot encrypt one identical 21-rune phrase into both observed strings.

The **stronger arbitrary-permutation gate** rejects *every* word-reset, page-keyed substitution alphabet regardless of its internal alphabet order: at word-local position one, the p53 ciphertext prints the same F at paired phrase indices 15 and 18, whereas p40 prints different M and F. A fixed word-relative substitution must preserve this equality relation across the two alleged copies. For continuous-phase arbitrary substitutions, periods 1–4 fail but **period 5 admits a mapping** of this short pair; that permissive fit is not evidence for the cipher because its independent alphabet permutations have many free symbols. A more restrictive pair of independently selected **additive or affine per-phase** alphabets, with 1–5 periodic positions either continuous through the 21-rune excerpt or restarting at each printed word, fails. No 1–5-phase assignment admits **any** independent page-pair affine relation `C53 = a*C40+b (mod29)` in *every* phase; the original logged same-phrase differential is `[1,9,7,16,2,10,19,26,27,23,9,5,2,16,26,19,14,27,0,1,11]`, which is not constant under any tested phase grouping. The exact already-printed p49–51 table's previously frozen per-page row16 additive interpretation predicts only **2/21** differential positions on this pair. A separate historically observed continuous consecutive-prime source clock also produced at most two same-plaintext shift matches under obvious fixed original alignments; no period-specific prime inverse is being promoted here.

**Repeated table-key clock as a stronger cross-quote exclusion (15 November, Agent25).** The physical 32×8 p49–51 table is the only manuscript-local 256-cell byte candidate between the two floral quote openings. If the first 21 plaintext runes at global offsets 9811 and 12522 are identical, and if the table acts as a *repeating, chapter-continuous ordinary GP29 additive key*, their 21 ciphertext differences must exactly equal the corresponding relative key differences. This cancels the unknown plaintext and tests a decisive equality constraint without ranking English or assuming a phrase. The source-fixed offset gap is **2711 rune positions**; punctuation and the 256 nonrune numeric cells do not consume this proposed rune clock. The key is read in printed 32×8 row order or visible column order, with either **one byte mod29** or the two historical **BASE29 positional digits**, producing four key arrays of periods 256 or 512. Exhaustively enumerate both additive signs and **every circular starting phase**: maxima are **5/21, 4/21, 5/21, 4/21** respectively. No phase/sign satisfies **21/21**, and all four families pass an exact 21-rune same-plaintext planted positive. [Original-input read-only CommonJS SFT](../sims/lp2_quote_table_repeating_key_sft.cjs) · [successful Windows Node22 run 43721226654](https://github.com/FlareZ123/liber-primus/actions/runs/43721226654). This eliminates **this table-key/clock plus shared-plaintext conjunction** under the two natural readouts; it neither establishes that the quotations repeat plaintext nor excludes table keys with independently sourced nonperiodic state or a different consumer. The best 5/21 is a diagnostic, not a partial decipherment.

**Direct source-number inverse.** The repeated five lengths `[5,7,2,3,4]` themselves could be read as a five-step Gematria shift key, so we also froze that independent operation on the whole original **3,008-rune p40–53 floral chapter**, using both arithmetic signs and three visible clocks: chapter-continuous, physical-page-reset and printed-word-reset. Its six full-length original decoded coincidence indices were **0.03452007, 0.03456960, 0.03457491, 0.03444556, 0.03460012, 0.03444467**, indistinguishable from the unmodified original **0.03454263** in this language-structure measure. No meaningful GP plaintext appears; the same key algorithm exactly recovers a separate 95-rune solved-p57 plant. Thus the most literal standalone use of the *new* source-derived five-number key is already a bounded negative, and does not justify arbitrary phase, clock or transform fitting.

These are **conditional eliminations** for the repeated-plaintext claim, rather than unconditional cipher exclusions. More complex per-rune state, genuinely distinct plaintexts with coincidental word lengths, a further encoding layer, or different GP orthography remain possible. A decisive positive path is to independently source a proposed *five-word exact phrase* selected by an original Cicada clue, verify both quote readings on untouched source glyphs, then test a reversible, source-selected page-clock/key against the **21 paired original runes and withheld surrounding words**. Do not search arbitrary keys merely to rescue the shared-length coincidence.

Reproduction: [complete local-only Windows Node22 CJS original-source SFT](../sims/lp2_quoted_pair_sharedprefix_source_sft.cjs); it independently asserts the original 2,941 printed-word census, all seven quote windows, pair uniqueness, exact source rune arrays, fully enumerable empirical pair comparisons, and the arbitrary-permutation, no-fit affine, grid-row and direct five-number-key gates. The separate source-book test below remains useful for any independently selected literary crib.

## Reusable procedure and next decision

The [corrected Node22 CommonJS SFT](../sims/lp2_quoted_source_wordlength_sft.cjs) preserves the original 20-word positive and three pinned external-source tests. It now tests all the additional local source texts without network access, while the original three pinned external fetches remain network-dependent. A malformed parser condition in the earlier SFT was corrected to use exactly `-.$&§`, restoring its ability to run.

The p40/p53 five-word shared-length opening is an original-cipher structural observation whose duplicated-plaintext interpretation **currently lacks independent literary or first-party support**. A direct literary plaintext-recovery continuation requires **historical identification of the actual common quote and an author-selected inverse**; fitted shared-phrase models should not be pursued in the meantime. The scorer can then test its entire fixed original word-length pattern and pass any exact matching candidate as a frozen crib to a reversible original-cipher attack. Unconstrained broad text crawling or relaxed similarity searches are not supported by the present evidence.
