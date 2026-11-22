# A single 80-bit Tor-v2 address hypothesis from p55's 17-rune D interval

**15 November 2026, Agent49. Status: new exact source-derived locator candidate, unverified.** The source-constrained operation below yields **`ttpmwfzb4qdpaoyn.onion`**, but there is **no independent archival witness that this service existed or belonged to Cicada**. It recovers zero unknown manuscript plaintext and does not satisfy the solved p56 SHA-512 target. It must not be entered into `results/README.md` as a decipherment or verified destination.

## Specific author-visible path and its most uncertain premises

The authentic solved p57 urges readers to **shed their circumferences** and seek what is **within**. One already-published, fully image-consistent reading discards the first and last rune of each p55 printed word, preserving its 17 page-local word fragments and 43 strict interior runes. Among those 43 runes, two D markers at 1-based interior positions **5 and 23** contain exactly **17 GP29 symbols** between them. A separate X pair at positions 13 and 31 contains another 17. The D/X interval and proposed recursive TWO/P interpretation were established before this investigation in [the original fold report](../im-results/p55-dspan-two-p-original-control.md); do not count them as an independent new discovery.

The historically **signed January 2013 BASE29 example**, `3301 → 3QO` (digits [3,26,24]), defines ordinary positional base29 conversion. The 2014 puzzle used 16-character **Tor v2** hostnames, encoding **exactly 80 bits**. Sixteen GP29 digits cannot span the full 80-bit address space, while **17 are sufficient**. The immediately following original p56 plainly directs a solver toward a page on the *deep web*. Thus the finite proposal is to read the already selected D-bounded 17 symbols as one big-endian base29 integer, serialize **exactly 10 bytes**, and encode the result as one RFC4648 Base32 historical Tor-v2 hostname.

The important unproved bridges are that “circumferences” means stripping each printed word's outer runes, the *D* interval rather than X carries a URL, the 2013 BASE29 digit values should be identified with 2014 GP rune indices, and the intended result is a Tor identity instead of ordinary plaintext. No creator instruction confirms these assignments.

## Original-input calculation, with natural source controls

The exact interior 17-rune GP indices (D-to-D, endpoints excluded) are:

```text
2 27 24 17 5 28 0 14 10 19 1 5 13 8 21 20 15
```

Applying the single source-motivated positional conversion `N = Σ d[i] × 29^(16−i)` yields the 80-bit integer:

```text
740798982714805590178573
9c de cb 17 21 e4 06 f0 3b 0d
```

Ordinary RFC4648 Base32 on these **ten bytes**, leading bits preserved, is exactly:

```text
ttpmwfzb4qdpaoyn.onion
```

The conversion is **perfectly reversible** to all original 17 GP indices, as asserted by the test. It uses no fitted secret key, Unicode rune hash, English score, truncation, modulo-80-bit reduction, or selectable phase. The independent 2014 authenticated seven-onion chain does not include this hostname.

There are **exactly two equal-glyph boundaries separated by 18 original interior positions** on p55: D at (5,23) and X at (13,31). The D interval's N fits 80 bits; the X interval is **82 bits** and cannot be represented losslessly as a 16-character Tor-v2 label. This is a small finite discriminator within the two visually possible marker pairs, but does not establish authorial intent. Of all **27** possible 17-rune windows in the same p55 interior, **three** fit within the 80-bit address space (1-based starts 6,12,16); the D interval is the one independently bounded by matching glyphs. Any 17-digit base29 vector fits below 80 bits with probability about **0.166584** under a naive independent-uniform digit null; an 80-bit fit is consequently weak evidence by itself. The particular D interval starts with low-valued TH (=2), making the fit unsurprising.

Exact original-source, positive-numeral and inverse test: [standalone Node.js CommonJS SFT](../sims/lp2_p55_d17_base29_torv2_sft.cjs). It reads the checked-in GP29 corpus and original transcription, verifies all p55 glyphs, the D/X competing intervals, the reversible 80-bit conversion and historical 2013 BASE29 control.

## The adjacent solved-page selector and the original-book rival test

