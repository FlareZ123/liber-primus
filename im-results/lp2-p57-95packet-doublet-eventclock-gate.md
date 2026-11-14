# Solved-p57 95-rune key and the original 95 doublet-separated packets

**Decision (14 November 2026, Agent13).** One source-grounded event clock uses the 86 rare repeated ciphertext rune events and the nine original visual-chapter starts to select exactly **95** successive key slots, equal to the length of genuine clear LP2 p57. Two frozen, source-motivated additive consumers are fully reversible but yield near-uniform, visibly nonprose GP29 outputs on the complete **12,956-rune original unknown corpus**. Neither original plaintext nor an author-supplied key-operation instruction is recovered. This retires these two precise direct consumers, while preserving the bounded 95-slot source observation.

## Original source-selected numbers and strongest competing explanation

The complete original physical LP2 pages p0–55 contain 12,956 ciphertext runes over nine image-supported visual chapters of lengths **729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308**. The ciphertext has only 86 identical adjacent GP29 runes inside these chapter streams. They occur in chapter counts **4, 6, 9, 10, 11, 13, 12, 18, 3**; splitting a chapter after each repeated output creates **5, 7, 10, 11, 12, 14, 13, 19, 4** possible packets, exactly **95 total**. Independently, the p57 PARABLE solved plaintext contains **95 GP29 runes**, beginning with the seven-rune clear title. These are authentic source quantities.

The strongest rival is **arithmetic coincidence**: 95 follows tautologically from *86 observed repeat events plus nine chosen chapter restarts*. The equality was noticed after both quantities were known. Neither p57 nor an authenticated earlier instruction identifies repeated ciphertext letters as key-advance events, or its own 95 clear glyphs as a keystream. The separate [base28/COBS packet investigation](lp2-antirepeat-base28-cobs-original-gate.md) already records the 95 possible packets; this experiment asks a distinct question about using the real p57 runes as an **explicit source tape**, rather than rechecking binary framing.

## One reversible online cipher and two fixed key readings

Using the original LP2 chapter starts, let `K[0..94]` be the 95 clear p57 GP29 indices in printed order. At each chapter start select the next unused source key glyph, with no fitted offset. For every ciphertext rune `C[i]`, decrypt:

`P[i] = (C[i] - K[event]) mod 29`.

After processing each ciphertext rune, **advance the key event if and only if the current output repeats the immediately previous ciphertext rune in the same chapter**. At the next source chapter start advance again. A repeated symbol is still a plaintext-bearing rune; the event changes the key for *the following position*. The encoder, on receiving plaintext, computes `C[i]=(P[i]+K[event]) mod 29`, compares this emitted ciphertext with the previous emitted ciphertext, and updates the same event state. Induction gives exact reversible online recovery, with no sidecar, synthetic rune repair or hidden matching-mask choice. The original corpus uses precisely K0 through K94.

Two finite, predeclared key interpretations have original Cicada precedents: **(a)** direct GP29 rune ordinals, used in earlier plaintext-as-key Vigenère stages, and **(b)** each p57 rune's published Gematria Primus prime weight minus one, the totient of that prime, modulo 29 (as in the historical prime-totient operation). The sign is `P=C−K` from the authenticated solved p56. No seed, phase, alphabet orientation, skip mask, page-wise key reset or key search was fitted to original output. The model does not assume the p56 transparent-plaintext-F bypass, which requires a separate first-party selection for these unknown pages.

## Original runes, exact positive plant and rejection

| Source-derived 95-slot key | Original decoded GP29 index of coincidence | Decoded E runes / 12,956 | First 16 decoded glyph identities |
| --- | ---: | ---: | --- |
| p57 GP29 ordinal | **0.03445237385115718** | **452** | TH · A · C · M · OE · G · X · T · TH · P · C · H · NG · E · IA · OE |
| p57 GP prime-totient mod29 | **0.034465540762672796** | **465** | TH · A · C · M · OE · G · X · T · TH · P · C · H · NG · E · IA · OE |

The original clear p57 itself has GP29 IoC **0.06270996640537514** and **15/95 E runes**. Both original candidate streams are essentially uniform and not a contiguous readable runic-English message. The standalone [original-input SFT](../sims/lp2_p57_95packet_eventclock_sft.cjs) checks every exact chapter length, every repeat count, the 95-key consumption, the original 12,956-rune encrypt/decrypt identity, and a **95/95-rune authentic-clear-p57 planted plaintext** under the same online clock. The plant is an implementation control and not a recovered ciphertext decipherment.

For any proposed **unchanging bijection within each same-event packet**, including a separately secret alphabet per packet, equality of two adjacent runes within a fixed packet is invariant under that map. The exceptionally small number of original doubles therefore would transfer to its putative plaintext under the declared event-after-repeat clock. A source-selected changing-state rule, distinct transport or different delimiter semantics could evade that restriction; it is outside the tested direct model.

## Next cryptanalytic decision

The equality of 95 event slots with p57's 95 source runes is a compact potentially human-observable **hypothesis cue**, yet it lacks an original instruction selecting a reversible consumer. The most economical historically attested additive source-tape readings both fail on every unknown original rune. **Do not scan more free phases, alternative alphabet mappings or source keys to rescue this count match.** Reopen only if an independent first-party source selects the repeated-rune event clock and a new output map that makes a held-out coherent original plaintext prediction. The broader manuscript remains unresolved.
