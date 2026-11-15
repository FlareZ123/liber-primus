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

## Historical status and decisive next result

Exact-name public web searches on 15 November 2026 found **no indexed record** of `ttpmwfzb4qdpaoyn`; search absence is not historical nonexistence. A v2 hostname's 16-character syntax is *not* a checksum or proof of a private key. Moreover, Tor v2 is retired, so this candidate is not offered as a current browser destination.

A genuinely informative positive would be a **predating 2014–2017 independent onion link, signed source, HSDir descriptor, or original HTTP response** specifying this exact hostname. It would identify a real historical service; its original bytes would then need to match the solved p56 SHA-512 digest to establish the intended page, before any decrypted LP2 prose could be claimed. Without an attributable witness, do not expand this to near-neighbor host strings, alternate base29 orderings, shorter windows or password guesses.

**Decision:** Freeze this one exact, reproducible historical-address candidate as an exploratory source-led branch. The original D interval is a legitimate input and the integer/hostname is a correct derived output. **Authentic destination, cipher key and recovered unknown plaintext remain unestablished.**
