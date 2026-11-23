# Agent15: Stage7 square chronology correction

The fifth-onion README's “use unknown” note is an intermediate state, superseded by the subsequent sixth-onion outguess instructions and PGP clear-signed form. The later material explicitly tells solvers to submit the three extracted squares with a Tor hidden-service URL; it specifies CGI upload at `/cgi-bin/upload`, file field `file`, and a GnuPG public key at `/key.asc`. The archive records three further LP pages after submission (107, 167, 229).

Thus the 2014 squares have an authenticated historical **submission-payload** role. This does not supply a 7×7 cipher operation mapping LP2 p33's 49 prose words to square cells. The p33 decoder branch is closed on that narrower question. PR #2407 corrects the p33 gate, Stage7 reproduction, and source crosswalk; Issue #2402 has a clarification comment.

Caveat: the archived form contains a PGP clear-signature block, but independent GPG verification was not completed in this invocation. Do not overstate that as a newly verified signature.
