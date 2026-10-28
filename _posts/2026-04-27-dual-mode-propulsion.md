---
layout: project
title: "Dual-Mode Propulsion Aircraft Design"
date: 2026-04-27
lead_text: "Design study for an aircraft combining air-breathing and rocket propulsion."
summary: "A reusable, horizontal-takeoff launch aircraft that carries a 15,000 kg payload to Mach 6 at 30 km using an afterburning turbofan, a ramjet and a LOX/RP-1 rocket in sequence."
eyebrow: "AE 4451 · Jet & Rocket Propulsion · April 2026"
chips: ["Cycle Analysis", "Trajectory Simulation", "MATLAB"]
featured_image: /img/posts/dual-mode-prop.jpg
project_link: /2026/04/27/dual-mode-propulsion.html
button_text: "Read More"
button_icon: "file-text-o"
position: right
stats:
  - { value: "M 6.04", label: "Release Mach at 30.0 km" }
  - { value: "77.8%", label: "Impulse from air-breathing engines (≥ 40% required)" }
  - { value: "2.31%", label: "Payload fraction (≥ 2% required)" }
  - { value: "549 s", label: "Takeoff to payload release" }
---

## Overview

The mission: design a reusable aircraft that takes off from a runway and releases a 15,000 kg payload at **Mach 6 and 30 km altitude**. That makes it a hypersonic first stage for a launch system. No single engine works efficiently from a standing start to Mach 6, so the design uses three engines in series. A coupled trajectory and engine-cycle model, written in MATLAB, checks the design against every requirement.

<div class="spec-grid">
  <div><span>Payload</span><b>15,000 kg</b></div>
  <div><span>Max takeoff mass</span><b>650,000 kg</b></div>
  <div><span>Runway</span><b>&lt; 3,500 m</b></div>
  <div><span>Liftoff speed</span><b>≤ 95 m/s</b></div>
  <div><span>Turbine inlet temp.</span><b>≤ 2,200 K</b></div>
  <div><span>Rocket burn</span><b>60–180 s</b></div>
</div>

## Propulsion architecture

Each engine hands off at the point where the next one becomes more effective.

<div class="phase-band">
  <div class="phase-seg tf" style="flex:1.8">
    <span class="phase-mach">M 0 → 1.8</span>
    <strong>Afterburning turbofan</strong>
    <span>Low bypass ratio (0.4) keeps net thrust through the transonic regime. The afterburner lights at M 1.0 to push through drag rise.</span>
  </div>
  <div class="phase-seg rj" style="flex:2.2">
    <span class="phase-mach">M 1.8 → 4.0</span>
    <strong>Subsonic-combustion ramjet</strong>
    <span>Ram compression alone supplies the pressure ratio. It flies below 20 km to keep mass flow high.</span>
  </div>
  <div class="phase-seg rk" style="flex:2">
    <span class="phase-mach">M 4.0 → 6.0</span>
    <strong>LOX/RP-1 rocket</strong>
    <span>A 6 MN, 66 s burn adds the last ≈660 m/s and climbs to the 30 km release point.</span>
  </div>
</div>

The turbofan-to-ramjet handoff at M 1.8 comes while the turbofan still has thrust margin and the ramjet inlet flow is established. Handing off to the rocket at M 4.0 clears the M ≥ 3.0 air-breathing requirement with room to spare.

## Trajectory {#results}

The vehicle is modeled as a point mass in the vertical plane, flying through the ICAO standard atmosphere. MATLAB's stiff solver `ode15s` integrates it, with the flight-path angle scheduled by altitude and Mach number:

<div class="eq">\[ \frac{dv}{dt} = \frac{F - D}{m} - g_0 \sin\gamma, \qquad \frac{dh}{dt} = v\sin\gamma, \qquad \frac{dm}{dt} = -\dot m_f \]</div>

Drag the slider or press play to step through the 549-second mission. Use the tabs to switch variables.

<div class="viz" id="trajectory-viz">
  <div class="viz-toolbar">
    <div class="viz-tabs" role="tablist">
      <button class="on" data-key="h">Altitude</button>
      <button data-key="v">Velocity</button>
      <button data-key="M">Mach</button>
      <button data-key="m">Mass</button>
      <button data-key="Mh">Mach vs altitude</button>
    </div>
    <div class="viz-legend"><span class="tf">Turbofan + AB</span><span class="rj">Ramjet</span><span class="rk">Rocket</span></div>
  </div>
  <div class="viz-canvas"><canvas></canvas></div>
  <div class="viz-scrub">
    <button class="viz-play" type="button" aria-label="Play"><i class="fa fa-play"></i></button>
    <input type="range" min="0" value="0" step="1" aria-label="Mission time">
  </div>
  <div class="viz-readout"></div>
