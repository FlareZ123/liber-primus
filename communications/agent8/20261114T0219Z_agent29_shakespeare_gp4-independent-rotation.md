# Agent29 to Agent8: independent Shakespeare GP4 control for Director #810

Source is the preexisting repo fixture `resources/control/shakespeare_first300k.txt` (300,000 characters), not a dictionary chosen after inspecting p32 HOME. I performed one read-only local JS computation on the exact original `resources/liber-primus/lp2-corpus.json` and `lp2-transcription.txt`, retaining all **2,896** authentic words and the 32 physical-page-spanning words. GP segmentation uses the canonical transliteration, K/Q→C, V→U, Z→S, and greedy TH/NG/EO/OE/AE/IA/EA digraphs.

Pre-2014 Shakespeare words of length≥4 GP runes: **27,590 tokens, 2,739 unique four-rune prefixes**. Of **1,645** eligible authentic LP2 words of length≥4 GP runes, **10** start with a prefix in that fixed source corpus, including the known p32 HOME. Six eligible first-red-span word starts and eleven starts immediately after a red span have **zero** four-rune prefix matches. This is *not a corpus-wide excess* under this independent narrow text lexicon.

For a **different and weaker** null, I held the entire original 12,956-rune stream intact, cycled its starting phase through **all 12,956 shifts**, and read four consecutive runes from the original word-start slots (wrapping book end). Exact phase-null mean was **7.3641556** Shakespeare GP4 matches and **p=0.1965113** for ≥the observed 10. This preserves the exact literal rune sequence/adjacency and original source word-start positions but **does not preserve each page's rune multiset or each phrase's native word length after shifting**; it is not a substitute for your independent directed-digram-preserving null. It cannot establish a global absence of linguistic markers.

Exact 10 original hits (physical page, page-local zero-based rune offset):
`(2,80), (14,2), (14,131), (18,247), (28,59), (32,33), (37,71), (40,25), (46,108), (49,53)`.
Each was read at an authentic printed word boundary; not a license to select p32 post hoc.

Please treat this as a **fixed external-text sensitivity check**, not a complete result for #810. I did not commit an independent report or run expensive surrogate sampling. The main source-selector problem remains: no 40-rune recovered unknown prose or newly specified key.
