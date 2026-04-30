import { Footer } from "flowbite-react";
import { Link } from "react-router-dom";
import {BsFacebook, BsInstagram, BsTwitter, BsLinkedin} from 'react-icons/bs'
import React from "react";
import Logo from "../../assets/Logo.jpg";


export default function FooterComp() {
  return (
    <Footer className="bg-gray-100 footer">
      <div className="w-full max-w-7xl mx-auto">
        {/* <div className="grid w-full justify-between sm:flex md:grid-col-2 lg:grid-col-1 md:gap-2 p-3">
          <div className="mt-3">
            <Link
              to="/"
              className="self-center whitespace-nowrap text-lg sm:text-xl font-semibold dark:text-white"
            >
                <img src={Logo} alt="Tata Technologies Logo" className=" w-80 " />
                <p className="">Engineering a better World!</p>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-8 mt-4 md:grid-cols-3 sm:gap-6 mr-6 pl-3">
            <div >
              <Footer.Title title="About" className="text-black" />
              <Footer.LinkGroup col className="text-blue-800">
                <Footer.Link href="#" target="_blank" rel="noopener noreferrer">
                  Projects
                </Footer.Link>
                <Footer.Link href="#" target="_blank" rel="noopener noreferrer">
                  Dashboard
                </Footer.Link>
              </Footer.LinkGroup>
            </div>

            <div>
              <Footer.Title title="Follow us"  className="text-black"/>
              <Footer.LinkGroup col className="text-blue-800">
                <Footer.Link href="#" target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </Footer.Link>
                <Footer.Link href="#" target="_blank" rel="noopener noreferrer">
                  Instagram
                </Footer.Link>
                <Footer.Link href="#" target="_blank" rel="noopener noreferrer">
                  Facebook
                </Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title="Legal" className="text-black" />
              <Footer.LinkGroup col className="text-blue-800">
                <Footer.Link href="#" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </Footer.Link>
                <Footer.Link href="#" target="_blank" rel="noopener noreferrer">
                  Terms &amp; Conditions
                </Footer.Link>
              </Footer.LinkGroup>
            </div>
          </div>
        </div> */}
        <Footer.Divider color="black" className="smalldiv"/>
        <div className="w-full p-4 sm:flex sm:items-center sm:justify-between">
            <Footer.Copyright href="#" by="Tata Technologies" year={new Date().getFullYear()} className="text-black"/>
            <div className="flex gap-6 sm:mt-0 mt-4 sm:justify-center">
                <Footer.Icon href="#" icon={BsFacebook}  className="text-blue-800"/>
                <Footer.Icon href="#" icon={BsInstagram} className = "text-blue-800"/>
                <Footer.Icon href="#" icon={BsTwitter} className = "text-blue-800"/>
                <Footer.Icon href="#" icon={BsLinkedin} className = "text-blue-800"/>
            </div>
        </div>
      </div>
    </Footer>
  );
}