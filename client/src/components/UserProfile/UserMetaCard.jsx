import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { userContext } from "../../context/UserContext";
import { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import FileInput from "../form/input/FileInput";


export default function UserMetaCard() {
const { Profileupdate,user } = useContext(userContext);
const [facebook, setFacebook] = useState(user.facebooklink || "");
const [website, setWebsite] = useState(user.websitelink || "");
const [email, setEmail] = useState(user.email || "");
const [company, setCompany] = useState(user.companyname || "");
const [phone, setPhone] = useState(user.phonenumber || "");
const { isOpen, openModal, closeModal } = useModal();
const [logoFile, setLogoFile] = useState(null);
const initializeForm = () => {
  setFacebook(user.facebooklink || "");
  setWebsite(user.websitelink || "");
  setEmail(user.email || "");
  setCompany(user.companyname || "");
  setPhone(user.phonenumber || "");
  setLogoFile(null); // Reset file input
};
const handleOpenModal = () => {
  initializeForm();
  openModal();
};


const handleSave = async (e) => {
  e.preventDefault();

  // Validation: Check if any field is empty (excluding logoFile which is optional)
  if (!facebook || !website || !email || !company || !phone) {
    toast.error("Please fill all fields.");
    return;
  }

  const formData = new FormData();
  formData.append("_id", user._id);
  formData.append("facebooklink", facebook);
  formData.append("websitelink", website);
  formData.append("email", email);
  formData.append("companyname", company);
  formData.append("phonenumber", phone);

  if (logoFile) {
    formData.append("logolink", logoFile);
  }

  try {
    const res = await axios.post(
      "http://localhost:3000/api/user/updateprofile",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    if (res.data.status) {
      toast.success("Profile updated successfully");
      Profileupdate(res.data.user);
      closeModal(); // Only close on successful update
    } else {
      toast.error(res.data.message);
    }
  } catch (err) {
    console.error("Update error", err);
    toast.error("Something went wrong");
  }
};





  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                <img
    src={user.logolink || "/images/logo/logo.svg"}
    alt="User Logo"
    onError={(e) => (e.target.src = "/images/logo/logo.svg")}
    className="h-full w-full object-cover"
  />

            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user.username}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.role}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.companyname}
                </p>
              </div>
            </div>
            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              <a
  href={
    user.facebooklink?.startsWith("http")
      ? user.facebooklink
      : `https://${user.facebooklink}`
  }
  target="_blank"
  rel="noopener noreferrer"
  className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
>
   <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.6666 11.2503H13.7499L14.5833 7.91699H11.6666V6.25033C11.6666 5.39251 11.6666 4.58366 13.3333 4.58366H14.5833V1.78374C14.3118 1.7477 13.2858 1.66699 12.2023 1.66699C9.94025 1.66699 8.33325 3.04771 8.33325 5.58342V7.91699H5.83325V11.2503H8.33325V18.3337H11.6666V11.2503Z"
                    fill=""
                  />
                </svg>
</a>



             <a
  href={
    user.websitelink?.startsWith("http")
      ? user.websitelink
      : `https://${user.websitelink}`
  }
  target="_blank"
  rel="noopener noreferrer"
  className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
>
 <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
  <path
    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-1.1 0-2.14-.3-3.03-.82.03-.65.11-1.28.24-1.89h5.58c.13.61.21 1.24.24 1.89-.89.52-1.93.82-3.03.82zm4.34-2.98H7.66c.17-.89.46-1.75.84-2.54h6.99c.38.79.67 1.65.85 2.54zM8.75 12c-.07-.33-.12-.66-.14-1h6.78c-.03.34-.08.67-.14 1H8.75zm-.28-3c.22-.89.57-1.74 1.02-2.52.68.23 1.42.38 2.18.45V9H8.47zm3.03 0V6.93c.76-.07 1.5-.22 2.18-.45.45.78.8 1.63 1.02 2.52h-3.2zm-1.54-3.43c-.65.88-1.16 1.85-1.5 2.88C6.65 9.6 5.55 10.72 5.1 12c.45 1.28 1.55 2.4 3.06 3.55.34 1.03.85 2 1.5 2.88A7.94 7.94 0 0 1 4 12c0-3.31 2.01-6.14 4.91-7.43zm5.56 0c2.9 1.29 4.91 4.12 4.91 7.43a7.94 7.94 0 0 1-4.66 6.43c.65-.88 1.16-1.85 1.5-2.88 1.5-1.15 2.6-2.27 3.06-3.55-.45-1.28-1.55-2.4-3.06-3.55-.34-1.03-.85-2-1.5-2.88z"
    fill=""
  />
  </svg>
</a>

            </div>
          </div>
          <button
            onClick={handleOpenModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">

              <div>


                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Social Links
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>Facebook</Label>
                    <Input type="text" value={facebook} required onChange={(e) => setFacebook(e.target.value)} />
                  </div>

                 

                  <div>
                    <Label>Wesite</Label>
                    <Input type="text" value={website} required onChange={(e) => setWebsite(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Company Logo</Label>
  <FileInput type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email</Label>
                    <Input type="text" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Company Name</Label>
                    <Input type="text" required value={company} onChange={(e) => setCompany(e.target.value)} />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                   <Input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" type="button" onClick={handleSave}>
  Save Changes
</Button>

            </div>
          </form>
        </div>
      </Modal>
      
    </>
  );
}
