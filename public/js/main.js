document.addEventListener('DOMContentLoaded', async () => {
  // Global App State
  let siteSettings = { email: 'info@sgshr.com', linkedinUrl: '#', phone: '99405 43980' };
  
  try {
    // Fetch dynamic contact data
    siteSettings = await API.getSettings();
  } catch (error) {
    console.error('Settings initialization failed:', error);
  }

  // 1. Inject Header
  renderHeader(siteSettings);
  
  // 2. Inject Footer
  renderFooter(siteSettings);
  
  // 3. Highlight Active Menu Link
  highlightActiveMenu();
  
  // 4. Initialize Mobile Navigation Menu
  initMobileMenu();

  // 5. Scroll Header Shadow Effect
  initHeaderScroll();

  // 6. Scroll Fade-in Animation (Intersection Observer)
  initScrollAnimations();

  // 7. Initialize Testimonial Slider if exists
  initTestimonialSlider();
  
  // Export toast helper to window
  window.showToast = showToast;
});

// Render dynamic site header navigation
function renderHeader(settings) {
  const headerContainer = document.getElementById('site-header');
  if (!headerContainer) return;

  const logoHtml = `<img src="images/logo_sgs.jpg" alt="SGS HR Logo" class="logo-img-header" style="max-height: 2.75rem; width: auto; object-fit: contain; margin-right: 0.75rem; border-radius: 4px;">`;

  headerContainer.innerHTML = `
    <header class="header" id="navbar">
      <div class="container header-container">
        <a href="index.html" class="logo">
          ${logoHtml}
          <div>
            <div class="logo-text">SGS HR</div>
            <span class="logo-subtext">Workforce Solutions</span>
          </div>
        </a>
        <nav class="nav" id="nav-menu">
          <a href="index.html" class="nav-link" data-page="index">Home</a>
          <a href="about.html" class="nav-link" data-page="about">About Us</a>
          <a href="services.html" class="nav-link" data-page="services">Services</a>
          <a href="careers.html" class="nav-link" data-page="careers">Careers</a>
          <a href="blog.html" class="nav-link" data-page="blog">Blog</a>
          <a href="contact.html" class="nav-link" data-page="contact">Contact</a>
        </nav>
        <button class="hamburger" id="hamburger-menu" aria-label="Toggle Navigation Menu">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>
      <div class="nav-overlay" id="nav-overlay"></div>
    </header>
  `;
}

// Render dynamic footer with loaded settings
function renderFooter(settings) {
  const footerContainer = document.getElementById('site-footer');
  if (!footerContainer) return;

  footerContainer.innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <a href="index.html" class="logo footer-logo">
              <img src="images/logo_sgs.jpg" alt="SGS HR Logo" style="max-height: 2.75rem; width: auto; object-fit: contain; margin-right: 0.75rem; border-radius: 4px;">
              <div>
                <div class="logo-text">SGS HR</div>
                <span class="logo-subtext">Workforce Solutions</span>
              </div>
            </a>
            <p class="footer-desc">
              SGS HR Workforce Solutions is a Chennai-based recruitment and career advisory firm. We bridge the gap between high-performing talent and exceptional organizations.
            </p>
            <div class="footer-socials">
              <a href="${settings.linkedinUrl}" target="_blank" rel="noopener noreferrer" class="footer-social-icon" aria-label="LinkedIn Profile">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 1.146C0 .513.52 0 1.146 0h13.708C15.488 0 16 .513 16 1.146v13.708c0 .633-.52 1.146-1.146 1.146H1.146C.52 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div class="footer-col">
            <h3 class="footer-title">Our Services</h3>
            <ul class="footer-links">
              <li><a href="services.html#strategic">Strategic Hiring</a></li>
              <li><a href="services.html#executive">Executive Search</a></li>
              <li><a href="services.html#leadership">Leadership Hiring</a></li>
              <li><a href="services.html#coaching">Career Coaching</a></li>
              <li><a href="services.html#training">Recruitment Training</a></li>
              <li><a href="services.html#webdev">Web Development</a></li>
            </ul>
          </div>
          
          <div class="footer-col">
            <h3 class="footer-title">Quick Links</h3>
            <ul class="footer-links">
              <li><a href="index.html">Home</a></li>
              <li><a href="about.html">About Us</a></li>
              <li><a href="services.html">Services</a></li>
              <li><a href="careers.html">Careers</a></li>
              <li><a href="blog.html">Blog</a></li>
              <li><a href="contact.html">Contact Us</a></li>
            </ul>
          </div>
          
          <div class="footer-col">
            <h3 class="footer-title">Contact Us</h3>
            <ul class="footer-contact">
              <li>
                <span class="footer-contact-icon">📍</span>
                <span>${settings.location || 'Chennai, Tamil Nadu, India'}</span>
              </li>
              <li>
                <span class="footer-contact-icon">📞</span>
                <a href="tel:${settings.phone.replace(/\s+/g, '')}">+91 ${settings.phone}</a>
              </li>
              <li>
                <span class="footer-contact-icon">✉️</span>
                <a href="mailto:${settings.email}">${settings.email}</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; ${new Date().getFullYear()} SGS HR Workforce Solutions. All Rights Reserved.</p>
          <div class="footer-legal-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
            <a href="admin.html">Admin Login</a>
          </div>
        </div>
      </div>
    </footer>
  `;
}

// Highlight the active page navigation link
function highlightActiveMenu() {
  const path = window.location.pathname;
  let pageName = 'index'; // Default fallback

  if (path.includes('about.html')) {
    pageName = 'about';
  } else if (path.includes('services.html')) {
    pageName = 'services';
  } else if (path.includes('careers.html')) {
    pageName = 'careers';
  } else if (path.includes('blog.html')) {
    pageName = 'blog';
  } else if (path.includes('contact.html')) {
    pageName = 'contact';
  }

  const activeLinks = document.querySelectorAll(`.nav-link[data-page="${pageName}"]`);
  activeLinks.forEach(link => link.classList.add('active'));
}

// Hamburger Toggle Controller
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger-menu');
  const navMenu = document.getElementById('nav-menu');
  const overlay = document.getElementById('nav-overlay');

  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  });

  if (overlay) {
    overlay.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      overlay.classList.remove('active');
      document.body.classList.remove('no-scroll');
    });
  }

  // Close menu when links are clicked
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      document.body.classList.remove('no-scroll');
    });
  });
}

// Navbar styling modification on scroll
function initHeaderScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// Set up scroll fade-in animation
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('appear');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const animateElements = document.querySelectorAll('.fade-in');
  animateElements.forEach(el => observer.observe(el));
}

// Testimonials Slider Manager
function initTestimonialSlider() {
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.testimonial-dot');
  if (slides.length === 0) return;

  let currentSlide = 0;
  let slideInterval;

  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
  }

  function nextSlide() {
    let next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }

  function startInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 6000);
  }

  // Dots click events
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      startInterval(); // Reset interval
    });
  });

  // Start rotation
  startInterval();
}

// Show Toast alert helper function
function showToast(message, type = 'success') {
  // Create toast container if it doesn't exist
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Create toast item
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? '✅' : '❌';
  toast.innerHTML = `
    <span>${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Auto remove toast
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}
