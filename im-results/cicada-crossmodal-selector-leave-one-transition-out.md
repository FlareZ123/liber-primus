# Cross-modal Cicada selector audit: leave-one-transition-out and the p49–51 handoff

**Agent29 · Director Issue #2749 · 25 November 2026.**  
**Decision:** no transferable exact cipher selector survives the three-case leave-one-transition-out audit. The one rule that does survive is a *minimum-licensed-action rule*: execute only the narrow action uniquely selected by the original clue; do not silently add a cipher mode, key, radix, ordering, clock, reset, or receiver. Applied to LP2, this rule selects geometric perimeter extraction from the p49–51 table, but not a decoder for its values. No unknown LP2 plaintext or key is recovered.

## 1. Frozen rule and test design

The rule was fixed before applying it to the selected LP2 locality:

> **Minimum-licensed-action rule (MLA).** A source clue licenses only the narrowest input type and action that it uniquely identifies. A complete decryption claim additionally needs a source-grounded operand, a reproducible reversible operation, and an independently checkable receiver/output. Any extra transformation or parameter not selected by the source remains a separate hypothesis.

The rule is deliberately not a cipher family. The test asks whether two materially different historical examples can predict the *exact* input, operation, operand, and output contract of the third. This is a qualitative leave-one-transition-out audit of three selected controls, not a statistical estimate, p-value, or blind human experiment. Signature validity, source-authored instruction, and participant-reconstructed operation are kept separate.

## 2. Three primary-source controls

### A. 2012 signed MIDI: chorus selects music, not the complete decoder

**Primary input:** [the signed MIDI challenge](../resources/historical/cicada2012-midi-email.asc), with its embedded signed MIDI. The outer message and inner MIDI signature were verified against the preserved Cicada key ID 181F01E57A35090F; the original 10,889-byte MIDI is pinned at archive commit `b13600373d3400d75ec4208198019f3d92a304dd`, blob `11924e0e195208c2eea757655035e149fb8a190f`. See [the source and metadata audit](2012-midi-source-metadata.md).

**Literal cue:** “Let the Chorus be your guide to the depths.”

**Selected input type and operand:** the musical chorus in the attached MIDI. The recovered decoder parses note-off events, sums pitch value with note-off delta time, sorts distinct sums, and maps ranks through the 23-character alphabet `abcdefghijklmnoprstuvwy`.

**Known output and rejection signal:** the second musical track has 714 note-offs and decodes to the 238-letter Blake chorus repeated three times. The first track yields a 558-letter instruction including a 49-word participant list. Failure to reproduce the repeated chorus and exact source-derived instruction rejects that decoder. The exact rank mapping is a reproducible reconstruction from the MIDI, not an operation spelled out in the signed prose. [The 238-symbol reproduction and LP2 transfer gate](2012-midi-chorus-p36-238-gate.md) records the exact inputs and bounded negatives.

**What the clue actually selects:** the chorus/music input. It does not, by itself, state the note-off arithmetic, rank ordering, or alphabet.

### B. 2013 signed TCP challenge: an explicitly typed arithmetic operation

**Primary input:** [the recovered signed TCP challenge and signature audit](../resources/external/2013-tcp-server-signed-source.md). Its OpenPGP signature verifies under fingerprint `6D854CD7933322A601C3286D181F01E57A35090F`; embedded signature time is 2013-01-26 09:16:23 UTC.

**Literal cue:** the command name `BASE29`, alongside the separately named `DH` and `NEXT` commands.

**Selected input type and operand:** decimal integer 3301, the signed challenge's base-29 alphabet `0123456789ABCDEFGHIJKLMNOPQRS`, and most-significant-digit-first conversion.

**Known output and rejection signal:** `BASE29 3301 → 3QO`, exactly as printed in the signed challenge. The same source gives a worked Diffie–Hellman example with p=23, g=5, public values 8 and 19, and shared value 2. The protocol also states that the participant server chooses its own base and secret; the toy shared value 2 is not a universal organizer-supplied LP2 key. A different output for the signed BASE29 example rejects the implementation.

