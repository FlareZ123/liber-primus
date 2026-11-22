# p1–p2 source-first transition gate: the tortoise-shell key does not decrypt

**Agent43 · 19 November 2026 · Director-task Issue #1936.** Classification: bounded original-source negative. No unknown plaintext, authentic key, or new cipher mechanism was recovered.

## Decision

The only new page-specific visual lead in p1–p2 is the tortoise/turtle-like footer illustration on physical p2. It reasonably suggests a shell/circumference operation. I tested the strongest simple version: use each complete word's first and last GP29 runes as a repeating, word-local key for that same word's interior. The frozen subtractive GP29 transform makes the p2 interior less English-like than the raw interior and fails a native-language control decisively.

The tempting 76-rune p55 match is not real. It requires cutting the first p2 word at the page boundary and counting a singleton word's only rune twice. The original word contract does neither. With the true p1→p2 carried word and singleton-once rule, p2 contributes **73 shell runes and 128 interior runes**. No LP2 page has 73 runes; p55 has 76.

**Retire this p1–p2 opening-transition branch.** The turtle is a plausible visual shell cue, but it does not select a successful key consumer or page-transition cipher. Do not expand this result into unregistered phase, sign, reversal, reset, or padding variants.

## Correct physical source mapping and inventory

The LP2 image sequence starts at archive image 17.jpg, not 00.jpg. Thus p0–p3 are archive images 17.jpg–20.jpg; the tested originals are p1=18.jpg and p2=19.jpg. The adjacent controls are p0=17.jpg and p3=20.jpg.

| Physical page | Original image | GP29 runes | Printed lines | Source-visible features |
|---|---|---:|---:|---|
| p0 | 17.jpg | 262 | 12 | Red 13-rune opening span and red 13-dot mark; shared side-staff/cross and loop ornaments |
| p1 | 18.jpg | 266 | 12 | No red rune span; five small full-stop marks; same side-staff/cross and loop ornaments |
| p2 | 19.jpg | 201 | 9 | No red rune span; one small full-stop near the beginning; terminal red 13-dot mark; unique tortoise/turtle-like footer drawing |
| p3 | 20.jpg | 217 | 11 | New botanical/scroll-like page design, red opening and later spans, repeated red 13-dot marks |

No page number, numeric table, explicit key label, or visible page-transition instruction appears on p1 or p2. P1 and p2 are ordinary rune-text pages. The p2 illustration is the only distinct footer animal among these four controls; its shell is the only plausible new visual selector.

The repeated side-staff/cross art on p0–p2 is not new p1/p2 key material. The existing source-plate analysis **im-results/lp2-p0-p2-orthodox-cross-source-plate-gate.md** already documents the reused artwork and its image-level correspondence. Existing p0→p1 shared-pad and p0→p2 direct-transfer investigations are also negative (**im-results/lp2-p0-p1-cross-sharedpad-original-gate.md**, **im-results/lp2-p0-p1-blind-transfer-gate.md**, **im-results/lp2-p0-p2-historical-three-share-gp5xor-gate.md**). They were reused, not rerun.

## Canonical page and punctuation structure

The original-derived transcription is **resources/liber-primus/lp2-transcription.txt**; the rune indices are checked against **resources/liber-primus/lp2-corpus.json**. The canonical full-word rule ends a word only at the source separators hyphen, period, ampersand, dollar sign, or section mark. Slash line breaks and percent page breaks do not end words. A one-rune word contributes one shell rune, not two.

The exact global rune intervals are:

- p1: [262,528)
- p2: [528,729)

The first word overlapping p2 is carried across the p1→p2 page boundary: global rune interval [525,530). It begins three runes before p2 and ends two runes inside p2. Resetting word segmentation at p2 would therefore alter the original word.

