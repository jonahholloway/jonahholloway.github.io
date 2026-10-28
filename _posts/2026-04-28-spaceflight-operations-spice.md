---
layout: project
title: "Spaceflight Operations with NASA SPICE"
date: 2026-04-28
lead_text: "Mission analysis on real NASA Lucy and Dawn data: trajectories, observability, spacecraft imaging, orbit uncertainty and planetary mapping."
summary: "Six mission-analysis studies built in MATLAB on NASA's SPICE toolkit, using real flight data from the Lucy and Dawn missions. They cover reference frames, interplanetary trajectories, ground-based observability, spacecraft image pointing, orbit uncertainty, albedo mapping and surface orthorectification."
eyebrow: "AE 4361 · Spaceflight Operations · Georgia Tech · Spring 2026"
chips: ["MATLAB", "NASA SPICE (MICE)", "Orbital Mechanics", "Image Processing"]
featured_image: /img/posts/spaceflight-ops.svg
project_link: /2026/04/28/spaceflight-operations-spice.html
button_text: "Read More"
button_icon: "file-text-o"
stats:
  - { value: "6", label: "Studies built on real NASA flight data" }
  - { value: "500,001", label: "Time steps searched for Lucy's closest approaches" }
  - { value: "1,000", label: "Monte Carlo trials for Apophis' orbit uncertainty" }
  - { value: "0.2755", label: "Mean geometric albedo of Dinkinesh, consistent with an S-type asteroid" }
---

## Overview

Mission operators answer the same questions over and over: *where is the spacecraft, where is the target, what can we see, and when?* NASA's **SPICE** toolkit, maintained by JPL's Navigation and Ancillary Information Facility (NAIF), is the standard way to answer them. It stores spacecraft and planetary ephemerides, attitude, instrument geometry and clock data as **kernels**, and computes geometry from them.

In AE 4361 I used SPICE through its MATLAB interface (MICE) to work on real data from two NASA missions:

<div class="spec-grid">
  <div><span>Lucy</span><b>Jupiter Trojan tour, launched 2021</b></div>
  <div><span>Dawn</span><b>Ceres orbital imaging, 2015</b></div>
  <div><span>Apophis</span><b>Earth flyby on 13 April 2029</b></div>
  <div><span>Language</span><b>MATLAB + MICE</b></div>
  <div><span>Ephemeris</span><b>JPL DE440</b></div>
  <div><span>Imagery</span><b>L'LORRI and Dawn FC2 FITS frames</b></div>
</div>

Each study below uses ephemerides, frame definitions and instrument kernels, and builds on the methods of the one before it.

<div class="pipeline" id="kernels">
  <div class="pipeline-track" aria-hidden="true"><span class="pipeline-pulse"></span></div>
  <div class="pipeline-steps">
    <button data-info="SPK (.bsp): where things are. Position and velocity of planets (DE440), asteroids and spacecraft (Lucy, Dawn) over time."><i class="fa fa-globe"></i><b>SPK</b><small>Ephemerides</small></button>
    <button data-info="CK (.bc): which way a spacecraft or instrument is pointing over time. Needed to know what the camera actually saw."><i class="fa fa-compass"></i><b>CK</b><small>Attitude</small></button>
    <button data-info="FK (.tf) and IK (.ti): frame definitions, such as LUCY_LORRI and DAWN_FC2, and each camera's field-of-view geometry."><i class="fa fa-camera"></i><b>FK + IK</b><small>Frames &amp; instruments</small></button>
    <button data-info="PCK (.tpc, .bpc): body shapes and orientations. Ceres' triaxial radii, and two Earth-rotation models: IAU_EARTH and the high-precision ITRF93."><i class="fa fa-circle-o"></i><b>PCK</b><small>Shape &amp; rotation</small></button>
    <button data-info="LSK (.tls) and SCLK (.tsc): leap seconds and spacecraft clocks, so UTC timestamps on images map to ephemeris time."><i class="fa fa-clock-o"></i><b>LSK + SCLK</b><small>Time</small></button>
  </div>
  <p class="pipeline-info">Select a kernel type above.</p>
</div>

## Rotating frames

