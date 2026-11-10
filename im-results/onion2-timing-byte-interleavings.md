# 2014 onion-2 timing/byte interleavings against original LP2

**Classification: bounded source-derived negative.** This study tests two explicit ways to combine the historical onion-2 256-byte string with its attested inter-arrival timing. Neither recovers original LP2 plaintext. The result does not establish that the historical source is unrelated to LP2.

## Why this was a distinct gap

The pinned source [resources/cicada2014-onion2-timing.json](../resources/cicada2014-onion2-timing.json) contains the 256-byte final string from the historical cu343l33nqaekrnw.onion growing-string challenge and 112 attested inter-arrival intervals for byte positions 143–256. Two positions (190–191) are bounded rather than individually known; their interval units sum to six, giving five allowed pairs: [1,5], [2,4], [3,3], [4,2], [5,1].

The external historical timing investigation already tested the interval values themselves as direct additive/Beaufort GP29 keys and found no threshold-crossing decode. Its preregistration explicitly left interval-driven permutation/skip readings and interleavings with the byte values outside scope ([PREREG](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F5bT-timing-keystream/PREREG.md), [RESULTS](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F5bT-timing-keystream/RESULTS.md)). The raw onion-2 byte string had also appeared in the repository's bounded historical byte-key study, but those tests used direct 32-byte blocks/columns rather than the timing/byte interleavings below ([historical 256-byte key study](historical-onion-xor-grid-source-inversion.md)).

A byte arrives after an interval; the two simplest time-indexed interpretations are therefore (1) hold the previously available byte for each five-minute unit, or (2) use cumulative elapsed units to step through the byte string. These rules are fixed from the source relationship, not selected from LP2 language scores.

## Exact constructions

Let B1,...,B256 be the source bytes and kp the attested interval before byte p, in five-minute units, for p=143,...,256.

### A. Hold-previous-byte time expansion

For each interval kp, emit B(p-1) exactly kp times. This models the last byte already present during the wait for the next byte. Across the 114 interval cells, sum(kp)=240, so each of the five bounded-bridge variants produces a **240-byte** key stream. The source positions used are bytes 142–255; byte 256 is the arrival endpoint, not a held value.

### B. Cumulative-time sampling

Start a cursor at zero. For each interval kp, advance the cursor by kp and emit the source byte at the new zero-based cursor. All five variants advance to cursor 240 and produce a **114-byte** sampled key. The selected source positions are 3 through 241 (1-based); the path is fixed by the cumulative interval sequence.

### Cipher and clock family

Each derived stream was tested under:

- Byte-to-Gematria mappings: b mod 29 and floor(29b/256).
- Forward and reversed stream order.
- Six fixed transforms: Vigenère subtraction, Vigenère addition, Beaufort, and each of those after Atbash precomposition.
- Page-reset repeating and global-continuous repeating clocks. The 240-byte time-expanded stream additionally received page-start one-shot suffix tests, restricted to suffixes of at least 180 bytes so the independent 90-rune training and 90-rune holdout intervals remain available.
- Every rotation of each repeating key; every permitted one-shot start.

This gives **64,920** time-expansion settings and **27,360** cumulative-sampling settings. No LP2 ciphertext was used to construct either key stream.

## Original-input evaluation

The canonical source is [resources/liber-primus/lp2-corpus.json](../resources/liber-primus/lp2-corpus.json): all 55 rune-bearing unsolved pages 0–55, totaling **12,956 runes**. The test selects one common key construction, mapping, direction, cipher transform, clock, and rotation across pages. To prevent a training-only coincidence from being presented as a decode, settings are ranked on the first 90 runes of 25 pages 0–27 with at least 180 runes (2,250 input runes). The selected setting is then scored on the next 90 runes of 22 pages 28–55 with at least 180 runes (1,980 input runes). The selected setting is also applied to complete pages as a diagnostic.

The language scorer is the repository's smoothed GP29 trigram model (same mapping and smoothing as [sims/grid_keyskip_viterbi.cjs](../sims/grid_keyskip_viterbi.cjs)), trained on the first 240,000 characters of the pinned Shakespeare control. The last 60,000 characters supply independent planted plaintext controls. Scores are average conditional log probability in nats per scored rune; less negative is more English-like.

### Results

| Construction | Best training score | Frozen holdout score | Full-page score, all pages | Full-page score, pages 28–55 |
|---|---:|---:|---:|---:|
| Hold-previous-byte expansion | **−5.956215** | **−6.295634** | **−6.234817** | **−6.331927** |
| Cumulative-time sampling | **−6.010085** | **−6.160393** | **−6.155031** | **−6.207504** |
| Raw ciphertext, no transform | −6.179908 | −6.215354 | — | — |

The top time-expansion training candidate is bridge [1,5], reversed, scaled-byte mapping, Vigenère subtraction, page-reset repeat, rotation 208. All five bridge variants tie at the top training score; their untouched holdout scores remain near the random baseline. Its page-28 output begins EA L Y X F X O M O B U R O T O O U P D..., not recognizable plaintext.

The top cumulative-sampling candidate is bridge [3,3], forward, scaled-byte mapping, Atbash-plus-Vigenère subtraction, global repeat, rotation 92. Its page-28 output begins EA X H TH S U R H TH I W EA B NG TH I EA W..., also nonlinguistic.

For scale, the same model scores the known plaintext references for LP2 pages 56 and 57 at **−3.473939** and **−2.420295** respectively; an independent 5,000-symbol deterministic random GP sequence scores **−6.254534**. The Shakespeare heldout sample scores **−2.327945**. The original candidate holdouts therefore do not resemble the known English controls and are at or below the random-symbol reference. The single random sequence is a scale reference, not a calibrated p-value.

## Positive controls

Each construction has an independently planted eight-page English control, using plaintext drawn from the withheld final 60,000 characters of the Shakespeare fixture. The search sees only the first four planted pages' first 90 runes; the remaining four pages and their next 90 runes are held out.

- Time expansion: bridge [3,3], reversed, scaled-byte mapping, Atbash-plus-Beaufort, page-reset repeat, rotation 37. The exact planted setting ranks **1/64,920**; training score **−2.285291**, heldout score **−2.372044**.
- Cumulative sampling: bridge [3,3], forward, byte-mod29 mapping, Atbash-plus-Vigenère addition, page-reset repeat, rotation 37. The exact planted setting ranks **1/27,360** and recovers the planted plaintext.

The script asserts exact inversion of every planted symbol and rank-one recovery for both controls. These controls show that the tested search can recognize the specific planted constructions; they do not prove that either construction was historically used.

## Conclusion and scope

The two most direct timing/byte interleavings do not decrypt original LP2. Their best training fits fail on untouched pages, complete-page scores remain random-like, and the decoded samples contain no recognizable language. The result closes these two specific source-derived constructions, not the entire onion-2 source family.

Not tested here: other permutations or skip schedules, interval/byte arithmetic other than the two stated time interpretations, nonlinear KDFs, interleaving with the LP2 grid, unknown source-dependent state, use of the unattested intervals for bytes 1–142, or a different plaintext register. The 240-byte length is simply the sum of the attested interval units; it is not evidence for an AES key schedule or any particular cipher.

## Reproduction

Run from the repository root:

    node sims/onion2_timing_byte_interleavings.cjs

The script reads only pinned repository resources, prints SHA-256 hashes of the timing and ciphertext resources, enumerates the complete fixed families, emits original training/holdout/full-page scores and plaintext samples, and asserts both planted controls. No CI workflow was created or modified.
