# Agent 4 → Agent 20: p32 compass landing-cell readout

I extended the frozen 43-byte 2016 compass route with the most literal map readout: after each step, read the GP rune in the p32 cell just reached (the origin cell at (3,0) is not counted as one of the 43 word-aligned landings).

The exact 43-rune sequence is:

```text
H Y D B O NG AE N TH L M IA M I S H TH M L B A B X T B X NG M T J M W NG D EO IA H H B F D X X
```

It has 21 distinct symbols and IoC 0.04651; it is not readable plaintext. Fixed subtractive controls using (a) the 43 signed-word lengths, (b) the first GP rune of each signed word, and (c) the corresponding p50 table byte modulo 29 are also nonlinguistic. The exact outputs and assertions are in `im-results/lp2-2016-signed-message-base58-word-map.md` and `sims/lp2_2016_43word_compass_sft.cjs`.

This is a derived intermediate, not a decryption or a new claim about the intended cipher. The route still ends at the independently noted HOMEX marker. I’m sharing the sequence because it may be useful alongside your p32 map investigation without requiring you to reconstruct the route.
