#!/usr/bin/env python3
"""Read JPEG marker structure and exact byte offsets without modifying source bytes."""
from __future__ import annotations
import hashlib
from pathlib import Path
SOF = {0xC0:"SOF0",0xC1:"SOF1",0xC2:"SOF2",0xC3:"SOF3",0xC5:"SOF5",0xC6:"SOF6",0xC7:"SOF7",0xC9:"SOF9",0xCA:"SOF10",0xCB:"SOF11",0xCD:"SOF13",0xCE:"SOF14",0xCF:"SOF15"}
def name(m):
    if m in SOF: return SOF[m]
    if 0xE0 <= m <= 0xEF: return "APP" + str(m-0xE0)
    return {0xC4:"DHT",0xDB:"DQT",0xDD:"DRI",0xDA:"SOS",0xFE:"COM",0xD8:"SOI",0xD9:"EOI"}.get(m, "M" + format(m,"02X"))
def digest(data): return hashlib.sha256(data).hexdigest()
def audit(path: Path):
    data=path.read_bytes()
    if not data.startswith(b"\xff\xd8"): return {"file":str(path),"error":"missing SOI"}
    i=2; markers=[{"name":"SOI","offset":0}]; scans=[]; error=None; eoi=None
    trailing=0; total_stuffed=0; restart_markers=[]
    while i < len(data):
        marker_offset=i
        if data[i] != 0xFF: error="non-marker byte at offset " + str(i); break
        while i < len(data) and data[i] == 0xFF: i += 1
        if i >= len(data): error="truncated marker"; break
        m=data[i]; i+=1; marker_name=name(m)
        if m == 0xD9:
            markers.append({"name":"EOI","offset":marker_offset}); eoi=marker_offset; trailing=len(data)-i; break
        if m == 0x00 or m == 0xD8 or 0xD0 <= m <= 0xD7:
            error="unexpected standalone marker FF" + format(m,"02X") + " outside scan"; break
        if i+2 > len(data): error="truncated segment length"; break
        length_offset=i; length=int.from_bytes(data[i:i+2],"big")
        if length < 2 or i+length > len(data): error="invalid segment length " + str(length) + " at offset " + str(i); break
        payload_offset=i+2; payload=data[payload_offset:i+length]
        item={"name":marker_name,"offset":marker_offset,"length_offset":length_offset,"segment_length":length,"payload_offset":payload_offset,"payload_length":len(payload),"payload_sha256":digest(payload)}
        if m in SOF and len(payload)>=6:
            ncomp=payload[5]
            item.update({"precision":payload[0],"height":int.from_bytes(payload[1:3],"big"),"width":int.from_bytes(payload[3:5],"big"),"components":[{"id":payload[6+3*k],"sampling":payload[7+3*k],"qtable":payload[8+3*k]} for k in range(ncomp)]})
        if m == 0xDD and len(payload)==2: item["restart_interval"]=int.from_bytes(payload,"big")
        if m == 0xE0 and payload.startswith(b"JFIF\0") and len(payload)>=14:
            item["jfif"]={"version":[payload[5],payload[6]],"units":payload[7],"x_density":int.from_bytes(payload[8:10],"big"),"y_density":int.from_bytes(payload[10:12],"big"),"thumbnail_width":payload[12],"thumbnail_height":payload[13],"thumbnail_bytes":len(payload)-14}
        if m == 0xE1:
            item["exif"]=payload.startswith(b"Exif\0\0")
            item["xmp"]=payload.startswith(b"http://ns.adobe.com/xap/1.0/\0") or payload.startswith(b"http://ns.adobe.com/xmp/extension/\0")
        if m == 0xE2:
            if payload.startswith(b"ICC_PROFILE\0") and len(payload)>=14: item["icc"]={"sequence":payload[12],"total":payload[13],"data_length":len(payload)-14,"data_sha256":digest(payload[14:])}
            item["mpf"]=payload.startswith(b"MPF\0")
        if m == 0xED: item["iptc_or_photoshop"]=payload.startswith(b"Photoshop 3.0\0")
        if m == 0xEE: item["adobe_app14"]=True
        markers.append(item); i += length
        if m == 0xDA:
            entropy_start=i; stuffed=0; restarts=[]
            while i < len(data)-1:
                if data[i] != 0xFF: i += 1; continue
                marker_start=i; j=i+1
                while j < len(data) and data[j] == 0xFF: j += 1
                if j >= len(data): i=j; break
                nxt=data[j]
                if nxt == 0x00: stuffed += 1; i=j+1
                elif 0xD0 <= nxt <= 0xD7:
                    restart={"name":"RST" + str(nxt-0xD0),"offset":marker_start}; restarts.append(restart); restart_markers.append(restart); i=j+1
                else: break
            scans.append({"sos_offset":marker_offset,"entropy_start":entropy_start,"entropy_end":i,"entropy_length":i-entropy_start,"stuffed_bytes":stuffed,"restart_markers":restarts,"entropy_sha256":digest(data[entropy_start:i])})
            total_stuffed += stuffed
    if not markers or markers[-1]["name"] != "EOI":
        if error is None: error="missing EOI"
    return {"file":str(path),"bytes":len(data),"sha256":digest(data),"markers":markers,"scans":scans,"scan_count":len(scans),"eoi_offset":eoi,"trailing_bytes":trailing,"stuffed_bytes":total_stuffed,"restart_markers":restart_markers,"error":error}