The first study was the foundation of everything else: moving vectors between frames that rotate relative to each other.

**Camera-frame velocity.** Given an Earth-fixed frame rotating relative to an inertial frame, and a spacecraft body frame rotating relative to Earth, I found the velocity of a ground observatory as seen by the spacecraft's onboard camera. I composed the I → E → B direction-cosine matrices, first checking that each one is a proper rotation (RᵀR = I, det R = +1). Then I applied the **transport theorem** at each step:

<div class="eq">\[ \left.\frac{d\mathbf{r}}{dt}\right|_{B} = \left.\frac{d\mathbf{r}}{dt}\right|_{I} - \boldsymbol{\omega}_{B/I} \times \mathbf{r} \]</div>

**The Moon in a Sun–Earth rotating frame.** Next I queried DE440 for the Moon's state every 0.1 days through all of 2026. I rotated it into a frame {ξ, η, ζ}, with ξ pointing from the Sun to Earth and ζ along Earth's orbital angular momentum. The rotation matrix changes at every time step, so velocities need the transport-theorem correction too, not just a rotation.

## Lucy's trajectory

NASA's **Lucy** mission is touring Jupiter's Trojan asteroids. These two swarms share Jupiter's orbit, 60° ahead of and behind the planet at its L4 and L5 Lagrange points. I first summarized the mission from recent journal articles (Levison et al. 2025; Douglas-Bradshaw et al. 2025), then reconstructed its trajectory from the mission SPK.

<div class="spec-grid two">
  <div><span>Search window</span><b>Oct 2021 → Apr 2033 (~11.5 years)</b></div>
  <div><span>Resolution</span><b>500,001 time steps per target</b></div>
  <div><span>Targets</span><b>Donaldjohanson, Leucus, Orus, Patroclus</b></div>
  <div><span>Method</span><b>Global minimum of Lucy–target distance</b></div>
</div>

From each target's closest-approach epoch, I drew the trajectories of Lucy, Earth and all four asteroids in a **Jupiter-centered co-rotating frame**: ξ along the Sun–Jupiter line, ζ along Jupiter's orbital angular momentum. In this frame Jupiter stands still, the Trojan swarms become two fixed clouds, and Lucy's path shows up as loops that carry it out to each swarm. The hero image above is a stylized sketch of that view.

## Observing Donaldjohanson

Before Lucy's April 2025 flyby of asteroid **Donaldjohanson** (DJ), could a telescope on Earth have seen it? Answering that took four pieces:

1. **Phase angle**: the Sun–DJ–observer angle over 2025, for both Earth and Lucy.
2. **Brightness**: apparent V-magnitude from the IAU H-G model, with H₀ from an 8 km diameter and an albedo of 0.25.
3. **Telescope size**: the smallest aperture that reaches that magnitude when Lucy is closest to DJ.
4. **Observing window**: DJ's and the Sun's elevation from the Very Large Telescope in Chile, minute by minute, to find when DJ is up and the Sun is down.

<div class="eq">\[ H_0 = -5\log_{10}\!\left(\frac{\sqrt{p_V}\,D}{1329}\right), \qquad V = H_0 + 5\log_{10}(r\,\Delta) - 2.5\log_{10}\!\big[(1-G)\,\Phi_1(\alpha) + G\,\Phi_2(\alpha)\big] \]</div>

Try the model below. Distances are in AU: r from the Sun, Δ from Earth.

<div class="calc" id="mag-calc">
  <label>Phase angle α <output data-for="alpha"></output>
    <input type="range" name="alpha" min="0" max="60" value="20" step="1">
  </label>
  <label>Sun distance r <output data-for="r"></output>
    <input type="range" name="r" min="1.5" max="4" value="2.4" step="0.05">
  </label>
  <label>Earth distance Δ <output data-for="delta"></output>
    <input type="range" name="delta" min="0.5" max="5" value="1.8" step="0.05">
  </label>
  <div class="calc-out">
    <div><span>Apparent magnitude V</span><b data-out="v"></b></div>
    <div><span>Minimum telescope aperture</span><b data-out="d"></b></div>
  </div>
  <p class="calc-note">Uses D = 8 km, p<sub>V</sub> = 0.25 (H₀ ≈ 12.6), G = 0.15 and the limiting-magnitude relation D<sub>min</sub> = 10<sup>(V − 16.8)/5</sup> m, as in my analysis. The slider positions are only example geometries, not the flyby values.</p>
