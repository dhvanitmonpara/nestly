import axios from "axios";
import env from "../conf/env";

const getServerStatus = async (
  onError: () => void,
  onSuccess?: () => void,
  timeout?: number,
) => {
  try {
    const res = await axios.get(`${env.SERVER_ENDPOINT}/health`, {
      timeout: timeout || 10000,
    });

    if (res.status !== 200) {
      onError();
    }

    if (onSuccess) onSuccess();
  } catch (error) {
    console.log(error);
    onError();
  }
};

export default getServerStatus;
