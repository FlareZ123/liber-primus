# Terminal p54–55 under every legal p56 totient/F path at 10,000 prime starts

**Agent3 · 17 November 2026 · Issue #1389. Supporting finite exclusion, no recovered unknown plaintext.** The original LP2 terminal chapter is physically contiguous: page54 has 232 runes (red heading9, black223), followed by page55's 76 runes. Its 308-rune sequence contains six ciphertext F at combined offsets 41, 65, 195, 247, 257, 273. This study examines a historical cipher transferred from the adjacent independently solved page56. The source does **not** authorize that transfer or select a starting prime.

**Prior-art boundary (added 17 November):** The stronger already-existing nine-chapter source-native reachability study in [`lp2-p56-native-F-transparent-ninechapter-impossibility.md`](lp2-p56-native-F-transparent-ninechapter-impossibility.md) tested the **first 5,000 prime starts** and already found terminal survival for exactly six starts, with eight legal decoded paths. The present experiment extends the same 308-rune reachability model from **5,000 to 10,000** starts and independently reports the black299/p55-only receiver counts. Its first half reproduces prior work. The eight survivors here are not a newly discovered cipher route, and further blind offset expansion has little value.

## Frozen operation and controls

Use the exact authentic p56 transformation with Gematria Primus indices in GF29: for every plaintext symbol other than F, add φ of the next ordinary prime, modulo29; plaintext F (index0) is emitted unchanged as ciphertext F, without consuming a prime. For a candidate ciphertext non-F, the inverse **cannot** produce plaintext F. For ciphertext F, consider both legal alternatives: a literal F bypass, or an encrypted non-F that advances the prime clock. A dynamic-programming set of reachable prime-consumption counts implements the complete F-branch search, without guessed words, crib insertion, missing runes, or resegmentation.

Test **all 10,000 zero-based starting-prime indices 0–9,999**, using a continuous clock across all 308 runes and the physical p54→p55 page break. Two comparisons rerun the same operation with an independent start at the red-title/body boundary (black299) and on p55 alone (76). Neither comparison assumes an authored reset.

**Authentic positive:** the independently known 85-rune p56 plaintext reencrypts exactly to all 85 original ciphertext runes with the real first prime2 and the literal-F skip. **Planted positive:** 308 GP-native runes from the original clear p57, encrypted using prime start167 with transparent F, are recovered exactly by the legal-path enumerator and reencrypted exactly. Thus this exclusion targets the original terminal ciphertext under the stated historical family, not a broken cipher implementation.

## Original-source result

| Fixed receiver | Length | Legally possible starts of the first 10,000 |
| --- | ---: | ---: |
| Entire p54+p55 including red heading | 308 | **8** |
| Black p54 body + all p55, no red heading | 299 | **12** |
| P55 only, independent reset | 76 | **3,000** |

The **eight complete 308-rune** survivors have zero-based prime start indices **167, 168, 3047, 4121, 4365, 4366, 7312, 7975**, corresponding to starting primes **997, 1009, 27941, 39157, 41759, 41761, 74143, 81551**. Every legal F-branch of each survivor exactly reencrypts the original ciphertext; that property is an implementation invariant, not evidence of a historical key.

The complete 308-rune candidate plaintexts have GP29 IoC ranging **0.033842–0.035894**, near flat-symbol values and far below independently clear p57's **0.062710**. The nine red-title symbols decoded at those eight starts are not recognizable English GP-native headings. Importantly, if one additionally hypothesizes that p54's **printed one-rune first word A is also literal plaintext A**, only start index **4366**, prime **41761**, survives the 308-rune F-law, and it yields the fixed red heading **A N C EO H H M N T**. This independently testable candidate is neither a meaningful title nor source-selected. Its full-stream IoC is **0.033842**. The plaintext-A premise itself is unproved.

## Decision and scope

The exact p56 cipher cannot be transferred to the entire contiguous p54–55 chapter with prime2 restart, and only eight remote, unmotivated prime offsets among the first 10,000 even satisfy its mandatory F law. No candidate yields authentic original prose, a creator-specified starting prime, or a transferable operation for an independent chapter. The test has **no power** against starts past 9,999, a reset at the page turn, modified prime order, a separately supplied key, or a non-totient cipher. It also does not disprove the document's nine-rune heading as an enciphered instruction under another system.

The next causal prerequisite is a **first-party source clue specifying the terminal key/clock or an independently typed terminal payload**. Extending an arbitrary start-offset scan without such a selector would not advance plaintext recovery. Related narrower prior art: [red9+p55 85-rune prime2 gate](lp2-p54-red9-p55-76-p56-exact-totient-gate.md), [contemporary A BEGINNING hypothesis](lp2-2014-p54-beginning-ninekey-original-gate.md). [Read-only Windows Node22 source SFT](../sims/lp2_terminal_phi_phase_original_sft.cjs).
