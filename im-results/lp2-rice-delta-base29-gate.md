# Centered GP29 differential Rice code / minimal BASE29 frame (#3141)

**Decision (27 November 2026, Agent13): reject the frozen direct, unencrypted centered-difference Rice receiver.** All nine physical chapters and the complete 12,956-rune unknown book fail its exact EOF suffix. The original p15–22 and p40–53 also start with GP0 and are nonminimal positive numerals. Held-out native, exhaustive two-rune and long literary controls recover exactly. Encoded controls near the original book length have 430–463 adjacent repeats versus LP2's 86. No recovered unknown plaintext, key or continuation.

## Period convention and exact receiver

[Mahoney, Data Compression Explained §3.4.1–2](https://www.mattmahoney.net/dc/dce.html), indexed pre-2014, gives unary positive quotient (q ones then 0), fixed MSB-first remainder for power-of-two M, and signed residual mapping negative d→−2d−1, nonnegative d→2d. The worked table entries for n=5,M=4 (1001), n=6,M=2 (11100), and n=0,M=4 (000) are exact controls. [Signed 2013 BASE29](../resources/external/2013-tcp-server-signed-source.md) specifies positional conversion; 3301→3QO and participant witnesses 30→11,1033→16I are reproduced. The historical sources do not prescribe this GP29 composite.

Use the GP29 ordinal sequence, previous native symbol initialized to 0 per physical chapter/book. For each symbol p, take d=(p−previous+14 mod29)−14 (with Euclidean mod), then fold d into 0–28. Reserve 29 for EOF. For parameter k, encode v as floor(v/2^k) ones, 0, then exactly k binary remainder bits. No escaping, no discarded zero transitions, no guessed padding, no word reset. Prefix one bit '1' to the complete bit payload including EOF; treat it as one positive integer and convert to minimal big-endian BASE29 digits in chart order. The leading bit preserves leading zero payload bits. The inverse requires a nonzero leading GP digit, strips the leading binary 1, parses complete codewords in 0–29, requires exactly one EOF at exact physical frame end, and requires full original-digit replay. This direct bit integer frame is an analyst choice, not historical instruction. It is not #3142's fixed full-byte-width interval code, #592's base28 PNG or post-red119 gzip transport, #2155's side information/forbidden-transition grammar, or #2630's Fibonacci packet additive key.

The algorithm, calibration/holdout split and frame were frozen in [commit d2d8ff0](https://github.com/FlareZ123/liber-primus/commit/d2d8ff0ee3f788ab4819c93fed05d3f270b05c42), before original evaluation. Three clear native LP1 pages p3,p8,p9 (551 total runes, 3 EOFs) determine k by minimum total bit count, lowest k on ties. Since all values ≤29, k≥5 yields one unary terminator plus k bits per symbol; larger k cannot improve it. Training costs for k=0..5 are **8558,4975,3456,3001,3040,3324**, so **k=3**. The terminal codeword is **1110101** = 117 modulo 128. This is an exact necessary wire constraint independent of the native language, any decoded text and all earlier bits.

## Controls, run before original evaluation

Five held-out solved native records (LP1 p10/p11/p14, LP2 p56/p57) recover all 630 source runes and exact original encoded digits. Authentic p56 is first decoded by its known prime-minus-one literal-F scheme. Empty frame, edges and all 841 ordered native pairs pass. Four malformed tests per held-out record (truncate one bit, append zero bit, prepend GP0 digit, use k=4) all fail the attempted receiver, 0/20 canonical. These mutations are selected diagnostic classes, not a universal integrity test.

Three literary donor prefixes (Emerson, Gibran, Shakespeare; pinned repository controls) with exactly 12,956 native runes produce 14,346,14,344,14,287 GP29 output digits, ratios 1.10729,1.10713,1.10273, respectively. This code expands native text in this register. For repeat comparison at actual original encoded length, choose the longest donor prefix yielding at most 12,956 digits; this choice uses output length alone and no original run identities. Prefixes are not independent replicate samples within a donor.

| Donor | Native runes | Encoded digits | Adjacent repeats | Fraction of adjacent pairs |
|---|---:|---:|---:|---:|
| Emerson | 11,706 | 12,956 | 445 | 3.4350% |
| Gibran | 11,682 | 12,955 | 463 | 3.5742% |
| Shakespeare | 11,748 | 12,956 | 430 | 3.3192% |
| Unknown LP2 | — | 12,956 | 86 | 0.6638% |

No original rates used to select model. Exact equality counts include seams, consistent with full rune tape. This is descriptive evidence against the proposed suppression mechanism, not a universal bound on possible integer digit repetitions.

## Original frame gate

| Physical pages | GP digits | Positive integer mod128 | Outcome |
|---|---:|---:|---|
| p0–2 | 729 | 25 | Wrong EOF |
| p3–7 | 1145 | 27 | Wrong EOF |
| p8–14 | 1729 | 126 | Wrong EOF |
| p15–22 | 1903 | 31 | Nonminimal + wrong EOF |
| p23–26 | 1021 | 43 | Wrong EOF |
| p27–32 | 1433 | 19 | Wrong EOF |
| p33–39 | 1680 | 120 | Wrong EOF |
| p40–53 | 3008 | 0 | Nonminimal + wrong EOF |
| p54–55 | 308 | 115 | Wrong EOF |
| p0–55 | 12956 | 106 | Wrong EOF |

**0/10 match the mandatory terminal residue 117.** The result remains true even if one ignores forbidden leading zero digits. None reaches language scoring; no arbitrary parameter, residual orientation, alternate padding, or byte offset sweep. The exact direct transition code is retired. Any new variant requires independent source material specifying the transition convention, symbol/EOF grammar and reversible transport; generic coding plausibility is insufficient.

[Single-file reproducer](../sims/lp2_rice_delta_base29_sft.cjs) · [raw exact outputs and six pinned blobs](lp2-rice-delta-base29-output.json) ([commit 5a61eac](https://github.com/FlareZ123/liber-primus/commit/5a61eac9f7fab75a783f99dc2a898956f881653d)). Computational core executed twice in connected V8 (controls-only first, then original); the standalone Node wrapper was not separately executed. No CI necessary.
