#!/usr/bin/env python3
"""Generate a real, projected SVG map of Nepal (district boundaries) and splice
it into index.html, replacing the old stylised hand-drawn map. The nine eastern
Limbuwan districts stay interactive (data-district + the existing copy/colours).

Data source: Acesmndr/nepal-geojson (nepal-with-districts-acesmndr.geojson),
real 77-district boundaries (standard de-facto border). Run from the repo root:

    mkdir -p _build
    curl -L -o _build/aces_districts.geojson \\
      "https://raw.githubusercontent.com/Acesmndr/nepal-geojson/master/generated-geojson/nepal-with-districts-acesmndr.geojson"
    python tools/build-nepal-map.py

It is idempotent: it finds the existing <svg aria-label="Map of Nepal …"> in
index.html and replaces it, so re-running just refreshes the map."""
import json, math, re, html

GEO = '_build/aces_districts.geojson'
HTML = 'index.html'
WIDTH = 1000.0          # target px width of the projected map
PAD = 10.0

# The nine Limbuwan districts -> (display name, tag, description, colour)
LIMBU = {
    'TAPLEJUNG':     ('Taplejung', 'Roof of Limbuwan', 'Gateway to Kanchenjunga and the Pathibhara shrine, the northernmost reach of the homeland.', '#5e7d6b'),
    'SANKHUWASABHA': ('Sankhuwasabha', 'Arun valley', 'The western frontier of Limbuwan, climbing the great Arun river toward Makalu.', '#c79a3e'),
    'TEHRATHUM':     ('Terhathum', 'Old courts', 'Seat of historic Limbu assemblies and the Kipat communal lands.', '#8a9a52'),
    'PANCHTHAR':     ('Panchthar', 'Hills of the Hang', 'Heartland of the clan polities, terraced millet hills and Mundhum singers.', '#b0562f'),
    'ILAM':          ('Ilam', 'Tea & ridgelines', 'Eastern ridges of mist and tea, long settled by Yakthung farmers.', '#5f8a7a'),
    'DHANKUTA':      ('Dhankuta', 'Hill capital', 'A historic administrative seat of the eastern hills.', '#c2773a'),
    'SUNSARI':       ('Sunsari', 'Plains threshold', 'Where the eastern hills open onto the Tarai and the Koshi lowlands.', '#d9c49a'),
    'MORANG':        ('Morang', 'Plains edge', 'Where the hills meet the Tarai and old trade routes once flowed.', '#7a3b2e'),
    'JHAPA':         ('Jhapa', 'Far-east plains', 'The Mechi frontier, the eastern edge of Limbuwan toward Sikkim and beyond.', '#9a8a3e'),
}

data = json.load(open(GEO, encoding='utf-8'))
feats = data['features']

# ---- projection setup (equirectangular, longitude scaled by cos(mean lat)) ----
lons, lats = [], []
for f in feats:
    for ring in f['geometry']['coordinates']:
        for x, y in ring:
            lons.append(x); lats.append(y)
minLon, maxLon = min(lons), max(lons)
minLat, maxLat = min(lats), max(lats)
meanLat = (minLat + maxLat) / 2
cosf = math.cos(math.radians(meanLat))
k = WIDTH / ((maxLon - minLon) * cosf)          # px per degree latitude
H = (maxLat - minLat) * k

def project(x, y):
    px = PAD + (x - minLon) * cosf * k
    py = PAD + (maxLat - y) * k                 # flip y
    return (px, py)

def simplify(pts, tol):
    if len(pts) <= 5:
        return pts
    out = [pts[0]]
    t2 = tol * tol
    for p in pts[1:-1]:
        lx, ly = out[-1]
        if (p[0]-lx)**2 + (p[1]-ly)**2 >= t2:
            out.append(p)
    out.append(pts[-1])
    return out

def ring_path(ring, tol, dec):
    pts = [project(x, y) for x, y in ring]
    pts = simplify(pts, tol)
    fmt = (lambda v: f'{v:.{dec}f}') if dec else (lambda v: str(int(round(v))))
    d = 'M' + ' '.join(f'{fmt(px)},{fmt(py)}' for px, py in pts) + 'Z'
    return d

