// Loader JSX paralel — pengganti auto-run Babel Standalone (yang men-transpile ±140 file JSX
// satu per satu di main thread dan membuat layar loading lama).
//
// Alur:
//   1. Semua <script type="text/jsx-src" src="..."> di index.html diunduh BERSAMAAN (fetch paralel).
//   2. Hasil transpile sebelumnya diambil dari cache IndexedDB (kunci = hash isi file), jadi
//      kunjungan berikutnya & file yang tak berubah tidak di-transpile lagi.
//   3. File yang belum ada di cache di-transpile PARALEL di beberapa Web Worker (Babel di tiap worker).
//   4. Kode hasil transpile dijalankan BERURUTAN sesuai urutan tag di index.html (urutan wajib,
//      karena antar file saling bergantung lewat variabel global).
//
// Preset hanya 'react' (JSX -> createElement); sintaks modern dibiarkan apa adanya karena semua
// browser saat ini sudah mendukungnya, dan itu ±3x lebih cepat daripada preset es2015 bawaan Babel.
// Menambah/menghapus file JSX: cukup ubah tag <script type="text/jsx-src"> di index.html.

(function () {
  'use strict';

  var BABEL_URL = 'https://unpkg.com/@babel/standalone@7.29.0/babel.min.js';
  var BABEL_SRI = 'sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y';
  var PRESETS = ['react'];
  var CACHE_VERSION = 'babel-7.29.0|react|v1'; // ganti bila BABEL_URL/PRESETS berubah
  var DB_NAME = 'pdj-jsx-cache', STORE = 'compiled';

  var t0 = performance.now();
  var hintEl = document.querySelector('#app-loading .hint');
  var setHint = function (text) { if (hintEl) hintEl.textContent = text; };

  // ---- util ----------------------------------------------------------------
  function hash(str) { // cyrb53 — cukup untuk kunci cache (bukan keamanan)
    var h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36) + '-' + str.length.toString(36);
  }

  // ---- cache IndexedDB (opsional: bila tak tersedia, jalan tanpa cache) -------
  function openDb() {
    return new Promise(function (resolve) {
      try {
        var req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = function () { req.result.createObjectStore(STORE); };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = req.onblocked = function () { resolve(null); };
      } catch (e) { resolve(null); }
    });
  }
  function cacheGetAll(db, keys) {
    if (!db) return Promise.resolve({});
    return new Promise(function (resolve) {
      var out = {};
      try {
        var store = db.transaction(STORE, 'readonly').objectStore(STORE);
        var left = keys.length;
        if (!left) return resolve(out);
        keys.forEach(function (k) {
          var r = store.get(k);
          r.onsuccess = function () { if (r.result != null) out[k] = r.result; if (--left === 0) resolve(out); };
          r.onerror = function () { if (--left === 0) resolve(out); };
        });
      } catch (e) { resolve(out); }
    });
  }
  function cachePutAndPrune(db, entries, usedKeys) {
    if (!db) return;
    try {
      var store = db.transaction(STORE, 'readwrite').objectStore(STORE);
      Object.keys(entries).forEach(function (k) { store.put(entries[k], k); });
      var used = {}; usedKeys.forEach(function (k) { used[k] = 1; });
      store.openKeyCursor().onsuccess = function (e) { // buang entri usang supaya cache tak membengkak
        var c = e.target.result;
        if (c) { if (!used[c.key]) store.delete(c.key); c.continue(); }
      };
    } catch (e) { /* abaikan */ }
  }

  // ---- transpile paralel -----------------------------------------------------
  var WORKER_GLUE =
    'self.onmessage=function(e){var d=e.data;try{' +
    'var out=Babel.transform(d.code,{presets:d.presets,sourceType:"script",filename:d.name,sourceMaps:false}).code;' +
    'self.postMessage({id:d.id,code:out});' +
    '}catch(err){self.postMessage({id:d.id,error:String(err&&err.message||err)});}};';

  function transpileParallel(jobs, babelSource, onProgress) {
    // jobs: [{id, name, code}] -> resolve {id: compiledCode | {error}}
    return new Promise(function (resolve, reject) {
      var n = Math.min(8, Math.max(2, (navigator.hardwareConcurrency || 4) - 1), jobs.length);
      var blobUrl = URL.createObjectURL(new Blob([babelSource, '\n', WORKER_GLUE], { type: 'text/javascript' }));
      var queue = jobs.slice().sort(function (a, b) { return b.code.length - a.code.length; }); // terbesar dulu
      var results = {}, done = 0, workers = [];
      var finish = function () { workers.forEach(function (w) { w.terminate(); }); URL.revokeObjectURL(blobUrl); resolve(results); };
      if (!jobs.length) return finish();
      for (var i = 0; i < n; i++) {
        (function () {
          var w;
          try { w = new Worker(blobUrl); } catch (e) { return reject(e); }
          workers.push(w);
          var next = function () {
            var job = queue.shift();
            if (job) w.postMessage({ id: job.id, name: job.name, code: job.code, presets: PRESETS });
          };
          w.onmessage = function (e) {
            results[e.data.id] = e.data.error ? { error: e.data.error } : e.data.code;
            done++; onProgress(done, jobs.length);
            if (done === jobs.length) finish(); else next();
          };
          w.onerror = function (e) { reject(e); };
          next();
        })();
      }
    });
  }

  function transpileMainThread(jobs, babelSource, onProgress) {
    // Cadangan bila Web Worker tak bisa dipakai: Babel dijalankan di main thread.
    var s = document.createElement('script');
    s.text = babelSource; document.head.appendChild(s); s.remove();
    var results = {};
    jobs.forEach(function (j, i) {
      try { results[j.id] = window.Babel.transform(j.code, { presets: PRESETS, sourceType: 'script', filename: j.name }).code; }
      catch (err) { results[j.id] = { error: String(err && err.message || err) }; }
      onProgress(i + 1, jobs.length);
    });
    return Promise.resolve(results);
  }

  // ---- eksekusi berurutan -----------------------------------------------------
  function run(code, name) {
    var s = document.createElement('script');
    s.text = code + '\n//# sourceURL=' + name;
    document.head.appendChild(s);
    s.remove();
  }

  // ---- main -------------------------------------------------------------------
  var tags = Array.prototype.slice.call(document.querySelectorAll('script[type="text/jsx-src"][src]'));
  var files = tags.map(function (t) { return t.getAttribute('src'); });

  setHint('Mengunduh modul…');
  var fetchOpts = { cache: 'no-cache' }; // selalu validasi ke server (304 murah) agar tak memakai file usang

  Promise.all([
    fetch(BABEL_URL, { integrity: BABEL_SRI, mode: 'cors' }).then(function (r) { return r.text(); }),
    Promise.all(files.map(function (f) {
      return fetch(f, fetchOpts).then(function (r) {
        if (!r.ok) throw new Error(f + ' -> HTTP ' + r.status);
        return r.text();
      });
    })),
    openDb()
  ]).then(function (all) {
    var babelSource = all[0], sources = all[1], db = all[2];
    var items = files.map(function (f, i) {
      return { id: i, name: f, code: sources[i], key: CACHE_VERSION + '|' + f + '|' + hash(sources[i]) };
    });
    return cacheGetAll(db, items.map(function (it) { return it.key; })).then(function (cached) {
      var misses = items.filter(function (it) { return cached[it.key] == null; });
      var hits = items.length - misses.length;
      var progress = function (d, total) { setHint('Menyiapkan modul… ' + d + '/' + total); };
      if (misses.length) setHint('Menyiapkan modul… 0/' + misses.length);
      var transpile = misses.length
        ? transpileParallel(misses, babelSource, progress).catch(function (e) {
            console.warn('[loader] Web Worker gagal, memakai main thread:', e);
            return transpileMainThread(misses, babelSource, progress);
          })
        : Promise.resolve({});
      return transpile.then(function (fresh) {
        var toStore = {};
        items.forEach(function (it) {
          var code = cached[it.key];
          if (code == null) {
            var r = fresh[it.id];
            if (r && r.error) { console.error('[loader] Gagal transpile ' + it.name + ': ' + r.error); return; }
            code = r; toStore[it.key] = code;
          }
          it.compiled = code;
        });
        cachePutAndPrune(db, toStore, items.map(function (it) { return it.key; }));

        setHint('Memulai aplikasi…');
        items.forEach(function (it) { if (it.compiled != null) run(it.compiled, it.name); });
        console.info('[loader] ' + items.length + ' file: ' + hits + ' dari cache, ' + misses.length +
          ' di-transpile paralel, siap dalam ' + Math.round(performance.now() - t0) + ' ms');
      });
    });
  }).catch(function (err) {
    console.error('[loader] Gagal memuat aplikasi:', err);
    setHint('Gagal memuat aplikasi: ' + (err && err.message || err));
  });
})();
