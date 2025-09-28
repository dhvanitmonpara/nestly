import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import env from "../conf/env";
import type { IUser } from "../types/IUser";
import ColorPicker from "../components/ColorPicker";
import { toast } from "sonner";
import { Skeleton } from "../components/ui/skeleton";

export default function ProfilePage() {
  const [user, setUser] = useState<null | IUser>(null);
  const [customizeUser, setCustomizeUser] = useState<null | IUser>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        if (!userId) return;
        const user = await axios.get(
          `${env.SERVER_ENDPOINT}/users/id/${userId}`,
          { withCredentials: true }
        );
        if (user.status !== 200) {
          navigate("/");
          return;
        }
        setUser(user.data.data);
        setCustomizeUser(user.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [navigate, userId]);

  const handleSave = async () => {
    const toastId = toast.loading("Saving...");
    try {
      const accentColor = customizeUser?.accentColor.slice(1, 7);
      const response = await axios.put(
        `${env.SERVER_ENDPOINT}/users/update`,
        { accentColor, displayName: customizeUser?.displayName },
        { withCredentials: true }
      );
      if (response.status !== 200) {
        throw new Error("Failed to save user");
      }
      setUser(customizeUser);
    } catch (error) {
      console.log(error);
    } finally {
      toast.dismiss(toastId);
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!user || !customizeUser) {
    navigate("/");
    return null;
  }

  return (
    <div className="pt-20 px-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="mb-4 flex justify-start items-center space-x-2.5">
        <div
          style={{ color: `#${user.accentColor}` }}
          className="bg-zinc-800 rounded-full h-10 w-10 flex justify-center items-center"
        >
          {user.displayName.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <p>{user.username}</p>
          <p className=" text-gray-500">{user.email}</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="displayName"
            className="block  font-medium text-zinc-500"
          >
            Display Name
          </label>
          <input
            type="text"
            id="displayName"
            className="border border-zinc-700 rounded-md p-2 bg-zinc-900 text-zinc-100"
            value={customizeUser.displayName}
            placeholder="Display Name"
            onChange={(e) =>
              setCustomizeUser({
                ...customizeUser,
                displayName: e.target.value,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <span className="block  font-medium text-zinc-500">
            Accent Color:{" "}
          </span>
          <ColorPicker
            setUser={setCustomizeUser}
            defaultColor={customizeUser.accentColor}
          />
        </div>
      </div>
      {user !== customizeUser && (
        <div className="space-x-2 pt-6">
          <button
            onClick={() => setCustomizeUser(user)}
            className="bg-zinc-800 text-zinc-100 px-3 py-1 font-semibold rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-zinc-100 text-zinc-800 px-3 py-1 font-semibold rounded"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="pt-20 px-4 animate-pulse">
      <Skeleton className="h-8 w-36 rounded-md mb-4" />

      <div className="mb-4 flex items-center space-x-2.5">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-3 w-48 rounded-md" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Display Name */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 rounded-md" /> {/* label */}
          <Skeleton className="h-10 w-52 rounded-md" /> {/* input */}
        </div>

        <div className="space-y-2">
          <Skeleton className="h-3 w-32 rounded-md" /> {/* label */}
          <Skeleton className="h-10 w-20 rounded-md" /> {/* color picker */}
        </div>
      </div>

      <div className="flex space-x-2 pt-6">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  );
}
