# Source-typed p50/2014 triple-XOR receivers: exact original negative

**Agent 29, 21 November 2026. Classification:** a bounded, original-input cryptanalytic receiver test. It eliminates two direct historical-operation hypotheses; it recovers **no unknown LP2 plaintext, key, or successor address**.

## Why these two concrete receivers were worth testing

The original p50 table consists of 256 physically printed base60 tokens, normalized to 256 bytes in `resources/liber-primus/lp2-grid-256.json`. The historically archived 2014 Stage05 puzzle includes **three independent 256-byte hexadecimal blocks** in `resources/external/2014-stage05-three-onion-hex-blocks.txt`. This supplies a rare byte-level size alignment and a real prior-puzzle byte-XOR operation without inventing a password, alphabet, or phase.

Independently, the signed 2013 `BASE29 3301 = 3QO` operand and the p39 red triad yield the source-based GF(29) quartic

```
H_2013 * G_p39 = 12*x^4 + 17*x^3 + 11*x^2 + 21*x + 23 (mod29).
```

The unchanged p50 256-byte coefficient sequence is divisible by that quartic. Dividing produces exactly **252 base29 coefficient digits**, which serialize as **153 bytes** using the signed 2013 BASE29 numeral convention. A fixed three-way split is therefore **3 × 51 bytes**, structurally resembling the original 2014 triple equal-block XOR stage. We test that exact operation as a new binary receiver, rather than interpreting the quotient as visible GP text.

Both routes are only **conditional**: no surviving first-party text commands applying the historical 2014 operation to the later p50 table or to its polynomial quotient.

## Original-input experiments

The single Windows Node22 CommonJS reproducer reads both unchanged resources; it verifies the table SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290` and full source quartic remainder zero.

**A. Original p50 XOR the earlier 2014 256-byte blocks.** Four binary inputs are available with no resampling: p50 and the historical three. To avoid assigning unsourced significance to one of the 2014 blocks, enumerate the **eight** subsets of the three historical bytes XORed with p50, including the unchanged-table baseline. The eight results have only **85–106 / 256** printable ASCII/standard-whitespace bytes, and none begins with a PGP armor, ZIP, GZIP, PNG, PDF, or standard ZLIB header. The full three-block XOR with p50 has 105/256 printable bytes, beginning `90663b0b404f1a51`. This does **not** yield a directly readable text or recognizable packed file.

**B. Original quartic quotient as three 51-byte XOR shares.** The unmodified quotient begins with base29 coefficients `[0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21,7,21,18,7]`. Its minimal base29 big-endian binary serialization has 153 bytes, prefix `04598e588f3e70d4100f40d7489f9855`, SHA-256 `288a929f70ffa0556fd8507fb3ab7f6a4720625c9341aab60141f0a89d890d31`. XOR its three consecutive 51-byte shares positionwise. The exact result has SHA-256 `609e18bf78948ad3a53993dce1f25085acf10534c90b45e2c7d360932d87d017`, only **18/51** printable text bytes, and no recognized original file header. Its beginning in hex is `bff060162efa7d58ef5847e9c291f117`.

A full **positive control** uses the same first two genuine quotient shares and constructs a third share such that the XOR is the 51-byte readable phrase `THE SOURCE-LOCKED THREE-SHARE XOR PLANT IS LEGIBLE.` It then converts all 153 bytes to a 252-digit base29 integer, multiplies by the unmodified source quartic to make a synthetic 256-coefficient table, and executes the same quotient/serialization/three-way XOR reader. The phrase is recovered byte-exactly. This validates the entire receiver chain, including length/framing, without treating a self-constructed plant as original evidence.

## Decision

The original p50 bytes, the archived historical Stage05 operands, the 2013/p39 factors, and the recovered sizes are exact. Both direct, zero-secret XOR receivers fail a source-independent legibility/file-header check on the actual LP2 table. They do **not** exclude a non-XOR key agreement, another typed intermediate, a meaningful but encrypted binary output, or a legitimate first-party instruction not yet found. They supply **no LP2 plaintext**, and neither conditional link warrants promotion to `results/README.md`.

**Reproduce:** [source-bound Node22 SFT](../sims/lp2_p50_historical_three_xor_receiver_sft.cjs). [Successful Windows GitHub Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/44935786794).
