# 2015 p0–2 prime-difference register: standard GP29 move-to-front gives no unknown plaintext

**Agent 9 · 18 November 2026 · Director #1468.** Frozen source-selected 29-rune MTF investigation, exact reversible negative on genuine 729-rune first chapter. No unknown LP2 plaintext or authentic key was recovered.

## Source and new operation

The February 4–5, 2015 original `#cicadasolvers` IRC witness reported a specific operation on the first three LP2 physical pages: an imagined leading GP F=0, beginning prime 2, negative prime shifts and consecutive differences. It reported **40 adjacent equal transformed values**, reproduced exactly by the [canonical original witness](lp2-2015-prime-delta-40-doublet-source-inversion.md). The original 729 source rune indices are C, with primes p0=2,p1=3:

`S[-1]=−2 mod29; S[i]=C[i]−p[i+1] mod29; D[i]=S[i]−S[i−1] mod29.`

This is an exact reversible *participant-proposed* preprocessing operation. It yields 729 rank-sized D symbols, **40/728 equal adjacent pairs** and IoC **0.03450459006014561**, independently locked to the original 2015 account. Its inventor did not demonstrate a source-authenticated plaintext. Cicada's 2014 Stage08 used bzip2; standard bzip2 uses move-to-front (MTF) ranks in its internal pipeline, a plausible player-visible reason to try this operation. The bzip2 connection is conjectural because the 2015 witness does **not** say to run MTF or BWT.

## Frozen second stage and exact source results

Use the **unmodified Gematria Primus index order 0–28** as the initial 29-entry MTF list. For each incoming D[i], the ordinary rank decoder outputs list[D[i]] then moves that entry to the front. The source-natural rival interprets D as a direct rune stream and applies standard MTF *encoding* to get output ranks. Each is tested as one continuous p0–2 chapter (729 symbols) or reset exactly at printed physical p1 and p2 starts, original rune offsets **262** and **528**. These four predeclared alternatives require no key, guessed primary index, scoring search, punctuation editing or fit to the original ciphertext.

| Interpretation | Reset | Full 729-rune output IoC | Equal adjacent outputs |
| --- | --- | ---: | ---: |
| MTF **decode D as ranks** | Chapter only | 0.034783460709386635 | 21 |
| MTF decode D as ranks | Each original physical page | 0.03443298813669184 | 21 |
| MTF **encode D as runes** | Chapter only | 0.035262063039840814 | 32 |
| MTF encode D as runes | Each original physical page | 0.035567313345091126 | 31 |

The first **150 consecutive original-rune MTF decoded symbols**, in exact source GP transliteration, are:

`XLGHGCUIAOTHEOEAFMEOPIAETHIAPTHRYAELIATHHTUJRATHYJJFFTAEEAIAAERXBMEOCBIANGNGYBIAOETAEMRNDEOETTHTJCNLECTCEAEAJPTJREWMLNGPHIAMHTHJFTHIALRXPGEOTHHFXCIAPXBFITHCNGWAECNGLUMWLNGRIALCMIASYJSPETONIAEASEA`.

The inverse-orientation MTF encoder's first 150 is:

`XLIEOCEOJIATHFBEATAXOEOEHMNEEOEJLTHXTHTHEOXANWWBINGWUEOBJUPILYEFTHMHEAIAERFLAEEOJUEAMFIFEOAUYODUJAGGXDEADNGXRBEBNIAOEIAXIEYMORWPRIEOSYCBITPTHIMJEOAENGYNXHFOGEAEOROEOENGOICTHAHEADPTEAGIAMUJIA`.

The page resets occur after these first 150, so neither choice changes that independent prefix. No 150-rune grammatical source paragraph appears. All four 729-rune outputs retain near-uniform IoC. Independently sourced 729-rune genuine native-GP English windows have IoCs at least **0.055623 (Gibran, 547 windows)**, **0.053385 (Shakespeare, 1,915 windows)** and **0.054904 (Emerson, 2,838 windows)** using fixed stride 113. These controls give linguistic scale, with no hypothesis-fitting or postselected sampling.

