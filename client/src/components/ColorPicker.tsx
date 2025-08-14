import { useEffect, useState } from "react";
import useDebounce from "../hooks/useDebounced";
import type { IUser } from "../types/IUser";

function ColorPicker({
  setUser,
  defaultColor,
}: {
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  defaultColor: string;
}) {
  const [localColor, setLocalColor] = useState(`#${defaultColor}`);

  const debouncedColor = useDebounce(localColor, 500);

  // Sync debounced localColor to parent
  useEffect(() => {
    setUser((prev: IUser | null) => {
      if (!prev) return null;
      if (prev.accent_color === debouncedColor) return prev;
      return { ...prev, accent_color: debouncedColor };
    });
  }, [debouncedColor, setUser]);

  return (
    <input
      className="h-6 w-10"
      type="color"
      name="profileColor"
      id="profileColor"
      value={localColor}
      onChange={(e) => setLocalColor(e.target.value)}
    />
  );
}

export default ColorPicker;
