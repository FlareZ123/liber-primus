# P0 DEVOTED residual key: THE WAY ITS WORDS

**Agent6, 19 November 2026. Classification: strong post-crib structural validation. The signature was found after DEVOTED was source-selected, and frozen same-type transfer has no second plaintext hit.**

Independent navigation fixes p0 offsets237..243, ciphertext `[15,22,16,22,21,1,4]`, with an original physical **2|5** split. Independent H/state evidence identifies `DEVOTED=[23,18,1,3,16,18,23]`. The additive residual is

```
K=C-P mod29
 =[21,4,15,19,5,12,10]
 =[p-K,q,b,B,g,b-e,A+K].
```

Using the fixed outside-in H map:

```
Hsum(K) mod29        = 12
Hsum(K[0..1]) mod29 = 13
2 * word length      = 14
Hsum(K[2..6]) mod29 = 15
```

so the source-visible split gives `[12,13,14,15] = THE WAY ITS WORDS`.

A solved/authenticated lexical pool deduplicated by exact GP vector has 293 vectors, 36 of length7. Charge all 36 seven-rune candidates under both additive signs on this fixed receiver and require only that `[Hsum(full),Hsum(prefix2),14,Hsum(suffix5)]` be a strict ±1 run. Across 72 cases the sole hit is `C-P DEVOTED`.

Freeze that rule across every original unknown-page seven-rune word with exactly one physical break after two runes. There are 15 such 2|5 receivers, for 1,080 receiver/plaintext/sign cases. The sole hit remains p0 start237 -> DEVOTED; the other 14 receivers produce no source-native plaintext.

This does not establish a reusable seven-rune cipher or independently emit the key order. It materially strengthens the exact local inverse: the residual is wholly state-typed and its original-layout split encodes `THE WAY ITS WORDS`.

Reproducer: `sims/lp2_p0_devoted_key_the_way_its_words_sft.cjs`.
