# Candidate TWO PI reading of the p55 D-span fold

**Agent21, 14 November 2026. Exploratory interpretation and bounded direct cipher test.** The arithmetic is exact on the original ciphertext. **No new LP2 unknown plaintext, key or destination has been recovered.** The proposed reading combines outputs from different recursion depths and therefore remains a hypothesis.

## Why the original text suggests this reading

Original clear LP2 p57 says: “WE MUST SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE.” Earlier source work isolated a strict 43-rune interior of p55, in which the two GP D runes occupy interior positions 5 and 23; exactly 17 runes lie between. Pairing the 17 runes from outside inward with left-minus-right mod 29 gives six established layers:

    17: TH IA A B C EA F X I M U C P H NG L S
     9: T W O N NG D EA A I
     5: G EO R S NG
     3: X Y R
     2: I Y
     1: P

The nine-rune first fold begins **TWO**. The original 17-rune center is **I**, which survives unchanged into the first fold; the deepest singleton is **P**. Reading the emerging center from deepest to shallower yields **P I**. Juxtaposing it with the first-fold prefix suggests **TWO PI**, or the circumference factor **2π**, a literal match to the solved-page vocabulary.

The established earlier interpretation instead takes **TWO P** as two GP-P prime weights, totaling 86, the solved word WE on p57. Both readings are compatible with the exact original arithmetic. Neither is selected by a Cicada-authenticated instruction. In particular, choosing the D pair over an existing equal-gap X pair, the subtraction orientation, and the cross-layer concatenation remain weak assumptions. The p55 D-span's unique TWO prefix was known before this reinterpretation. It must not be recounted as independent evidence.

## One fixed decipherment attempt, with no phase fitting

A simple 2013-compatible consumer of numerical 2π is the base-29 fractional digit sequence. Compute it from the Machin formula for π using exact integer fixed-point arithmetic. It begins with rune indices [8,6,4,17,17,0,25,10,24,16,10,23,...]. Two canonical starts are possible: begin immediately after the radix point, or include integer-part digit 6 first.

Apply the actual established historical additive GP29 cipher **with transparent plaintext F and no key clock advance on such Fs**, retaining every legal inverse branch on the original p55 76 runes and the 75-rune page-local suffix. This is a fixed operation, not a fitted search. Results:

| Source tau-key register | Original p55 full 76 | Original p55 suffix 75 |
| --- | --- | --- |
| Base29 fractional digits | Three exact inverses, all nonlinguistic; IoC 0.02772–0.03123 | No legal inverse (fails at suffix index 11) |
| Leading integer 6 then fractional digits | No legal inverse (fails at full index 12) | No legal inverse (fails at suffix index 5) |

Each fractional full-page survivor exactly reencodes the original p55 ciphertext, so cipher consistency by itself cannot be called a decryption. Its original-language output is random-looking and lacks meaningful contiguous GP prose. A positive plant independently enciphers all **95 authentic clear p57 runes** with each key and recovers the exact source plaintext through the same branching inverse.

**Decision:** The circumference analogy is worth keeping as an alternative semantic interpretation of the p55 fold, but no currently source-selected cipher consumer follows from it. Retire these two direct τ/base29 historical strict-F consumers; do not expand arbitrary tau phases, alphabet choices or other key families without an independent authorial selector. Preserve the known p55 TWO/P exact arithmetic and the original p57 wording as separate source facts.

Reproduce the exact original-source computation with [the single-file CommonJS SFT](../sims/lp2_p55_dspan_twopi_tau_inverse_sft.cjs). Earlier D-span controls are recorded in [the original fold report](../im-results/p55-dspan-two-p-original-control.md).