</div>
<p class="viz-note">Curves were digitized from the simulation's output plot, so values are accurate to roughly ±1% of each axis range.</p>

| Event | t [s] | h [km] | v [m/s] | Mach |
|---|---:|---:|---:|---:|
| Liftoff | 33 | 0 | 95 | 0.28 |
| Turbofan → Ramjet | 123.0 | 3.4 | 607 | 1.86 |
| Ramjet → Rocket | 482.7 | 14.8 | 1,181 | 4.00 |
| Payload release | 549.2 | 30.0 | 1,843 | 6.04 |

## Air-breathing cycle analysis

The turbofan model follows the air through the engine one stage at a time, from the freestream to the nozzle exit. It accounts for compressor bleed, afterburner reheat and shaft losses. Hover over the engine or pick a stage to see what happens there.

<div class="engine" id="engine">
  <svg viewBox="0 0 900 240" role="img" aria-label="Simplified one-dimensional turbofan schematic, flow from left to right">
    <defs>
      <marker id="eng-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="eng-arrowhead"/></marker>
    </defs>
    <g class="eng-zones">
      <rect data-zone="0" x="0" y="26" width="90" height="190"/>
      <rect data-zone="1" x="90" y="26" width="100" height="190"/>
      <rect data-zone="2" x="190" y="26" width="70" height="190"/>
      <rect data-zone="3" x="260" y="26" width="130" height="190"/>
      <rect data-zone="4" x="390" y="26" width="100" height="190"/>
      <rect data-zone="5" x="490" y="26" width="80" height="190"/>
      <rect data-zone="6" x="570" y="26" width="60" height="190"/>
      <rect data-zone="7" x="630" y="26" width="140" height="190"/>
      <rect data-zone="8" x="770" y="26" width="120" height="190"/>
    </g>
    <g class="eng-flow">
      <line x1="12" y1="95" x2="72" y2="95" marker-end="url(#eng-arrow)"/>
      <line x1="12" y1="120" x2="72" y2="120" marker-end="url(#eng-arrow)"/>
      <line x1="12" y1="145" x2="72" y2="145" marker-end="url(#eng-arrow)"/>
    </g>
    <path class="eng-hub" d="M175,120 Q192,99 222,100 L560,104 L592,120 L560,136 L222,140 Q192,141 175,120 Z"/>
    <g class="eng-blades">
      <line x1="212" y1="42" x2="212" y2="100"/><line x1="212" y1="140" x2="212" y2="198"/>
      <line x1="236" y1="42" x2="236" y2="100"/><line x1="236" y1="140" x2="236" y2="198"/>
      <line x1="282" y1="47" x2="282" y2="101"/><line x1="282" y1="139" x2="282" y2="193"/>
      <line x1="306" y1="52" x2="306" y2="101"/><line x1="306" y1="139" x2="306" y2="188"/>
      <line x1="330" y1="57" x2="330" y2="102"/><line x1="330" y1="138" x2="330" y2="183"/>
      <line x1="354" y1="61" x2="354" y2="102"/><line x1="354" y1="138" x2="354" y2="179"/>
      <line x1="376" y1="65" x2="376" y2="102"/><line x1="376" y1="138" x2="376" y2="175"/>
      <line x1="506" y1="65" x2="506" y2="103"/><line x1="506" y1="137" x2="506" y2="175"/>
      <line x1="528" y1="61" x2="528" y2="103"/><line x1="528" y1="137" x2="528" y2="179"/>
      <line x1="550" y1="56" x2="550" y2="104"/><line x1="550" y1="136" x2="550" y2="184"/>
    </g>
    <rect class="eng-liner" x="402" y="74" width="76" height="22" rx="8"/>
    <rect class="eng-liner" x="402" y="144" width="76" height="22" rx="8"/>
    <path class="eng-flame" d="M420,96 q10,-16 20,0 q8,-12 16,0 z M420,144 q10,16 20,0 q8,12 16,0 z"/>
    <path class="eng-bleed" d="M330,57 C330,14 600,14 600,52" marker-end="url(#eng-arrow)"/>
    <g class="eng-ab">
      <line x1="646" y1="62" x2="646" y2="178"/>
      <path d="M662,92 L676,104 L662,116 M662,124 L676,136 L662,148"/>
      <path class="eng-flame" d="M690,104 q14,-8 28,0 q-14,8 -28,0 z M690,136 q14,-8 28,0 q-14,8 -28,0 z"/>
    </g>
    <polyline class="eng-wall" points="90,52 120,44 190,40 260,40 390,65 490,65 570,50 770,50 830,75 880,60"/>
    <polyline class="eng-wall" points="90,188 120,196 190,200 260,200 390,175 490,175 570,190 770,190 830,165 880,180"/>
    <g class="eng-numbers">
      <text x="45" y="234">0</text><text x="140" y="234">1</text><text x="225" y="234">2</text><text x="325" y="234">3</text><text x="440" y="234">4</text><text x="530" y="234">5</text><text x="600" y="234">6</text><text x="700" y="234">7</text><text x="830" y="234">8</text>
    </g>
    <g class="eng-pointer" id="engine-pointer"><path d="M-9,0 L9,0 L0,14 Z"/></g>
  </svg>
