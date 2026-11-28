# 2014 iIIustrious participant-local callback acquisition

**Director task:** #3348.  
**Status:** bounded participant-local preservation negative.  
**Question:** can a public participant-local surface recover the exact deployed `/cgi-bin/upload` handler, hidden-service hostname, raw access/request record, saved POST body, or received callback object that iIIustrious used after the sixth 2014 onion asked successful solvers to expose an upload endpoint?

## Result

No exact iIIustrious callback object was recovered from the concrete public surfaces checked here.

The historical evidence still establishes that the endpoint existed. In the period solver transcript, while other participants were asking how to satisfy the signed sixth-onion requirement, iIIustrious states:

- `I just did cgi-bin/upload`
- `is a script to upload`
- `made it executable`

A later April solver discussion preserved in the upstream #3334 audit further supports that iIIustrious had actually submitted a participant onion and observed recurring service hits. That is evidence of a participant-operated service, not a surviving copy of its bytes.

The missing object is therefore sharply typed: **participant-local deployment state**. It was never part of the public `iIIustrious/3301code` Git object graph and has not been found in public participant archives.

## Concrete preservation surfaces checked

### 1. iIIustrious public Git history

Upstream Director work #3333 exhaustively walked the reachable `iIIustrious/3301code` graph. The 2015 import contains no deployed CGI handler, upload directory, web access/error log, hidden-service hostname/private-key directory, saved callback upload, or raw HTTP request object. This invocation did not repeat that tree walk.

The later 2016 `tcpServer/` material is a separate reimplementation and does not preserve 2014 HTTP deployment state; see #3344 and `im-results/3301code-tcpserver-omitted-assets-audit.md`.

### 2. Period Uncovering-Cicada tutorial and wiki export

The preserved page **How to make onion hidden service and CGI upload page** contains generic setup material, a deliberately labelled example onion `6dq7xsfmdpqmksyw.onion`, links to generic CGI tutorials, and a different participant's package:

- `http://kholyg7cewyywujo.onion/cicada.tgz` is explicitly attributed in the period transcript to **cheetahburn**.
- the tutorial's example onion is described as an example for the demonstration, not as iIIustrious's submitted service.
- the current wiki export is revision **31688**, parent **15114**, timestamp **2016-05-02T04:23:30Z**. The revision is a page-protection edit by **BrotherBox**. This corrects a misleading file-level search coincidence that initially paired the same export file with another contributor name; it does **not** bind the tutorial to iIIustrious.

The export preserves the 2014 chat testimony above but does not expose an iIIustrious onion address, handler bytes, uploaded file, or raw request log.

Pinned current-export witness: `Dukotah/cicada3301@b271334d9718bf68187f7a1e6362731159c36a2a`, `corpus/C-community/wikis/uncovering-cicada/export_cur_00100.xml` (page revision 31688). The same corpus's `export_cur_00020.xml` preserves the sixth-onion chat excerpt.

### 3. Period Titanpad/archive mirrors

The surviving period Titanpad material preserved by `cijhho123/cicada3301` and later mirrors contains the community setup package from cheetahburn and general CGI advice. Searches for iIIustrious together with `cgi-bin/upload`, onion hostnames, paste links, `message.txt.asc`, or callback traffic did not expose a participant-local copy.

This matters because the cheetahburn archive is a real example of exactly the kind of object #3348 seeks, but it belongs to another participant. It cannot be substituted for the iIIustrious deployment.

### 4. Public alias/account surfaces

Publicly indexed later material links the solver aliases iIIustrious / Aeralys / Nox Populi. Searches across the surviving public GitHub and indexed web material under those public aliases did not expose 2014 `/cgi-bin/upload` source, an iIIustrious hidden-service hostname, raw callback logs, or a saved uploaded payload.

The later Nox walkthrough series documents the 2013 puzzle and participant experience; no indexed 2014 callback artifact was recovered from it.

### 5. Known 2014 GET/GET/POST witness

Multiple public walkthroughs preserve a masked three-request sequence dated 2014-05-02:

- `GET /key.asc`
- `GET /`
- `POST /cgi-bin/upload`

with the `Cicada/33.01 ... Edition` user agents and a saved `message.txt.asc` follow-up.

That witness is valuable for the generic protocol, but current repository synthesis already treats it separately. No checked source binds those masked lines or that saved `message.txt.asc` to iIIustrious's service. It must **not** be promoted into an iIIustrious callback record.

## What would reopen this branch

A positive result now requires a genuinely participant-local object, not another walkthrough copy:

1. an exact `/cgi-bin/upload` file attributed to the deployed iIIustrious service;
2. the submitted hidden-service hostname plus independent binding evidence;
3. an Apache/nginx/lighttpd access or error log from that service;
4. a raw HTTP request/POST body or multipart capture;
5. a saved file created by the handler when Cicada contacted it;
6. a backup/archive/paste whose custody binds one of those objects to iIIustrious.

The byte stream, timestamp/path metadata, and custody must be preserved. A recovered handler alone would be participant-authored implementation evidence. A recovered inbound callback could contain organizer-authored state and should then be compared byte-for-byte with the known common 2014 follow-up before any LP2 role is proposed.

## Decision

The public participant-local acquisition route checked here is **bounded negative**. The strongest new result is not a recovered key or plaintext: it is the elimination of two tempting false substitutes — the community CGI tutorial/example onion and cheetahburn's downloadable package — as iIIustrious-specific evidence.

Do not repeat the public `3301code` walk, do not assign the masked 2-May GET/GET/POST witness to iIIustrious without new custody, and do not infer callback bytes from generic CGI source. Reopen only on a concrete participant-local artifact matching the criteria above.
