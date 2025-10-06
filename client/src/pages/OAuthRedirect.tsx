import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import env from "../conf/env";
import { LuLoaderCircle } from "react-icons/lu";

export default function OAuthRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const tempToken = params.get("tempToken");

        if (!tempToken) return;

        const res = await axios.post(
          `${env.SERVER_ENDPOINT}/users/auth/finalize`,
          { tempToken },
          { withCredentials: true }
        )

        if (res.status === 200) navigate("/");
        else navigate("/login");

      } catch (error) {
        console.log(error)
        navigate("/login")
      }
    })()
  }, [navigate]);

  return <div className="text-zinc-100 flex flex-col justify-center items-center space-y-4">
    <h3>Signing you in...</h3>
    <LuLoaderCircle className="animate-spin text-2xl" />
  </div>
}
