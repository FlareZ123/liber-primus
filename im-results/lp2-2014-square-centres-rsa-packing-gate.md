# Three 2014 square centres form a valid RSA key, but cannot directly encode the original p55 or p50

**Agent49, 21 November 2026. Classification: source-motivated RSA hypothesis with exact original-input direct-packing obstructions. No recovered unknown plaintext, selected RSA consumer, or authenticated mechanism.**

## Human solve-path premise and independent source

The authenticated 2014 Stage10 order of the three original numeric magic-square objects is **5×5 / 3301, 7×7 / 1033, 5×5 / 1033**. Their actual centres, extracted from the original mirrored [745-byte OpenPuff squares](../resources/cicada2014-openpuff-magic-squares.txt), are **[809, 331, 91]**. The known clear LP1 *Some Wisdom* square explicitly places the words “THE PRIMES ARE SACRED”, “THE TOTIENT FUNCTION IS SACRED” and “ALL THINGS SHOULD BE ENCRYPTED” before the third square. The earlier Cicada rounds also use RSA, making the operation historically recognizable.

Read the first two source-ordered centres as RSA primes and the third as a public exponent:

- `p=809` and `q=331` are prime.
- `n=p×q=267779` and `φ(n)=(p−1)(q−1)=266640`.
- `e=91` is coprime to `φ(n)`; its inverse is **`d=26371`**, with `91×26371 mod266640=1`.

This is a complete **mathematically valid** RSA parameter tuple. Its assignment to `(p,q,e)` is a newly proposed interpretation, **not** an author-authenticated decipherment. The independent earlier [square-centre totient/DH correspondence](lp2-2014-square-center-totient-dh23-bridge.md) remains a distinct, retrospective interpretation and should not be collapsed into this RSA proposal.

## Concrete receiver decision: original p55, 76 GP29 runes

The uniquely 76-rune original p55 is a page already selected by the separate p49 `DIRECTION76` and p55 `CIRCUMFERENCES131` route. A naïve RSA direct receiver would read the runes as fixed-width base29 numerical ciphertext.

Since `29³=24389` and `29⁴=707281`, while `n=267779`, a nonnegative RSA ciphertext `0≤c<n` needs up to four base29 digits. Its *most significant digit* can only be `0..10`, so across **any** four-rune block alignment the original leading-symbol class must use **at most 11 distinct GP symbols**. Even if all 29 original symbols are secretly renamed through any *single global bijection*, there can still be at most 11 distinct source glyphs in that leading class.

The untouched original p55 has **76 runes =19×4**. The four original cyclic position classes contain **[14,15,13,15] distinct source glyphs**, respectively. Thus **none** can serve as an RSA leading-digit class for this modulus, regardless of MSB/LSB direction, initial block phase, or any globally fixed 29-symbol relabeling.

Under the literal canonical GP29 numbers, only **6/19** MSB-oriented p55 blocks and **9/19** LSB-oriented blocks are even less than `n`; each candidate must have all 19 valid. This count is a weaker observed-symbol check; the **13–15 > 11** support bound excludes every globally unknown alphabet.

Across the entire original LP2 unknown `12,956=4×3239` runes, every one of the four cyclic position classes contains **all 29 symbols**. The aligned literal GP29 blocks have only **1,193/3,239** (MSB) and **1,218/3,239** (LSB) valid RSA residues. There is no global fixed-four-digit RSA serialization.

## Separate receiver: 256 original p50 numeric tokens

The p50 numeric grid comprises **32×8=256 original two-character tokens**. Interpreting their byte values as a stream of three-byte RSA ciphertext blocks is a natural alternative when `n` needs 19 bits; `256=85×3+1` even permits one header byte.

However a valid big-endian 3-byte representation of `c<n=267779` may start only with byte **0–4**, giving at most **five** distinct leading-byte values. Among the original row-major source token spellings, the three possible byte-phase classes contain **[72,73,73] distinct spellings**. Thus no fixed injective mapping of original tokens to byte values can make any phase an RSA leading-byte stream, regardless of radix59 versus radix60, a one-byte header, or a reversed triple reading. This rejects only **direct standard fixed-width three-byte ciphertext packing**. It does not exclude higher-level use of the table as a key, state, pointer grid, or another framed transport.

## Positive controls, limits and next decision

The [single-file CommonJS original-source regression](../sims/lp2_2014_square_rsa_p55_p50_packing_sft.cjs) reads both the original 2014 squares and the canonical LP2 rune/table datasets. It recovers the source centres, asserts the RSA arithmetic and all four original-symbol obstruction counts, and successfully RSA-encrypts/decrypts **19 valid four-rune** and **85 valid three-byte** planted blocks. The positive blocks satisfy the leading-symbol ceilings, whereas the untouched original receivers do not.

**Decision:** Retain the ordered three-centre tuple as an RSA *parameter candidate* only. Do **not** attempt more blind RSA exponent or language-score tuning against direct p55 four-rune blocks or p50 three-byte blocks: the exact support constraints already exclude *every* fixed bijective symbol alphabet. A defensible successor needs a **historically visible operand or framing instruction** selecting a different receiver or a stateful format-preserving RSA consumer. No plaintext, key schedule, original-cipher inverse, or continuation has been authenticated by this experiment.
