import axios from "axios"
import { useState } from "react"
import { toast } from "sonner"
import InputBox from "../components/InputBox"
import { Link, useNavigate } from "react-router-dom"
import env from "../conf/env"
import { useForm, type SubmitHandler } from "react-hook-form"

export type SignupDataType = {
  email: string,
  username: string,
  password: string,
  confirmPassword: string
}

function SignupPage() {

  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupDataType>()

  const onSubmit: SubmitHandler<SignupDataType> = async (data: SignupDataType) => {
    try {
      setLoading(true)

      if(data.password !== data.confirmPassword){
        toast.error("Password and Confirm Password should be the same")
        return
      }

      const res = await axios.post(`${env.SERVER_ENDPOINT}/users/initialize`, data, { withCredentials: true })
      if (res.status !== 201) {
        toast.error(res.data.message ?? "Error loging in")
      }

      navigate(`/auth/verify-otp/${data.email}`)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-4 border-zinc-800 border rounded-md text-zinc-100 space-y-3 w-96"
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
        <button disabled={loading} className="px-4 py-2 bg-zinc-200 text-zinc-900 font-semibold w-full rounded-md hover:bg-zinc-300 cursor-pointer disabled:opacity-60">Sign Up</button>
        {errors.root?.message && <span className="text-sm text-red-500">{errors.root.message}</span>}
        <p className="text-center text-sm">Already have an account? <Link className="text-blue-500 hover:underline" to="/auth/signin">Sign in</Link></p>
      </form>
    </div>
  )
}

export default SignupPage