# LP2 printed-word alternatives: uncompressed Latin lengths and scrambled adjacency

**Status:** exact original-source observation and calibrated, language-conditional discriminator. **No unknown plaintext, key, or reversible LP2 decipherment has been recovered.**

## Why this changes the research choice

The earlier [native-GP word-length comparison](lp2-original-wordlength-two-rune-native-register-gate.md) correctly found that the original manuscript's **2,896 complete words** contain **448 two-rune words**, whereas none of 140,387 English control windows transliterated into *solved-Cicada Gematria Primus ligature spelling* has so few. That does **not** establish that LP2 encrypts the printed word boundaries. A second simple mechanism retains the printed boundary slots while treating the underlying plaintext as ordinary, **uncontracted Latin characters**. For example, `THE` has three Latin letters but two solved-GP runes (`TH E`); `ING` has three Latin letters but one solved-GP rune. The original 29-glyph ciphertext alphabet need not reveal which representation was used before encryption.

This is a genuine counterexample to the *word-length inference*, even though it is not a cipher and the historical LP1/solved-LP2 source itself uses GP ligatures. No first-party clue yet chooses uncontracted text, and other source-independent all-secret cipher exclusions still apply within their declared models.

## Frozen source and procedure

- Original: all **12,956 rune symbols** on physical LP2 p0–55, with **2,896 complete printed words**, including the 32 cross-page words, parsed from `resources/liber-primus/lp2-transcription.txt` and cross-checked against `lp2-corpus.json`. Original word-length histogram at lengths1–14: **[83, 448, 720, 513, 317, 256, 216, 156, 78, 52, 32, 18, 4, 3]**.
- Controls, unchanged pinned source files: `resources/control/shakespeare_first300k.txt`, `gibran_prophet_58585.txt`, `emerson_essays_2944.txt`. Original contiguous windows of exactly **2,896 words**, without resampling their order.
- Representation A (**uncompressed**): one Latin character = one hypothetical plaintext rune slot, with length unaffected by letter-folding K/Q→C, V→U, Z→S.
- Representation B (**native GP**, first-party solved orthography): greedy historical ligatures `ING`, `IO`, `TH`, `NG`, `EO`, `OE`, `AE`, `IA`, `EA`, with the same standard letter folds. The native minima reproduce the earlier independent study's **527/612/711**.

| Independent corpus | Exact windows | Native GP: minimum two-rune count | Raw Latin: minimum two-letter count | Raw Latin windows with two-letter count ≤448 |
|---|---:|---:|---:|---:|
| Shakespeare | 52,512 | 527 | **420** | **5,946** |
| Gibran | 12,838 | 612 | **409** | **2,788** |
| Emerson | 75,037 | 711 | **508** | **0** |

Gibran also has **2,725** raw-Latin windows meeting the original's *two separate* upper counts, ≤448 length-two and ≤83 length-one words. Shakespeare has none meeting both, and Emerson has none meeting the two-letter count alone. These windows overlap heavily; the counts are finite witness existence, **not independent significance trials**.

**Interpretation:** native GP transliteration by itself creates a major shortage of two-letter words relative to the printed ciphertext; uncontracted Latin does not do so across every real literary donor. Thus the raw two-word marginal *cannot select* a moving-space cipher over an intact-boundary encrypted-Latin hypothesis. It does not demonstrate the latter.

## Independent ordering test rejects the simplest intact-plaintext reading

A real untouched prose sequence usually retains dependencies in **consecutive word lengths**, even when letter values are encrypted. To test this without ciphertext-language fitting, train a smoothed 16-state bigram `P(length_next | length_prev)` on *two* independently pinned donor texts (lengths 1–14 plus 15+), and compare against the singleton model `P(length_next)`. Evaluate the full LP2 printed length sequence and contiguous 2,896-word windows from the *third, held-out* donor. The score is log-likelihood gain in **nats per adjacent word pair**, with add-0.5 smoothing and no plaintext/ciphertext fitting.

| Held-out donor | Original raw-Latin length-order score | Minimum checked 2,896-word held-out window | Difference |
|---|---:|---:|---:|
| Shakespeare | −0.04347 | −0.02598 | Original lower |
| Gibran | −0.02833 | +0.01048 | Original lower |
| Emerson | −0.01766 | +0.01138 | Original lower |

The manuscript also scores approximately like **256 fixed-seed within-book permutations of its own word-length multiset** (z values about −0.49, −0.49, −0.57 with three alternate two-donor training choices). All three controls preserve word lengths and punctuation naturally in their own source text; the original source supplies only lengths. This is **independent of which ciphertext rune values are mapped to plaintext letters**. It extends the previously reported [source mutual-information observation](../workplace/integrated-original-inversion-challenge.md) that printed word lengths are nearly independent.

