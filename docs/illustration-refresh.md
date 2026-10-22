# DealerPass — illustration and motion update

Generated with the built-in image-generation tool, using the supplied orange car illustration as the visual reference. Original brand logo files are unchanged.

## Project assets

- `public/brand/editorial-inspection.webp`: a buyer inspecting an orange coupe at an auction yard; clipboard, open front luggage compartment, charcoal and ivory environment.
- `public/brand/editorial-costs.webp`: hands reviewing an inspection sheet and calculator, car key and model car on a desk.
- `public/brand/editorial-academy.webp`: mentor and two adult students inspecting a vehicle in an auction hall.
- `public/brand/film-half.webp`: intermediate hand pose between the original open palm and closed fist, with four fingers and one thumb.

## Prompt set

Shared scene direction: square editorial illustration matching the supplied reference. Bold angular shapes, crisp black outlines, solid graphic shadows, refined automotive detail and cinematic perspective. Warm ivory #F2EEE7, orange #FF4D00, charcoal #171A1D and muted gray. Subject within central area; quiet upper and lower edges for HTML overlays. No typography, watermark or added brand marks.

Inspection: adult buyer in black clothing examines an orange sports coupe at an auction yard holding an ivory clipboard; open hood and background dark vehicle. Correction: front luggage compartment rather than front engine, preserving the rest of the scene.

Costs: close-up of ivory hands at a charcoal desk using an orange calculator and marking an inspection sheet, miniature car and key nearby, car silhouette through a workshop window.

Academy: mentor in black jacket explaining vehicle inspection to two adult students beside an orange coupe, one student holding a tablet, refined auction hall setting.

Intermediate hand: one half-curled pose between open and closed references. Same transparent landscape canvas, wrist, sleeve, key symbol and strap alignment. Correct anatomy to one thumb plus four fingers. No scenery or new text.

## Motion implementation

Native scroll drives a time-based exponential smoothing loop (105 ms time constant). The loop stops once settled and cancels on unmount. Three hand poses blend during closure; hand withdrawal overlaps vehicle arrival. Car follows a shallow curved approach with subtle rotation. Reduced-motion preference uses the static opening composition. This is layered web animation, not a rendered video or articulated 3D model.

Lower desktop illustrations crossfade by chapter. On narrow screens, each chapter has its own inline illustration. The academy preview uses the same visual family.
