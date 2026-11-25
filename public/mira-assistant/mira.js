/*!
 * Mira - static Q&A assistant for IGO Agri Estates.
 * Plain JavaScript, no build step, no network calls, no storage.
 * Everything renders inside Shadow DOM so the website and Mira cannot affect each other.
 * Text lives in mira-data.js; styles in mira.css. See README.md.
 */
(function () {
  'use strict';
  if (window.__miraLoaded) return;
  window.__miraLoaded = true;

  var VERSION = '3';
  var script = document.currentScript;
  var BASE = (function () {
    var src = (script && script.src) || '';
    if (!src) {
      var all = document.getElementsByTagName('script');
      for (var i = all.length - 1; i >= 0; i--) {
        if (/mira-assistant\/mira\.js/.test(all[i].src)) { src = all[i].src; break; }
      }
    }
    return src ? src.replace(/[^\/]*(\?.*)?$/, '') : '/mira-assistant/';
  })();
  var asset = function (path) { return BASE + path + '?v=' + VERSION; };

  /* ---------- tiny helpers ---------- */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        var v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'text') node.textContent = v;
        else if (k === 'html') node.innerHTML = v; // only used for our own static SVG icons
        else if (k.indexOf('on') === 0) node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? '' : v);
      }
    }
    (children || []).forEach(function (c) { if (c) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return node;
  }
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = function () { return window.matchMedia && window.matchMedia('(max-width: 600px)').matches; };
  var norm = function (s) { return String(s || '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim(); };
  var escapeRe = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };

  var ICONS = {
    restart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
    minimise: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4 5.2 5.2 0 0 0 3.2.7 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.2-.2-.4-.3z"/></svg>'
  };

  /* ---------- loading ---------- */
  function loadData(cb) {
    if (window.MIRA_DATA) return cb();
    var s = document.createElement('script');
    s.src = asset('mira-data.js');
    s.async = true;
    s.onload = function () { if (window.MIRA_DATA) cb(); };
    s.onerror = function () { if (window.console) console.warn('Mira: could not load mira-data.js'); };
    document.head.appendChild(s);
  }
  function styleLink() { return el('link', { rel: 'stylesheet', href: asset('mira.css') }); }
  function avatarImg(size, cls, alt) {
    // size: displayed CSS px; srcset gives a sharp picture on high-density screens
    return el('img', {
      class: cls,
      src: asset('assets/mira-avatar-' + (size > 100 ? 512 : 128) + '.webp'),
      srcset: asset('assets/mira-avatar-128.webp') + ' 128w, ' + asset('assets/mira-avatar-256.webp') + ' 256w, ' + asset('assets/mira-avatar-512.webp') + ' 512w',
      sizes: size + 'px',
      width: size, height: size,
      alt: alt || '',
      decoding: 'async',
      draggable: 'false'
    });
  }

  /* ---------- main ---------- */
  function init() {
    var D = window.MIRA_DATA;
    var cfg = D.config || {}, M = D.messages || {}, LINKS = D.links || {}, QA = D.qa || [];
    var hasWa = !!(cfg.whatsappNumber && String(cfg.whatsappNumber).replace(/\D/g, ''));
    var waUrl = hasWa ? 'https://wa.me/' + String(cfg.whatsappNumber).replace(/\D/g, '') + '?text=' + encodeURIComponent(cfg.whatsappMessage || '') : '';
    var collapsed = cfg.suggestionsCollapsed || 6;

    /* Prepare keyword matchers once */
    QA.forEach(function (item) {
      var words = (item.keywords || []).concat([item.q]);
      item._matchers = words.map(function (w) {
        var n = norm(w);
        return n ? { re: new RegExp('(^|\\s)' + escapeRe(n) + '(\\s|$)'), weight: n.split(' ').length + (n.length > 6 ? 1 : 0) } : null;
      }).filter(Boolean);
    });
    function findAnswer(text) {
      var t = norm(text);
      if (!t) return null;
      var best = null, bestScore = 0;
      QA.forEach(function (item) {
        if (norm(item.q) === t) { best = item; bestScore = 1e6; return; }
        var score = 0;
        item._matchers.forEach(function (m) { if (m.re.test(t)) score += m.weight; });
        if (score > bestScore) { bestScore = score; best = item; }
      });
      return bestScore > 0 ? best : null;
    }

    /* Host + shadow root (outside the React app root, so the site never re-renders it) */
    var host = el('div', { id: 'mira-assistant-root', 'data-no-translate': '', translate: 'no' });
    document.body.appendChild(host);
    var root = host.attachShadow({ mode: 'open' });
    root.appendChild(styleLink());

    /* Launcher */
    var tooltip = el('span', { class: 'mira-tooltip', 'aria-hidden': 'true', text: M.tooltip || 'Chat with Mira' });
    var launcher = el('button', { type: 'button', class: 'mira-launcher', 'aria-label': 'Chat with Mira, your ' + (cfg.siteName || '') + ' assistant', 'aria-haspopup': 'dialog', 'aria-expanded': 'false' },
      [avatarImg(64, '', ''), el('span', { class: 'mira-dot', 'aria-hidden': 'true' })]);
    var launcherWrap = el('div', { class: 'mira-launcher-wrap' }, [launcher, tooltip]);
    root.appendChild(launcherWrap);

    /* Panel */
    var messages = el('div', { class: 'mira-messages', role: 'log', 'aria-live': 'polite', 'aria-relevant': 'additions', 'aria-label': 'Conversation with Mira' });
    var input = el('input', { class: 'mira-input', type: 'text', placeholder: M.placeholder || 'Type your question\u2026', 'aria-label': 'Type your question', autocomplete: 'off', enterkeyhint: 'send', maxlength: '300' });
    var errorMsg = el('p', { class: 'mira-error', id: 'mira-error', 'aria-live': 'assertive' });
    var sendBtn = el('button', { type: 'submit', class: 'mira-send', 'aria-label': 'Send question' }, [el('span', { class: 'mira-send-label', text: 'Send' })]);
    sendBtn.insertAdjacentHTML('beforeend', ICONS.send);
    var form = el('form', { class: 'mira-form', novalidate: true }, [input, sendBtn]);

    function iconBtn(name, label, onClick) {
      return el('button', { type: 'button', class: 'mira-icon-btn', 'aria-label': label, title: label, html: ICONS[name], onclick: onClick });
    }
    function waBar() {
      if (!hasWa) return null;
      var a = el('a', { class: 'mira-wa-bar', href: waUrl, target: '_blank', rel: 'noopener noreferrer' }, [M.whatsappBar || 'Chat on WhatsApp \u2014 instant reply', el('span', { class: 'mira-sr', text: ' (opens in a new tab)' })]);
      a.insertAdjacentHTML('afterbegin', ICONS.wa);
      return a;
    }
    var headerAvatar = el('div', { class: 'mira-header-avatar' }, [avatarImg(44, '', ''), el('span', { class: 'mira-dot', 'aria-hidden': 'true' })]);
    var panel = el('section', { class: 'mira-panel', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'mira-title', 'aria-describedby': 'mira-subtitle', tabindex: '-1', hidden: true }, [
      el('header', { class: 'mira-header' }, [
        headerAvatar,
        el('div', { class: 'mira-header-text' }, [
          el('h2', { class: 'mira-title', id: 'mira-title', text: 'Mira' }),
          el('p', { class: 'mira-subtitle', id: 'mira-subtitle', text: M.subtitle || '' })
        ]),
        iconBtn('restart', 'Restart conversation', function () { resetConversation(); input.focus(); }),
        iconBtn('minimise', 'Minimise chat', function () { minimise(); }),
        iconBtn('close', 'Close chat', function () { closeChat(); })
      ]),
      messages,
      el('div', { class: 'mira-footer' }, [form, errorMsg, waBar()])
    ]);
    root.appendChild(panel);

    /* State */
    var asked = {};
    var started = false;
    var busy = false;
    var timers = [];
    function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; busy = false; }

    /* Rendering */
    function botRow(contentNode) {
      return el('div', { class: 'mira-row mira-row--bot' }, [avatarImg(28, 'mira-row-avatar', ''), el('div', { class: 'mira-bubble mira-bubble--bot' }, [contentNode])]);
    }
    function userRow(text) {
      return el('div', { class: 'mira-row mira-row--user' }, [el('div', { class: 'mira-bubble mira-bubble--user' }, [el('span', { class: 'mira-sr', text: 'You: ' }), text])]);
    }
    function linkButton(key) {
      var L = LINKS[key];
      if (!L) return null;
      if (L.whatsapp) {
        if (!hasWa) return null;
        var a = el('a', { class: 'mira-link mira-link--wa', href: waUrl, target: '_blank', rel: 'noopener noreferrer' }, [L.label || 'WhatsApp', el('span', { class: 'mira-sr', text: ' (opens in a new tab)' })]);
        a.insertAdjacentHTML('afterbegin', ICONS.wa);
        return a;
      }
      var link = el('a', { class: 'mira-link', href: L.href, onclick: function (e) { navigate(e, L.href); } }, [L.label]);
      link.insertAdjacentHTML('beforeend', ICONS.arrow);
      return link;
    }
    function linksBlock(keys) {
      var nodes = (keys || []).map(linkButton).filter(Boolean);
      if (!nodes.length) return null;
      return el('div', { class: 'mira-block' }, [el('div', { class: 'mira-chips' }, nodes)]);
    }
    function questionButton(item) {
      return el('button', { type: 'button', class: 'mira-q', text: item.q, onclick: function () { ask(item.q, item); } });
    }
    function suggestionsBlock(list, label, collapse) {
      if (!list.length) return null;
      var chips = el('div', { class: 'mira-chips' });
      var shown = collapse ? list.slice(0, collapsed) : list;
      shown.forEach(function (item) { chips.appendChild(questionButton(item)); });
      if (collapse && list.length > collapsed) {
        var more = el('button', { type: 'button', class: 'mira-more', 'aria-expanded': 'false', text: (M.showAll || 'Show all {n} questions').replace('{n}', list.length) });
        more.addEventListener('click', function () {
          var expanded = more.getAttribute('aria-expanded') === 'true';
          chips.querySelectorAll('.mira-q').forEach(function (b, i) { if (i >= collapsed) b.remove(); });
          if (!expanded) {
            list.slice(collapsed).forEach(function (item) { chips.insertBefore(questionButton(item), more); });
            more.textContent = M.showLess || 'Show fewer questions';
            more.setAttribute('aria-expanded', 'true');
            var first = chips.querySelectorAll('.mira-q')[collapsed];
            if (first) first.focus();
          } else {
            more.textContent = (M.showAll || 'Show all {n} questions').replace('{n}', list.length);
            more.setAttribute('aria-expanded', 'false');
          }
        });
        chips.appendChild(more);
      }
      var block = el('div', { class: 'mira-block mira-suggestions' });
      if (label) block.appendChild(el('p', { class: 'mira-block-label', text: label }));
      block.appendChild(chips);
      return block;
    }
    function removeOldSuggestions() {
      messages.querySelectorAll('.mira-suggestions').forEach(function (n) { n.remove(); });
    }
    function scrollToNode(node) {
      var top = node.offsetTop - 12;
      if (messages.scrollTo) messages.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      else messages.scrollTop = top;
    }

    function resetConversation() {
      clearTimers();
      asked = {};
      messages.textContent = '';
      clearError();
      input.value = '';
      messages.appendChild(botRow(el('p', { text: M.welcome || '' })));
      messages.appendChild(suggestionsBlock(QA, '', true));
      messages.scrollTop = 0;
      started = true;
    }

    function ask(text, item) {
      if (busy) return;
      busy = true;
      removeOldSuggestions();
      var match = item || findAnswer(text);
      var uRow = userRow(text);
      messages.appendChild(uRow);
      var typing = botRow(el('span', { class: 'mira-typing', 'aria-label': 'Mira is typing' }, [el('span'), el('span'), el('span')]));
      typing.querySelector('.mira-bubble').style.padding = '0';
      messages.appendChild(typing);
      scrollToNode(uRow);
      later(function () {
        typing.remove();
        if (match) {
          asked[match.id] = true;
          messages.appendChild(botRow(el('p', { text: match.a })));
          var lb = linksBlock(match.links);
          if (lb) messages.appendChild(lb);
        } else {
          messages.appendChild(botRow(el('p', { text: M.fallback || '' })));
          var fb = linksBlock(['contact', 'whatsapp']);
          if (fb) messages.appendChild(fb);
        }
        var rest = QA.filter(function (q) { return !asked[q.id]; });
        var sug = suggestionsBlock(rest.slice(0, 4), M.alsoAsk || 'You can also ask', false);
        if (sug) messages.appendChild(sug);
        scrollToNode(uRow);
        busy = false;
      }, reduceMotion ? 150 : 550);
    }

    function clearError() { errorMsg.textContent = ''; input.classList.remove('mira-invalid'); input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) {
        input.classList.add('mira-invalid');
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', 'mira-error');
        errorMsg.textContent = M.emptyError || 'Please type a question first\u2026';
        input.focus();
        return;
      }
      if (busy) return;
      clearError();
      input.value = '';
      ask(text, null);
    });
    input.addEventListener('input', function () { if (input.value.trim()) clearError(); });

    /* Open / minimise / close */
    var lastOpener = launcher;
    function openChat(opener) {
      lastOpener = opener || launcher;
      if (!started) resetConversation();
      panel.hidden = false;
      launcher.setAttribute('aria-expanded', 'true');
      if (isMobile()) launcherWrap.hidden = true;
      setTimeout(function () { panel.focus({ preventScroll: true }); }, 30);
    }
    function hidePanel() {
      panel.hidden = true;
      launcherWrap.hidden = false;
      launcher.setAttribute('aria-expanded', 'false');
      var target = (lastOpener && lastOpener.isConnected) ? lastOpener : launcher;
      try { target.focus({ preventScroll: lastOpener !== launcher ? false : true }); } catch (err) { /* ignore */ }
    }
    function minimise() { hidePanel(); }
    function closeChat() { clearTimers(); started = false; messages.textContent = ''; hidePanel(); }

    launcher.addEventListener('click', function () { if (panel.hidden) openChat(launcher); else minimise(); });
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); minimise(); } });

    /* In-site links: let the React router handle them without a full reload */
    function navigate(e, href) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!/^\/(?!\/)/.test(href)) return; // tel:, mailto:, external -> browser default
      e.preventDefault();
      if (location.pathname + location.search !== href) {
        history.pushState({}, '', href);
        window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
      }
      if (isMobile()) minimise();
    }

    /* ---------- Homepage introduction card ---------- */
    function mountCard(slot) {
      if (!slot || slot.shadowRoot) return;
      var sr = slot.attachShadow({ mode: 'open' });
      sr.appendChild(styleLink());
      var chatBtn = el('button', { type: 'button', class: 'mira-btn mira-btn--dark' }, ['Chat Now']);
      chatBtn.insertAdjacentHTML('afterbegin', ICONS.chat);
      chatBtn.addEventListener('click', function () { openChat(chatBtn); });
      var actions = el('div', { class: 'mira-card-actions' }, [chatBtn]);
      if (hasWa) {
        var wa = el('a', { class: 'mira-btn mira-btn--outline', href: waUrl, target: '_blank', rel: 'noopener noreferrer' }, ['WhatsApp', el('span', { class: 'mira-sr', text: ' (opens in a new tab)' })]);
        wa.insertAdjacentHTML('afterbegin', ICONS.wa);
        actions.appendChild(wa);
      }
      var card = el('div', { class: 'mira-card' }, [
        el('div', { class: 'mira-card-body' }, [
          M.introEyebrow ? el('p', { class: 'mira-eyebrow', text: M.introEyebrow }) : null,
          el('h2', { class: 'mira-card-title', text: M.introHeading || '' }),
          el('p', { class: 'mira-card-text', text: M.introText || '' }),
          actions
        ]),
        el('figure', { class: 'mira-card-figure' }, [avatarImg(230, '', 'Mira, the ' + (cfg.siteName || '') + ' virtual assistant')])
      ]);
      sr.appendChild(el('section', { class: 'mira-card-wrap', 'aria-label': 'Meet Mira' }, [card]));
      if (reduceMotion || !('IntersectionObserver' in window)) { card.classList.add('mira-in'); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { card.classList.add('mira-in'); io.disconnect(); } });
      }, { threshold: 0.15 });
      io.observe(card);
    }
    function checkSlot() { var s = document.getElementById('mira-intro-slot'); if (s && !s.shadowRoot) mountCard(s); }
    checkSlot();
    // The homepage is a single-page app: the slot appears again whenever the visitor returns to Home.
    var pending = false;
    new MutationObserver(function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () { pending = false; checkSlot(); });
    }).observe(document.body, { childList: true, subtree: true });
  }

  function start() { if (document.body) loadData(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
