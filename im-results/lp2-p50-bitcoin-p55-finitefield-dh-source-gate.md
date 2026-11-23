# P50 Bitcoin private exponent in p55 SHED finite field: conditional source-typed DH gate

**Agent11, 23 November 2026.** A distinct original-operand key agreement grounded in the *actual* historical 2013 Cicada finite-field DH worked example, not the earlier ECC bridge. **No recovered original LP2 plaintext, cryptographic recipient, or destination.** Reproduced by [single runnable Node22 original-input test](../sims/lp2_p50_bitcoin_p55_finitefield_dh_sft.cjs), [Windows CI PASS 45258704683](https://github.com/FlareZ123/liber-primus/actions/runs/45258704683).

## Source route and exact missing instruction

The original p49–51 number panel's missing \`4C\` selects, *conditionally*, its visually stable fifth column. As eight-bit unsigned base60 values in print order its 32 bytes are \`61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4\`, a valid secp256k1 Bitcoin scalar producing \`1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK\`. This key role remains unverified and may be a vanity-address postselection. The 2013 Cicada DH example confirms that modular exponentiation was a creator-visible operation; the p55 SHED extraction *conditionally* yields a 206-bit prime and generator:

- \`P = 63755441409934721069036418908763882578170591536653256311514221\`, from 43 interior rune digits divided by8.
- \`Q = 1268532719737981052966698570711268391040527137\`, from 32 outer rune digits divided by43, independently verified to generate \`GF(P)*\`.

The source p55 full-word-over-page seam is a **strong alternate reading**, and the chapter does not explicitly instruct a finite-field exchange or importing the p50 Bitcoin scalar. Previous tests used **small exponents 8/43 or 6/15** in this p55 group, or **secp256k1 ECDH with p55 P/Q as scalars**. Neither is this experiment. Here \`P\` and \`Q\` retain their mathematically native typed finite-field roles, and the 32-byte p50 scalar is **the private exponent**, not an ECC base point or password.

Let \`d\` be the base-256 big-endian p50 fifth-column integer; the fully specified standard finite-field DH operation is:

\[
S = Q^d \bmod P
  = 32579403211500201287042576527659943856714297584948586011873661.
\]

Its canonical 26-byte big-endian encoding is \`144632c88b8fe4b0bafe12d38068f4ccc47fba098f75965ed17d\`. The historically conventional raw digest \`SHA256(S_bytes)\` is \`8279bef3cf79bacf24872c682ac25676b7695f29168d898eb29fccbe82e6e4cf\`. The new proposal uses no tuned exponent, trial public value, word selector or elliptic curve. **No first-party instruction specifies SHA256, the receiver, nonce, or additive rune use; these are fixed diagnostic interpretations**, not confirmed creator commands.

## Two frozen original consumers

1. **GP29-native 76-rune p55:** serialize \`S\` canonically in **43 GP0 base29 digits**; repeat the digits from rune0 of original p55 and test each direct \`P=C∓S_digits mod29\` sign. On the original p55 input, subtract gives IoC **0.02842105263**, add gives **0.03333333333**, versus untouched \`0.03789473684\`. Neither produces coherent native GP text, and the source word boundaries do not reveal recognizable language. Both signed interpretations reencrypt all 76/76 original runes exactly; a full clear-p57 **95/95** native-GP plant is recovered under the same chosen 43-rune period without modifying original source.
2. **P50 original 256 raw base60 bytes:** AES-256-CTR with **raw SHA256(S_bytes)** as key, **zero 16-byte IV/counter**, on the entire 256-byte original printed row-major stream beginning at byte0. First32 decrypted bytes are \`b192c08efe521e9b0994d40f232123a3f572effa1f38e6d2884e875085bc28ac\`; **84/256** bytes are printable ASCII and **26/256** lie in the direct GP29 ordinal range, with no recognizable file header or sustained plaintext. A clear Cicada text native-byte planted string encrypts/decrypts exactly under the same operation.

The original P50 source-byte SHA256 is asserted as \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`. The SFT independently reads the original p55 literal word boundaries including the p54 carry, verifies N/8 and E/43, checks the exact p50 private scalar and original compressed public key, derives S with modular exponentiation, and asserts all exact decoded outputs. All checks passed in live Windows Node22, [run 45258704683](https://github.com/FlareZ123/liber-primus/actions/runs/45258704683). Earlier fixed source-p55 field consumers are in [p55 SHED extraction and group tests](lp2-p55-shed-circumference-prime-shell-original.md); the distinct [p50 ECC-bridge gate](lp2-p50-meanpng-p55-shedfield-ecdh-typed-gate.md) is a different group with different scalar roles.

## Decision

The more historically motivated source-typed **\`(P,Q) finite-field DH × Bitcoin private exponent d\`** is a fully specified candidate **field shared secret**. Two direct, reversible consumers of the unchanged **p55 rune text** and **p50 raw numeric bytes** fail to recover original plaintext. Neither does this authenticate the p55 page-local field parse or Bitcoin as the intended author instruction. No reason exists to try arbitrary DH peers, KDF variants, AES IVs, GP clocks, or additional word phases. **Retire these exact direct receivers.** A useful successor would require an independent historical instruction that links the newly calculated finite-field secret to a *specific authentic ciphertext framing*, or a demonstrable plaintext segment with independent forward replay. The [overall authoritative state](../results/README.md) remains unchanged.
