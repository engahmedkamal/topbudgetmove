document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initForm();
    initFAQ();
    initSmoothScroll();
    setMinDate();
});

function initNavigation() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            });
        });
    }
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) navbar.classList.toggle('scrolled', window.pageYOffset > 24);
    }, { passive: true });
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