/**
 * main.js — Portfolio Interactivity
 *
 * Responsibilities:
 *   - Fetch and inject section partials (sections/*.html)
 *   - Initialise interactions only AFTER sections are loaded:
 *       mobile nav toggle, scroll effects, active nav on scroll,
 *       smooth scroll, fade-in animations (Intersection Observer),
 *       back-to-top button
 */

(function () {
  'use strict';

  var SECTIONS = ['hero', 'about', 'skills', 'projects', 'contact'];

  // ==========================================================================
  // Fetch & inject all section partials, then initialise the page.
  // ==========================================================================
  function loadSections() {
    var loadedCount = 0;

    SECTIONS.forEach(function (section) {
      fetch('sections/' + section + '.html')
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Failed to load ' + section + '.html');
          }
          return response.text();
        })
        .then(function (html) {
          var el = document.getElementById(section);
          if (el) {
            el.innerHTML = html;
          }
        })
        .catch(function (error) {
          console.error('Error loading ' + section + '.html:', error);
          var el = document.getElementById(section);
          if (el) {
            el.innerHTML =
              '<div class="container text-center py-5">' +
              '<h2>Error Loading Section</h2>' +
              '<p>Failed to load ' + section + ' content. Please try again later.</p>' +
              '</div>';
          }
        })
        .finally(function () {
          loadedCount++;
          if (loadedCount === SECTIONS.length) {
            initPage();
          }
        });
    });
  }

  // ==========================================================================
  // All logic that touches the injected (dynamic) DOM lives here so it runs
  // after the section partials have been populated.
  // ==========================================================================
  function initPage() {
    // ---------------------------------------------------------------------------
    // DOM Element References
    // ---------------------------------------------------------------------------
    var navbar = document.querySelector('.navbar-custom');
    var navLinks = document.querySelectorAll('.nav-link-custom');
    var navbarCollapse = document.querySelector('.navbar-collapse-custom');
    var navbarToggler = document.querySelector('.navbar-toggler-custom');
    var backToTopBtn = document.querySelector('.back-to-top');
    var sections = document.querySelectorAll('section[id]');

    // ---------------------------------------------------------------------------
    // Mobile Navigation Toggle
    // ---------------------------------------------------------------------------
    function initMobileNav() {
      if (!navbarToggler || !navbarCollapse) return;

      navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          if (window.innerWidth < 992) {
            var bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
            if (bsCollapse) {
              bsCollapse.hide();
            }
          }
        });
      });

      document.addEventListener('click', function (e) {
        if (
          window.innerWidth < 992 &&
          navbarCollapse.classList.contains('show') &&
          !navbarCollapse.contains(e.target) &&
          !navbarToggler.contains(e.target)
        ) {
          var bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
          if (bsCollapse) {
            bsCollapse.hide();
          }
        }
      });
    }

    // ---------------------------------------------------------------------------
    // Navbar Scroll Effect
    // ---------------------------------------------------------------------------
    function initNavbarScroll() {
      if (!navbar) return;

      var lastScrollY = window.scrollY;

      function handleScroll() {
        var currentScrollY = window.scrollY;

        if (currentScrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }

        if (backToTopBtn) {
          if (currentScrollY > 300) {
            backToTopBtn.classList.add('visible');
          } else {
            backToTopBtn.classList.remove('visible');
          }
        }

        lastScrollY = currentScrollY;
      }

      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }

    // ---------------------------------------------------------------------------
    // Active Navigation Link on Scroll
    // ---------------------------------------------------------------------------
    function initActiveNavOnScroll() {
      if (!sections.length || !navLinks.length) return;

      var observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
      };

      var sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            updateActiveNavLink(id);
          }
        });
      }, observerOptions);

      sections.forEach(function (section) {
        sectionObserver.observe(section);
      });

      function updateActiveNavLink(activeId) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + activeId) {
            link.classList.add('active');
          }
        });
      }
    }

    // ---------------------------------------------------------------------------
    // Smooth Scroll for Anchor Links
    // ---------------------------------------------------------------------------
    function initSmoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
          var targetId = this.getAttribute('href');
          if (targetId === '#') return;

          var targetElement = document.querySelector(targetId);
          if (targetElement) {
            e.preventDefault();

            var navbarHeight = navbar ? navbar.offsetHeight : 0;
            var targetPosition =
              targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight;

            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });

            history.pushState(null, null, targetId);
          }
        });
      });
    }

    // ---------------------------------------------------------------------------
    // Fade-in Animations on Scroll (Intersection Observer)
    // ---------------------------------------------------------------------------
    function initFadeInAnimations() {
      // Re-query so we capture every element that now carries .fade-in
      // (sections + cards added below, plus the inner elements already in the
      // injected HTML). Querying here — after class assignment — is intentional.
      var fadeElements = document.querySelectorAll('.fade-in');
      if (!fadeElements.length) return;

      var observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
      };

      var fadeObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      }, observerOptions);

      fadeElements.forEach(function (element) {
        fadeObserver.observe(element);
      });
    }

    // ---------------------------------------------------------------------------
    // Back to Top Button
    // ---------------------------------------------------------------------------
    function initBackToTop() {
      if (!backToTopBtn) return;

      backToTopBtn.addEventListener('click', function () {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }

    // ---------------------------------------------------------------------------
    // Initialize All
    // ---------------------------------------------------------------------------
    function init() {
      // Add fade-in classes to sections and interactive cards BEFORE the
      // fade-in observer is created so they are actually observed. (If added
      // afterwards they would remain opacity:0 and never become visible.)
      sections.forEach(function (section) {
        section.classList.add('fade-in');
      });
      document.querySelectorAll('.card-custom, .skill-category-card').forEach(function (el) {
        el.classList.add('fade-in');
      });

      initMobileNav();
      initNavbarScroll();
      initActiveNavOnScroll();
      initSmoothScroll();
      initFadeInAnimations();
      initBackToTop();
    }

    // Start initialization
    init();
  }

  // Kick off: wait for DOM, then load sections.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSections);
  } else {
    loadSections();
  }
})();
