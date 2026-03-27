# Spyne AI — Dealership Demo Showcase

> **Audience:** Dealership GM, Owner, Group VP of Operations
> **Last updated:** March 2026
> **Purpose:** Canonical reference for every AI capability available for dealership demos. Organized by function, mapped to dealership outcomes.

---

## How to use this document

- Each **chapter** is one demo section (one hero visual or animation).
- Inside each chapter, **Club** lists every model/endpoint involved.
- **Playbook tie** connects the capability to dealership economics (speed-to-live, holding cost, consistency, compliance, conversion).
- **Standalone** chapters are marked — they work as their own demo moment.
- For a **20-minute GM meeting**, run chapters 1–7 and 18. Add others based on the buyer's priorities.
- Non-automotive verticals (food, fashion, e-com, home furnishing) and specialty vehicles (bike, boat, large vehicle) are listed at the end under **Other Verticals**.

---

## Part A — Intake & Understanding

### 1. Smart intake & quality gating

> "Stop invisible inventory at the camera."

**Club:**
- `image validation` (blur, crop, framing)
- `blur score`
- `location classifier` (outdoor / studio)
- `general category classifier`
- `int / ext / focus / misc classifier`
- `focus class classifier`
- `interior sub classes classifier`
- `clip type classifier`
- `CGI image classifier`
- `coming soon image identification`
- `studio / non-studio classification`
- `Exterior Auto QC`
- `Focus Shoot Auto QC`
- `Interior Auto QC`
- `Merchandise Quality / Media Score — on app while capturing`
- `profanity classifier`

**Playbook tie:** Day 0 intake. Eliminate "in stock but not live" caused by unusable frames, wrong shot types, or inconsistent inputs. QC happens at capture time, not after upload.

---

### 2. Vehicle understanding & shot intelligence

> "Know what the car is, what angle it is, and what should happen next."

**Club:**
- `car detection`
- `car detector`
- `car type classifier`
- `angle classifier — 36 angle`
- `angle classifier — 72 angle`
- `car key point detection`
- `car part detection`
- `backbone for feature extraction`
- `superpoint / interest point detection & matching`
- `depth estimation`
- `hero angle selection via tyre detection`

**Playbook tie:** Standardizes coverage, routing, and merchandising decisions before delays stack up. Auto-picks the best hero image without manual selection.

---

### 3. Auto QC: Diagnose & Correct `standalone`

> "Catch problems before they slow you down."

**Club:**
- `diagnose image` (`/autoqc/diagnoseimage/`)
- `correct image` (`/autoqc/correctimage/`)

**Playbook tie:** Automatic quality gate that diagnoses frame-level issues and corrects them inline. Reduces rework loops between photo teams and merchandising.

---

## Part B — Exterior Merchandising

### 4. Exterior BG removal & studio finish

> "Make every exterior look studio-grade, fast."

**Club:**
- `remove bg car exterior`
- `removebg refinement — edges`
- `remove bg car exterior — after render`
- `Automobile Removebg720`
- `Replace car bg`
- `RBG and Replace Car`
- `Car Remove Bg With Floor`
- `Cars Floor`
- `BG removal for new vehicle types`
- `BG removal for all focus shoots + open doors + trunk`
- `Replace BG SKU`
- `RBG and Replace Car SKU`
- `Keep BG`
- `BG Blur`
- `soft / hard transparent shadow`
- `focus shoot shadow via AI`
- `tyre reflection`
- **`marble floor`**
- **`mirror floor`**
- **`syntetica`**
- **`krypton floor`**
- `floor extension`
- `car placement tool`
- `logo effect / custom logo placement`
- `custom numberplate`
- `Karvi Logo BG`
- `car exterior transformation`
- `processing time reduction to under 1 second`

**Playbook tie:** Protect day 0–3 workflow. Consistent, catalog-grade merchandising across every unit, every angle, every vehicle type. Sub-second processing means no bottleneck.

---

### 5. Background builder & customization

> "Build once, apply everywhere."

