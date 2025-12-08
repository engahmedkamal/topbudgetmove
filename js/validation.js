const Validator = {
    patterns: {
        usPhone: /^(?:\+?1[-.\s]?)?(?:\(?[2-9]\d{2}\)?[-.\s]?)?[2-9]\d{2}[-.\s]?\d{4}$/,
        email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        name: /^[a-zA-Z\s'-]{2,50}$/
    },
    messages: {
        firstName: { required: 'First name is required', invalid: 'Please enter a valid first name' },
        lastName: { required: 'Last name is required', invalid: 'Please enter a valid last name' },
        phone: { required: 'Phone number is required', invalid: 'Please enter a valid US phone number' },
        email: { required: 'Email address is required', invalid: 'Please enter a valid email address' },
        movingFrom: { required: 'Moving from location is required', invalid: 'Please enter a valid location' },
        movingTo: { required: 'Moving to location is required', invalid: 'Please enter a valid location' },
        moveDate: { required: 'Move date is required', invalid: 'Please select a valid date', past: 'Move date cannot be in the past' }
    },
    validateField(fieldName, value) {
        const trimmedValue = value.trim();
        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (!trimmedValue) return { isValid: false, message: this.messages[fieldName].required };
                if (!this.patterns.name.test(trimmedValue)) return { isValid: false, message: this.messages[fieldName].invalid };
                return { isValid: true, message: '' };
            case 'phone':
                if (!trimmedValue) return { isValid: false, message: this.messages.phone.required };
                const cleanPhone = trimmedValue.replace(/[^\d+]/g, '');
                if (!this.validateUSPhone(cleanPhone)) return { isValid: false, message: this.messages.phone.invalid };
                return { isValid: true, message: '' };
            case 'email':
                if (!trimmedValue) return { isValid: false, message: this.messages.email.required };
                if (!this.patterns.email.test(trimmedValue)) return { isValid: false, message: this.messages.email.invalid };
                return { isValid: true, message: '' };
            case 'movingFrom':
            case 'movingTo':
                if (!trimmedValue) return { isValid: false, message: this.messages[fieldName].required };
                if (trimmedValue.length < 2) return { isValid: false, message: this.messages[fieldName].invalid };
                return { isValid: true, message: '' };
            case 'moveDate':
                if (!trimmedValue) return { isValid: false, message: this.messages.moveDate.required };
                const selectedDate = new Date(trimmedValue);
                const today = new Date(); today.setHours(0, 0, 0, 0);
                if (isNaN(selectedDate.getTime())) return { isValid: false, message: this.messages.moveDate.invalid };
                if (selectedDate < today) return { isValid: false, message: this.messages.moveDate.past };
                return { isValid: true, message: '' };
            default:
                return { isValid: true, message: '' };
        }
    },
    validateUSPhone(phone) {
        let cleanPhone = phone.replace(/^\+?1/, '').replace(/\D/g, '');
        if (cleanPhone.length !== 10) return false;
        const areaCode = cleanPhone.substring(0, 3);
        const exchangeCode = cleanPhone.substring(3, 6);
        if (areaCode.startsWith('0') || areaCode.startsWith('1')) return false;
        if (exchangeCode.startsWith('0') || exchangeCode.startsWith('1')) return false;
        if (areaCode.charAt(1) === '1' && areaCode.charAt(2) === '1') return false;
        const fakePatterns = ['5555555555', '0000000000', '1111111111', '1234567890', '9876543210'];
        if (fakePatterns.includes(cleanPhone)) return false;
        return true;
    },
    formatPhoneNumber(value) {
        const cleaned = value.replace(/\D/g, '').substring(0, 10);
        if (cleaned.length === 0) return '';
        if (cleaned.length <= 3) return `(${cleaned}`;
        if (cleaned.length <= 6) return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`;
        return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    },
    validateForm(formData) {
        const errors = {};
        let isValid = true;
        for (const [fieldName, value] of Object.entries(formData)) {
            const result = this.validateField(fieldName, value);
            if (!result.isValid) { errors[fieldName] = result.message; isValid = false; }
        }
        return { isValid, errors };
    }
};
window.Validator = Validator;