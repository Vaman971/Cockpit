import { useState } from "react";
import IconMail from "../../components/Icon/IconMail";
import IconLockDots from "../../components/Icon/IconLockDots";
import { Alert, Spinner } from "flowbite-react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInSuccess,
  SignInFailure,
} from "../../redux/user/userSlice";

const LoginCover = () => {
  const [formdata, setFormData] = useState({});
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const handlechange = (e) => {
    setFormData({ ...formdata, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formdata.email || !formdata.password) {
      return dispatch(SignInFailure("Fill all the details corrrectly"));
    }

    try {
      dispatch(signInStart());

      const res = await axios.post(`${apiUrl}/auth/signIn`, formdata, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      const data = res.data;
      // console.log(res);

      if (res.status === 200) {
        dispatch(signInSuccess(data));
        navigate("/");
      } else{
        // console.log(data.message)
        dispatch(SignInFailure(data.message));
      }
      // console.log(data)
      // Process the response data as needed
    } catch (error) {
      dispatch(SignInFailure(error.response.data.message));
    }
  };

  return (
    <div>
      <div className="relative flex h-[99vh] items-center justify-center bg-cover bg-center bg-no-repeat dark:bg-[#060818] ">
        <img
          src="/images/auth/coming-soon-object1.png"
          alt="not found"
          className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2"
        />
        {/* <img src="/images/auth/coming-soon-object2.png" alt="image" className="absolute left-24 top-0 h-40 md:left-[30%] "/> */}
        <img
          src="/images/auth/coming-soon-object3.png"
          alt="not found"
          className="absolute right-0 top-0 h-[300px]"
        />
        {/* <img src="/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" /> */}
        <div className="relative flex w-full max-w-[1530px] flex-col backdrop-filter shadow-md justify-between overflow-hidden rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 lg:min-h-[758px] lg:flex-row lg:gap-10 xl:gap-0">
          <div className="relative hidden w-full items-center justify-center bg-gradient-to-r from-blue-400 to-white-20 p-5 lg:flex lg:max-w-[800px] xl:-ms-12 ltr:xl:skew-x-[14deg] rtl:xl:skew-x-[-14deg]">
            <div className="absolute inset-y-0 w-8 from-primary/10 via-transparent to-transparent ltr:-right-10 ltr:bg-gradient-to-r rtl:-left-10 rtl:bg-gradient-to-l xl:w-16 ltr:xl:-right-20 rtl:xl:-left-20"></div>
            <div className="flex flex-col justify-center items-center ltr:xl:-skew-x-[14deg] rtl:xl:skew-x-[14deg]">
              <Link
                to="/"
                className=" flex justify-start items-center"
              >
                <h1 className="-text-3xl font-extrabold !leading-snug text-primary md:text-4xl unique-font">
                  Bluebird Cockpit
                </h1>
              </Link>
              <div className="mt-24 hidden w-full max-w-[539px] lg:block">
                <img
                  src="MainLogo.png"
                  alt="Cover"
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <div className="relative flex w-full flex-col items-center justify-center gap-6 px-4 pb-16 pt-6 sm:px-6 lg:max-w-[667px]">
            <div className="flex w-full max-w-[440px] items-center gap-2 lg:absolute lg:end-6 lg:top-6 lg:max-w-full">
              <Link to="/" className="sm:w-10 md:w-20 block lg:hidden">
                <img
                  src="MainLogo.png"
                  alt="Logo"
                  className="mx-auto w-10"
                />
              </Link>
              <h1 className="-text-3xl font-extrabold !leading-snug text-primary md:text-4xl unique-font lg:hidden">
                  Bluebird Cockpit
              </h1>
            </div>
            <div className="w-full max-w-[440px] lg:mt-16">
              <div className="mb-10">
                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">
                  Sign in
                </h1>
                <p className="text-base font-bold leading-normal text-white-dark">
                  Enter your email and password to login
                </p>
              </div>
              <form
                className="space-y-5 dark:text-white"
                onSubmit={handleSubmit}
              >
                <div>
                  <label htmlFor="email">Email</label>
                  <div className="relative text-white-dark">
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter Email"
                      className="form-input ps-10 placeholder:text-white-dark"
                      onChange={handlechange}
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                      <IconMail fill={true} />
                    </span>
                  </div>
                </div>
                <div>
                  <label htmlFor="password">Password</label>
                  <div className="relative text-white-dark">
                    <input
                      id="password"
                      type="password"
                      placeholder="Enter Password"
                      className="form-input ps-10 placeholder:text-white-dark"
                      onChange={handlechange}
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                      <IconLockDots fill={true} />
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                >
                  {" "}
                  {loading ? (
                    <>
                      <Spinner size="sm" />
                      <span className="pl-3">Loading...</span>
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
              {errorMessage &&
              <Alert color='red'>{errorMessage}</Alert>
       }
              {/* <div className="relative my-7 text-center md:mb-9">
                <span className="absolute inset-x-0 top-1/2 h-px w-full -translate-y-1/2 bg-white-light dark:bg-white-dark"></span>
                <span className="relative bg-white px-2 font-bold uppercase text-white-dark dark:bg-dark dark:text-white-light">
                  or
                </span>
              </div>

              <div className="text-center dark:text-white">
                Forgot Password ?&nbsp;
                <Link
                  to="/auth/cover-register"
                  className=" text-primary underline transition hover:text-black dark:hover:text-white"
                >
                  Generate New
                </Link>
              </div> */}

            </div>
            <p className="absolute bottom-4 w-full text-center dark:text-white">
              © {new Date().getFullYear()}. TATA TECHNOLOGIES All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginCover;
