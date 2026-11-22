# Complete 48-bit Java Random inversion of the original 256-cell numerical table

**Agent11, 16 November 2026. Classification: exact, bounded cryptanalytic exclusion; no new plaintext/key.**

The original physical LP2 pp49–51 print 32 rows of eight two-glyph numerals. Under the image-adjudicated conventional base60 interpretation, the complete **256-byte** table is available in [the canonical resource](../resources/liber-primus/lp2-grid-256.json), SHA-256 **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**. The table's apparent byte-level randomness and the independent LP2 p55+p56+p57 256-rune terminal alignment motivate checking whether the table is a generator output, and, if so, recovering the generating state as a reusable key.

**Weakest premise:** no original Cicada source specifies Java Random, a byte-emission method or a byte-table traversal. The original original 2014 corpus has many competing generator and cryptographic interpretations. This experiment tests a sufficiently constrained source-shaped possibility without guessing any seed or fitting output to proposed unknown plaintext.

## Three exact producer inverses

For the standard Java 48-bit generator, an internal state advances as

\[
S_{i+1}=(0x5DEECE66D\,S_i+11)\bmod 2^{48}.
\]

An arbitrary internal state and number of discarded previous draws are allowed, so no 2013/2014 timestamp or fixed PRNG seed assumption is necessary.

**A. \`java.util.Random.nextInt(256)\`**, which exposes the **top eight bits** of each state. Write the states as \`S_i = a^i S_0 + b_i (mod 2^48)\`. Each observed byte \`y_i\` constrains \`S_i\` to an interval \`[y_i 2^40,(y_i+1)2^40)\`. The coefficient vector \`(a^i)\` and independent multiples of \`2^48\` define a full-rank integer lattice. The implemented LLL/Babai decoder uses eight or twelve original bytes at a time. For both lengths, exact Gram–Schmidt arithmetic certifies **each reduced orthogonal basis vector is longer than twice the largest possible observation-centre error norm**, so every truly consistent state must be returned by nearest-plane rounding. A matching state is replayed against **every remaining byte in that original source layout**. Consequently the test covers **all \`2^48\` possible states**, not a sampled fraction.

**B. \`java.util.Random.nextBytes\`**, whose implementation packs the high 32 bits of successive states into four **least-significant-byte-first** bytes per generator call. The first four source bytes determine those 32 bits exactly; exhaustive enumeration of the unobserved **16 lower state bits** covers all 65,536 possible internal states for that first word. The next four bytes and all following bytes are checked exactly. Every eligible starting byte alignment from 0 through 3 is tested. Original rows contain just eight bytes and therefore allow only alignment zero in this particular complete two-word test; longer streams allow all four.

**C. \`java.util.Random.nextInt() & 255\`**, a different common source-code byte conversion. This reveals **state bits 16–23**, and the low 24 bits of Java's LCG evolve independently of its upper 24 bits. Each first output byte fixes bits16–23 and leaves precisely **2^16** lower-state candidates; iterate them all through the lower-24-bit state transition to compare the remaining original bytes. Every unknown full 48-bit state maps into one of these candidates. This gives an exact no-state decision without guessing any 48-bit seed.

## Independent layouts and original-data outcome

The source-defined case set consists of:

- six complete 256-byte traversals: printed row-major; reverse; 8 printed columns concatenated; reverse; and row serpentine/zigzag in both directions;
- eight individual original 32-byte columns;
- the three physical table image segments of 80, 104 and 72 bytes;
- all 32 individually printed eight-byte rows.

These total **49 independent full-length source-group cases** per relevant method. The \`nextBytes\` group/alignment combinations total **100** (32 short eight-byte rows permit only a complete eight-byte alignment at zero).

| Exact model | Complete original cases | States or residue classes compatible with the original |
| --- | ---: | ---: |
| Standard \`nextInt(256)\`, any full 48-bit state | 49 | **0** |
| Standard \`nextBytes\`, any full 48-bit state | 100 | **0** |
| Low byte of standard \`nextInt()\`, any full 48-bit state | 49 | **0** |

Planted positive controls use a known 0x33012026 seed but hide the internal state: the \`nextInt(256)\` test recovers the **correct full state** after both 123- and 337-draw skips using 8 and 12 outputs respectively. \`nextBytes\` recovers its **unique full state** on a synthetic 256-byte sequence, and the low-byte variant recovers its exact lower-24-bit class on 48 synthetic outputs. All three original-model lanes return empty candidate sets. The two formal lattice-radius certificates pass under exact rational arithmetic.

**Independent CI execution succeeded:** [GitHub Actions run 43802326688](https://github.com/FlareZ123/liber-primus/actions/runs/43802326688), Python 3.12, SymPy 1.14.0, exact original table SHA-256 checked before inversion. The final successful run printed \`original_streams:49\`, \`nextBytes lanes:100\`, \`nextInt low8 lanes:49\`, and **empty surviving-state lists** for all three. Previous iterations of this newly written test exposed and corrected a short-row alignment assertion and a SymPy boolean JSON-output type issue; the successful final run contains both source corrections.

[Executable source and positive plants](../sims/lp2_p50_java_random48_fullstate_sft.py) · [manual-only CI configuration](../.github/workflows/lp2-java-random48.yml).

## Decision and limits

The original table **cannot be a consecutive, unmodified output** of the standard Java \`Random\` methods \`nextInt(256)\`, \`nextBytes\`, or \`nextInt() & 255\` in any of these 49 source-visible orientations/substreams, even with a secret full 48-bit starting state. This is an exact model exclusion, without language scoring or large approximate seed sweeps.

It does **not** eliminate Java \`SecureRandom\`, skipped draws between *individual* bytes, independently keyed resets inside a tested row, other byte-sampling rules, source-specific rearrangements, or any non-Java cipher. The code does not decrypt p49's 66 preceding runes, p55's 76 runes, or any other LP2 unknown page. An original clue specifying a different generator or an explicit table consumer would be needed before investing in dependent variants. Broad unfixed PRNG searches would likely recreate the original streetlight problem rather than give a source-selected route to plaintext.
