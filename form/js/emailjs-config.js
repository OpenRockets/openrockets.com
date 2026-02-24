const EMAILJS_CONFIG = {
    serviceId: 'service_wytouid',
    templateId: 'template_nwcz7ya',
    publicKey: 'RXcjvm_QAaHrQNSMW'
};


function initializeEmailJS() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.publicKey);
        console.log('EmailJS initialized successfully');
        return true;
    } else {
        console.error('EmailJS library not loaded');
        return false;
    }
}

/**
 * @param {Object} formData - The form data to send via email
 * @returns {Promise} - Promise that resolves when email is sent
 */
export async function sendEmailNotification(formData) {
    try {
        // Initialize EmailJS if not already done
        if (!initializeEmailJS()) {
            throw new Error('EmailJS initialization failed');
        }

        // Format skills array as comma-separated string
        const skillsFormatted = Array.isArray(formData.skills) 
            ? formData.skills.join(', ') 
            : formData.skills || 'None specified';

        // Format submission time
        const submissionTime = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });

        // Social profiles
        const profilesFormatted = Array.isArray(formData.social_profiles) && formData.social_profiles.length
            ? formData.social_profiles.join('\n')
            : 'None provided';

        // Nonprofit info
        const nonprofitBlock = formData.has_nonprofit === 'yes'
            ? [
                `Name: ${formData.np_name || '—'}`,
                `Location: ${formData.np_location || '—'}`,
                `Registered: ${formData.np_registered || '—'}`,
                `Size: ${formData.np_size || '—'}`,
                `Description: ${formData.np_description || '—'}`
              ].join('\n')
            : 'Not running a nonprofit';

        // Prepare template parameters for EmailJS
        const templateParams = {
            name:             formData.name || 'Unknown',
            email:            formData.email || 'No email provided',
            social_profiles:  profilesFormatted,
            skills:           skillsFormatted,
            has_nonprofit:    formData.has_nonprofit || 'no',
            nonprofit_info:   nonprofitBlock,
            program_signup:   formData.program_signup === 'yes' ? 'Yes — applied' : 'No',
            time:             submissionTime
        };

        console.log('Sending email notification with params:', templateParams);

        // Send email using EmailJS
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );

        console.log('Email sent successfully:', response);
        return { success: true, response };

    } catch (error) {
        console.error('Failed to send email notification:', error);
        
        // Return error details for better debugging
        return { 
            success: false, 
            error: error.message || 'Unknown email sending error',
            details: error
        };
    }
}

/**
 * Test EmailJS connection
 * @returns {Promise<boolean>} - True if EmailJS is working
 */
export async function testEmailConnection() {
    try {
        if (!initializeEmailJS()) {
            return false;
        }

        // Test with minimal data
        const testParams = {
            name: 'Test User',
            email: 'test@example.com',
            social_profiles: 'https://github.com/test',
            skills: 'JavaScript, Testing',
            has_nonprofit: 'no',
            nonprofit_info: 'Not running a nonprofit',
            program_signup: 'No',
            time: new Date().toLocaleString()
        };

        await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            testParams
        );

        return true;
    } catch (error) {
        console.error('EmailJS connection test failed:', error);
        return false;
    }
}

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure EmailJS library is loaded
    setTimeout(() => {
        initializeEmailJS();
    }, 100);
});

// Export configuration for potential external use
export { EMAILJS_CONFIG };