The *immediately following*, independently solved physical p56 says **“WITHIN THE DEEP WEB”** and directs the reader to a page elsewhere. Its opening letter **D** supplies an additional, although weak, human-visible reason to consider the **D** delimiters instead of the rival X: paired with the separately solved p57 instruction **“WE MUST SHED OUR OWN CIRCUMFERENCES”**, a human may be prompted to strip printed word boundaries and find an interior D-to-D payload. The source does **not** say “use D as an opening/closing marker”, so this is a candidate story, not an authenticated key-selection instruction. The 2013 signed BASE29 demonstration and historical 16-character onion format supply the proposed numeric decode. The p55 moth's identical p53 counterpart remains a genuine competing art selector.

A fresh original-only census freezes exactly that one transformation and tests **all 55 rune-bearing unsolved physical pages**, with **their own** page-local printed word interiors; the runeless p50 is skipped. Its result is a serious caution against claiming the D interval is globally unique:

| Frozen original-source comparison | Exact outcome |
| --- | ---: |
| All page-local 17-rune interior spans bounded by an identical glyph | **209** |
| Those 209 whose full positional GP29 integer fits losslessly into 80 bits | **42** |
| All 17-rune spans bounded specifically by D | **13** |
| D-bounded spans fitting 80 bits | **2**, p35 and p55 |
| Source-cloned-moth p53 | **2** equal-glyph spans; **zero** 80-bit fits |
| Candidate p55 | **2** equal-glyph spans; **one** 80-bit fit (D); X gives 82 bits |

The other book-wide valid D interval is **p35**, at 1-based strict-interior start16, integer hex `fc3571881b46757f423c`. Nothing on p35 independently says it should carry a historical deep-web destination; it still demonstrates that D/17/80 is not a unique fingerprint of p55. Conversely, **p55 has the single qualifying D span among the two identically illustrated moth pages p53/p55**. This geographic/semantic selection is plausible because the clear p56 deep-web text directly follows p55, but it is conditional on already choosing the final page and D from its neighboring plaintext.

**Runnable original-corpus control:** [55-page D17/Tor-v2 family census](../sims/lp2_p55_d17_torv2_original_book_control_sft.cjs). It asserts each original physical page's exact transcription against the independent corpus and reproduces the full 209/42/13/2 census, the specific alternative p35, both same-moth pages, and the candidate p55. This is a finite conditional source check, not evidence that the inferred URL was ever hosted.

## Historical status and decisive next result

Exact-name public web searches on 15 November 2026 found **no indexed record** of `ttpmwfzb4qdpaoyn`. A second, distinct **source-period web-archive index test** queried Arquivo.pt's original **2014–2016** CDX records for all HTTP/HTTPS forms of `.onion.to/` and `.onion.city/` prefix captures of (a) **p55 `ttpmwfzb4qdpaoyn`**, (b) its precisely computed book-wide **p35 D17 competitor `7q2xdca3iz2x6qr4`**, and (c) the independently authenticated 2014 distributor `ky2khlqdf7qdznac`. All **12/12** CDX requests returned HTTP200 with **zero captures**. The **same executable** first recovered **50** dated 2014 hits for a separately known ordinary Portuguese news domain `www.publico.pt`, demonstrating that the archive interface and its 2014 year filter were active. This is an **index-coverage limit**, not an exclusion of either original Tor service: the known genuine 2014 distributor also has zero captures in that selected gateway index. It gives **no original page bytes and zero p56 hash-preimage comparisons**. [One-source-dated-host original-input reproducer](../sims/lp2_p55_d17_torv2_archive_2014_cdx_sft.cjs); [successful Windows Node22 archive run 43705179646](https://github.com/FlareZ123/liber-primus/actions/runs/43705179646).

Neither web-search nor archive-index absence proves historical nonexistence. A v2 hostname's 16-character syntax is *not* a checksum or proof of a private key, and Tor v2 is retired, so this candidate is not offered as a current browser destination.

A genuinely informative positive would be a **predating 2014–2017 independent onion link, signed source, HSDir descriptor, or original HTTP response** specifying this exact hostname. It would identify a real historical service; its original bytes would then need to match the solved p56 SHA-512 digest to establish the intended page, before any decrypted LP2 prose could be claimed. Without an attributable witness, do not expand this to near-neighbor host strings, alternate base29 orderings, shorter windows or password guesses.

**Decision:** Freeze this one exact, reproducible historical-address candidate as an exploratory source-led branch. The original D interval is a legitimate input and the integer/hostname is a correct derived output. **Authentic destination, cipher key and recovered unknown plaintext remain unestablished.**