def feature_path(f, tol, dec):
    return ''.join(ring_path(r, tol, dec) for r in f['geometry']['coordinates'])

def centroid(ring):
    pts = [project(x, y) for x, y in ring]
    a = cx = cy = 0.0
    for i in range(len(pts)-1):
        x0, y0 = pts[i]; x1, y1 = pts[i+1]
        cross = x0*y1 - x1*y0
        a += cross; cx += (x0+x1)*cross; cy += (y0+y1)*cross
    if abs(a) < 1e-6:
        xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        return (sum(xs)/len(xs), sum(ys)/len(ys))
    a *= 0.5
    return (cx/(6*a), cy/(6*a))

def esc(s):
    return html.escape(s, quote=True)

VBW = WIDTH + 2*PAD
VBH = H + 2*PAD

base_paths, limbu_paths, labels = [], [], []
for f in feats:
    name = f['properties'].get('DISTRICT')
    if name in LIMBU:
        disp, tag, desc, col = LIMBU[name]
        d = feature_path(f, tol=0.6, dec=1)
        pressed = 'true' if name == 'TAPLEJUNG' else 'false'
        limbu_paths.append(
            f'<path data-district data-name="{esc(disp)}" data-tag="{esc(tag)}" '
            f'data-desc="{esc(desc)}" role="button" tabindex="0" aria-pressed="{pressed}" '
            f'aria-label="{esc(disp)} — {esc(tag.replace("&","and"))}" d="{d}" fill="{col}" '
            f'style="cursor:pointer;transition:filter .25s ease,opacity .25s ease"></path>')
        # largest ring centroid — used to place the single region wordmark
        big = max(f['geometry']['coordinates'], key=len)
        cx, cy = centroid(big)
        labels.append((cx, cy))
    else:
        d = feature_path(f, tol=1.5, dec=0)
        base_paths.append(f'<path d="{d}" fill="#c7b388"></path>')

# one tasteful "LIMBUWAN" wordmark over the eastern cluster instead of nine
# cramped district labels (individual names show in the detail card on hover/tap)
ccx = sum(c[0] for c in labels) / len(labels)
ccy = sum(c[1] for c in labels) / len(labels)
label_svg = f'<text x="{ccx:.0f}" y="{ccy:.0f}" font-size="19" letter-spacing=".22em">LIMBUWAN</text>'

svg = (
    f'<svg viewBox="0 0 {VBW:.0f} {VBH:.0f}" width="100%" style="display:block;overflow:visible" '
    f'role="img" aria-label="Map of Nepal with the nine eastern districts of Limbuwan highlighted">\n'
    f'            <g stroke="#9c875c" stroke-width="0.5" stroke-linejoin="round">'
    + ''.join(base_paths) + '</g>\n'
    f'            <g data-districts stroke="#241811" stroke-width="1.1" stroke-linejoin="round">'
    + ''.join(limbu_paths) + '</g>\n'
    f'            <g font-family="\'Space Mono\',monospace" font-weight="700" fill="#1c130d" '
    f'text-anchor="middle" paint-order="stroke" stroke="rgba(245,236,214,.92)" stroke-width="3" '
    f'stroke-linejoin="round" letter-spacing=".02em" style="pointer-events:none">'
    + label_svg + '</g>\n'
    f'          </svg>')

src = open(HTML, encoding='utf-8').read()
new, n = re.subn(
    r'<svg viewBox="0 0 \d+ \d+" width="100%" style="display:block;overflow:visible" '
    r'role="img" aria-label="Map of Nepal[^"]*">.*?</svg>',
    lambda m: svg, src, count=1, flags=re.S)
assert n == 1, f'expected 1 map svg, replaced {n}'
open(HTML, 'w', encoding='utf-8', newline='\n').write(new)

print(f'viewBox 0 0 {VBW:.0f} {VBH:.0f}  (aspect {VBW/VBH:.2f}:1)')
print(f'base districts: {len(base_paths)}, limbu: {len(limbu_paths)}, labels: {len(labels)}')
print(f'new svg length: {len(svg)} chars')
print('replaced map svg in index.html:', n == 1)
