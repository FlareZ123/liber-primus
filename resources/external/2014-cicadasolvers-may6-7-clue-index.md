# 2014 #cicadasolvers May 6–7 clue index

**Source:** `cicada-solvers/neuroretransmit-cicada`, `irc-logs/#cicadasolvers.freenode.log`, Git blob `bdd277c14f94c34b5ae714cd00c238065beeed4e`. The blob hash was checked against the raw file in GitHub Actions run [43960402545](https://github.com/FlareZ123/liber-primus/actions/runs/43960402545).

Original source:
- [May 6, 2014, lines 168985–169010](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/irc-logs/%23cicadasolvers.freenode.log#L168985-L169010)
- [May 7, 2014, lines 170970–170995](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/irc-logs/%23cicadasolvers.freenode.log#L170970-L170995)

## What the participants proposed

### May 6: RSA as a bridge from the 256-byte base-60 field to the 128-hex field

Participant `f10ur1ick3r` said they had narrowed the RSA decryption's public/private exponent components to **52 potential pairs**. They believed the 256-byte base-60 field should be run through RSA to obtain the key for a cipher represented by the 128-byte-hex field near the end of the book.

This is a specific historical hypothesis about a two-stage dependency:

`256-byte base-60 data → RSA decryption → key for the 128-byte-hex cipher → rune decryption`

The log excerpt does **not** establish the modulus, the 52 exponent pairs, the RSA padding/block encoding, or that the proposed dependency was correct. It is not evidence that the 256-byte field is an RSA modulus; the participant described it as the input to a decryption.

### May 7: plaintext-word GP and rune position

Participant `Ammar___` proposed that both the plaintext word's GP value and the rune's position might contribute to the prime value or index of the cipher key/rune. They also reported an unexplained relationship between a cipher-rune prime and the plaintext word's GP value, but explicitly said they had not proved the idea.

Another participant, `hick`, pointed to the cuneiform's 1033/3301 base-60 values and suggested the illustrations might contain useful hints. `Ammar___` disagreed, believing only the final page mattered; other participants left the possibility of illustration clues open.

The phrases “word GP and rune position” and “cipher rune prime” are the useful search handles. The message gives no exact formula. It is a solver conjecture, not a Cicada-authored instruction.

## Research implications

Keep the two May 2014 proposals separate:

1. **RSA bridge:** a finite reconstruction task only if the 52 exponent pairs, modulus, and exact 256-byte serialization can be recovered from the surrounding original discussion or another authenticated artifact. Do not guess an RSA modulus or reinterpret the field as one.
2. **Word/prime relation:** a family of word-dependent prime-indexed operations can be tested, but only exact, source-constrained formulas should be promoted. A later bounded test of the simple GP-word-sum → prime/prime-totient stream-index family found no six-rune English preimages; see [the dictionary gate](../../im-results/lp2-word-gp-prime-index-dictionary-gate.md).

Neither IRC proposal is an established Liber Primus mechanism.
