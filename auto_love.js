// ===== YouTube Auto-Love v8 =====
(function () {
  var DMIN = 1000;
  var DMAX = 3000;
  var SCROLL_PX = 1000;
  var SCROLL_WAIT = 2000;
  var MAX_EMPTY = 5; // stop jika N kali scroll tidak ada tombol baru
  var stopped = false;
  var totalLoved = 0;
  var emptyCount = 0; // counter scroll kosong berturut-turut

  // Panel progress
  var panel = document.createElement('div');
  panel.style.cssText =
    'position:fixed;bottom:20px;left:20px;background:#212121;color:#fff;' +
    'padding:12px 20px;border-radius:12px;font:13px/1.6 sans-serif;' +
    'z-index:99999;box-shadow:0 4px 16px rgba(0,0,0,.5);min-width:260px;';
  var titleEl = document.createElement('b');
  titleEl.textContent = 'YT Auto-Love';
  var br1 = document.createElement('br');
  var statusEl = document.createElement('span');
  statusEl.textContent = 'Memulai...';
  var br2 = document.createElement('br');
  var hintEl = document.createElement('small');
  hintEl.style.cssText = 'opacity:0.5;font-size:11px;';
  hintEl.textContent = 'Tekan Enter di Console untuk stop';
  panel.appendChild(titleEl);
  panel.appendChild(br1);
  panel.appendChild(statusEl);
  panel.appendChild(br2);
  panel.appendChild(hintEl);
  document.body.appendChild(panel);

  function setStatus(msg) {
    statusEl.textContent = msg;
    console.log('[YT Auto-Love] ' + msg);
  }

  function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Stop saat Enter ditekan
  function onEnter(e) {
    if (e.key === 'Enter') {
      stopped = true;
      document.removeEventListener('keydown', onEnter, true);
    }
  }
  document.addEventListener('keydown', onEnter, true);

  // Deep query menembus shadow DOM
  function deepQuery(root, selector) {
    var results = [];
    root.querySelectorAll('*').forEach(function (el) {
      if (el.shadowRoot) {
        deepQuery(el.shadowRoot, selector).forEach(function (r) {
          results.push(r);
        });
      }
    });
    root.querySelectorAll(selector).forEach(function (el) {
      results.push(el);
    });
    return results;
  }

  // Ambil tombol yang belum di-love
  function getUnlovedBtns() {
    var allBtns = deepQuery(document, 'button');
    return allBtns.filter(function (b) {
      return b.getAttribute('aria-label') === 'Heart';
    });
  }

  // Love satu per satu
  function loveBatch(btns, idx, onDone) {
    if (stopped) { onDone(); return; }
    if (idx >= btns.length) { onDone(); return; }

    var btn = btns[idx];
    if (btn.getAttribute('aria-label') !== 'Heart') {
      loveBatch(btns, idx + 1, onDone);
      return;
    }

    btn.click();
    totalLoved++;
    setStatus('Love ke-' + totalLoved + ' ✅ (' + (idx + 1) + '/' + btns.length + ' batch)');
    console.log('[YT Auto-Love] Berhasil love ke-' + totalLoved);

    var delay = randomDelay(DMIN, DMAX);
    console.log('[YT Auto-Love] Jeda ' + delay + 'ms...');
    setTimeout(function () {
      loveBatch(btns, idx + 1, onDone);
    }, delay);
  }

  // Siklus utama
  function cycle() {
    if (stopped) {
      setStatus('Dihentikan. Total di-love: ' + totalLoved);
      setTimeout(function () { panel.remove(); }, 5000);
      return;
    }

    // Scroll dulu
    window.scrollBy(0, SCROLL_PX);
    setStatus('Scrolling... (total: ' + totalLoved + ' di-love)');

    setTimeout(function () {
      if (stopped) { cycle(); return; }

      var btns = getUnlovedBtns();
      console.log('[YT Auto-Love] Ditemukan ' + btns.length + ' belum di-love.');

      if (btns.length === 0) {
        emptyCount++;
        console.log('[YT Auto-Love] Kosong ' + emptyCount + '/' + MAX_EMPTY + ' kali.');
        setStatus('Cek ulang... (' + emptyCount + '/' + MAX_EMPTY + ') total: ' + totalLoved);

        if (emptyCount >= MAX_EMPTY) {
          setStatus('Selesai! Total di-love: ' + totalLoved);
          document.removeEventListener('keydown', onEnter, true);
          setTimeout(function () { panel.remove(); }, 6000);
          return;
        }

        // Scroll lagi, coba cek berikutnya
        cycle();
        return;
      }

      // Ada tombol baru — reset counter kosong
      emptyCount = 0;
      setStatus('Ditemukan ' + btns.length + ' belum di-love, mulai...');

      loveBatch(btns, 0, function () {
        if (!stopped) cycle();
        else {
          setStatus('Dihentikan. Total di-love: ' + totalLoved);
          setTimeout(function () { panel.remove(); }, 5000);
        }
      });

    }, SCROLL_WAIT);
  }

  setStatus('Memulai...');
  console.log('[YT Auto-Love] Dimulai. Tekan Enter di Console untuk stop.');
  cycle();
})();