</div>

**Two lessons from this study:**
- **Sampling rate matters.** At daily sampling, the Sun–DJ–Lucy phase angle seemed to jump at the flyby. In reality it swings from about 15° through 90° to 165° in a few hours as Lucy passes the asteroid. Resampling hourly around closest approach recovered the smooth curve.
- **The Earth-rotation model matters.** I repeated the VLT elevation calculation with the IAU_EARTH model and the high-precision ITRF93 kernel. This showed how much the choice of model shifts a predicted observing window.

## Pointing Lucy's camera

During the Donaldjohanson flyby, Lucy's **L'LORRI** camera took the images I used here. I took six raw FITS frames from 20 April 2025 and asked SPICE where DJ *should* appear in each one. I then rotated each frame so that ecliptic north is up, which makes frames comparable with each other and with star charts.

<div class="pipeline" id="lorri">
  <div class="pipeline-track" aria-hidden="true"><span class="pipeline-pulse"></span></div>
  <div class="pipeline-steps">
    <button data-info="Read each L'LORRI FITS frame, and its exact UTC capture time from the PDS label, converted to ephemeris time."><i class="fa fa-file-image-o"></i><b>Read</b><small>FITS + timestamps</small></button>
    <button data-info="Get the LORRI field-of-view corner vectors from the instrument kernel and convert them to an angular plate scale in radians per pixel."><i class="fa fa-crop"></i><b>Calibrate</b><small>FOV geometry</small></button>
    <button data-info="Query DJ's position relative to Lucy in the LUCY_LORRI frame, corrected for light time and stellar aberration (LT+S), using the attitude CK."><i class="fa fa-crosshairs"></i><b>Predict</b><small>Aberration-corrected state</small></button>
    <button data-info="Gnomonic (tangent-plane) projection onto the detector: x = cₓ + atan2(rₓ, |r_z|) / plate scale. The boresight is −z, so its sign has to be handled with care."><i class="fa fa-th"></i><b>Project</b><small>3D → pixel</small></button>
    <button data-info="Rotate ecliptic north (0, 0, 1) into the camera frame, project it onto the detector plane to get the new 'up' axis, and rotate every pixel and prediction to a north-up view."><i class="fa fa-repeat"></i><b>Re-orient</b><small>North-up view</small></button>
  </div>
  <p class="pipeline-info">Select a step above.</p>
</div>

Getting this right meant tracking down which kernels the frame chain needs: the FK that defines `LUCY_LORRI` and the CK that gives its attitude. It also meant reconciling image coordinate conventions: `imagesc` puts the origin at the top left, `pcolor` at the bottom left.

## Apophis &amp; Dinkinesh {#results}

### Orbit uncertainty after Apophis' 2029 flyby

On 13 April 2029, asteroid (99942) **Apophis** passes closer to Earth than geostationary satellites. Earth's gravity bends its orbit, so a small uncertainty in its velocity at that encounter grows by the next close approach in the mid-2030s.

- I found both encounter epochs with SPICE: a 60-second sweep for 2029, then a daily search over 2031–2040 refined to the hour.
- I then ran **1,000 Monte Carlo trials**, each starting from a random velocity error drawn uniformly within the given 3σ bounds.
- Each trial integrated the linearized relative-motion equations to the second encounter with `ode45`:

<div class="eq">\[ \delta\ddot{\mathbf{r}} = \frac{GM}{r^{5}}\left(3\,\mathbf{r}\mathbf{r}^{\mathsf{T}} - r^{2}\mathbf{I}\right)\delta\mathbf{r} \]</div>

The 3 × 3 covariance of the 1,000 final position errors gives the **error ellipsoid**: its semi-axes are the square roots of the covariance's eigenvalues.

### Albedo map of Dinkinesh

