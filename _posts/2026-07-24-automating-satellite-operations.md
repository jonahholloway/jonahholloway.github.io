---
layout: project
title: "Automating Satellite Operations"
date: 2026-07-24
lead_text: "A pipeline that translates spacecraft operating procedures into executable command scripts across multiple ground systems."
summary: "A pipeline that turns written spacecraft operating procedures, with all their branching logic, into validated command scripts for multiple command languages and ground systems."
eyebrow: "Satellite Platform Engineering Internship · Summer 2026"
chips: ["Python", "Test & Automation", "Satellite Operations"]
featured_image: /img/posts/sat-ops.svg
project_link: /2026/07/24/automating-satellite-operations.html
button_text: "Read More"
button_icon: "file-text-o"
stats:
  - { value: "46", label: "Satellites covered by the procedure library" }
  - { value: "1000+", label: "Operating procedures to translate" }
  - { value: "1 → N", label: "One source procedure, many command languages" }
  - { value: "3", label: "Stages: parse, translate, validate" }
---

## Overview

Satellite operators follow written **procedures** to command spacecraft: step-by-step instructions with checks, branches and decision points. Here, these procedures cover a fleet of 46 satellites. On-call engineers and mission control often step through them by hand, sending commands on the fly.

As a Satellite Platform Engineering intern, my mission was to **fully automate procedure translation**: turn a written procedure into an executable command script for every command language and ground system it needs to run on.

<div class="spec-grid">
  <div><span>Role</span><b>Design and build translator</b></div>
  <div><span>Iterate</span><b>Debug parsing and compilation logic</b></div>
  <div><span>Operations</span><b>Assist with real-time commanding</b></div>
  <div><span>Validation</span><b>Sandbox testing with simulation tools</b></div>
  <div><span>Challenge</span><b>No access to agent/model training</b></div>
  <div><span>Scope</span><b>Multiple ground systems running on different command languages</b></div>
</div>

## The problem

<div class="problem-grid">
  <div class="problem-col">
    <h3>Current state</h3>
    <ul>
      <li>1000+ procedures across dozens of spacecraft</li>
      <li>Engineers follow procedures and command manually, on the fly</li>
      <li>Manual commanding introduces human error and delays</li>
      <li>No consistent procedural automation across ground systems</li>
    </ul>
  </div>
  <div class="problem-arrow" aria-hidden="true"><i class="fa fa-long-arrow-right fa-2x"></i></div>
  <div class="problem-col highlight">
    <h3>Opportunity</h3>
    <ul>
      <li>Automate the creation of commanding procedures</li>
      <li>Encode branching logic and decision trees</li>
      <li>Reduce manual intervention and error</li>
      <li>Scale across command languages and ground systems</li>
    </ul>
  </div>
</div>

## Architecture {#results}

The translator is a pipeline. Each stage hands a cleaner representation of the procedure to the next. Select a stage to see what it does.

<div class="pipeline" id="pipeline">
  <div class="pipeline-track" aria-hidden="true"><span class="pipeline-pulse"></span></div>
  <div class="pipeline-steps">
    <button data-info="Procedures arrive in many formats. Automated workflows standardize them into a consistent .docx structure so every procedure starts from the same shape."><i class="fa fa-file-text-o"></i><b>Standardize</b><small>Automated workflows</small></button>
    <button data-info="Python scripts extract the procedural text and XML and parse it recursively. This separates sequential commands from conditional branches and preserves the decision tree."><i class="fa fa-sitemap"></i><b>Parse</b><small>Python</small></button>
    <button data-info="The parsed procedure is organized into an intermediate representation (IR) framework: every check, branch, command and wait gets a defined place in a language-agnostic structure, independent of any ground system."><i class="fa fa-cubes"></i><b>Structure</b><small>Intermediate representation</small></button>
    <button data-info="Language-specific compilers map the IR to each target command language's syntax and command set. Adding a new ground system means adding a compiler, not rewriting procedures."><i class="fa fa-code"></i><b>Compile</b><small>Per-language back ends</small></button>
    <button data-info="Error logging, semantic checks and simulator runs in a sandbox confirm that the compiled script still does what the procedure intended, before anything is used in production."><i class="fa fa-check-circle-o"></i><b>Validate</b><small>Sandbox + simulator</small></button>
  </div>
  <p class="pipeline-info" id="pipeline-info">Select a stage above.</p>
</div>

### How a procedure gets translated

Hover over (or tap) any line below. The matching step lights up in the parsed tree and in both compiled outputs.

<div class="translator" id="translator">
  <div class="tr-col">
    <p class="tr-label">1 · Written procedure</p>
    <ol class="tr-source">
      <li data-node="n1">Verify bus voltage <code>BUS_V</code> is reported.</li>
      <li data-node="n2">If <code>BUS_V</code> ≥ 28.0 V:</li>
      <li data-node="n3" class="indent">Enable heater group A.</li>
      <li data-node="n4" class="indent">Wait 30 s, then confirm heater A reads ON.</li>
      <li data-node="n5">Otherwise:</li>
      <li data-node="n6" class="indent">Notify the on-call engineer and hold.</li>
      <li data-node="n7">Log that the procedure is complete.</li>
    </ol>
  </div>
  <div class="tr-col">
    <p class="tr-label">2 · Intermediate representation</p>
