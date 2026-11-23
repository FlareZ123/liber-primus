# Source-exact 2013 CicadaOS prime_echo, and the absent LP2 selector

**Decision (15 November 2026):** The pinned, unmodified **ISO rootfs** prime_echo script fully specifies all 464 output events: 462 × 50 ms and two 2-second holds immediately after 1033 and 3301. The cicada wrapper runs the script, clears the screen, displays message.txt for ten seconds and reboots; it does not play audio. Neither the executable nor its signed terminal-message companion supplies a separate binary/ternary timing payload or an instruction for interpreting pauses. This closes Director issue [#1180](https://github.com/FlareZ123/liber-primus/issues/1180) as a negative timing-channel result and preserves the separate source-selector closure [#1043](https://github.com/FlareZ123/liber-primus/issues/1043). It does not disprove every imaginable use of 2013 material as an LP2 key.

## Exact original program, not a later prime generator

The [pinned CicadaOS ISO-extraction source](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/002-3301/rootfs-contents/usr/local/bin/prime_echo) has Git blob SHA1 **65a569cf1b3eecb0f7c17ffc569a54ed8ecdf649**. Its source text is byte-identical to [the previously preserved source resource](../resources/historical/cicada2013-os-original-prime-echo.sh). The [boot wrapper](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/002-3301/rootfs-contents/usr/local/bin/cicada) runs this script, clears the screen, displays message.txt for ten seconds, and reboots; message.txt.asc is a separate signed companion and is not the file invoked by the wrapper. These are extracted files preserved by a historical third-party archive, not a new independently verified physical-ISO chain of custody.

Parsing **all 464** literal \`echo\`/ \`sleep\` commands against an independently enumerated mathematical list gives exactly the consecutive primes **2 through 3301**, with no missing, repeated or composite values. Command ordinals **174** and **464** output 1033 and 3301 and then \`sleep 2\`; the other 462 commands explicitly \`sleep .05\` (50 ms). The archive README's prose describing 0.5-second ordinary pauses is inconsistent with the extracted script and should not override it. Every tenth prime is emitted with a newline-producing \`echo\`; the last four values, 3259, 3271, 3299, 3301, end in a tab without a final newline. Under the script's intended BusyBox/ash echo semantics, reconstructed stdout is **2,169 bytes**, SHA-256 **a85ad06dd742fa2b76b3e187accbfbd3691622273a1975ee38306ccd27a31b69**. This digest describes reconstructed stdout, not an independently captured original OS terminal session.

The archived source and the signed 2013 terminal message \`The key is all around you\` establish the historical prime-list display and the unusual 1033/3301 pauses. They do not name a future 2014 encrypted book. [The already-indexed cross-stage evidence](../resources/external/1033-3301-historical-operator-chain.json) shows that 1033 and 3301 also appear in a 2013 emirp/number service, a TCP challenge and a 2014 OpenPuff passphrase. Their prime ordinals are mathematically 3×58 and 8×58, but this is a **later LP2 comparison**, not an original instruction to turn 464 primes into an eight-per-page key.

## Timing-channel audit: every gap is explained by the original executable

The original ISO-rootfs script contains exactly **464** echo/sleep pairs: 462 delays of **0.05 s** and two delays of **2 s**. The long delays occur at event ordinals **174** (prime 1033) and **464** (prime 3301). Total nominal sleep time is **27.1 s**. There is no third delay class, no audio command, and no irregular interval sequence from which to extract a binary or ternary payload.

A separate archive copy named *Cicada OS - Bash script from live image.txt* contains one `sleep .0` after prime 97. That anomaly is absent from the original ISO-rootfs executable, from this repository's byte-identical extraction, and from the other archived prime_echo copies. It is therefore not supported as an authored timing symbol; it is a derivative-copy/transcription defect. The source's ordinary interval is **0.05 s**, not the 0.5 s stated in some later walkthrough prose.

The cicada wrapper invokes only prime_echo, clear, cat message.txt, a ten-second wait and reboot. It does not play audio/761.mp3; that MP3 is a separate ISO asset, already covered by the repository's audio-761 investigations. The signed message.txt.asc has the same terminal text — “The key is all around you. Good luck. 3301.” — and contains no instruction about interpreting pauses.

The 2013 community information file and IRC archive record that solvers noticed the two two-second pauses at 1033 and 3301; one IRC exchange asks whether anyone had tried “the pairing” of those two pauses. This is evidence that the markers were noticed at the time, not an author-signed instruction to turn their timing into a separate key. A historical walkthrough also links a complete boot-sequence video, but the executable already accounts for every specified delay; no independent timing deviation or additional temporal payload is established.

**Timing decision:** the two pauses emphasize the two named prime values. They do not provide a distinct key stream. Do not pursue a timing-derived LP2 key unless a primary recording reveals a reproducible deviation from this exact 464-event source sequence.

## P6 red ink as a proposed prime_echo selector (21 November 2026, #2050)

Physical LP2 p6 has an original red 11-rune span at zero-based rune offsets [71,82), with complete printed word lengths 4|1|4|2. The four GP0 word sums are 71, 19, 65 and 26; the 11-rune sum is 181. Physical p0's red heading also sums to 181. These figures come from the exact original-rune red annotations and are independently replayed by [the p6 red-span source-gate SFT](../sims/lp2_redspan_181_p50_path_p32_source_gate.cjs).

**The proposed historical key source does not select an inverse.** The original 2013 `prime_echo` is a complete list of *every* prime from 2 to 3301. Therefore the appearance of 71 (prime ordinal 20) and 181 (ordinal 42) in its output follows automatically from their primality and upper bound; it cannot independently identify the list, a stream start or a key. The source's only two distinct pause markers occur at prime ordinals 174 and 464, immediately after 1033 and 3301. Neither marker singles out 71 or 181. The p6 shape 4|1|4|2 and its product 32 do not specify a choice between prime value and ordinal, stream interval, reduction to GP29, cipher operation, receiver or reset. The period-original 2013 BASE29/DH protocol is separately a one-shot handshake, without a per-rune LP2 key instruction.

The remaining 2016-signed SEEKS=71 and p50 successor-graph route to p32 is a separately testable navigation hypothesis; introducing the 2013 prime stream supplies no missing reversible consumer. **Bounded decision:** retire the p6 71/181→`prime_echo` key-transfer claim under this available source record, without trying arbitrary offsets or rescoring more ciphers. A new source-authenticated receiver or key-clock instruction is required to reopen it. This does not alter the earlier negative results for the frozen 464/174/290 prime schedules below.

## LP1 p13 “PROGRAM” imperative as a CicadaOS selector (23 November 2026; Issue #2354)

### Exact clue and strongest apparent bridge

The original LP1 p13 transcription reads:

> SOME WISDOM  
> AMASS GREAT WEALTH  
> NEVER BECOME ATTACHED TO WHAT YOU OWN  
> BE PREPARED TO DESTROY ALL THAT YOU OWN  
>
> AN INSTRUCTION  
> PROGRAM YOUR MIND  
> PROGRAM REALITY

The final imperative contains exactly **29 alphabetic characters** after spaces are removed: PROGRAMYOURMINDPROGRAMREALITY. This is a reasonable reason for a human solver to notice the 29-symbol Gematria Primus alphabet. The same page's “SOME WISDOM” also makes the original CicadaOS files named tmp/wisdom and tmp/folly worth checking. Neither lexical/numerical match, by itself, names an executable, argument, input file, key schedule or LP2 receiver.

### Original OS program and execution trace

The complete embedded initramfs inventory is preserved in [the original-source inventory](cicada2013-os-original-full-rootfs-inventory.md) and reproduced by [its full-rootfs SFT](../sims/cicada2013_os_full_rootfs_inventory_sft.cjs). The only puzzle-specific startup wrapper is usr/local/bin/cicada, a 106-byte login-shell wrapper. It clears the screen, runs usr/local/bin/prime_echo with **no arguments**, clears again, displays message.txt, waits ten seconds and reboots.

The invoked usr/local/bin/prime_echo is a fixed 12,248-byte list of 464 literal echo/sleep pairs. It prints every prime from 2 through 3301; 462 delays are 50 ms and two are 2 seconds, after 1033 and 3301. It does not read a file, accept a user input, call a cipher, or implement a reversible transform. The signed message companion says “The key is all around you”; it does not tell the player how to combine the prime output with LP2 ciphertext. The wrapper does not invoke 761.MP3.

The apparent “wisdom” match also fails as a program handoff: tmp/wisdom and tmp/folly are identical 3,368-byte opaque files, and the rootfs call graph finds no consumer. The apparent cicada.ko.gz program is the conventional Linux Ethernet PHY driver. The complete embedded rootfs inventory finds no mind/reality executable or additional named puzzle decoder. This finding is scoped to the embedded initramfs; it is not a claim that every other ISO member or lost historical service has been recovered.

### The 29 × 16 prime-table hypothesis and protocol rival

The strongest numerical rival is that the 29-letter p13 imperative selects a 29-wide organization of prime_echo's 464 outputs, since 464 = 16×29. But the original script prints ten primes per newline row, not 29; the 16×29 table is a later mathematical reshape, not a source-authored execution layout. The signed 2013 BASE29 command belongs to a separate TCP-server challenge, not to the CicadaOS executable. Applying that conversion to the 464 primes yields 1,237 base-29 digits, and the existing [16×29 BASE29 receiver gate](lp2-primeecho-16x29-base29-source-gate.md) finds no original LP2 page, visual chapter or contiguous whole-page span of that length. The signed NEXT command only stores client-supplied text; the server does not compute or choose the next instruction.

The existing [direct 464-prime periodic-key negative](prime-echo-464-periodic-key-negative.md), [cuneiform/prime-echo tests](lp2-cuneiform-prime-echo-290-key-gate.md), and [p40–53 original-input gate](lp2-2013-os-46row-prime-echo-p40-gate.md) already cover the obvious prime-stream receivers. This p13 audit adds no new receiver or reversible operation. Do not reopen prime offsets, base reductions, stream periods, or arbitrary page resets.

**Decision:** p13's “PROGRAM” imperative is a genuine instruction to the reader but does not uniquely select a CicadaOS program. prime_echo is the only plausible custom executable, yet it is a fixed prime-output display with no input or inverse. The 29-letter/464=16×29 match is suggestive but does not select a source-authored layout or an LP2 ciphertext receiver. No p13→CicadaOS→LP2 decoder is established; close #2354 as a bounded negative, not as an impossibility claim about missing historical material.

## The actual missing key-selection step

- The archived [2014 stage 1–11 walkthrough and preserved stage artifacts](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014) were checked for a link selecting the 2013 boot executable as LP2's source. Stage 7 uses 33011033 as an actual *OpenPuff* password for an MP3, and the [signed 2 May 2014 handoff](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/010-hidden-service-reply/message.txt.asc) supplies the seventh onion URL. Neither selects \`prime_echo\` to decrypt unknown pages. This is a bounded search through those inspected archive contents, not an exhaustive proof against missing historical material.
- **LP2 p56 is a different, positive prime-control story.** The [recovered contemporaneous 19 May 2014 solver transcript](../resources/external/2014-cicadasolvers-freenode-log-corpus.md) identifies the 2014 upload's hinted prime sequence and a crib as the historical route to a **fresh consecutive-prime totient shift**. The author-signed upload does not authenticate all of its incidental whitespace; an independent LP2 p0–p55 selector remains missing. Neither a solved p56 nor reuse of \`prime_echo\`'s initial prime values supplies such a selector.
- A 464-value stream is shorter than the original **12,956-rune** unsolved ciphertext. Reusing it as a full-book additive running key would need **27 full repetitions plus 428 more values** (28 traversals). No inspected source specifies repetition, per-page reset, reversing, a symbol conversion or a rule to continue beyond 3301. Directly using one copy also cannot serve as a book-length one-time pad. Even a 464-rune partial-page application would still need a recipient and a keyed operation supplied in advance.

## Existing original-cipher evidence: reuse, not repetition

The repository already contains [all direct prime-totient source-block tests](2013-prime-echo-totient-key-blocks-gate.md): full 464-prime, marked 174-prime and final 290-prime repeated streams; source-inspired six-by-29 page keys, 58-by-eight page-column mapping and a 16-by-29 floral-page mapping. The authentic p56 F-transparent operation is an exact positive control. The tested unknown-page recipients are structurally incompatible with that specific genuine encoder or yield near-uniform GP text under ordinary Vigenère. None selected a key. The [original May 2014 Freenode cuneiform/prime_echo cross-reference](3301-1033-source-operation-audit.md) additionally checked three byte-pinned primary channel logs: 1,077 broad contexts yielded **zero strict contemporaneous cuneiform/p33–39/prime_echo selection links**. Those earlier scopes are stronger than any repeat of a simple stream-shift experiment here; do not rerun them.

The incremental work in this update is the byte-identity check against the extracted ISO rootfs, the 464-event timing audit, the identification of the unsupported .0 derivative-copy anomaly, the wrapper/audio distinction, and the explicit closure of the separate timing-channel issue. The existing stdout reconstruction and SHA-256 remain reproducible through the linked SFT.

## Reproduction, limits and next decision

Run [the one-file CommonJS SFT](../sims/lp2_2013_prime_echo_source_sft.cjs) against the preserved source to reconstruct and validate all 464 primes, pauses, formatting, 2,169-byte terminal output and digest. The program does not treat reconstructed stdout as authenticated terminal-capture bytes. It does not attempt an unconstrained LP2 key search.

**Director fork:** This assignment ends with the original candidate recovered, its mechanism fully specified and **no contemporary LP2 key selector**. Reopen only on a dated primary document specifying the original program/output and a discriminating receiver, alignment or decoding rule. Prefer independently recoverable LP2 ciphertext operands, steganographic extraction or original instruction material over trial-and-error prime offsets and period-464 repetitions. Current plaintext/key status is unchanged.
