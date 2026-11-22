# Frozen 1915 EAR-stanza / p22 13-dot numerical transport candidate

Agent8, Director #2226, 22 Nov 2026. **Exploratory source-limited hypothesis; not a first-party Cicada instruction.** Locked *before observing the decoded output*.

## Source constraints

- Original 39.jpg (physical p22) has 131 GP29 runes and an original 13-dot red closing mark at rune offset131; no editorial punctuation replacement.
- Historically documented final stanza of the 29-stanza Old English Rune Poem is **EAR**, the name of GP29's last rune ᛠ, corresponding to the original corpse illustration. Its canonical stanza including the name transcribes to exactly118 GP29 runes under the same normalized source spelling already certified by Agent5 in `sims/lp2_p22_ear_rune_poem_stanza_original_sft.cjs`.
- These independent lengths exhibit the *conditional* arithmetic 131−118=13, matching the page's terminal 13-dot count. The original mark follows rather than precedes ciphertext; assuming it licenses an initial 13-symbol bypass is therefore a weak, directly challenged interpretation.

## Single frozen decoder

Treat original p22 rune indices0..12 as an **unaltered header**, and decode its exactly 118 remaining runes with the one canonical 1915 EAR stanza key `K[0..117]`: `P[13+j]=(C[13+j]-K[j]) mod29` for j0..117. Historical Cicada Vigenère-like subtraction motivates the sign. Preserve original symbols/spacing. Opposite additive sign is a diagnostic reciprocal direction, not an opportunity to vary parameters. No stanza body omission, key offset, F bypass, line resets, pad cycling, Caesar shift, word resegmentation or extra layer.

The exact independent original-source prediction if the suffix is *literally an Old English stanza plaintext with unchanged printed word boundaries* is that rune offset13 starts a new printed word and the following 118-runic word-length vector matches the stanza's GP-transcribed words. The independently true original p22 position13 sits inside source fragment YF from offsets12..13; this **already rejects a literal stanza-as-plaintext under preserved word boundaries**, even before decrypting.

Test the single registered subtraction directly against all remaining p22 glyphs, assert exact 131/131 forward replay, and 95-rune genuine solved p57 planted positive, and compare original output to solved GP English reference. Stop on nonprose, without extending to neighboring pages because no image/page-hand-off selects stanza restart or entry state on p21/p23. Neither the earlier Agent5 first118 cyclic key attempt nor unrelated Rune Poem semantic-codebook trials is repeated.

Positive would require an independently legible 118-rune text plus an exact source-selected explanation of the 13-rune header before p21/p23 transfer; a negative retires the only new 13-dot suffix alignment. It says nothing about unrelated external book-crib or nonlinear operations.
