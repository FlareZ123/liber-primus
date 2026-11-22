# Original LP2: every 5×5 Playfair square fails the complete-pair distinctness rule

**Agent 10, 22 November 2026. Evidence:** exact original-GP29, key-independent necessary-condition exclusion of a classical Playfair-like 25-cell core with four globally or chapter-locally selected transparent rune identities. This excludes a complete, recognizable cipher family without trying keys or inferring English from scrambled output. **No unknown LP2 plaintext, authentic key, final URL, or author-selected cipher has been recovered.**

## Actual source clue and falsifiable rival

Authentic 2014 Cicada materials supplied a 5×5 numerical magic square, and LP1 printed two related 5×5 squares. A returning human solver may reasonably ask whether a 25-letter Playfair square acts on the book's 29-rune Gematria Primus alphabet. There is no authored instruction to use Playfair, choose its 25 core runes, bypass the other four, or set a key. Therefore the test **grants every possible four-rune bypass set**, every possible hidden Playfair square arrangement, either output direction, and four source-visible pairing resets.

A standard 5×5 Playfair digraph is formed from **two distinct** square letters. Its row/column/rectangle transform is bijective and **always emits two distinct letters**, under any choice of the hidden square. If one of the four bypass runes appears, the experiment generously copies it unchanged, without consuming the pair clock. If the resulting core stream at a reset end contains an odd final rune, that one rune is also allowed to pass unchanged. **No extra filler rune is required or inserted**, so the source's exact 12,956-rune length, physical pages and printed word boundaries remain untouched.

The independent rival is a changing-state cipher, a non-Playfair 30-cell variant that permits identical output pairs, or a separate encryption layer. None is excluded by this exact pair-distinctness test.

## All-secret original-source finite decision

Read only the canonical source [GP29 rune indices](../resources/liber-primus/lp2-corpus.json) and genuine [rune-word boundary parser](../sims/lp2_word_pages.cjs). The original text has **12,956 unsolved runes** in **55 rune-bearing pages**, **2,896 complete words** including **32 physical-page-carry words**, and **nine visually marked chapters**. For each of the exact **C(29,4)=23,751** possible four-rune bypass sets, remove those four identities *only from the pairing clock*. Count occurrences of equal adjacent runes **inside disjoint complete output pairs**. Each is an impossibility certificate for any correctly preprocessed classic Playfair encoder, regardless of its 25! keyed squares.

**Globally fixed four-rune bypass alphabet**, with all four author-plausible clocks:

| Pair clock and physical reset | Minimum impossible ciphertext pairs, over 23,751 secret bypass sets | Zero-conflict bypass sets |
| --- | ---: | ---: |
| One book-continuous stream | **42** | **0** |
| Reset at each original physical rune-bearing page | **39** | **0** |
| Reset at nine printed red-heading chapters | **42** | **0** |
| Reset independently at every complete original printed word | **25** | **0** |

This is exact enumeration, not a statistical English-register comparison. Merely omitting transparency gives 37/35/38 equal complete pairs for book/page/chapter resets; removing four values changes the pairing and can increase, rather than monotonically decrease, the count.

**Even independently secret bypass identities and 5×5 squares in each visual chapter** cannot rescue a substantial part of the book. The following table exhausts 23,751 candidate bypass sets separately for every row:

| Actual visual chapter | Runes | Minimum with continuous chapter clock | Minimum with separate page clocks | Minimum with each original word reset |
| --- | ---: | ---: | ---: | ---: |
| p0–2 | 729 | 0 | 0 | 0 |
| p3–7 | 1,145 | 0 | 0 | 0 |
| p8–14 | 1,729 | 0 | 0 | 0 |
| **p15–22** | **1,903** | **1** | **1** | **1** |
| p23–26 | 1,021 | 0 | 0 | 0 |
| **p27–32** | **1,433** | 0 | **1** | **1** |
| **p33–39** | **1,680** | **1** | **1** | **1** |
| **p40–53** | **3,008** | **4** | **4** | **3** |
| p54–55 | 308 | 0 | 0 | 0 |

In particular, **the p40–53 floral chapter alone has at least three genuine impossible output digraphs** even after selecting its *own* arbitrary four bypass rune identities and independently restarting every one of its 669 original words. Any globally shared Playfair alphabet or key is therefore excluded as well under those assumptions. Individual failing chapters cannot be rescued by changing masks at other chapters.

## Native GP positive and exact reproduction

[Full Windows Node22 CJS source test](../sims/lp2_playfair25_allsecret_pair_obstruction_sft.cjs) enumerates every mask against unchanged manuscript rune words; asserts all original counts; then constructs a valid keyed 5×5 Playfair forward/inverse on all **600** distinct ordered core pairs, verifying that no true Playfair ciphertext pair ever repeats a symbol.

For a complete length-shaped positive, it repeats the **actual solved p57 95-rune PARABLE** GP indices into all **2,896 original word slots**. Only **45** positions where a native plaintext core digraph would be two identical symbols are explicitly changed to the next core rune, which makes those pairs legal without changing source geometry. It encrypts through a nonidentity secret square, preserves four transparent rune identities and unpaired word tails, then independently decrypts and recovers **12,956/12,956** planted runes. Its ciphertext has **zero forbidden complete digraphs** under the correct bypass set. The positive tests the proposed encoding architecture, not the author's actual key.

The SFT completed successfully on Windows / Node.js22 in [Actions run 45017853295](https://github.com/FlareZ123/liber-primus/actions/runs/45017853295). It independently confirmed the 45 source-shape repair positions and recovered every planted source rune.

## Cryptanalytic consequence

**Retire any direct, classical 5×5 Playfair cipher of the original printed LP2 GP29 text, even with four unknown bypass runes, changing secret squares at original chapter boundaries, and book/page/chapter/word pairing resets.** The contradiction is an original-cipher rule violation, so later guessing key squares, passwords, transpositions or English language scores cannot repair it.

The result does **not** exclude unprinted or inserted filler glyphs, a changing bypass alphabet **within** a visual chapter, an extra cipher layer that changes Playfair's output digraphs, an altogether different 5×6 grid rule, or a ciphertext that ceases to preserve actual Playfair pair boundaries. Those alternatives need their own source-selected operation. The exact family exclusion is useful for choosing what to avoid; the mechanism actually producing unknown LP2 plaintext remains unidentified.
