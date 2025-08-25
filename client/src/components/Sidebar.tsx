import ServerIcon from "../components/ServerIcon";
import Channels from "../components/Channels";
import { Separator } from "../components/ui/separator";
import { FaMessage } from "react-icons/fa6";
import Conversations from "../components/Conversations";
import UpdateServerForm from "../components/UpdateServerForm";
import CreateChannelForm from "../components/CreateServerForm";
import ProfileButton from "../components/ProfileButton";
import { Link, NavLink, useLocation, useParams } from "react-router-dom";
import useServerStore from "../store/serverStore";
import useUserStore from "../store/userStore";
import clsx from "clsx";
import useFeatureStore from "../store/featureStore";
import { IoMdClose } from "react-icons/io";
import { FaUsers } from "react-icons/fa";
import { useState } from "react";
import Members from "./Members";
import Overlay from "./Overlay";

function Sidebar({ className }: { className?: string }) {
  const servers = useServerStore((s) => s.servers);
  const user = useUserStore((s) => s.user);
  const location = useLocation().pathname;
  const { serverId } = useParams<{ serverId: string }>();
  const setSidebarOpen = useFeatureStore((s) => s.setSidebarOpen);

  return (
    <div className={clsx(className)}>
      <section className="p-1 space-y-1">
        <NavLink
          to="/dm"
          className={({ isActive }) =>
            `flex items-center justify-center select-none h-10 w-10 mt-1 transition-all duration-50 font-semibold ${
              isActive
                ? "bg-violet-500 rounded-xl"
                : "bg-zinc-700/50 rounded-full text-zinc-300 hover:rounded-xl"
            }  cursor-pointer`
          }
        >
          <FaMessage />
        </NavLink>
        {servers.length > 0 &&
          servers.map(({ id, name, owner_id }) => (
            <ServerIcon
              id={id}
              key={id}
              name={name}
              isOwner={owner_id?.toString() === user?.id.toString()}
            />
          ))}
        <Separator className="bg-zinc-800 mt-1.5" />
        <CreateChannelForm />
      </section>
      <div className="w-full min-w-[220px] py-6 px-4 bg-zinc-800/50 relative group">
        <Link
          className="text-xl font-semibold flex justify-between items-center"
          to={location.includes("/dm") ? "/dm" : `/s/${serverId}`}
        >
          <span className="inline-block truncate">
            {servers.find((s) => s.id.toString() === serverId)?.name ||
              (location.includes("/dm") ? "Direct Messages" : "TechyScord")}
          </span>
          <div className="space-x-2 flex">
            {serverId && (
              <span className="inline-block">
                <UpdateServerForm
                  id={Number(serverId)}
                  name={
                    servers.find((s) => s.id.toString() === serverId)?.name ||
                    ""
                  }
                />
              </span>
            )}
            <MembersSidebar />
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setSidebarOpen(false);
              }}
              className="text-zinc-400 hover:text-zinc-300 sm:hidden cursor-pointer transition-opacity h-8 w-8 flex justify-center items-center rounded-full bg-zinc-700"
            >
              <IoMdClose />
            </button>
          </div>
        </Link>
        <input
          type="text"
          placeholder="Search a channel"
          className="my-4 w-full py-2 px-4 bg-zinc-700/50 rounded-md"
        />
        {location.includes("/dm") ? <Conversations /> : <Channels />}
        <ProfileButton />
      </div>
    </div>
  );
}

const MembersSidebar = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen(true);
        }}
        className="text-zinc-400 hover:text-zinc-300 md:hidden sm:opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity h-8 w-8 flex justify-center items-center rounded-full bg-zinc-700"
      >
        <FaUsers />
      </button>
      {open && <Overlay closeHandler={() => setOpen(false)} />}
      <Members
        closeHandler={() => setOpen(false)}
        className={`fixed h-full w-full md:hidden xs:w-60 top-0 left-0 z-50 shadow-2xl transition-all duration-300 ${
          open ? "" : "-translate-x-full"
        }`}
      />
    </>
  );
};

export default Sidebar;
