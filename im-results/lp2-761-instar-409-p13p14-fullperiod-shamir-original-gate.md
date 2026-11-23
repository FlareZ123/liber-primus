# 761.MP3's three title sums and the 409-rune p13–p14 mayfly pair: one complete original-cipher decision

**Agent21 · 23 November 2026. Intermediate exploratory source link and negative fully specified receivers, not recovered plaintext.** Reproduction on the [original-corpus Node22 SFT](../sims/lp2_761_instar_409_twopage_group_shamir_original_sft.cjs), Windows GitHub Actions [PASS #45114488903](https://github.com/FlareZ123/liber-primus/actions/runs/45114488903).

## A plausible human-noticeable pairing, not a proved author instruction

The author-era 2013 `761.MP3` contains source-verified ID3 title **THE INSTAR EMERGENCE** and ID3 user text **Parable 1,595,277,641**, with the exact text later printed unencrypted on LP2 physical p57. Its GP rune-prime title word sums are **72, 280, 409**; their total **761** equals the original file basename. The 2013 original-byte frame inventory and exact source hash are recorded in [the audio inventory](audio761-original-id3-frame-inventory.md). This is a genuinely authenticated naming relationship; it says nothing about a second cipher.

On the **untouched** second-release pages, physical p7 has **208** GP rune glyphs; physical p13 contains **272** runes in two complete 136-rune halves; physical p14 contains **137**, with the exact whole printed second GP word **FOLD**, its initial F at p14 zero-based offset **2**. P14 carries the side-profile mayfly illustration and the end of the seven-page alternating stalk section. The following exact numeric relationships are therefore source grounded:

| Audio title value | Original LP2 physical object |
| --- | --- |
| INSTAR − THE = **280 − 72 = 208** | p7 exactly **208** runes, the page preceding the stalk section |
| EMERGENCE = **409** | p13+p14 **272+137 = 409** runes, closing the stalk/mayfly section |
| EMERGENCE − INSTAR − THE = **409−280−72 = 57** | LP2 **p57**, the clear PARABLE quoted already in the 2013 audio user tag |
| EMERGENCE − 1 = **408** | p13 first136 + p13 second136 + p14 excluding the printed F of FOLD 136 = **3 × 136 = 408** |

The arithmetic is exact; **authorial intent is not established**. In particular, selecting differences and deciding that the special F should be omitted are hypotheses suggested *after* noticing the independent source objects, not instructions in the audio. A generic page length matching a constructed number is insufficient for a decryption. The connection is nevertheless unusually specific about its physical recipient (the mayfly pair), number of equal source strips and an actually printed F flag; it is worth testing once before discarding.

## Field-group clock: source-named full period

The value **409 is prime**; the value **280 has multiplicative order exactly 408 modulo 409**. This permits a *complete, not fitted*, 408-step group orbit from the three individual title sums:

`s[0]=72; s[i+1]=(280*s[i]) mod 409`, with the 408 states all distinct and nonzero and `s[408]=72`.

This is mathematically suggestive of the **Diffie–Hellman modular arithmetic** used in Cicada's genuine 2013 instructions. It does *not* follow that the 2013 author intended the p13/p14 runes as messages modulo409 or that the GP29 projection `s mod29` is authorized.

As the cheapest fully reversible GP29 original receiver, freeze `k[i]=s[i] mod29` and try the two historically known additive signs on the **complete 408 original p13+p14 runes except the single literal F of FOLD**:

`plain[i]=cipher[i] − k[i] mod29` and `plain[i]=cipher[i] + k[i] mod29`.

No shift, state seed, source phase, F-mask family, or different recipient is tuned. Reinserting the unchanged F reproduces the full **409/409** original glyphs. The 95-rune authentic clear p57 plant passes exact encryption/decryption. Actual unknown results:

| Complete 408-rune candidate | GP29 rune index of coincidence |
| --- | ---: |
| Original ciphertext minus the one F | **0.0337476514** |
| Source-title group clock, subtract | **0.0355783591** |
| Source-title group clock, add | **0.0342294166** |
| Minimum of **2,572** authentic solved-GP 408-rune sliding controls | **0.0560172472** |
| Actual clear solved p57 (95 runes, contextual) | **0.0627099664** |

Neither original inverse has a coherent long original plaintext passage. The lower-bound comparison is an empirical native-GP calibration, not a universal proof that any natural sentence must have this IoC. The unchanged one-F round-trip verifies mechanics, not the author's cipher.

## Second specific decoding architecture: three 136-rune source shares

The same source object supplies exactly **three source-printed 136-rune strips**: p13 lines1–6, p13 lines7–12, and p14 excluding its FOLD F. A mathematically natural, different reconstruction for a three-share puzzle is quadratic Shamir interpolation over **GF(29)**, using the **three title sums as share coordinates** reduced modulo the GP29 field: `x=[72,280,409] mod29 = [14,19,3]`.

The zero-point Lagrange coefficients are exactly **[19,23,17]**. A resulting full-length reconstructed 136-rune secret is

`plain[i]=(19*upper[i]+23*lower[i]+17*p14_without_F[i]) mod29`.

Retaining upper/lower as side information makes this mapping to the third strip reversible: the entire original p14 third strip is reconstructed exactly, and an independently seeded authentic native p57 plaintext plant with arbitrary per-rune quadratic coefficients recovers **136/136** original secret runes.

Yet this specific source-title Shamir candidate has **IoC 0.0355119826**, below the **0.0505446623** minimum over 2,844 native 136-rune windows, and is not recognizable GP prose. A simpler positional x=1,2,3 Shamir variant was independently attempted as a diagnostic (IoC **0.0363834423**), also nonlinguistic. Neither original output is a recovered plaintext.

## Decision and re-entry condition

The **new usable object** is a complete **408-state primitive-root clock** with three source-identifiable operands plus an exact printed 3×136 segmentation. The audio's genuine GP sum arithmetic makes this more constrained than choosing a random private pad, but **does not uniquely select** the original p13/p14 receiver, the F bypass, a modulo29 projection, or Shamir instead of another combination. Both direct one-step architectures failed original-native plaintext recovery. Do not multiply arbitrary modular log, phase, order and sign options to rescue an output.

Future priority only if independent creator-era evidence says *how* `761.MP3`'s numbers are to be applied to the printed mayfly/stalk pages, or a decoding of an independent, previously withheld source passage makes a locked, discriminating prediction. Otherwise record this as a potentially interesting numerical alignment with negative concrete consumers, **not as evidence of LP2 solved pages, a new authenticated key or a destination**.

**Files:** original JPEG `resources/liber-primus/30.jpg` (p13), `31.jpg` (p14), original `lp2-corpus.json`, exact rune/word transcription `lp2-transcription.txt`, native `relikd-solved-gp29-native-v1.json`, pinned audio frame inventory linked above. The SFT is read-only, requires Node 22, asserts the title sums, exact original source glyph lengths, word FOLD offset, exact period408 and full-group uniqueness, 409/409 encryption replay, full136 quadratic inverse and source-native positive controls.
