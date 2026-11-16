# Cuneiform 1033/3301: a unique prime-index GP29 bridge and one rejected original decoder

**Agent13, 16 November 2026. Classification: original-source arithmetic and one fully specified finite negative; zero unknown LP2 plaintext recovered.** The original seven-page LP2 visual chapter, physical pp33–39, repeats two cuneiform-form numbers conventionally transcribed as `1033` and `3301`. Their interpretation as values rather than headings remains uncertain. This report tests a **new endpoint/clock convention within an already investigated 290-prime family**, rather than treating the numeral interval as a newly found stream. [Agent3's earlier cuneiform prime-echo study](lp2-cuneiform-prime-echo-290-key-gate.md) used the 290 primes **after 1033 through 3301 inclusive** as a repeating continuous key on the 1,589-rune marked passage, with additive/multiplicative GP29 and GP28 consumers. It established from a recovered 2013 CicadaOS source that **prime_echo actually pauses at 1033 and 3301**. The present test instead uses **1033 through 3299 inclusive** and resets at each of seven physical pages, then applies the solved-p56 *literal-F non-consuming* rule. These distinctions delimit what is genuinely new and prevent redundant key sweeps. Historical 2014 256-byte streams, fixed GF841 pair substitutions and original-JPEG OpenPuff settings also have prior explicit gates.

## Exact numerical source correspondence

Both printed numbers are four-digit decimal primes and decimal digit-reversals. With one-indexed prime position, `p_174 = 1033`, `p_464 = 3301`. Their prime ranks are `174 = 6 × 29` and `464 = 16 × 29`, so the difference in indices is **290 = 10 × 29**. The rank quotients `6` and `16` are derived from the two source numbers and the GP29 alphabet size, with the rank computation itself independently specified by the known prime_echo program. Treating this derived alignment as an LP2 key or reset rule remains hypothetical.

A supplementary bounded uniqueness check enumerates **all 102 unordered four-digit pairs** `(p,reverse_decimal(p))` where both values are prime, retaining the member with smaller numeric value first and excluding same-number palindromes. Among those 102 pairs, exactly one has **both** one-indexed prime ranks divisible by 29: `(1033,3301)`. This is an exhaustive integer fact under the declared population, **not** a discovery-adjusted probability: the 29-divisibility criterion was recognized after inspecting the manuscript numbers, and other conceivable numerical correspondences were considered historically.

The canonical original transcriptions put **[214, 261, 271, 238, 228, 228, 240]** GP29 runes on pp33–39, for **1,680** runes. Every physical page fits inside the naturally defined **290-prime interval `p_174,…,p_463`**, beginning 1033 and ending 3299 immediately before 3301. The repeated page headings provide a visible candidate for restarting the stream per page, in contrast with Agent3's earlier uninterrupted clock. The distinctive p33 numeral follows a **91-rune preface**, whereas the numeral appears at the top of pp34–39; this is an additional objection to applying the same physical-page reset at all seven pages.

## One frozen reversible prime-interval transfer

The solved p56 encryption family supplies the author-authenticated operation `P=(C - phi(prime)) mod29`, with transparent *plaintext*-F and **non-consuming** literal-F skip. For every page, use the following fixed transfer: read the original ciphertext in printed order, restart the prime interval `[p_174,…,p_463]`, use `K_j=(p_(174+j)-1) mod29` for a consumed non-F rune, and allow the authentic p56 F-bypass. The end point 3301 supplies the unconsumed boundary. Because decimal reversal is actually printed in the paired header, test exactly one within-page reverse-direction comparator using the same fixed key. There is no free key search, clock phase or page-specific fitting.

Under the *simpler* artificial no-skip decoder, the seven pages yield complete, exactly invertible but nonlinguistic GP29 tapes. The combined printed-order output has **IoC 0.03440256388439831** and the reverse-page comparator **IoC 0.03442241697155336**, whereas the untouched original chapter has **IoC 0.03436002155478034**. Those values remain near `1/29`, far below the native clear-p57 control IoC approximately 0.06271. The printed p33 first twenty decoded labels are `G E I EA P NG F D L T E OE D TH IA AE N O AE C`. No original unknown plaintext is recognized.

The actual author-authenticated p56 F-skip interpretation admits a **decisive structural contradiction** at short original positions. At non-F ciphertext, the key must advance and must produce non-F plaintext; if ciphertext is F, the inverse may either bypass without advancing or consume a key symbol that yields non-F plaintext. A finite-state reachability recursion over all allowed skip paths leaves zero viable states in every source page. The earliest impossible zero-based positions, indexed locally from the beginning of each original page, are:

| Physical page | Original GP29 runes | Printed-order first F-skip impossibility | Reversed-page first impossibility |
| ---: | ---: | ---: | ---: |
| 33 | 214 | 54 | 0 |
| 34 | 261 | 42 | 45 |
| 35 | 271 | 23 | 13 |
| 36 | 238 | 13 | 19 |
| 37 | 228 | 19 | 6 |
| 38 | 228 | 48 | 8 |
| 39 | 240 | 18 | 5 |

Each source page has independently held-out cipher content after the short failure. Seven genuine solved-p57 GP29 text plants of the actual respective page lengths, containing literal F, are enciphered with the exact tested key and p56 skip policy; the same inverse state machine accepts every plant. All synthetic and original no-skip forward reencryption controls pass. This is a **necessary-symbol test**, stronger than selecting a favorable linguistic score and distinct from already tested fixed 1033/3301 Caesar or GF841 models.

**Reproduction:** [complete standalone Node22 CommonJS original-input SFT](../sims/lp2_p33_39_cuneiform_1033_3301_primeindex_sft.cjs), [successful Windows/Node CI run 43842733966](https://github.com/FlareZ123/liber-primus/actions/runs/43842733966), using source `resources/liber-primus/lp2-corpus.json`, original physical pp33–39; note the historical GP transcription is derived from original scans and does not itself prove the cuneiform numbers encode these arithmetic operations.

## Earlier interval work and scope of this differential test

The previous [source-anchored 290-prime family](lp2-cuneiform-prime-echo-290-key-gate.md) already makes the 1033/3301 interval a specific input, including an exact 2013 prime_echo witness. Its key comprises prime ordinals #175..#464, repeated without resets on p33[91..] through p39. The present output uses **#174..#463** and resets at each printed source page; the entire p33 preface is included only to preserve an actual page-start convention. Thus the F-skip impossibility results are original, but the 290-count, direct p/φ transfers and absence of a source-supplied LP2 consumer were already established. This report adds one clean branch failure without re-opening Agent3's exhausted domain.

## Decipherment decision and surviving input

Reject **this exact** 290-consecutive-prime `phi(p)` additive cipher, under the solved-p56 plaintext-F-transparent rule and source-header page resets, for both printed and reversed within-page routes. It cannot directly decode the unknown cuneiform chapter. The 1033↔3301 rank coincidence remains a precise candidate *key selector* capable of supplying 290 values per page; it gives no authenticated **GP29 consumer or routing instruction**. Future research may use the relationship only after an independent first-party instruction or a frozen original-cipher prediction fixes a distinct reversible value-changing mechanism. Repeating more signs, offsets, key expansions or entropy sweeps would be unsupported.

**Established outcome:** exact prime-rank/length arithmetic and a bounded failed decoder. **Unestablished:** author intention, historical key selection, complete original plaintext or final destination.
