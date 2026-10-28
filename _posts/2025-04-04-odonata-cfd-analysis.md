---
layout: project
title: "Dragonfly CFD Analysis"
date: 2025-04-04
lead_text: "Aerodynamic analysis of reconstructed Odonata wings using OpenFOAM software."
summary: "Static and flapping CFD simulations of a fully reconstructed, corrugated Orthetrum caledonicum forewing in OpenFOAM, using a rotating Arbitrary Mesh Interface to model the wing stroke."
eyebrow: "Exascale CFD Project · Georgia Tech Flow Physics & Computational Science Lab · April 2026"
chips: ["CFD", "OpenFOAM", "C++"]
featured_image: /img/posts/odonata.jpg
report_pdf: /pdfs/Odonata-CFD-Analysis.pdf
project_link: /2025/04/04/odonata-cfd-analysis.html
button_text: "Read More"
button_icon: "file-text-o"
stats:
  - { value: "0.824", label: "Peak lift coefficient at α = 28°" }
  - { value: "≈30°", label: "Stall angle, vs ≈15° for smooth airfoils" }
  - { value: "≈3.0", label: "Best lift-to-drag ratio, at low α" }
  - { value: "30 Hz", label: "Simulated flapping, ±15° stroke" }
---

## Overview

Dragonflies are some of the most agile flyers in nature. They hover, dart and even fly backwards using wings that are **corrugated**, folded into ridges and valleys instead of being smooth airfoils. Those ridges trap small vortices that keep the flow attached, making the wing both stiffer and more stall-resistant. That makes dragonfly wings a strong model for micro-air vehicles (MAVs).

Most flapping-wing CFD studies simplify the wing to a flat plate. Our team simulated a **fully reconstructed 3D forewing** of *Orthetrum caledonicum* instead, in two ways:

<div class="spec-grid two">
  <div><span>Static case · simpleFoam</span><b>Gliding wing, α from 0° to 60° in 2° steps</b></div>
  <div><span>Dynamic case · pimpleFoam</span><b>Flapping wing on a rotating AMI, ±15° at 30 Hz</b></div>
</div>

{% include figure.html src="/img/projects/odonata/wing-profile.jpg" caption="The reconstructed Orthetrum caledonicum forewing geometry, showing its corrugated surface." class="narrow" %}

## Simulation setup

Both cases share a turbulence model and boundary-condition strategy. The dynamic case adds an **Arbitrary Mesh Interface (AMI)**: a cylinder of mesh around the wing that rotates as a rigid body and slides against the stationary outer mesh through `cyclicAMI` patches.

{% include figure.html src="/img/projects/odonata/boundary-conditions.jpg" caption="Fig. 1 — Computational domain and boundary patches: inlet, outlet, front/back, top-and-bottom, the wing, and (dynamic case) the AMI cylinder." %}

<div class="setup-cards">
  <div><h3>Turbulence</h3><p>RAS k-ω SST with wall functions (kqR, nutk, omega) on all solid patches. Inlet turbulence intensity 0.05.</p></div>
  <div><h3>Flow</h3><p>Air as a Newtonian fluid, ν = 1×10⁻⁵ m²/s. Cruise speed 5 m/s, Re ≈ 5,000.</p></div>
  <div><h3>Meshing</h3><p>blockMesh background, refined around the wing with snappyHexMesh. The geometry is rotated and re-meshed for each angle of attack.</p></div>
  <div><h3>Numerics</h3><p>Euler time scheme, Gauss linear gradients, GAMG solver (tol 1×10⁻⁷), Δt = 0.0002 s. Scotch decomposition across 8 processors.</p></div>
</div>

One lesson from the static case: rotating the inflow velocity vector to set the angle of attack produced unrealistic drag curves. Rotating the **geometry** with `surfaceTransformPoints` and re-meshing for every angle gave physically sensible results.

## Static gliding results {#results}

At 5 m/s the flow stagnates at the leading edge, speeds up to about 6 m/s over the top and slows to 3–4 m/s underneath. The result is a pressure difference of about 2.4 Pa across the wing, which is where the lift comes from.

<div class="compare" data-compare>
  <div class="compare-tabs viz-tabs">
    <button class="on" data-src="/img/projects/odonata/velocity-contour.jpg" data-caption="Fig. 6 — Velocity magnitude at the wing's mid-span section.">Velocity</button>
    <button data-src="/img/projects/odonata/pressure-contour.jpg" data-caption="Fig. 7 — Pressure at the wing's mid-span section.">Pressure (section)</button>
    <button data-src="/img/projects/odonata/pressure-top.jpg" data-caption="Fig. 2 — Surface pressure on the upper side of the wing.">Upper surface</button>
    <button data-src="/img/projects/odonata/pressure-bottom.jpg" data-caption="Fig. 3 — Surface pressure on the lower side of the wing.">Lower surface</button>
    <button data-src="/img/projects/odonata/pressure-front.jpg" data-caption="Fig. 4 — Pressure seen from the leading edge.">Front view</button>
  </div>
{% include figure.html src="/img/projects/odonata/velocity-contour.jpg" caption="Fig. 6 — Velocity magnitude at the wing's mid-span section." %}
</div>

