# Flower-framed LP2 pages: additive and five-bit XOR shared page-start key constraints

**Agent41 · 22 November 2026 · original-cipher decision.** No plaintext, genuine encryption key, decoder, or continuation endpoint recovered. The repeated flower motif motivates two distinct, bounded shared page-start key hypotheses: GP29 addition and five-bit GP ordinal XOR. The two original red headings remain outside their black-body clocks. The tests below reject this as a credible explanation of ordinary GP-native English text with unchanged original printed word boundaries. They do not exclude separate page keys, nonadditive ciphers, alternative source registers, or a historically selected reset rule that differs from this one.

## Original source and fixed reversible hypothesis

The original physical scans repeat the same left/right flower frame across sixteen pages. The original p50 page has no runic text. The fifteen rune-bearing original pages are `40–49,51–55`. Original p40 begins with **8 red runes**, and p54 with **9**. Strip only those two header spans from the respective body-key clocks. Every other page begins its hypothetical pad at its first GP29 rune; original physical page carries and each word's authentic punctuation are retained.

For a matched page pair `a,b` with a hypothetical common pad `K[i]`, the unmodified rune indices obey

```
C_a[i] = (P_a[i] + K[i]) mod 29
C_b[i] = (P_b[i] + K[i]) mod 29
D[i]   = (C_a[i] - C_b[i]) mod29
       = (P_a[i] - P_b[i]) mod29
```

These equalities hold for **any** pad bytes or secret complexity. The tested alignment is exactly offset zero from each printed black page-start. A human might try resetting at each repeated frame, but no source text explicitly instructs doing so. There is no key fit or offset search here.

## First source-cipher decision: cancellation across all 105 physical page pairs

Compute the genuine GP29 text unigram distribution from the committed, unchanged 300k Shakespeare reference using the repository's solved-source orthography (including `ING→NG` and `IO→IA`, before GP longest-token encoding). This yields **217,106 GP runes**; the independently sourced two-plaintext difference law `Q(d)=Σ_x p(x)p(x−d)` has `Q(0)=0.059447275957596336`. Score the original difference tape of each original pair by `sum(log(29·Q[D_i]))`, using full overlap and no selected word.

- Fifteen original rune-bearing pages imply **105 distinct page pairs**, **18,918** total rune-pair positions.
- The strongest apparent original is **p43/p48**, full **271** black-body runes, with **18** matching ciphertext runes and score **+4.786752108811641**.
- The **whole 105-pair score aggregate** is **−319.2937295144604**.
- Under **2,000** deterministic null panels that cyclically shift each unchanged original page independently, keeping each page's exact runes and internal correlations, **164** null books have a best pair at least as strong (familywise add-one `p=165/2001≈0.08246`); **159** null aggregate scores also exceed original (`p=160/2001≈0.07996`). The apparent best pair has no secure source-specific strength.
- A same-pad plant using independently selected original-shaped English GP words and a planted true 95-rune clear-LP2 p57 pair both satisfy exact GP29 cancellation and recover their original planted plaintext.

