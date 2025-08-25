import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import InputBox from "./InputBox";
import { useForm, type SubmitHandler } from "react-hook-form";
import useServerStore from "../store/serverStore";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import env from "../conf/env";
import { useParams } from "react-router-dom";
import useHandleAuthError from "../hooks/useHandleAuthError";
import { useState } from "react";
import { HiPencil } from "react-icons/hi";

type ServerType = {
  name: string;
};

function UpdateServerForm({
  open,
  setOpen,
  name,
  id,
}: {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  name: string;
  id: number;
}) {
  const [dialogOpen, setDialogOpen] = useState(open);

  const setServer = useServerStore((s) => s.setServers);
  const servers = useServerStore((s) => s.servers);

  const { serverId } = useParams();
  const { handleAuthError } = useHandleAuthError();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServerType>({
    defaultValues: {
      name: name,
    },
  });

  const handleUpdateServer: SubmitHandler<ServerType> = async (
    data: ServerType
  ) => {
    const toastId = toast.loading("Updating server...");
    try {
      const res = await axios.put(
        `${env.SERVER_ENDPOINT}/servers/update/${id}`,
        data,
        { withCredentials: true }
      );

      if (res.status !== 200) {
        toast.error("Failed to delete the server");
        return;
      }

      if (setOpen) setOpen(false);
      setServer(
        servers.map((s) =>
          s.id.toString() === serverId ? { ...s, name: data.name } : s
        )
      );
    } catch (error) {
      handleAuthError(error as AxiosError);
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <Dialog
      open={open ?? dialogOpen}
      onOpenChange={(isOpen) => {
        setDialogOpen(isOpen);
        if (setOpen) setOpen(isOpen);
      }}
    >
      {!setOpen && (
        <DialogTrigger className="text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer bg-zinc-700 h-8 w-8 flex justify-center items-center rounded-full sm:opacity-0 sm:group-hover:opacity-100">
          <HiPencil />
        </DialogTrigger>
      )}
      <DialogContent className="bg-zinc-900 text-zinc-100 border-zinc-800 !max-w-96">
        <DialogHeader>
          <DialogTitle>
            Edit Server: {name}
          </DialogTitle>
          <DialogDescription>
            It'll be changed for each member of this server.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleUpdateServer)} className="space-y-4">
          <InputBox
            id="name"
            label="Name"
            placeholder="Update name"
            defaultValue={name}
            error={errors.name?.message}
            {...register("name")}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-zinc-200 text-zinc-900 font-semibold w-full rounded-md hover:bg-zinc-300 cursor-pointer disabled:opacity-60"
          >
            Update server
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateServerForm;
