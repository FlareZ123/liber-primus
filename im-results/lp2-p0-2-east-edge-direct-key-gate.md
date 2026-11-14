# p0–p2 27×27 map: direct east-edge repeating-key gate

**Decision:** the literal reading “the key is to go to the east of the map” as “take the map's easternmost column as a repeating GP29 key” does **not** decrypt the first following unknown page or the terminal unknown page under ordinary additive Vigenère. This is a bounded negative for that direct interpretation, not a test of the external 27×27 project's separate three-rune-node / totient / Möbius route.

## Source and frozen extraction

The canonical source transcription is `resources/liber-primus/lp2-corpus.json` (Git blob SHA `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`). Its p0, p1 and p2 rune arrays concatenate to exactly **729 = 27×27** rune indices. Reading the **27th column** from top to bottom gives this fixed key:

- GP29 indices: `[17,17,21,25,7,11,25,28,1,4,16,6,9,24,28,5,1,8,6,19,8,16,18,20,7,21,7]`
- Rune transliteration: `B B NG AE W J AE EA U R T G N A EA C U H G M H T E L W NG W`
- The alternate prime-weight key is derived mechanically as `corpus.prime[index] % 29`; it is printed in full by the reproducer.

The key period is 27. The 729-rune map consumes exactly 27 periods, so p3 starts at phase 0 if the key is applied continuously after the map. The original p0–p54 corpus contains **12,880** runes, so p55 starts at continuous phase **1**. Both page-reset phase 0 and this source-determined continuous phase 1 were tested.

## Frozen test family

Only the following direct interpretations were tested:

1. East edge read top-to-bottom or bottom-to-top.
2. Key symbols interpreted as raw GP29 rune indices, or as their Gematria Primus prime weights modulo 29.
3. Ordinary subtraction (P=C-Kpmod{29}) or addition (P=C+Kpmod{29}).
4. Targets: first post-map unknown page p3 at phase 0; p55 at page-reset phase 0; and p55 at continuous-book phase 1.

No key phase was optimized, and no other key was searched.

## Results

- p3: 217 runes. Original IoC **0.0330688**; the eight east-edge variants produce IoCs from **0.0326848 to 0.0343062**. None yields coherent GP-native text.
- p55: 76 runes. Original IoC **0.0378947**. Page-reset variants produce IoCs **0.0326316–0.0403509**; continuous phase-1 variants produce **0.0308772–0.0392982**. None yields coherent GP-native text.
- Solved clear p57 provides a rough language control IoC of **0.0627100**; the direct east-edge outputs remain ciphertext-like. IoC is only a diagnostic, not a plaintext proof, but the actual rune strings printed by the reproducer are also nonlinguistic.

The direct east-edge repeating-key interpretation is therefore rejected for these two untouched original targets. The result does **not** rule out a different route meaning of “east,” the external project's 3-rune-node decoder, a transposition, or a non-Vigenère use of the map.

## Reproduction

Run from the repository root:

```sh
node sims/lp2_p0_2_east_edge_p55_key_gate.cjs
```

The script asserts the 729-rune map, exact 27-rune edge, p3/p55 lengths, and continuous key phase, then prints every full decoded string and IoC. It uses only Node built-ins and the canonical corpus file.

**Next decision:** do not expand this into arbitrary east-edge transformations. Continue only if a first-party clue specifies a different concrete operation or if the separate 27×27 node route yields a source-fixed, blind prediction on untouched ciphertext.
