import React, { useRef, useState } from 'react';

type Props = {
  length?: number;
  onChange?: (otp: string) => void;
};

const OtpInput: React.FC<Props> = ({ length = 4, onChange }) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputsRef = useRef<(HTMLInputElement | null)[]>(Array(length).fill(null));

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    onChange?.(newOtp.join(''));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, length).split('');
    const sanitized = pasted.map(char => (/^[0-9]$/.test(char) ? char : ''));
    const newOtp = Array(length).fill('');

    for (let i = 0; i < length; i++) {
      newOtp[i] = sanitized[i] || '';
    }

    setOtp(newOtp);
    onChange?.(newOtp.join(''));

    const nextIndex = sanitized.findIndex(c => !c);
    inputsRef.current[nextIndex === -1 ? length - 1 : nextIndex]?.focus();
  };

  const setRef = (el: HTMLInputElement | null, index: number) => {
    inputsRef.current[index] = el;
  };

  return (
    <div className='gap-2 flex justify-center items-center'>
      {otp.map((digit, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          ref={(el) => setRef(el, i)}
          style={{
            width: '40px',
            height: '40px',
            fontSize: '1.5rem',
            textAlign: 'center',
          }}
          className="bg-zinc-700/70 text-zinc-200 border border-zinc-600 rounded-md"
        />
      ))}
    </div>
  );
};

export default OtpInput;