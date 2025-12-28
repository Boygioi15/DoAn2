import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bell, Settings, Sun } from "lucide-react";

export default function AvatarBlock() {
  return (
    <div className="flex gap-2 flex-row-reverse items-center bg-white rounded-full shadow-xl px-5 p-1">
      <Avatar className="cursor-pointer size-12">
        <AvatarImage
          src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png"
          alt="Hallie Richards"
        />
        <AvatarFallback className="text-xs">HR</AvatarFallback>
      </Avatar>
      <Separator orientation="vertical" className={"my-2 bg-gray-500!"} />
      <span>Anh Quyền</span>
      <Separator orientation="vertical" className={"my-2 bg-gray-500!"} />
      <Button variant="ghost" size={"icon-sm"}>
        <Sun />
      </Button>
      <Button variant="ghost" size={"icon-sm"}>
        <Bell />
      </Button>
    </div>
  );
}
