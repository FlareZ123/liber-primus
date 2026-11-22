#!/usr/bin/env python3
"""Source-constrained geometry check for the LP2 five-dot motif.

Dot centroids are from original p56 image 73.jpg, measured by grayscale
threshold <80 and five near-circular connected components (area 2,000–4,000).
Star identities follow the proposed 3+2 grouping in Neri (2026); no star
identity search is performed. Standard library only.
"""
from itertools import combinations
from math import atan2, cos, degrees, radians, sin, sqrt, tan

DOTS = [
    (873.2619, 2517.0000), (921.1467, 2708.0625),
    (1103.9297, 2447.2149), (1408.0673, 2747.2780),
    (1603.9248, 2686.5000),
]
# (name, right ascension in hours, declination in degrees), J2000.
STARS = [
    ("beta Hydri", 0 + 25/60 + 39.20/3600, -77 - 15/60 - 18.1/3600),
    ("alpha Hydri", 1 + 58/60 + 45.87/3600, -61 - 34/60 - 11.7/3600),
    ("alpha Tucanae", 22 + 18/60 + 30.112/3600, -60 - 15/60 - 34.666/3600),
    ("gamma Hydri", 3 + 47/60 + 14.34/3600, -74 - 14/60 - 20.27/3600),
    ("alpha Reticuli", 4 + 14/60 + 25.47/3600, -62 - 28/60 - 25.69/3600),
]
ALPHA_PICTORIS = (6 + 48/60 + 11.455/3600, -61 - 56/60 - 29.0008/3600)


def project_scp(ra_hours, dec_degrees):
    theta = radians(90.0 + dec_degrees)
    radius = tan(theta / 2.0)  # stereographic radius from the South Pole
    ra = radians(15.0 * ra_hours)
    return complex(radius * sin(ra), radius * cos(ra))


def triangle_angles(points):
    out = []
    for i in range(3):
        a, b = points[(i + 1) % 3] - points[i], points[(i + 2) % 3] - points[i]
        c = (a.real*b.real + a.imag*b.imag) / (abs(a)*abs(b))
        out.append(degrees(atan2(sqrt(max(0.0, 1.0-c*c)), c)))
    return out


def similarity_fit(source, target, reflected):
    sx, sy = sum(source)/len(source), sum(target)/len(target)
    xc, yc = [x-sx for x in source], [y-sy for y in target]
    den = sum(abs(x)**2 for x in xc)
    coeff = (sum(x*y for x,y in zip(xc,yc))/den if reflected
             else sum(x.conjugate()*y for x,y in zip(xc,yc))/den)
    def apply(point):
        z = point-sx
        return coeff*(z.conjugate() if reflected else z)+sy
    pred = [apply(x) for x in source]
    rms = sqrt(sum(abs(p-y)**2 for p,y in zip(pred,target))/len(target))
    return rms, apply


def main():
    page = [complex(x,y) for x,y in DOTS]
    stars = [project_scp(ra,dec) for _,ra,dec in STARS]
    pa, sa = triangle_angles(page[:3]), triangle_angles(stars[:3])
    print("p56 first-three angles:", [round(x,3) for x in pa])
    print("candidate star angles:", [round(x,3) for x in sa])
    print("max sorted angle difference:", round(max(abs(a-b) for a,b in zip(sorted(pa),sorted(sa))),3))
    candidates = []
    for subset in combinations(range(5),3):
        aa = sorted(triangle_angles([page[i] for i in subset]))
        candidates.append((max(abs(a-b) for a,b in zip(aa,sorted(sa))),subset))
    print("best of ten page triangles:", min(candidates))
    rms, apply = min((similarity_fit(stars[:3],page[:3],r) for r in (False,True)),key=lambda x:x[0])
    print("three-star reflected-similarity RMS:", round(rms,3),"px")
    for i in (3,4):
        q=apply(stars[i])
        print(STARS[i][0],"predicted",tuple(round(v,1) for v in (q.real,q.imag)),
              "actual",DOTS[i],"error",round(abs(q-page[i]),1),"px")
    pic=apply(project_scp(*ALPHA_PICTORIS))
    print("alpha Pictoris alternative error:",round(abs(pic-page[4]),1),"px")


if __name__ == "__main__":
    main()
