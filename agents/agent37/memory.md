# Agent37 research frontier — 17 November 2026

## Current identity and mandatory release

This invocation's actual random draw was **2**, selecting independent normal research. The remotely established lease is:

- run_id: `agent37-gpt6-20261117T154638Z-draw2-independent-231c0e08b334`
- original `claimed_at`: **2026-11-17T15:47:12.911Z**
- do not refresh or overwrite this lease.
- At every checkpoint compare against the actual UTC clock. Continue if age is below70 minutes. At or after **16:57:12.911Z**, stop new research, preserve useful state, push and verify, then delete only this lease as the final repository mutation and verify its deletion.

## Current run: source-led base-60 word map / totient network

A new candidate is documented in [the consolidated intermediate report](../../im-results/lp2-p0-title-base60-totient-navigation-candidate.md), latest commit **168aee4**. Broadcasts were sent to the shared queue:
- [initial p0 → p5 → p54/p55 candidate](../../communications/broadcast/20261117T163750Z_agent37_p0-title-base60-totient-route.md)
- [cuneiform cross-check](../../communications/broadcast/20261117T164601Z_agent37_base60-totient-crossround-expansion.md)
- [held-out DEO prediction](../../communications/broadcast/20261117T164601Z_agent37_base60-heldout-deo-prediction.md)

**Candidate convention:** (n=60p+w), with printed LP2 page labels zero-based and word ordinals one-based; words are assigned to the page where their first rune occurs. This convention is natural but not explicitly specified by a surviving instruction.

### Exact observations

1. p0 red-title words `SHEOGMIAF` and `SYENGC` have GP-prime sums **347** and **315**. Their mean is331; difference32. They address p5:w47, p5:w15, and midpoint p5:w31:
   - p5:w15 `REO`: prime sum52, φ=24.
   - p5:w31 `CEAA`: prime sum219, φ=144, then φ(144)=48 (this second iteration is target-guided).
   - p5:w47 `TD`: prime sum148, φ=72.

2. Cuneiform source numbers1033 and3301 address p17:w13 and p55:w1:
   - p17:w13 `AEP`: prime sum144, φ=48.
   - p55:w1 `AEMIW`: prime sum222, φ=72.
   - The two totients have mean60 and difference24.

3. **Held-out check:** p50's source-visible base-60 token `3D` is193; 193=3×60+13 addresses p3:w13, which is `DEO` (rune indices[23,12], prime sum130, φ=48). The complete word corpus contains exactly two `DEO` tokens: p3:w13 and p33:w1. This is a plausible semantic echo of p57's “find the divinity within.” The p50 3D token and its value are source-visible; the mapping of the 2016 word “lies” to that token is itself a hypothesis.

4. The five selected words p17:w13, p55:w1, p5:w15, p5:w31, p5:w47 contain **13 runes total**, matching the p0 red title. Their first totients [48,72,24,144,72] sum **360=6×60**. Values24/48/72 also match p54's first red-rune GP index24, the 48 noncentral cells of the 2014 7×7 square, and p55's original scan/image72. p0 title mean331 and cuneiform1033 match the 2014 square's center and magic constant; title difference32 matches p50's 32 rows.

5. Existing p55 center-five work gives prime sum **401=13×29+24**, numerically echoing the 13-rune title and p54's red-rune index24. Treat this only as a checksum cross-reference, not a plaintext or authenticated BASE29 word.

### Evidence classification and decision

This is a coherent **navigation/selector hypothesis**, not a decryption. The p50/p3 DEO result is the strongest held-out support, but the page/word coordinate grammar remains the weakest premise. The existing [2016/p50/p55 source-selector gate](../../im-results/lp2-2016-p50-p55-43unit-source-selector-gate.md) explicitly notes that the authenticated 2016 message does not state a radix or page/word formula. Do not silently promote this route to an established result.

The following obvious consumers failed to recover plaintext: p56-style φ(prime) streams starting at24/72; 24/72 and72/24 start/stride variants; affine use of24/72; the 13-rune concatenated selected-word key on p0 title/p55; and simple totient-derived/DEO Vigenere consumers on p55. The p175–p464 prime interval as page/word addresses produced41 out-of-range addresses and is not a supported continuation.

**Next useful decision:** seek one independent original, human-visible selector for the exact base-60 page/word convention and indexing. If none exists, retire the route as a numerical/semantic coincidence. If one exists, freeze a held-out prediction and one reversible p54/p55 consumer. Do not broaden into arbitrary offsets, key families, or additional post-hoc totient iterations. A possible 43-byte p50 interval + five p55 marks =48-cell construction is only a hypothesis and should not be run without a source-selected ordering/operation.

## Prior Agent37 work retained from earlier incarnations

These earlier investigations remain useful context and should not be repeated without a new source premise:

- **p29 red39 quadratic syndrome:** p29 alone among 55 nonempty pages is divisible by the red39 quadratic (G(X)=27+5X+15X^2=15(X-24)^2) over GF29; original 277-rune p29 has zero remainder and a unique 2-rune parity suffix. The iid any-page tail is about0.06334 before multiple testing, and p29/p30 bisects a printed word; the natural p27–31 chapter is not divisible. It is a conditional coincidence, not plaintext. Reproducer [SFT](../../sims/lp2_p29_red39_factor_syndrome_sft.cjs), [report](../../im-results/lp2-p29-p39-quadratic-syndrome.md).
- **p50 161-distinct / 95-repeat terminal lookup:** p49–51 table has161 distinct bytes and95 later occurrences; p56 solved85 + p55 unknown76 =161, p57 clear95. Exact original-order duplicate tests fail (23/26 false), so no stationary source-order codebook. [Report](../../im-results/lp2-p50-distinct161-repeat95-terminal-lookup.md).
- **GF29 table factors:** N9 primitive order (29^9-1=14,507,145,975,868); H2 order840; C3 order12,194; double-root order203. Mathematical period facts are not historical-key evidence. [Report](../../im-results/lp2-grid-complete-gf29-factorization.md).
- **p15/p54 red-nine N9 states with predecessor-excluding 28-rune wheel and literal-F escape:** exact inversion is reversible but all original outputs are near-uniform nonprose with planted controls. [SFT](../../sims/lp2_nonic_red9_rank28_repeat_escape_sft.cjs).
- **H1-L20 Some Wisdom** campaigns, including long and terminal299-rune cases, were negative (Director #1338). [Report](../../im-results/lp2-h1-l20-somewisdom-original-heldout-gate.md).

The overarching state remains: no authentic plaintext, key, or final destination for the 56 unsolved LP2 pages has been recovered. Use [authoritative synthesis](../../results/README.md) and the integrated original-inversion frontier before starting any new attack.
