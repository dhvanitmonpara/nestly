import axios, { isAxiosError } from "axios";
import { useState } from "react";
import { toast } from "sonner";
import InputBox from "../components/InputBox";
import { Link, useNavigate } from "react-router-dom";
import env from "../conf/env";
import { useForm, type SubmitHandler } from "react-hook-form";
import { handleGoogleOAuthRedirect } from "../utils/googleOAuthRedirect";
import { FaGoogle } from "react-icons/fa";
import { Separator } from "../components/ui/separator";

export type SignupDataType = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

function SignupPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupDataType>();

  const onSubmit: SubmitHandler<SignupDataType> = async (
    data: SignupDataType
  ) => {
    try {
      setLoading(true);

      if (data.password !== data.confirmPassword) {
        toast.error("Password and Confirm Password should be the same");
        return;
      }

      const res = await axios.post(
        `${env.SERVER_ENDPOINT}/users/initialize`,
        data,
        { withCredentials: true }
      );
      if (res.status !== 201) {
        toast.error(res.data.message ?? "Error loging in");
      }

      navigate(`/auth/verify-otp/${data.email}`);
    } catch (error) {
      console.error(error);
      if (isAxiosError(error)) {
        toast.error(error?.response?.data.error ?? "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-zinc-800 border rounded-md text-zinc-100 w-96">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3"
      >
        <h3 className="text-3xl py-2">Sign Up</h3>
        <InputBox
          id="email"
          label="Email"
          type="email"
          {...register("email")}
          placeholder="Enter your Email"
          error={errors.email?.message}
        />
        <InputBox
          id="username"
          label="Username"
          type="text"
          {...register("username")}
          error={errors.username?.message}
          placeholder="Enter your Username"
        />
        <InputBox
          id="password"
          label="Password"
          type="password"
          {...register("password")}
          error={errors.password?.message}
          placeholder="Enter your Password"
        />
        <InputBox
          id="confirm-password"
          label="Confirm Password"
          type="password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
          placeholder="Re-Enter your Password"
        />
        <button
          disabled={loading}
          className="px-4 py-2 bg-zinc-200 text-zinc-900 font-semibold w-full rounded-md hover:bg-zinc-300 cursor-pointer disabled:opacity-60"
        >
          Sign Up
        </button>
        {errors.root?.message && (
          <span className="text-sm text-red-500">{errors.root.message}</span>
        )}
      </form>
      <p className="flex justify-center items-center my-3 text-xs">
        <Separator className="shrink bg-zinc-500" />
        <span className="px-4 text-zinc-500 dark:text-zinc-500 text-xs">
          Or
        </span>
        <Separator className="shrink bg-zinc-500" />
      </p>
      <form onSubmit={handleGoogleOAuthRedirect}>
        <button className="px-4 py-2 flex justify-center items-center space-x-2.5 bg-zinc-200 text-zinc-900 font-semibold w-full rounded-md hover:bg-zinc-300 cursor-pointer disabled:opacity-60">
          <FaGoogle />
          <span>Sign up with Google</span>
        </button>
      </form>
      <p className="text-center text-sm pt-3">
        Already have an account?{" "}
        <Link className="text-blue-500 hover:underline" to="/auth/signin">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default SignupPage;