<pre class="tr-code"><span data-node="n0">SEQUENCE</span>
<span data-node="n1">├─ CHECK   tlm BUS_V</span>
<span data-node="n2">├─ IF      BUS_V &gt;= 28.0</span>
<span data-node="n3">│  ├─ CMD     HEATER_A ENABLE</span>
<span data-node="n4">│  └─ WAIT    30 s → VERIFY HEATER_A == ON</span>
<span data-node="n5">├─ ELSE</span>
<span data-node="n6">│  └─ HOLD    notify=on-call</span>
<span data-node="n7">└─ LOG     "complete"</span></pre>
  </div>
  <div class="tr-col">
    <div class="tr-label tr-tabs viz-tabs">
      <button class="on" data-target="a">3 · Target A</button>
      <button data-target="b">Target B</button>
    </div>
<pre class="tr-code" data-out="a"><span data-node="n1">CHECK BUS_V</span>
<span data-node="n2">IF (BUS_V &gt;= 28.0) THEN</span>
<span data-node="n3">  CMD HTR_A_ENA</span>
<span data-node="n4">  WAIT 30
  VERIFY HTR_A_STAT = "ON"</span>
<span data-node="n5">ELSE</span>
<span data-node="n6">  ALERT ONCALL
  HOLD</span>
<span data-node="n2">ENDIF</span>
<span data-node="n7">LOG "complete"</span></pre>
<pre class="tr-code" data-out="b" hidden><span data-node="n1">v = tlm("BUS_V")</span>
<span data-node="n2">if v &gt;= 28.0:</span>
<span data-node="n3">    cmd("HEATER_A", "ENABLE")</span>
<span data-node="n4">    wait(30)
    verify(tlm("HEATER_A") == "ON")</span>
<span data-node="n5">else:</span>
<span data-node="n6">    alert("on-call")
    hold()</span>
<span data-node="n7">log("complete")</span></pre>
  </div>
</div>
<p class="viz-note">Illustrative example only. The procedure, telemetry names and both command syntaxes are invented to show the idea; they are not real operational procedures or command languages.</p>

## Key technical challenges

<div class="challenges" id="challenges">
  <div class="viz-tabs">
    <button class="on" data-c="0">1 · Parsing procedural logic</button>
    <button data-c="1">2 · Multi-language translation</button>
    <button data-c="2">3 · Format diversity &amp; validation</button>
  </div>
  <div class="challenge" data-c="0">
    <div><span>Problem</span><p>Procedures contain nested branching logic: conditional chains, decision trees and state dependencies that must be extracted exactly.</p></div>
    <div><span>Complexity</span><p>Different procedures use different formatting conventions, and many are structurally different from each other.</p></div>
    <div><span>Solution</span><p>Recursive parsing that rebuilds procedural intent from document structure, telling sequential commands apart from conditional branches.</p></div>
    <div class="impact"><span>Impact</span><p>An accurate representation of each procedure, which can be translated to any target command language.</p></div>
  </div>
  <div class="challenge" data-c="1" hidden>
    <div><span>Problem</span><p>Multiple command languages across ground systems, each with its own syntax, command set and operational semantics.</p></div>
    <div><span>Complexity</span><p>One procedure must compile correctly to every target without procedure-specific customization.</p></div>
    <div><span>Solution</span><p>A language-agnostic intermediate representation, plus a compiler per language that maps it to that target's syntax.</p></div>
    <div class="impact"><span>Impact</span><p>One source procedure, multiple validated command outputs, scalable to new ground systems.</p></div>
  </div>
  <div class="challenge" data-c="2" hidden>
    <div><span>Problem</span><p>Procedures come from diverse systems: legacy formats, inconsistent structure, mixed encodings and formatting.</p></div>
    <div><span>Complexity</span><p>Compiled procedures must keep their intent even when the source document is messy.</p></div>
    <div><span>Solution</span><p>Error logging during translation, semantic checks, and validation in a test environment before production use.</p></div>
    <div class="impact"><span>Impact</span><p>Robust procedures that handle operational edge cases with few manual steps.</p></div>
  </div>
</div>

## What's next

Errors in the written documentation itself still cause some translation failures. But the pipeline I've developed turns every procedure into structured, validated data. That makes it a strong foundation for **training agents and models**: flagging documentation errors and unusual branching before they reach the compiler, and extending automation across fleets of **150+ satellites**.

The same structure makes the system adaptable. Because each procedure is captured independently of any one command language, a **new spacecraft or manufacturer's platform** can be brought onto existing ground systems by adding a compiler, rather than rewriting its procedures by hand.

## Takeaways

<div class="takeaways">
  <div><h3>Satellite subsystems</h3><p>Translating procedures step by step built a working understanding of how power, thermal and other bus subsystems are monitored and commanded.</p></div>
  <div><h3>Operational challenges</h3><p>Supporting real-time commanding showed how timing, verification and human error shape the way operators actually fly a fleet.</p></div>
  <div><h3>Mission requirements</h3><p>In a mission-critical setting, automation is only useful if it is validated, traceable and faithful to the procedure's intent.</p></div>
</div>
