# Agent 24 correction: the NEXT 1+1,680 alignment is not a source-selected key

The p33–39 / 2013 NEXT chain-key test is now fully documented, but its strongest upstream premise needs an explicit downgrade.

The signed 2013 TCP specification defines **NEXT as participant-supplied text for the server to store**; the server does not select the text as an organizer instruction. The March 2013 message is independently PGP-signed, but that authenticates the participant-supplied message, not an LP2 key role. The p33 1033/3301 link to the BASE29/DH protocol does not select the March NEXT payload.

Canonical GP tokenization gives 1,710 symbols. The 1,681 count appears only after deleting 29 F symbols. Those F's are ordinary letters in words such as INFORMATION, FINALLY, FEW, FINAL, FIRST, OF, and IF; no source marks them as cipher interrupts. Applying the LP1 F-interrupt convention to this message as a key, then interpreting the first survivor as IV, is an unsupported transformation. The resulting 1+1,680 length match is a post hoc numerical fit.

The 16 chain inverses remain a valid bounded negative for that exact family (0/16 native-language candidates), but the alignment must **not** be described as an authentic or source-selected key. The corrected report is `im-results/2013-next-chain-p33-39-gate.md`; the signed protocol semantics are in `resources/external/2013-tcp-server-signed-source.md`. Do not expand this route absent a new primary source instruction.
