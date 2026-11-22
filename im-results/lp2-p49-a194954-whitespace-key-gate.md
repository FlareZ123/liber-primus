# 2014 whitespace sequence A194954 as a key for LP2 page 49

**Agent45, 15 November 2026. Bounded negative; clue remains provisional.** No plaintext recovered.

## Source observation

The archived 2014 onion7 clear-signed message, [message.txt.asc](https://github.com/krisyotam/cicada3301/blob/main/archives/cijhho/2014/Liber%20Primus/A%20drop%20box%20of%20all%20unmodified%20files/2014onion7/message.txt.asc), contains these space runs in order:

| Location | Spaces |
|---|---:|
| After “Hello. Your enlightenment awaits you.” | 2 trailing |
| Following blank line | 3 |
| Before the onion address | 5 leading |
| After the onion address | 7 trailing |
| Following blank line | 11 |
| Following blank line | 13 |
| Following blank line | 17 |
| After “Good luck.” | 23 trailing |
| Following blank line | 29 |
| Following blank line | 31 |
| Following blank line | 37 |

The resulting sequence is:

\[
2,3,5,7,11,13,17,23,29,31,37.
\]

These are exactly the first 11 terms of [OEIS A194954](https://oeis.org/A194954). OEIS defines it by \(a(1)=2\), then choosing the smallest prime greater than \(a(n-1)\) such that \(a(n)-a(n-1)\) is divisible by A000120(\(n-1\)), the binary digit count (popcount) of \(n-1\). This is a more specific match than “the first few primes.”

**Authentication caveat:** the archive file is an OpenPGP clear-signed message, but RFC 4880 §7.1 specifies that trailing spaces and tabs are removed when the cleartext signature is generated. Most of the counts above are trailing-space runs and therefore are not bound by that signature. The five leading spaces before the onion address are part of the signed line; the other whitespace counts are an observed property of this archived serialization, not cryptographically authenticated author instructions. See [RFC 4880 §7.1](https://www.rfc-editor.org/rfc/rfc4880#section-7.1).

## Human solve-path hypothesis

LP2 physical page 49 has exactly **66 runes** before the 10-dot marker. Since \(66=6\times11\), a plausible solver could:

1. Notice the unusual space runs in the 2014 message.
2. Recognize the first 11 terms of A194954.
3. Extend the sequence to 66 terms.
4. Try it as a one-time GP29 key for the 66-rune p49 caption, which immediately precedes the 256-cell table.

This is a clue-constrained experiment, but the weak point is the assumption that the sequence is a direct substitution key rather than an index/direction rule.

## Frozen tests and result

The reproducer extracts the 66 p49 runes from resources/liber-primus/lp2-transcription.txt, extends A194954 by its OEIS recurrence, and tests:

- Additive GP29/Vigenère: \(C_i\pm a(i)\pmod{29}\), with both zero- and one-based key values.
- The natural recurrence-derived streams: prime gaps, binary popcounts, and gap/popcount quotients, with both additive directions and both offsets.
- Multiplicative GP29 and inverse-multiplicative versions for the prime, prime-minus-one, gap, and quotient streams.

No candidate is coherent plaintext. For example, the direct prime stream produces:

- Subtract \(a(i)\): AESGNNIMUAJPFOWPNGHWSBTHTHFTHFFOLAECNGRMOTHU
- Subtract \(a(i)-1\): YTWIILTHAEEOXURHXOENHTEOOUOUFURNGYGOECLROTHF

The other additive and multiplicative outputs are similarly non-linguistic. The complete outputs and exact input sequence are reproducible with:

~~~bash
node sims/lp2_p49_a194954_key_gate.cjs
~~~

## Exact-length p50 table XOR consumer

The p49–51 numeral field has 256 cells and a documented byte export under the base60 codec (with a second lossless base59-no-lowercase-f interpretation). Extending A194954 to 256 terms therefore gives a source-motivated 256-byte XOR stream. This also addresses the independent observation that the p50 byte table contains 129 high-bit bytes: unlike the small GP29 prime/totient operands, A194954 terms can exceed 127 and could in principle change those high bits.

Tested the direct one-byte interpretations only: key byte = a(n) mod 256 or (a(n)-1) mod 256, XORed positionally against both table codecs. All four outputs are binary-looking, with no recognized file signature or coherent text:

| Table codec | Key | Printable bytes / 256 | Unique bytes | First 8 output bytes |
|---|---|---:|---:|---|
| base60 | A194954 | 91 (35.55%) | 162 | `c9e4a2bd6ae06fa0` |
| base60 | A194954−1 | 91 (35.55%) | 161 | `cae5a3bc6be16ea1` |
| base59 | A194954 | 90 (35.16%) | 158 | `cae0a1b06be46da3` |
| base59 | A194954−1 | 91 (35.55%) | 158 | `c9e1a0b16ae56ca2` |

The reproducer now includes this exact-length test and prints all outputs. This is a bounded negative for the direct positional XOR consumer, not an exclusion of a distinct source-selected table traversal or stateful decoder.

## Decision

Retire the direct A194954 additive/multiplicative key interpretation for the p49 caption. Do not scan offsets, repeat periods, or arbitrary KDFs. The whitespace/A194954 match remains an interesting but incompletely authenticated source clue. A future investigation should reopen it only with a distinct, independently motivated use of its popcount/gap structure—potentially as a direction or table-index rule—not by repeating direct key-stream tests.

This is distinct from the external Dukotah/cicada3301 campaign's raw whitespace-key candidates: the present test extends A194954 to the exact 66-rune p49 length and tests its recurrence-derived streams.
