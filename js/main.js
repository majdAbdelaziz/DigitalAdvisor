'use strict';

// ─── Nav ───
const nav = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (nav) window.addEventListener('scroll', () => {
  nav.style.boxShadow = window.scrollY > 20 ? '0 2px 24px rgba(83,74,183,0.12)' : 'none';
});

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('open');
    }
  });
}

// ─── Active nav link ───
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(l => {
  if (l.getAttribute('href') === currentPage) l.classList.add('active');
});

// ─── Scroll reveal ───
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll(
  '.tool-card, .blog-card, .how-step, .tool-page-card, .acc-item'
).forEach(el => {
  el.style.cssText += 'opacity:0; transform:translateY(18px); transition:opacity 0.45s ease, transform 0.45s ease;';
  revealObserver.observe(el);
});

// ─── Counter animation ───
function animateCounter(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
  const duration = 1400;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    el.textContent = prefix + current.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

// ─── Red-flag keyword engine ───
const RED_FLAGS = [
  { patterns: ['ضمان','مضمون','مضمونة','guaranteed'], weight: 3, label: 'وعد بضمان الأرباح', level: 'danger' },
  { patterns: ['100%','مئة بالمئة','zero risk','بدون مخاطر'], weight: 3, label: 'ادعاء غياب المخاطر', level: 'danger' },
  { patterns: ['ينتهي الليلة','عرض محدود','أسرع','لا تفوت','فرصة لن تتكرر'], weight: 2, label: 'ضغط الإلحاح الزائف', level: 'danger' },
  { patterns: ['vip','في آي بي','حصري','سري','خاص جداً'], weight: 2, label: 'ادعاء الحصرية المصطنعة', level: 'warn' },
  { patterns: ['روبوت','بوت تداول','خوارزمية سرية'], weight: 2, label: 'ادعاء روبوت ذكاء اصطناعي سحري', level: 'warn' },
  { patterns: ['أرباح يومية','ربح يومي','daily profit'], weight: 2, label: 'وعد بأرباح يومية', level: 'danger' },
  { patterns: ['خبير دولي','معتمد دولياً','خبير معتمد'], weight: 1, label: 'ادعاء شهادات مبالغ فيها', level: 'warn' },
  { patterns: ['سحب في أي وقت','سحب فوري'], weight: 1, label: 'وعد سحب غير مقيد', level: 'warn' },
  { patterns: ['ضاعف','مضاعفة','double','10x','100x'], weight: 2, label: 'وعد بمضاعفة غير واقعية', level: 'danger' },
  { patterns: ['نقل الآن','حول الآن','ادفع رسوم'], weight: 3, label: 'طلب دفع مسبق', level: 'danger' },
];

function analyzeText(text) {
  const lower = text.toLowerCase();
  let score = 0;
  const found = [];

  RED_FLAGS.forEach(f => {
    f.patterns.forEach(p => {
      if (lower.includes(p.toLowerCase()) && !found.find(x => x.label === f.label)) {
        score += f.weight;
        found.push({ label: f.label, level: f.level });
      }
    });
  });

  return { score, found };
}

// ─── Tool: Analyzer ───
const analyzerBtn = document.getElementById('analyzerBtn');
if (analyzerBtn) {
  analyzerBtn.addEventListener('click', () => {
    const text = document.getElementById('analyzerInput').value.trim();
    const result = document.getElementById('analyzerResult');
    if (!text) {
      result.className = 'result-box show result-warn';
      result.textContent = '⚠️ الرجاء إدخال نص للتحليل.';
      return;
    }
    const { score, found } = analyzeText(text);
    result.className = 'result-box show';
    if (score === 0) {
      result.className += ' result-safe';
      result.innerHTML = '✅ <strong>لم تُكتشف مؤشرات احتيال واضحة.</strong> هذا لا يعني الأمان المطلق — تحقق دائماً من ترخيص المنصة.';
    } else if (score <= 3) {
      result.className += ' result-warn';
      result.innerHTML = `⚠️ <strong>مؤشرات تحذيرية:</strong> ${found.map(f => f.label).join(' · ')}<br>يُنصح بالتحقق المعمّق قبل أي قرار.`;
    } else {
      result.className += ' result-danger';
      result.innerHTML = `🚨 <strong>خطر عالٍ — ${score} نقاط خطر:</strong> ${found.map(f => f.label).join(' · ')}<br>لا تستثمر قبل التحقق الكامل.`;
    }
  });
}

// ─── Tool: Danger Meter ───
const meterBtn = document.getElementById('meterBtn');
if (meterBtn) {
  meterBtn.addEventListener('click', () => {
    let score = 0;
    for (let i = 1; i <= 5; i++) {
      const sel = document.querySelector(`input[name="mq${i}"]:checked`);
      if (sel) score += parseInt(sel.value);
    }
    const result = document.getElementById('meterResult');
    result.className = 'result-box show';
    if (score <= 1) {
      result.className += ' result-safe';
      result.innerHTML = `✅ <strong>مستوى الخطر: منخفض (${score}/5)</strong> — العرض يحمل مؤشرات أولية إيجابية. لكن تحقق دائماً من الترخيص.`;
    } else if (score <= 3) {
      result.className += ' result-warn';
      result.innerHTML = `⚠️ <strong>مستوى الخطر: متوسط (${score}/5)</strong> — لا تستثمر قبل تحقق عميق واستشارة محايدة.`;
    } else {
      result.className += ' result-danger';
      result.innerHTML = `🚨 <strong>مستوى الخطر: عالٍ جداً (${score}/5)</strong> — كل المؤشرات تشير للاحتيال. ابتعد فوراً.`;
    }
  });
}

// ─── Tool: Contract Checker ───
const contractBtn = document.getElementById('contractBtn');
if (contractBtn) {
  contractBtn.addEventListener('click', () => {
    const text = document.getElementById('contractInput').value.trim();
    const result = document.getElementById('contractResult');
    if (!text) {
      result.className = 'result-box show result-warn';
      result.textContent = '⚠️ الرجاء إدخال نص العقد.';
      return;
    }
    const suspiciousclauses = [
      ['لا يُرد','لا يسترد','non-refundable'], 'بنود تمنع الاسترداد',
      ['تحكيم إلزامي','تحكيم حصري'], 'شرط تحكيم إلزامي يمنع التقاضي',
      ['يحق للشركة التعديل','التغيير دون إخطار'], 'حق تغيير الشروط دون إشعار',
      ['التزام صامت','بدون تدخل'], 'بنود ضبابية غير محددة',
    ];
    const lower = text.toLowerCase();
    const issues = [];
    if (lower.includes('لا يُرد') || lower.includes('لا يسترد')) issues.push('بنود تمنع استرداد الأموال');
    if (lower.includes('تحكيم')) issues.push('شرط تحكيم إلزامي — قد يمنع التقاضي');
    if (lower.includes('دون إخطار') || lower.includes('دون إشعار')) issues.push('حق تغيير الشروط دون إشعارك');
    if (lower.includes('ضمان') || lower.includes('مضمون')) issues.push('وعود بضمان غير قابلة للتحقق قانونياً');
    if (text.length < 100) {
      result.className = 'result-box show result-warn';
      result.innerHTML = '⚠️ النص قصير جداً للتحليل الدقيق. أدخل نص العقد كاملاً للحصول على نتائج موثوقة.';
      return;
    }
    result.className = 'result-box show';
    if (issues.length === 0) {
      result.className += ' result-safe';
      result.innerHTML = '✅ <strong>لم تُكتشف بنود مشبوهة واضحة.</strong> يُنصح بمراجعة محامٍ متخصص للتحقق الكامل.';
    } else {
      result.className += ' result-danger';
      result.innerHTML = `🚨 <strong>بنود تستدعي المراجعة:</strong><br>${issues.map(i => `• ${i}`).join('<br>')}`;
    }
  });
}
