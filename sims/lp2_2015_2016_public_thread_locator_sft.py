"""Source-locked 2015-16 original IRC external-discussion handle locator.

A candidate is a dated participant link, not evidence of a solved LP2 page.
"""
import hashlib
import json
import re
from urllib.request import Request, urlopen
from urllib.parse import urlsplit

URL = "https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/%23cicadasolvers.freenode.2.log"
SIZE = 27234234
SHA1 = "72634a9d071d32af767edbffc0493d810e88cd0d"

raw = urlopen(Request(URL, headers={"User-Agent":"LP2-historical-source-914"}), timeout=120).read()
assert len(raw) == SIZE
assert hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest() == SHA1
lines = raw.decode("latin1").splitlines()
date = re.compile(r"^201(?:5|6) ")
href = re.compile(r"https?://[^\s<>'\"]+", re.I)
discussion = re.compile(r"(?:reddit\.com|redd\.it|unfiction\.com|wikia\.com|fandom\.com|4chan\.org|4plebs\.org|4archive\.org|8ch\.net|8chan\.co|pastebin\.com|forum|forums|discuss|thread|board|news\.ycombinator\.com|stackexchange\.com)", re.I)
context = re.compile(r"(?:liber\s*primus|lp2\b|rune|puzzle|cicada|decode|decrypt|cipher|solv|key|prime|gematria)", re.I)
out = {}
for i, line in enumerate(lines):
    if not date.search(line):
        continue
    links = [m.group().rstrip(".,;:)]}>") for m in href.finditer(line)]
    for link in links:
        if not discussion.search(link):
            continue
        if "pastebin.com" in link.lower():
            continue
        around = "\n".join(lines[max(0,i-4):min(len(lines),i+5)])
        if not context.search(around):
            continue
        host = urlsplit(link).netloc.lower()
        # Normalize trivial IRC tracking punctuation; maintain full original link.
        key = link.lower()
        score = (6*bool(re.search(r"liber\s*primus|lp2", around, re.I))
                 + 4*bool(re.search(r"decrypt|decipher|solv|plaintext|cipher|key", around, re.I))
                 + 3*bool(re.search(r"cicada|rune", line, re.I))
                 + 2*bool(re.search(r"/comments/|/thread/|/topic/|/discussion/|viewtopic|/forum", link, re.I))
                 + 1*bool(re.search(r"2015|2016",line)))
        if key not in out or score > out[key]["score"]:
            out[key] = dict(url=link, host=host, line=i+1, dated=line[:16], score=score,
                            source_line=line[:500],
                            neighbor=[dict(line=j+1,text=lines[j][:400]) for j in range(max(0,i-2),min(len(lines),i+3))])
ranked = sorted(out.values(),key=lambda x:(-x["score"],x["line"]))
print("HISTORICAL_THREAD_SCAN_BEGIN")
print(json.dumps({"source":{"url":URL,"bytes":SIZE,"git_sha1":SHA1,"total_lines":len(lines)},
                  "unique_external_discussion_links":len(ranked),
                  "top_links":ranked[:100]},ensure_ascii=False,indent=2))
print("HISTORICAL_THREAD_SCAN_END")
