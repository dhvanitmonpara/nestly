function formatTimestamp(isoString: string): string {
  const dt: Date = new Date(isoString);
  const now: Date = new Date();
  
  const diffMs: number = now.getTime() - dt.getTime();
  const diffHours: number = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    // Less than 24h → HH:MM (24-hour format)
    return dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  } else {
    // More than 24h → dd-mm-yy
    const day: string = String(dt.getDate()).padStart(2, '0');
    const month: string = String(dt.getMonth() + 1).padStart(2, '0');
    return `${day}-${month}`;
  }
}

export default formatTimestamp;