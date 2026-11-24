# LP2 typed-section graph: Stage11 and the p56 digest candidate

**Decision, 24 November 2026:** no first-party source currently establishes an executable, internal LP2 producer→consumer edge between physical page sections. The manuscript does contain an explicit external dependency on p56: a page in the deep web is said to hash to a printed 128-hex-character value. The algorithm, exact page locator, and byte serialization remain unspecified. I tested one concrete, previously untested preserved candidate for that edge—the authentic 2014 Stage11 index and its 58 original page JPEGs—under SHA-512 and Whirlpool. None matches. This rejects that candidate set under those two functions; it does not solve or invalidate the wider p56 instruction.

## Source-grounded graph

| Producer / unit | Source-visible output type | Candidate consumer | What the source actually fixes |
|---|---|---|---|
| 2014 Stage10 form | Three magic-square matrices (5×5, 7×7, 5×5) plus the participant's onion URL | The signed CGI endpoint /cgi-bin/squares; participant-hosted /cgi-bin/upload and /key.asc | A real, typed interactive handoff. The archived POST response returns three JPEGs identical to LP1 p14–16. It does not specify a later LP2 cipher. |
| 2014 Stage11 release | An ordered sequence of 58 JPEG images, 0.jpg through 57.jpg | A reader of the Liber Primus image sequence | The original HTML is a flat image index: title 133, div id 331, no scripts, forms, embedded keys, or internal page-group declarations. |
| LP2 p56, AN END | A 128-hex-character / 64-byte digest-shaped target | An unspecified page within the deep web | The text explicitly requires a page that HASHES TO the target, but supplies no algorithm, URL, response/body boundary, or canonicalization. |
| LP2 p57, PARABLE | Legible prose with semantic terms including instar, circumferences, divinity, and emerge | Candidate visual motifs on p53/p55 and previously solved LP1 material | These terms can point a human toward motifs, but do not specify a rune interval, key, cipher, output encoding, or receiving page. |
| LP2 p49–51 | A physically distinct 32×8 numeric panel on p50, between rune-bearing pages p49 and p51 | No source-selected LP2 receiver established | The panel's dimensions and tokens are observable; no first-party instruction identifies a page-section consumer or an authenticated matrix-to-rune transform. |

The Stage10→Stage11 transition is a genuine historical multi-stage protocol because its inputs, HTTP fields, endpoints, and returned image objects are explicit. The Stage11 index itself does not partition the 58 images into named subchapters or connect one page's output to another page's input. A flat image sequence is compatible with independent chapter/page puzzles; it is not evidence of an internal dependency graph.

## New bounded edge test: p56 digest → preserved Stage11 page object

**Human route hypothesis.** A solver who reaches p56 can read its explicit hash instruction. The contemporaneous Stage11 onion release is a natural preserved candidate for a page within the deep web; its HTML index and the 58 image objects are the exact page-level byte objects retained from that release. If the p56 target is the digest of one of these objects under a natural 512-bit hash, one exact equality should appear without rune arithmetic or normalization choices.

**Frozen prediction.** The exact p56 target must equal either SHA-512 or Whirlpool of (a) the exact Stage11 index bytes or (b) one of the 58 original LP2 JPEG files. The physical LP2 p0–p57 pages correspond to combined archive files 17.jpg–74.jpg. No concatenation, trimming, re-encoding, HTTP reconstruction, or per-page variant was admitted.

**Original-byte controls.**
- Stage11 index: 1,640 bytes; Git blob SHA-1 303db130705f0ef9be2a738f4336d5cfcebde80c.
- Its SHA-512: 83e50c118edb70dc34c9c760e332830a066b82006ebbbdcc7347b818d1961a571f32ef5a3717e98e282754d4a004dc0f7f0d99fb3824bb1b281a947c7ba70a31.
- Its Whirlpool: 4e0f749b92b1d465fbe598de7446d9c8867d244ab1af1a93132b3dfcde8dbf47bfbc2c51259d8144dfc8f598d622537792d89d7e0017767fc33bf1ad64d847b8.
- All 58 original LP2 page JPEGs were checked under both functions: **0/58 exact matches**. The p55 source-byte control is SHA-256 a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba, matching the existing original-p55 audit.

The reproducible test is sims/lp2_p56_stage11_release_digest_gate.py. It verifies the Stage11 Git blob and p55 source-byte control before reporting the candidate result.

## Candidate internal edges and the independent-chapter rival

The clearest semantic cross-reference is p57's “instar” language to the moth imagery on p53 and p55; “circumferences” can also direct attention to p55's framed interior. This predicts real, visible motifs before any rune arithmetic. It does **not** uniquely select one page: the moth is repeated, and p53/p55 already have a shared illustration. More importantly, the motif supplies an image/semantic label, not a complete intermediate key or encoded message. The strongest source-motivated p55 OutGuess attempt using the authentic 2013 title The Instar Emergence returned high-entropy, unrecognized bytes with a source-forced header; it did not recover a payload. The p57 five-instar→2013 SSSS→p32 transfer likewise failed to recover a GP key. These are reasons not to repackage the motif as a new cryptographic edge.

The rival interpretation is that LP2 is an ordered manuscript whose individual pages may be separate puzzles or thematic units. That interpretation fits the flat Stage11 index, the lack of first-party internal section labels/consumer rules, and the fact that repeated visual motifs need not be key material. It remains a rival, not a proven authorial design.

## Decision and exact missing dependency

- Reject **p56 → the preserved Stage11 index / its 58 page JPEGs** under the frozen SHA-512 and Whirlpool test.
- Retain **p56 → an unknown deep-web page** as an explicit but incomplete external edge.
- Do not promote **p57 → p53/p55** from semantic/visual cross-reference to a cipher handoff without a source-fixed operand and receiver.
- No internal LP2 typed dependency edge currently meets the required standard.

The missing information is specific: for p56, an authenticated page locator plus the hash algorithm and exact byte boundary; for any internal LP2 graph, a first-party rule that selects a producer section's complete output, fixes its representation, and names or deterministically selects the consuming section and reversible operation. Without that, more page-boundary walks or rune arithmetic would be unconstrained.

## Reproduction

From the repository root (requires Python 3 and OpenSSL with the legacy Whirlpool provider):

    python sims/lp2_p56_stage11_release_digest_gate.py --lp2-dir resources/liber-primus --index resources/historical/stage11-2014-index.html

This is an intermediate negative and does not change results/README.md: no unknown LP2 plaintext, key, complete mechanism, or destination has been recovered.
