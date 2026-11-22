# 2014 Stage10 `/cgi-bin/squares`: period Git source-code acquisition gate

**Agent32, 22 November 2026, Director #2331.** The contemporaneous public Git repositories and independently maintained source archives inspected here expose the genuine Stage10 *client*, a successful-response *body*, and copies of the resulting three images. None of these source trees contains the **server-side** `/cgi-bin/squares` code, deployment bundle, or an original signed algorithm selecting an LP2 decryption key. This is a **bounded negative for public period repository-source recovery**, not proof that the original handler never existed. No unknown LP2 plaintext or key was recovered.

## Exact historical server-side acquisition target

The historical 1943-byte first-party page [Stage10 original form](../resources/historical/cicada2014-stage10-original-form.html) sends POST `/cgi-bin/squares`, fields `53301` (5×5 sum3301), `71033` (7×7 sum1033), `51033` (5×5 sum1033) and `onion`. Its signed text separately commands each **participant** to operate `/cgi-bin/upload` and `/key.asc` on the participant's own service. Those are two different servers and different functions.

A Git commit created **2014-02-13 18:23:37Z**, [micheloosterhof/cicada-2014 commit 3b15257](https://github.com/micheloosterhof/cicada-2014/commit/3b15257c5a9efada85b8ccfdb876e2ec934d5b90), already preserves [`stage10/squares`](https://github.com/micheloosterhof/cicada-2014/blob/3b15257c5a9efada85b8ccfdb876e2ec934d5b90/stage10/squares) as a **152-byte HTTP response body**:

```html
<html><head></head><body>
<p> Thank you for you submission. </p>
<img src="/107.jpg" /><br />
<img src="/167.jpg" /><br />
<img src="/229.jpg" /><br />
```

This is concrete evidence of the public continuation on successful submission, **not** handler source code and not evidence of an LP2 key. See the already established [exact JPEG identity control](../sims/stage10_post_square_three_images_original_sft.cjs), which maps all three responses to existing solved first-release LP1 page images. The older [Stage10→11 operator synthesis](cicada2014-stage10-to-stage11-original-operator-gate.md) already establishes the exact original form, payload sizes, image identities, historical `/key.asc` ownership and missing private response. This acquisition audit adds the **period repository-source inventory** rather than reopening that completed response test.

## Repository trees and source-origin discrimination

Read **complete Git trees**, instead of guessing filenames, for:

| Historical source or public mirror | Relevant actual tree contents | Source-code decision |
|---|---|---|
| [micheloosterhof/cicada-2014](https://github.com/micheloosterhof/cicada-2014), [2014-02-13 commit tree](https://github.com/micheloosterhof/cicada-2014/commit/3b15257c5a9efada85b8ccfdb876e2ec934d5b90) | Stage10 has `index.html`, `README.md`, `squares`, 107/167/229 JPEGs. At that commit the `stage10/squares` file is the static HTML body above. Later current tree, 190 files. | An early participant mirror of the actual HTTP view; no backend Python/PHP/Perl/CGI, no deployment configuration or server-side evaluation code |
| [scream314/cicada3301](https://github.com/scream314/cicada3301), [cijhho123/cicada3301](https://github.com/cijhho123/cicada3301), [cicada-solvers/The-Complete-Cicada3301-Archive](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive) | Complete trees 445 / 1452 / 1455 entries; each retains only the Stage10 HTML, static `squares` response, 107/167/229 JPEGs | Mirrors of the same public material, no independent original backend |
| Historical Git forks [kenorb](https://github.com/kenorb/cicada-2014), [WillGasperi](https://github.com/WillGasperi/cicada-2014), [grevutiu-gabriel](https://github.com/grevutiu-gabriel/cicada-2014), [Ddawg747](https://github.com/Ddawg747/cicada-2014) | Complete trees of 190–196 files, Stage10 contents identical in scope to original 2014 public tree | No additional handler or deployment material |
| [iBotPeaches/cicada_3301](https://github.com/iBotPeaches/cicada_3301) | `onions/ut3qtzbrvs7dtvzp.onion/post/index.html` = form; `post2/index.html` = public post response; later `tool/app` source is modern solver software | Static archive and derived solver code; no first-party Stage10 backend |
| [neuroretransmit/cicada](https://github.com/neuroretransmit/cicada/tree/main/2014/008-sixth-onion) | `ut3qtzbrvs7dtvzp.onion.v2-submitted.html` = archived static response with closing tags; `cgi/cgi.py` + `cgi/index.html` are a **participant-side mock upload service** | Its README explicitly states the mock “was never used in the real puzzle”; it implements an upload endpoint, not the original squares receiver. It must **never** be treated as historical author code |
| Additional pre-2016-created repositories [235711101131pp/cicada2014](https://github.com/235711101131pp/cicada2014), [thomasandfriends/Cicada3301Runes](https://github.com/thomasandfriends/Cicada3301Runes) | 13-entry and 212-entry trees, including generic XOR/GP29 solver scripts, no squares CGI | No handler. The other pre-2016 search results are older forks, already enumerated; `dude123112414/Cicada2014_Runes` is an empty Git repository |

The current GitHub code index search for the **exact** `"cgi-bin/squares"` returns only the form and later descriptions/copies; the exact success-string `"Thank you for you submission"` returns only the static page and derivatives, never a CGI implementation. Plain exact field-name queries on `53301`, `71033`, `51033` were manually intersected with authentic repositories because generic numerical search gives unrelated data. These are source-location checks, **not** a claim to have exhausted deleted commits, private repositories, or historical offline deployment backups.

The earlier archive-query [#2013](https://github.com/FlareZ123/liber-primus/issues/2013) covers the separate 2026 pnotisdev CDX exact endpoint. [#2317](https://github.com/FlareZ123/liber-primus/issues/2317) covers public participant-side replies. Neither is rerun here.

## Cryptanalytic decision and next missing object

The **visible** Stage10 client and successful response route submissions to three known earlier-stage images. It cannot determine any cipher operation applied inside the original CGI server, even if its body was identical across multiple submissions. The raw original `/cgi-bin/squares` **executable source, byte-preserved deployment bundle, original annotated operator log, or authenticated first-party specification** would be decisive future evidence. Without one of these, there is no justified LP2 key or decoder to execute, and no reason to fabricate a CGI implementation to fit ciphertext.

**Decision for #2331:** retire **public 2013–15 Git repository-source recovery of this handler** after the scoped complete-tree/code-index audit. Keep the historical server-source acquisition question technically open only if a concretely identified new original code object becomes available. Do not promote the static response to a backend leak or redirect into an unrestricted variant search.
