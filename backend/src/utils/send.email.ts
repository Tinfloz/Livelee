import nodeMailer from "nodemailer";

interface IOptions {
    email: string,
    subject: string,
    emailToSend: string
};

export const sendEmail = async (options: IOptions): Promise<void> => {
    const transporter = nodeMailer.createTransport({
        host: process.env.SMTP_HOST!,
        port: Number(process.env.SMTP_PORT!),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    const mailOptions = {
        from: process.env.SMTP_EMAIL!,
        to: options.email,
        subject: options.subject,
        text: options.emailToSend,
    };
    await transporter.sendMail(mailOptions);
};