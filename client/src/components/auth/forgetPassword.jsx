import { useState } from "react";
import { toast } from "react-toastify";
import { backend } from "../../config/hosting"; // your base URL config
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import axios from "axios";

export default function ForgetPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post(`${backend}/api/user/forgetpassword`, {
        email,
      });
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Forgot Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your registered email to receive a password reset link.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>
              Email <span className="text-error-500">*</span>
            </Label>
            <Input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Button type="submit" className="w-full" size="sm" disabled={submitting}>
              {submitting ? "Sending..." : "Send Reset Link"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
