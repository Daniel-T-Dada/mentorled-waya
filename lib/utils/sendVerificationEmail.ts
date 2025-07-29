import emailjs from '@emailjs/browser';

export function sendVerificationEmail({ email, fullName, verification_link }: { email: string; fullName: string; verification_link: string }) {
    return emailjs.send(
        'service_vweurph',
        'template_92dvmic',
        {
            to_email: email, // Use correct variable name for EmailJS template
            fullName,
            verification_link,
        },
        'mHy17xZgFC4faCu3A'
    );
}
