# Original terminal ring: no autonomous one-byte state decoder

**Agent 11, 16 November 2026.** A bounded original-input negative with an exact hidden-perimeter synthetic positive. This is **not** an unknown Liber Primus plaintext recovery, key, or authenticated 2014 algorithm.

[Single-file source-exact CommonJS reproduction](../sims/lp2_terminal256_byte_state_ring_known180_sft.cjs) · [Passing Windows Node22 manual CI run 43847961796](https://github.com/FlareZ123/liber-primus/actions/runs/43847961796).

## Independent physical motivation and unresolved premise

The table printed across physical LP2 pp49–51 contains **32 rows × 8 columns = 256 original two-character tokens**. Its natural one-cell circumference contains **76 positions**. Peeling inward exposes **68, 60 and 52 positions**, totaling **180**. Independently the last three textual physical pages have exactly **76 undeciphered p55 runes**, **85 authentically solved p56 plaintext runes**, and **95 directly readable p57 runes**. P57 explicitly says to “shed our own circumferences.” Thus a reader could naturally place p55 in the outside ring and the known p56+p57 GP29 text in the inner three rings. The coincidence does **not** prove that these objects share a cipher, or that the table's conventional base60-to-byte interpretation is author-selected; a competing radix59 interpretation exists.

Test one exact simple, reversible stateful model before searching arbitrary tables. Flatten the 32×8 image as four concentric rings starting at each northwest corner and proceeding clockwise. The candidate terminal GP29 index P is transmitted as `B=P XOR S`, where B is the conventional base60 table byte (0–255), and S is an autonomous 8-bit state. The state has a fixed deterministic successor `S' = F(S)` applied once per emitted position, including across ring boundaries. Permit **all possible nonlinear functions** F from 256 states to themselves, with a completely secret initialization and no restriction to affine keys. For the 180 source-known inner values, derive S exactly as `B XOR P`; **do not inspect any of the original 76 p55 ciphertext indices when choosing or rejecting this model**. Use decoded p56 plaintext, not its still-encrypted printed rune string; p57 is already clear.

The model's decisive necessary condition is trivial but key-independent: if a state S occurs at two different positions, it must have the same successor both times. It is an actual reversible text encoder for each possible state path because the output XOR is invertible, regardless of whether F itself is invertible. A stricter subclass has bijective state transitions `F(S)=(aS+b) mod256`, for odd a.

## Original known-180 obstruction

The original table SHA-256 in source order is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Exact byte and GP29 source arrays, original ring geometry and p56 native spelling are asserted by the SFT.

The **180 known inner states have 44 repeated state events, all 44 with incompatible next states**. The first concrete contradiction occurs at inner offsets **7 and 8** (zero-based): the same byte state **143** would have to transition both to **143** and to **206**. Therefore **no possible autonomous deterministic F, even an otherwise arbitrary 256-entry nonlinear lookup table, can encode this exact known text**. The full invertible odd-multiplier byte LCG family has **zero survivors**. No original p55 unknown-runic values enter this certificate.

To show that the reconstruction goal is operational rather than a vacuous round trip, the SFT builds a source-shaped independent plant on the **same four rings and known 180 GP runes**. It encrypts a concealed 76-rune authentic GP passage in the outer cells with `B=P XOR S`, `S'=(5S+17) mod256`, and state seed37. From the 180 inner known symbols alone the exhaustive odd-affine recovery finds uniquely **a=5,b=17**, walks backwards across the 76 hidden perimeter positions via the modular inverse of 5, recovers **76/76 concealed runes**, and exactly re-encrypts **all 256/256** symbols. Original input fails the same receiver before p55 is examined.

## Scope and research decision

This clean negative excludes only the **northwest-clockwise, base60, literal-GP-index-XOR, autonomous one-byte keystream** terminal receiver. It also excludes the fully secret nonlinear one-byte successor table within that precise model. A row-driven or location-dependent state update, larger hidden state, another source-authored byte-to-rune operation, original-ciphertext rather than known-plaintext receiver, different ring directions, and the interpretation that p50 is entirely independent all remain possible.

The original graphic suggests a perimeter and an order but supplies **no visually verified operation selecting XOR or a single-byte state**, and no authenticated table↔p55 link. Other previously tested terminal families include rowwise Möbius maps, GF29 polynomials and static 256-phase lookups. Their negative results cannot be elevated to proof that the table has no deciphering role. An attractive 76+180 count equality alone is insufficient to invent more unselected cryptographic operations.

**Next decision:** prioritize the first independent original-source instruction that specifies an actual byte/rune emission law and state update. Only then spend compute on a larger terminal inverse and require a blind 76-rune original prediction. In the absence of such an instruction, keep p55 encrypted and avoid tuning an arbitrary 256-position lookup against it.
