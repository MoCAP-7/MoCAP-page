# MoCAP project page

A static page (no build step) modelled on the Nerfies academic project-page layout.

```
index.html              the page
static/css/style.css    styles (accent colours follow the paper's Fig. 2)
static/js/main.js       tabs, lazy video loading, bar tooltips, A/B/C hover link
static/images/          figures rendered from ICRA2027/figures (PDF -> PNG/JPG)
static/videos/          teaser loop + full submission video
static/videos/clips/    comparison clips + posters
static/MoCAP.pdf        paper (copied from MoCAP_versions/1424pm)
```

Preview locally: `python3 -m http.server 8000` in this folder, then open http://localhost:8000.

## Interim videos -> replace with the Google Drive originals

Every clip under `static/videos/` is currently **cropped out of the ICRA submission
video** (`ICRA27_8704_VI_i.mp4`), so it is low resolution and already 4x speed.
To replace one, keep the same filename and overwrite it. You can also change the `data-src` in `index.html`.

| File | Source segment in submission video | Replace with |
|---|---|---|
| `teaser_grasp_can.mp4` | 0:24.5–0:56 | grasp-can rollout, third-person, 4x, muted |
| `clips/box_mocap.mp4` / `box_capx.mp4` | 2:04.6–2:36.4 | grasp-box MoCAP / CaP-X runs |
| `clips/nav_mocap.mp4`, `nav_mocap_pov.mp4` | 1:31.6–2:03.4 | trash-bin nav, MoCAP third-person + robot camera |
| `clips/nav_noprior.mp4`, `nav_apexnav.mp4`, `nav_cow.mp4` | same | baseline runs |
| `clips/prior_without.mp4` / `prior_with.mp4` | 1:15.6–1:30.4 | start-A readiness trials |

Recommended web encoding (H.264, muted, small, starts streaming immediately):

```bash
ffmpeg -i in.mp4 -vf "setpts=PTS/4,scale=1280:-2" -an -c:v libx264 -crf 24 \
  -preset slow -pix_fmt yuv420p -movflags +faststart out.mp4
ffmpeg -i out.mp4 -frames:v 1 -q:v 3 out.jpg   # poster
```

The comparison clips autoplay only while on screen and pause when off screen. Keep each clip under ~5 MB.
For long uncut rollouts, YouTube or another video host works better than storing them in the repo.

## Before making it public

- **Anonymity:** ICRA review is double-anonymous. The page currently says "Anonymous
  Author(s)". Fill in authors, affiliations and BibTeX only after the decision, or use
  an anonymous host until then.
- Fill in the arXiv link (the button is greyed out) and the final BibTeX.
- Check that the Code link `github.com/MoCAP-7/MoCAP` (taken from the video) is the one you want.
- The code snippet in Method → Code-as-policy is **illustrative**: it uses the real
  primitive names from `yor_agent`, but it is not copied from a trace. You can swap in a real program from a `trace.json`.

## Deploy (GitHub Pages)

Push this folder as the root of a repo, then go to Settings → Pages → Deploy from branch `main` / root.
