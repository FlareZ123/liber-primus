# First17 LP1 pages as a basic-gematria key: historical solve-path hypothesis

**Status: promising historical hypothesis; not yet tested as a complete key. No LP2 plaintext is claimed.**

## What the historical discussion actually says

The pinned 2016 #cicadasolvers IRC archive contains two related but distinct discussions:

1. In January 2016, solvers asked whether the first17 pages were meant to decrypt the last57 pages, and whether methods used on the first17 should be reused on the latter. They also noticed competing word counts of 480 and 490; one participant connected 490 to φ(491).
2. On 15 April 2016, participants discussed two symmetric 5×5 matrices in the first17 pages, with total sums 5165 and 16505. They then discussed a short runic sequence as a possible warning and the need for the first17 pages in a shifted form using “basic gematria”. In that exchange, basic gematria was described as the literal mapping of English to runes.

Source: [pinned 2016 IRC log](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/irc-logs/%23cicadasolvers.freenode.2.log), verified Git blob SHA-1 `72634a9d071d32af767edbffc0493d810e88cd0d`. The January and April comments are community hypotheses, not Cicada-authenticated instructions.

## Source-grounded structure

The two matrices are visible in the first release:

- LP1 page5: symmetric 5×5 matrix, row sum 1033 and total 5165.
- LP1 page16: symmetric 5×5 matrix, row sum 3301 and total 16505.

These row sums match the 1033 and 3301 pause values in the earlier Cicada `prime_echo` material. The matrices themselves are already documented in `results/lp1-p05-embedded-matrix.md` and related LP1 matrix investigations. Their individual direct, Hill, and page-power consumers have substantial negative testing; do not simply repeat those attacks.

The archived [idkfa translator](https://github.com/cicada-solvers/idkfa) is relevant historical tooling. Its README records the LP1 segment transformations and keys, while `lib/gematria.js` defines the rune/Latin graph mapping. Its `data/liber` transcription begins with the runic sequence discussed in April 2016. The idkfa README's segment0 recipe uses the inverted Latin mapping; applying that mapping to the opening runes gives a warning-like fragment, but the full warning has not been independently reconstructed here.

## What remains uncertain

- The 2016 “first17 → last57” proposal does not specify the exact key construction or cipher operation.
- “Shifted form with basic gematria” could mean the LP1 plaintext converted to GP29 runes, a shifted Futhark stream, or a key derived from the two 5×5 matrices. The log does not settle this.
- The 480/490 word-count discrepancy is not resolved. A simple token count of the current LP1 plaintext reference does not reproduce either count; the historical count likely used a different transcription or counting convention. Do not treat 490 or φ(491) as established key material.
- The 560.17 file is only raised as a speculative lead in the January chat. Its relation to LP1/LP2 is unproven. The separate offset-zero XOR test against LP2 p0–p16 is negative and is documented in `im-results/lp2-2013-56017-p0-p16-fivebit-xor-negative.md`; that test did not address the actual first17-LP1-to-last57-LP2 proposal.

## Best next experiment

Reconstruct a deterministic **basic-gematria Futhark stream** for LP1 pages0–16 using the original transcription and the documented LP1 page transformations (not merely the plaintext prose file). Preserve page order and record how numeric matrix entries and punctuation are represented. Then test that stream as a repeating GP29 Vigenère key over the 57-page continuation (the corresponding idkfa source segments17–73), using the archived idkfa `Shift.mutate` semantics.

Run only the source-selected variants: default subtraction and reverse-shift addition, with a single global alignment and no page-specific tuning. Use the known solved LP2 p56 page as a holdout/control where applicable; compare IoC and language scores against the unmodified ciphertext. A failure rejects this exact key construction, not every possible first17-page mechanism.

If the direct basic-gematria stream fails, investigate whether the two LP1 5×5 matrices supply the shift/seed or a paired transform. Do not re-run their already-tested individual Hill or page-power attacks.


## Preliminary plaintext-only key check (not decisive)

A quick exploratory check used only the LP1 plaintext-reference sections available for pages1 and3–16 (14 sections; page0 and page2 were absent). It removed digits/punctuation, greedily tokenized the remaining English with the GP29 graph list and obvious aliases, and obtained a 3,313-symbol key. Repeating that key over LP2 p0–p56 under GP29 additive shifts, both signs and all29 global Caesar offsets, produced a best symbol IoC of 0.034508 and no readable output.

This rejects only the incomplete plaintext-only serialization tested. It is not a valid rejection of the historical hypothesis: the first17-page source is incomplete here, numeric matrix entries were omitted, and the exact idkfa page-specific shifted/basic-gematria transformation was not reconstructed. Do not tune this approximate key; build the complete source-derived stream first.
