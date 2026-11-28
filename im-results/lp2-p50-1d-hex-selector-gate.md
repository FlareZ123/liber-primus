# P50 MAP/ROAD crossing `1D`: hexadecimal 29 is historically plausible but source-unlicensed

**Agent 9, 28 November 2026. Classification: bounded codec-selector negative for Director #3419. No target plaintext or p50 state-machine output is chosen from `1D=29`.**

## Frozen cell

The independently reconstructed p6/p50 bridge fixes ROAD row `g=5` and MAP column `e=3`; their crossing is physical cell43, token:

`1D`.

Read as hexadecimal, `0x1D = 29`, equal to the Gematria Primus modulus. The question is whether the source licenses hexadecimal at this cell.

## P50 local notation strongly favors the native codecs

The original table alphabet is:

`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`

and the table has independently live base60 and base59 interpretations. Cell43 is:

```text
token 1D
base60 = 73
base59 = 72
hex    = 29
```

Hex readability is not rare in the table:

- **88 / 256** physical cells happen to contain two glyphs both valid as hexadecimal digits;
- those represent **61 distinct** hex-readable tokens;
- the exact token `1D` occurs at **four** cells: 43, 69, 112 and 226.

Thus the string shape of `1D` does not itself select base16.

The fact that cell43 is the only one among a small post-selected support-crossing set that is hex-readable is therefore insufficient: it conditions on the crossing family after the table geometry is already known, while 88 table cells admit the same generic two-digit hex syntax.

## Bounded historical audit

A repository-tree audit covered **65 text-like files totaling 174,215 bytes** under `resources/historical/` (extensions md/txt/asc/html/json/py/c/js, each at most 150 KiB) for explicit selectors:

- `0x...` literal;
- the words `hex` / `hexadecimal`;
- `base16` / `base 16`;
- `radix16` / `radix 16`.

No matches occur in the first 48 files of the ordered corpus. The final batch has only two provenance categories:

1. `resources/historical/lp1-outguess-2014-source-map.md`, an analyst-authored provenance map documenting genuine 2014 Cicada use of long lowercase hexadecimal payloads and a nested hexadecimal JPEG;
2. `resources/historical/pklmx-2013/README.md`, a community/reconstruction README using `0x01` for an OpenPGP signature-class byte.

The LP1 provenance is important: **Cicada did use hexadecimal encoding historically.** But those artifacts are unmistakable long hex streams whose alphabet/length supply their own representation. They do not establish a convention that an isolated two-character p50 token should be reinterpreted as base16.

No source-local p50 marker says `0x`, `hex`, base16, radix16, or otherwise changes the table codec at cell43.

## Decision

`1D = 29` is a neat numerical coincidence at a structurally interesting cell, but **hexadecimal is not source-selected there**.

Per #3419, do not promote cell43 to a GP29 modulus opcode, receiver coordinate, or p50 state transition. P50 operations should continue to use the independently licensed base59/base60 and directed table primitives unless a new first-party cue explicitly changes codec.

The historical 2014 hex precedent remains useful only as a creator-era capability/example, not as a local selector.

Reproducer: `sims/lp2_p50_1d_hex_selector_gate_sft.cjs`.
