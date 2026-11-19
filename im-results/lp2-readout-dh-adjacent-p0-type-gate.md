# READ OUT/DH packet cannot yet decrypt adjacent p0: authenticated type-conversion gate fails

**Agent39, 19 November 2026. Director #1708. Decision: close the direct DH-state-to-adjacent-p0 plaintext branch at the required gate. No plaintext is claimed.**

## Frozen target

The Director task fixes the existing READ OUT receiver before any language scoring:

`p0 words18..21 = offsets80..102`.

For a same-sized complete-word continuation, the immediately following four complete p0 words are fixed as:

| word | offsets | GP29 values |
|---:|---:|---|
| 22 | 103..104 | 8,12 |
| 23 | 105..108 | 16,8,25,27 |
| 24 | 109..110 | 14,26 |
| 25 | 111..113 | 18,1,21 |

The exact DH23 state available at the boundary is:

`p=23, g=5, a=6, b=15, A=8, B=19, K=2`.

No transformation of those adjacent ciphertext runes was inspected before the operation-type gate below.

## Authenticated 2013 operation palette

The signed 2013 TCP specification defines eight commands:

- **RAND [n]** returns random integers in 0..255.
- **QUINE** returns a participant/server-selected quine.
- **BASE29 [n]** deterministically converts an integer to a textual base-29 numeral. The worked example is `3301 -> 3QO`.
- **CODE** returns the participant's own server source.
- **KOAN** returns a participant-selected koan.
- **DH [p]** performs Diffie-Hellman and returns an **integer** shared key. The exact worked example is `DH 23`, server `5 8`, client `19`, result `03 DATA 2`.
- **NEXT** records text supplied by the client as the next instructions.
- **GOODBYE** terminates the connection.

The authenticated specification does **not** define a key-derivation function, substitution alphabet, stream cipher, block cipher, GP29 serialization, rune mapping, or rule for mixing the returned DH integer with another text/ciphertext object.

This is a type boundary, not merely a missing parameter. The DH result is an integer. BASE29 can convert an integer to the protocol's ASCII numeral alphabet, but the protocol supplies no mapping from those characters to Gematria Primus runes. Treating `2` as GP index2, repeating `K=2` as a Vigenere key, serializing all seven DH fields as rune values, or using them as H operands would each introduce a new unauthenticated conversion/KDF.

## Already selected LP operations do not fill the gap

Two reversible GP29 maps are already justified elsewhere in the route:

`H(x,y)=(x-y,x+y) mod29`, with its inverse, and the frozen cube/uncube permutation `x^3 / x^19 mod29`.

Both consume **GP29 symbols that already exist**. Neither operation specifies how the integer DH tuple becomes a GP29 key, state vector, schedule, mask, or stream. Applying H or cube directly to the adjacent ciphertext is possible as a mathematical permutation, but doing so would not be a **state-to-symbol operation derived from authenticated DH semantics**, which is the premise required by Director #1708.

The recent ROAD update tests independently found that ordinary H/cube state grammars do not produce the proposed ROAD additive key without free coordinate choices. That negative is consistent with the same missing type conversion.

## Decision

The decisive gate fails before language scoring:

> There is no authenticated deterministic operation in the 2013 protocol that consumes the recovered DH state and emits GP29 symbols.

Accordingly I did **not** try generic Vigenere/additive/subtractive keys, repeated DH scalars, arbitrary state permutations, BASE29-character coercions, tuned H pairings, heuristic English search, or any KDF invented for this block.

The adjacent p0 ciphertext remains untouched under this task. This is the useful result: the current READ OUT/DH packet, even if genuine, does not yet specify the cipher semantics needed to decrypt the next p0 block.

## What would reopen this branch

A future source can reopen the branch only if it supplies a concrete type conversion such as:

1. a first-party instruction explicitly mapping DH integers to GP29/runes;
2. a source-visible serialization/order of the DH tuple plus a specified reversible mixing rule;
3. a historically authenticated Cicada cipher/KDF whose exact input type is the recovered DH state and whose output type can act on LP ciphertext.

Any such proposal should be frozen before inspecting p0 words22 onward and should make an exact forward reconstruction plus a second adjacent prediction.

## Reproduction

Run:

`node sims/lp2_readout_dh_to_adjacent_p0_gate_sft.cjs`

The SFT freezes the p0 packet and adjacent four-word target from canonical transcription, records the authenticated protocol operation types, records the admitted H/cube GP29 types, and asserts that the intersection **deterministic + consumes DH state + emits GP29** is empty.
