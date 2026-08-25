(function () {
  "use strict";

  var data = window.SKILLS_DATA;
  var grid = document.getElementById("skill-grid");
  if (!data || !grid) return;

  var searchInput = document.getElementById("skill-search");
  var filterRow = document.getElementById("filter-row");
  var resultsCount = document.getElementById("results-count");
  var emptyState = document.getElementById("empty-state");
  var statTotal = document.getElementById("stat-total");
  var statCategories = document.getElementById("stat-categories");

  var categoryIndex = {};
  data.categories.forEach(function (cat, i) {
    categoryIndex[cat.slug] = (i % 8) + 1;
  });

  if (statTotal) statTotal.textContent = data.skills.length;
  if (statCategories) statCategories.textContent = data.categories.length;

  var state = { query: "", category: "all" };

  /* ---------------------------------------------------------------- */
  /* Filter chips                                                        */
  /* ---------------------------------------------------------------- */
  function buildChip(slug, label, count) {
    var chip = document.createElement("button");
    chip.type = "button";
    chip.className = "filter-chip";
    chip.dataset.slug = slug;
    chip.setAttribute("aria-pressed", slug === "all" ? "true" : "false");

    if (slug !== "all") {
      var dot = document.createElement("i");
      dot.className = "dot dot-" + categoryIndex[slug] + " chip-dot";
      chip.appendChild(dot);
    }
    var text = document.createTextNode(label + " ");
    chip.appendChild(text);
    var countEl = document.createElement("span");
    countEl.className = "chip-count";
    countEl.textContent = "(" + count + ")";
    chip.appendChild(countEl);

    chip.addEventListener("click", function () {
      state.category = slug;
      Array.prototype.forEach.call(filterRow.children, function (c) {
        c.setAttribute("aria-pressed", c === chip ? "true" : "false");
      });
      render();
    });
    return chip;
  }

  if (filterRow) {
    filterRow.appendChild(buildChip("all", "All skills", data.skills.length));
    data.categories.forEach(function (cat) {
      filterRow.appendChild(buildChip(cat.slug, cat.label, cat.count));
    });
  }

  /* ---------------------------------------------------------------- */
  /* Search                                                              */
  /* ---------------------------------------------------------------- */
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      state.query = searchInput.value.trim().toLowerCase();
      render();
    });
  }

  /* ---------------------------------------------------------------- */
  /* Card rendering                                                       */
  /* ---------------------------------------------------------------- */
  function copyIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
  }

  function buildCard(skill) {
    var card = document.createElement("article");
    card.className = "skill-card";

    var catRow = document.createElement("p");
    catRow.className = "skill-card-cat";
    var dot = document.createElement("i");
    dot.className = "dot dot-" + categoryIndex[skill.category];
    catRow.appendChild(dot);
    catRow.appendChild(document.createTextNode(skill.categoryLabel));
    card.appendChild(catRow);

    var h3 = document.createElement("h3");
    h3.textContent = skill.title;
    card.appendChild(h3);

    var p = document.createElement("p");
    p.textContent = skill.summary;
    card.appendChild(p);

    var foot = document.createElement("div");
    foot.className = "skill-card-foot";

    var invoke = document.createElement("code");
    invoke.className = "skill-invoke";
    invoke.textContent = "/" + skill.id;
    foot.appendChild(invoke);

    var copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "copy-btn";
    copyBtn.innerHTML = copyIcon() + "<span>Copy</span>";
    copyBtn.addEventListener("click", function () {
      var text = "/" + skill.id;
      var done = function () {
        copyBtn.classList.add("copied");
        copyBtn.querySelector("span").textContent = "Copied";
        setTimeout(function () {
          copyBtn.classList.remove("copied");
          copyBtn.querySelector("span").textContent = "Copy";
        }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        done();
      }
    });
    foot.appendChild(copyBtn);

    card.appendChild(foot);
    return card;
  }

  function matches(skill) {
    if (state.category !== "all" && skill.category !== state.category) return false;
    if (!state.query) return true;
    var haystack = (skill.title + " " + skill.id + " " + skill.summary + " " + skill.categoryLabel).toLowerCase();
    return haystack.indexOf(state.query) !== -1;
  }

  function render() {
    var filtered = data.skills.filter(matches);
    grid.innerHTML = "";
    filtered.forEach(function (skill) {
      grid.appendChild(buildCard(skill));
    });

    if (resultsCount) {
      resultsCount.textContent = filtered.length + " of " + data.skills.length + " skills";
    }
    if (emptyState) {
      emptyState.hidden = filtered.length !== 0;
      grid.hidden = filtered.length === 0;
    }
  }

  render();
})();