**Club:**
- `Automobile BG Builder`
- BG Builder `filter` / `update` / `info` / `delete` (v1 + v2)
- `Video Template Builder`
- Template Builder `filter` / `update` / `info` / `delete`
- `Assets Builder`
- Assets Builder `filter` / `info` / `delete`
- `turntable background generation`
- `background generation from image / video / panoramic image`
- `background independent warping`

**Playbook tie:** Centralized background and template management. Build a branded studio look once, apply it consistently across the entire inventory and all output formats.

---

### 6. Image corrections & enhancement

> "Fix what the camera got wrong."

**Club:**
- `exposure correction`
- `exposure classifier`
- `car exposure correction`
- `haze correction`
- `haze classifier`
- `tilt correction`
- `gyrometer-based tilt correction`
- `reflection correction + light correction by studio lighting`
- `reflection removal`
- `super res`
- `sd-superres`

**Playbook tie:** Normalizes quality across photos taken by different people, at different times, under different conditions. Protects consistency and market rank.

---

## Part C — Compliance & Cleanup

### 7. Compliance & privacy

> "Publish once, stay compliant everywhere."

**Club:**
- `number plate mask`
- `number plate detection`
- `watermark removal`
- `watermark detection`
- `watermark embedding`
- `profanity classifier`

**Playbook tie:** Reduces rework, lowers compliance risk, removes third-party watermarks, and keeps assets ready for immediate marketplace distribution.

---

### 8. Lot cleanup & defect detection

> "Fix the real-world mess. Catch what others miss."

**Club:**
- `banner detection`
- `banner remove bg / segmentation`
- `text inpaint`
- `smart banner creation with AI`
- `antenna detection`
- `rear view mirror`
- `rear view detection`
- `dent, damage, rust detection`
- `car antenna detector` (v1 + v2)

**Playbook tie:** Speeds up merchandising from imperfect lot photos, removes physical clutter, and catches condition issues that stall frontline readiness or hurt buyer trust.

---

### 9. Uncrop & frame recovery `standalone`

> "Rescue cropped, tight, or badly framed shots."

**Club:**
- `uncrop car` (`/lama/uncrop_car/`)
- `wall extend`
- `handle cropped input videos`

**Playbook tie:** Recovers usable merchandising assets from badly framed, cropped, or poorly composed source media. Protects gross ROI per day when source quality is weak.

---

## Part D — Windows, Interior & Detail

### 10. Window & glass intelligence

> "Show more of the car without another shoot."

**Club:**
- `window segmentation`
- `window mask / remove windows` (v1 + v2)
- `see through`
- `tint classifier — windows`
- `reflection classifier — windows`
- `window correction image`

**Playbook tie:** Improves presentation quality and helps the store merchandise a fuller vehicle story without adding operational workload.

---

### 11. Interior merchandising

> "Improve the inside story without slowing down the line."

**Club:**
- `interior remove bg`
- `car interior transformation`
- `interior sub classes classifier`
- `focus exterior`
- `seat gen output classifier`

**Playbook tie:** Helps the dealership present a more complete and premium listing while keeping the photo workflow efficient.

---

### 12. Tyre & wheel detail `standalone`

> "Upgrade the details buyers subconsciously notice."

**Club:**
- `tyre segmentation`
- `tyre detection`
- `tyre reflection`
- `tyre remove bg`
- `tyre placement with wall and floor`

**Playbook tie:** Supports a premium visual standard across the inventory set, especially on hero images.

---

## Part E — 360, 3D & Video

### 13. 360 spin & service separation

> "Turn 4 photos into a full spin. In under 30 seconds."

**Club:**
- `4 images to 360` (replace 8 image 360 spin)
- `0.5X shoots to 1X spin`
- `360 from broken video`
- `tilt correction for 360`
- `tilt correction in placement correction tool`
- `placement logic improvement for 8 images to 360`
- `8 frame extraction centering`
- `360 processing time reduction to under 30 seconds`
- `background removal and 360 creation on app`
- `Exterior Remove Bg — 360 + Image`
- `licence plate masking in 3D`
- `service separation images`
- `service separation 360`

