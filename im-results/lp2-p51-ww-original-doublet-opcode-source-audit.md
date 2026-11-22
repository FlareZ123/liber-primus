# Physical p51 W-W-P and the missing historical escape instruction

## Decision

**Bounded negative source gate.** The first runes after the original 256-byte p49–51 panel are **W-W-P**. P51 is the only one of 55 unknown, rune-bearing original pages whose first two runes are equal. Across the original 12,956-rune unknown stream, 86 adjacent rune pairs are equal. This physical coincidence is authentic. No original 2012–2014 player-visible operation examined in the explicitly named retained corpus below instructs a player to treat two equal runes as an escape, reset, repeated byte, or table exit.

An exact, reversible decoder beginning at this boundary cannot be **source-selected using this evidence**. This retires only the historical-authored-instruction interpretation of W-W; it leaves unpreserved source material, unexplained formatting, and unrelated ciphers open. No new plaintext or key was recovered.

## Original observation and rival mechanisms

Original source resources/liber-primus/lp2-corpus.json physical p51 starts with GP indices [7,7,13], transliterated W-W-P, and has 92 runes. The actual p49–51 grid contains 256 byte values (resources/liber-primus/lp2-grid-256.json). Exactly one of 55 unknown rune-bearing pages opens with an identical pair; the complete unknown book has 86 adjacent same-rune pairs across 12,955 contiguous transitions.

A random instance of a rare doublet at one page boundary is one rival, not an impossible event. The page-start and red-rubric-start uniqueness claims describe the same W-W observation and must not be counted as independent evidence. A true table-exit command is another rival, but it requires an authored source specifying the byte operands and grammar.

Original 2014 Onion5 signed material contains JPEG hex, where FF bytes have standard file-format marker meaning; PGP armored messages use repeated dash characters as framing delimiters. Neither source maps the GP rune W (index7, prime19) to a JPEG marker or PGP framing rule. Their existence cannot source-select a W-W rune decoder.

## Frozen historical corpus audit

The read-only [Windows Node22 CommonJS SFT](../sims/lp2_p51_ww_historical_opcode_sft.cjs) reads **18 named first-party 2012–2014 text and code source files** under resources/historical, excluding signature armor bodies from the keyword screen. The audited set covers 2012 signed messages including the one-time-display RSA handoff, 2013 signed Onion/forest/echo messages and actual CicadaOS shell files, and 2014 signed Onion transfer, HTML magic-square form and Onion7 index.

The source-language screen looks for a specific class of instructions signaled by repeat, double, duplicate, reset, escape, marker, delimiter, identical, twice, adjacent, consecutive, and related forms. Zero command-language hits occurred across these 18 historically linked originals. A planted instruction with adjacent identical runes, a reset, and an escape triggers the exact scanner positive control. The program also validates the actual W-W-P indices, the unique page-start doublet, all 86 book doublets, and the original 256-byte panel.

Specific first-party evidence:

- resources/historical/cicada2012-message-only-displayed.asc: the RSA message is displayed once, with no repeat-symbol code.
- resources/historical/cicada2013-os-original-cicada.sh and cicada2013-os-original-prime-echo.sh: prime echoes and shell clearing are display behavior; no repeated ciphertext-rune opcode.
- resources/historical/cicada2014-sixth-onion-v2-form.html.asc: three magic-square inputs and the recipient's PGP /cgi-bin/upload service, with no double-rune escape instruction.
- resources/historical/cicada2014-stage11-message.asc and cicada2014-onion7-index.html: signed Onion7 handoff and image index, with no table-exit instruction.

**Limits:** This does not cover lost 2014 CGI source, unknown per-recipient replies, every embedded image/audio binary, or a command phrased without the screened words. The absence of an explicit phrase is a source-corpus constraint rather than a mathematical cipher exclusion. Other agents have already investigated characterwise p50 masks and predecessor-coded 512-rune maps; those failures are separate evidence.

## Director decision

Close [#2328](https://github.com/FlareZ123/liber-primus/issues/2328) under its bounded negative source-audit completion criterion. Reopen only if new **historically dated, player-visible** Cicada material specifies an adjacent-pair escape/reset and a concrete reversible operand map. Prioritize independent full-page candidate inverses and authentic key acquisition.

Reproduction commit e7030a4dca2658ea552fa8d997856bb0b9966341. Source files and original p51 arrays were also checked live via the GitHub connector; external Windows CI was not run.
