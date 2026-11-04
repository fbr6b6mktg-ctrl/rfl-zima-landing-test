/*
 * Логика страницы. Тексты здесь не правьте — они в config.js.
 */
(function () {
  'use strict';

  var C = window.CONFIG;

  /* ---------- Яндекс Метрика (номер счётчика — в config.js) ---------- */
  if (false) (function (m, e, t, r, i, k, a) {
    m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
    m[i].l = 1 * new Date();
    k = e.createElement(t); a = e.getElementsByTagName(t)[0];
    k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
  if (false) window.ym(C.metrikaId, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true
  });
  var price = C.discountActive ? C.priceEarly : C.priceFull;

  /* ---------- Яндекс Метрика: цели ---------- */

  function goal(name) {
    try { window.ym(C.metrikaId, 'reachGoal', name); } catch (e) { /* Метрика заблокирована — не страшно */ }
  }

  /* ---------- Подстановка текстов ---------- */

  function fill(str) {
    return String(str)
      .replace(/\{price\}/g, price)
      .replace(/\{oldPrice\}/g, C.priceFull)
      .replace(/\{phone\}/g, C.phoneDisplay);
  }

  function get(path) {
    return path.split('.').reduce(function (o, k) { return o && o[k]; }, C);
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  $$('[data-c]').forEach(function (el) {
    var v = get(el.getAttribute('data-c'));
    if (v != null) el.textContent = fill(v).replace('|', ' ');
  });
  // Знак ₽ — отдельным шрифтом: в шрифте заголовков его нет
  function rub(str) { return esc(str).replace(/₽/g, '<span class="rub">₽</span>'); }

  // Двухцветные заголовки: до | — золотая строка, после — белая
  $$('[data-t]').forEach(function (el) {
    var parts = fill(get(el.getAttribute('data-t'))).split('|');
    el.innerHTML = parts.length > 1
      ? '<span class="t-gold">' + rub(parts[0]) + '</span> <span class="t-white">' + rub(parts.slice(1).join(' ')) + '</span>'
      : '<span class="t-white">' + rub(parts[0]) + '</span>';
  });

  $('#hero-chips').innerHTML = C.hero.chips.map(function (c) {
    return '<span class="chip">' + esc(c) + '</span>';
  }).join('') + (C.hero.chipDark ? '<span class="chip chip--dark">' + esc(C.hero.chipDark) + '</span>' : '');

  $$('[data-price]').forEach(function (el) { el.innerHTML = rub(C.priceEarly); });

  // Короткие факты: строка под первым экраном и вертикальная полоса слева
  $('#facts').innerHTML = C.hero.facts.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
  $('#side-strip').innerHTML = C.hero.facts.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');

  // Обратный отсчёт до конца приёма заявок
  var cdEnd = C.discountActive && C.countdownTo ? new Date(C.countdownTo).getTime() : NaN;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tickCountdown() {
    var left = Math.floor((cdEnd - Date.now()) / 1000);
    if (!(left > 0)) { $('#countdown').hidden = true; return false; }
    $('#countdown').hidden = false;
    $('#cd-d').textContent = pad(Math.floor(left / 86400));
    $('#cd-h').textContent = pad(Math.floor(left % 86400 / 3600));
    $('#cd-m').textContent = pad(Math.floor(left % 3600 / 60));
    $('#cd-s').textContent = pad(left % 60);
    return true;
  }
  if ($('#countdown') && tickCountdown()) setInterval(tickCountdown, 1000);
  $$('[data-old-price]').forEach(function (el) { el.textContent = C.priceFull; });
  $$('[data-phone-text]').forEach(function (el) { el.textContent = C.phoneDisplay; });
  $$('[data-tel]').forEach(function (el) { el.href = 'tel:' + C.phoneTel; });
  $$('[data-vk]').forEach(function (el) { el.href = C.vkBotUrl; });
  $$('[data-telegram]').forEach(function (el) { el.href = C.telegramUrl; });
  $$('[data-privacy]').forEach(function (el) { el.href = C.privacyUrl; });
  $$('[data-email]').forEach(function (el) { el.href = 'mailto:' + C.email; el.textContent = C.email; });
  $$('[data-link]').forEach(function (el) { el.href = C[el.getAttribute('data-link')]; });
  if (!C.discountActive) $$('[data-discount-only]').forEach(function (el) { el.remove(); });

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Блоки из списков ---------- */

  $('#divs-list').innerHTML = C.divisions.items.map(function (d) {
    return '<article class="div-card reveal">' +
      '<img src="' + esc(d.photo) + '" alt="' + esc(d.photoAlt) + '" width="1100" height="733" loading="lazy" decoding="async">' +
      '<div class="div-card__body">' +
        '<h3 class="h3">' + esc(d.name) + '</h3>' +
        '<p class="div-card__addr">' + esc(d.address) + '</p>' +
        '<p class="div-card__note">' + esc(d.note) + '</p>' +
      '</div></article>';
  }).join('');

  $('#terms-list').innerHTML = C.terms.items.map(function (t) {
    var text = (!C.discountActive && t.textNoDiscount) ? t.textNoDiscount : t.text;
    return '<div class="tile reveal"><p class="label">' + esc(t.label) + '</p>' +
      '<p class="tile__text">' + esc(fill(text)) + '</p></div>';
  }).join('');

  // Линейные иконки по порядку пунктов в config.js
  var icons = [
    // манеж
    '<path d="M3 20V10l9-6 9 6v10"/><path d="M3 20h18"/><path d="M9 20v-5h6v5"/>',
    // свисток
    '<circle cx="9" cy="14" r="5"/><path d="M12.5 10.5L20 6v4l-5.5 2"/><circle cx="9" cy="14" r="1.2"/>',
    // камера
    '<rect x="3" y="7" width="13" height="10" rx="2"/><path d="M16 11l5-3v8l-5-3"/>',
    // профиль игрока
    '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M17 10v8M20 7v11"/>',
    // фото
    '<rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>',
    // кубок
    '<path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/><path d="M12 14v3M8 20h8M9.5 17h5"/>'
  ];
  $('#benefits-list').innerHTML = C.benefits.items.map(function (b, i) {
    return '<li class="benefit reveal"><svg viewBox="0 0 24 24" aria-hidden="true">' + (icons[i] || icons[0]) + '</svg>' +
      '<span>' + esc(b) + '</span></li>';
  }).join('');

  $('#steps-list').innerHTML = C.steps.items.map(function (s, i) {
    return '<li class="step reveal"><span class="step__num" aria-hidden="true">' + (i + 1) + '</span>' +
      '<p>' + esc(fill(s)) + '</p></li>';
  }).join('');

  // Галерея манежей и фото с матчей: превью name.webp, крупно — name-full.webp
  // sizes — ширина фото на экране: браузер сам выберет превью или крупную версию
  function photoBtn(name, caption, extra, sizes) {
    var n = 'assets/img/' + esc(name);
    var set = sizes ? ' srcset="' + n + '.webp 900w, ' + n + '-full.webp 1800w" sizes="' + sizes + '"' : '';
    return '<button type="button" class="photo" data-full="' + n + '-full.webp" data-cap="' + esc(caption) + '">' +
      '<img src="' + n + '.webp"' + set + ' alt="' + esc(caption) + '" loading="lazy" decoding="async">' +
      (extra || '') + '</button>';
  }
  $('#gallery-list').innerHTML = C.gallery.items.map(function (g) {
    var cap = g.caption + ' · ' + g.place;
    return '<figure class="gallery__item reveal' + (g.wide ? ' gallery__item--wide' : '') + '">' +
      photoBtn(g.photo, cap, '<figcaption><span class="label">' + esc(g.place) + '</span>' + esc(g.caption) + '</figcaption>') +
      '</figure>';
  }).join('');
  // Карусель фото с матчей: свайп, стрелки и точки
  var track = $('#match-photos');
  track.innerHTML = C.benefits.photos.map(function (m) {
    return '<div class="carousel__slide">' + photoBtn(m.photo, m.alt, '', '(min-width: 760px) 840px, 88vw') + '</div>';
  }).join('');
  $('#match-dots').innerHTML = C.benefits.photos.map(function (m, i) {
    return '<button type="button" aria-label="Фото ' + (i + 1) + '"></button>';
  }).join('');
  function slideW() { return track.firstElementChild.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0); }
  function current() { return Math.round(track.scrollLeft / slideW()); }
  function goTo(i) {
    var n = C.benefits.photos.length;
    i = (i + n) % n;
    track.scrollTo({ left: i * slideW(), behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  function markDot() {
    var i = current();
    $$('#match-dots button').forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
  }
  $('.carousel__btn--prev').addEventListener('click', function () { goTo(current() - 1); });
  $('.carousel__btn--next').addEventListener('click', function () { goTo(current() + 1); });
  $$('#match-dots button').forEach(function (d, k) { d.addEventListener('click', function () { goTo(k); }); });
  track.addEventListener('scroll', function () { window.requestAnimationFrame(markDot); }, { passive: true });
  markDot();

  // Просмотр фото крупно
  var viewer = $('#viewer');
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.photo');
    if (!b || !viewer.showModal) return;
    $('#viewer-img').src = b.getAttribute('data-full');
    $('#viewer-img').alt = b.getAttribute('data-cap');
    $('#viewer-cap').textContent = b.getAttribute('data-cap');
    viewer.showModal();
  });
  viewer.addEventListener('click', function (e) {
    if (e.target === viewer || e.target.classList.contains('viewer__close')) viewer.close();
  });

  /* ---------- Плавная прокрутка к форме ---------- */


  $$('a[href="#zayavka"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      $('#zayavka').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Цели по кликам VK и телефона ---------- */

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    if (a.hasAttribute('data-vk')) goal('zima_vk');
    else if ((a.getAttribute('href') || '').indexOf('tel:') === 0) goal('zima_phone');
  });

  /* ---------- Появление блоков и липкая кнопка ---------- */

  if ('IntersectionObserver' in window && !reduceMotion) {
    document.documentElement.classList.add('js-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  }

  var sticky = $('#sticky');
  if ('IntersectionObserver' in window) {
    var heroVisible = true, formVisible = false;
    var update = function () {
      var show = !heroVisible && !formVisible;
      sticky.classList.toggle('is-on', show);
      sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
      sticky.querySelector('a').tabIndex = show ? 0 : -1;
    };
    new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; update(); })
      .observe($('#hero'));
    new IntersectionObserver(function (en) { formVisible = en[0].isIntersecting; update(); })
      .observe($('#zayavka'));
  }

  /* ---------- Яндекс Форма ---------- */

  // Передаём в форму метки рекламы из адреса страницы (скрытые вопросы с такими же идентификаторами)
  var box = $('#form-box');
  var params = new URLSearchParams(location.search);
  var formUrl = (C.yandexFormUrl || '').trim();

  if (!formUrl) {
    $('#form-off').hidden = false;
  } else {
    var src = new URL(formUrl);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid'].forEach(function (k) {
      if (params.get(k)) src.searchParams.set(k, params.get(k));
    });
    src.searchParams.set('page', location.href.split('?')[0].split('#')[0]);
    src.searchParams.set('iframe', '1');

    var frame = document.createElement('iframe');
    frame.src = src.toString();
    frame.title = 'Форма заявки';
    frame.className = 'form-frame';
    frame.loading = 'lazy';
    frame.name = 'ya-form-' + src.pathname.split('/').filter(Boolean).pop();
    box.appendChild(frame);

    // После успешной отправки Яндекс Форма сообщает странице {"message":"sent"} —
    // только тогда отправляем цель zima_form
    var sent = false;
    window.addEventListener('message', function (e) {
      if (sent || e.origin !== 'https://forms.yandex.ru' || e.source !== frame.contentWindow) return;
      var data = e.data;
      try { if (typeof data === 'string') data = JSON.parse(data); } catch (err) { return; }
      if (data && data.message === 'sent') { sent = true; goal('zima_form'); }
    });

    // Скрипт Яндекса сам подгоняет высоту окна формы под содержимое
    var s = document.createElement('script');
    s.src = 'https://forms.yandex.ru/_static/embed.js';
    s.async = true;
    document.body.appendChild(s);
  }

})();
