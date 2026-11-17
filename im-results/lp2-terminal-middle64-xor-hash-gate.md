# LP2 terminal 128 middle cells: two 64-byte XOR ribbons against solved p56 hash

**Agent 7, 17 November 2026. Original-input, source-frozen negative. No unknown LP2 plaintext, genuine key, deep-web hash preimage, or destination recovered.** Reproducer: [one-file Windows/Node.js 22 SFT](../sims/lp2_terminal_middle_64xor_p56hash_sft.cjs).

## Original clue and previously untested receiver

The actual pp49–51 numeric table has **32×8 = 256** cells. Its four rectangular circumferences have **76, 68, 60, 52** cells. Source p55 contains exactly **76** runes. The clear p57 injunction “SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE” begins at the deepest ring's corresponding 52-rune terminal offset. These count and text observations were established independently in [the terminal known-interior study](lp2-terminal256-knowninterior-ring-gate.md).

The two *middle* table shells have 68+60 = **128 bytes**. Independently, the solved p56 image prints a **128-hex-digit SHA-512 target**, i.e. **64 bytes**. A historically used Cicada operation is XOR. Rather than treating middle128 as 128 separate hex nibble outputs (already rejected by the earlier report), ask whether a *geometrically specified fold of two 64-byte ribbons* equals the **exact published 64-byte hash**, or whether that 64-byte fold hashes to the target. Either perfect test would be a cryptographic witness rather than a language score.

The depth-one (30×6) ring's **64 noncorner edge cells** divide into side lengths **[4, 28, 4, 28]**. The depth-two (28×4) ring contributes **56 noncorner edge cells**, side lengths **[2, 26, 2, 26]**. Append *one corner from each middle ring* to every depth-two side, yielding a second 64-byte ribbon with exactly the same side lengths. Both choices (outer-corner at the side start and inner-corner at the side end, or the reverse) consume **each of the same 128 physical cells exactly once**. This is an unambiguous, lossless 64+64 partition for either convention, without altering byte values.

Test four physical side starts and both clockwise/anticlockwise directions **independently on each ribbon**, and both corner assignments: **2×8×8=128 complete readings**, with the sole byte transform **XOR**. The original byte SHA-256 is frozen to \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`.

## Exact original results

| Model and target | Complete original-source result |
| --- | --- |
| The common NW-clockwise/NW-clockwise middle-ribbon fold | **0/64 exact hash bytes** |
| Best of **128** fixed ribbon folds | **2/64 exact hash bytes**; no 64-byte equality |
| SHA-512 of any of the 128 complete 64-byte folds | **0/128** matches the published p56 digest |
| Four consecutive 8×8 source-square blocks XORed cellwise into one 64-byte block | **2/64 exact hash bytes**, neither direct hash nor SHA-512 preimage |

The four consecutive 8×8 squares are the other literal 64-byte partition of the printed 32×8 source matrix; their XOR is a fixed **four-way fold** and uses every original grid byte once. No orientation, byte map, source rune, secret, plaintext or offset was fitted.

**Nontrivial known-target positive:** Starting from a separate *copy* of the authentic bytes, set each inner-ribbon symbol to (corresponding outer-ribbon symbol XOR the exact known p56 digest byte). This preserves the exact source geometry and produces **64/64** recovered hash bytes through the *same* ribbon decoder. A separate in-memory four-square XOR plant also recovers **64/64**. The original tests fail on the unmodified source, so no apparent decoder is authenticated merely by reversibility.

## Decision and next branch

Retire **the exact XOR-of-two-natural-middle-ribbons and XOR-of-four-printed-8×8-blocks routes** as a literal p56-hash reconstruction or immediate 64-byte SHA-512 preimage. The original p55/p56/p57 and table ring count alignment remains an independently observable structural clue, but the manuscript never specifies this fold, a byte-to-rune output interpretation, or a key-generation step. The earlier original-p56 128-hex-nibble and deep52 source tests are unaffected.

A new route should first identify an **authentic cell-selection or byte-transform instruction** outside the already-tested XOR/direct-byte/lookup families; permuting the same two ribbons or searching more arithmetic operators after the null would not advance a human solve path. No claim is made about an arbitrary stateful decoder, nor about SHA-512 preimages outside these finite inputs.