**What the clue actually selects:** this is the only one of the three controls whose source directly names the operation and fixes its operands and alphabet. It does not authorize converting the output into GP29 runes or reusing the DH example as an LP2 key.

### C. 2014 signed Stage04: text selects an operand, while the cipher is reconstructed

**Primary input:** [the signed Stage04 OutGuess payload](../resources/external/derived/2014-stage04/03-outguess.asc). Its original cleartext signature was verified against the preserved Cicada key; see [the exact Stage04/Stage08 source gate](cicada2014-stage04-stage08-pgp-original-source-gate.md).

**Literal cue:** “Let the text guide you,” followed by a runic picture.

**Selected input type and operand:** text from the already-readable LP1 pages. The historically reconstructed key is the 22-GP-rune phrase **WELCOME PILGRIM TO THE GREAT**.

**Reconstructed operation and known output:** GP29 Vigenère subtraction on the runic picture recovers `avowyfgl5lkzfj3n.onion`. The address is the independent recognizable output. The signed body does not literally name Vigenère, print the key phrase, or specify a general LP2 clock. The key and operation are reconstructed from the solved LP1 text and the historical result, not fully prescribed by the signed sentence.

**Rejection signal:** failure to reproduce the historical onion from the original picture and the fixed LP1 phrase rejects that reconstruction. Direct reuse of this key on unknown LP2 pages has already been tested and is negative; the signature does not license that transfer.

**What the clue actually selects:** text as a candidate operand. It does not uniquely select the exact text span, key schedule, or cipher mode for a new target.

## 3. Leave-one-transition-out result

Apply the same MLA rule while withholding each case in turn:

| Withheld control | What the other two can predict | What remains unpredicted | Result |
|---|---|---|---|
| 2012 MIDI | Music/chorus is a plausible input class | Note-off pitch-plus-delta ranking, distinct-value ordering, and the 23-symbol alphabet | Input type only; exact operation fails |
| 2013 TCP | A source may name a typed operation | BASE29, its digit alphabet, operand 3301, and output 3QO | Exact operation is selected only by the held-out command itself |
| 2014 Stage04 | Text can be a source-derived operand | The exact 22-rune phrase, Vigenère subtraction, and key clock | Input type only; exact operation fails |

**Outcome:** coarse input-type selection is present in all three cases; a cross-case rule that predicts the complete operation/operand/receiver is not. Only the 2013 control supplies the full typed contract directly in its signed source. In the 2012 and 2014 cases, the historical result is reproducible, but important parts of the operation are reconstructed rather than explicitly commanded.

The reusable lesson is therefore MLA, not “Cicada uses Vigenère,” “Cicada uses book codes,” or any other transferable cipher prior. It tells a solver where to stop when a clue identifies an input but leaves the transform underdetermined.

A related prior control is already available: [the GEB coordinate-cue ablation](cicada-cue-hierarchy-ablation.md) found that coordinate-like syntax can identify a broad input class without identifying the exact book-coordinate hierarchy. I do not repeat that experiment here.

## 4. Apply MLA once: original LP2 p49–51

**Original input:** the 32×8, 256-token numeric table distributed over original scans 66.jpg, 67.jpg, and 68.jpg (physical LP2 pp49–51). The original scans are independently checked in the existing [p50 functional-graph audit](lp2-p50-functional-graph-2016-wordmap.md); the exact p49–51 images are also in the repository's original Liber Primus corpus.

**Matching source cue:** solved p57 contains the instruction rendered in the existing source analysis as **“SHED YOUR CIRCUMFERENCES.”** The adjacent p49–51 object is a rectangular numeric table with visible nested perimeters.

**Narrow operation licensed:** peel successive one-cell outer perimeters from the original 32×8 rectangle. This produces four disjoint cell sets of **76, 68, 60, and 52** tokens; the counts sum to all 256 original cells. The geometry and the 60-cell third perimeter are reproduced by the existing [source-geometry SFT and report](../workplace/lp2-p50-concentric-ring60-red119-source-selector.md). This is a concrete source-visible handoff from p57's circumference instruction to the p49–51 table.

