document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollReveal();
    initForm();
    initFAQ();
    initSmoothScroll();
    initQuoteBar();
    initFloatingLabels();
    setMinDate();
});

// Floating labels: lift the label whenever a field holds a value. Focus state
// is handled in CSS via :focus-within; this covers filled + autofilled fields.
function initFloatingLabels() {
    const fields = document.querySelectorAll('.form-group input, .form-group textarea');
    const sync = (el) => {
        const group = el.closest('.form-group');
        if (group) group.classList.toggle('is-filled', el.value.trim() !== '');
    };
    fields.forEach((el) => {
        sync(el);
        ['input', 'change', 'blur'].forEach((evt) => el.addEventListener(evt, () => sync(el)));
    });
    // Re-check shortly after load to catch browser autofill.
    window.addEventListener('load', () => setTimeout(() => fields.forEach(sync), 200));
}

// Sticky mobile quote bar: visible only while the quote form is off-screen,
// so the primary action stays one tap away on long mobile scrolls.
function initQuoteBar() {
    const bar = document.getElementById('quoteBar');
    const formWrap = document.getElementById('contact');
    if (!bar || !formWrap) return;

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const formVisible = entry.isIntersecting;
                bar.classList.toggle('is-visible', !formVisible);
                bar.setAttribute('aria-hidden', formVisible ? 'true' : 'false');
            });
        }, { threshold: 0.15 });
        observer.observe(formWrap);
    }

    // Tapping the bar scrolls to the form (smooth-scroll handles the motion)
    // then drops the cursor into the first empty field.
    bar.querySelector('[data-quote-jump]')?.addEventListener('click', () => {
        setTimeout(() => {
            const fields = ['firstName', 'lastName', 'phone', 'email', 'movingFrom', 'movingTo'];
            const target = fields.map((id) => document.getElementById(id)).find((el) => el && !el.value.trim());
            (target || document.getElementById('firstName'))?.focus({ preventScroll: true });
        }, 520);
    });
}

function initNavigation() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');
    const hasHero = document.querySelector('.hero');

    function setMenuOpen(open) {
        if (!mobileMenuBtn || !navLinks) return;
        navLinks.classList.toggle('active', open);
        mobileMenuBtn.classList.toggle('active', open);
        mobileMenuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.classList.toggle('nav-open', open);
    }

    function closeMenu() {
        setMenuOpen(false);
    }

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.setAttribute('aria-expanded', 'false');

        if (!navLinks.querySelector('.nav-cta-mobile')) {
            const ctaItem = document.createElement('li');
            ctaItem.innerHTML = '<a href="/#contact" class="nav-cta nav-cta-mobile">Get Free Quote</a>';
            navLinks.appendChild(ctaItem);
        }

        mobileMenuBtn.addEventListener('click', () => {
            setMenuOpen(!navLinks.classList.contains('active'));
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992) closeMenu();
        }, { passive: true });
    }

    function updateNavbar() {
        if (!navbar) return;
        const scrolled = window.pageYOffset > 24;
        navbar.classList.toggle('scrolled', scrolled);
        if (hasHero) {
            navbar.classList.toggle('at-top', !scrolled);
        }
    }

    updateNavbar();
    window.addEventListener('scroll', updateNavbar, { passive: true });
}

function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    // Content is visible by default in CSS. Only opt into the hidden/animated
    // state once we know JS is running and can guarantee it gets revealed —
    // this prevents sections from getting stuck invisible if a scroll event
    // is missed, the browser is slow, or the user lands mid-page via anchor.
    if (!('IntersectionObserver' in window)) return;

    document.documentElement.classList.add('js-reveal');

    const revealAll = () => {
        reveals.forEach(el => el.classList.add('visible'));
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });

    reveals.forEach(el => observer.observe(el));

    // Safety net: guarantee every section is visible shortly after load,
    // even if an observer entry was somehow missed (fast programmatic
    // scrolling, hash-link navigation, etc.).
    window.addEventListener('load', () => setTimeout(revealAll, 800));
}

