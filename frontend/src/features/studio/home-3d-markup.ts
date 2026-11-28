/**
 * Static markup from the supplied standalone 3D homepage, split around the
 * React-rendered Services3DSection. Kept as HTML strings because the rest of
 * the page is driven by imperative DOM code (see home-3d-engine.ts).
 * The <script> block is deliberately NOT included here.
 */
export const HOME_3D_MARKUP_BEFORE = String.raw`<canvas id="gl"></canvas>
<div id="scrollProgress" aria-hidden="true"></div>
<!-- Top navigation is rendered by the shared Navbar component (app/page.tsx). -->
<nav class="rail" id="rail" aria-label="Chapters">
  <button type="button" data-h="#home" class="on" aria-label="Hero"></button>
  <button type="button" data-h="#precision" aria-label="Precision"></button>
  <button type="button" data-h="#materials" aria-label="Materials"></button>
  <button type="button" data-h="#components" aria-label="Parts"></button>
  <button type="button" data-h="#process" aria-label="Services"></button>
  <button type="button" data-h="#quote" aria-label="Quote"></button>
</nav>

<!-- ============ 1. HERO ============ -->
<section id="home" class="hero in" data-nav="dark">
  <div class="reveal"></div>
  <div class="rings"></div>
  <div class="bits" id="bits"></div>
  <div class="arc" id="arc" aria-label="Material carousel. Drag or use the arrow keys."></div>
  <div class="eyebrow"><span>Custom components</span><i></i><span>Engineered in Coimbatore</span><i></i><span>Since 2003</span></div>
  <button id="play" aria-label="Next material"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15"/><path d="M13 6l6 6-6 6"/></svg></button>
  <h1 id="title" class="disp" aria-live="polite">RUBBER</h1>
  <p class="tag" id="tag">Seals, gaskets, O-rings, cords, sheets &amp; rubber-to-metal bonded components.</p>
  <div id="count" class="disp" aria-hidden="true">01</div>
  <button id="auto" aria-pressed="true" aria-label="Toggle autoplay"><span class="ring"><svg class="ic-pause" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="5" height="16" rx="1.8"/><rect x="14" y="4" width="5" height="16" rx="1.8"/></svg><svg class="ic-play" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l12-7.5z"/></svg></span><span class="lbl">Autoplay</span></button>
  <div class="hcta"><a class="btn ob" href="#quote">Request a Quote</a><a class="btn gb" id="explore" href="#materials"><span>Explore rubber</span>→</a></div>
</section>

<div class="marquee" aria-hidden="true"><div class="mq-track" id="mqTrack"></div></div>

<!-- ============ 2. PRECISION (pinned) ============ -->
<section id="precision" class="inside" data-nav="dark">
  <div class="pin">
    <div class="in-dark"></div>
    <div class="frame back">
      <div class="in-numw" id="inNumw"><div class="in-num disp" id="inNum">01</div></div>
      <div id="inBar" aria-hidden="true"></div>
    </div>
  </div>
</section>
<div id="inFront">
  <div class="frame front" id="frontFrame">
    <div class="in-top"><p class="eb">02 / The anatomy of a custom component</p><h2 class="disp">Precision. From every perspective.</h2></div>
    <p class="in-eyebrow" id="inEyebrow"></p>
    <h3 class="in-head disp" id="inHead"></h3>
    <div class="in-icons" id="inIcons">
      <button aria-label="Step 1" class="on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l9-5 9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 17.5l9 5 9-5"/></svg></button>
      <button aria-label="Step 2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17L17 3l4 4L7 21z"/><path d="M14 6l2 2M11 9l2 2M8 12l2 2"/></svg></button>
      <button aria-label="Step 3"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/></svg></button>
      <button aria-label="Step 4"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5M9 13h8M9 17h8"/></svg></button>
    </div>
    <p class="in-cap" id="inCap"></p>
  </div>
  <div id="storm"></div>
</div>

<!-- ============ 3. MATERIALS (cards) ============ -->
<section id="materials" class="shop" data-nav="light">
  <div class="shead rvw">
    <p class="eb">01 / Three materials. Disciplined. One partner.</p>
    <h2 class="disp"><span class="ln"><span>The material changes.</span></span><span class="ln"><span>The commitment stays.</span></span></h2>
    <p class="cap">For engineering and procurement teams who need components made to fit — not compromises made to work.</p>
  </div>
  <div class="cards rvw" id="cards">
    <article class="card" style="--c:#111a2b;--i:0" data-m="0">
      <span class="ce">01 / Rubber · Bonded seals</span>
      <h3 class="disp">Flexible by nature. Precise by design.</h3>
      <div class="pk" data-m="0" aria-hidden="true"></div>
      <img class="stock" src="https://ssquareengg.com/wp-content/uploads/2025/12/rubber-43.jpg" alt="S Square molded rubber components" loading="lazy">
      <p>Custom seals, gaskets, diaphragms and rubber-to-metal bonded components for sealing and vibration control.</p>
      <a class="ex" href="#components">Explore rubber →</a>
      <button class="add" data-m="0" aria-label="Add rubber to the enquiry"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>
    </article>
    <article class="card" style="--c:#22364d;--i:1" data-m="1">
      <span class="ce">02 / Steel · Fittings</span>
      <h3 class="disp">Strength where it matters.</h3>
      <div class="pk" data-m="1" aria-hidden="true"></div>
      <img class="stock" src="https://ssquareengg.com/wp-content/uploads/2026/02/steel-11.jpg" alt="S Square machined steel components" loading="lazy">
      <p>Stainless and alloy valve bodies, blocks, flanges and fluid fittings turned, milled and finished for hard duty.</p>
      <a class="ex" href="#components">Explore steel →</a>
      <button class="add" data-m="1" aria-label="Add steel to the enquiry"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>
    </article>
    <article class="card" style="--c:#4b5968;--i:2" data-m="2">
      <span class="ce">03 / Aluminium · Tooling</span>
      <h3 class="disp">Lightweight thinking. Solid engineering.</h3>
      <div class="pk" data-m="2" aria-hidden="true"></div>
      <img class="stock" src="https://ssquareengg.com/wp-content/uploads/2025/12/aluminum-2-768x768-1.jpg" alt="S Square aluminium products" loading="lazy">
      <p>Grade 6061 die moulds, housings, plates and tooling — light in hand, exact in tolerance.</p>
      <a class="ex" href="#components">Explore aluminium →</a>
      <button class="add" data-m="2" aria-label="Add aluminium to the enquiry"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>
    </article>
  </div>
</section>

<!-- ============ 4. COMPONENT SPOTLIGHT (3D scroll) ============ -->
<section id="components" class="spot" data-nav="dark">
  <div class="spot-pin">
    <div class="spot-veil"></div>
    <div id="spotStage" aria-hidden="true"></div>
  </div>
</section>
<div id="spotFront">
  <div class="spot-head">
    <p class="eb">02 / Component spotlight</p>
    <h2 class="disp">Small details.
<span class="o">Essential components.</span></h2>
    <p class="spot-lead">Rubber, steel or aluminium — machined, moulded and inspected to your drawing, not pulled off a rack. Scroll to see the assembly turn.</p>
    <div class="spot-pills" id="spotTicks">
      <button type="button" class="on" data-i="0">Rubber seals</button>
      <button type="button" data-i="1">Steel fittings</button>
      <button type="button" data-i="2">Aluminium tooling</button>
    </div>
  </div>
  <div class="spot-cardwrap">
    <article class="spot-card" id="spotCard">
      <span class="tagp" id="scTag">Rubber · Bonded seals</span>
      <h3 class="disp" id="scTitle">Metal-to-Viton Bonded Seals</h3>
      <p class="copy" id="scCopy">Metal retaining ring bonded to a Viton sealing lip for dependable high-pressure hydraulic, port and fastener sealing.</p>
      <div class="row">
        <span class="spec" id="scSpec">FKM · Stainless</span>
        <button class="rq" id="scRq" data-add="Metal-to-Viton bonded seals" data-m="0">Request a Quote<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span></button>
      </div>
    </article>
  </div>
  <p class="spot-hint">Scroll<i></i></p>
</div>

<!-- ============ 4b. SPOTLIGHT CARDS ============ -->
<section id="catalog" class="cat rvw" data-nav="light">
  <div class="gveil"></div>
  <div class="cat-top">
    <p class="cat-kicker">Spotlight <b>· 3 of many</b></p>
    <a class="lnk" href="#quote">Request the full catalogue →</a>
  </div>
  <div class="cat-grid" id="catGrid">
    <article class="cat-card" data-flav="0">
      <div class="cat-ph"><img src="https://ssquareengg.com/wp-content/uploads/2025/12/rubber-39.jpg" alt="S Square custom molded rubber parts" loading="lazy"><span class="tagp">Rubber · Bonded seals</span></div>
      <div class="cat-body">
        <h3 class="disp">Metal-to-Viton Bonded Seals</h3>
        <p>Metal retaining ring bonded to a Viton sealing lip for dependable high-pressure hydraulic, port and fastener sealing.</p>
        <div class="cat-foot">
          <span class="spec">FKM · Stainless</span>
          <button class="rq" data-add="Metal-to-Viton bonded seals" data-m="0">Request a Quote</button>
          <button class="cat-plus" data-add="Metal-to-Viton bonded seals" data-m="0" aria-label="Add Viton seals to enquiry"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>
        </div>
      </div>
    </article>
    <article class="cat-card" data-flav="2">
      <div class="cat-ph"><img src="https://ssquareengg.com/wp-content/uploads/2026/01/aluminim.webp" alt="S Square aluminium die moulds" loading="lazy"><span class="tagp">Aluminium · Die moulds &amp; tooling</span></div>
      <div class="cat-body">
        <h3 class="disp">Precision Aluminium Die Moulds</h3>
        <p>Custom-engineered aluminium die and production tooling machined accurately from customer CAD models or part samples.</p>
        <div class="cat-foot">
          <span class="spec">6061 · Tooling plate</span>
          <button class="rq" data-add="Precision aluminium die moulds" data-m="2">Request a Quote</button>
          <button class="cat-plus" data-add="Precision aluminium die moulds" data-m="2" aria-label="Add aluminium moulds to enquiry"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>
        </div>
      </div>
    </article>
    <article class="cat-card" data-flav="1">
      <div class="cat-ph"><img src="https://ssquareengg.com/wp-content/uploads/2026/02/steel-13.jpg" alt="S Square machined steel flanges" loading="lazy"><span class="tagp">Steel · Flanges &amp; fittings</span></div>
      <div class="cat-body">
        <h3 class="disp">Stainless Valve Bodies, Blocks &amp; Fluid Fittings</h3>
        <p>Machined fluid blocks, adapters, needle valves and fittings using stainless steel's chromium-oxide corrosion resistance.</p>
        <div class="cat-foot">
          <span class="spec">SS304 · SS316</span>
          <button class="rq" data-add="Stainless valve bodies & fittings" data-m="1">Request a Quote</button>
          <button class="cat-plus" data-add="Stainless valve bodies & fittings" data-m="1" aria-label="Add stainless fittings to enquiry"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>
        </div>
      </div>
    </article>
  </div>
  <p class="floor-h">From the floor — your real stock</p>
  <div class="floor" id="floorStrip">
    <figure><img loading="lazy" src="https://ssquareengg.com/wp-content/uploads/2025/12/rubber-43.jpg" alt="Rubber parts batch"><figcaption>Rubber · 43</figcaption></figure>
    <figure><img loading="lazy" src="https://ssquareengg.com/wp-content/uploads/2025/12/rubber-42.jpg" alt="Rubber parts batch"><figcaption>Rubber · 42</figcaption></figure>
    <figure><img loading="lazy" src="https://ssquareengg.com/wp-content/uploads/2025/12/rubber-36.jpg" alt="Rubber gaskets"><figcaption>Rubber · 36</figcaption></figure>
    <figure><img loading="lazy" src="https://ssquareengg.com/wp-content/uploads/2025/12/rubber-32.jpg" alt="Rubber washers"><figcaption>Rubber · 32</figcaption></figure>
    <figure><img loading="lazy" src="https://ssquareengg.com/wp-content/uploads/2025/12/rubber-29.jpg" alt="Rubber O-rings"><figcaption>Rubber · 29</figcaption></figure>
    <figure><img loading="lazy" src="https://ssquareengg.com/wp-content/uploads/2025/12/rubber-27.jpg" alt="Rubber vibration mounts"><figcaption>Rubber · 27</figcaption></figure>
    <figure><img loading="lazy" src="https://ssquareengg.com/wp-content/uploads/2025/12/rubber-23.jpg" alt="Rubber components"><figcaption>Rubber · 23</figcaption></figure>
    <figure><img loading="lazy" src="https://ssquareengg.com/wp-content/uploads/2026/02/steel-13.jpg" alt="Steel flanges"><figcaption>Steel · 13</figcaption></figure>
    <figure><img loading="lazy" src="https://ssquareengg.com/wp-content/uploads/2026/02/steel-12.jpg" alt="Steel cylinders"><figcaption>Steel · 12</figcaption></figure>
    <figure><img loading="lazy" src="https://ssquareengg.com/wp-content/uploads/2026/02/steel-11.jpg" alt="Steel piston parts"><figcaption>Steel · 11</figcaption></figure>
    <figure><img loading="lazy" src="https://ssquareengg.com/wp-content/uploads/2026/02/steel-19.jpg" alt="Machined steel parts"><figcaption>Steel · 19</figcaption></figure>
    <figure><img loading="lazy" src="https://ssquareengg.com/wp-content/uploads/2026/01/aluminim.webp" alt="Aluminium die moulds"><figcaption>Aluminium · Die</figcaption></figure>
    <figure><img loading="lazy" src="https://ssquareengg.com/wp-content/uploads/2025/12/aluminum-2-768x768-1.jpg" alt="Aluminium wheel and mouldings"><figcaption>Aluminium · Wheel</figcaption></figure>
  </div>
</section>`;

