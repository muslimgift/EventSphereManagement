import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import Label from "../form/Label";

export default function ResetPasswordForm() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const navigate=useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/user/resetpassword/${token}`, {
        newPassword,
      });
      toast.success(res.data.message);
      setNewPassword("");
      navigate("/signin");
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Reset Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter a new password to reset your account.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>
              New Password <span className="text-error-500">*</span>
            </Label>
            <Input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Button type="submit" className="w-full" size="sm" disabled={submitting}>
              {submitting ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
