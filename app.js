(() => {
  const products = window.DDS_PRODUCTS || [];
  const cart = new Map();
  const $ = (s) => document.querySelector(s);
  const money = n => 'Rp' + Number(n).toLocaleString('id-ID');
  const drawer = $('#cartDrawer'), overlay = $('#cartOverlay');
  let toastTimer;
  function showCartToast(name) {
    const toast = $('#cartToast');
    if (!toast) return;
    $('#cartToastText').textContent = name + ' ditambahkan.';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1500);
  }
  const setDrawer = open => {
    drawer.classList.toggle('open', open); overlay.classList.toggle('show', open);
    drawer.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('no-scroll', open);
  };
  const count = () => [...cart.values()].reduce((a,b)=>a+b,0);
  const total = () => products.reduce((sum,p)=>sum + p.price*(cart.get(p.id)||0),0);
  function renderCart() {
    $('#cartCount').textContent = count();
    $('#cartTotal').textContent = money(total());
    const host = $('#cartItems');
    if (!cart.size) { host.innerHTML = '<div class="cart-empty">Keranjang masih kosong.<br>Pilih produk dari katalog.</div>'; syncSelectedCards(); return; }
    host.innerHTML = '';
    products.filter(p=>cart.has(p.id)).forEach(p=>{
      const qty=cart.get(p.id), row=document.createElement('div'); row.className='cart-row';
      row.innerHTML = `<div class="cart-item-icon"><img src="${p.image || 'cash.webp'}" alt="" loading="eager" onerror="this.onerror=null;this.src='cash.webp';"></div><div class="cart-item-main"><b></b><small>${money(p.price)} / item</small><div class="qty"><button data-action="minus" data-id="${p.id}" aria-label="Kurangi">−</button><span>${qty}</span><button data-action="plus" data-id="${p.id}" aria-label="Tambah">+</button></div></div><strong>${money(p.price*qty)}</strong>`;
      row.querySelector('b').textContent=p.name; host.appendChild(row);
    });
    syncSelectedCards();
  }
  function syncSelectedCards() {
    document.querySelectorAll('.product-card[data-id]').forEach(card => {
      const qty = cart.get(Number(card.dataset.id)) || 0;
      card.classList.toggle('selected', qty > 0);
      const badge = card.querySelector('.selected-qty');
      if (badge) { badge.hidden = qty < 1; badge.textContent = 'x' + qty; }
      card.setAttribute('aria-pressed', String(qty > 0));
    });
  }
  function chooseProduct(card) {
    if (!card || card.hidden) return;
    const id = Number(card.dataset.id);
    const next = (cart.get(id) || 0) + 1;
    if (next > 20) { showCartToast('Maksimal 20 item per produk'); return; }
    cart.set(id, next);
    renderCart();
    syncSelectedCards();
    const title = card.querySelector('h3')?.textContent || 'Produk';
    showCartToast(title + ' · x' + next);
  }
  document.addEventListener('click', e=>{
    const card = e.target.closest('.product-card[data-id]');
    if (card && !e.target.closest('a,button,input,select,textarea')) { chooseProduct(card); return; }
    const q=e.target.closest('[data-action]');
    if(q){const id=Number(q.dataset.id), next=(cart.get(id)||0)+(q.dataset.action==='plus'?1:-1);if(next<=0)cart.delete(id);else cart.set(id,Math.min(20,next));renderCart();syncSelectedCards();}
  });
  document.querySelectorAll('.product-card[data-id]').forEach(card => card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chooseProduct(card); }
  }));
  $('#openCart').addEventListener('click',()=>setDrawer(true));
  $('#closeCart').addEventListener('click',()=>setDrawer(false));
  overlay.addEventListener('click',()=>setDrawer(false));
  const checkout=$('#checkoutModal');
  $('#checkoutBtn').addEventListener('click',()=>{
    if(!cart.size){$('#cartItems').innerHTML='<div class="cart-empty">Pilih minimal satu produk sebelum checkout.</div>';return;}
    $('#cartJson').value=JSON.stringify(Object.fromEntries(cart));
    $('#checkoutTotal').textContent=money(total()); checkout.classList.add('show'); setDrawer(false);
  });
  $('#closeCheckout').addEventListener('click',()=>checkout.classList.remove('show'));
  checkout.addEventListener('click',e=>{if(e.target===checkout)checkout.classList.remove('show')});
  const qris=$('#qrisModal');
  const showQris=()=>qris.classList.add('show');
  $('#closeQris').addEventListener('click',()=>qris.classList.remove('show'));
  $('#closeQris2').addEventListener('click',()=>qris.classList.remove('show'));
  qris.addEventListener('click',e=>{if(e.target===qris)qris.classList.remove('show')});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){setDrawer(false);checkout.classList.remove('show');qris.classList.remove('show')}});
  // QRIS can be opened with an explicit button; selecting QRIS keeps checkout visible.
  document.querySelectorAll('input[name="payment_method"]').forEach(r=>r.addEventListener('change',()=>{}));
  const qrisButton = document.createElement('button');
  qrisButton.type = 'button'; qrisButton.className = 'btn ghost full'; qrisButton.textContent = 'Tampilkan QRIS toko';
  qrisButton.addEventListener('click', showQris);
  const paymentChoice = document.querySelector('.payment-choice');
  if (paymentChoice) paymentChoice.insertAdjacentElement('afterend', qrisButton);
  const filters=[...document.querySelectorAll('.filter')];
  let active='ALL';
  function applyFilters(){
    const term=$('#searchInput').value.trim().toLowerCase();let visible=0;
    document.querySelectorAll('.product-card').forEach(card=>{
      const matchCategory=active==='ALL'||card.dataset.category===active;
      const matchText=card.dataset.name.includes(term);
      card.hidden=!(matchCategory&&matchText);if(!card.hidden)visible++;
    });
    $('#emptyState').hidden=visible>0;
  }
  filters.forEach(btn=>btn.addEventListener('click',()=>{active=btn.dataset.filter;filters.forEach(b=>b.classList.toggle('active',b===btn));applyFilters()}));
  $('#searchInput').addEventListener('input',applyFilters);
  // Hero carousel: responsive sizing, autoplay every 3 seconds, desktop arrows only.
  const heroCarousel = document.querySelector('[data-carousel]');
  if (heroCarousel) {
    const track = heroCarousel.querySelector('.hero-carousel-track');
    const slides = [...heroCarousel.querySelectorAll('.hero-slide')];
    const dotsWrap = heroCarousel.querySelector('.hero-carousel-dots');
    const prevButton = heroCarousel.querySelector('.hero-carousel-prev');
    const nextButton = heroCarousel.querySelector('.hero-carousel-next');
    let slideIndex = 0;
    let autoplay = null;
    let touchStartX = null;

    function measureSlides() {
      const width = heroCarousel.getBoundingClientRect().width;
      slides.forEach(slide => { slide.style.width = `${width}px`; });
      track.style.width = `${width * slides.length}px`;
      track.style.transform = `translate3d(-${slideIndex * width}px,0,0)`;
    }
    const dots = slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'hero-carousel-dot';
      dot.setAttribute('aria-label', `Tampilkan gambar ${i + 1}`);
      dot.addEventListener('click', () => { goToSlide(i); startAutoplay(); });
      dotsWrap.appendChild(dot);
      return dot;
    });
    function goToSlide(index) {
      slideIndex = (index + slides.length) % slides.length;
      const width = heroCarousel.getBoundingClientRect().width;
      track.style.transform = `translate3d(-${slideIndex * width}px,0,0)`;
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === slideIndex);
        dot.setAttribute('aria-current', i === slideIndex ? 'true' : 'false');
      });
    }
    function stopAutoplay() { if (autoplay !== null) window.clearInterval(autoplay); autoplay = null; }
    function startAutoplay() {
      stopAutoplay();
      autoplay = window.setInterval(() => goToSlide(slideIndex + 1), 3000);
    }
    prevButton?.addEventListener('click', () => { goToSlide(slideIndex - 1); startAutoplay(); });
    nextButton?.addEventListener('click', () => { goToSlide(slideIndex + 1); startAutoplay(); });
    heroCarousel.addEventListener('mouseenter', stopAutoplay);
    heroCarousel.addEventListener('mouseleave', startAutoplay);
    heroCarousel.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; stopAutoplay(); }, {passive:true});
    heroCarousel.addEventListener('touchend', e => {
      if (touchStartX !== null) {
        const delta = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) > 40) goToSlide(slideIndex + (delta < 0 ? 1 : -1));
      }
      touchStartX = null;
      startAutoplay();
    }, {passive:true});
    // Re-measure after layout and when viewport changes, avoiding zero-height/width mobile slides.
    requestAnimationFrame(() => { measureSlides(); goToSlide(0); startAutoplay(); });
    window.addEventListener('resize', () => { measureSlides(); goToSlide(slideIndex); });
    if ('ResizeObserver' in window) new ResizeObserver(() => { measureSlides(); goToSlide(slideIndex); }).observe(heroCarousel);
  }

  renderCart();

  // Static checkout: no server/database required. The order is sent directly to WhatsApp.
  $('#checkoutForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!cart.size) return;
    const form = e.currentTarget;
    const name = form.querySelector('[name="customer_name"]').value.trim();
    const username = form.querySelector('[name="roblox_username"]').value.trim();
    const phone = form.querySelector('[name="customer_whatsapp"]').value.trim();
    const method = form.querySelector('[name="payment_method"]:checked')?.value || 'QRIS';
    if (!name || !username || !phone) { form.reportValidity(); return; }

    const orderCode = 'LOX' + new Date().toISOString().slice(2,10).replaceAll('-','') +
      '-' + Math.random().toString(36).slice(2,8).toUpperCase();
    const items = products.filter(p => cart.has(p.id)).map(p => {
      const qty = cart.get(p.id);
      return { name: p.name, qty, subtotal: p.price * qty };
    });
    const orderTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const lines = items.map(item => '- ' + item.name + ' x' + item.qty + ' = ' + money(item.subtotal));
    const message = `Halo admin ${window.STORE_NAME || 'Loxstore'}, saya ingin memesan:\n\n` +
      `Kode pesanan: ${orderCode}\nNama: ${name}\nUsername Roblox: ${username}\nWhatsApp pembeli: ${phone}\n\n` +
      lines.join('\n') + `\n\nTOTAL: ${money(orderTotal)}\nMetode: ` +
      (method === 'QRIS' ? 'QRIS (saya akan mengirim bukti pembayaran)' : 'Konfirmasi via WhatsApp') +
      '\n\nMohon konfirmasi pesanan saya.';
    window.location.href = 'https://wa.me/' + window.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
  });

})();