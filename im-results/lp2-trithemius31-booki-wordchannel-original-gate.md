# Trithemius Book I's thirty-one modes against original LP2 punctuation and word channels

**18 November 2026, Agent25. Decision: independent literary lead, direct historical readouts negative. No original unknown-page plaintext, author-selected key or deciphering method recovered.** This narrow investigation tests a previously unindexed historical analogue to the manuscript's title, thirty-one large punctuation events and printed rune-word divisions. The source itself has not been linked to Cicada 3301. Treat the number agreement as a hypothesis generator, not a validation.

## The historical procedure actually described

Johannes Trithemius's *Steganographia*, Book I, presents thirty-one spirit-associated concealment systems. The original book opens with the heading **Liber Primus**, an ordinary Latin book heading. Its first chapter, Pamersiel, actually instructs the receiver to take **the first letter of every word**; the [Book I English/Latin critical reading](https://trithemius.com/steganographia-english/) preserves the German instruction “nym di ersten bugstaben de omny uerbo”. The Padiel procedure, exemplified in [Reeds's 1998 scholarly treatment](https://gwern.net/doc/cs/cryptography/steganography/1998-reeds.pdf), takes **every second letter of every second word**. Other modes have different rules; their invocation and sigils identify the intended one. A historical chapter chart additionally locates named spirits at **sixteen** compass-direction sectors, rather than providing thirty-one sequential direction symbols.

This could appeal to a solver encountering a book with a Latin title, prominent marks and constrained word-length typography, especially given Cicada's signed 2016 reference to words and direction. The **critical missing author link** is an actual LP2 clue naming Trithemius, a spirit, a symbol matching the book's sigils, or a sequence assigning the thirty-one modes. No such link was established in this investigation.

## Original physical input and a sharp structural mismatch

The [pinned LP2 transcription](../resources/liber-primus/lp2-transcription.txt), [exact rune corpus](../resources/liber-primus/lp2-corpus.json) and [image-aligned mark inventory](../resources/liber-primus/lp2-punctuation-identity.json) contain **12,956 unknown GP29 runes** and **2,896 complete printed words**, including **32** words carried over physical page boundaries. The original p0–55 illustrations have **31 large marks**: **28 thirteen-dot** marks and **3 ten-dot** marks. Two pairs occur at identical rune offsets (**1,860** and **3,603**). The thirty-first mark sits **after the very last unknown rune at offset12,956**, with no following word.

Therefore the simplest proposed one-mark → one nonempty cover segment → one historical spirit mode map is **structurally impossible at three boundaries**, even before the mode's letter selection. The 31 physical marks provide only two observed dot-count classes, without individual named spirit signs. A different grammar could use terminal marks or empty segments, but no original instruction authorizes it.

## Locked, literal historical readouts

Read the complete original rune words in book order, merging physical page carries. No ciphertext-phase selection, alphabet fitting, key guesses, word-length tuning or extra inverse layer is introduced. Original GP29 coincidence index is `Σ n_r(n_r−1)/(N(N−1))`; uniform GP29 is `1/29 ≈ 0.03448276`. The already-solved clear physical p57 has a higher reference index **0.0627099664** on 95 GP runes.

| Historical rule applied literally | Original unknown output runes | GP29 coincidence index | Opening original transliteration |
| --- | ---: | ---: | --- |
| Pamersiel: first rune of *every* complete word | **2,896** | **0.03442208418** | `S-S-TH-F-O-N-N-H-P-EO-A-B-E-S-Y-B` |
| Padiel: 2nd, 4th, … rune of the 2nd, 4th, … complete word | **2,846** | **0.03460028381** | `Y-NG-J-E-B-S-EO-NG-B-IA-J-D-P-F-U-Y` |

Both source-read tapes remain near uniform with no coherent original-language paragraph. The full **nine original chapter** readouts are reported deterministically by the reproducer; none becomes a readable unencrypted GP29 passage. The Padiel test adds a source-literal operation; the Pamersiel channel **was already tested** as the initial-rune acrostic in [the previous exhaustive word-acrostic gate](lp2-completeword-acrostic-progressive-original-gate.md). It is included only as the direct Book I control, with no claim to re-discover it.

The test also lists one original rune *following* each large mark. Thirty-one marks yield just thirty actual following runes, with duplicates caused by co-located mark pairs. Their transliterated first symbols are `TH-L-S-P-EO-A-G-D-D-X-F-F-L-I-U-EA`; this likewise provides no self-identifying historical mode selector.

## Reproduction and stopping criterion

The committed [read-only Node22 CommonJS SFT](../sims/lp2_trithemius31_original_word_gate.cjs) asserts exact reconstruction of all original runes and printed words, all marker counts and coordinates, original source IoCs, clear p57 control, and each nine-chapter partition. It ran **PASS on Windows**: [workflow 44352745681](https://github.com/FlareZ123/liber-primus/actions/runs/44352745681). All outputs are original-input computations, without training or language-model completion.

**Research decision:** No direct historical first-letter or Padiel-style receiver produces unknown plaintext. The thirty-one-count match and directional vocabulary remain speculative; the absence of source-selecting sigils and the two empty/final marker positions block a justified thirty-one-cipher transfer. Reopen only with an independent first-party cue naming this external source, an exact selectable historical mode and a fully specified reversible operation that recovers a held-out original paragraph. Do not multiply optional alphabet mappings or mark phases to rescue the coincidence.
