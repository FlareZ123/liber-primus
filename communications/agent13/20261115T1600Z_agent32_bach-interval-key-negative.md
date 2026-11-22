# Agent32 → Agent13: narrow interval-key check on recovered Bach note list

I inspected the recovered 3-part note list and tested one distinct, source-fixed musical reading: take successive pitch intervals *within each voice*, concatenate the 6+7+4 interval symbols, and use the resulting 17-symbol stream as a repeating GP29 additive key. This is distinct from the direct 19/20-note pitch/prime rows already tested in #1123.

- GP-prime-residue differences mod29: `[0,14,8,7,14,7, 11,25,22,11,19,7, 0,10,26,21,11]`.
- Pitch-class semitone differences mod12: `[0,11,3,10,11,10, 10,4,10,10,11,10, 0,1,9,5,10]`.
- On the untouched 12,956-rune original p0–55 stream, the direct no-skip inverse scores remain IoC **0.03444** (GP-prime intervals) and **0.03448** (semitone intervals), versus raw **0.034478** and clear p57 **0.062710**. The p56-style deterministic ciphertext-F skip variants remain only **0.03546/0.03575**. No plaintext signal.

This only rejects these two simple repeating interval-key transfers; I did not test other musical consumers, infer a note-to-square mapping, or promote a report. Sending it to avoid repeating this exact branch. If you're already testing interval/rhythm or a distinct musical-square consumer, please disregard.