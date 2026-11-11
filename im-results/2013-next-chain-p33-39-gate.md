# 2013 NEXT payload → p33–39 chain-key hypothesis: exact-length coincidence, bounded negative

**Classification:** reproducible original-cipher negative. The source alignment is unusually specific, but no plaintext, authentic key, or verified LP2 chain mechanism was recovered.

## Why this was worth testing

An independent September 2026 analysis proposes that LP2's 86 adjacent repeated-rune events may reflect a *chain cipher*: each ciphertext rune is the previous ciphertext state plus a step in a 28-symbol alphabet. A zero step is associated with a special plaintext symbol (EA); nonzero steps are modelled as

\[
\Delta C_i = 1 + ((\sigma(P_i)+K_i)\bmod 28).
\]

This is a hypothesis, not an established mechanism. The external report is indexed at `resources/external/leo-y-zhang-liberprimusanalysis.md`.

The p33–39 *page span* has **1,680 runes**, but it is not one source-defined section. Original-image review (Director Issue #329) establishes a 91-rune/23-word titled unit at p33 local offset 0, followed by the 1033/3301 cuneiform body from p33 local91 through p39 local119 (**1,468 runes**); a separate 121-rune unit follows. The historical protocol link therefore pertains to the bracketed 1,468-rune body, while the 1,680-rune page-span count includes both the 91-rune prelude and 121-rune tail. Its 1033/3301 markers have been linked to the 2013 BASE29/DH protocol, making the independently signed March 2013 NEXT payload an obvious historical candidate to test—not an authenticated LP2 key selector. The signed message is preserved at `resources/external/2013-do-not-share-this-information-2.asc`; the existing source note `resources/external/2013-tcp-server-signed-source.md` records its PGP verification and the participant-log link to NEXT.

## The tempting 1 + 1,680 alignment (not source-selected)

Using the canonical GP transliteration (greedy TH, NG, EO, OE, AE, IA, EA; QU→CW, V→U, K→C, Z→S), the signed message body contains **1,710** GP symbols, not 1,681. It contains exactly **29 F symbols**. Applying the already-known LP1 F-interrupt convention to the *key source* as a hypothesis (remove F symbols) leaves **1,681** symbols:

- First remaining rune: **D**, GP index **23**.
- Remaining stream: **1,680** runes, each in GP indices 1–28; subtracting one maps them bijectively to \(\mathbb Z_{28}\).
- Target p33–39: **1,680** ciphertext runes.
- The first p33–39 ciphertext rune is also **D / 23**, exactly matching the proposed IV.
- The target has **12 internal zero differences**. Including the initial equality between IV and the first ciphertext rune gives 13 zero steps.

Thus the arithmetic offers a tempting 1+1,680 split: the first non-F NEXT rune could be read as a 29-state IV, with the next 1,680 as one 28-state step-key symbol per target rune. The 1,681 length is **conditional on F deletion**; it is not the canonical GP length. The match also uses the wrong source unit: the first p33 rune D is inside the separate 91-rune interlude, not the later 1033/3301 cuneiform body. That body begins with NG/21 at p33 local91 and ends at p39 local119; it is 1,468 runes, not 1,680. The IV equality and 1+1,680 alignment are therefore page-span coincidences, not a cross-stage section/key alignment.

**Critical source caveat:** the signed 2013 protocol defines NEXT as client-supplied text storage; the server does not select the text as an organizer instruction. The March message itself is independently PGP-signed by Cicada, so its origin is authenticated. The participant-log NEXT exchange only shows that this signed message was supplied to the storage command; neither the signature nor the protocol assigns it an LP2 key role. Its 29 F runes are ordinary letters inside words such as INFORMATION, FINALLY, FEW, FINAL, FIRST, OF, and IF; no original typography or instruction marks them as cipher interrupts. The LP1 F-interrupt convention is established for specific cipher contexts, not for this message as a key. Deleting every F and treating the first survivor as an IV is therefore an unsupported transformation. The 1+1,680 alignment is a post hoc numerical fit, not source-selected key material. The p33 1033/3301 link does not select the March NEXT payload.

## Frozen inverse family

For each target rune, start with IV D and compute \(\Delta C_i=(C_i-C_{i-1})\bmod29\). A zero step emits EA. For nonzero steps, invert the chain equation above.

The test fixes the key stream to the 1,680 post-IV symbols and evaluates:

1. **Plain GP key map:** GP index minus one, giving \(K_i\in\mathbb Z_{28}\).
2. **DH-selected symbol order:** the signed 2013 worked example's shared value 2 is a primitive root modulo 29. Test the two natural directions \(\sigma(P)=2^P-1\) and \(\sigma(P)=\log_2(P+1)\), as well as identity.
3. Both arithmetic signs and both policies for consuming a key symbol on a zero step.
4. As a separate explicit p5/p56-inspired check, \(K_i=\varphi(\operatorname{prime}(r_i))\bmod28\), with identity \(\sigma\), both signs and both zero-step consumption policies.

This is **16 fixed models**, not an open key/phase search. Every model re-encrypts the original target exactly and recovers a 1,680-rune native-GP positive plant exactly.

## Result

The raw p33–39 stream has IoC **0.03436002** and GP-English trigram score **−11.81503883**. The best of 16 inverses is \(\sigma(P)=\log_2(P+1)\), positive key sign, and key consumption on zero steps; its score is **−11.74267241** and its opening is:

`EA I W C E A D IA L X IA N Y N W C N AE L I T X TH B P I O IA N B B T P D TH D M EO I G G TH B AE W C J U`

The weakest of **2,105** native-GP Gibran 1,680-rune holdout windows scores **−8.30584825** (median **−8.01037896**). No candidate enters the native range (**0/16**); the best candidate remains about **3.44 nats/rune** below even the weakest native window. The totient-of-GP-prime key map has only 12 distinct values and also fails.

**Decision:** preserve the 1+1,680 arithmetic as a tempting but unsupported page-span coincidence. The tested chain-key inverses do not decrypt p33–39; the tested 1,680-rune span includes a separate 91-rune p33 unit, and the 1033/3301 cuneiform unit begins at offset 91. The source does not select the NEXT payload as a key. Retire the direct NEXT-key family. Do not rescue it with arbitrary offsets, alphabet permutations, phases, or new key transformations absent an independent source instruction.

This is a distinct test from the earlier direct Vigenère broadcast. That earlier note's ciphertext interval was not preserved and has been withdrawn in `communications/broadcast/20261111T1754Z_agent24_next-running-key-range-correction.md`; its scores are not evidence for this result.

## Reproduction

Run `node sims/2013_next_chain_p33_39_sft.cjs` from the repository root. It reads the original corpus, the preserved PGP-signed NEXT payload, and fixed Emerson/Gibran controls; asserts the 1,710 → 1,681 → 1+1,680 counts and D/23 IV match; tests all 16 frozen models; and checks exact original round trips, positive-plant recovery, and the native-language holdout gate.

**No change to `results/README.md` is warranted:** this is a bounded intermediate negative, not an established mechanism or plaintext.
