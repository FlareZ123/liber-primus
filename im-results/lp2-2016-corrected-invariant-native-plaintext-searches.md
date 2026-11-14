# Original-source GP29 plaintext searches: historical invariant, long words and repeated moth

**Agent 3, 14 November 2026. Status: bounded keyless original-cipher tests, zero recovered LP2 plaintext.** These three independently implemented searches attempted actual unknown-page plaintext or original-runic source matches. Their negative outcomes constrain only specific operators/source registers; they do not identify a genuine decryptor.

## Source-selected mechanism and exact correction

An original [25 January 2016 mortlach forum post](https://cicada3301.boards.net/thread/12/case-shift-independent-text-analysis) (documented in [five original historical discussions](lp2-2015-2016-five-original-public-discussion-gate.md)) proposes **four-grams of absolute GP29 numerical differences** as a merit score invariant to all Caesar shifts and reversal. Its claimed invariant is **incorrect across cyclic wraparound**: adjacent rune indices (4,21) give ordinary absolute difference 17, but +10 mod29 yields (14,2), difference 12. The corrected 58-way invariant is

```text
d29(a,b) = min((b-a) mod29, (a-b) mod29)   // integer range 0..14
```

It is invariant under every affine map with slope +1 or −1, preserving exactly the historical proposed 58-element search collapse. It does **not** invert a nontrivial running key, identify any phase, or preserve the sign of consecutive differences.

## Direct experiment A: authentic source-selected motif pair p53/p55

The original moth image appears on both physical p53 and p55, giving a human-visible reason to test shared original text under different global alphabets. A completely key-independent join canonicalizes length-eight source windows under all invertible affine GP29 maps `x→a*x+b`, `a=1..28`, `b=0..28`. **No original p53/p55 eight-rune matches**, and **zero eight-rune cross-page matches anywhere in all 57 rune-bearing LP2 physical pages including solved p56 and p57**. A planted 20-rune affine-equivalent source passage recovers its exact length-eight fingerprint. The zero count does not exclude shared plaintext under position-dependent keys, non-affine bijections, or texts shorter than eight runes.

[Source original matching SFT](../sims/lp2_moth_sharedphrase_affine_original_sft.cjs) · [successful 43629284611](https://github.com/FlareZ123/liber-primus/actions/runs/43629284611).

## Direct experiment B: source-native complete long-word recovery

The authentic manuscript includes 2,896 printed words; **343 have at least eight GP runes**, maximum 14. A mixed dictionary of **14,937 distinct source-native GP English word forms** was built from original Gibran, Shakespeare, Emerson and the existing source-calibrated English word-frequency corpus, each mapped with the established 29-symbol GP ligatures. Each source word has a canonical complete-pattern fingerprint under all **812** affine GP29 alphabet maps (28 nonzero slopes × 29 shifts). Against the unchanged 343 long ciphertext words, **zero entire original words** match any native dictionary word under any such per-word affine map; **five** of the original long words are on moth pages 53 or 55. Thirty independently keyed native-GP word plants recover **30/30** exact originals under the same matcher. This is a native-English reference bound, not an exclusion of every possible invented word or multi-stage cipher.

[Complete direct word search](../sims/lp2_original_longword_affine_dictionary_recovery_sft.cjs) · [passing 43629992964](https://github.com/FlareZ123/liber-primus/actions/runs/43629992964).

## Direct experiment C: 2016 corrected historical scoring on 40-rune islands

The exact historical four-step-distance proposal, with `d29` corrected, was trained on disjoint 70% portions of GP-native Shakespeare, Gibran, Emerson and evaluated on the held-out 30%. Sliding 40-rune windows over the original 55 rune-bearing unknown pages, keeping physical page boundaries intact, yields **10,811** unknown windows. Source distribution: **4,548 disjoint held-out native windows**; first-percentile score **−11.05898**, native median **−10.18612**, native 99th percentile **−9.40099**; higher is better. The actual solved plaintext p57 has twelve original contiguous 40-rune windows at scores **−10.38146 to −10.16361**. Every one of **58** Caesar/reflection transforms of the source positive control preserves its distance-fourgram score exactly.

Original LP2 has **1,205/10,811** windows above the *bottom* one-percentile held-out native threshold; **only two overlapping windows** rank above the *worst* authentic p57 clear window. Both occur on original **p24 offsets 7–8**. The best source-uncued window p24 offset8 has distance score **−10.34749**, a plausible *invariant-only* false candidate. Crucially, deriving all **58 concrete GP29 phase plaintexts** from this *same frozen top window* under an independently trained full-rune trigram score yields best candidate `sign=−1, shift=8` with score **−11.62425** and readout `FUAEIANUEBUSUNPEAPOPTHBGLCUWTHBHOEFEADTEMGWTIA`. The adjacent 40 runes decoded with that identical phase fall further to **−13.01929**, incoherent; held-out native plaintext first-percentile is **−8.90364**, median **−7.89030**. The original *solved p57* 40-rune control correctly ranks identity/shift0 **first of all 58**, full-trigram score **−7.92841**, with transparent `PARABLELICETHEINSTARTUNNELNGTOTHESURFACEWEM`. Thus the invariant's isolated score cannot be promoted to an actual p24 plaintext island. No independently keyed native-language segment was identified.

[Corrected historical four-step scorer and complete 58-phase readout](../sims/lp2_2016_dihedral_ngram_original_plaintext_island_sft.cjs) · [successful original and phase-readout CI 43630907095](https://github.com/FlareZ123/liber-primus/actions/runs/43630907095).

## Direct experiment D: all-secret monoalphabetic source quotation recovery

As a stronger alternative to per-word affine and 40-rune Caesar/Atbash, a known-plaintext join allows **any one unknown global GP29 alphabet bijection per continuous snippet**. It canonicalizes the exact first-occurrence/equality pattern of 20 original rune positions, searches **11,911** unknown original page-contained 20-rune windows (11,894 distinct patterns), and matches against original GP-native **63,095 Gibran + 218,781 Shakespeare + 324,611 Emerson 20-rune windows**. Seven pattern matches occur, **all precisely 20 runes, none extends to rune 21 under one bijection**. Four are trivially 20-distinct-symbol patterns mapping to the same Emerson passage; the other three have 16–18 distinct symbols, also no extension. The matcher recovers a planted bijective 20-rune transformed sample and detects its one-symbol corruption.

This is an authentic attempted plaintext search that found no sustained source passage; equality patterns of all-distinct ciphertext symbols have little evidentiary weight by themselves.

[Arbitrary-secret 20-rune quote join](../sims/lp2_original_anyalphabet_20rune_knowntext_recovery_sft.cjs) · [successful original CI 43630770488](https://github.com/FlareZ123/liber-primus/actions/runs/43630770488).

## Research decision

The 2016 correction gives a reusable **valid prefilter** for source-fixed Caesar/reflected alphabets; any apparent high invariant score still requires a clear phase and a held-out continuation. All tested human-visible motif and direct source quotation routes have **zero recovered original p0–55 runes** and do not select a decoder. No case should be expanded into hidden fitted multipliers, arbitrary word exceptions or repeat source sweeps without an independent source instruction. Prioritize locating a source-selected state/key or an original encoded message in a different channel. No established-result promotion.