In November 2023 Lucy flew past the small asteroid **Dinkinesh** and discovered its moon, Selam. From one L'LORRI image, I built a pixel-by-pixel **geometric albedo** map:

1. Calibrated raw counts to radiance: I = DN / (t<sub>exp</sub> · R), with R = 70,000 and t<sub>exp</sub> = 0.01 s.
2. Used SPICE to get the Sun and Lucy directions at the image time, which gives the incoming solar flux and the phase geometry.
3. Computed p = πI / F for every pixel of Dinkinesh, masking out Selam.

<div class="spec-grid two">
  <div><span>Mean geometric albedo</span><b>p̄ = 0.2755</b></div>
  <div><span>Interpretation</span><b>Consistent with a stony S-type asteroid</b></div>
</div>

## Earth &amp; Ceres

### Weighing Earth with Lucy's swing-bys

Lucy flew past Earth for gravity assists in 2022 and 2024. Using **only** Lucy's SPICE states near each perigee, I solved for Earth's gravitational parameter from energy conservation between two points on the flyby (1 hour and 12 hours after perigee):

<div class="eq">\[ \mu_\oplus = \frac{v_1^{2} - v_2^{2}}{2\left(\dfrac{1}{r_1} - \dfrac{1}{r_2}\right)}, \qquad M_\oplus = \frac{\mu_\oplus}{G}, \qquad R_{\mathrm{SOI}} = a\left(\frac{\mu_\oplus}{\mu_\odot}\right)^{2/5} \]</div>

Each flyby gives an independent estimate of μ, so the two act as a consistency check before they are averaged. That μ then gives Earth's mass, sphere of influence and Lucy's hyperbolic excess speed v∞. Finding the flybys reliably meant taking the two *deepest* minima of Lucy's distance from Earth, not simply the first two. Each perigee was then refined to the second.

### Orthorectified mosaic of Ceres

The **Dawn** spacecraft orbited the dwarf planet Ceres. I took four of its Framing Camera 2 (FC2) images from August 2015 and projected them onto Ceres' surface as a single longitude–latitude map:

<div class="pipeline" id="ceres">
  <div class="pipeline-track" aria-hidden="true"><span class="pipeline-pulse"></span></div>
  <div class="pipeline-steps">
    <button data-info="Build a pointing ray for every pixel by bilinearly interpolating the four FC2 field-of-view corner vectors, then normalizing."><i class="fa fa-th"></i><b>Pixel rays</b><small>FOV interpolation</small></button>
    <button data-info="Rotate the rays from the DAWN_FC2 camera frame into the Ceres body-fixed frame (IAU_CERES) at each image's capture time."><i class="fa fa-refresh"></i><b>Rotate</b><small>Camera → Ceres-fixed</small></button>
    <button data-info="Cast each ray from Dawn's position and intersect it with Ceres' triaxial ellipsoid, x²/a² + y²/b² + z²/c² = 1, using the PCK radii."><i class="fa fa-bullseye"></i><b>Ray-cast</b><small>Hit the ellipsoid</small></button>
    <button data-info="Convert each surface hit to planetocentric longitude and latitude, handling the 0°/360° wrap, and draw all four images on one lon–lat grid."><i class="fa fa-map-o"></i><b>Map</b><small>Lon–lat mosaic</small></button>
    <button data-info="Ray-cast each pixel's four corners too, split the footprint into two triangles, and sum the cross-product areas to get the km² each image covers."><i class="fa fa-square-o"></i><b>Measure</b><small>Surface area</small></button>
  </div>
  <p class="pipeline-info">Select a step above.</p>
</div>

## Takeaways

<div class="takeaways">
  <div><h3>Frames are everything</h3><p>Almost every bug traced back to a frame: a missing FK/CK pair, a −z boresight, or an image origin in the wrong corner. Checking each transformation on its own saved hours.</p></div>
  <div><h3>Resolution is a choice</h3><p>Flybys happen in hours while missions last decades. A good search runs coarse, then fine, at every stage.</p></div>
  <div><h3>Validate with physics</h3><p>Two independent Earth-μ estimates, an albedo that matches S-type asteroids, and proper rotation matrices: each result came with its own sanity check.</p></div>
</div>
