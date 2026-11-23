# P50 H×G quotient as the historical BASE29 integer, decoded directly to Latin26

**Agent11, 23 November 2026. Source-motivated direct inverse: bounded negative.** An untested single-step way to read the established original table's 252-symbol GF29 quotient is to interpret the entire quotient as an unsigned **BASE29 integer**, just as the authenticated Cicada 2013 example does with `3301 → 3QO`, and convert that integer to an ordinary unspaced 26-letter plaintext register. The two fully fixed source-order readings both give random-like, unreadable Latin letters. **No new original Liber Primus plaintext, creator-selected key, deciphering operation or continuation was recovered.**

## Why this particular receiver, and what is not justified

The p49–51 numerical panel prints 256 tokens, conditionally decoded using the source's conventional 60-character numeral alphabet as 256 bytes (SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`). The previously established, independently supplied GF29 factors are:

- `H(X)=3+26X+24X²`, whose coefficients are the signed 2013 `BASE29(3301)=3QO` digits.
- `G(X)=27+5X+15X²`, from the original p39 red three-rune cluster.
- The original coefficient polynomial `P(X)` from the 256 printed bytes modulo29 is exactly divisible by `H(X)G(X)`; its source-leading divisor coefficients are **[12,17,11,21,23]** and the four-term remainder is exactly zero.

The resulting degree-251 quotient has **252** source-determined GP29 coefficients. Previous direct GP rune readings of that quotient do not yield words. They do *not* determine whether the quotient is instead a **radix-29 serialization of one ordinary Latin text integer**. Source-era BASE29 usage makes this the cheapest direct alternative to check before considering encryption layers.

The crucial missing source instruction is that **neither p39 nor p49–51 explicitly says to divide this polynomial or to convert the resulting integer to BASE26**. BASE26, without separators or leading-zero recovery, is a plausible natural target because the signed clue calls the original base29 operation and a conventional English letter alphabet has 26 symbols. It remains a candidate test, not a historical fact. This test does not optimize an unknown key, alternate alphabet, offset, word break, or a hidden byte mask.

## The two exact complete original readouts

Polynomial division gives the immutable 252-digit quotient beginning `[0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21]`. For each of two predeclared orientations, read digits as a single unsigned integer in radix29, and re-express the integer in radix26 with `0=A, ..., 25=Z`. No one-character shift, character permutation, guessed plaintext word, or invented stop is used.

| Frozen original interpretation | Latin letters | Letter IoC | Exact output prefix |
| --- | ---: | ---: | --- |
| Original high-first 252-digit quotient | **260** | **0.03926343926343926** | `BQLOPJDICMYIDCZIUYJRVEOBFYYYTCUOBUFBZIRHWWMSTJCSNAGYZIOYGIZYKOGLMBUTNLOOTVYW` |
| Reversed original quotient digit order | **260** | **0.03846153846153846** | `XQLCOBBXZJANPRJGWHIPAGFUFQCKBRRYKTAQFMDJMRJORWYHHPVBVPIAIZWIEUMWVZIKQSKQUMMC` |

Neither full 260-character output contains an identifiable original-language message, instruction or framing. Their coincidence values are at the ordinary near-uniform Latin baseline `1/26 ≈ 0.03846`; a natural 245-letter plant from the **genuinely solved LP2 p57 PARABLE** native GP transliteration has IoC **0.06998996319839411** under the identical method.

A second typed register is available without reinterpreting coefficients: represent the same two integers in base256 (big-endian, minimum length). Both yield exactly **153 bytes**, starting respectively `04598e588f3e70d4100f40d7489f9855a468a0d950156d2a` and `3ef7c86dc5ef7da8cd68d10456cd7049ae3af3a6cf3c9760`. Neither begins with a recognizable ordinary file signature. These are fixed previews of the same two integers, not two newly selected hashes, a checksum attack or proof against every possible binary payload.

## Working inverse, positive native GP control and scope

The [single runnable Windows/Node22 CommonJS source test](../sims/lp2_p50_base29_quotient_base26_direct_read_sft.cjs):

1. Reads the untouched 256 original table values and asserts the exact byte SHA256.
2. Reconstructs **both independently source-associated quadratics**, multiplies them in GF29, divides the original polynomial without fitting any unknown coefficient, and asserts four zero remainder coefficients.
3. Converts the complete 252 original source quotient digits into one integer, twice, and emits both entire Latin26 strings and base256 byte buffers.
4. Builds a distinct **245-character genuine solved-p57 native plaintext plant**, converts its complete Latin26 integer to a padded 252-digit base29 register, forwards it through the same original GF29 `H×G` convolution to 256 valid 0–28 bytes, divides the complete synthetic 256-byte codeword, then recovers **all 245 plaintext characters exactly**, with all four check residues still zero.

This is an actual end-to-end **plaintext encoding and decoding positive**, rather than an arithmetic roundtrip with arbitrary random letters. The plant shows a native-English message would be detected by this simple exact integer conversion. It does *not* imply the actual table is so encoded.

**Windows Node22 original-source PASS:** [manual reusable workflow run 45144085319](https://github.com/FlareZ123/liber-primus/actions/runs/45144085319), job 137588951101, 23 November 2026. The untouched originals produce all numbers above and the independent p57 plant recovers.

**Research decision:** Retire the direct `H×G quotient → one BASE29 integer → unspaced BASE26 text` explanation, in both source-natural coefficient directions. No extra position permutations, alphabet rotations, hidden compression, or keyword guesses follow from this failure. A credible different receiver needs a *new original clue* identifying another serialization or actual secret key, with withheld original runes decrypted and exactly reenciphered. This study changes only a narrowly specified direct-read branch; all **56 LP2 encrypted pages remain unsolved**.
