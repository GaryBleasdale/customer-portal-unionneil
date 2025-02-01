import { Link } from "@remix-run/react";
import { CgProfile, CgNotes, CgChart } from "react-icons/cg";

export default function Sidebar() {
  return (
    <div className="flex flex-col min-w-max">
      <Link
        to="/admin/dashboard"
        className="flex flex-row items-center hover:bg-[#cfb933] hover:text-white max-w-fit px-1 rounded-sm"
      >
        <CgProfile className="mr-1" />
        <span>Customers</span>
      </Link>
      <Link
        to="uploadFiles"
        relative="path"
        className="flex flex-row items-center hover:bg-[#cfb933] hover:text-white max-w-fit px-1 rounded-sm"
      >
        <CgNotes className="mr-1" />
        Billing
      </Link>
      <Link
        to="/admin/uploadFiles"
        className="flex flex-row items-center hover:bg-[#cfb933] hover:text-white max-w-fit px-1 rounded-sm"
      >
        <CgChart className="mr-1" />
        Analytics
      </Link>
    </div>
  );
}