</div>

<div class="stations" id="stations">
  <button data-zone="0" data-info="Freestream: ambient pressure and temperature from the standard atmosphere at the current altitude and Mach number.">0<small>Freestream</small></button>
  <button data-zone="1" data-info="Inlet: slows the air and raises its pressure, keeping 95% of the ideal total pressure (r_d = 0.95, MIL-E-5008B).">1<small>Inlet</small></button>
  <button data-zone="2" data-info="Fan: pressure ratio 3.5 at 90% efficiency. Part of the flow (bypass ratio 0.4) skips the core.">2<small>Fan</small></button>
  <button data-zone="3" data-info="Compressor: pressure ratio 12 (42 overall) at 90% efficiency. 8% of the air is bled off here.">3<small>Compressor</small></button>
  <button data-zone="4" data-info="Burner: fuel is added until the gas reaches the 2,200 K turbine-inlet limit. 95% combustion efficiency, 95% pressure recovery.">4<small>Burner</small></button>
  <button data-zone="5" data-info="Turbine: extracts the work that drives the fan and compressor. 92% efficiency with 0.99 shaft mechanical efficiency.">5<small>Turbine</small></button>
  <button data-zone="6" data-info="Bleed mix: the 8% compressor bleed rejoins the hot gas after the turbine, so no mass is lost from the cycle.">6<small>Bleed mix</small></button>
  <button data-zone="7" data-info="Afterburner: above Mach 1.0, extra fuel reheats the gas to 2,000 K for a thrust boost. 90% combustion efficiency, 95% pressure recovery.">7<small>Afterburner</small></button>
  <button data-zone="8" data-info="Nozzle: expands the gas through a choked throat at 95% efficiency. The exit velocity sets the net thrust.">8<small>Nozzle</small></button>
</div>
<p class="station-info" id="station-info">Select a stage above.</p>

The ramjet uses the same inlet, combustor and nozzle relations without rotating machinery. Across its operating envelope, specific thrust rises and fuel consumption falls:

<div class="viz" id="performance-viz">
  <div class="viz-canvas short"><canvas></canvas></div>
</div>
<p class="viz-note">Approximate specific thrust and thrust-specific fuel consumption at trajectory waypoints (report Table 7).</p>

## Rocket stage

**LOX/RP-1** was chosen over LOX/LH2. Hydrogen's higher specific impulse (≈450 s vs 300 s) doesn't make up for its volume penalty on a burn this short:

- **Density:** RP-1 tanks are about 6× smaller than LH2 tanks, which matters inside an aircraft fuselage.
- **Storage:** RP-1 is storable at room temperature, with no cryogenic insulation adding dry mass.
- **Heritage:** LOX/RP-1 has flown on the Saturn V F-1, Falcon 9 Merlin and Atlas V.

The 6 MN engine burns 2,039 kg/s for **66.4 s**, which is inside the 60–180 s window.

### Trade study: what if it were a solid motor?

A solid rocket motor would be simpler, but its lower specific impulse costs propellant mass. Move the slider to see how much extra propellant different specific impulses would need for the same impulse.

<div class="calc" id="srm-calc">
  <label>Solid motor I<sub>sp</sub> <output>260 s</output>
    <input type="range" min="230" max="300" value="260" step="1">
  </label>
  <div class="calc-out">
    <div><span>Propellant needed</span><b data-out="mass">156,350 kg</b></div>
    <div><span>vs LOX/RP-1 (135,500 kg)</span><b data-out="delta">+20,850 kg</b></div>
  </div>
  <p class="calc-note">Uses m<sub>p,SRM</sub> = m<sub>p,LRE</sub> · I<sub>sp,LRE</sub> / I<sub>sp,SRM</sub>. At 260 s (typical AP/HTPB) the extra mass exceeds the whole payload, so the liquid engine wins.</p>
</div>

## Mass & feasibility

Hover over a segment to see where the 650 tonnes go at takeoff.

<div class="massbar" id="massbar"></div>
<p class="massbar-info" id="massbar-info">&nbsp;</p>

Air-breathing engines burn only 39% of the propellant but deliver 78% of the total impulse:

<div class="viz" id="impulse-viz">
  <div class="viz-canvas short"><canvas></canvas></div>
</div>

