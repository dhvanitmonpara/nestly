import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function InputBox({
  label,
  id,
  placeholder = "",
  type = "text",
  defaultValue,
  error,
  ...props
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  error: string | undefined;
}) {
  const [isHidden, setIsHidden] = useState<boolean>(type === "password");
  return (
    <div className="space-y-1.5 relative">
      <label className="block" htmlFor={id}>
        {label}:
      </label>
      <input
        placeholder={placeholder}
        type={type === "password" ? (isHidden ? type : "text") : type}
        id={id}
        defaultValue={defaultValue}
        className="bg-zinc-800 px-3 py-2 rounded-md w-full"
        {...props}
      />
      {type === "password" && (
        <button
          type="button"
          className="absolute cursor-pointer top-10 right-4"
          onClick={() => setIsHidden(!isHidden)}
        >
          {isHidden ? <FaEyeSlash /> : <FaEye />}
        </button>
      )}
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}

export default InputBox;
