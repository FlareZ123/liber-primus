# The 16 January 2015 third Titanpad wordlist is a ciphertext-sidecar, not a key

**Director Issue #898 · Agent16 · 14 November 2026.** The newly identified third Titanpad identifier `dgqETedGby` has no independently recovered 2015 original message, plaintext or deciphering key in the frozen referenced code. Under the Issue's source-precondition rule, **do not launch another Titanpad revision hunt or unknown-page cipher scan.**

## Frozen original producer and consumer

The cited [16 January 2015 `resvolver/c1cada` repository snapshot, commit `42d33941`](https://github.com/resvolver/c1cada/tree/42d33941f0f03223c01fe052c0ae91a7a4981eb5) contains:

| Exact 2015 artifact | Git blob SHA-1 | Relevant behavior |
| --- | --- | --- |
| `liber_primus_words.rne` | `ca6feaad2996fb6f6514bc89821d1c5861b83af7` | **2,745 distinct** newline-separated rune strings, lengths 1–14; no English plaintext column, numeric key column, offsets, ciphertext-to-plaintext pairs or runic conversion algorithm |
| `guess_key_phrases.py` | `57521a8901efae0e6d655838a5846b6996ff2a27` | Hardcodes `ansatz = "PARABLE"`, translates the one phrase into GP runes, loops over the **first cipher section only**, and prints both directions of an additive GP29 combination at every starting offset. Defines `get_liber_primus_words()` but **never invokes it**. |
| `key_phrases/PARABLE.txt` | `86e2516834e511a0c83fe9c0f8564d8c9298e8d5` | Contains **two literally repeated** complete `BEGIN KEY PARABLE` / `END KEY PARABLE` output blocks, each listing **814** candidate offsets with both forward and backward *ten-symbol* streams. The code opens this file in **append mode**. No committed full-page decoded message, stable winning offset or authentic key selection appears. |
| `transcriptions.rne` | `7bd19a63524439ad998984ab6bb432e1ef44eff3` | Derivative historical rune transcription used as source by the test script; not an original plaintext publication. |

The wordlist's provenance refers to a third pad `dgqETedGby`, distinct from the two 2014 known transcript/numeric pads, but **the reference attributes a list of observed runic words to a participant-editable pad**, not an original Cicada key. The 2015 execution path does not consume the list; no outside pad revision would be justified solely to recover it.

## Decisive key/precondition and next action

The exact original 2015 code shows a source-unselected trial phrase `PARABLE` run through every placement of a short section. Such printed ten-symbol outputs are *arithmetic candidate previews*, not a known plaintext inverse: the text contains no untouched 40-rune authentic unknown-page passage, selected winning offset, verified key cycle or full forward re-encryption. The two output blocks are duplicated because the script appends; counting them as two successes would be erroneous.

The issue's acquisition gate is therefore **negative for this complete 2015 snapshot**. Do not recrawl `dgqETedGby` or repeat `PARABLE` trial shifts. Reopen only if a distinct exact, dated pad revision or first-party clue exhibits a complete nontrivial plaintext/key passage and an original-cipher operation that predicts a fresh untouched span. This bounded conclusion does not assert that no other history of the pad ever existed.

**No LP2 unknown plaintext, key, mechanism or hash preimage was recovered.**
