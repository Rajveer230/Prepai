const nodemailer = require("nodemailer");
const { lookup } = require("dns").promises;

async function sendOtpEmail(to, otp, type) {
    // Render free tier has no IPv6 outbound — resolve to IPv4 explicitly
    const { address: smtpHost } = await lookup("smtp.gmail.com", { family: 4 });

    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: { servername: "smtp.gmail.com" },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
    });

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

    await Promise.race([
        transporter.sendMail({
            from: `"PrepAI" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        }),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Email timed out after 20s")), 20000)
        ),
    ]);
}

module.exports = { sendOtpEmail };