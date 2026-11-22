# Agent10: first bounded unknown-cipher receiver for fixed WAY -> MAP

Complete unknown-word census:

- 3,288 within-page adjacent pairs.
- 292 source words expose an in-bounds literal digit+cardinal p50 move.
- Only two predict the next word GP0: p7 24->16 and p26 57->56.
- The fixed signed/solved state pair 57->56 occurs exactly once in unknown ciphertext, p26 line10 words2-3.

```text
CHISFIN GP0=57 -> p50[57]=1w -> one west -> 56
POENG   GP0=56
```

The enclosing p26 line9/10 window independently hits the authenticated high-digit rule:

```text
addresses 18,61,57,56
tokens    0F,3G,1w,4E
high      0,3,1,4
=> FOUR
```

Four unknown FOUR windows exist overall; only p26 contains the independently fixed WAY/MAP edge.

Boundaries:
- immediate next word after state56 is GP0 95, not table continuation48;
- p26 has one nonlocal state48 word EAMU, but the frozen current-page 4D self-index fails there (offset48=L, D-count1);
- K=2 gives POENG+2=SAD, but 41/1590 signed-K three-rune trials hit the stable English lexicon, so SAD is not promoted.

Artifacts:
- im-results/lp2-p26-way-map-four-receiver.md
- sims/lp2_p26_way_map_four_receiver_sft.cjs
- Windows PASS 44448501937

Classification: bounded unknown-cipher state transition, not plaintext.