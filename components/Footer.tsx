import Image from "next/image"
import Link from "next/link"
import { FaSquareXTwitter, FaSquareInstagram } from "react-icons/fa6";
import { FaFacebookSquare, FaLinkedin } from "react-icons/fa";
import { } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-[#500061] dark:bg-gray-900 text-white" >
            <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-72 ">

                    <div>
                        <Link href="/" className="font-bold text-2xl text-primary flex items-center space-x-2 pt-12 mb-4">
                            <Image
                                src="/Logo/White.svg"
                                alt="Logo"
                                width={100}
                                height={80}
                            />
                        </Link>

                        <p className="text-lg mb-4">
                            Building Smart Money Habits,
                            <br />
                            One Chore at a Time.
                        </p>

                        <div className="mt-4">
                            <p className="text-lg font-semibold mb-9 mt-16">Follow Us</p>
                            <div className="flex space-x-4 mb-16">
                                <Link href="#" className="text-white hover:text-[#efa1ed]">
                                    <FaSquareXTwitter className="h-6 w-6" />
                                </Link>
                                <Link href="#" className="text-white hover:text-[#efa1ed]">
                                    <FaLinkedin className="h-6 w-6" />
                                </Link>
                                <Link href="#" className="text-white hover:text-[#efa1ed]">
                                    <FaFacebookSquare className="h-6 w-6" />
                                </Link>
                                <Link href="#" className="text-white hover:text-[#efa1ed]">
                                    <FaSquareInstagram className="h-6 w-6" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[20px] font-semibold mb-4 pt-24">Navigation</h3>
                        <ul className="space-y-2 text-[16px]">
                            <li>
                                <Link href="/" className="hover:text-[#efa1ed]">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/about-us" className="hover:text-[#efa1ed]">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/features" className="hover:text-[#efa1ed]">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact-us" className="hover:text-[#efa1ed]">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[20px] font-semibold mb-4 pt-24">Resources</h3>
                        <ul className="space-y-2 text-[16px] ">
                            <li>
                                <Link href="/blog" className="hover:text-[#efa1ed]">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/financial-tips" className="hover:text-[#efa1ed]">
                                    Financial Tips
                                </Link>
                            </li>
                            <li>
                                <Link href="/educational-tips" className="hover:text-[#efa1ed]">
                                    Educational Tips
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="hover:text-[#efa1ed]">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                </div>
                <div className="border-t-[#efa1ed]  border-t  py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm">© 2025 Waya. All Rights Reserved.</p>
                        <div className="flex space-x-4 mt-4 md:mt-0">
                            <Link href="/terms" className="hover:text-[#efa1ed]">
                                Terms & Use
                            </Link>
                            <Link href="/privacy" className="hover:text-[#efa1ed]">
                                Privacy policy
                            </Link>
                            <Link href="/service" className="hover:text-[#efa1ed]">
                                Service agreement
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

        </footer>
    )
}
export default Footer