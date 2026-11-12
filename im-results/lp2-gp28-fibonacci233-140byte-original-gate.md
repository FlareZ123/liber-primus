# LP2 55×233 nonrepeat register: unrestricted 140-byte packet boundary

**12 November 2026, bounded original-input negative.** The four natural fixed-rank 233-radix28-to-140-byte readings each produce **3–5 original integer packets greater than the maximum legal 140-byte value**. A 233-digit number exceeding 256^140−1 cannot be serialized losslessly into 140 bytes. This rules out these four transparent, source-fixed interpretations. No unknown plaintext, authenticated historical key, full original cipher or destination has been recovered.

## Why this specific mechanism was tested

The earlier [original 55×233 source observation](gp28-fibonacci-55x233-invariant.md) establishes that **12,956−55−86=12,815=55×233**. There are 55 rune-bearing unknown pages, 55 potential page-initial symbols and 86 actual equal adjacent pairs. Both 55 and 233 are Fibonacci numbers; the historically signed 2013 Cicada BASE29 challenge shows that base conversion was an era-known method. A human might try removing the page initializers and repeated transitions before base conversion. However, the 55×233 factorization was noticed retrospectively and **no original source explicitly selects this transport**.

Prior finite tests have already excluded unrestricted **5 radix28 digits to 3 bytes** and **10 digits to 6 bytes** under all secret alphabets ([binary capacity report](gp28-direct-binary-packet-capacity.md)); a separate [55×233 all-secret ASCII gate](gp28-fibonacci-55x233-invariant.md#exact-all-secret-233-digit-ascii-transport-exclusion) excluded direct **7-bit ASCII** 233-to-140 packing. The present test is distinct: it considers **unrestricted eight-bit bytes**, in the exact 233-digit geometry, with four natural fixed alphabet/direction conventions.

## Exact proposed original transform

For each rune-bearing physical page, preserve its first rune separately. Thereafter, retain only nonzero predecessor steps. At any equal-adjacent step preserve the observed equality position as a nonpayload marker. Exactly 12,815 steps remain. Two natural bijections from the 28 nonzero transitions to digits 0–27 are tested:

- **Cyclic:** d = ((current−previous+29) mod29)−1.
- **Sorted deletion:** d = current−1[current>previous].

Concatenate all retained steps in the original page order and divide into **55 consecutive groups of 233**. Read each 233-digit group from first-to-last or last-to-first. The payload would be exactly 140 bytes per packet because 233 log2(28) = **1120.11369684 bits** and 140×8 = **1120 bits**. Each resulting radix28 integer must therefore be below 256^140 to fit 140 bytes.

## Original complete-corpus outcome

| Source symbol mapping | Original digit order: invalid 0-based packet indices | Reverse each 233-digit packet: invalid indices |
| --- | --- | --- |
| Cyclic | **3, 34, 52** (52/55 valid) | **1, 18, 22, 27, 47** (50/55 valid) |
| Sorted deletion | **14, 21, 34, 41, 54** (50/55 valid) | **14, 24, 44** (52/55 valid) |

Each cell in this table invalidates the complete **corresponding fixed-width model**, since all packets must be valid. An iid-uniform radix28 control would have a **7.5783%** chance of overflow per packet, with **4.1681 expected invalid packets among 55**. The observed 3–5 are unremarkable. The first packet byte prefixes, precise counts and full input hashes are printed by the SFT.

The original 55 packet starts use **25 distinct cyclic** or **24 distinct sorted** symbols. A completely secret global permutation could map the top two forbidden leading digits 26/27 to as-yet-unobserved leaders, so the original data cannot exclude every one of the 28! potential secret alphabets. The result makes **no** claim about alternate secret mappings, variable packet lengths, nonzero-step clocks, byte-side framing, compression, an extra encryption layer or a different semantic role for the 86 doublets.

## Independent source-shaped positive control

The [CommonJS reproducer](../sims/lp2_gp28_fibonacci233_unrestricted140byte_sft.cjs) builds **55 deterministic unrestricted 140-byte packets**, maps each into exactly 233 base28 digits, and constructs synthetic GP29 pages with the **exact original 56 page lengths**, all **55 authentic initial rune positions** and all **86 observed doublet sites**. It does so independently for both cyclic and sorted rank bijections. Re-extracting all nonzero steps restores every 233-digit group and all **7,700 bytes** per convention, for a total **15,400/15,400** correctly recovered synthetic bytes. Every preserved doublet position and page boundary is checked. The original 3–5 overflows arise from the actual unknown ciphertext, not an inability of the mapping to represent unrestricted byte input.

### Decision

Retire only these four source-fixed phase-zero 55×233 radix28-to-unrestricted-140-byte packet readings. The Fibonacci dimension and historical base conversion make the test affordable but do not select a secret alphabet or plaintext. Any next attempt should first supply a missing author-visible instruction identifying actual digit mapping, byte framing, or a reversible use of the IV/doublet sites. No blind alphabet sweep is justified by this negative result.
