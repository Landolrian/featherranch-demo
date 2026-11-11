(function () {
  var C = window.FRK || {};
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var tel = (C.phone || "").replace(/\D/g, "");
  var q = new URLSearchParams(location.search);
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Old website links (featherranch.com/?page_id=36 etc.) land on the matching new page
  var oldLinks = { "212": "puppies.html", "29": "index.html", "31": "contact.html", "36": "training.html#gundog", "38": "training.html#obedience", "40": "training.html#owner", "42": "dogs.html#started", "44": "dogs.html#stud", "46": "dogs.html#lease", "65": "dogs.html#adopt", "67": "contact.html#map" };
  if (q.get("page_id") && oldLinks[q.get("page_id")]) { location.replace(oldLinks[q.get("page_id")]); return; }
  if (q.get("cat") === "4" || q.get("p") === "605") { location.replace("puppies.html#litter"); return; }

  // Announcement banner
  var ann = document.getElementById("announce");
  if (ann && C.announcement) {
    ann.textContent = C.announcement + " · ";
    var a = document.createElement("a"); a.href = "puppies.html#litter"; a.textContent = "See the litter →"; ann.appendChild(a);
    ann.hidden = false; document.body.classList.add("has-announce");
    var setH = function () { document.documentElement.style.setProperty("--ann-h", ann.offsetHeight + "px"); };
    setH(); addEventListener("resize", setH);
  }

  // Header turns solid on scroll; phone call bar appears after the hero
  var hdr = document.querySelector("header.site"), bar = document.querySelector(".callbar");
  var onScroll = function () {
    var y = scrollY;
    if (hdr) hdr.classList.toggle("solid", y > 60);
    if (bar) bar.classList.toggle("show", y > innerHeight * .6);
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Full screen menu on phones
  var mb = document.querySelector(".menu-btn");
  if (mb) mb.addEventListener("click", function () {
    var open = document.body.classList.toggle("menu-open");
    mb.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });

  // Litter (from content.js)
  function parentHTML(p, role) {
    return '<div class="parent"><figure><img src="' + esc(p.photo) + '" alt="' + esc(p.callName + ", the " + role.toLowerCase()) + '" data-zoom data-caption="' + esc(p.name) + '" loading="lazy" style="object-position:center 28%"><span>' + role + "</span></figure>" +
      "<h4>" + esc(p.name) + '</h4><div class="call">“' + esc(p.callName) + "”</div><p>" + esc(p.about) + "</p>" +
      '<ul class="clearances">' + (p.health || []).map(function (h) { var x = h.split(/\s*[–-]\s*/); return "<li><span>" + esc(x[0]) + "</span><b>" + esc(x[1] || "") + "</b></li>"; }).join("") + "</ul></div>";
  }
  var lb = document.getElementById("litter-box");
  if (lb) {
    var L = (C.litters || [])[0];
    if (!L) {
      lb.innerHTML = '<div class="empty"><div><h4>Our next litter is on the way.</h4><p>Call or send a message to get on the list. Pick order is set by the order deposits are received.</p></div><a class="btn btn-night" href="contact.html?interest=Puppies">Join the puppy list <span>→</span></a></div>';
    } else {
      var sold = /sold/i.test(L.status || "");
      lb.innerHTML = '<div class="litter-top"><h3>The ' + esc(L.name.replace(/ litter$/i, "")) + " <i>Litter</i></h3>" +
        '<div class="litter-meta"><span>Born ' + esc(L.born) + "</span><span>" + esc((L.colors || []).join(", ")) + ' Labs</span><span class="status' + (sold ? " sold" : "") + '">' + esc(L.status) + "</span></div></div>" +
        '<div class="pair">' + parentHTML(L.sire, "Sire") + '<div class="cross" aria-hidden="true">×</div>' + parentHTML(L.dam, "Dam") + "</div>" +
        '<div class="litter-cta"><p>' + esc(L.note || "") + "<br><i>A $100 deposit holds your pick.</i></p>" +
        '<div class="acts"><a class="btn btn-cream" href="contact.html?interest=Puppies&litter=' + encodeURIComponent(L.name) + '">Reserve a puppy <span>→</span></a><a class="btn btn-ghost" href="tel:' + tel + '">Call ' + esc(C.phone) + "</a></div></div>";
    }
  }

  // Dog lists (stud, started, adopt)
  document.querySelectorAll("[data-dogs]").forEach(function (box) {
    var list = C[box.getAttribute("data-dogs")] || [], label = box.getAttribute("data-label"), interest = box.getAttribute("data-interest");
    if (!list.length) {
      box.innerHTML = '<div class="empty"><div><h4>Call for current availability.</h4><p>Our ' + esc(label) + " change often. Call or send a message and we'll tell you who's here right now.</p></div>" +
        '<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-cream" href="tel:' + tel + '">Call ' + esc(C.phone) + '</a><a class="btn btn-ghost" href="contact.html?interest=' + encodeURIComponent(interest) + '">Send a message</a></div></div>';
      return;
    }
    box.innerHTML = list.map(function (d) {
      return '<div class="dog-card"><figure><img src="' + esc(d.photo) + '" alt="' + esc(d.name) + '" data-zoom data-caption="' + esc(d.name) + '" loading="lazy"></figure><div><span class="label">' + esc(d.details) + "</span><h3 style=\"margin-top:14px\">" + esc(d.name) + "</h3><p class=\"lede\">" + esc(d.about) + '</p><a class="btn btn-night" href="contact.html?interest=' + encodeURIComponent(interest) + '">Ask about ' + esc(d.name.split(" ")[0]) + " <span>→</span></a></div></div>";
    }).join("");
  });

  // Home: words light up as you read
  var st = document.getElementById("statement");
  if (st) {
    st.innerHTML = st.innerHTML.replace(/(<em>.*?<\/em>|[^\s<]+)/g, '<span class="w">$1</span>');
    var words = st.querySelectorAll(".w");
    var light = function () {
      var r = st.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / (r.height + innerHeight * .35)));
      var n = reduce ? words.length : Math.round(p * words.length);
      words.forEach(function (w, i) { w.classList.toggle("lit", i < n); });
    };
    addEventListener("scroll", light, { passive: true }); light();
  }

  // Home: sticky photo story
  var steps = document.querySelectorAll(".step");
  if (steps.length) {
    var figs = document.querySelectorAll(".stage figure"), bars = document.querySelectorAll(".progress i"), cur = 0;
    steps[0].classList.add("active");
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = +e.target.dataset.i; if (i === cur) return;
        steps.forEach(function (s, k) { s.classList.toggle("active", k === i); });
        figs.forEach(function (f, k) { f.classList.toggle("show", k === i); f.classList.toggle("past", k < i); f.style.zIndex = k === i ? 3 : (k < i ? 2 : 1); });
        bars.forEach(function (b, k) { b.classList.toggle("on", k === i); });
        cur = i;
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach(function (s) { sio.observe(s); });
  }

  // Home: floating photo follows the cursor over the services list
  var idx = document.querySelector(".index"), fp = document.querySelector(".float-photo");
  if (idx && fp && matchMedia("(pointer: fine)").matches) {
    var imgs = fp.querySelectorAll("img"), tx = 0, ty = 0, x = 0, y = 0, raf;
    var loop = function () { x += (tx - x) * .14; y += (ty - y) * .14; fp.style.left = x + "px"; fp.style.top = y + "px"; raf = requestAnimationFrame(loop); };
    idx.querySelectorAll("a").forEach(function (a, i) {
      a.addEventListener("mouseenter", function () { imgs.forEach(function (im, k) { im.classList.toggle("on", k === i); }); fp.classList.add("on"); });
    });
    idx.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; if (!raf) { x = tx; y = ty; loop(); } });
    idx.addEventListener("mouseleave", function () { fp.classList.remove("on"); cancelAnimationFrame(raf); raf = null; });
  }

  // Photo reel: duplicate for a seamless loop
  var track = document.querySelector(".reel-track");
  if (track) { track.innerHTML += track.innerHTML.replace(/data-zoom/g, "data-zoom data-dupe"); }

  // Puppies: color picker
  var notes = {
    black: "Sleek and classic. A natural in the duck blind and on the couch.",
    yellow: "From pale cream to golden, with the same big heart.",
    chocolate: "Rich coats and soulful eyes, every bit as keen to retrieve.",
    fox: "The deep red end of yellow, like our stud dog Ammo."
  };
  var sw = document.querySelector(".swatches");
  if (sw) {
    sw.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        var c = b.dataset.color, name = b.querySelector("b").textContent;
        sw.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-checked", x === b); });
        document.querySelectorAll(".color-photo").forEach(function (p) {
          var was = p.classList.contains("on");
          p.classList.remove("prev");
          if (was && p.dataset.color !== c) { p.classList.remove("on"); p.classList.add("prev"); }
          if (p.dataset.color === c) p.classList.add("on");
        });
        document.getElementById("color-label").textContent = name + " Labrador";
        var cta = document.getElementById("color-cta");
        cta.innerHTML = "Ask about a " + name.toLowerCase() + " puppy <span>→</span>";
        cta.href = "contact.html?interest=Puppies&color=" + encodeURIComponent(name);
      });
      b.querySelector("small").textContent = notes[b.dataset.color];
    });
  }

  // Training: program finder
  var finder = document.getElementById("finder");
  if (finder) {
    var qs = finder.querySelectorAll(".finder-q"), dots = finder.querySelectorAll(".dots i"), res = finder.querySelector(".finder-result"), ans = [];
    var P = {
      gundog: ["Gundog Training", "images/marsh-yellow-lab.jpg", "#gundog", "Gundog Training"],
      obedience: ["Obedience Training", "images/obedience1.jpg", "#obedience", "Obedience Training"],
      owner: ["Owner Training", "images/ownertrain-1.jpg", "#owner", "Owner Training"]
    };
    var decide = function () {
      var goal = ans[0], age = ans[1], style = ans[2], key, why;
      if (goal === "learn" || (goal === "hunt" && style === "hands")) { key = "owner"; why = "One-on-one lessons teach you to train your own dog. Most owners reach gun dog level in 8 to 10 lessons."; }
      else if (goal === "hunt") { key = "gundog"; why = "Your dog learns the rules of the hunt, upland and waterfowl, with over 100 birds shot over it before it comes home."; }
      else { key = "obedience"; why = style === "hands" ? "About two months to real-life manners, and you're welcome to visit and take part as often as you like." : "About two months to a dog that heels, comes when called and settles on command, for any breed."; }
      if (age === "young") why += " Training can start as early as 6 months, so now is a great time to reserve a spot.";
      var p = P[key];
      res.innerHTML = '<img src="' + p[1] + '" alt=""><div><span class="label">We recommend</span><h3>' + p[0] + "</h3><p>" + why + '</p><div class="acts"><a class="btn btn-cream" href="contact.html?interest=' + encodeURIComponent(p[3]) + '">Ask about this program <span>→</span></a><a class="btn btn-ghost" href="' + p[2] + '">Read more</a><button class="again" type="button">Start over</button></div></div>';
      res.hidden = false;
      res.querySelector(".again").onclick = function () { ans = []; res.hidden = true; qs[0].hidden = false; dots.forEach(function (d) { d.classList.remove("done"); }); };
    };
    qs.forEach(function (box, i) {
      box.querySelectorAll("button").forEach(function (b) {
        b.addEventListener("click", function () {
          ans[i] = b.dataset.v; dots[i].classList.add("done"); box.hidden = true;
          if (qs[i + 1]) qs[i + 1].hidden = false; else decide();
        });
      });
    });
  }

  // Gallery filters
  var fb = document.querySelectorAll(".filters button");
  fb.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.dataset.filter;
      fb.forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      document.querySelectorAll(".masonry figure").forEach(function (fig) { fig.classList.toggle("hidden", f !== "all" && fig.dataset.cat !== f); });
    });
  });

  // Lightbox
  var box = document.createElement("div");
  box.className = "lightbox"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "Photo viewer");
  box.innerHTML = '<button class="lb-btn lb-close" aria-label="Close">×</button><button class="lb-btn lb-prev" aria-label="Previous photo">←</button><figure><img alt=""><figcaption></figcaption></figure><button class="lb-btn lb-next" aria-label="Next photo">→</button>';
  document.body.appendChild(box);
  var bImg = box.querySelector("img"), bCap = box.querySelector("figcaption"), items = [], at = 0, lastFocus;
  var show = function (i) { at = (i + items.length) % items.length; var el = items[at]; bImg.src = el.currentSrc || el.src; bImg.alt = el.alt; bCap.textContent = el.dataset.caption || el.alt || ""; };
  var openBox = function (el) {
    items = Array.prototype.filter.call(document.querySelectorAll("[data-zoom]:not([data-dupe])"), function (e) { return e.offsetParent !== null || e.closest(".reel"); });
    var i = items.indexOf(el); if (i < 0) { items.push(el); i = items.length - 1; }
    lastFocus = document.activeElement; show(i); box.classList.add("open"); document.body.style.overflow = "hidden"; box.querySelector(".lb-close").focus();
  };
  var closeBox = function () { box.classList.remove("open"); document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); };
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-zoom]") || (e.target.closest("figure") && e.target.closest("figure").querySelector("img[data-zoom]"));
    if (el && !box.contains(el)) {
      if (el.hasAttribute("data-dupe")) { var src = el.getAttribute("src"); el = document.querySelector('.reel [data-zoom]:not([data-dupe])[src="' + src + '"]') || el; }
      e.preventDefault(); openBox(el);
    }
  });
  document.addEventListener("keydown", function (e) {
    var el = e.target.closest && e.target.closest("[data-zoom]");
    if (el && (e.key === "Enter" || e.key === " ") && !box.classList.contains("open")) { e.preventDefault(); openBox(el); return; }
    if (e.key === "Escape" && document.body.classList.contains("menu-open")) mb && mb.click();
    if (!box.classList.contains("open")) return;
    if (e.key === "Escape") closeBox();
    if (e.key === "ArrowRight") show(at + 1);
    if (e.key === "ArrowLeft") show(at - 1);
  });
  box.querySelector(".lb-close").onclick = closeBox;
  box.querySelector(".lb-prev").onclick = function () { show(at - 1); };
  box.querySelector(".lb-next").onclick = function () { show(at + 1); };
  box.addEventListener("click", function (e) { if (e.target === box) closeBox(); });
  var tx0 = null;
  box.addEventListener("touchstart", function (e) { tx0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", function (e) { if (tx0 === null) return; var dx = e.changedTouches[0].clientX - tx0; if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1)); tx0 = null; });
  document.querySelectorAll("[data-zoom]:not([data-dupe])").forEach(function (el) { el.setAttribute("tabindex", "0"); });

  // Contact form: prefill from links, send through the visitor's email app
  var form = document.getElementById("contact-form");
  if (form) {
    var sel = form.querySelector("[name=interest]");
    if (q.get("interest")) Array.prototype.forEach.call(sel.options, function (o) { if (o.value === q.get("interest")) sel.value = o.value; });
    if (q.get("color")) form.querySelector("[name=color]").value = q.get("color");
    if (q.get("litter")) form.querySelector("[name=message]").value = "Hi Phil and Debbie, I'm interested in a puppy from the " + q.get("litter") + ". ";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var lines = ["Name: " + d.get("name"), "Phone: " + d.get("phone"), "Email: " + d.get("email"), "Interested in: " + d.get("interest")];
      if (d.get("color")) lines.push("Color preference: " + d.get("color"));
      lines.push("", d.get("message"));
      location.href = "mailto:" + C.email + "?subject=" + encodeURIComponent("Website inquiry: " + d.get("interest") + " – " + d.get("name")) + "&body=" + encodeURIComponent(lines.join("\n"));
      form.querySelector(".form-done").style.display = "block";
    });
  }

  // Reveal on scroll
  var rv = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    rv.forEach(function (r) { io.observe(r); });
  } else rv.forEach(function (r) { r.classList.add("in"); });

  var yr = document.getElementById("year"); if (yr) yr.textContent = new Date().getFullYear();
})();