Sweeping the angle of attack from 0° to 60° gives the full aerodynamic picture. Hover over any point for exact values.

<div class="viz" id="polar-viz">
  <div class="viz-toolbar">
    <div class="viz-tabs" role="tablist">
      <button class="on" data-key="CL">Lift C<sub>L</sub></button>
      <button data-key="CD">Drag C<sub>D</sub></button>
      <button data-key="LD">C<sub>L</sub>/C<sub>D</sub></button>
      <button data-key="polar">Drag polar</button>
    </div>
  </div>
  <div class="viz-canvas"><canvas></canvas></div>
  <p class="viz-caption" id="polar-caption"></p>
</div>
<p class="viz-note">Values were digitized from the report's plots (Figs. 8–11), accurate to about ±0.005.</p>

**The corrugated wing stalls late.** Lift climbs to a first peak of 0.669 at 14° and keeps rising to **0.824 at 28°** before stalling. That is roughly twice the stall angle of a smooth airfoil (≈15°). The ridges act as guides that keep the leading-edge vortex attached longer.

**But it is most efficient at low angles.** Lift-to-drag peaks near 3 at small angles of attack, then falls steadily as drag rises. This supports the idea that real dragonflies generate extra lift by flapping rather than by flying at high angles of attack.

## Flapping-wing results

In the dynamic case the AMI rotates the wing through ±15° (0.262 rad) at **30 Hz**, one stroke every 0.033 s, with a fixed angle of attack. Press play to watch the stroke alongside the lift it produces.

<div class="viz flap" id="flap-viz">
  <div class="flap-stage">
    <svg viewBox="-160 -90 320 180" aria-label="Front view of the flapping wing">
      <line x1="-150" y1="0" x2="150" y2="0" class="flap-ref"/>
      <path class="flap-arc" d="M 135.2 -36.2 A 140 140 0 0 1 135.2 36.2"/>
      <g class="flap-wing"><rect x="0" y="-4" width="140" height="8" rx="4"/></g>
      <circle r="6" class="flap-root"/>
    </svg>
    <div class="flap-readout"></div>
  </div>
  <div class="viz-canvas short"><canvas></canvas></div>
  <div class="viz-scrub">
    <button class="viz-play" type="button" aria-label="Play"><i class="fa fa-play"></i></button>
    <input type="range" min="0" value="0" step="1" aria-label="Simulation time">
  </div>
</div>
<p class="viz-note">C<sub>L</sub>(t) was digitized from report Fig. 13. The wing angle is drawn from the prescribed motion φ(t) = 15° · sin(2π · 30 t), for illustration only.</p>

Lift oscillates almost sinusoidally between **+0.34 and −0.34** on every cycle. Downstrokes produce positive lift and upstrokes negative lift. Plotting drag against lift traces a figure-eight that repeats cycle after cycle. The large drag swings at the extremes are where drag changes direction, driven by wake vortices.

{% include figure.html src="/img/projects/odonata/cd-vs-cl-flapping.jpg" caption="Fig. 12 — Drag vs lift coefficient over several flap cycles." class="narrow" %}

Step through three moments in the stroke. The wing tips see the highest velocities and the most unsteady flow. At the equilibrium position (0.192 s) the wing surface is nearly still, but the streamlines show that the wake is still active.

<div class="timestep" data-timestep>
  <div class="viz-tabs">
    <button class="on" data-t="0032">t = 0.0032 s</button>
    <button data-t="0512">t = 0.0512 s</button>
    <button data-t="192">t = 0.192 s</button>
  </div>
  <div class="timestep-pair">
{% include figure.html src="/img/projects/odonata/velocity-t0032.jpg" caption="Velocity on the wing surface" %}
{% include figure.html src="/img/projects/odonata/streamlines-t0032.jpg" caption="Streamlines around the wing" %}
  </div>
</div>

## Takeaways

<div class="takeaways">
  <div><h3>Corrugation delays stall</h3><p>The reconstructed wing kept producing lift up to about 30°, roughly double a smooth airfoil.</p></div>
  <div><h3>AMI works for flapping</h3><p>A sliding mesh interface preserved mesh quality through repeated strokes, which validates the method for bio-inspired flight.</p></div>
  <div><h3>Next steps</h3><p>Flexible wings, pitching motion, refined turbulence modeling, and forewing–hindwing interaction.</p></div>
</div>

<p class="credits"><strong>Team:</strong> Gracye C. Lamb, Amirdhini C. Pechiammal, Aadhavan Magesh, Devanshi Bhargava, Ananya Mahavratayajula, Jonah C. Holloway and Alexander R. Miramontes. Advised by Prof. Suhas Jain and Luis Hatashita, Exascale CFD Vertically Integrated Project, Georgia Tech.</p>

<script>
  window.projectData = { odonata: {{ site.data.odonata | jsonify }} };
</script>
