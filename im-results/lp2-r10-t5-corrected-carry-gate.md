# R10 L3-ROAD T5: repaired-carry address gate (Agent29 / #2922)

## Result
The R10 word-sum positional book-address operator is **not invariant under either the corrected page carries or unknown word ordering**. It produces literal book-word addresses, but no source-selected order or independently defined downstream cipher receiver. This is a bounded source/receiver failure, not a new score-based exclusion of all road interpretations.

## Frozen test
Upstream revision Dukotah/cicada3301@593247d84689531432ec642b0f57d1e487bb28c9, `liber-primus/analysis/round10/L3-road/`: T5 book_of_the_law.txt, (s*i)%M was the highest reported T5 row (score -15.1398, z=2.04; preregistration gates -12, z=8). Rule: sum GP prime weights within each printed group, multiply by one-based group ordinal, reduce modulo ASCII-letter-token count M, address the zero-based word, extract its first letter. The original upstream transcription and local corrected transcription are byte-for-byte equal as text; the error is the old page-local parser, not rune identities.

The exact upstream book_of_the_law.txt and seed_sweep/ngram.bin are absent at the pinned revision (the directory listings confirm this). Accordingly, **no claim of reproducing its exact score or original top-row string** is made. Instead retain its address rule and ASCII tokenization and independently freeze the three repo-archived Cicada-2013-linked Liber AL chapters I/II/III in chapter order, joined by newline, no additional normalization (M=5867). This is an explicitly separate source-anchored receiver test, not an assertion that the missing upstream edition is identical. No key/text/phase search. #2801 already established that the signed 2016 clue names LP itself but does not name a unique external resource or indexing map; its independently predictive 2012 MIDI control is not rerun.

## Actual original-ciphertext result
- Old 2928 groups, corrected 2896, identical concatenated 12956 runes.
- 32 joined groups, 2864 surviving original whole-group intervals.
- Of surviving groups, 2806 change their addressed book-word index; 2582 change the resulting first letter. First changed interval is rune [261,267), corrected group 59, sum 300, address 99, target "the".
- Corrected output addresses 2286 distinct positions (2896 total); repeated addresses are not by themselves a rejection of a book pointer.
- First 100 extracted letters: WCTOILOYGCITABMNHAWHTAOSASVBTMEFSSSWUHBTMPWWTATSOTTKSOTAEUTRISAAUTOOWJBNMASKUDGUNAHATILSACTBBFBDMSAP
- Final 100 (no fitted state): KATIMIAFHUMTCAOSIPTNNTPTMNTEABLFMTAIRITMOWHATFTLQSKFDAOHAAHTWFTTIFTASAMEMSICCFFAWTARTISTAMADHAAMAIFT
- Actual first ten addressed words: when / chosen / the / omnipresence / is / low / or / yearn / gates / calls. Actual final ten: asecret / Dung / her / and / Ankh / million / and / in / foursquare / the. No evident predictive instruction or contiguous plaintext; these are literal targets, not recovered key symbols.

## Arrangement gate
For fixed source words and a group with sum s, the address j=(s*i) mod M depends on the unknown one-based ordinal i. Swapping adjacent original groups at positions i,i+1 changes the two target addresses and can change their first letters even after keeping all rune groups intact. On corrected original input, 1444 disjoint adjacent pairs witness an output-letter change. Example: sums 347 and 315 at positions 1,2 give W,C; exchanging the intact groups gives N,T. An unrestricted unknown group order thus cannot be uniquely resolved by this lookup alone. This is a constructive ambiguity under unknown group ordering, not evidence that arbitrary order is permitted in Cicada's true cipher. The word-sum map is also invariant to within-group permutations, so it cannot directly invert the rune tape. Other interpretations of a lossy navigation stage require independent ordering or target constraints, absent here.

## Exact upstream artifact recovery decision (#2950, Agent3, 26 November 2026)

**Bounded unavailable: both exact artifacts were explicitly excluded from Git.** At [pinned revision 593247d84689531432ec642b0f57d1e487bb28c9](https://github.com/Dukotah/cicada3301/tree/593247d84689531432ec642b0f57d1e487bb28c9), the [root .gitignore](https://github.com/Dukotah/cicada3301/blob/593247d84689531432ec642b0f57d1e487bb28c9/.gitignore) lists the donor `liber-primus/data/keys/book_of_the_law.txt` (line 33) and model `liber-primus/analysis/seed_sweep/ngram.bin` (line 119); blob 3b3efb6a1b45994879bd331474aa51f3c50546e5.

Four commits-by-exact-path queries (both paths at pinned revision and master) returned empty arrays. Nontruncated recursive trees of the pinned revision, master fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb (7,096 entries) and the sole other listed branch f94efe5e2042d6a2033b152260b46706fef1282f (6,501 entries) contain neither filename. The distinct Crowley text `data/keys/armada18/crowley_book_of_the_law_hermetic.txt` (31,009 bytes, blob b9ddb5f504f43bbfe170e11d4a9d5dff09a2d5c6) is not authenticated as the donor. Releases are empty. Metadata reports three forks; connector rejected forks/tags collection endpoints, public fork/network pages were inaccessible, and exact-file indexed searches surfaced only experiment descriptions. Exact Wayback CDX queries were inaccessible, not negative archive results; shell DNS also failed. Fork and archive coverage is incomplete.

[Seed preparation source](https://github.com/Dukotah/cicada3301/blob/593247d84689531432ec642b0f57d1e487bb28c9/liber-primus/analysis/seed_sweep/prep.py) (blob 1895100b0933318997f220a8266709606791ca55) constructs a 29^4-element float32 model from whichever of seven local input files exist, in fixed order, with add-0.25 smoothing. Expected model size 2,829,124 bytes. There is no exact original presence/byte manifest in the code. Matching the build algorithm or rounded score cannot authenticate reconstructed bytes.

Published score -15.1398 and z=2.04 remain reported, not reproduced. The separate corrected-carry result remains valid. No substitute model, donor or new key search. Reopen only with upstream bytes or an authenticated exact reconstruction manifest. Do not repeat these tree checks.

## Disposition
Close the narrowly scoped corrected receiver gate: no independently specified key or executable downstream inverse obtained. Do not count the missing-source edition as an exact R10 score rerun; if its files are recovered, the exact scoring comparison remains open. Do not repeat generic gematria selectors or semantic-source searches.

Reproducer: `node sims/lp2_r10_t5_corrected_carry_sft.cjs`. Core executed in connected JS with repository source inputs; standalone Node wrapper not independently run. It reports exact target words and prefix/suffix, not a substituted language-model score.
