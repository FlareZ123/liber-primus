# Original 2013 double-spaced prime residues match the first two LP2 p0 black runes

**16 November 2026, Agent32. Status: new source-pinned two-rune synchronization candidate, no authenticated plaintext, key or continuation.** The observed match is exact and has a reproducible original-source predicate. Its cryptographic interpretation is unestablished; a simple natural direct-key continuation is negative. Keep this in intermediate research until a third and longer *unfitted* prediction exists.

## Independently visible source and manuscript loci

A contemporary participant's 2013 first-onion `primes` paste, [xGY4pbHV](https://pastebin.com/raw/xGY4pbHV), retains exactly two conspicuous doubled spaces in its prime listing: `29  31` and `3257  3259`. Its exact 1,387 bytes are SHA256-pinned and its two anomalies independently reconstructed from the original 2013 CicadaOS prime-echo script in the already-established [source investigation](2013-first-onion-primes-xGY4pbHV-original-source.md). It is a participant document, **not authenticated original server code**. The extra spaces could be formatting artifacts: after 29 and 3257 are the original prime-list's 10th and 460th ordinals, ten-prime line endpoints, while 26 other captured complete ten-prime rows have no extra space.

The 26 January 2013 **Cicada-signed** server challenge independently demonstrates the operation `BASE29 3301 → 3QO`; [signed provenance](../resources/external/2013-tcp-server-signed-source.md). A player *could* select the **prime immediately after** each extra-space location, then take its low base-29 digit. This gives the completely determined source vector

```text
after-space primes          31        3259
low BASE29 digit         31 % 29    3259 % 29
GP29 numeric rune             2          11
GP transliteration            TH          J
```

The first physical LP2 page p0 (original `17.jpg`) has an **eight-red-rune + five-red-rune title**, a small intra-title red separator, then a prominent **13-dot red mark** at local rune boundary **13**. Immediately **after** that large marker the **first two black ciphertext runes are TH–J**, numerically **[2,11]**. The next original ciphertext rune is **G = 6**. This location and colour segmentation are established by the [16 Nov original-image correction](lp2-p0-red13-13dot-blackbody-original-source-adjudication.md) and are asserted against the canonical corpus and ink source in the reproducer.

**The new observation:** the original 2013 source vector [2,11] equals the 2014 first body-ciphertext pair immediately after the opening large punctuation mark. It is an exact alignment from two independently preserved artifacts, using an arithmetic operation genuinely known to Cicada's earlier puzzle. It is a potential visible marker/initial-state pointer, *not an inferred plaintext pair*.

## How much specificity does the match have?

Read every original unaltered still-unsolved p0–55 physical rune page and its existing large-punctuation annotations. **21** source-annotated marker instances have two following runes; these represent **20 distinct (page, offset) locations**, since p7 annotates the same offset in two colours. Exactly **one** marker-following pair equals [2,11]: **p0 offset13**, after the red13 marker. Across all 55 rune-bearing pages, there are **20 ordinary adjacent [2,11] occurrences**; p0 has another at offset118. Thus this is **boundary-local** and emphatically *not* a globally unique two-rune token.

The selection of the `after` values, the mod-29 reduction, the LP2 red13 boundary and the source archive are all plausible individual moves, but the source offers no independent instruction linking *these* spaces to this marker. The match was noticed after searching the material and cannot be assigned a simple 1/841 discovery p-value. Many source numbers, visual boundaries and candidate transformations have been explored historically. A chance correspondence remains a live alternative, particularly given the ten-prime formatting explanation.

## Fixed continuation tests on the original ciphertext

A literal continuation from the two spaced 2013 prime entries is immediately unsupported. The next ordinary displayed prime **after 31 is 37** (mod29 **8**); the next after 3259 is **3271** (mod29 **23**). The third unchanged p0 black ciphertext digit is **6**. Neither next prime's low BASE29 digit predicts it. The original two-digit synchronization cannot simply be extrapolated as a consecutive visible-prime stream.

For a separate inexpensive historically motivated operation, take the authentic solved-p56 key primitive `phi(prime) = prime−1 mod29` and initialize ordinary forward prime clocks *at the two marked values* **31** and **3259**. Decode unchanged original p0–2 ciphertext using GP29 addition/subtraction of (i) the first clock, (ii) the second, (iii) their sum, (iv) their difference or (v) alternating clocks. Grant three start boundaries: original rune0 (729 runes), immediately after original red13 (716), and after the two matching apparent anchor runes (714); both signs give **30 fixed, fully reversible original-cipher candidates**. This is an exploratory finite family, **not an authored command**.

All **30/30** outputs have ciphertext-like GP29 coincidence, with maximum **0.035243** (uniform reference 1/29 = 0.034483), versus **0.06271** for the authentic p57 95-rune solved native-GP text. No candidate yields a recovered English sentence or externally reproducible unknown-page plaintext. All **30/30** independently planted same-length native solved-GP passages encrypt and decrypt exactly under their respective frozen variants. These limited results rule out *these immediate* prime-clock transfers as straightforward solutions; they do not rule out the two-rune alignment as a synchronization clue for another mechanism.

## Decision and next falsifiable step

The exact correspondence is worth preserving precisely because it **selects two otherwise unremarkable source values and a uniquely visible original body boundary** without fitting a 729-rune decoder. Its weakest premise is that the 2013 two double spaces intentionally supply keys for 2014 rather than reflect terminal formatting. The match has no successful third-rune prediction.

A productive future continuation must first obtain a **source-selected reversible rule** that uses these two digits as an *initial state, location or key*, fixes its clock and reset before reading plaintext, and predicts at least the original **third black rune G** plus an independent, multiword original-cipher holdout with no fitted moves. One should preferably show a related source-fixed marker crossing on a second unsolved physical page or recover ordinary GP-native language. Absent that, archive the observation and return effort to independently supported source-material acquisition or other mechanisms. Do not launch unconstrained variants of 31/3259 KDFs on the strength of this two-rune equality.

**Reproducer:** [single-file CommonJS/Node22 original-input test](../sims/lp2_2013_spaced_primes_p0_firstblack_marker_sft.cjs) asserts the marker and all 21 locations, whole-book counts, primitive first-step contradictions and 30/30 exact synthetic forward inverses. [Passing Windows manual workflow 43821613908](https://github.com/FlareZ123/liber-primus/actions/runs/43821613908).
