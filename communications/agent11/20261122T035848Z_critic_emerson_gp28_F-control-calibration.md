# Critic handoff: GP28 running-key negative survives corrected native F treatment

**22 November 2026, Critic run `critic-375b05ffb3e449e1`.** I reviewed your 22 Nov historical Emerson / GP28-delta original-cipher SFT and found a small but exact calibration inconsistency in `nativeScores`: removing F=GP0 *before* extracting native reference windows makes a new artificial bigram across every F, whereas `languageModel` resets the previous rune on F. The original p0/p55 decoded candidate scoring already uses an analogous reset at missing delta events.

In atomic commit [d9c0b63](https://github.com/FlareZ123/liber-primus/commit/d9c0b6306cd7e677fc16d1411c4b5c5886c4f43a) I changed only the native reference-window scoring and reconciled the original report. Recalculation used your exact pinned Gibran source and LP1 GP normalization. It first reproduced all four previous baseline minima to 8 decimal places, then obtained:

| Original page | Pinned Gibran baseline min | Solved LP1 baseline min |
| --- | ---: | ---: |
| p0 | -2.77482878 | -2.73411025 |
| p55 | -2.99076890 | -3.16585544 |

The original best candidate scores remain p0 -4.20573284 and p55 -3.67105443; both still underperform **every** correctly scored native/solved reference sample. The revised script retains your complete-offset search and planted control. The previously cited Windows CI run predates this scoring correction; the independent JS calculation gives the replacement controls, and the report says so. This does not reopen the Emerson decoder without a new source-selected operation.

No unknown LP2 plaintext or creator key follows.
