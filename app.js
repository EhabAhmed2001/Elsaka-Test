document.addEventListener("DOMContentLoaded", () => {
  const navLinks = [...document.querySelectorAll('.site-navbar .nav-link[href^="#"]')];
  const sections = [...document.querySelectorAll('[data-section]')];
  const navCollapse = document.getElementById('mainNav');
  document.getElementById("current-year").textContent = new Date().getFullYear();

  // Highlight the navigation item that matches the section in view.
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-28% 0px -58% 0px', threshold: 0 });
  sections.forEach(section => sectionObserver.observe(section));

  // Close the mobile menu after selecting a section.
  navLinks.forEach(link => link.addEventListener('click', () => {
    if (window.bootstrap && navCollapse.classList.contains('show')) {
      bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
    }
  }));

  // Back-to-top visibility.
  const backToTop = document.getElementById('backToTop');
  const updateBackToTop = () => backToTop.classList.toggle('visible', window.scrollY > 500);
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  updateBackToTop();
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Build a larger preview for the illustrative WhatsApp review cards.
  const reviewModal = document.getElementById('reviewModal');
  const reviewModalBody = document.getElementById('reviewModalBody');
  document.querySelectorAll('.review-shot').forEach(card => {
    card.addEventListener('click', () => {
      const clone = card.cloneNode(true);
      clone.classList.remove('review-shot');
      clone.classList.add('modal-chat-preview');
      clone.querySelector('.zoom-hint')?.remove();
      reviewModalBody.replaceChildren(clone);
      if (window.bootstrap) bootstrap.Modal.getOrCreateInstance(reviewModal).show();
    });
  });
});
