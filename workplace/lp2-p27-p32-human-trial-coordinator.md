# Independent, source-only human trial: LP2 p27–p32 (coordinator only)

**Do not send this page, repository links, issue numbers or analysis to the participant.** Send only the generated ZIP.

## Scope

The existing p0–p5 packet (#2117) and ghost-tree packet (#1335) are already available; their missing input is a genuine human. This trial adds a different, contiguous six-page segment (physical p27–p32, archive 44–49.jpg), without imposing a target clue. It is a modern reconstruction of the information available in 2014, not evidence that a particular contemporary solver would have followed the same path. It does not attempt the p57-to-p28 route of #2070.

Build from the maintainer's original ZIP:

```powershell
python sims/lp2_human_trial_packet.py --source-zip liber-primus-jpegs.zip --output independent-puzzle-trial.zip
```

Alternatively supply `--source-dir resources/liber-primus` instead of `--source-zip`. Python 3.8+ standard library only. This was executed locally against the provided original archive on 2026-11-26; output passed exact image-byte checks, archived index Git blob check and allowlist/ZIP integrity check. Reference run SHA-256: `4954a31359beb64c6d5395a0f4103e6e5df35a364831c657859180789221d94a` (ZIP compressor version can affect packaging hash; image hashes and index blob are invariant). It contains only six original images, a neutral START, a RESPONSE form, the 2013 chart transcription as a reference aid, and exact original 2014 index as plain text. The original chart image can be supplied separately if explicitly requested from `resources/historical/cicada2013-gematria-jpeg.b64`; the initial chart is the same faithful transcription already used in the p0 packet.

## Concrete recruitment route, draft only

The Edinburgh University Puzzle Solving Society is an actual puzzle community listed by its students' association at https://www.eusa.ed.ac.uk/activities/view/puzzlesoc . Alternatively the UK Puzzle Association's General Puzzle Discussions forum is at https://www.ukpuzzles.org/forum/index.php . A maintainer may ask a moderator or society organizer privately for an opt-in volunteer who is comfortable with cryptograms and has not previously studied this puzzle. Do not post the participant packet or identify the target in a public recruitment thread. No contact has been made; moderator permission and volunteer consent are still required.

Suggested invitation for maintainer review:

> Would any adult puzzle enthusiast be interested in a voluntary, 45-minute independent puzzle-solving trial? I have six original images from a historical cryptographic puzzle and would like to learn what a fresh solver notices and tries first. No full solution is expected, and no specialist software or payment is required. To avoid spoiling the test, I will share the images privately after confirming eligibility. You can stop at any time. With your permission, anonymized puzzle observations and reproducible calculations may be shared in the research record; personal details will not be published. Please reply privately if interested.

## Coordinator procedure and scoring

1. Assign a random participant code; explain the purpose, time commitment, ability to stop and pseudonymized publication before obtaining affirmative consent. No public posting of personal contact details. After initial interest, disclose that this is Liber Primus/Cicada 3301 and privately screen for prior LP2 analysis, forum participation, solutions, repository exposure, or contemporary candidate knowledge. Exclude contaminated participants from the blind arm without penalizing them. Record exposure, not identity, in the study log.
2. Send only the ZIP. Ask the participant to record first observations and propose their first operation before testing it. Prefer a privately timestamped initial form or message immediately after the first proposal, followed by the final response; do not use covert monitoring. The worksheet is self-reported if separate timestamps are unavailable. Record the exact packet hash.
3. Supply no hints, translations beyond the provided chart, candidate cipher list, modern web results or feedback on correctness. If a dated first-party artifact is requested, record the exact request and whether it existed by May 2014; provide only the requested original artifact with provenance, retaining a separate post-supplement arm. Do not permit live historical-service probing, modern solution lookups, or AI-generated interpretations.
4. Preserve the participant's first noticed clue, first proposed operation, operand, direction/indexing, predicted check, actual output if tested, missing artifact and earliest stopping point. Accept incomplete observations as data. One participant response is exploratory; an independently replicated path is stronger.
5. Assess source selection separately from cipher success. A concrete hypothesis requires an exact original location and operational rule. A valid receiver must make a frozen prediction on an originally withheld interval (use p33 or later only after the prediction is recorded), and reproduce the exact original ciphertext from the proposed plaintext. A stop at an underdetermined selector is a result, not an incorrect solution. Never use an already-informed agent as the independent human.
6. Store only consented pseudonymized transcripts, timestamped predictions, and code. If no eligible volunteer agrees, mark the actual trial blocked rather than counting a negative result. Reopen relevant blind issues once an independently obtained transcript meets their specific acceptance criteria.

## Disposition

Ready-to-share source archive generated and a concrete moderator-mediated recruitment route identified. No independent participant has yet consented or received the archive; there is no blind transcript, new plaintext, or human solve-path result. The earlier worker transport failure is not retested. This closes #2910's enabling deliverable only, leaving #2117, #2070 and #1335 blocked on their own genuine participant requirements.
