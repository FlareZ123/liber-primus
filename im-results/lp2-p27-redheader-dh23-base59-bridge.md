# p27 red-header to signed DH23/base59 pointer closure

**Agent18, 18 November 2026. Status: source-constrained structural bridge. This recovers no unknown LP2 plaintext or creator key. It gives a new operation-level connection between the independently selected p27 destination, the original numerical table, and Cicada's signed 2013 Diffie-Hellman worked example.**

## Starting point

The finite 2013 `prime_echo` exhaustion route independently selects the p55 line3/line4 boundary. The first two intact complete words after that boundary are `DJU / BEI`, the only repeated adjacent complete-word pair in p0-p55, whose only other occurrence is p27 line2. This makes p27 a source-constrained destination before using any of the arithmetic below.

Agent14 independently found the decisive conspicuous object on that destination: p27 begins with a red 19-rune heading whose GP-prime sum is **1109**, the **186th prime**. Clear p57 `MUST` also has GP-prime sum **186**, and original table cell186 prints `0J` = **19**, returning the heading length and first-rune GP index. Agent14's separate circumference-shedding analysis continues from the same heading to `WE / MUST / SHED` and should be read alongside this report.

This report freezes that already source-selected address **186** and asks whether its original table behavior supplies the missing operation clue.

## Red13 marker now recovers the hidden exponent and a radix transducer

A later source-only test strengthens this bridge without using the p55/p27 repeated-word handoff. Among the six red spans of length at least13 immediately followed by a red 13-dot mark, p27 alone has a prime GP-prime sum. Its ordinal is186. The visible 13-dot count selects the 13th rune under the sole simple forward/reverse and zero/one-based position convention that divides186: **I**, GP prime31. Thus **186/31=6**, exactly the unique server secret exponent satisfying `5^6 mod23=8` in the signed worked example.

The marker-derived pair **(31,6)** is a valid zero-based p50 coordinate, address254. Original cell254 is `39`; drop-`f` base59 reads it as **186**, while conventional base60 reads it as **189**. These are exactly row23,column2 = `(p,shared)` and row23,column5 = `(p,base)`. The earlier base59 eight-hop walk independently connects186→189 in the signed server-public count8. The one-based coordinate control selects `0u` and fails. This creates a repeat-independent source-internal discriminator for the base59 mechanism and recovers the previously unused DH private exponent. See [the focused transducer report](lp2-p27-red13-dh-radix-transducer.md) and [SFT](../sims/lp2_p27_red13_dh_radix_transducer_sft.cjs).

## Signed 2013 DH tuple closes on the original table

The authenticated 2013 Cicada TCP worked example is:

`DH 23 -> 01 OK 5 8 -> 19 -> 03 DATA 2`

Using the source roles preserved by that example gives:

- modulus `p = 23`;
- base `g = 5`;
- server public share `8`;
- client public share `19`;
- shared value `2`.

The original LP2 numerical table is 32 rows by 8 columns. Under zero-based row-major coordinates, the p27-selected address is

`23 * 8 + 2 = 186`.

That is exactly **row23, column2**, where the column is the signed shared value2. Original cell186 is `0J = 19`, exactly the signed client public share19 and the p27 heading length19. This relation is radix-independent because `0J` has value19 in both the conventional base60 alphabet and the provisional base59 alphabet.

Now use the table literally as a pointer map `next(i) = table_value[i]` and walk exactly the signed server-public count **8** steps from address186.

Under the provisional base59 reading:

`186 -> 19 -> 33 -> 112 -> 72 -> 161 -> 214 -> 247 -> 189`

The endpoint is

`189 = 23 * 8 + 5`,

exactly **row23, column5**, where the column is the signed DH base5. Original cell189 is `3C`; under base59, `3C = 189`, so the endpoint is a **self-pointer**.

Thus one source-selected walk reconstructs the signed tuple geometrically:

`(p, shared) --[value = client share; walk server share steps]--> (p, base)`

or numerically:

`(23,2) --[19; 8 hops]--> (23,5)`.

## Radix and origin control

The same eight-step walk under conventional base60 is:

`186 -> 19 -> 33 -> 114 -> 197 -> 115 -> 247 -> 192 -> 0`.

It does not land at `(23,5)`, and cell189 is not a fixed point in base60.

Exhausting the natural family

`{base59, base60} x {zero/one-based row} x {zero/one-based column}`

gives eight conventions. Exactly one simultaneously satisfies all three frozen requirements:

1. the `(p,shared)` start cell contains client share19;
2. walking server-share8 steps lands at `(p,base)`;
3. that destination self-points.

The sole hit is **base59 with zero-based rows and zero-based columns**. This materially improves the earlier base59/DH23 route because the p27 heading now supplies an independent source-selected entry address rather than beginning from the table root or from a desired DH coordinate.

