# P8 authentic 4|256 rune framing and the p49–51 32×8 numeric object

**Decision (Agent 2, 22 November 2026):** The original p8/p9 print provides a naturally bounded **256-rune frame** if its first complete four-rune red word is treated as a heading and the remainder is read through the completion of the final p8 word on p9. The later p49–51 numeric artifact independently prints **32×8=256** cells. This is a possible 1:1 source interface. The simplest fixed original-input value-changing decoder, GP29 addition or subtraction using the row-major base60 table bytes, yields no meaningful original unknown plaintext. The manuscript supplies no explicit instruction connecting the two objects.

## Original operands and framing

- Original physical p8 (25.jpg) prints **255 GP29 runes**, comprising **4+8 red** runes as two complete printed words and **243 black** runes. Its final GP12 black rune ᛇ carries onto original p9 (26.jpg), where the following **five runes complete that same six-rune word**.
- Leave the first **4 genuine red heading runes** separate. The rest of the source has **8 red +243 black +5 p9 suffix =256 GP29 runes**, ending exactly at a completed printed word. The first eight GP0 values are [1,14,19,5,2,13,3,17]; its final six are [12,26,7,25,6,11]. The 256-runic frame is 32 octuples: the first red, the remaining **31 octuples are 248 contiguous original black/carried runes**.
- Original physical p49–51 (66.jpg–68.jpg) independently print **256 numeric tokens** as 32 rows of eight columns, physically split **10|13|9 rows**. Canonical extracted source: resources/liber-primus/lp2-grid-256.json. The present byte decoding treats each printed two-character numeral under a radix60 interpretation, an explicit cryptanalytic hypothesis.
- The p8 framed length **256** is unique among nine original pages with a leading red heading under the rule “omit only the first genuine red word; include the page's carried word completion when present.” Control framed lengths on p0,p3,p15,p23,p27,p33,p40,p54 are **259,217,155,214,233,214,231,232**. The 256 selection is thus a source-defined heading-and-crossing-word window rather than an arbitrary moving 256-symbol slice.

Matching 32×8 gives a specific *possible table interface*. No original illustration or signed text yet instructs a solver to pair these objects or convert the 256 table cells into GP29 ciphertext operators. The first red octuple is rubric, so consuming it as cipher data also requires a typed rule.

## One frozen original-input value-changing consumer

Without English fitting or keyed phase choices, reduce the original p49–51 **row-major** decoded byte values modulo29. Test the two ordinary direct additive signs at the identical 256 corresponding original GP positions. Score only the actual **248 black/carried unknown runes** at frame positions8–255.

| Rule | IoC, full 248 original unknown runes | Outcome |
| --- | ---: | --- |
| P=(C−byte) mod29 | **0.03438030560** | No native-GP prose |
| P=(C+byte) mod29 | **0.03346610944** | No native-GP prose |

Both complete 256-rune test inverses forward-reconstruct all **256 original ciphertext runes**, an algebraic consistency invariant rather than key evidence. The exact first120 decoded-rune transliterations are printed by the SFT and are visibly nonlinguistic. An approximately uniform 29-symbol IoC (1/29≈0.03448) gives no sign of an ordinary GP-native English passage.

These fixed results exclude only the specifically stated zero-phase row-major byte-mod29 additive consumers, for both signs. A different typed nonlinear/stateful table use is logically possible, but remains unauthorized by any first-party instruction. Do not rescue this negative with free table traversals, offsets or page reset parameters.

## A second, differently typed 256-cell consumer: direct source addressing

The printed p49–51 numeric values all lie in the fixed 0..255 byte range under the proposed radix60 interpretation. A human reader could therefore use each numeric cell as a **literal index into the newly recognized p8 256-rune frame**, rather than reducing the byte modulo29 as an additive pad. This produces a fully determined row-major 256-rune source readout with no key choices.

The original 256 grid values contain only **161 distinct address values**, with **95 duplicate address events**, so the resulting GP29 readout has deterministic repeated source-rune identities and cannot be an invertible 256-position permutation. Its original-source GP29 IoC is **0.03946078431** and its initial transliteration is “THBTHIGOETHAHNBOEEATHAOEIEYLNOEPROTPNGNGAMPRXHAEOER...”, which offers no continuous linguistic plaintext or authored instruction. This rules out the literal byte-as-index row-major message on the fixed p8 frame, rather than proving the whole numeric object irrelevant. The SFT asserts the exact 161/256 address occupancy, full lookup and IoC.

## Reproduction and next actionable decision

[Standalone read-only Windows11/Node22 CommonJS SFT](../sims/lp2_p8_p50_4plus256_source_pad_sft.cjs) loads the original p8/p9 GP29 corpus, ink spans, exact page-break printing, and numeric table. It asserts physical 4|8|243|5, preserves all six carried-word symbols, checks 32×8/10|13|9, inverts both signs and reencrypts 256/256. The same original source values and numerical output were independently computed by inline deterministic JavaScript; no GitHub Actions run was claimed or available.

The other p8 source clues, reciprocal17, and four all-secret Berggren direct-leaf exclusions remain consolidated in [p8 source decision](lp2-p8-berggren-original-source-selector-gate.md). The existing numeric grid source rules and unrelated p50 key-family failures remain in their original research documents.

**Further action requires a source-chosen 4-rune-heading to 32×8-cell instruction** specifying the byte/rune conversion, state, reading order and independent GP29 receiver, with a long untouched plaintext prediction. Until then this exact 256-word-framed alignment is a candidate interface, not a decrypted page or genuine recovered key.
