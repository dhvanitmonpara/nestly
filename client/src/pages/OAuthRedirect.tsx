import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import env from "../conf/env";

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

  return <div>Signing you in...</div>;
}