| Requirement | Achieved | Threshold | |
|---|---|---|---|
| Release Mach | 6.04 | 6.0 (± 0.2) | <span class="pass">PASS</span> |
| Release altitude | 30.0 km | 30 km | <span class="pass">PASS</span> |
| Gross takeoff mass | 650,000 kg | ≤ 650,000 kg | <span class="pass">PASS</span> |
| Liftoff speed | 95 m/s | ≤ 95 m/s | <span class="pass">PASS</span> |
| Payload fraction | 0.0231 | ≥ 0.02 | <span class="pass">PASS</span> |
| Max air-breathing Mach | 4.00 | ≥ 3.0 | <span class="pass">PASS</span> |
| Air-breathing impulse share | 77.8% | ≥ 40% | <span class="pass">PASS</span> |
| Component efficiencies | 0.90–0.95 | 0.85–0.95 | <span class="pass">PASS</span> |
| Max turbine inlet temp. | 2,200 K | ≤ 2,200 K | <span class="pass">PASS</span> |
| Rocket I<sub>sp</sub> | 300 s | 300–360 s | <span class="pass">PASS</span> |
| Rocket burn duration | 66.4 s | 60–180 s | <span class="pass">PASS</span> |

## Comparison with Skylon / SABRE

| | This design | Skylon / SABRE |
|---|---|---|
| Propulsion | Three serial engines (turbofan, ramjet, rocket) | One precooled hybrid engine |
| Air-breathing fuel | Jet-A (kerosene) | Liquid hydrogen |
| Rocket propellant | LOX/RP-1 | LOX/LH2 |
| Max air-breathing Mach | 4.0 | 5.5 |
| Final Mach | 6 (payload release) | 25 (orbit) |
| Payload fraction | 2.3% | 3.5% (claimed, LEO) |
| Maturity | Flight-proven subsystems | Experimental precooler |

SABRE gains specific impulse by burning hydrogen throughout, but needs large insulated tanks and precooler hardware that has never flown. This design gives up some efficiency in exchange for mature, storable components. It is also a Mach 6 first stage rather than a single-stage-to-orbit vehicle.

## Takeaways

<div class="takeaways">
  <div><h3>Density beats I<sub>sp</sub> here</h3><p>For a short ≈660 m/s rocket burn, compact RP-1 tanks are worth more than hydrogen's efficiency.</p></div>
  <div><h3>Air-breathing does the heavy lifting</h3><p>More than three-quarters of the mission impulse comes before the rocket lights.</p></div>
  <div><h3>Model limits</h3><p>The model uses constant specific heats, a fixed-cycle turbofan and a constant-I<sub>sp</sub> rocket. Refining these would shift margins, not feasibility.</p></div>
</div>


<script>
  window.projectData = {
    trajectory: {{ site.data.dual_mode_trajectory | jsonify }},
    performance: [
      { label: "TF dry, M 0.6",  M: 0.6, Fs: 200, tsfc: 28, phase: "tf" },
      { label: "TF + AB, M 1.2", M: 1.2, Fs: 340, tsfc: 80, phase: "tf" },
      { label: "TF + AB, M 1.8", M: 1.8, Fs: 390, tsfc: 70, phase: "tf" },
      { label: "Ramjet, M 2.5",  M: 2.5, Fs: 370, tsfc: 70, phase: "rj" },
      { label: "Ramjet, M 3.0",  M: 3.0, Fs: 420, tsfc: 50, phase: "rj" },
      { label: "Ramjet, M 4.0",  M: 4.0, Fs: 460, tsfc: 45, phase: "rj" }
    ],
    impulse: [
      { phase: "tf", name: "Turbofan + AB", propellant: 46120,  impulse: 9.05e8 },
      { phase: "rj", name: "Ramjet",        propellant: 42080,  impulse: 4.95e8 },
      { phase: "rk", name: "Rocket",        propellant: 135500, impulse: 3.99e8 }
    ],
    mass: [
      { name: "Payload (released)", kg: 15000, color: "#6A3D8C" },
      { name: "Structure (airframe, wings, tanks)", kg: 78000, color: "#2E2547" },
      { name: "Turbofan engines (4)", kg: 11000, color: "#5E5475" },
      { name: "Ramjet", kg: 3000, color: "#857AA0" },
      { name: "Rocket engine", kg: 6000, color: "#ADA3C2" },
      { name: "Turbofan fuel (Jet-A)", kg: 46120, color: "#3B6FD8" },
      { name: "Ramjet fuel (Jet-A)", kg: 42080, color: "#8A4FD1" },
      { name: "LOX/RP-1 propellant", kg: 135500, color: "#C2448F" },
      { name: "Avionics, residuals, margin", kg: 313300, color: "#E0DAE8" }
    ]
  };
</script>
