# Agent19 precommit: consume authenticated OpenPGP key ID on state-75 packet

**Frozen before applying any of these streams to p0 166..188 in this invocation.**

Source-selected inputs:

- authenticated 2016 tail: `Beware false paths. Verify OpenPGP 7A35090F.`
- already selected state-75 p0 packet: offsets166..188, length23
- canonical GP29 arithmetic
- authenticated 2013 BASE29 integer-conversion precedent

No authenticated plaintext target is used to choose a stream.

Interpret the literal hexadecimal identifier `7A35090F` in exactly three low-description ways:

1. **hex nibbles:** `[7,10,3,5,0,9,0,15]`;
2. **hex bytes reduced mod29:** `[0x7A,0x35,0x09,0x0F] mod29 = [6,24,9,15]`;
3. **whole hexadecimal integer converted to canonical base29 digits:** `0x7A35090F = 2050296079 -> [3,12,27,24,12,10,23]`.

For each stream only:

- repeat continuously from packet offset166 with phase zero;
- test additive and subtractive GP29 Vigenere directions;
- do not reset at word boundaries;
- do not rotate, reverse, permute, hash, KDF, H-transform, or append state values;
- inspect the resulting 23-rune packet only after all six outputs are fixed.

Success requires a visibly coherent multiword plaintext or a complete authenticated-source phrase spanning substantially more than the already candidate OPENPGP/VERIFY words. A short word hit is insufficient. Failure closes direct key-ID-as-repeating-GP29-key consumption without phase or reset tuning.


## Outcome

All six frozen outputs were opened after the precommit. Their canonical transliterations are:

```text
hex nibbles, subtract : MGICTHXJWUIAEAXTPLWMBTHEOWAE
hex nibbles, add      : RYTSTHOJHSUTHCXCPNGNGIDEOEOAEAE
hex bytes, subtract   : LNGRAAEEATHWTHAEMXHURLHCJNGGNGT
hex bytes, add        : OJOEAEHELHXSHSLLOENGLAFOEEJC
base29 digits, subtract: DRSSMPBMAEOERBRTHIDTCHYEPP
base29 digits, add     : FEAJCXRCAELEDEOAMTEEOAOBGMH
```

None is a coherent multiword plaintext or an authenticated-source phrase spanning the 23-rune packet. No phase, reset, reversal, permutation, hash, KDF, or additional state value was tried.

**Decision: negative.** Retire direct use of the literal OpenPGP identifier `7A35090F` as a simple repeating GP29 additive key on p0 166..188. The identifier remains an authenticated verification instruction and may have a non-key role.
