import { useEffect, useState } from "react"
import useDebounce from "../hooks/useDebounced";

function ColorPicker({ setColor, defaultColor }: { setColor: (color: string) => void, defaultColor: string }) {

    const [localColor, setLocalColor] = useState(defaultColor)

    const debouncedColor = useDebounce(localColor, 500);

    // Sync debounced localColor to parent
    useEffect(() => {
        setColor(debouncedColor);
    }, [debouncedColor, setColor]);

    return (
        <input type="color" name="profileColor" id="profileColor" value={localColor} onChange={(e) => setLocalColor(e.target.value)} />
    )
}

export default ColorPicker