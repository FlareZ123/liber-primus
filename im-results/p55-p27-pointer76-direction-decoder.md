# P55 76-step p27 pointer-direction decoder gate

**Agent 10, 11 November 2026. Classification:** decisive negative for one complete, frozen source-selected decoder proposed for Director Issue #41. No unknown plaintext or authentic cipher key is recovered.

## Frozen source path

The upstream p27 header-fold route now fixes several inputs without the rejected 1,432-word to 1,433-rune conversion:

1. The p55 fold selects fragment 18, the p27 red title.
2. The title's only equal fold pair is P/P, whose GP prime weight is **43**.
3. The unequal comparison mask selects physical **p50**, whose 256-cell numerical table can be read as a functional graph by taking each byte as the next zero-based cell address.
4. Starting from source-selected cell **43** gives the already established pointer sequence beginning
   `43,73,79,82,201,74,205,76,114,197,115,247,192,0,203,68,199,47,76,...`.
5. The same title fold independently supplies **76**, exactly the number of original p55 glyphs.

These facts freeze a complete 76-step state clock. The one additional operation tested here interprets the pointer jump as the signed numerical **direction** at each step, consistent with the authenticated 2016 wording that numbers are direction:

`direction_i = (next_i - current_i) mod 29`

and applies the ordinary GP29 Vigenere inverse:

`P_i = (C_i - direction_i) mod 29`.

The start is 43, the clock begins on p55 glyph 0, exactly 76 transitions are consumed, and every original p55 glyph participates. There is no phase, reset, exterior discard, padding, fitted key length, or output-selected sign choice. The inverse is exact:

`C_i = (P_i + direction_i) mod 29`.

The GP29 arithmetic is the model under test. The historical source does not independently prove that pointer displacement must be reduced modulo 29 or used as Vigenere subtraction.

Source versions are pinned by Git blob SHA:

- `resources/liber-primus/lp2-corpus.json`: `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`
- `resources/liber-primus/lp2-grid-256.json`: `39c4f098566fc5eba9d6738416a2fd193f800701`
- `resources/liber-primus/lp1-plaintext-reference.txt`: `beb43aac08b8482590c4430aadd1ee91da3876a0`

## Blind original result

The frozen decoder gives GP-trigram score **-10.7780059285 nats/rune** on the 76 original p55 glyphs. Untouched p55 scores **-10.7902193009** under the same model. The decoded text, preserving the 17 original p55 word lengths, is:

`L / MTWE / FU / CD / IAEOEOTHS / XCAHNAE / LU / GEAMEABMNGNHNGENEO / NFUIARR / EONGND / EOH / PAEIYEUEA / SREONGTAES / OEY / FEOWHCR / HEU / HOEC`

It is not coherent GP prose.

For scale, **179** same-length solved-GP reference windows score from **-8.0517820320** to **-6.6933121274**, with median **-7.3587103615**. The frozen p55 output lies below every solved control.

## Specificity and implementation controls

Keeping the decoder completely unchanged and replacing only the source start cell with each of the other GP prime weights gives a wrong-source specificity family of 29 starts. The selected P=43 start ranks only **7th of 29** by language score. **Six wrong starts score better**, with the best wrong start G=17 at **-10.7167453613**. Thus the selected start is not distinguished by the original output even inside its natural source vocabulary.

For a positive implementation control, a 76-rune solved-GP sample is encrypted with this exact 76-step direction field and then decoded. Recovery is **76/76 exact**, re-encryption is exact, and the recovered control retains score **-7.4876214460**. Original p55 also re-encrypts exactly after decoding. These round trips validate the implementation while providing no evidence for the key.

## Decision

**Reject this exact decoder.** The source-selected p50 pointer graph and P=43 start remain useful navigation structure, while the specific rule "pointer displacement reduced modulo 29, then GP29 Vigenere subtraction for 76 p55 glyphs" does not recover language and lacks source specificity.

Do not rescue this result by changing sign, start, phase, clock, modulus, or pointer arithmetic after inspecting the output. A successor needs an independently visible operation that fixes a different reversible use before touching p55.

**Reproducer:** [`sims/p55_p27_pointer76_direction_gate.cjs`](../sims/p55_p27_pointer76_direction_gate.cjs).
