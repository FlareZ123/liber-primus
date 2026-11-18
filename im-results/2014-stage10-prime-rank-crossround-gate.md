# 2014 Stage10 image-number cross-round gates: prime rank and mod23

**Agent1, 18 November 2026. Director #1638. Classification: exact historical arithmetic, cross-round selector rejected.**

## Frozen arithmetic

The preserved 152-byte Stage10 success response contains exactly three image links:

- `107.jpg`;
- `167.jpg`;
- `229.jpg`.

All three integers are prime. Under the issue's sole admitted transform, one-based prime rank, they map exactly to **28, 39, 50**. The differences are **11, 11**, so the prime ranks form an exact three-term arithmetic progression.

This arithmetic is reproducible and source-visible. It does not by itself establish that prime rank was an authored operation or that the three ranks address Liber Primus.

## Historical filename-family audit

The contemporaneous `micheloosterhof/cicada-2014` archive separates the relevant first-party filename surfaces:

- Stage2's source page references one numeric image, `1033.jpg`.
- Stage10's successful response is the only preserved fixed response containing exactly three numeric image filenames, `107.jpg`, `167.jpg`, `229.jpg`.
- The later seventh-onion delivery index references the complete contiguous sequence `0.jpg` through `57.jpg` in numerical order.
- Other archived stage images use source names or participant reconstruction names such as `zN4h51m.jpg`, `index*.jpg`, and `onion*.jpg`; those are not a second authenticated three-number response family.

Accordingly there is **no independent first-party three-image numeric response** on which the same prime-rank progression rule can replicate. Stage10 is unique as a filename format/event type, so 'unique among comparable triples' is not a meaningful selectivity statistic.

As a descriptive scale only, among the first 50 primes there are 600 unordered triples whose prime ranks form a three-term arithmetic progression, out of 19,600 prime triples, or about 3.06%. This is not a source-preserving null for Cicada filenames and is not used as an authorship probability.

## LP2 prediction audit

The proposed 28/39/50 correspondences do not form one typed address rule:

- **28** is the local rune offset at which the already-known p27 repeated six-rune object begins;
- **39** is the literal two-character token `39` in the already-known p50 table path;
- **50** is the physical page number containing the table.

Those are three different semantic domains: local rune position, cell contents, and page number. Starting only from the Stage10 ranks supplies no rule that says which rank is a page, which is a local offset, which is a token value, which page should host the offset, or which table cell should contain the token. The p27/p50 structures must already be known before the three matches can be named.

The later LP2 delivery's first-party numerical labels do not repair this typing gap. Its index explicitly lists all 58 images `0.jpg`–`57.jpg` in numerical order and contains no instruction to apply prime rank to the earlier Stage10 filenames or to interpret 28/39/50 in mixed coordinate systems.

## Fixed mod23 DH-role follow-up (#1648)

The independently reconstructed p27 circuit selects DH modulus **23** before looking at the Stage10 filenames. Holding that modulus and the preserved response order fixed gives:

- `107 mod23 = 15`;
- `167 mod23 = 6`;
- `229 mod23 = 22 = phi(23)`.

The arithmetic is exact. Under the signed 2013 DH23 example, however, the source-visible value order is **server public 8, then client public 19**. Their unique discrete logarithms base5 are **6, then15**. The private exponents themselves are absent from the signed text. Stage10's residue order is therefore **client exponent15, server exponent6, group order22**, which reverses the two DH parties relative to the authenticated transcript and appends a derived group order. No first-party instruction specifies that reordering or says that image identifiers should be reduced modulo a later manuscript-selected modulus.

The response order has a stronger direct source explanation. The three linked files are byte-identical to consecutive original LP1 pages **14,15,16 in that exact order**, and the filenames themselves are ascending **107<167<229**. The page-sequence identity was established independently from the residue observation.

The matched historical control family is degenerate: as established in the filename-family audit above, Stage10 is the only preserved fixed response containing exactly three numeric image filenames. Stage2 has one numeric image and the later LP2 delivery is the complete sequence `0.jpg` through `57.jpg`. There is therefore **no second comparable first-party fixed triple** from which to estimate source-preserving uniqueness.

For scale only, using the LP2 numerical labels as an explicitly unmatched control, the 58-label sequence has **56 consecutive triples and zero** with residue signature `(15,6,22)`. If arbitrary source-order increasing 3-subsets are admitted, there are **30,856** triples and exactly **one**, `(15,29,45)`, has the same signature. This broader count is not a matched null and is not an authorship probability.

Reproduction: [fixed response/order and numeric-control SFT](../sims/2014_stage10_mod23_dh_role_order_sft.cjs). The exact Stage10-to-LP1 byte identities remain reproduced independently by [the three-image identity SFT](../sims/lp1_stage10_three_images_identity_sft.cjs).

## Decision

The Stage10 filename arithmetic is exact historical structure worth retaining as a note, but both tested cross-round interpretations fail their Director forks. The prime-rank transform does not independently predict the p27/p50 objects, and the fixed mod23 signature does not carry a source-supported DH role order. The preserved historical corpus supplies no matched three-filename replication or typed handoff.

Retire `107/167/229 -> 28/39/50` as a route-selection mechanism unless a new first-party source explicitly binds Stage10 image numbers to prime ranks and specifies a uniform LP2 address type. Do not commission a downstream LP2 operation from this progression alone.

Primary preserved response: [`resources/external/2014-stage10-post-square-response.html`](../resources/external/2014-stage10-post-square-response.html). Historical namespace context: [`im-results/2014-stage10-squares-cgi-source-boundary.md`](2014-stage10-squares-cgi-source-boundary.md) and [`workplace/historical-solve-path-to-original-lp2.md`](../workplace/historical-solve-path-to-original-lp2.md).
