# 2013 Instar metadata number as a p55 GP29 key: bounded negative

**Classification:** source-motivated, bounded negative. No plaintext or new cipher mechanism was recovered.

## Why this was worth testing

The archived 2013 Cicada asset **761.MP3** is preserved in [rtkd/iddqd](https://github.com/rtkd/iddqd/blob/master/2013/02/761.MP3) (Git blob SHA `7e2bd299fbc7b96283219cf15e2904641daf631f`). A contemporary reconstruction prints the MP3's ID3 bytes and exposes the user-text field:

- `Parable 1,595,277,641`
- `Like the instar, tunneling to the surface`
- `We must shed our own circumferences;`
- `Find the divinity within and emerge.`

See [the 2013 walkthrough and raw ID3 dump](https://connortumbleson.com/2021/01/25/the-cicada-3301-mystery-puzzle-2/), especially its 761.MP3 excerpt. This poem is reproduced in the solved LP2 p57 passage. The solved LP1 text also states that the totient function is sacred. Those source-derived connections motivate asking whether the number in the old audio metadata supplies p55 key material and whether “divinity” selects Euler's totient.

The 2013 audio copy is an archival source, not a PGP-signed LP2 instruction. The connection motivates a test; it does not establish that the authors intended this particular key transfer.

## Fixed derivation

Let

`N = 1,595,277,641 = 1,031 \times 1,229 \times 1,259.`

These are the three p57 body-clause GP-prime sums, in p57 clause order `[1259, 1031, 1229]`. Since the factors are distinct primes,

`phi(N) = (1031-1)(1229-1)(1259-1) = 1,591,168,720.`

The standard most-significant-first base-29 representations are:

- `N`: `[2,19,22,14,20,24,24]`
- `phi(N)`: `[2,19,16,20,7,2,26]`

The single-symbol reductions are `N mod 29 = 24` and `phi(N) mod 29 = 26`. Preserving the p57 clause order gives two additional natural three-symbol encodings:

- Clause prime sums mod 29: `[12,16,11]`
- Clause totients mod 29: `[11,15,10]`

## Target and operation

The p57 instruction to shed circumferences and find what is within selects the strict interiors of the 16 complete printed words beginning on p55. The p55 page contains 76 runes: 75 runes in those 16 complete words plus one incoming carry from p54. Removing the first and last rune of each complete word leaves **43 interior runes**. The exact word-length sequence is:

`[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`.

For each of the six key representations above, the experiment applies only direct, phase-zero GP29 additive decoding to this 43-rune stream:

- `P = C - K (mod 29)`
- `P = C + K (mod 29)`

Keys are consumed continuously through the 43 interior runes. No phase search, reversal, word reset, alternate alphabet, key fitting, or extra cipher layer is introduced. Each case round-trips the original p55 input and a 43-rune plant from solved p57 plaintext. These controls validate the implementation, not the authenticity of a key.

## Results

Raw p55 interior IoC is **0.03433001**. The same-length solved p57 control has IoC **0.05647841**.

| Key representation | Key (GP29 indices) | C−K IoC | C+K IoC |
|---|---|---:|---:|
| N mod 29 | [24] | 0.03433001 | 0.03433001 |
| phi(N) mod 29 | [26] | 0.03433001 | 0.03433001 |
| N in base 29 | [2,19,22,14,20,24,24] | 0.03543743 | 0.04429679 |
| phi(N) in base 29 | [2,19,16,20,7,2,26] | 0.02990033 | 0.04429679 |
| p57 clause primes mod 29, source order | [12,16,11] | 0.03875969 | 0.04651163 |
| p57 clause totients mod 29, source order | [11,15,10] | 0.03875969 | 0.04651163 |

None of the twelve outputs is recognizable GP29 prose. The strongest IoC is 0.04651163, still below the solved p57 control, and the corresponding transliteration remains nonlinguistic. Constant shifts preserve IoC by construction; their outputs were inspected directly rather than treated as a statistical test.

## Decision

Retire these exact direct additive uses of the 2013 number, its whole-number totient, and the p57 clause factors/totients on p55's 43 strict interiors. The historical cross-round link remains real and potentially useful, but it has not yielded a key under the tested natural GP29 encodings.

Do not rescue this branch with arbitrary phase changes, reversed digits, ad hoc KDFs, or unrelated cipher families. Reopen it only if a separate source selects a different operation or identifies how the original audio bytes themselves enter a reversible process.

## Reproduction

Run from the repository root:

    node sims/instar_metadata_totient_p55_gate.cjs

The script reads the canonical corpus and transcription, asserts the page-55 word boundaries and carry, verifies the prime factorization and totient, emits all twelve outputs and IoCs, and checks exact positive-control round trips. Supporting inputs are the existing `resources/liber-primus/lp2-corpus.json` and `resources/lp2-transcription.txt`.
