# DJU BEI bookend: exact reused-keystream tests

**Status:** original ciphertext, bounded negative. No new LP2 plaintext or source-authenticated key.

The native transcription contains the identical six-rune suffix DJU BEI at offsets 6555–6560 and 12950–12955 (zero-based), separation 6395. It selects an actual prospective repeat distance, without scanning candidate periods. This is distinct from treating the first square block as a known pad for the second.

## Fixed clock

For a deterministic per-phase substitution (including arbitrary additive shifts), same-phase equal plaintext pairs remain equal in the ciphertext. The original at period 6395 has 203 equal pairs out of 6727 possible, including the six explicit echo pairs. This is below every contiguous equal-length native GP window in the repository's 2013 Book of the Law (8656 windows: 389–452, mean 413.45) and Marriage of Heaven and Hell (5676 windows: 396–442, mean 417.32). Thus the source-selected period is inconsistent with these particular native prose controls, independently of key values. This is not an all-English theorem.

## Latent historical F-hold clock

Split at offset 6561, reverse the two portions to align their terminal phases. Allow deletion of any subset of visible F runes (236 and 222 respectively). The hypothesized active period is the number of consuming symbols in the second portion, not necessarily 6395. A dynamic program consumes paired nondeleted symbols or skips a zero on either side; no other skip is permitted. It ends at either exhausted portion, granting arbitrary unmatched prefix. Consecutive equality counts for lengths 1–4 are maximized exactly with capped current equality-run length. The separate maxima are 497, 78, 14, 4. In the reference controls, remove actual plaintext F and compare suffixes; the minimum respective counts are 357/26/1/0 (Crowley) and 356/22/0/0 (Blake). Thus this permissive equality invariant does **not** eliminate latent F alignment. The independently maximized scores need not be simultaneously attainable.

## Exact lexical inverse with arbitrary reused key

Take the last 30 complete printed groups preceding each echo end, in reverse word order. Construct a finite lexicon of 36,700 distinct GP strings from the repository Shakespeare/Emerson/Gibran corpora, TextBlob frequency list and native solved sections, including two transliteration variants. For every observed ciphertext word C and same-length lexicon word P, derive its reversed consuming key sequence: omit a plaintext F only when its ciphertext is F; otherwise use (C-P) mod29. Non-F plaintext may encrypt to F. No key length, key generator, shift values, or zero mask is guessed.

Intersect the concatenated finite profile languages. State (i,j,lead,pending) stores the next word index in each stream and the unpaired consuming-key suffix, with a flag naming its owner. Consume a word from the lagging side and require agreement of the overlapping key prefix. At empty pending choose the larger next printed group (ties first stream). States with identical future-relevant fields merge exactly; the lexicon frequency score only selects a witness, never prunes feasible states. Stop at either exhausted 30-word sequence, a deliberately relaxed acceptance condition. No beam pruning. The source dies after 7 word assignments: layer sizes 1,768,1,768,1,5267,1504,4,0; 9998 candidate transitions, peak 5267 states. The first two echo groups naturally share all key profiles; the contradiction arises in the subsequent unequal group lengths.

A planted two-stream native GP control takes the final 30 words of the solved KOAN and LOSS OF DIVINITY, encrypts both backwards under the same random active key with the genuine F-hold rule, and gives the solver only ciphertext groups. These true words are included in the lexicon. A legal terminal (30,25,3) is reached without hitting the cap, and a frequency-ranked witness recovers 27/30 and 23/25 words exactly. The remaining ambiguity is expected with two unknown plaintexts and an unrestricted pad. This control verifies feasibility and constructive recovery on a matching model, not unique recovery or a blinded external language test.

**Decision:** a common active additive key at both echo ends is exactly incompatible with this finite lexical model, even though the spacing-free collision test survives. The printed groups are not established as plaintext word boundaries, and out-of-lexicon words or different phase relations remain possible. Do not promote this to an unconditional latent-clock impossibility. The two echo ends cannot themselves authenticate a key.

Reproduce: `node sims/lp2_echo_reused_key_exact_gate.cjs`. Experiments performed on repository inputs in V8, not a CI run.
