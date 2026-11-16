# Author-selected 2014 GEB first-coordinate key: exact LP2 opening gate

**Status (16 November 2026): fixed, independently source-anchored transfer rejected; no unknown LP2 plaintext or author-specified LP2 key recovered.** This is a short, original-cipher test. It does not adjudicate other GEB book-code interpretations.

## Human-visible source route

The genuine 2014 Fifth Onion carried a PGP-signed set of coordinates into Douglas Hofstadter's *Gödel, Escher, Bach*. The 2014 puzzle's solved book-code convention is **chapter-title abbreviation : dialogue exchange : word : letter**, and its first published coordinate is **3PI:6:1:3**. The independently published period solution selects the letter **U**, third letter of **Your** at the beginning of the specified *Three-Part Invention* tortoise dialogue. Thus an actual Cicada-era instruction selects one definite position in a definite external book. That is a stronger key-anchor premise than guessing page indices or selecting a convenient English passage.

First-party/period archive (pinned): [2014 Fifth Onion, book-code coordinates and independent output](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion/README.md). The contemporaneous OCR edition, **used only at runtime, not redistributed**, is [eternal-golden-braid.txt at the same commit](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion/eternal-golden-braid.txt). That edition's exact dialogue anchor is "TORTOISE: Your argument is persuasive" at **UTF-16 code-unit offset 87816**. The source-selected U starts at offset **87828**, and the source-native GP29 stream starts **[1,4,24,4,6,1,19,18,9,16,10,15,13,18,4,15]**.

**Competing explanation:** the GEB coordinate is exclusively an address-construction instruction for the already-solved 2014 Sixth Onion. It is not evidence that the author reused the book as an LP2 keystream. We test one motivated extension and stop at a decisive contradiction.

## Frozen original-cipher experiment

Input: the **unaltered 729 original runes** of LP2 physical pp0–2 from resources/liber-primus/lp2-corpus.json (262+266+201). Preserve their original printed order. Key: the complete GEB text **after the Cicada-selected U**, strip nonletters and encode with real Gematria Primus alphabet plus the author-observed normalizations QU→CW, V→U, K/Q→C, Z→S. Test two exact orthographies: native ING→NG-rune and IO→rune27, versus inventory-label transliteration only.

No offsets, repeating periods, page shifts, random seeds, external interpolation, language-fitted parameters or ad hoc characters. For key indices K[i] and original cipher indices C[i], test the two standard additive directions:

    P[i] = (C[i] ± K[i]) mod 29

with the key consuming every ciphertext rune. Also test the **real solved-p56 plaintext-F transparency rule**, under which emitted plaintext F (GP index0) produces ciphertext F and consumes *no* key symbol. For a fixed source key and sign, each plaintext position either (a) consumes its next key symbol and must decode to **nonzero** plaintext or (b) is plaintext F, which requires ciphertext F and leaves the key index unchanged. Enumerating all reachable key-consumption counts is an exact complete inverse. Every synthetic planted solved-p57 positive (95 real native-GP plaintext runes, including F) survives the exact same inverse for both signs and both orthographies.

| Source-to-GP spelling | Sign in P=C±K | Direct 729-rune IoC | Complete transparent-F original inverse |
| :--- | ---: | ---: | :--- |
| Source-authentic ING/IO | − | 0.034293552812 | **No path after rune 5**, index4 |
| Source-authentic ING/IO | + | 0.034142811921 | **No path after rune 55**, index54 |
| Inventory-label only | − | 0.034380228825 | **No path after rune 5**, index4 |
| Inventory-label only | + | 0.033928006150 | **No path after rune 55**, index54 |

Original cipher IoC is **0.034082515564**. The four direct outputs are ciphertext-like; the F-transparent branch has exact source-rune algebraic contradictions independent of any English language model. This directly excludes the specific source-selected U-onward GEB running key beginning at LP2 p0 under both standard GP29 additive signs, with or without F bypass.

The **Windows Node22 single-file reproducer** reads the canonical ciphertext, fetches only the pinned source-2014 OCR at runtime, asserts the exact source anchor, calculates the four outputs, enumerates all F-bypass paths, and synthesizes 95-rune original solved-p57 positives for each branch: [reproducer](../sims/lp2_geb_2014_first_coordinate_runningkey_sft.cjs). [Full passing Windows run 43782475796](https://github.com/FlareZ123/liber-primus/actions/runs/43782475796) contains all four numerical outputs and positive controls; [workflow](../.github/workflows/agent12-geb-first-coordinate-sft.yml).

## What this changes

Do not direct another direct GEB source-start additive GP29 key sweep at this particular authentic coordinate: the four obvious native variants are fully decided on original ciphertext. Continue investigating genuinely **coordinate-based** chapter/exchange/word/letter use only if a separate LP2 clue supplies a sequence of coordinates, rather than treating the old address extraction as an LP2 key. That external text is authored by Hofstadter and may require legal access in future use; do not copy the entire OCR book into repository resources.

No recovered key, plaintext, missing hash preimage, or LP2 destination. The gate does not exclude GEB as a book-cipher source with different addresses, a hidden downstream alphabet, stateful keys, different original page-start alignment, or other independent mechanisms.
