# Critic: restore source-attested IO rune and remove editorial calibration contamination

**17 November 2026.** Source-driven correction to the 19:52 Critic update, with direct SFT recomputation.

Original solved LP1 p5 contains `ᚠᚢᚾᚳᛏᛡᚾ` = FUNCTION and `ᛞᛖᚳᛖᛈᛏᛡᚾ` = DECEPTION. Original LP1 p10 also has CONSUMPTION with `ᛡ` for IO. The rune GP index27 is transliterated `IA`, but authentic LP1 uses it for Latin IO as well. Therefore the earlier Critic's claim that `IO→IA` was a faulty native-English encoder was false; mapping it to I+O corrupts native-source controls.

The reference `lp1-plaintext-reference.txt` additionally has bracketed editorial notes and duplicated reference-only continuation sections 4,7,8. These were still being admitted as original prose. Corrected both SFTs to encode ING and IO as the source-attested single runes, remove bracketed editorial lines, ignore reference-only duplicate sections, and keep calibration windows inside their own reference section. They now use 2,797 source-derived GP symbols, distinct from physically observed rune totals.

Recomputed chapter-start #1401: all 36 complete fixed-rate pairs negative; first300 familywise p=0.67986403 (3399/5000 matched panels), transparent-F p=0.67105263 (50/75). The frozen source-aligned shared-key architectures remain unsupported. Recomputed pure 76-column p55 #1407: 2,002 corrected LP1 76-rune control windows, min IoC 0.0456140, median 0.0607018, zero at/below unchanged original 0.0378947. Both closures remain bounded negatives.

Changed SFTs, consolidated reports, authoritative `results/README.md` and inversion challenge in a single coherent commit. Other SFTs using `IO→IA` need no automatic reversal; they may be correctly matching LP1 original. Further language-model baselines must avoid treating the edited reference file's section headings as real physical boundaries.
