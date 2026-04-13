import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { logout, AppDispatch } from "../../services/actions/auth";
import { adminApi } from "../../api/apiClient";
import { AUTH_ENDPOINTS } from "../../api/endpoints";
import Layout from "../Layout/Layout";

interface UserInfo {
  first_name: string;
  last_name: string;
  email: string;
}

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.get(AUTH_ENDPOINTS.USER_ME).then((res) => {
      setUserInfo(res.data);
    });
  }, []);

  const { handleChange, handleSubmit, values, errors, touched, isSubmitting } = useFormik({
    initialValues: {
      current_password: "",
      new_password: "",
      re_new_password: "",
    },
    validationSchema: Yup.object({
      current_password: Yup.string().required("Required"),
      new_password: Yup.string().min(8, "Must be at least 8 characters").required("Required"),
      re_new_password: Yup.string()
        .oneOf([Yup.ref("new_password")], "Passwords must match")
        .required("Required"),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      setPasswordError(null);
      setPasswordSuccess(false);
      try {
        await adminApi.post(AUTH_ENDPOINTS.USERS_SET_PASSWORD, {
          current_password: values.current_password,
          new_password: values.new_password,
          re_new_password: values.re_new_password,
        });
        setPasswordSuccess(true);
        resetForm();
      } catch {
        setPasswordError("Current password is incorrect or new password is invalid.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Layout>
      <section className="mx-auto mt-24 w-[20rem] md:mt-48 md:w-[32rem] pb-16">
        <div className="mb-6 rounded-md bg-white px-3 py-8 shadow-md ring-1 md:px-12">
          <h2 className="blue_gradient mb-6 font-satoshi text-3xl font-bold text-gray-600">
            My Account
          </h2>
          {userInfo ? (
            <div className="space-y-3 text-gray-700">
              <div>
                <span className="text-sm font-bold uppercase text-gray-500">Name</span>
                <p>{userInfo.first_name} {userInfo.last_name}</p>
              </div>
              <div>
                <span className="text-sm font-bold uppercase text-gray-500">Email</span>
                <p>{userInfo.email}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading...</p>
          )}
        </div>

        <div className="mb-6 rounded-md bg-white px-3 py-8 shadow-md ring-1 md:px-12">
          <h3 className="mb-6 font-satoshi text-xl font-bold text-gray-700">
            Change password
          </h3>
          {passwordSuccess && (
            <p className="mb-4 text-sm text-green-600">Password updated successfully.</p>
          )}
          {passwordError && (
            <p className="mb-4 text-sm text-red-500">{passwordError}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="current_password" className="mb-1 block text-sm font-bold text-gray-700">
                Current password
              </label>
              <input
                id="current_password"
                name="current_password"
                type="password"
                onChange={handleChange}
                value={values.current_password}
                className="focus:shadow-outline w-full appearance-none rounded border px-3 py-3 leading-tight text-gray-700 shadow focus:outline-none"
              />
              {touched.current_password && errors.current_password && (
                <p className="mt-1 text-xs text-red-500">{errors.current_password}</p>
              )}
            </div>
            <div>
              <label htmlFor="new_password" className="mb-1 block text-sm font-bold text-gray-700">
                New password
              </label>
              <input
                id="new_password"
                name="new_password"
                type="password"
                onChange={handleChange}
                value={values.new_password}
                className="focus:shadow-outline w-full appearance-none rounded border px-3 py-3 leading-tight text-gray-700 shadow focus:outline-none"
              />
              {touched.new_password && errors.new_password && (
                <p className="mt-1 text-xs text-red-500">{errors.new_password}</p>
              )}
            </div>
            <div>
              <label htmlFor="re_new_password" className="mb-1 block text-sm font-bold text-gray-700">
                Confirm new password
              </label>
              <input
                id="re_new_password"
                name="re_new_password"
                type="password"
                onChange={handleChange}
                value={values.re_new_password}
                className="focus:shadow-outline w-full appearance-none rounded border px-3 py-3 leading-tight text-gray-700 shadow focus:outline-none"
              />
              {touched.re_new_password && errors.re_new_password && (
                <p className="mt-1 text-xs text-red-500">{errors.re_new_password}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btnBlue w-full text-lg"
            >
              Update password
            </button>
          </form>
        </div>

        <div className="rounded-md bg-white px-3 py-8 shadow-md ring-1 md:px-12">
          <h3 className="mb-4 font-satoshi text-xl font-bold text-gray-700">Sign out</h3>
          <p className="mb-4 text-sm text-gray-500">
            You'll need to log in again to access your account.
          </p>
          <button
            onClick={() => dispatch(logout())}
            className="w-full rounded border border-gray-300 px-4 py-3 text-gray-700 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </section>
    </Layout>
  );
};

export default Profile;