**Playbook tie:** 360 is no longer a separate shoot day or expensive rig. Processed in under 30 seconds. Service-drive and trade-in photos go straight to merchandising without waiting for a bay move.

---

### 14. Interior 3D & panoramic

> "Give buyers a walkthrough from their phone."

**Club:**
- `Interior Images to Pano`
- `Pano to Interior 3D`
- `Interior 360 Generation`
- `avatar maker`

**Playbook tie:** Turns standard interior captures into an immersive experience that increases time-on-VDP and reduces "send more photos" friction.

---

### 15. Video, 3D & novel-view generation

> "Generate views the camera never took."

**Club:**
- `video stabilizer`
- `video frame extraction`
- `video trimmer`
- `create gif`
- `structure from motion (colmap)`
- `novel-view synthesis` (train on each iteration)
- `VGGT integration`
- `MVGenMaster pipeline`
- `video render API`
- `video processing`
- `3D output file size reduction & loading time`
- `3D processing time reduction`

**Playbook tie:** Rich media — video, 3D, novel views — becomes part of the same operating system, not a separate team or workflow.

---

## Part F — Engagement & Output

### 16. Hotspots & interactive merchandising `standalone`

> "Make listings feel premium and modern."

**Club:**
- `hotspot inference`
- `hotspots prediction`
- `hotspot info API`
- `video hotspot detection`
- `overlay generator`
- `exterior car features / hotspots`
- `hotspot accuracy improvement`

**Playbook tie:** Moves the dealership from static listings to a more advanced digital retail experience that supports higher engagement and conversion.

---

### 17. On-device & real-time processing

> "AI runs while your team is still shooting."

**Club:**
- `realtime background removal while capturing`
- `background removal and 360 creation on app`
- `Merchandise Quality / Media Score — on app while capturing`
- `angle detection iOS on edge`
- `car detection iOS on edge`
- `on-edge Android`
- `realtime sync processing`

**Playbook tie:** Moves AI processing from a back-office queue to the lot itself. The porter sees retail-ready output before they walk to the next car.

---

### 18. Media scoring `standalone`

> "Score every listing. Before it goes live."

**Club:**
- `media scoring`
- `image score`
- `Merchandise Quality / Media Score`

**Playbook tie:** Gives management a quality scoreboard across the entire inventory — consistent with the playbook principle of visible scorecards at store, manager, and rep levels.

---

## Other Verticals (not part of core dealership demo)

> Show these only when the buyer operates in these categories or when positioning Spyne as a multi-vertical platform.

### Fashion
- `Human BG` (fashion bg removal)
- `Fashion Wall Changer`
- `Saree`

### Food
- `Food Angle Classifier`
- `Food Type Classifier`
- `Food Detector`
- `Food Remove BG`
- `Food Shadow Validation`
- `Food Validation API`

### E-commerce
- `Flatlays BG Removal`
- `Ecom Resizing`
- `Ecom Validation`
- `Ecom Transformation`
- `Ecom SKU`
- `Ecom Angle Classifier`

### Home Furnishing
- `Tiles Perspective Transform`
- `HF Tiles`

### Specialty Vehicles
- `Bike Transformation`
- `Bike RemoveBG`
- `Bike Replace BG`
- `Bike Wall Change`
- `Boats Exterior RemoveBG`
- `Boats Interior RemoveBG`
- `Boats Replace BG`
- `Large Vehicles RemoveBG`

---

## Quick reference — demo flow by meeting length

**10-minute executive summary:**
Chapters 1, 4, 7, 13, 18

**20-minute GM demo:**
Chapters 1–7, 13, 18

**30-minute full product tour:**
Chapters 1–13, 16, 18

**45-minute deep dive (technical audience present):**
All 18 chapters

---

## Sources

- OpenAPI spec (`/openapi.json` — FastAPI 0.1.0, OAS 3.1)
- Internal model inventory and purpose definitions
- Jira AI project backlog (exported March 2026)
- [Spyne business overview](spyne-business.md)
- [Used car playbook context](used-car-context.md)
- Demo console codebase ([`lib/demo-store.ts`](lib/demo-store.ts), [`components/demo-console/`](components/demo-console/))
