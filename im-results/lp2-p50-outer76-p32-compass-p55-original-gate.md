# The p50 outer 76-cell circumference as a p32 compass key for p55

**14 November 2026, Agent6. Status: one bounded, original-source-selected reversible candidate rejected at its fifth target rune. No unknown Liber Primus plaintext, author-selected key, cipher or destination was recovered.** The 76-length alignment and incidental X endpoint do not establish creator intent.

## Evidence and frozen interpretation

The original second-release table across physical pp49–51 contains **32 rows × 8 columns = 256 bytes**. Its rectangular one-cell-wide outer ring has exactly **76 cells**, matching the **76 original rune symbols on unknown physical p55**. Page p32 independently has **121 runes**, allowing an **11×11** board. Source p32 indices **33–37** spell **HOMEX**, suggesting a possible start marker H at coordinate (3,0). The authenticated 2016 signed message describes numbers as direction, and solved p57 speaks of shedding circumferences. These clues make one fixed operation worth testing; none explicitly selects its compass bit split or additive cipher.

Read the table perimeter **clockwise from the upper-left**: first row across, right column down, bottom row left, and left column up. For each byte b, interpret b modulo 8 as the direction in the fixed compass order **N, NE, E, SE, S, SW, W, NW** and floor(b/8) as distance. Begin at the p32 H at cell 33. Apply each move toroidally modulo 11 in both coordinates; read the GP rune at each destination. This gives exactly **76 source-derived key runes**. Attempt to decrypt p55 by the historically solved GP29 additive cipher convention with transparent plaintext F: plaintext F is emitted as ciphertext F **without advancing the key clock**, while other plaintext letters use (P + K) modulo 29.

## Decisive original-cipher result

The 76-move route ends at **p32 cell 61 = (5,6) = X**, visiting 52 unique cells. The original p32 map has **five X positions: 37, 54, 61, 68, 70**. The walk therefore ends on an X that is **different from** the X in HOMEX, at cell 37.

| Printed p55 rune offset | 0 | 1 | 2 | 3 | **4** |
| --- | --- | --- | --- | --- | --- |
| Original ciphertext | NG | AE | M | I | **W** |
| Compass-derived key | IA | C | TH | TH | **W** |

No ciphertext F occurs in these first five positions, so the transparent-F key clock advances once per rune. At **zero-based offset 4**, the source ciphertext **W** (GP index 7) equals the derived key **W** (GP index 7). Any additive inverse produces plaintext **F** (index 0), which under the authenticated transparent-F convention must instead have emitted ciphertext **F** and consumed no key. The original ciphertext is W. **The exhaustive legal-state decoder reaches an empty state set at offset 4.**

Naive subtraction ignoring the historical F rule yields **index of coincidence 0.03263157894736842** for 76 runes, starting with GP tokens **D L B H F IA A NG EO IA**. This is no readable plaintext or instruction. For implementation control, the first 76 genuinely readable runes from solved p57 were encrypted with the same fixed compass key and transparent-F rule. The same inverse successfully admitted that planted ciphertext and its true consumed-key clock.

## Decision

Retire this **exact** upper-left-clockwise outer76 to p32 H-start 11×11 toroidal compass to p55 additive transparent-F key. The endpoint-X coincidence does not rescue an inverse that fails on the fifth source symbol. Other start points, rotations, byte grammars, cipher families, or missing external keys require their own independent original clue.

This is distinct from [the 32-state p50/p57 transducer](lp2-32x8-p57-direction-state-machine-gate.md), [the previously published 43-word compass route](../sims/lp2_2016_43word_compass_sft.cjs), and [direct p50 outer-ring additive pads](lp2-terminal256-knowninterior-ring-gate.md). Here the **ring bytes specify moves through p32 and thereby generate a new key**.

**Reproduction:** [single-file CommonJS test](../sims/lp2_p50_outer76_p32_compass_p55_original_sft.cjs) reads the pinned original-derived numeric grid and GP corpus, asserts the exact 256-byte SHA-256, original-page counts, HOMEX marker, route endpoint, original contradiction, and planted solved-p57 positive. No parameter fitting, external API or mutable file is needed.
