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
      if (prev.accentColor === debouncedColor) return prev;
      return { ...prev, accentColor: debouncedColor };
    });
  }, [debouncedColor, setUser]);

  return (
    <span className="inline-block">
      <label htmlFor="profileColor" className="cursor-pointer">
        <span
          className="h-10 w-10 rounded-md border shadow-sm inline-block"
          style={{ backgroundColor: localColor }}
        />
      </label>
      <input
        id="profileColor"
        name="profileColor"
        type="color"
        value={localColor}
        onChange={(e) => setLocalColor(e.target.value)}
        className="sr-only"
      />
    </span>
  );
}

export default ColorPicker;