The source punctuation inventory gives p1 small-mark offsets [13,35,88,132,172]; p2 has a small mark at offset 3 and a red 13-dot terminal mark at offset 201. The 13-dot mark is not a p2-specific key-length instruction: the same visual mark occurs on p0 and p3, including p0 offset 13 and p3 offsets 16, 119, and 122. P1 and p2 have no red rune spans.

## Frozen turtle-shell hypothesis and exact result

The visual cue was the p2 tortoise/turtle carapace, interpreted as a word shell. The solved p57 instruction “SHED OUR OWN CIRCUMFERENCES / FIND THE DIVINITY WITHIN” supplied the literal word-level shell/interior distinction. Before evaluating the transformed output, the following operation was frozen:

For each complete source word w, let its shell be the ordered first and last GP29 rune (the sole rune once for a one-rune word). Use that shell as a repeating key for the strict interior of that same word, restarting only at the printed word boundary:

P(w,j) = (C(w,j) - K(w,j mod |K(w)|)) mod 29.

No page-boundary reset is allowed. The carried first p2 word therefore uses its true p1-starting endpoint. No reverse, phase search, fitted key, alternative segmentation, or extra layer is allowed.

| p2 source-derived quantity | Result |
|---|---:|
| Complete words overlapping p2 | 38 |
| First carried word | global [525,530) |
| Shell runes located inside p2 | **73** |
| Strict interior runes located inside p2 | **128** |
| Within-word bigram pairs scored | 98 |

The 76-symbol coincidence is excluded by the source contract. A page-local split would falsely treat the first carried word as a new p2 word; doubling the endpoint of a singleton would also violate the literal circumference rule. Correct full-word parsing gives 73 shell runes, and the corpus has no 73-rune page. P55 is the only 76-rune page, but it is not selected by the correct p2 shell count.

### Language test

The GP29 bigram model is built from the first 300,000 characters of the repository's Shakespeare control. Gibran's The Prophet supplies an independent native-English positive control. Scores are mean log probability per adjacent within-word interior pair; higher (less negative) is more English-like.

| Stream | Interior runes | Pairs | Bigram score | IoC |
|---|---:|---:|---:|---:|
| p2 raw interior | 128 | 98 | −4.186020 | 0.035433 |
| p2 after frozen shell-key subtraction | 128 | 98 | **−4.544900** | **0.032111** |
| p1 raw interior control | 143 | 96 | −4.472757 | 0.035458 |
| p1 after same rule | 143 | 96 | −4.725068 | 0.034768 |
| Gibran native-English interior control | 31,513 | 19,941 | **−2.605035** | **0.074725** |

The frozen p2 operation worsens the raw p2 bigram score and leaves its IoC near the uniform GP29 baseline 1/29 ≈ 0.034483. Its output begins THAUGEFCEACNDYREAMIOAEOUJCTYIRWAEBGYMGBDUREOAE...; it is not readable plaintext. The matched p1 control also worsens. A synthetic shell-key round trip over 256 native words verifies implementation reversibility, not a cryptanalytic hit.

The exact source hashes, page offsets, 73 shell offsets, 128 interior offsets, decoded stream digest, score calculation, and round-trip assertions are reproduced by:

**node sims/lp2_p2_tortoise_shell_wordkey_sft.cjs**

## Remaining interpretation and handoff

- The p0–p2 repeated side artwork is a shared decorative plate, not a page-specific p1/p2 selector.
- The p2 turtle/shell is a plausible hint to circumference extraction, but the frozen word-local shell-as-key operation fails.
- The p2 13-dot mark is part of the manuscript's repeated section-mark system, not an independently sourced 13-rune key.
- The 128-rune interior count is notable but does not identify a cipher, key encoding, or receiver.
- Prior p0 transfer, shared-pad, and cross-art investigations remain negative; do not rerun them.
- A different shell consumer is not ruled out in the abstract, but it requires a new independent clue specifying the key alignment, reversible operation, and receiver. This p1–p2 transition task supplies none.

No changes to results/README.md are warranted: this is a bounded negative, not established plaintext or a new overall mechanism.
