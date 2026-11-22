# p1–p7 cold-start source freeze and adjudication

**Agent3, 21 November 2026.** This is the source-first record for Director Issue #1998. Inputs are the original supplied LP2 JPEGs: physical p1–p7 map to archive images 18–24. The two initial observations were frozen before derived reports were opened. No p0 key, p50/DH readout, or downstream numerical correspondence was used to select them.

## Two direct observations

1. **A visible layout transition occurs after p2.** Physical p1 and p2 carry large black cross-like emblems in the side margins; p2 also has a small insect-like ornament below the text. From p3 onward, the pages use a different bilateral scroll/bracket frame. This could prompt a contemporary solver to treat p1–p2 and p3–p7 as distinct visual sections, but the images themselves provide no start node, traversal, coordinate grid, or mapping from the emblems to runes.

2. **Red ink marks selected text positions in p3, p6 and p7.** P3 has two enlarged red initials within its text; p6 has a later enlarged red initial with a short red continuation; p7 ends with a red line bracketed by red dotted marks and followed by five black dots. The rest of these pages is predominantly black. A human might naturally isolate the red material in page order, but the red marks do not visibly specify a cipher, key, clock, or receiver. The p7 five-dot feature is noted only as part of the source observation; it is not a license to reopen the known five-dot stencil family.

## Frozen candidate and source support

The strongest human-plausible first operation suggested by observation 2 is a **single red-ink-only read in physical page order p1→p7**, retaining exact printed order and leaving black text untouched. The prior original-source study `workplace/lp2-p3to7-red-initial-lpad-readout.md` identifies the four red-span initials in p3, p3, p6, p7 as **L P A D**. It treats the exact `LPAD` string as a candidate operation name, not plaintext.

A plausible contemporary interpretation is the standard SQL string function `LPAD(str,len,padstr)`, documented before 2014. But the original pages do not supply `len`, `padstr`, a key alphabet, a traversal, or a second operation that converts the padded text into plaintext. The obvious width-5 reading truncates 77 source words and discards 183 genuine runes. Width 13 with an F pad is lossless only when original word lengths are retained; it produces padded layout, not plaintext, and the choice of width/rune is not authenticated. The existing LPAD study already tests the literal LPAD key, direct additive variants, 255-to-256 table alignment, 3301-cell constructions, and the exact p56 F-transparent column inverse; all specified original-cipher outputs are nonlinguistic or fail the fixed decoder. No further LPAD variants are justified without a first-party instruction supplying the missing operands and receiver.

## Post-freeze comparison with existing work

- `workplace/lp2-p3to7-red-initial-lpad-readout.md` is the exact prior source-derived LPAD study. It already preserves the four original red spans and tests the direct key/LPAD consumers; no new test was run.
- `im-results/lp1-lp2-cicada-mobius-visual-selector.md` documents the p2 insect asset across LP1 p1, p9, p13, p15, p16 and LP2 p2. The observed orientation/physical-page Möbius correlation has no source-selected direction; the two direct μ-based path interpretations fail. The same report warns that the 2016 “their numbers” instruction most directly refers to words, not page numbers.
- `im-results/lp1-lp2-red-stencil-cross-release.md` establishes that the p7 13-dot glyph is a reused punctuation stencil, not a page-specific cipher selector. No five-dot/Morse or generic dot search was repeated.
- `im-results/lp2-206-word-initial-acrostic-gate.md` rejects the simple whole-book line-initial acrostic and its fixed Caesar/Atbash/prime-totient readings; it does not validate a separate p1–p7 key.

The p1/p2 black cross-like emblems remain a visible feature, but no contemporaneous first-party source links them to a reversible cipher operation, key, state clock, or receiver. The p2 insect's possible direction is already ambiguous and source-disambiguated against a unique LP1 cipher context. The p3–p7 scroll frame and red initials likewise do not select a complete inverse.

## Decision

**Bounded negative; no new candidate was run.** The red-only `LPAD` clue is real as a four-letter source readout, but its interpretation lacks the required length and pad operands and no source-selected reversible consumer exists. The p1/p2 emblems supply no independently specified operation. No route meets the requirement of at least 50 contiguous coherent original GP29 plaintext runes, exact forward replay, and an untouched holdout.

The exact missing selector is a first-party instruction that maps one of these visible features to a complete reversible operation and fixes its key/operand, symbol order/sign, clock, and unknown-text receiver. For the LPAD branch specifically, the source must select both `len` and `padstr` and specify how the padded structure is consumed without discarding original runes. Without that information, further tests would be analyst-tuned variants. Retire this p1–p7 cold-start pass; preserve the existing LPAD readout as a low-confidence clue candidate, not a cipher or plaintext.