## Key-independent BWT rejection over all primary indices (Agent28, 18 November)

The existing first-stage witness is an exact 729-symbol 29-rune register whose **index of coincidence is 0.03450459006014561**. A standard Burrows–Wheeler transform and its inverse rearrange the input symbols; they do **not** change how often any GP rune occurs. Thus every BWT primary row, with or without a known sentinel, preserves the entire first-stage D histogram and its IoC. No enumeration of 729 candidate row indices is needed to make this full-span decision. The same observation applies when an independent standard BWT inverse is placed after any of the four already tested MTF outputs, since those four whole-chapter histograms are fixed too.

For a more conservative comparison than IoC alone, a full 729-rune BWT inverse is constrained to exactly the same **29-symbol multiset** as its input. For a pinned 729-rune native-English control window, at least half the sum of the 29 absolute frequency-count differences must be replaced by other rune values to equal that multiset. This is a lower bound on symbol substitutions, regardless of where the BWT places those runes. Exhausting the **same 5,300 independent source-native windows** already used in this report (Gibran 547, Shakespeare 1,915, Emerson 2,838; stride113, fixed GP spelling) yields the following nearest possible native-reference lower bounds:

| Fixed 729-symbol input to a hypothetical BWT inverse | Input IoC | Minimum substitutions to Gibran | Shakespeare | Emerson |
| --- | ---: | ---: | ---: | ---: |
| Historical 2015 D | 0.03450459 | **243** | **225** | **235** |
| MTF rank-decode, chapter clock | 0.03478346 | 252 | 242 | 248 |
| MTF rank-decode, original-page reset | 0.03443299 | 239 | 228 | 227 |
| MTF rank-encode, chapter clock | 0.03526206 | 245 | 244 | 247 |
| MTF rank-encode, original-page reset | 0.03556731 | 242 | 240 | 244 |

The source-original historical D register has **27 GP E runes out of 729**; the three reference corpora's 729-runic windows contain E in ranges **59–116**, **53–119**, and **61–123**, respectively. This concrete alphabet imbalance also persists under every BWT row choice. The table's stronger multiset bounds are checked by the revised [same CommonJS original-source reproducer](../sims/lp2_2015_primeD_mtf_source_original_sft.cjs), which asserts the five fixed minima against all 5,300 source controls. No unknown LP2 key or plaintext has been claimed.

**Consequence:** a BWT inverse, by itself or directly following any one of the frozen MTF conversions, cannot turn the **entire original 729-symbol source register** into ordinary GP29 English resembling these independently solved-source-calibrated controls, at any secret primary index. This does **not** exclude an isolated shorter grammatical subpassage amid random output, transformed orthography, binary data, a different source register or a subsequent value-changing decipherment stage. The argument is an exact all-row character-frequency invariant plus measured control-language separation, not a universal proof about all conceivable plaintexts.

## Reversible positive and decision

The standalone [Node22 CommonJS original-cipher SFT](../sims/lp2_2015_primeD_mtf_source_original_sft.cjs) asserts the full original 729-rune prime-difference reconstruction against its inverse, reproduces the 40 originally witnessed repeats, verifies each of all four 729-output MTF orientations by exact inverse replay, and encodes/decodes a **729-rune source-native English positive**, including a repeated-rank alphabet-state transition. It completed successfully on [Windows CI run 44296863093](https://github.com/FlareZ123/liber-primus/actions/runs/44296863093).

**Narrow conclusion:** the **standard** 29-symbol GP-MTF update, either output interpretation and either source-obvious reset, fails to reveal English from the original source-matched 2015 D tape. The original participant observation remains an exact historical match and a valid intermediate, while MTF is an *unverified extension* with no new plaintext. The direct BWT-only extension is additionally excluded as a **full-span native-GP-English inverse for every possible primary index** by the histogram invariant and source-native multiset bounds above. A primary index or sentinel would still be required to compute one ordered BWT inverse, but it cannot change that complete-register character inventory. Retire the four source-simple MTF variants and the proposed BWT-only full-chapter English recovery; reopen with a source-authenticated value-changing second-stage decoder or a genuinely different intermediate register.
