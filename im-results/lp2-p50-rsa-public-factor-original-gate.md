# Original p50 256-byte carrier versus Cicada RSA public moduli

**Result class:** a source-constrained, exact **negative key-carrier test**. No LP2 plaintext, RSA private key or creator-selected cipher was recovered.

## Why this is an executable hypothesis

The original pp49–51 print 256 two-character numeral cells in a 32×8 rectangle. Under the conventional source transcription each cell is one byte, providing exactly **2,048 bits**. The archived Cicada 3301 PGP public key contains **two 4,096-bit RSA public moduli** (primary signing key and subkey), each with public exponent 65,537. A directly embedded 2,048-bit prime factor of either modulus would therefore be an unusually decisive historical key recovery, with a completely unambiguous test: the exact integer **gcd(candidate, modulus)** must be larger than one.

This checks the **original published table** against an already existing public key. It requires neither guessing LP2 plaintext nor scoring a synthetic cipher. A match would be an authentic RSA private-key factor, subject to independently proving the table numeral interpretation. The weak premise is that a hidden RSA factor was intended at all; no first-party LP2 instruction currently says to factor Cicada's signing key.

## Frozen interpretation family

Source inputs: [the canonical 32×8 p50 grid](../resources/liber-primus/base60-grid.json), [archived PGP public key](../resources/external/cicada3301-rsa-public-4096.asc), and the [original-image map](../resources/liber-primus/README.md). Digits are interpreted in the published `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` radix60 alphabet or the independently discussed radix59 alphabet after dropping lower-case `f`. The 256 table tokens form a 256-byte integer under each of four geometric readings: printed row-major, reversed printed row-major, printed column-major, reversed printed column-major. No byte substitutions, index offsets, or unknown state are fitted.

Both 4,096-bit RSA moduli are parsed directly from the OpenPGP public-key MPIs, rather than manually transcribed. The fixed **eight** candidate 2,047/2,048-bit integers yield:

| Numeral radix | Table reading | Integer bits | Last-byte parity | GCD with primary | GCD with subkey |
| --- | --- | ---: | --- | ---: | ---: |
| 60 | row-major | 2048 | even | 1 | 1 |
| 60 | reversed row-major | 2047 | odd | 1 | 1 |
| 60 | column-major | 2048 | even | 1 | 1 |
| 60 | reversed column-major | 2047 | odd | 1 | 1 |
| 59 | row-major | 2048 | odd | 1 | 1 |
| 59 | reversed row-major | 2047 | even | 1 | 1 |
| 59 | column-major | 2048 | odd | 1 | 1 |
| 59 | reversed column-major | 2047 | even | 1 | 1 |

All **16 source-modulus comparisons** are exact integer coprimality results. A planted 2,048-bit factor of a synthetic 4,096-bit product returns the full factor from the identical GCD function, establishing a positive computational control.

## Decision

**Retire the narrow direct RSA-factor interpretation:** the canonical original p50 table is not a directly serialized prime factor of either archived Cicada RSA key in any of the eight source-shaped layouts. The direct radix60 forward reading is already even; the only two forward odd 2,048-bit candidates under radix59 are also provably coprime to both public moduli.

This does not rule out another RSA modulus, a signed source key outside the archived block, a reversible transformation of the table before interpreting bytes, or the table's more general role as encrypted data, code or navigation. Introducing such a transform requires an independent first-party clue before another trial. There is no basis for an unrestricted byte-shuffle factor search.

**Reproduction:** [Windows Node22 CommonJS original-input SFT](../sims/lp2_p50_rsa_cicada_factor_original_sft.cjs). It verifies token/byte agreement, parses both original 4,096-bit key packets and asserts every original GCD equals one, with a planted positive control. This bounded exclusion has no impact on the previously established p50 76-perimeter/180-interior geometry or polynomial-factor relationship.
