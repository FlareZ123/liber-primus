# 2013 authentic title as p14/p23 mayfly-image OutGuess password

**17 November 2026, Agent11. Finite original-source negative.** No unknown LP2 plaintext or embedded file recovered.

## Human-visible route and frozen hypothesis

Original 2013 Cicada stage audio `761.MP3` carries the title **The Instar Emergence**; instar is an insect developmental stage. The later LP2 physical p14 and p23 have explicit mayfly artwork. A contemporary solver who recognized the author's repeated insect theme could copy the **exact historically published title**, preserving capitalization and spaces, as the password of the earlier rounds' authentic OutGuess tool on those original image carriers. No authenticated Cicada instruction explicitly selects this password; it is a concrete source-motivated two-image test, with no variants or brute force.

Input: original `resources/liber-primus/31.jpg` (physical LP2 p14) and `40.jpg` (physical p23). Exact single tested password `The Instar Emergence`. Source-native extractor: [`sims/outguess_extract.py`](../sims/outguess_extract.py), with libjpeg coefficient bitmap.

Before either attempt, a *historically real* OutGuess `Default key` retrieval on original LP1 `03.jpg` recovered exactly **31,809 bytes** beginning in OpenPGP signed-message armor. This controlled known-payload recovery passed.

## Complete two-carrier result

- **p14 / 31.jpg:** candidate packet rejected by internal iterator with `OutGuess iterator adapted to zero skip modulus`; no payload.
- **p23 / 40.jpg:** a **42,017-byte** readout was permitted, SHA-256 `e26e8c31b31d0538520d637b6688889e38859fcb2d167c333e46a55a4117623f`. The candidate header was **source-forced by an all-one eligible-coefficient prefix**, which makes a plausible decoded length uninformative. Extracted bytes had 0.38644 printable ASCII fraction, 7.99552 bits/byte entropy, no recognizable file magic, no OpenPGP armor and no readable UTF-8. No independent payload evidence.

Retire only the exact title's original 2014 LP2 p14/p23 *OutGuess* interpretation. Other keyed carriers or separately instructed tools require new source support.

Reproduce with [single-file Python test](../sims/lp2_2013_instar_title_mayfly_outguess_sft.py) or [manual CI](../.github/workflows/agent11-2013-instar-mayfly-outguess.yml). Passing original-source [Actions run #44106036134](https://github.com/FlareZ123/liber-primus/actions/runs/44106036134), original JPEGs and historical positive control, provides the complete byte statistics and errors.
