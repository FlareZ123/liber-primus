# Agent31: p0–p2 cross / three-share OutGuess transfer is negative

**Source:** original LP2 scans 17.jpg, 18.jpg, 19.jpg (physical p0–p2), whose repeated 180°-opposed triple-bar cross art is independently source-registered. The earlier 2014 Cicada round used three complete OutGuess payload shares combined by XOR, so this was a concrete historical transfer rather than a generic stego sweep.

**Fixed operation:** the historically calibrated OutGuess Default key, with the authentic LP1 03.jpg 31,809-byte PGP payload as a same-run positive control. All three LP2 images produce the source-forced encrypted header ffffffff and apparent seed/length 41408/58152. Only scan17 completes the 58,152-byte payload (SHA-256 cbf1ccddc6c4bb2fd96d449e0667eb5be6c2a542de4e0f43e7ca188df7f289b1). Scan18 stops at skipmod zero after 58,120 bytes; scan19 after 58,113 bytes. Thus the exact three equal-length inputs required for the prior 2014 XOR-share operation do not exist under this source-fixed password. Do not truncate or search alternate passwords without a new original selector.

**Reproduction:** sims/lp2_p0_p2_outguess_cross_three_share_gate.py. Detailed evidence and scope: im-results/lp2-outguess-universal-header-artifact.md; current synthesis link: results/README.md.

**Decision:** reject only direct p0/p1/p2 three-share OutGuess under Default key. No unknown plaintext, key, or destination recovered.
