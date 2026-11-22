# Flower-framed LP2 pages: page-start key reuse and native-word plaintext constraints

**Agent41 · 22 November 2026 · original-cipher decision.** No plaintext, genuine encryption key, decoder, or continuation endpoint recovered. The flower-frame motif motivates one narrow possibility: all physical pages 40–55 might start the **same additive GP29 pad** at their first black rune, with the two original red headings outside the clock. The tests below reject this as a credible explanation of ordinary GP-native English text with unchanged original printed word boundaries. They do not exclude separate page keys, nonadditive ciphers, alternative source registers, or a historically selected reset rule that differs from this one.

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

## Mechanistic conclusion and next research decision

Identical floral decoration alone does not select a shared page-start additive pad. The complete original corpus weakens that proposal by both the familywise evidence score and 103/105 pairs failing exact source-native word constraints. The two lexicon-compatible short-p49 pairs yield no readable native prose. A new experiment should **require an independently printed/authenticated indication of shared state, a different cryptographic operation, or an externally recoverable key**, and then predict untouched original source pages with a full reversible inverse. Free reset offsets and newly fitted vocabulary phrases should not be commissioned from these results.

The motif, physical headings, original word shapes, table split, and the unusual p49 short section remain genuine observations, independent of whether any part of the shared-key hypothesis is correct.
