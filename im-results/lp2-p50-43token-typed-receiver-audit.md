# p50 43-token bracket typed-receiver audit

**Agent3, Director #1627, 18 November 2026. Classification: receiver-selection negative with a later source-selector correction. The exact bracket is now independently selected by the phase-zero global rune clock, but no authenticated payload operation, key, plaintext, or receiver is recovered.**

## Frozen object

The original p50 table contains the unique row-major printed-token nesting

`3L 3D [43 tokens] 3D 3L`

at global cells 82..128. The strict 43-token interior is cells 84..126 and has the globally unique printed token `13` at its exact midpoint, interior offset21 / global cell105.

This audit does **not** use the provisional GP-prime/58-page address rule that conditionally reaches the left bracket, and it does **not** use the conventional-base60 `THE -> FOLD -> SB -> END` continuation. The question is whether the 43 printed tokens themselves identify a historically authenticated Cicada receiver.

## Post-closure source-selector correction

A later independent check strengthened condition 1 without changing the receiver decision. The phase-zero continuous clock already singled out by the separate p50/doublet statistic maps each unknown rune's global index modulo256 onto the 256 table cells. The numerical field is inserted after **12,114** unknown runes: p49 begins at global offset12048 and contributes66 runes before the field; p50 has zero runes; p51 resumes at the same offset. Therefore **12114 mod256 = 82**, exactly the left outer `3L` marker of the unique bracket.

This gives a source-derived selector that does not use the provisional 58-page address or any numeral radix:

`rune count to table insertion -> mod256 -> cell82 -> 3L 3D [43] 3D 3L`.

The invariant and its reproducer are recorded in `im-results/lp2-p50-phase0-selfindexed-bracket.md` and `sims/lp2_p50_phase0_selfindexed_bracket_sft.cjs`. It was noticed retrospectively, so it is structural corroboration rather than a calibrated authorship probability. Crucially, it still supplies no operation for consuming the 43 interior tokens. Conditions 2 and 3 below therefore remain unsatisfied.

## Historical type contract

The authenticated or source-pinned Cicada operations already reconstructed in the repository have concrete input contracts:

- **OutGuess:** an image carrier is named or supplied and the extracted object is then consumed by its own type.
- **OpenPuff:** a media carrier plus password is supplied.
- **OpenPGP:** a syntactically valid signed/encrypted packet or clear-signed text is supplied.
- **2014 Stage04 GP shift:** a rune ciphertext plus the specific historical key phrase is supplied.
- **2014 Stage05 transposition:** a seven-column ordering is supplied.
- **2014 GEB book code:** records have the explicit four-field coordinate grammar `title : exchange : word : letter`.
- **2013 BASE29/DH:** signed protocol commands identify integer fields and modular operations.
- **XOR:** historical uses have a separately supplied byte operand or carrier context.

The p50 43-token interior supplies only 43 two-character numerals in table order. No signed or source-authenticated instruction binds that interval to one of the contracts above, specifies a key/password, defines a coordinate grammar, serializes the tokens into a GP stream, or identifies a target object. The signed 2016 sentence saying that words are the map, meaning the road, and numbers the direction likewise does not name this bracket or a payload format.

The repository's existing 43-unit work has already rejected direct p50-to-p55 additive/affine keys, GF29 multiplication/division, the 2014 GEB transfer, period44 full-p55 keying, the historical `FIRFUMFERENFE` additive consumer, and multiple square-derived 43-symbol consumers. Those failures remove the obvious value-to-rune interpretations without licensing a new cipher menu.

## Direct typed-file gate under both source-compatible radices

A direct file-payload interpretation is the one historical type test that can be decided from the 43 tokens alone. Decode the exact printed tokens under both source-compatible digit maps already preserved in the repository:

**Conventional base60**

First eight bytes:

`ad 1c 6f 41 d3 dc c6 31`

