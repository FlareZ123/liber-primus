# Physical p0 red13 → DES-64 on its nineteen-block black body

## Source-backed shape and one bounded consumer

Physical LP2 **p0** prints exactly **13 red GP29 runes**, then a **13-dot divider**, followed by **249 black GP29 runes**. A human familiar with Cicada's authenticated 2013 BASE29 interpretation could read those two unchanged printed registers as big-endian base29 numbers: the 13-rune red register fits a complete **eight-byte (64-bit) key**, while the 249-rune black register needs **152 bytes**, exactly **nineteen DES eight-byte blocks**. The literal eight-byte key in printed source order is `4b1cde6f9c9af1e1`. This is a distinctive direct operand match, but no archived Cicada instruction selects DES or whole-integer byte packing on this page. A previously tested p0 red13 DES transfer to the separate p49–51 numeric table is a different receiver.

The standalone [original-source Windows Node22 reproduction](../sims/lp2_p0_red13_gp29_des64_19block_original_sft.cjs) uses Node's three-equal-key 3DES to implement ordinary single DES, a known standard DES test vector, and four literal orientations: source/reversed 8-byte key paired with forward/reversed 249-rune BASE29 number, each under ECB and zero-IV CBC, with *no* key fitting, padding, hidden offset or generic key hunt. Each DES decrypt consumes all 152 original bytes; all four forward encryptions perfectly recover the original packed ciphertext, and source-native solved-p57 GP29 planted data recover perfectly through DES. [GitHub Actions PASS 45023896077](https://github.com/FlareZ123/liber-primus/actions/runs/45023896077).

| Printed direction / DES mode | Original decrypted printable bytes (of 152) | Original decrypted GP29 IoC if truncated to 249 digits | Canonical GP29 integer range? |
| --- | ---: | ---: | --- |
| forward / ECB | 48 | 0.03306775 | No |
| forward / CBC with zero IV | 42 | 0.03468714 | No |
| reversed / ECB | 53 | 0.03475191 | No |
| reversed / CBC with zero IV | 51 | 0.03497862 | No |

The original outputs have no readable binary text or GP29 prose. In fact, **all four decrypted 152-byte integers exceed the maximum 249-digit GP29 value**, so none is even a valid full 249-rune plaintext under this exact whole-integer encoding. That range test is key-independent of any language scorer. For a generic random 152-byte DES plaintext, the fraction representable in exactly 249 GP29 positions is `29^249 / 256^152 = 0.0121514120935`; the source print length match by itself therefore does not guarantee a bidirectional ciphertext encoding without further author-supplied framing or rejection sampling.

**Decision:** The direct whole-integer red13-key DES-64 original p0 body inverse fails under both standard immediate block modes and both printed-byte orientations. The 13/249→8/152 byte-size match remains descriptive, and does not identify an actual LP2 cipher or plaintext. Extensions that add arbitrary IVs, byte padding, or altered radix mapping need an independent original instruction.

