# Exact key-free MT19937 rank28 seed-state obstruction on original LP2

**Agent 26, 13 November 2026. Classification:** original-input **all-initial-state impossibility** for a specified no-repeat GP29 radix28 encoder driven directly by a 32-bit MT19937 output modulo28. The original ciphertext yields an exact GF(2) contradiction under both GP glyph orders and both literal per-doublet generator-consumption rules, while two complete original-layout planted MT19937 streams remain consistent. This result identifies **no authentic LP2 plaintext, key, cipher or destination.**

## Causal route and precise hypothesis

The actual unsolved physical LP2 pages 0–55 (excluding the rune-free p50) contain **12,956 GP29 runes** and only **86 equal adjacent pairs** when the pages are concatenated in source order. A human coder may avoid repeated output glyphs by allowing exactly 28 legal next runes, indexed from 0 through 27, and may choose MT19937 as a period-available (1998) generator. The old Python-based Cicada 2013 material and already documented original-source byte ciphers make a pseudorandom generator technologically plausible, although there is **no recovered source instruction to use MT19937 here**.

The proposed model is deliberately narrow and fully specified:

1. Preserve the first original rune as an explicit seed context. For every subsequent unequal rune pair, invert the predecessor-excluding 28-way alphabet by either **ascending skipped-GP** rank `d_i=C_i-[C_i>C_(i-1)]` or **cyclic** rank `d_i=((C_i-C_(i-1)) mod29)-1`.
2. At each of the **86** immediate repeat positions, treat the repeated glyph as an explicit exceptional symbol, preserve the previous ciphertext rune and test **two fixed key-consumption contracts**: the repeat consumes **zero** random draws or consumes **exactly one** random draw whose output is hidden. Neither contract changes the original repeat sites.
3. For every ordinary unequal successor, take exactly one 32-bit **tempered MT19937** output from the source-consumption clock `y_i` and set the selected output rank `d_i=y_i%28`. No rejection draws, independent page reset, extra skips, secret output permutation, per-word rekey, XOR mask or byte/field transform is permitted.

These rules give **12,869 ordinary rank28 digits** with all exception positions fixed from the untouched source. An exhaustive seed search would be hopeless; modulo28 instead leaks two *exact output bits* because `28%4=0`:

`(y_i % 28) & 3 == y_i & 3 == d_i & 3.`

The MT19937 twist and tempering are **GF(2)-linear** in the complete 624×32-bit start state. Thus every observed rank supplies two equations in at most **19,968 unknown initial state bits**. A contradictory equation rejects **every possible initial MT state**, a result stronger than checking any finite key/seed dictionary.

## Full original-input exact elimination

The [standalone C++17 single-file test](../sims/lp2_blind_mt19937_rank28_low2_sft.cpp) symbolically advances the complete standard MT19937 624-word state over GF(2), applies the exact 32-bit tempering transform, and maintains a bit-packed full-rank Gaussian-elimination basis of 19,968 columns. A hidden repeat-consumed draw advances the linear state but adds no equation; zero-consumption repeat sites are omitted from the clock. It reads the unmodified [canonical 29-index corpus](../resources/liber-primus/lp2-corpus.json); the first rune is seed context and all 86 repeat sites are retained. Nothing is selected from the unknown plaintext, and the test performs **no numeric random-seed search**.

| Source reading / repeat-draw consumption | First impossible generated draw, zero-based | Contradictory low bit | GF(2) rank before failure | Equations examined | Result |
| --- | ---: | ---: | ---: | ---: | --- |
| Ascending rank; **0** draws/repeat | **9,970** | **1** | **19,939** | **19,942** | **No consistent MT19937 start state** |
| Cyclic rank; **0** draws/repeat | **9,968** | **1** | **19,937** | **19,938** | **No consistent MT19937 start state** |
| Ascending rank; **1** draw/repeat | **9,977** | **1** | **19,823** | **19,824** | **No consistent MT19937 start state** |
| Cyclic rank; **1** draw/repeat | **9,979** | **1** | **19,825** | **19,828** | **No consistent MT19937 start state** |
| Correctly generated `std::mt19937(3301)` positive; **0** draws/repeat | **12,869 tested** | none | **19,939** | **25,738** | **Consistent** (5,799 dependencies) |
| Correctly generated `std::mt19937(3301)` positive; **1** draw/repeat | **12,955 generated, 12,869 observed** | none | **19,939** | **25,738** | **Consistent** (5,799 dependencies) |

Two native positives were independently generated with the C++ standard `std::mt19937(3301)` and unmodified `uint32 %28` projection. Both encode successive outputs into ascending predecessor-excluding GP order, preserving **precisely the original 86 exception locations**. In the zero-consumption plant, repeated glyphs advance no generator state. In the one-consumption plant, they advance state exactly once while hiding that result. Each source-original mask round trips 12,869 ordinary rank digits with **zero GF(2) inconsistencies** across 25,738 parity equations, including **5,799 redundant constraints**. This checks full multi-twist state advancement, both exception-clock conventions, canonical source bookkeeping, and exact modulo projection. These are implementation positives, not historical key evidence.

**Executable reproducibility:** [manual-only workflow](../.github/workflows/lp2-blind-mt19937-rank28-manual.yml), [successful original GitHub Actions run 43391773596](https://github.com/FlareZ123/liber-primus/actions/runs/43391773596) for all four original input cases and both positive clock policies (original no-draw run [43390427467](https://github.com/FlareZ123/liber-primus/actions/runs/43390427467)) on Node-independent native Ubuntu C++17. The test compiles with standard `g++ -std=c++17 -O3`; code imports only the C++ standard library, performs no writes, and reports every 2,048-rank progress point plus the first impossible equation.

## Decision and limits

This **eliminates direct MT19937 `uint32 % 28` output as the entire 28-choice source register** under either literal zero- or one-draw repeat policy, even allowing every mathematically possible 624-word initial generator state and granting all 86 repeated ciphertext runes as transparent exceptional events. It is an exact algebraic exclusion within the declared encipherment contract, independent of the original language and of MT seed size or initialization procedure.

It **does not exclude** Python's 53-bit floating-point `random()`, `getrandbits(5)` with rejection, discarded random draws not visible in the ciphertext, unknown further consumed draws, a ciphertext-dependent keystream clock, a source-independent starting word-index/phase or unknown preamble, noncanonical GP output permutations, independently reset generator states, or another cipher layer. None of those has a source-selected full original-cipher operation here. A subsequent promising route needs *source-authenticated key/state and consumption rules* rather than new seed brute force on this mathematically impossible class. No unknown original-LP2 rune has been decrypted.

This is complementary to [the earlier seeded/skip-aware MT attack](grid-mt-keyskip-inversion.md), which tried concrete original grid-column seed candidates and key-skips on short original prefixes. Unlike that finite seed search, this test simultaneously rules out **every possible start state** for its exact 28-rank output family.