**Windows Node22 pass:** [run 45047893427](https://github.com/FlareZ123/liber-primus/actions/runs/45047893427). Full original-source, native-control and null SFT: [`sims/lp2_floral_page_start_twotimepad_sft.cjs`](../sims/lp2_floral_page_start_twotimepad_sft.cjs).

## Stronger key-independent plaintext challenge: complete original printed words

A hypothesized same pad carries much stronger constraints than one global language score: wherever two original **complete interior printed words** overlap at the same body-rune offset, their unknown GP plaintext must agree with their observed source ciphertext difference at *every* overlapping position. Unlike a two-time-pad language heuristic, this makes **exact all-secret local exclusions** possible conditional on a named English vocabulary.

Construct a **32,196-lexeme reference** from four committed independent English sources: TextBlob word frequencies, Shakespeare, Gibran and Emerson. Encode each using the same GP29 source-native convention and retain the rune sequence as the dictionary identity. Keep all rune word lengths from 1 through 14. Parse every original flower-page source transcription, honoring printed punctuation and line wraps; exclude first and last printed word of each page from vocabulary constraints, because either can be a cross-page fragment. Compare every pair of complete, physically printed word intervals in each of the 105 original page pairs.

For each real overlapping word pair `A,B`, try all source-native GP dictionary words of the *original exact word lengths* and determine whether even one pair can realize **every observed difference rune** in that overlap. A zero-compatible overlap rules out the entire unknown additive pad for that source-lexicon/printed-English model. Every additional original word can only tighten this statement.

- Of the **105 original page-pair candidate clocks**, **101** contain at least one locally **impossible** original printed-word overlap. The first refutation appears after checking **202** overlap constraints in total.
- Even the globally strongest apparent pair p43/p48 fails the original **7-rune** intersection of p43's 14-rune word at body offset37 and p48's seven-rune word at offset40. Its independently exact aligned seven-rune word pair at offset120 also has **zero** compatible native-English GP7 word-pairs under the actual seven runic deltas `[22,8,15,13,28,28,8]`.
- The four **locally viable** page pairs are **41/49**, **46/49**, **48/49**, and **49/51**, all involving the unusually short rune text adjacent to p49's physical numerical panel.
- Propagating **full word-domain arc consistency** through all overlapping original words excludes another **41/49** (its word-length-2 domain becomes empty) and **49/51** (a word-length-3 domain becomes empty). This is an all-key **word-assignment consistency** gate over the named corpus, stronger than the isolated word-overlap test.
- The remaining **46/49** and **48/49** pairs are mathematically compatible with some dictionary-word assignments. For **48/49**, arc consistency forces a run of p48 GP words at body starts 40/47/50/52 to the improbable **“PESTEWING MET AB BARKER”**, and p49 body starts 40/43/47/53 to **“KID REEK SPIRAL LOBBY”**. The isolated word **SPIRAL** resonates with genuine manuscript imagery, but in this context it is one forced member of an incoherent segment under an independently unsupported cipher assumption. It is **not** recovered plaintext or evidence of an intended spiral key.
- All **105** synthetic source-shaped page-pair positives pass every native-word overlap, and the original solved p57 authentic rune plaintext supports exact two-time-pad identity.

**Windows Node22 pass:** [run 45048694468](https://github.com/FlareZ123/liber-primus/actions/runs/45048694468). Reproducer and complete per-pair output: [`sims/lp2_floral_page_start_native_word_csp_sft.cjs`](../sims/lp2_floral_page_start_native_word_csp_sft.cjs). The vocabulary is a stated finite reference, not all possible legitimate historical English spellings. Thus lexical mismatch does not prove algebraic impossibility over arbitrary unknown language; it refutes the source-calibrated native-English model and supplies exact witnesses that survive any secret shared pad.

## Separate source-motivated five-bit XOR key: complete 105-pair lexical exclusion

The original flower clusters contain **five marked positions**; previous Cicada stages used literal XOR. A distinct, source-relevant possibility is therefore **bitwise XOR** of 5-bit GP29 ordinal glyph values 0–28 with the *same* page-reset key, retaining source-native rune word boundaries and the already fixed 15 black-body page clocks. This is a hypothesis only: no original author instruction specifically selects XOR here.

For two pages with an arbitrary common key `K[i]` define `C_a[i]=P_a[i] XOR K[i]`, `C_b[i]=P_b[i] XOR K[i]`; then **`C_a[i] XOR C_b[i]=P_a[i] XOR P_b[i]`**, independent of the secret bits. Both real and hypothetical glyphs must remain GP0..28 even though five-bit XOR itself ranges 0..31. The same four independent-source English lexicons and GP-native whole-word grammar used above make every source-index word intersection a necessary exact equality.

**Original results, all 105 possible flower-page pairs:** **103** contain at least one locally impossible original printed word intersection, after only **159** overlap edges evaluated. The two local survivors are **p41/p49** and **p46/p49**. Exact arc consistency among all unaltered printed complete-word intervals eliminates **both**: in p41/p49 a four-rune original overlap at body offset48 leaves an empty four-rune word domain; p46/p49 a two-rune overlap at offset16 leaves an empty four-rune word domain. Every possible reused five-bit XOR pad, however complex, is incompatible with native-English GP words from the frozen **32,196-lexeme** reference on all 105 page-pair registrations.

An independent 217,106-GP-rune Shakespeare XOR-difference model found the largest original page-pair score on p43/p48, **+4.756114725708278** over271 rune pairs; all-pair aggregate **−468.7558932696008**. In 2,000 frozen original-page cyclic-rotation nulls (seed `0x33012026`), **167** best scores and **210** aggregate scores met/exceeded the observed, familywise p≈**0.08396** and aggregate p≈**0.10545**. No special original XOR match emerged. The higher-value exact whole-word exclusion is independent of that score.

A source-shaped common **nonzero five-bit key**, constrained to emit only GP0..28, passes exact XOR word compatibility for **all105/105** native-English original-shaped planted page pairs. The genuine solved p56/p57 GP ciphertext plants pass full encryption, inverse, and key cancellation under the same masked nonzero-key rule. The original-cipher Windows Node22 SFT [passes](https://github.com/FlareZ123/liber-primus/actions/runs/45049565780): [`sims/lp2_floral_page_start_xor_word_csp_sft.cjs`](../sims/lp2_floral_page_start_xor_word_csp_sft.cjs).

This rejects only **page-start reset of one identical 5-bit XOR pad with preserved native-English whole words**. Alternate grammar, page clocks or independently different keys are not tested. It does not recover any unknown plaintext.

## Whole-book extension: all 55 original unknown rune-bearing page starts

The floral chapter is a natural source of page-reset ambiguity. A separate full-book original-input experiment therefore tests the same two independently fixed shared-key cancellation rules at the first black-body rune on all **55** physical unsolved LP2 runic pages, p0–p55 except rune-free p50. Authentic source red heading lengths come from `resources/liber-primus/lp2-ink-annotations.json`. For each mode, **all 1,485 unordered page pairs** have one zero-offset registration. No key, alignment, plaintext or offset is fitted.

The source-native English plaintext vocabulary has **32,196** original control lexemes. All word intersections use exact preserved LP2 printed punctuation and complete interior words. First/last page words are deliberately excluded to avoid incomplete cross-page fragments. When two pages reuse the same arbitrary pad, every overlapping word-pair difference, modulo29 or five-bit XOR, is **independent of the unknown key**. A pair is refuted when one genuine overlap has no compatible native-English word assignment; surviving pairs receive arc consistency over every original overlapping word.

| Key-reuse model | Original pairs | Locally impossible | Locally viable | Remaining after all-word propagation |
| --- | ---: | ---: | ---: | ---: |
| GP29 additive page-start key reset | 1,485 | **1,468** | 17 | **4** |
| Five-bit ordinal XOR page-start key reset | 1,485 | **1,472** | 13 | **0** |

Exact local rejection requires only **1,948** original word-overlap edge checks for addition and **1,881** for XOR. Notably the longest locally viable independently shaped examples, additive p14/p20 (55 word intersections) and XOR p31/p53 (72 intersections), both become inconsistent after propagating their real word domains. Therefore 0/1,485 XOR page pairs remain compatible with the stated finite native-English word corpus.

The **four additive locally and globally consistent pairs** are **p5/p49, p10/p49, p46/p49 and p48/p49**. All include physical p49's unusually short 66-rune pretable text. A separate maximum-frequency English dictionary assignment was generated for each entire overlap constraint tree, with only the committed TextBlob frequencies as weights. Examples of mutually incompatible forced portions: p10: **OH FINDING FLYING HORRIFY BE LIP SADNESS**, paired p49: **WE TXT OH RICO NOVELS THE PARK IOWA**; p5: **ASSERTING DAY EACH BANNOCKS PITY SYLVAN OATH** paired p49: **THING WAS AU THINK HEAVERS IT FAUT**; p48: **PESTEWING MET AB BARKER** paired p49: **KID REEK SPIRAL LOBBY**; p46: **WIND WATCH SITE SAW ARCH EVE VEIL ON HIM** paired p49: **THE AND THE LORD RANULA AS NOTHING**. All are pure speculative source-vocabulary assignments under a demonstrably unsupported cipher model, **not genuine recovered plaintext**.

Six source-shaped native-English positives using the same full word interval geometry, independently planted additive GP29 or nonzero five-bit XOR shared keys, **pass 6/6**, with exact no-altered-boundary re-encryption. [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45050265699); reproducible Windows11 CommonJS [single-file all-book SFT](../sims/lp2_allbook_page_reset_native_word_csp_sft.cjs).

**Mechanistic consequence.** The original book rejects a globally or pairwise repeated *page-start* five-bit XOR pad under native-English preserved whole words. Only four additive p49 pairs remain lexically feasible, without coherent prose or source-selected keys. This is a decisive limitation of these concrete repeated-pad reset architectures; it does not exclude different keys per page, different clocks, segmentation-changing ciphers or other languages.

## Key-free alphabet theorem: a global five-bit XOR pad would leave most LP2 ciphertext untouched

The same 29-symbol alphabet provides a **stronger conclusion independent of any English dictionary** for the narrow **one XOR key repeated at first black rune on *all* 55 unknown runic pages**. Literal XOR is a five-bit operation, so at every page-local body-rune position `i`, a potential common key `k_i` must satisfy `0 <= C_page[i] XOR k_i <= 28` for every one of the original pages still having a rune at position `i`. Intersect all 32 candidate five-bit keys with the real source GP ordinal tapes; this is a deterministic statement even if the hidden key schedule is arbitrary and cryptographically perfect.

Exactly **185 of the 277** aligned ordinal slots permit **only `k_i=0`**. Among the first 66 common body positions, **56** force zero, and among the first 150, **118** force zero. The resulting compulsory plaintext identity affects **9,138 of the 12,844** original unknown-page black-body runes (**71.146%**). Their ciphertext/source-GP coincidence index is **0.0345253461**, typical of the original encrypted register, and the longest adjacent mandatory-identity spans are **16 positions from body offset34**, **13 from offset110**, and **10 from offset12**.

Stronger and immediately interpretable with the **same frozen 32,196-lexeme English control**: of **2,796 complete interior source-printed words** considered, **883 entire words** lie in regions where all their hypothetical XOR key bytes must equal zero. **594** of those forced unencrypted words contain at least three GP runes; only **10/594** exactly equal any GP-native source-English word sequence in the frozen four-source vocabulary. This lexical count is illustrative and corpus-dependent, while the **9,138 exact forced unaltered rune values require no lexicon**. It is not genuine plaintext recovery; it exposes why this particular global-key model cannot plausibly have encrypted the manuscript's ordinary text.

This alphabet-only theorem does **not** extend automatically to a different XOR key per page or per small chapter. For example, restricting the same original calculation to just the 15 rune-bearing floral pages yields **zero slots forced to key0**; the separate exact original whole-word CSP exclusion above is needed for that more permissive within-chapter hypothesis.

All 55 source files, 29-rune domain checks, page-accurate red-heading starts, the entire 883-word count, **217,106 source-GP native positive runes**, a **nonzero valid shared XOR planted key** and every forward/inverse equality are independently asserted by a single Windows11 CommonJS SFT. [Verified Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45051164652) · [all-book five-bit XOR alphabet-domain proof](../sims/lp2_allbook_xor_sharedpad_zero_key_forcing_sft.cjs). No high-entropy secret, decoder, unknown plaintext or intended onward location was recovered.

## Mechanistic conclusion and next research decision

Identical floral decoration alone selects no reusable key. The complete original corpus weakens a page-reset GP29 additive pad through familywise-unexceptional scores and 103/105 pairs failing exact source-native word constraints; the two short-p49 additive survivors produce no readable English. The separate five-bit XOR pad hypothesis fails exact native-word assignment on **all 1,485** original unknown-page pairs. The broader additive model leaves only four short-p49 lexical edge cases, none giving coherent prose. A new experiment should **require an independently printed/authenticated indication of shared state, a source-selected cryptographic operation other than these rejected reset modes, or an externally recoverable key**, and then predict untouched original source pages with a full reversible inverse. Free reset offsets and newly fitted vocabulary phrases should not be commissioned from these results.

The motif, physical headings, original word shapes, table split, and the unusual p49 short section remain genuine observations, independent of whether any part of the shared-key hypothesis is correct.