## Matched-table diagnostic

For a discovery-aware scale check, preserve the exact original base59 value multiset and hold only the two closure-defining source assignments fixed:

- cell186 = 19;
- cell189 = 189.

Their exact multiset probability is `(1/256) * (4/255) = 1/16320`, because value19 occurs once and value189 occurs four times in the original base59 table.

With deterministic xorshift32 seed `0x27182305`, 2,028 of 200,000 matched assignments first reach189 from186 at exactly hop8, a conditional rate of **1.014%**. Combining that diagnostic with the two fixed assignments gives an implied matched frequency of about **6.21e-7**, or roughly **1 in 1.61 million**. This is a post-discovery conditional diagnostic rather than an authorship probability. It is useful because it tests the complete frozen closure against the exact source multiset without fitting a plaintext score.

## Red-span control

Across all 18 original red spans, only six have prime GP-prime sums whose ordinals fit inside the 256-cell table. Under the direct zero-based prime-ordinal address convention, p27 is the only span whose table value equals its own rune length. Under the conventional one-based `rank-1` address, none match.

This control is secondary because the p55 word-map already selected p27 independently. Its value is to show that the p27 red-heading pointer is not a generic property shared by other rubricated spans.

## Authenticated DH receiver semantics gate (Director #1625)

The p27/table bridge reconstructs the signed worked tuple, but the authenticated
2013 protocol does not define a reusable data cipher after that exchange. The
signed `DH [p]` procedure ends by requiring the server to compute the shared
secret and return it literally as `03 DATA [k]`; its worked example is
`DH 23 -> 01 OK 5 8 -> 19 -> 03 DATA 2`. The next protocol procedure, `NEXT`,
is independent: the client sends plain text after `01 OK`, terminates it with
a dot line, and the server records that text as the next instructions.

The pinned March 2013 participant session confirms the same separation at
runtime. Its server computes shared value1067, sends `03 DATA 1067`, and only
afterward receives a separate `NEXT` command followed by a clear
OpenPGP-signed message. The shared integer is not used to transform that
payload. The reconstructed server implementation likewise transmits the
integer and clears the DH session; `NEXT` enters a raw text-recording state.
No KDF, key stretching, byte/rune serialization, IV/nonce, cipher mode,
message authentication, ciphertext framing, or reversible payload receiver is
specified by the signed protocol or observed in the pinned session.

Therefore **shared value2 is not source-authenticated as an LP2 cipher key**.
Turning 2 into GP29 addition, XOR, AES, a stream seed, or any other decoder
would introduce a new operation absent from the authenticated 2013 material.
The p27/base59 closure remains a structural bridge to a genuine historical
Cicada object, while the bridge currently terminates at the typed integer
`03 DATA 2`.

Source boundary:
[`resources/external/2013-tcp-server-signed-source.md`](../resources/external/2013-tcp-server-signed-source.md)
and
[`resources/external/2013-tcp-live-test-vectors.json`](../resources/external/2013-tcp-live-test-vectors.json).

## Consequence

The p55 -> p27 handoff and Agent14's red-heading instruction chain now have a concrete operation-level continuation. The p27 header selects address186; that address is simultaneously `MUST`, the signed DH `(23,2)` coordinate, and the unique table value19. The signed DH server share8 then supplies a walk length that reaches the signed `(23,5)` coordinate, which becomes a fixed point only under base59.

This makes **Diffie-Hellman, zero-based row-major addressing, and base59** materially better motivated as an intended route than they were in the previous table-only analyses. It also gives the existing p57 `FIND/MUST` DH151/base59 construction a new independent reason to test the DH operation family and base59 interpretation.

A subsequent source-visible circumference test closes the remaining private
exponent without introducing a KDF. The signed shared value **2** is used as
the literal number of p50 circumferences to shed, as instructed by clear p57.
The resulting 28x4 rectangle has circumference **60 =
phi(MUST=186)** and uniquely exposes both DH addresses186 and189 on its
boundary. Their shortest perimeter distance is **15**, exactly the unique
client secret satisfying `5^15 mod23=19` and `8^15 mod23=2`. See
[`lp2-p27-dh23-shared2-circumference-client-secret.md`](lp2-p27-dh23-shared2-circumference-client-secret.md).

The route still stops before a reversible unknown-page decryption. Both hidden
private exponents are now conditionally source-recovered, so the next
productive decision is narrower: identify a source-visible receiver or
serialization rule for the complete DH state. Free searches over unrelated
ciphers would discard the strongest new constraint.

Reproduce the original bridge with
`sims/lp2_p27_redheader_dh23_base59_bridge_sft.cjs` and the circumference
closure with
`sims/lp2_p27_dh23_shared2_circumference_client_secret_sft.cjs`.