export const HOME_3D_MARKUP_AFTER = String.raw`<!-- ============ 7. QUOTE + ENQUIRY PACK ============ -->
<section id="quote" class="quote" data-nav="dark">
  <div class="gveil"></div>
  <div class="qgrid rvw">
    <div class="qleft">
      <p class="eb">04 / Let's make it precise</p>
      <h2 class="disp"><span class="ln"><span>The next component</span></span><span class="ln"><span>starts with a</span></span><span class="ln"><span class="o">conversation.</span></span></h2>
      <p class="qp">Tell us what you need to make. Share a material, a quantity and the details that matter. Drawings and samples can be coordinated directly by email or WhatsApp.</p>
      <div class="qcontact">
        <a href="tel:+917530080040"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>+91 75300 80040</a>
        <a href="https://wa.me/917530080040" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1.3-3.8A8 8 0 1 1 8.2 19z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a4 4 0 0 1-2-2l1-1-1-2z"/></svg>Message on WhatsApp</a>
        <a href="mailto:sales@ssquareengg.com"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>sales@ssquareengg.com</a>
      </div>

      <div class="builder" id="builder">
        <p class="eb">Your enquiry pack</p>
        <h3 class="disp">Pick up to <span class="box">3</span> materials for one combined quote</h3>
        <div class="glow" id="glow" style="--g:rgba(232,113,42,.55)">
          <div class="slot" style="--x:50.2%;--y:33%" data-s="0"><span class="ph2">+</span><img class="sbar" alt=""><span class="sname"></span><button class="sx" aria-label="Remove from pack">×</button></div>
          <div class="slot" style="--x:30%;--y:66%" data-s="1"><span class="ph2">+</span><img class="sbar" alt=""><span class="sname"></span><button class="sx" aria-label="Remove from pack">×</button></div>
          <div class="slot" style="--x:70%;--y:66%" data-s="2"><span class="ph2">+</span><img class="sbar" alt=""><span class="sname"></span><button class="sx" aria-label="Remove from pack">×</button></div>
        </div>
        <div class="thumbs" id="thumbs">
          <button class="thumb" data-p="0" style="--c:#111a2b"><span class="tsq"><img class="pimg" data-p="0" alt="Rubber bonded seal"></span><span class="tn">Rubber</span><span class="tk">✓</span></button>
          <button class="thumb" data-p="1" style="--c:#22364d"><span class="tsq"><img class="pimg" data-p="1" alt="Stainless steel hex nut"></span><span class="tn">Steel</span><span class="tk">✓</span></button>
          <button class="thumb" data-p="2" style="--c:#4b5968"><span class="tsq"><img class="pimg" data-p="2" alt="Machined aluminium housing"></span><span class="tn">Aluminium</span><span class="tk">✓</span></button>
        </div>
        <button id="send" class="buy" disabled><span class="sl">Pick a material</span><span class="pr">No commitment</span></button>
      </div>
    </div>

    <form class="qform" id="qform" novalidate>
      <p class="eb">From project · Our starting point</p>
      <h3 class="disp">Request a Quote</h3>
      <p class="sub">Tell us about your component or enquiry. Share the details to start a technical discussion.</p>
      <div class="frow"><div class="fld"><label for="fn">Full name</label><input id="fn" required placeholder="Your name"></div><div class="fld"><label for="fc">Company name</label><input id="fc" placeholder="Organisation or OEM"></div></div>
      <div class="frow"><div class="fld"><label for="fe">Work email</label><input id="fe" type="email" required placeholder="name@company.com"></div><div class="fld"><label for="fp">Phone / WhatsApp</label><input id="fp" type="tel" placeholder="Include country code"></div></div>
      <div class="frow"><div class="fld"><label for="fm">Material / product interest</label><select id="fm"><option>Rubber components</option><option>Steel components</option><option>Aluminium components</option><option>Not sure yet</option></select></div><div class="fld"><label for="fq">Estimated quantity</label><input id="fq" placeholder="e.g. 500 pieces / month"></div></div>
      <div class="frow one"><div class="fld"><label>Items in your enquiry</label><div class="chips" id="chips"></div></div></div>
      <div class="frow one"><div class="fld"><label for="ft">Requirements / drawing notes</label><textarea id="ft" placeholder="Material, dimensions, application, tolerances, finish, or whatever you know so far."></textarea></div></div>
      <p class="fnote">Drawings, samples and specifications can be shared by email or WhatsApp after submission. We reply within one business day.</p>
      <button class="submit" type="submit">Request a Quote</button>
    </form>
  </div>
</section>

<footer>
  <div class="fgrid">
    <div><a class="footer-logo" href="#home" aria-label="S Square Engineering Services — Home"><img src="/images/ssquare-logo.png" alt="S Square Engineering Services" width="215" height="75" loading="lazy" decoding="async"></a><p>Specialising in custom rubber, steel and aluminium manufacturing with a commitment to precision, durability and timely delivery.</p></div>
    <div><h5>Quick links</h5><div class="fl"><a href="#home">Home</a><a href="#precision">Precision</a><a href="#materials">Materials</a><a href="#components">Components</a><a href="#process">Process</a><a href="#quote">Request a Quote</a></div></div>
    <div><h5>Contact info</h5><div class="fl"><a>S Square Engineering Services</a><a>56, Jeganathapuram, Avarampalayam Road,</a><a>Peelamedu, Coimbatore 641004</a><a href="tel:+917530080040">+91 75300 80040</a><a href="mailto:sales@ssquareengg.com">sales@ssquareengg.com</a></div></div>
  </div>
  <div class="fbot"><span>© 2026 S Square Engineering Services. All rights reserved.</span><span>Rubber · Steel · Aluminium · Coimbatore, India</span></div>
</footer>`;