**Independent first-party author-style positive control:** An editor-normalized excerpt from the *actually solved LP1 Liber Primus* in `resources/liber-primus/lp1-plaintext-reference.txt` contains **761 Latin-letter words** after removing source headings, numeric rows and editorial annotations. With a separate model trained on all three pinned secular donors, the genuinely solved LP1 text scores **+0.002465 nats/adjacent length pair**, **3.407** standard deviations above 1,000 fixed-seed permutations of *its own* 761 original word lengths. On the identical model, **every one of the 2,136 contiguous 761-word unknown-LP2 windows scores lower** (original maximum **−0.009660**, minimum −0.043713). This directly addresses the strongest control objection that the original 2014 author's distinctive spiritual/aphoristic style might have little word-length grammar; the authentic solved text retains it. The short solved reference is editorially normalized and not an exhaustive first-party literary distribution, so a different unknown text style remains possible. **This does not recover the missing permutation, source formatting rule, or plaintext.** [Updated Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45130510021).

**Eight deliberately small manuscript-layout operations** were also tested on the original printed line groups: as printed, reverse each line, reverse odd/even lines, reverse the order of lines, read vertical columns top/bottom, or alternate column direction. None restored source-typical adjacent-length grammar across both independent original page scopes **p16–21** and **p40–53**; the vertical-column family makes the held-out score worse (≈−0.041 vs ≈−0.030 as printed). A mild increase for reversed line order remains far below native controls. This excludes only these exact orderings as a useful self-evident solution step, not every imaginable transposition.

## Raw-Latin whole-word cipher gate: a second invariant changes the decision

The original source contains **30,281 possible unordered within-word position pairs**, with **811 actual same-symbol pairs** across its exact 2,896 printed complete words. This is lower even than the **1,044.17** expected from independent uniform GP29 symbols conditioned on the *same original lengths*. Existing native-GP evidence already identified this unusually low word-internal collision count; the present new test explicitly removes the **solved-GP ligature assumption** and uses ordinary uncompressed Latin words, which are the strongest alternative to moving printed spaces.

For a source word `w`, define `E(w) = Σ_g count_w(g)(count_w(g)−1)/2`. Any deterministic single-valued letter substitution inside that word preserves or increases `E(w)`; even a many-to-one alphabet cannot split identical plaintext letters. Any permutation of its letter positions preserves `E(w)` exactly. Reordering entire words also preserves `Σ E(w)`. These are **all-secret**, algebraic invariants with no key fit, and the SFT tests a distinct private Caesar map for each word as a positive.

The following are **independent original-length-conditioned source-language controls**: for each of the 14 observed original word lengths, calculate the actual uncompressed Latin donor's mean and variance of `E(w)`, multiply by the original number of length slots, then sum. All source word lengths 1–14 have donor witnesses.

| Uncompressed source | Original ciphertext E | Expected source E | Conditional SD | Standardized gap |
|---|---:|---:|---:|---:|
| Shakespeare | **811** | 1,297.679 | 33.834 | −14.384 |
| Gibran | **811** | 1,296.524 | 33.878 | −14.332 |
| Emerson | **811** | 1,315.300 | 33.681 | −14.973 |
| Editor-normalized genuinely solved LP1 | **811** | 1,377.925 | 34.544 | −16.412 |

The standardized gaps reflect the **specified conditional independent-word resampling model**, with source-word repetitions and short solved-LP1 length-14 samples; they are descriptive, not proof of a universal impossibility for specially constructed language. The original author-authentic solved sample supports the gap with independent 761-word vocabulary; the earlier [GP-ligature-native all-secret invariants](lp2-wordinner-equality-multiplicity-allsecret-gate.md) give a separate register.

**Causal conclusion:** The earlier uncompressed-Latin two-letter marginal match is real, yet **uncompressed orthography alone, arbitrary whole-word reordering and any fixed word-local substitution cannot account for the printed ciphertext's word-internal equality deficit** on these source-language controls. A viable intact-boundary Latin decoder must use a changing position/state-sensitive letter encoder, a one-to-many mapping, or other explicit operation altering within-word equality. A segmentation-changing decoder could also escape. This narrows the alternative *without* inventing an unconstrained codebook or asserting that literal spaces are false.

[Updated Windows Node22 PASS, including exact 811/2,896-rune-word original invariant and four raw-Latin controls](https://github.com/FlareZ123/liber-primus/actions/runs/45133126986).

## Causal research decision

1. **Keep two rivals alive:** (a) ciphertext spaces have been deliberately moved/encoded, and (b) printed whole-word lengths reflect uncompressed source text whose words were reordered or otherwise deliberately padded/modified. A fixed raw-Latin orthography explains the former word-count exclusion but by itself **does not explain absent adjacent-word grammar**.
2. A real next decipherment proposal must supply a **source-selected lossless inverse for boundary positions or word order**, predict untouched plaintext using original rune values, and preserve the four original apostrophes as actual source ink rather than post-selecting contractions.
3. Do **not** infer author intent from the 29-letter alphabet or from these corpus fits; **do not** repeat the previous GP-ligature 2-word-count gate as proof of ciphered spaces. The ciphertext's anti-repeat effect spans word boundaries and requires separate explanation.

**Reproduction:** [read-only Node22 CommonJS original-source SFT](../sims/lp2_uncontracted_latin_wordorder_sft.cjs), [updated Windows Node22 Actions PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45130510021). Every original count, all 140,387 source windows, all native-LP encoding controls, the independent 761-word authentic solved-LP1 test, and the held-out predictive scores are recomputed from checked-in inputs.
