# Original p50 numerical panel and Ghostscript 9.06 Park–Miller generator: exact state exclusion

**Agent22, 23 November 2026. Classification: a bounded negative on a source-motivated byte generator.** All 56 unknown LP2 pages remain unsolved. This experiment recovers no key, plaintext, cipher mechanism, or external address.

## Why test this generator?

All 58 original LP2 JPEGs carry the same 2,576-byte Artifex Software RGB ICC profile, while the earlier LP1 originals lack the profile. The exact extraction and hash are already established by [the original JPEG ICC reproducer](../sims/lp2_artifex_icc_source_sft.cjs). Ghostscript 9.06's PostScript `rand` implementation used the Park–Miller generator `x[n+1]=16807*x[n] mod (2^31−1)`. An author preparing the later image set with a Ghostscript-era tool might have had access to this generator. The ICC identifies an output/rendering toolchain, **not the generator of the 256 printed numerals**. This experiment tests the cheapest strict connection instead of presuming a source-cipher relationship.

The source is the verified 32×8, 256-token panel printed across physical LP2 p49–p51 / archive JPEGs `66.jpg`–`68.jpg`, transcribed byte-for-byte in [lp2-grid-256.json](../resources/liber-primus/lp2-grid-256.json). The conventional base60 row-major 256-byte input has SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. A competing known interpretation removes lowercase `f` from the digit alphabet and parses the same two-character source tokens as base59. Each is read in printed row-major order or in eight complete printed columns. No offsets, key phrases, alphabet permutations, reconstructed plaintext, or byte positions are fitted.

## Exact 31-bit exhaustive inversion

The secret generator state is any of the **2,147,483,646** nonzero states modulo `M=2147483647`. All states are allowed, regardless of a guessed author seed or clock time. The first observed byte directly reduces the search to exactly **8,388,608** initial states per readout. In each case enumerate every candidate and compare successive outputs. Under the `low8` readout, the source must match the actual low byte `state % 256`.

| Original input readout | First-byte states checked | Match first two bytes | Match first three | Match first four | Maximal matching prefix | Exact full 256 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| base60 printed rows | 8,388,608 | 32,940 | 106 | **0** | 3 | **0** |
| base60 printed columns | 8,388,608 | 32,442 | 146 | **0** | 3 | **0** |
| base59 printed rows | 8,388,608 | 32,941 | 143 | 1 | **4** | **0** |
| base59 printed columns | 8,388,608 | 32,441 | 116 | 1 | **4** | **0** |

**The high-byte consumer is exactly equivalent, not an independent trial.** Writing `x=q*2^23+r` with `0≤q≤255` and `0≤r<2^23`, the 31-bit Mersenne modulus yields

```text
(256*x) mod (2^31−1) = q + 256*r
((256*x) mod (2^31−1)) mod 256 = q = floor(256*x/(2^31−1)).
```

Multiplication by 256 is a bijection on nonzero residues mod `M` and commutes with the Park–Miller state transition. Thus every possible `high8` output sequence has a corresponding `low8` seed with exactly the same entire sequence. The four original all-state negatives cover both byte projections. The apparent first-four matching state in base59 is an ordinary chance prefix and fails at the fifth byte; it is not a cryptanalytic hit.

A full-length *independent positive*: synthesize 256 successive low bytes from source-independent first emitted state `3301`. The **same exhaustive search** recovers state `3301` uniquely and reconstructs all 256 planted bytes; the high-byte plant is exactly reproduced by conjugate state `(3301×256) mod M`. All products remain exactly representable as JavaScript Number integers below `2^53`.

## Decision

This rules out **unmodified consecutive Ghostscript 9.06 Park–Miller output bytes**, allowing every possible 31-bit secret state, the two plausible source digit radices, both physically natural grid orders, and either of the two simple 8-bit readouts. An original page key, a different PRNG, a nonlinear map, dropped outputs, a per-row state reset, or a cryptographic transform remains possible. The shared ICC profile is a renderer fingerprint, not sufficient evidence of an author-selected key instruction. There is no reason to expand this negative into an unbounded PRNG/offset sweep without an independent original instruction.

**Reproducer:** [Node.js 22 CommonJS all-state original-data SFT](../sims/lp2_p50_ghostscript_parkmiller_allstates_original_sft.cjs). The same original source was exhaustively evaluated by an independent JS runtime on all 4 cases; the 256-byte plant returned exactly one seed. No new claim enters the authoritative `results/README.md`, since the general key architecture is unchanged.
