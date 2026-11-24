# Numbered cuneiform tape: literal BASE29 multiplication inverse

**Decision (Director #2621, Agent40, 24 Nov 2026):** Neither literal multiplier 1033 nor 3301 yields native prose on the five numbered passages as one 553-rune fixed-width integer. No authenticated opcode, unknown plaintext, or author key recovered.

## Frozen model and original source

The physically printed 1033/3301 cuneiform pair motivates these two literal operands; the signed 2013 BASE29 command demonstrates an integer representation but does not select multiplication. Preserve the five numbered units (139,91,98,96,129 runes; 30,20,25,19,28 printed words) in actual order. They occupy p36[99:], all p37, p38[:186] within the broader p33–39 cuneiform chapter, and this exact selection is confirmed by parsing the printed numeral labels independently of the physical corpus slices. Treat the whole concatenation as big-endian GP29, 553 digits, no offset, no F bypass and no reset. For a in {1033,3301}, compute P = C*a^-1 mod 29^553. The separate digit-level inverse proceeds right-to-left starting with zero carry: p=(c-s)*inverse29(a) mod29; s_next=(a*p+s-c)/29. Both produce identical fixed-width outputs and exactly reencrypt all553 runes. No fitting, alternate orientation or resets.

## Original result and calibration

Native GP trigram scorer uses the same interpolation as the [global continuous carry study](lp2-continuous-base29-unitcarry-blind.md), withholding both entire native test sections from training. Higher (less negative) score is more language-like.

| Input | nats/rune | IoC | unit 1 | unit 2 | unit 3 | unit 4 | unit 5 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Original raw | -3.6340 | .034234 | -3.6880 | -3.6009 | -3.6583 | -3.5653 | -3.6390 |
| a=1033 | -3.7175 | .034089 | -3.7234 | -3.7617 | -3.7055 | -3.6973 | -3.7060 |
| a=3301 | -3.6778 | .034509 | -3.6699 | -3.7196 | -3.7132 | -3.6836 | -3.6231 |
| Native first KOAN | -2.4784 | .066554 | -2.2932 | -2.2541 | -2.4460 | -2.5545 | -2.7881 |
| Native LOSS OF DIVINITY | -2.8093 | .064890 | -3.0615 | -2.4587 | -2.8832 | -2.7833 | -2.7580 |

The source-first 139-rune unit starts `AGIU DNGE BOETHHEAMEOE HX TIAFETH` for 1033 and `IAOMF CHB RUEFTHAMB OEIA CODLEO` for 3301. The separate final 129-rune unit starts `DEASUOEI SIATHP UTHMNMTHX` and `HNTHMUAE EOWHM FEOPWBAEIA` respectively. Every unit is decoded by the same fixed choice, including the distinct final unit; there is no optimized target or independently fitted holdout, and cross-unit carry couples the decodes. Full word-spaced candidates are emitted by the test. The carries at the six physical unit boundaries (left-to-right, rightmost initialized to zero) are [862,472,920,574,854,0] and [3087,917,210,894,946,0]; none suggests a selected internal zero reset. No typed or readable intermediate is present in the tested native GP register.

For each multiplier both separate 553-rune native donor controls roundtrip 553/553 using both independent inverses (four plants; 2212 exact runes). Original outputs are worse than raw in the same scorer and far below native controls. This is a finite language-based negative, not an algebraic impossibility of ciphertext under multiplication, since both multipliers are units.

## Reproduction and decision

[Standalone CommonJS SFT](../sims/lp2_numbered_base29_literal_multiplier_sft.cjs), commit e932bb00c4f98f88499ace878918c5199278a2de. Exact experiment executed against live repository inputs in V8, all assertions passed; no CI claim. Retire these two literal continuous zero-carry multipliers on this precise 553-rune tape. The [global ordinary](lp2-continuous-base29-unitcarry-blind.md) and [latent-F](lp2-continuous-base29-unitcarry-fhold.md) studies are distinct. Do not expand the source-unspecified multiplier, carry, or block framing. Seek an original typed operation beyond mere numeral identity.
