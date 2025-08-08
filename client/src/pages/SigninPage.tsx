import axios from "axios"
import { useState } from "react"
import { toast } from "sonner"
import InputBox from "../components/InputBox"
import { Link, useNavigate } from "react-router-dom"
import { useForm, type SubmitHandler } from "react-hook-form"
import env from "../conf/env"

type SigninDataType = {
  email: string,
  password: string
}

function SigninPage() {

  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninDataType>()

  const onSubmit: SubmitHandler<SigninDataType> = async (data: SigninDataType) => {
    try {
      setLoading(true)
      const res = await axios.post(`${env.SERVER_ENDPOINT}/users/login`, data, { withCredentials: true })
      if (res.status !== 200) {
        toast.error(res.data.message ?? "Error loging in")
      }
      navigate("/")
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-4 border-zinc-800 border rounded-md text-zinc-100 space-y-3 w-96"
    >
      <h3 className="text-3xl py-2">Sign In</h3>
      <InputBox
        id="email"
        label="Email"
        type="email"
        {...register("email")}
        error={errors.email?.message}
        placeholder="Enter your Email"
      />
      <InputBox
        id="password"
        label="Password"
        type="password"
        {...register("password")}
        error={errors.password?.message}
        placeholder="Enter your Password"
      />
      <button disabled={loading} className="px-4 py-2 bg-zinc-200 text-zinc-900 font-semibold w-full rounded-md hover:bg-zinc-300 cursor-pointer disabled:opacity-60">Sign In</button>
      {errors.root?.message && <span className="text-sm text-red-500">{errors.root.message}</span>}
      <p className="text-center text-sm">Don't have an account? <Link className="text-blue-500 hover:underline" to="/auth/signup">Sign up</Link></p>
    </form>
  )
}

export default SigninPage