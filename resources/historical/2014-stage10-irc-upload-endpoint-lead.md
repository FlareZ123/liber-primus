# 2014 Stage10 contemporaneous IRC upload-endpoint acquisition lead

**Agent9, 28 November 2026. Classification: source-acquisition lead only. No callback file, POST body, server acceptance, LP2 key or plaintext recovered.**

## New bounded lead

A public preservation of contemporaneous `#cicadasolvers` discussion around the 2014 Stage10 onion records a participant using the IRC alias **iIIustrious** actively implementing the exact upload endpoint required by Cicada.

The signed Stage10 instruction required contestants to expose:

- Tor hidden service supplied in the Stage10 form;
- upload path `/cgi-bin/upload`;
- multipart form field named `file`;
- public key at `/key.asc`.

In the preserved IRC discussion, while participants were clarifying this requirement, `iIIustrious` states that they had made `cgi-bin/upload` as an upload script and made it executable. This is stronger than a hypothetical participant list: it is contemporaneous evidence that a named solver alias had the required callback receiver deployed during the Stage10 window.

Public source:
- Uncovering Cicada Wiki, **CICADA 3301 2014 PUZZLE FACTS PART 8**:
  https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_8
- Search-engine preservation retrieved 28 Nov 2026; the page contains the signed Stage10 instruction and the corresponding IRC excerpt.

Minimal preserved wording (short excerpt only):

~~~text
<iIIustrious> I just did cgi-bin/upload
<iIIustrious> is a script to upload
<iIIustrious> made it executable
~~~

The same log also records the contemporary interpretation that Cicada's contact would be automated against the contestant's onion upload path.

## Acquisition consequence

Issue #2989 is correctly WAITING for an authentic captured transaction or callback. This lead does **not** satisfy that gate. It does narrow the historical acquisition target:

1. archives/backups belonging to the `iIIustrious` Stage10 setup;
2. contemporaneous `#cicadasolvers` logs after the form-submission window mentioning that alias's callback;
3. any preserved Tor hidden-service working tree containing its `cgi-bin/upload`, upload directory, web-server access/error log, or `key.asc`;
4. participant-side disk images/backups from the exact February 2014 Stage10 period.

Do not infer that the endpoint actually received a file. The new fact is only that a concrete participant alias reported the required receiver deployed.

## Why this is distinct from prior public-Git negatives

The current Stage10 issue already establishes that the public `micheloosterhof/cicada-2014` Git graph lacks the successful POST/callback and identifies untracked `stage10/tmp/` logs as a missing surface. The `iIIustrious` record is a different participant-side acquisition target: a deployed contestant endpoint rather than the organizer/solver-script working tree.

A future acquisition should preserve exact file bytes, timestamps, filesystem metadata and server logs before interpretation.
