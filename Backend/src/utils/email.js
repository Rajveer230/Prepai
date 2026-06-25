const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOtpEmail(to, otp, type) {
    const isRegister = type === "register";
    const subject = isRegister ? "Verify your PrepAI account" : "Your PrepAI login OTP";

    const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;background:#0d1117;color:#e6edf3;padding:2rem;border-radius:1rem;border:1px solid #2a3348;">
        <h2 style="color:#ff2d78;margin-top:0;">${isRegister ? "Verify your account" : "Login verification"}</h2>
        <p style="color:#7d8590;margin-bottom:1.5rem;">
            ${isRegister ? "Thanks for signing up! Use the OTP below to verify your account." : "Use the OTP below to complete your login."}
        </p>
        <div style="background:#1c2230;border:1px solid #2a3348;border-radius:0.75rem;padding:1.5rem;text-align:center;margin-bottom:1.5rem;">
            <p style="font-size:2.5rem;font-weight:800;letter-spacing:0.6rem;color:#ff2d78;margin:0;">${otp}</p>
        </div>
        <p style="color:#7d8590;font-size:0.875rem;margin:0;">
            This OTP expires in <strong style="color:#e6edf3;">10 minutes</strong>. Do not share it with anyone.
        </p>
    </div>`;

    const { error } = await resend.emails.send({
        from: "PrepAI <onboarding@resend.dev>",
        to,
        subject,
        html,
    });

    if (error) throw new Error(error.message);
}

module.exports = { sendOtpEmail };