function initForm() {
    const form = document.getElementById('quoteForm');
    if (!form) return;
    const fields = ['firstName', 'lastName', 'phone', 'email', 'movingFrom', 'movingTo', 'moveDate'];
    fields.forEach(fieldName => {
        const input = document.getElementById(fieldName);
        if (!input) return;
        input.addEventListener('blur', () => validateAndShowError(fieldName, input.value));
        input.addEventListener('focus', () => clearFieldError(fieldName));
        if (fieldName === 'phone') {
            input.addEventListener('input', (e) => { e.target.value = Validator.formatPhoneNumber(e.target.value); });
        }
    });
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {};
        fields.forEach(fieldName => { const input = document.getElementById(fieldName); formData[fieldName] = input ? input.value : ''; });
        const { isValid, errors } = Validator.validateForm(formData);
        Object.keys(errors).forEach(fieldName => showFieldError(fieldName, errors[fieldName]));
        fields.forEach(fieldName => { if (!errors[fieldName]) clearFieldError(fieldName); });
        if (!isValid) { const firstErrorField = fields.find(f => errors[f]); if (firstErrorField) document.getElementById(firstErrorField)?.focus(); return; }
        await submitForm(formData);
    });
}

function validateAndShowError(fieldName, value) {
    const result = Validator.validateField(fieldName, value);
    if (!result.isValid) showFieldError(fieldName, result.message);
    else { clearFieldError(fieldName); markFieldSuccess(fieldName); }
    return result.isValid;
}

function showFieldError(fieldName, message) {
    const input = document.getElementById(fieldName);
    const errorElement = input?.parentElement?.querySelector('.error-message');
    if (input) { input.classList.add('error'); input.classList.remove('success'); }
    if (errorElement) { errorElement.textContent = message; errorElement.classList.add('visible'); }
}

function clearFieldError(fieldName) {
    const input = document.getElementById(fieldName);
    const errorElement = input?.parentElement?.querySelector('.error-message');
    if (input) input.classList.remove('error');
    if (errorElement) { errorElement.textContent = ''; errorElement.classList.remove('visible'); }
}

function markFieldSuccess(fieldName) {
    const input = document.getElementById(fieldName);
    if (input && input.value.trim()) input.classList.add('success');
}

async function submitForm(formData) {
    const submitBtn = document.querySelector('#quoteForm button[type="submit"]');
    try {
        submitBtn.classList.add('loading'); submitBtn.disabled = true;
        const emailData = {
            firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone,
            email: formData.email, movingFrom: formData.movingFrom, movingTo: formData.movingTo,
            moveDate: formatDate(formData.moveDate), submittedAt: new Date().toLocaleString()
        };
        const response = await sendEmail(emailData);
        if (response.success) {
            showSuccessModal();
            document.getElementById('quoteForm').reset();
            document.querySelectorAll('.form-group input').forEach(input => input.classList.remove('success'));
        } else throw new Error(response.message || 'Failed to send');
    } catch (error) {
        console.error('Form submission error:', error);
        alert('There was an error submitting your request. Please try again or call us directly.');
    } finally {
        submitBtn.classList.remove('loading'); submitBtn.disabled = false;
    }
}

async function sendEmail(data) {
    const WEB3FORMS_ACCESS_KEY = 'dfa345a0-682c-4026-b8dc-b3e9b27031ed';
    const formData = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `New Moving Quote Request - ${data.firstName} ${data.lastName}`,
        from_name: 'TopBudgetMove Website',
        name: `${data.firstName} ${data.lastName}`,
        email: data.email, phone: data.phone, moving_from: data.movingFrom,
        moving_to: data.movingTo, move_date: data.moveDate, submitted_at: data.submittedAt
    };
    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(formData)
        });
        const result = await response.json();
        return result.success ? { success: true } : { success: false, message: result.message };
    } catch (error) {
        console.error('Web3Forms submission failed:', error);
        return { success: false, message: 'Network error' };
    }
}

function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function setMinDate() {
    const dateInput = document.getElementById('moveDate');
    if (dateInput) dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
}

function showSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
}

function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
}

document.addEventListener('click', (e) => { if (e.target.classList.contains('modal')) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
document.querySelector('.modal-close')?.addEventListener('click', closeModal);

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            faqItems.forEach(otherItem => { if (otherItem !== item) otherItem.classList.remove('active'); });
            item.classList.toggle('active');
        });
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });
}

window.closeModal = closeModal;