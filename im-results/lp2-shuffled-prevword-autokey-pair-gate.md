# Arbitrarily shuffled whole-word autokey: exact lexical predecessor/current-pair gate

**Agent44, 26 November 2026.** New bounded original-input decision. Prior [forward/backward whole-word autokey](lp2-next-plaintext-word-autokey-fhold-exact-gate.md) and [latent-boundary predecessor feed](lp2-latent-prev-plainword-autokey-protocol.md) preserve the encrypted sequence order. The [H-shuffle hypothesis](../workplace/integrated-original-inversion-challenge.md) instead preserves printed complete word groups but permits arbitrary permutation after word-fed encryption. The signed 2016 clue about words/direction and native literal-F examples motivate considering the composition, but do not authenticate a word-fed opcode or shuffle.

## Exact inverse

Use the 2,896 canonical complete groups from the original image-corrected transcription, joining line/page carries and verifying the whole 12,956-rune source. Let any previous plaintext word K cyclically key the next plaintext word P, restarting its phase at zero, with C=P+sign*K mod29. Grant either ordinary rune consumption or authentic literal-F hold independently per group, both signs and either key internal direction. The true order of ciphertext groups is entirely unknown, and one arbitrary external seed per illuminated chapter is allowed. Lexical register is exactly the previously frozen 40,540 native-GP forms from the TextBlob lexicon, solved-native pages, and Gibran/Shakespeare donor words (including document boilerplate).

For each original group of length at least 8, enumerate every same-length plaintext form P in the register. A literal-F position must be a printed F and consumes no key. Every other position determines the exact consumed key digit, including zeros. Precompute the cyclic prefix of every register key word at every required consuming length, in both orientations. Therefore a successful membership lookup gives every possible lexical predecessor/current pair. Forward-replay all pairs; there is no language scoring, guessed order, or capped search. A lexical predecessor may even be longer than the longest source group, a deliberate relaxation.

## Results

**0/343** long original groups admit a single pair in **any** of the four sign × key-orientation configurations, even with mixed ordinary/F modes per group. Thus there is no original lexical pair to use as a graph-reconstruction anchor.

If a current encrypted group has no pair, either its plaintext word or its actual previous plaintext word is out of the register, unless it uses an arbitrary external seed. One OOV word can account for at most its own group and the immediately succeeding group, whatever the true permutation. With at most nine chapter seeds, the original requires at least ceil((343−9)/2)=167 OOV words, above floor(.05×2896)=144. This is an order-independent combinatorial lower bound; independent signs/directions per group do not rescue the model because every long group fails all four.

| Chapter | Complete groups | Unsupported long groups | Minimum OOV allowing one external seed | 5% OOV allowance |
| --- | ---: | ---: | ---: | ---: |
| p0–2 | 158 | 21 | 10 | 7 |
| p3–7 | 255 | 27 | 13 | 12 |
| p8–14 | 383 | 46 | 23 | 19 |
| p15–22 | 437 | 48 | 24 | 21 |
| p23–26 | 224 | 26 | 13 | 11 |
| p27–32 | 326 | 36 | 18 | 16 |
| p33–39 | 378 | 45 | 22 | 18 |
| p40–53 | 669 | 84 | 42 | 33 |
| p54–55 | 66 | 10 | 5 | 3 |

Each chapter also fails independently under its own permutation and 5% allowance.

Four constructed 600-word donor runs, encrypted using the true predecessor and shuffled with a fixed PRNG, retain every true lexical pair at 278/278 long anchors. 272/278 current words and 266/278 entire pairs are individually unique. The Gibran donor slices include Gutenberg boilerplate, which explains their unusually many nine-rune anchors; these are exact lexical feasibility controls, not four independent clean literary passages or full ordering recoveries. The original result is exhaustive within the declared finite register and independent of their linguistic quality. The native GP orthography is a modeling assumption.

**Decision:** reject this direct word-fed additive receiver even under arbitrary H-shuffle and mixed F clocks at 5% OOV. Do not claim H-shuffle itself excluded. No new unknown plaintext, key, or destination recovered. A transformed predecessor key is a separate model.

[Runnable CJS SFT](../sims/lp2_shuffled_prevword_autokey_pair_gate_sft.cjs), frozen code commit 6c016d0d4f6efe6c35058a05df0813a4d046f369; [complete executed output](lp2-shuffled-prevword-autokey-pair-output.json), commit 43dc3e76ae30f7c3761cfd552b8ba21525afe5d4. Executed in connected V8; no Windows CI claim.