**What is not licensed:** the clue does not specify which perimeter is the cipher input, the starting cell, traversal direction, row/column order, digit alphabet or radix, byte serialization, GP29 conversion, key schedule, page reset, or receiver. The clockwise sequence shown in the existing report is a useful reproducible convention, but clockwise-from-a-chosen-cell is not itself stated by the circumference wording. The direct conventional-base60 byte reading of the third ring yields only 21/60 printable bytes and no readable message; that bounded negative is already recorded in the source report.

Two tempting numerical correspondences remain non-authenticating:

- The outer 76 cells equal p55's 76-rune length; the inner 180 cells equal p56+p57's 85+95 runes. Length equality does not define a transfer or cipher.
- The conditional red119/NUMBER route that could select 60 depends on a participant-reconstructed NUMBER command. The authenticated 2013 TCP specification contains BASE29, DH, and NEXT, but **no NUMBER, PRIMES, or COUNT command**. The 10-dot/3301 table checksum is also post-hoc and permutation-invariant; it cannot choose a traversal or cipher.

The 2013 BASE29 control is particularly useful here: when Cicada wanted a radix operation, the signed source named BASE29 and gave the alphabet and worked output. No equivalent source instruction names BASE60 or specifies the p50 token interpretation.

## 5. Strongest competing route: 2016 word-map → p50 graph → p32

The strongest competing interpretation is the source-motivated p50 successor graph in [the original-scan graph report](lp2-p50-functional-graph-2016-wordmap.md). It combines the signed 2016 “words/map, meaning/road, numbers/direction” language with the original p49–51 table. Its most developed route is **EPIPHANY SEEKS THE DEVOTED → p32**, under a base-60, row-major, zero-based successor interpretation, and it gives a deterministic navigation endpoint.

That route is more endpoint-specific than perimeter extraction, but its exact selector is weaker: the use of the 2013 DH values p=23, g=5, K=2 as graph step counts remains conditional, and the terminal word/path interpretation was recognized retrospectively. Most importantly, p32's 121 original GP29 runes remain encrypted. The graph is a navigation hypothesis, not a reversible cipher.

Thus the comparison is:

- **p57 → p50 circumferences:** stronger literal geometric cue; selects a reproducible partition, but no cipher consumer.
- **2016 word-map → p50 graph → p32:** stronger proposed destination; requires more interpretive choices and still has no cipher consumer.

Neither route passes the exact-operation/receiver requirement. The independent Dukotah Round10 L2-MAP/L3-ROAD negatives (77,672 and 208 tested readings respectively) concern their own preregistered families; they do not prove this graph route false, but they do argue against broadening the semantic map/road search without a new source-selected index.

## 6. Decision and exact missing dependency

Issue #2749 is complete under its declared criteria:

1. Three materially different source controls were reconstructed from preserved original or signed inputs.
2. The leave-one-transition-out test found no transferable exact selector; only the minimum-licensed-action rule survived.
3. That rule selects one concrete LP2 handoff: p57's circumference instruction → geometric peeling of the p49–51 32×8 table.
4. It does not select a reversible decoder, key, or receiver. No key search is justified.

**The missing historical artifact is a first-party instruction or original-stage object that binds the extracted p49–51 ring data to a specific consumer.** To determine the operation, it would need to specify at least the selected ring and its cell order/starting point, the value alphabet or serialization, and the reversible transform or receiver. A recovered original legend, signed message, or byte-preserved historical endpoint response containing that handoff would decide the next step. Another numerical coincidence or a successful synthetic cipher fit would not.

**Disposition:** preserve the p57→p50 perimeter extraction as a structural lead; retire the idea that historical analogies alone select an exact LP2 cipher; do not start another base/ring/key sweep without the missing source handoff. No unknown LP2 plaintext, authentic key, or final destination was recovered.
