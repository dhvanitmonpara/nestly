function Overlay({ closeHandler }: { closeHandler: () => void }) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault()
        closeHandler();
      }}
      className="fixed md:hidden top-0 left-0 w-full h-full bg-zinc-950/60 z-30"
    ></div>
  );
}

export default Overlay;
