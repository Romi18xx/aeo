(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* Theme toggle                                                        */
  /* ------------------------------------------------------------------ */
  var root = document.documentElement;
  var toggleBtn = document.getElementById("theme-toggle");
  var STORAGE_KEY = "aeo-signal-theme";

  function applyStoredTheme() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        root.setAttribute("data-theme", stored);
      }
    } catch (e) { /* storage unavailable — fall back to OS preference */ }
  }
  applyStoredTheme();

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      var isDark = current ? current === "dark" : prefersDark;
      var next = isDark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* ignore */ }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Shared helpers                                                       */
  /* ------------------------------------------------------------------ */
  var SVG_NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs) {
    var node = document.createElementNS(SVG_NS, tag);
    for (var key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) {
        node.setAttribute(key, attrs[key]);
      }
    }
    return node;
  }
  function niceMax(value) {
    var step = value <= 20 ? 5 : 10;
    return Math.ceil(value / step) * step;
  }

  /* ------------------------------------------------------------------ */
  /* Trend line chart                                                     */
  /* ------------------------------------------------------------------ */
  var weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
  var trendSeries = [
    { name: "ChatGPT",    varName: "--series-1", data: [18, 21, 23, 25, 27, 29, 32, 34] },
    { name: "Perplexity", varName: "--series-2", data: [28, 30, 33, 35, 36, 38, 40, 41] },
    { name: "Gemini",     varName: "--series-3", data: [12, 14, 16, 18, 21, 24, 27, 29] },
    { name: "Copilot",    varName: "--series-4", data: [8, 9, 10, 11, 13, 14, 16, 18] }
  ];

  function buildTrendChart() {
    var container = document.getElementById("trend-chart");
    var tooltip = document.getElementById("trend-tooltip");
    var legendEl = document.getElementById("trend-legend");
    var tableBody = document.getElementById("trend-table-body");
    if (!container) return;

    var W = 640, H = 300;
    var padL = 34, padR = 12, padT = 12, padB = 30;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;

    var maxVal = niceMax(Math.max.apply(null, trendSeries.map(function (s) {
      return Math.max.apply(null, s.data);
    })));
    var ticks = 5;

    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Line chart of weekly citation rate by answer engine over eight weeks" });

    var xFor = function (i) { return padL + (plotW * i) / (weeks.length - 1); };
    var yFor = function (v) { return padT + plotH - (plotH * v) / maxVal; };

    // gridlines + y labels
    for (var t = 0; t <= ticks; t++) {
      var val = (maxVal / ticks) * t;
      var y = yFor(val);
      svg.appendChild(el("line", { class: "grid-line", x1: padL, x2: W - padR, y1: y, y2: y }));
      var label = el("text", { class: "axis-label", x: padL - 8, y: y + 3, "text-anchor": "end" });
      label.textContent = Math.round(val) + "%";
      svg.appendChild(label);
    }
    svg.appendChild(el("line", { class: "axis-line", x1: padL, x2: W - padR, y1: padT + plotH, y2: padT + plotH }));

    // x labels
    weeks.forEach(function (w, i) {
      var lbl = el("text", { class: "axis-label", x: xFor(i), y: H - 8, "text-anchor": "middle" });
      lbl.textContent = w;
      svg.appendChild(lbl);
    });

    // series lines + end markers
    var markerGroups = [];
    trendSeries.forEach(function (s) {
      var points = s.data.map(function (v, i) { return xFor(i) + "," + yFor(v); }).join(" ");
      var line = el("polyline", {
        class: "line-series",
        points: points,
        style: "stroke:var(" + s.varName + ")"
      });
      svg.appendChild(line);

      var markers = [];
      s.data.forEach(function (v, i) {
        var dot = el("circle", {
          class: "line-marker",
          cx: xFor(i), cy: yFor(v), r: 4,
          style: "fill:var(" + s.varName + ")"
        });
        svg.appendChild(dot);
        markers.push(dot);
      });
      markerGroups.push(markers);

      // end-of-line direct label
      var lastI = s.data.length - 1;
      var endLabel = el("text", {
        class: "axis-label", x: xFor(lastI) + 8, y: yFor(s.data[lastI]) + 3,
        style: "fill:var(" + s.varName + ")"
      });
      endLabel.textContent = s.data[lastI] + "%";
      svg.appendChild(endLabel);
    });

    // crosshair (hidden until hover)
    var crosshair = el("line", { class: "crosshair", x1: padL, x2: padL, y1: padT, y2: padT + plotH, opacity: 0 });
    svg.appendChild(crosshair);

    // hover capture surface
    var hoverRect = el("rect", { class: "hover-col", x: padL, y: padT, width: plotW, height: plotH });
    svg.appendChild(hoverRect);

    container.innerHTML = "";
    container.appendChild(svg);

    function showAt(index, clientX, clientY) {
      var x = xFor(index);
      crosshair.setAttribute("x1", x);
      crosshair.setAttribute("x2", x);
      crosshair.setAttribute("opacity", 1);

      markerGroups.forEach(function (markers) {
        markers.forEach(function (m, i) {
          m.setAttribute("r", i === index ? 5.5 : 4);
        });
      });

      var rows = trendSeries.map(function (s) {
        return (
          '<div class="tooltip-row">' +
            '<span class="key"><span class="tooltip-key-line" style="background:var(' + s.varName + ')"></span>' + s.name + '</span>' +
            '<span class="val">' + s.data[index] + '%</span>' +
          '</div>'
        );
      }).join("");
      tooltip.innerHTML = '<div class="tooltip-title">' + weeks[index] + '</div>' + rows;
      tooltip.hidden = false;

      var wrapRect = container.parentElement.getBoundingClientRect();
      var svgRect = svg.getBoundingClientRect();
      var relX = svgRect.left - wrapRect.left + (x / W) * svgRect.width;
      tooltip.style.left = relX + "px";
      tooltip.style.top = (padT / H) * svgRect.height + "px";
    }

    function hide() {
      crosshair.setAttribute("opacity", 0);
      markerGroups.forEach(function (markers) {
        markers.forEach(function (m) { m.setAttribute("r", 4); });
      });
      tooltip.hidden = true;
    }

    function indexFromEvent(evt) {
      var svgRect = svg.getBoundingClientRect();
      var relX = ((evt.clientX - svgRect.left) / svgRect.width) * W;
      var raw = ((relX - padL) / plotW) * (weeks.length - 1);
      return Math.min(weeks.length - 1, Math.max(0, Math.round(raw)));
    }

    hoverRect.addEventListener("pointermove", function (evt) {
      showAt(indexFromEvent(evt));
    });
    hoverRect.addEventListener("pointerleave", hide);
    hoverRect.addEventListener("pointerdown", function (evt) {
      showAt(indexFromEvent(evt));
    });

    // legend
    if (legendEl) {
      legendEl.innerHTML = "";
      trendSeries.forEach(function (s) {
        var item = document.createElement("span");
        item.className = "legend-item";
        var swatch = document.createElement("span");
        swatch.className = "legend-swatch";
        swatch.style.background = "var(" + s.varName + ")";
        var text = document.createElement("span");
        text.textContent = s.name;
        item.appendChild(swatch);
        item.appendChild(text);
        legendEl.appendChild(item);
      });
    }

    // table view
    if (tableBody) {
      tableBody.innerHTML = "";
      weeks.forEach(function (w, i) {
        var tr = document.createElement("tr");
        var cells = [w].concat(trendSeries.map(function (s) { return s.data[i] + "%"; }));
        cells.forEach(function (val, ci) {
          var cellTag = ci === 0 ? "th" : "td";
          var cell = document.createElement(cellTag);
          if (cellTag === "th") cell.scope = "row";
          cell.textContent = val;
          tr.appendChild(cell);
        });
        tableBody.appendChild(tr);
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Engine breakdown bar chart                                          */
  /* ------------------------------------------------------------------ */
  var engineData = [
    { name: "Perplexity", varName: "--series-2", value: 41 },
    { name: "ChatGPT",    varName: "--series-1", value: 34 },
    { name: "Gemini",     varName: "--series-3", value: 29 },
    { name: "Copilot",    varName: "--series-4", value: 18 }
  ];

  function buildEngineChart() {
    var container = document.getElementById("engine-chart");
    var tooltip = document.getElementById("engine-tooltip");
    var tableBody = document.getElementById("engine-table-body");
    if (!container) return;

    var W = 640;
    var barH = 22, gap = 26;
    var padL = 96, padR = 48, padT = 8;
    var H = padT + engineData.length * (barH + gap);
    var plotW = W - padL - padR;

    var maxVal = niceMax(Math.max.apply(null, engineData.map(function (d) { return d.value; })));

    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Bar chart of citation rate by answer engine" });

    var xFor = function (v) { return padL + (plotW * v) / maxVal; };

    var bars = [];
    engineData.forEach(function (d, i) {
      var y = padT + i * (barH + gap);

      var catLabel = el("text", { class: "bar-cat-label", x: padL - 12, y: y + barH / 2 + 4, "text-anchor": "end" });
      catLabel.textContent = d.name;
      svg.appendChild(catLabel);

      var track = el("rect", {
        x: padL, y: y, width: plotW, height: barH, rx: 4,
        class: "grid-line", fill: "none"
      });
      svg.appendChild(track);

      var barWidth = xFor(d.value) - padL;
      var bar = el("rect", {
        class: "bar-mark", x: padL, y: y, width: Math.max(barWidth, 4), height: barH, rx: 4,
        style: "fill:var(" + d.varName + ")", tabindex: "0",
        "aria-label": d.name + ": " + d.value + " percent citation rate"
      });
      svg.appendChild(bar);
      bars.push(bar);

      var valueLabel = el("text", { class: "bar-value", x: xFor(d.value) + 8, y: y + barH / 2 + 4 });
      valueLabel.textContent = d.value + "%";
      svg.appendChild(valueLabel);

      function activate() {
        bar.style.opacity = "0.82";
        var rows = '<div class="tooltip-row"><span class="key"><span class="tooltip-key-line" style="background:var(' + d.varName + ')"></span>' + d.name + '</span><span class="val">' + d.value + '%</span></div>';
        tooltip.innerHTML = '<div class="tooltip-title">Citation rate</div>' + rows;
        tooltip.hidden = false;
        var wrapRect = container.parentElement.getBoundingClientRect();
        var svgRect = svg.getBoundingClientRect();
        var relX = svgRect.left - wrapRect.left + (xFor(d.value) / W) * svgRect.width;
        var relY = svgRect.top - wrapRect.top + ((y) / H) * svgRect.height;
        tooltip.style.left = relX + "px";
        tooltip.style.top = relY + "px";
      }
      function deactivate() {
        bar.style.opacity = "1";
        tooltip.hidden = true;
      }

      bar.addEventListener("pointerenter", activate);
      bar.addEventListener("pointerleave", deactivate);
      bar.addEventListener("focus", activate);
      bar.addEventListener("blur", deactivate);
    });

    svg.appendChild(el("line", { class: "axis-line", x1: padL, x2: padL, y1: padT, y2: H }));

    container.innerHTML = "";
    container.appendChild(svg);

    if (tableBody) {
      tableBody.innerHTML = "";
      engineData.forEach(function (d) {
        var tr = document.createElement("tr");
        var th = document.createElement("th");
        th.scope = "row";
        th.textContent = d.name;
        var td = document.createElement("td");
        td.textContent = d.value + "%";
        tr.appendChild(th);
        tr.appendChild(td);
        tableBody.appendChild(tr);
      });
    }
  }

  buildTrendChart();
  buildEngineChart();

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      buildTrendChart();
      buildEngineChart();
    }, 150);
  });
})();
