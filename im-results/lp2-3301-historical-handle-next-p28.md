# Recovered 3301's authentic next screen returns to NEXT → p28 DH

**Agent48, 18 November 2026. Classification: source-constrained historical continuation and navigation closure. No unknown LP2 plaintext, final key, KDF, or complete cipher inverse is recovered.**

## Decision

The existing p27 route recovers the literal historical scalar **3301**. A previously frozen source-number receiver then used zero-based `n mod 256` to address the original 256-cell p50 table, giving `3301 mod256=229` and original token `00`. That modulo operation had remained the weakest premise of the route.

The archived original-ISO 2013 OS program supplies an independent holdout for exactly that operation.

The preserved `prime_echo` source ends on **3301**. After its final two-second pause, the parent Cicada OS script clears the screen and displays the signed message preserved verbatim at `resources/historical/cicada2013-os-original-message.txt`:

```text
@1231507051321

The key is all around you.

Good luck.

3301
```

Apply the **same already-frozen `n mod256` operation** to the source-authored number on that historical next screen:

`1231507051321 mod256 = 57`.

Among the eight authenticated 2013 TCP opcodes `RAND, QUINE, BASE29, CODE, KOAN, DH, NEXT, GOODBYE`, exactly one has canonical whole-word GP0 sum57:

`GP0(NEXT)=57`.

The other historically distinguished `prime_echo` values do not alias any opcode under the same operation:

- `1033 mod256=9`;
- `3301 mod256=229`;
- next-screen handle `mod256=57=NEXT`.

A separate source gate by Agent13 had already fixed what NEXT does at the independently selected p28 receiver:

`NEXT=57 → p50[57]=1w → base60 118 → one-based p28 rune118`.

That is zero-based p28 offset117, the exact printed line+word start of the visible `DH` fragment. Exhausting all eight authenticated opcodes × both source-supported radices × both ordinary rune origins leaves this as the sole p28 line-start/DH hit. Across the 52 physical unknown pages long enough to have rune118, p28 alone has `DH` at that offset.

The resulting historical continuation is therefore:

`p27 parser → 3301 → archived 2013 OS screen @1231507051321 → mod256 57=NEXT → p50[57] → p28 DH`.

This is a genuine independent holdout for the previously weak modulo256 navigation rule. It does not validate the failed p0 cell0-cycle cipher, and it does not recover unknown plaintext.

## 1. Upstream 3301 is independently source-selected

The p55→p27 route uses the original manuscript, the finite historical `prime_echo` source, and the authenticated 2013 BASE29 protocol to obtain literal **3301**. The exact upstream serializer is documented separately. This result does not modify it.

The important point here is ordering. A historical player who has reached final `3301` in the 2013 Cicada OS does not see another prime or an invented continuation. The actual program returns to its parent, clears the screen, and shows the signed message above.

So the number `1231507051321` is the source-authored object immediately following the recovered terminal scalar.

## 2. Reuse the exact prior receiver, with no new modulus

The table visibly has256 cells. Earlier work froze the source-number receiver:

`address(n) = n mod256`.

That same rule gives:

`3301 mod256=229`.

Original cell229 is `00`. A direct repeating cell0-cycle cipher on p0 was tested and rejected; the navigation candidate itself remained open.

The new holdout does not change the rule:

`1231507051321 mod256=57`.

No alternate modulus, radix, digit extraction, decimal substring, factorization, hashing, or fitted offset is introduced.

## 3. Residue57 is the authenticated opcode NEXT

Canonical GP0 values of the finite 2013 TCP opcode vocabulary are computed directly from the standard GP29 transliteration.

Exactly one opcode has value57:

`NEXT=57`.

The comparison is finite and source-bounded. The two already distinguished `prime_echo` numbers 1033 and3301 do not hit the opcode vocabulary after the same modulo256 operation. The historical handle alone does.

This converts the modulo256 step from a one-off table convenience into a rule with a source-authored out-of-sample consequence.

## 4. NEXT already has an independent p28 receiver

The p57/p50 route independently fixes physical p28:

`FIND=42 → p50[42]=0S → 28`.

Agent13's finite receiver gate then applies all eight authenticated opcodes under both candidate table radices and both zero/one-based p28 rune origins.

The sole line-start hit is:

`NEXT=57 → p50[57]=1w → base60 118 → one-based offset117`.

Original p28 offset117 begins the visible fragment:

`DH`.

It is simultaneously a printed line start and word start.

The manuscript-wide receiver census is also selective. Fifty-two physical unknown pages are long enough to have offset117. Only p8, p21 and p28 begin a line there, with fragments `AX`, `PH`, and `DH`. Only the independently FIND-selected p28 has `DH`.

Thus the historical handle's residue NEXT does not merely name an opcode. It lands on an already established, independently selective manuscript receiver.

## 5. The closure connects directly to the ordered SHED state machine

At the p28 DH node, Agent13's local NEXT result selects the next complete p28 word, whose values `[24,25]` have one-based/prime-ordinal sum51=`MUST`.

Independently, the p28-derived DH151 state yields public value66, and cell66 gives clear p57 `WE` under either numeral radix. The solved text continues:

`WE MUST SHED`.

That source order fixes the transition from the 60-symbol p50 numeral state to the drop-`f` 59-symbol state. The shared2 geometry then exposes the newly established DIVINITY/TUNNELNG shell structure and exits through:

`TUNNELNG=94 → base59 p55`.

P55 independently supplies the historical `EMERGE=300` boundary and the `DJU / BEI` handoff back to p27.

Combining only separately preserved source-constrained edges produces a closed navigation candidate:

```text
p27
 → 3301
 → archived historical OS screen @1231507051321
 → mod256 57 = NEXT
 → p28 DH
 → MUST / WE MUST SHED
 → 60→59
 → shared2 circumferences
 → TUNNELNG
 → p55
 → EMERGE=300
 → DJU / BEI
 → p27
```

The cycle is useful because several transitions were established by different source families before this closure was observed.

## 6. Evidence boundary

Three qualifications remain important.

First, the upstream p27→3301 serializer is a source-connected navigation/parser result rather than recovered unknown plaintext.

Second, `n mod256` was originally inferred from the table size. The new historical-handle holdout materially strengthens it, yet no manuscript sentence literally says “reduce source integers modulo256.”

Third, the old branch `3301→229→00` remains a separate conditional continuation. Its direct p0 cell0-cycle cipher is already a bounded negative. This result does not force `00` to mean p0, nor does it rescue that failed cipher.

The next useful work should seek a source-authored exit from the closed navigation cycle or a reversible unknown-cipher operation. Repeating generic key-stream families around the cycle would add tuning without adding a receiver.

## Reproduction

- SFT: `sims/lp2_3301_historical_handle_next_p28_sft.cjs`
- Windows Node22 PASS: [run 44424309622](https://github.com/FlareZ123/liber-primus/actions/runs/44424309622)
- Historical signed message: `resources/historical/cicada2013-os-original-message.txt`
- Independent NEXT receiver: `im-results/lp2-2013-next-p28-dh-pointer.md`
- Local NEXT→MUST continuation: `im-results/lp2-2013-next-p28-successor-must.md`
- Earlier modulo256 branch and failed p0 direct consumer: `im-results/lp2-p27-3301-p50-00-p0-cycle-receiver-gate.md`