The first byte is syntactically an old-format OpenPGP packet header, tag11 (Literal Data) with two-octet length. Its declared body length is **7279 bytes**, while only **40 bytes** remain after the packet header. It therefore cannot be a complete direct OpenPGP packet.

**Drop-lowercase-f base59**

First eight bytes:

`aa 1c 6d 40 d0 d9 c3 30`

The first byte is syntactically an old-format OpenPGP header, tag10 with four-octet length. Its declared body length is **476,922,064 bytes**, while only **38 bytes** remain. It likewise cannot be a complete direct OpenPGP packet.

Neither 43-byte stream begins with the standard signatures for bzip2, gzip, ZIP, PNG, or JPEG. The reproducer includes positive controls for a complete old-format OpenPGP Literal Data packet and the bzip2 magic so these negative recognizers are executable rather than visual inspection.

This does not prove that no arbitrary transform could turn the 43 numbers into a file. It rejects the source-natural direct typed-file reading available without inventing a key, transform, offset, or alternate alphabet.

## Mirror-paired XOR gate

The independently selected bracket itself supplies one further bounded receiver that does not require a guessed key schedule. Its strict interior has odd length43 and a unique center, so split it exactly around cell105:

- left half: cells84..104, 21 tokens;
- center: cell105 = `13`;
- right half: cells106..126, reversed to pair by equal distance from the center.

For this route the page-end-pointer / insertion-phase evidence independently prefers **base60**: the visible page-end values decode to `82,81,80`, beginning at the insertion phase82. This gives 21 source-serialized bytes on each side. Historical Cicada material supplies XOR as a genuine bytewise operation when two byte operands are available, so XORing the two mirror halves is the one new receiver directly licensed by both the object geometry and a historical operation.

The exact mirror XOR is:

```text
cells 84↔126 ... 104↔106
0e 08 62 77 85 31 ec 89 cf ff 0e d4 1b 19 01 51 73 5d 2e 14 65
```

Only **8/21** bytes are printable ASCII, the longest printable run is four bytes, and **7/21** values are below29. The full output is therefore neither a direct GP29 stream nor readable byte plaintext. It begins with none of the already gated bzip2/gzip/ZIP/PNG/JPEG signatures, and its first byte `0x0e` is not an OpenPGP packet header. The reproducer includes a planted 21-byte mirror-XOR plaintext control and recovers it exactly.

The center token `13` is deliberately unused in this test. Applying it as a key, rotation, period, or second transform would add an operation that the source does not authenticate.

**Decision:** the source-natural mirrored-halves XOR receiver is negative. This closes the obvious historical XOR consumer created by the newly authenticated bracket selector without opening a cipher menu.

## Center `13`

The center token `13` is exact and unique, but no authenticated repository source located by exact search supplies a ROT13 instruction or convention that binds `13` to this payload. Historical Cicada transpositions and Vigenere-like steps were accompanied by explicit ordering/key material. Treating the midpoint as ROT13, period13, a 13-parameter key selector, or a cipher-family label would add an unsupported operation.

## Decision for #1627

The issue's positive gate requires all three of:

1. a source-visible reason to select the exact bracket;
2. a fixed operation or format from authenticated Cicada material;
3. a deterministic receiver/key/input specification, validated on a historical or planted positive before use on the original payload.

The bracket now satisfies the first condition through the independent phase-zero insertion selector above. The second and third conditions are absent. The one operation that can be typed directly from the bytes, a file/packet interpretation, fails under both source-compatible numeric maps.

Therefore take the issue's **no source-fixed payload operation** fork. Preserve the unique `3L 3D [43] 3D 3L` nesting and center `13` as conditional structure. Do not promote the 43 tokens to a recovered key or plaintext, and do not continue by adding generic ciphers, free phases, arbitrary 13-based transforms, or guessed receivers.

Reproducer: `sims/lp2_p50_43token_typed_receiver_sft.cjs`.
