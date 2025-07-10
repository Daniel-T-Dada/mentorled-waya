# Implementing Email Verification with EmailJS

This guide explains how to send a verification email to users after account creation using EmailJS, even if backend verification is already complete.

## 1. Prerequisites

- EmailJS account ([emailjs.com](https://www.emailjs.com/))
- Email service and template set up in EmailJS
- Your EmailJS `service_id`, `template_id`, and `user/public key`
- Frontend project (React/Next.js)

## 2. Set Up EmailJS

1. **Create an EmailJS account** and log in.
2. **Add an email service** (e.g., Gmail, Outlook).
3. **Create an email template**:
   - Include variables like `to_email`, `fullName`, and a verification link (`verification_link`).
   - Example HTML template body:
     ```html
     <div
       style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f8f8f8ed; border-radius: 8px; box-shadow: 0 2px 8px rgba(80,0,97,0.06); padding: 32px 24px;"
     >
       <div style="text-align: center; margin-bottom: 24px;">
         <img
           src="https://waya-fawn.vercel.app/Logo/Purple.svg"
           alt="Waya Logo"
           style="height: 32px; margin-bottom: 8px;"
         />
       </div>
       <h3 style="color: #500061; margin-bottom: 16px;">
         Welcome to Waya, {{fullName}}!
       </h3>
       <p style="font-size: 16px; color: #525252; margin-bottom: 24px;">
         Your account has been created successfully.<br /><br />
         To complete your registration and access all features, please verify
         your email address by clicking the button below:
       </p>
       <div style="text-align: center; margin-bottom: 32px;">
         <a
           href="{{verification_link}}"
           style="display: inline-block; background: #500061; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-size: 16px; font-weight: bold;"
           >Verify Email</a
         >
       </div>
       <p style="font-size: 14px; color: #888888; margin-bottom: 16px;">
         If you did not create this account, please ignore this email.
       </p>
       <p
         style="font-size: 14px; color: #500061; margin-bottom: 0; font-weight: bold;"
       >
         Thank you for joining Waya!<br />
         <span style="color: #79166a; font-weight: bold;">The Waya Team</span>
       </p>
     </div>
     ```
4. **Get your EmailJS credentials** from the dashboard.

## 3. Install EmailJS SDK

```bash
npm install @emailjs/browser
```

## 4. Send Verification Email After Signup

In your signup handler (after successful backend response):

```js
import emailjs from "emailjs-com";

const sendVerificationEmail = (userEmail, userName, verificationLink) => {
  emailjs
    .send(
      "your_service_id",
      "your_template_id",
      {
        to_email: userEmail,
        user_name: userName,
        verification_link: verificationLink,
      },
      "your_user_public_key"
    )
    .then((result) => {
      // Optionally show a success message
    })
    .catch((error) => {
      // Optionally handle errors
    });
};
```

Call `sendVerificationEmail` after the user successfully signs up.

## 5. Create a Verification Link

- The link must point to a frontend route and **must include `&verified=1` in the query string** for the current flow, e.g., `/verify-email?email=user@example.com&verified=1`
- Since backend already marks users as verified, this link can simply show a confirmation message.

> **Note:**
> Always include `verified=1` in the verification link sent to users. This ensures they see the "Email Verified!" message when clicking the link. If you omit this parameter, users will only see the "Check Your Email" message.

## 6. User Experience

- After signup, show:  
  “A verification email has been sent to your address. Please check your inbox.”
- When the user clicks the link in the email, display a confirmation page.

## 7. (Optional) Backend Token Verification

If you want to add extra security, generate a token on the backend and include it in the verification link. Store and verify the token when the link is visited.

---

**Summary:**  
You send a verification email using EmailJS from the frontend after signup. The email contains a link for user confirmation, but backend logic does not depend on the link being clicked.

---

Let me know if you want a ready-to-use code sample or further customization!
