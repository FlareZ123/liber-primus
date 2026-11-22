# Agent3: original p55 moth 30-rune Möbius/Dirichlet crib gate

The solved LP1 p05 source phrase `THE TOTIENT FUNCTION IS SACRED ALL THINGS`, source-native GP lengths [2,7,7,2,6,3,3], matches exactly the physical p55 terminal seven-word **shape**. Phrase's exact GP transliteration: `THETOTIENTFUNCTIANISSACREDALLTHNGS`; physical p55 final 30 ciphertext transliteration: `EOEEAEIGXGSESEOTHTHESTHOECEAIMCXDJUBEI`.

With the source-visible p05 word MOBIUS, I tested directly the conventional 1-indexed GP29 divisor-sum `T(x)[n]=sum_{d|n}x[d] mod29` and Möbius inverse `T^-1(x)[n]=sum_{d|n}mu(d)x[n/d] mod29` on these *complete 30 runes*. `T(plaintext)` matches original ciphertext 0/30; `T^-1(plaintext)` 1/30. Conversely `T(ciphertext)` matches conjectural plaintext 1/30 and `T^-1(ciphertext)` 3/30. The inverse pair reconstructs a GP plaintext plant exactly 30/30. No keys/phases searched. These literal source-motivated one-step operators fail the frozen p05→p55 crib, while other original-anchored operators remain open. Wider Dirichlet implementation `sims/lp1_mobius_dirichlet_original_inverse_sft.cjs` separately covers whole pages and words, but not this later-motivated precise 30-rune crib.


## Independent no-fit periodic/autokey transfer of the same source crib

Under a literal Vigenère C=P+K (mod29), the exact 30-rune crib yields K=`IFEOSDAEAEYEAEXOYSLGNGWMRCSTLEALISYA`. Under Beaufort C=K−P, K=`XWSNGYTOSTHETNGWETAEOHLDSDDHETHNGMIAE`. For each family, one can directly test key repetition K[i]=K[i−L], plaintext-autokey K[i]=P[i−L] and ciphertext-autokey K[i]=C[i−L] on the **untrained 30−L** positions. For the independently salient lags L=5 (5×5 p05 square), 7 (the seven-word crib), 8 (eight table columns), 13 (Fibonacci) and 16 (16-word p55 body), no equation holds more than 3 times, except none; for instance L=13 shows 0/17 Vigenère repetitions and 1/17 Beaufort repetitions, 0/17 or 1/17 matches to shifted plaintext/cipher. Scanning all lags 1–20, the largest match count in either sign/orientation/recurrence is only **4**, a plausible incidental count. Thus the seven-word phrase does not supply a short repeated or source-lag autokey under these direct conventions. Do not fit a separate arbitrary 30-rune one-time pad to the assumed crib, because it has no out-of-sample test.

— Agent3 (13 November 2026)
