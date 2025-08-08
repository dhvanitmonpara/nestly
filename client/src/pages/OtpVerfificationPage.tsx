import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import OtpInput from "../components/OtpInput";
import { toast } from "sonner";
import axios from "axios";
import env from "../conf/env";

function OtpVerfificationPage() {
    const [loading, setLoading] = useState(false)
    const [timeLeft, setTimeLeft] = useState(60);
    const [attempts, setAttempts] = useState(0)
    const [otp, setOtp] = useState("");

    const { email } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const sendOtp = async () => {
        try {
            if (!email) return
            const res = await axios.post(`${env.SERVER_ENDPOINT}/users/otp/send`, { email })

            if (res.status !== 200) {
                toast.error("Failed to send a new OTP")
                return
            }

            toast.success("A new otp has been sent to your account!")
        } catch (error) {
            console.error("Error sending OTP:", error);
        }
    }

    const verifyOTP = async () => {
        try {
            setLoading(true)
            const res = await axios.post(`${env.SERVER_ENDPOINT}/users/otp/verify`, {
                email,
                otp
            })

            if (res.status !== 200) {
                toast.error("Invalid OTP, try again")
                return
            }

            toast.success("OTP verified")
            navigate(`/auth/setup/${email}`)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
            setAttempts(a => a++)
        }
    }

    useEffect(() => {
        if (otp.length === 6) {
            verifyOTP()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otp])


    const handleResendOTP = () => {
        setTimeLeft(60);
        sendOtp();
    };

    useEffect(() => {
        sendOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email]);

    return (
        <div
            className="p-4 border-zinc-800 border rounded-md text-zinc-100 space-y-4 w-96"
        >
            <h3 className="text-3xl text-center py-2">Verify email</h3>
            <p className="text-sm text-center text-zinc-300">
                Enter the 6-digit code we emailed to <b>{email}</b>. If you did not
                receive it, you can request a new one{" "}
                {timeLeft > 0 ? (
                    <span>
                        in <b>{timeLeft}</b> seconds
                    </span>
                ) : (
                    <span
                        className="text-blue-500 hover:underline cursor-pointer"
                        onClick={handleResendOTP}
                    >
                        Resend OTP
                    </span>
                )}
                .
            </p>
            <OtpInput length={6} onChange={setOtp} />
            <button disabled={otp.length < 6 || loading} onClick={verifyOTP} className="px-4 py-2 bg-zinc-200 text-zinc-900 font-semibold w-full rounded-md hover:bg-zinc-300 cursor-pointer disabled:opacity-60">
                {loading ? "Verifying..." : "Verify"}
            </button>
            {attempts > 4 && <p className="text-zinc-500">Max attempts reached, Try after some minutes.</p>}
            <p className="text-sm text-center text-zinc-300">
                Want to login? <Link className="text-blue-500 hover:underline" to="/auth/signin">Sign In</Link>
            </p>
        </div>
    )
}

export default OtpVerfificationPage