import { Facebook, Instagram, Mail, Phone, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white pt-[60px] px-5 pb-5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-10 mb-10">
          {/* Company Info Column */}
          <div className="flex flex-col gap-[15px]">
            <h3 className="text-2xl font-bold bg-gradient-to-br from-[#f093fb] to-[#f5576c] bg-clip-text text-transparent">
              Elbasha
            </h3>
            <p className="text-[#aaa] text-sm">
              Your perfect home away from home
            </p>
            <div className="flex gap-[15px] text-white cursor-pointer">
              <Facebook
                size={20}
                className="transition-all duration-300 hover:text-[#f093fb] hover:scale-110 hover:-translate-y-1"
              />
              <Instagram
                size={20}
                className="transition-all duration-300 hover:text-[#f093fb] hover:scale-110 hover:-translate-y-1"
              />
              <Twitter
                size={20}
                className="transition-all duration-300 hover:text-[#f093fb] hover:scale-110 hover:-translate-y-1"
              />
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-col gap-[15px]">
            <h4 className="text-[1.1rem] font-semibold mb-[5px]">
              Quick Links
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5 text-[#aaa] text-sm cursor-pointer">
              <li className="transition-all duration-300 hover:text-white hover:translate-x-1">
                About Us
              </li>
              <li className="transition-all duration-300 hover:text-white hover:translate-x-1">
                Rooms
              </li>
              <li className="transition-all duration-300 hover:text-white hover:translate-x-1">
                Amenities
              </li>
              <li className="transition-all duration-300 hover:text-white hover:translate-x-1">
                Contact
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="flex flex-col gap-[15px]">
            <h4 className="text-[1.1rem] font-semibold mb-[5px]">Contact</h4>
            <div className="flex items-center gap-2.5 text-[#aaa] text-sm transition-all duration-300 hover:text-white">
              <Phone size={16} className="flex-shrink-0" />
              <span>+20 1098893166</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#aaa] text-sm transition-all duration-300 hover:text-white">
              <Mail size={16} className="flex-shrink-0" />
              <span className="break-all">
                mostafa.abdulrahman1880@gmail.com
              </span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-[#333] pt-5 text-center text-[#aaa] text-sm">
          <p>© 2025 Elbasha. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
