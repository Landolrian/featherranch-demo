(function () {
  var C = window.FRK || {};
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var tel = (C.phone || "").replace(/\D/g, "");

  // Old website links (featherranch.com/?page_id=36 etc.) land on the matching new page
  var oldLinks = { "212": "puppies.html", "29": "index.html#about", "31": "contact.html", "36": "training.html#gundog", "38": "training.html#obedience", "40": "training.html#owner", "42": "dogs.html#started", "44": "dogs.html#stud", "46": "dogs.html#lease", "65": "dogs.html#adopt", "67": "contact.html#map" };
  var q = new URLSearchParams(location.search);
  if (q.get("page_id") && oldLinks[q.get("page_id")]) { location.replace(oldLinks[q.get("page_id")]); return; }
  if (q.get("cat") === "4" || q.get("p") === "605") { location.replace("puppies.html#litters"); return; }

  // Mobile menu
  var menuBtn = document.querySelector(".menu-btn"), nav = document.getElementById("nav");
  if (menuBtn && nav) menuBtn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });

  // Litters
  function parentHTML(p, role) {
    var health = (p.health || []).map(function (h) { return '<span class="chip health">' + esc(h) + "</span>"; }).join("");
    return '<div class="parent"><img src="' + esc(p.photo) + '" alt="' + esc(p.callName + ", " + role.toLowerCase()) + '" data-zoom data-caption="' + esc(p.name) + '" loading="lazy">' +
      '<div><span class="role">' + role + '</span><h4>' + esc(p.name) + (p.callName ? ' <small style="font-weight:400;color:var(--muted)">“' + esc(p.callName) + '”</small>' : "") + "</h4>" +
      "<p>" + esc(p.about) + '</p><div class="chips">' + health + "</div></div></div>";
  }
  var litterBox = document.getElementById("litters");
  if (litterBox) {
    var litters = C.litters || [];
    if (!litters.length) {
      litterBox.innerHTML = '<div class="avail"><div><strong>Our next litter is on the way</strong><p>Call or send a message to get on the list. Pick order is set by the order deposits are received.</p></div><a class="btn btn-primary" href="contact.html?interest=Puppies">Join the puppy list</a></div>';
    } else {
      litterBox.innerHTML = litters.map(function (L) {
        var sold = /sold/i.test(L.status || "");
        return '<article class="litter reveal"><div class="litter-head"><div><h3>' + esc(L.name) + "</h3><p>Born " + esc(L.born) + " · " + esc((L.colors || []).join(", ")) + " Labrador Retrievers</p></div>" +
          '<span class="pill' + (sold ? " soldout" : "") + '">' + esc(L.status) + "</span></div>" +
          '<div class="parents">' + parentHTML(L.sire, "Sire") + parentHTML(L.dam, "Dam") + "</div>" +
          '<div class="litter-foot"><p>' + esc(L.note || "") + '</p><div class="actions"><a class="btn btn-primary" href="contact.html?interest=Puppies&litter=' + encodeURIComponent(L.name) + '">Reserve a puppy</a><a class="btn btn-outline" href="tel:' + tel + '">Call ' + esc(C.phone) + "</a></div></div></article>";
      }).join("");
    }
  }

  // Dog lists (stud, started, adopt)
  document.querySelectorAll("[data-dogs]").forEach(function (box) {
    var list = C[box.getAttribute("data-dogs")] || [];
    var label = box.getAttribute("data-label") || "dogs";
    if (!list.length) {
      box.innerHTML = '<div class="avail"><div><strong>Call for current availability</strong><p>Our ' + esc(label) + " change often. Call or send a message and we’ll tell you what we have right now.</p></div>" +
        '<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-primary" href="tel:' + tel + '">Call ' + esc(C.phone) + '</a><a class="btn btn-outline" href="contact.html?interest=' + encodeURIComponent(box.getAttribute("data-interest") || "") + '">Send a message</a></div></div>';
      return;
    }
    box.innerHTML = '<div class="cards">' + list.map(function (d) {
      return '<article class="card"><div class="card-img"><img src="' + esc(d.photo) + '" alt="' + esc(d.name) + '" data-zoom data-caption="' + esc(d.name) + '" loading="lazy" style="object-position:center 25%"></div><div class="card-body"><h3>' + esc(d.name) + '</h3><div class="chips" style="margin-bottom:12px"><span class="chip">' + esc(d.details) + "</span></div><p>" + esc(d.about) + '</p><a class="card-link" href="contact.html?interest=' + encodeURIComponent(box.getAttribute("data-interest") || "") + '">Ask about ' + esc(d.name.split(" ")[0]) + "</a></div></article>";
    }).join("") + "</div>";
  });

  // Gallery filters
  var filterBtns = document.querySelectorAll(".filters button");
  filterBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-filter");
      filterBtns.forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      document.querySelectorAll(".masonry figure").forEach(function (fig) {
        fig.classList.toggle("hidden", f !== "all" && fig.getAttribute("data-cat").indexOf(f) < 0);
      });
    });
  });

  // Lightbox
  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Photo viewer");
  lb.innerHTML = '<button class="lb-btn lb-close" aria-label="Close">×</button><button class="lb-btn lb-prev" aria-label="Previous photo">‹</button><figure><img alt=""><figcaption></figcaption></figure><button class="lb-btn lb-next" aria-label="Next photo">›</button>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector("img"), lbCap = lb.querySelector("figcaption"), items = [], idx = 0, lastFocus;
  function visibleItems() { return Array.prototype.filter.call(document.querySelectorAll("[data-zoom]"), function (el) { return el.offsetParent !== null; }); }
  function show(i) {
    idx = (i + items.length) % items.length;
    var el = items[idx];
    lbImg.src = el.getAttribute("data-full") || el.currentSrc || el.src;
    lbImg.alt = el.alt || "";
    lbCap.textContent = el.getAttribute("data-caption") || el.alt || "";
  }
  function openLB(el) { items = visibleItems(); lastFocus = document.activeElement; show(items.indexOf(el)); lb.classList.add("open"); document.body.style.overflow = "hidden"; lb.querySelector(".lb-close").focus(); }
  function closeLB() { lb.classList.remove("open"); document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-zoom]");
    if (el && !lb.contains(el)) { e.preventDefault(); openLB(el); }
  });
  document.addEventListener("keydown", function (e) {
    var el = e.target.closest && e.target.closest("[data-zoom]");
    if (el && (e.key === "Enter" || e.key === " ") && !lb.classList.contains("open")) { e.preventDefault(); openLB(el); return; }
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowRight") show(idx + 1);
    if (e.key === "ArrowLeft") show(idx - 1);
  });
  lb.querySelector(".lb-close").onclick = closeLB;
  lb.querySelector(".lb-prev").onclick = function () { show(idx - 1); };
  lb.querySelector(".lb-next").onclick = function () { show(idx + 1); };
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLB(); });
  var touchX = null;
  lb.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) { if (touchX === null) return; var dx = e.changedTouches[0].clientX - touchX; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); touchX = null; });
  document.querySelectorAll("[data-zoom]").forEach(function (el) { if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0"); });

  // Contact form: prefill from link, send through the visitor's email app
  var form = document.getElementById("contact-form");
  if (form) {
    var interest = q.get("interest"), litter = q.get("litter");
    if (interest) { var sel = form.querySelector("[name=interest]"); Array.prototype.forEach.call(sel.options, function (o) { if (o.value === interest) sel.value = interest; }); }
    if (litter) form.querySelector("[name=message]").value = "Hi Phil and Debbie, I'm interested in a puppy from the " + litter + ". ";
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
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -60px 0px" });
    reveals.forEach(function (r) { io.observe(r); });
  } else reveals.forEach(function (r) { r.classList.add("in"); });

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();

/* ===== Signature moments ===== */
(function () {
  var C = window.FRK || {};

  // Announcement banner from content.js
  var ann = document.getElementById("announce");
  if (ann && C.announcement) { ann.innerHTML = ""; ann.textContent = C.announcement + " · "; var a = document.createElement("a"); a.href = "puppies.html#litters"; a.textContent = "See the litter →"; ann.appendChild(a); ann.hidden = false; }

  // Hero slideshow
  var show = document.querySelector(".slideshow");
  if (show) {
    var imgs = show.querySelectorAll("img"), dots = document.querySelectorAll(".slide-dots button"), cur = 0, timer;
    var go = function (n) {
      imgs[cur].classList.remove("on"); dots[cur] && dots[cur].removeAttribute("aria-current");
      cur = (n + imgs.length) % imgs.length;
      imgs[cur].classList.add("on"); dots[cur] && dots[cur].setAttribute("aria-current", "true");
    };
    var start = function () { clearInterval(timer); timer = setInterval(function () { go(cur + 1); }, 6000); };
    dots.forEach(function (d, i) { d.addEventListener("click", function () { go(i); start(); }); });
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) start();
  }

  // Color picker
  var notes = {
    black: ["Black Labrador", "Sleek and classic, the black Lab is a natural in the duck blind and on the couch."],
    yellow: ["Yellow Labrador", "Sunny and sweet. Yellow Labs range from pale cream to golden, with the same big heart."],
    chocolate: ["Chocolate Labrador", "Rich chocolate coats and soulful eyes. Every bit as keen to retrieve as their brothers and sisters."],
    fox: ["Fox Red Labrador", "The deep red end of yellow, like our stud dog Ammo, a titled AKC Senior Hunter."]
  };
  var picker = document.querySelector(".color-picker");
  if (picker) {
    picker.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        var c = b.getAttribute("data-color");
        picker.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-checked", x === b); });
        document.querySelectorAll(".color-photo").forEach(function (p) { p.classList.toggle("on", p.getAttribute("data-color") === c); });
        document.getElementById("color-label").textContent = notes[c][0];
        document.getElementById("color-note").textContent = notes[c][1];
        var name = b.textContent.trim(), cta = document.getElementById("color-cta");
        cta.textContent = "Ask about a " + name.toLowerCase() + " puppy";
        cta.href = "contact.html?interest=Puppies&color=" + encodeURIComponent(name);
      });
    });
  }

  // Color prefill on the contact form
  var q = new URLSearchParams(location.search), cf = document.querySelector("#contact-form [name=color]");
  if (cf && q.get("color")) cf.value = q.get("color");

  // Program finder
  var finder = document.getElementById("finder");
  if (finder) {
    var qs = finder.querySelectorAll(".finder-q"), bars = finder.querySelectorAll(".finder-progress span"), result = finder.querySelector(".finder-result"), ans = [];
    var P = {
      gundog: { name: "Gundog Training", img: "images/marsh-yellow-lab.jpg", link: "#gundog", interest: "Gundog Training" },
      obedience: { name: "Obedience Training", img: "images/obedience1.jpg", link: "#obedience", interest: "Obedience Training" },
      owner: { name: "Owner Training Program", img: "images/ownertrain-1.jpg", link: "#owner", interest: "Owner Training" }
    };
    var decide = function () {
      var goal = ans[0], age = ans[1], style = ans[2], key, why;
      if (goal === "learn" || (goal === "hunt" && style === "hands")) { key = "owner"; why = "One-on-one lessons teach you to train your own dog. Most owners reach gun dog level in 8 to 10 lessons."; }
      else if (goal === "hunt") { key = "gundog"; why = "Your dog learns the rules of the hunt, upland and waterfowl, with over 100 birds shot over it before it comes home."; }
      else { key = "obedience"; why = style === "hands" ? "About two months to real-life manners, and you're welcome to visit and take part as often as you like." : "About two months to a dog that heels, comes when called and settles on command, for any breed."; }
      if (age === "young") why += " Training can start as early as 6 months, so now is a great time to reserve a spot.";
      var p = P[key];
      result.innerHTML = '<img src="' + p.img + '" alt=""><div><span class="eyebrow">Our recommendation</span><h3>' + p.name + '</h3><p class="why">' + why + '</p><div class="actions"><a class="btn btn-primary" href="contact.html?interest=' + encodeURIComponent(p.interest) + '">Ask about this program</a><a class="btn btn-outline" href="' + p.link + '">Read more</a><button class="again" type="button">Start over</button></div></div>';
      result.hidden = false;
      result.querySelector(".again").onclick = function () { ans = []; result.hidden = true; qs[0].hidden = false; bars.forEach(function (b) { b.classList.remove("done"); }); };
    };
    qs.forEach(function (box, i) {
      box.querySelectorAll("button").forEach(function (b) {
        b.addEventListener("click", function () {
          ans[i] = b.getAttribute("data-v"); bars[i].classList.add("done"); box.hidden = true;
          if (qs[i + 1]) qs[i + 1].hidden = false; else decide();
        });
      });
    });
  }
})();
