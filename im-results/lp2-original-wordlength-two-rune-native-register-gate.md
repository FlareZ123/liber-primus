# Printed LP2 word lengths: native-prose two-rune deficit on complete original corpus

**Agent16, 23 November 2026. Evidence class: original word-boundary register / exploratory decision; no plaintext, key, identified cipher or destination.** This is an intact-word *premise test* for research into source-visible boundaries. It is not a new algorithm for decrypting LP2.

## Source-driven question

The source image/transcription prints **12,956 runes in 2,896 complete words**, including the 32 words spanning physical page breaks; p50 has no runes. Several attempted decryptions assume that the book's visible word boundaries are precisely the plaintext word boundaries, even though its rune identities look uniform. That assumption is testable without knowing any letter-level cipher: under a **letter-substitution cipher preserving every written word separator**, the exact sequence of word lengths is unchanged by every possible key. Does its word-length histogram resemble the author's known solved native GP29 text, or independent prose of a broadly comparable register?

A whole-word ciphertext may of course be deliberately written in a very unusual register. A departure from a few donor corpora cannot prove spaces were encrypted, added, deleted or altered.

## Original physical and independent GP-native measures

Parse only the 55 rune-bearing original LP2 p0–55 physical pages in the canonical `lp2-transcription.txt`, counting genuine GP glyphs and preserving line/page-wrapped whole words. The source has **448 two-rune words out of 2,896**, exactly **15.4696%**, mean **4.47376 GP29 runes per word**. The independently solved historical native-GP section corpus `relikd-solved-gp29-native-v1.json` has **178 two-rune words out of 733** native words, **24.2838%**. These are source-observed counts, not an English-language or probability assumption.

For a longer-window control, use three pre-pinned reference texts from `resources/control/`: Gibran's *The Prophet*, Emerson's essays, and Shakespeare's first 300k characters. Tokenize Latin words and apply **one frozen GP29 normalization** (`ING→NG; IO→IA; QU→CW; V→U; K/Q→C; Z→S`; longest GP digraph rune matching), keeping punctuation as word separators. Enumerate **every physically contiguous 2,896-word window** within each source. The score is simply how many words have exactly two GP29 runes, regardless of letter identities, guessed keys, message semantics or word-specific cipher.

| Independent donor | Donor words | All contiguous 2,896-word windows | Fewest two-rune words in any window | Original at or below donor minimum? |
|---|---:|---:|---:|---|
| Gibran, *The Prophet* | 15,733 | 12,838 | **612** | **448 < 612** |
| Emerson, essays | 77,932 | 75,037 | **711** | **448 < 711** |
| Shakespeare, first 300k | 55,407 | 52,512 | **527** | **448 < 527** |
| **Total** | | **140,387 overlapping windows** | **527** | **0/140,387 windows** have ≤448 |

The minimum Shakespeare donor proportion is **527/2896=18.20%**; the original is **448/2896=15.47%**. These heavily overlapping 140,387 windows are *not independent trials*, and these books were selected because they were already available in the repository. The result is a clear **source-conditional register mismatch**, not an unbiased p-value or proof for all English literature.

## What changes in the next cryptanalysis decision

This is a **necessary-condition objection** to the common premise “printed word boundaries are ordinary native English words under any letter-substitution cipher.” A fully space-preserving GP29 cipher retains precisely the observed two-rune count; no key choice can restore the *typical word-length frequency* of the studied controls. It does not exclude a Cicada-specific essay deliberately using longer words, highly archaic language, Latin/other language plaintext, an already nonnatural plaintext intermediate, or near-natural spacing with a few shifts.

The **specific alternative worth prioritizing** is an original-source instruction that treats punctuation and inter-word marks as cryptographic symbols: a **GP30 plaintext/ciphertext channel** in which the position of the 30th “space” symbol may move, including whole-rune insertion/deletion or variable-length recoding. This aligns with the live independent #2278/ #2273 research instead of commissioning more unchanged-word cryptograms. The present evidence does **not** identify any particular GP30 transducer or recover a single original unknown word. Demand an independently observable opcode/key and a long genuine plaintext segment before promoting this premise.

**Exact reproducibility:** [single-file Node22 CommonJS source test](../sims/lp2_original_wordlength_native_control_window_sft.cjs). It asserts all 12,956 source runes, 2,896 word count, 448 two-rune words, 733/178 authentic solved native donor words, all per-source window and minimum counts, and zero matches. [Windows Node22 CI45124983133](https://github.com/FlareZ123/liber-primus/actions/runs/45124983133) is the read-only execution record.
