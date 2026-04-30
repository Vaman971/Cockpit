import React, { useState } from "react";
import {Alert, Spinner} from "flowbite-react";
import axios from 'axios';

import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInSuccess,
  SignInFailure,
} from "../../redux/user/userSlice";

const SignIn = () => {
  const [formdata, setFormData] = useState({});
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL

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
      
      const res = await axios.post(
        `${apiUrl}/auth/signIn`,
        formdata,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = res.data;
      // console.log(data);
      if (data.success === false) {
        dispatch(SignInFailure(data.message));
      }

      if (res.status === 200) {
        dispatch(signInSuccess(data));
        navigate("/");
      }
      // console.log(data)
      // Process the response data as needed
    } catch (error) {
      dispatch(SignInFailure("Incorrect Email or password!!"));
    }
  };

  return (
    
    <section className="bg-blue-100 shadow-gray-900 dark:bg-gray-900 ">
      
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <a
              href="https://tatatechnologies.sharepoint.com/sites/Bluebird9"
              className="flex items-center mb-6 text-2xl font-bold text-blue-800 dark:text-white"
            >
              <img className="w-32 h-18 mr-2" src="MainLogo.png" alt="logo" />
              Bluebird Cockpit
            </a>
            <h1 className="text-xl font-bold leading-tight tracking-tight text-blue-800 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-blue-800 dark:text-white"
                >
                  Your email
                </label>

                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                  required=""
                  onChange={handlechange}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-blue-800 dark:text-white"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required=""
                  onChange={handlechange}
                />
              </div>
              {/* <div className="flex items-center justify-between">
                          <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required="" />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="remember" className="text-blue-800 dark:text-gray-300">Remember me</label>
                              </div>
                          </div>
                          <a href="#" className="text-sm font-medium text-blue-800 hover:underline dark:text-primary-500">Forgot password?</a>
                      </div> */}
              <button
                type="submit"
                className="w-full text-white bg-blue-800 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
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
              {errorMessage &&
              <Alert color='red'>{errorMessage}</Alert>
       }
              {/* <p className="text-sm font-light text-blue-800 dark:text-gray-400">
                          Don't have an account yet?  <Link to='/sign-up' className="font-medium text-blue-800 hover:underline dark:text-primary-500">Sign Up</Link>
                      </p> */}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
