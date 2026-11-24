# LP2 Latin renderer: exact word-collision obstruction (#2631)

## Result

No stationary deterministic renderer of literal Latin **word strings** can exactly reconstruct LP2 p0–55, regardless of how non-greedy its parsing or how extensive its dictionary is. There are seven equal-expanded-word classes with distinct original rune spellings, involving 22 printed groups. Even an oracle selecting the majority spelling in each class must fail at least eight groups. This strengthens the earlier greedy-only obstruction in #1347; it is not a rejection of context-dependent/stateful rendering or a recovered cipher.

## Source control and test

Use GP0 chart literal transliterations (TH, EO, NG, OE, AE, IA, EA as the seven digraphs), corrected LP2 original layout, and canonical LP1 original layout. Remove line-wrap slash and whitespace, join page continuations within each section; punctuation delimits groups. Source-original LP1 plaintext is obtained by Atbash (warning), exact WELCOME/DIUINITY and KOAN2/FIRFUMFERENFE forward replays from the native solved reference, the affine transform P=2-C mod 29 (KOAN1, 778 runes rather than the edited external 780), and literal clear pages 3, 8–11, 14. The independent heldout solved LP2 p56 prime-minus-one F-hold replay and p57 literal source provide 45 groups. All 694 training groups and all 45 heldout groups agree with greedy chart tokenization; no actual solved group calls for a non-greedy override.

Enumerate all 128 stationary left-to-right digraph-merge masks. Freeze by exact training replay before testing holdout or unknown text. Digraph order TH EO NG OE AE IA EA; training counts 105,0,30,0,2,16,20. Four masks survive because training never encounters EO/OE; all four pass solved holdout.

| Mask | Heldout errors /45 | Unknown errors /2896 |
|---:|---:|---:|
|117|0|858|
|119|0|559|
|125|0|492|
|127|0|175|

## Universal word-local obstruction

For any deterministic f(L), equality of the input literal Latin word L implies equality of the rune output. The original data contradict that necessary condition:

| Literal Latin | Original rune spellings and zero-based group indices |
|---|---|
|EA|ᛠ: 39,923,1179,2737; ᛖᚪ: 530|
|NG|ᚾᚷ: 70,2586; ᛝ: 168,1514,2856|
|IAEO|ᛡᛇ: 183; ᛡᛖᚩ: 1221,1263|
|AET|ᚫᛏ: 566; ᚪᛖᛏ: 1441|
|NGIA|ᚾᚷᛡ: 1051; ᛝᛡ: 2653|
|EOE|ᛖᛟ: 1381; ᛇᛖ: 2889|
|EO|ᛇ: 2073; ᛖᚩ: 2418,2838|

Minimum mistakes = sum over classes (class count - largest spelling multiplicity) = 8. EOE even has equal rune lengths. A renderer incorporating position, punctuation, adjacent words, or an independent state/key may evade this bound, but it requires a separately identified state and is not established by solved plaintext. No source-derived non-greedy rule was found. Do not proceed to arbitrary pre-rune key searches under this impossible stationary model.

## Reproduction

`node sims/lp2_latin_renderer_collision_sft.cjs` from root. Core executed over the actual pinned inputs in the connector JS runtime; standalone wrapper not separately run. Inputs: canonical LP1 blob 37c96b816495c5f93ca658a01c9918bf92598316; corrected LP2 f7b534a33edeb212d427329798438325307463d7; chart/corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; solved reference 1b064ef6d85819b7d96adaff31a82d1ec551598f.

No unknown plaintext or key recovered.
