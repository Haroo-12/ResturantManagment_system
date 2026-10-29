import React, { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import logo from '../assets/logo.jpg'
const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.09 24 12.07z" />
  </svg>
);

const InstagramIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const contactInfo = [
  {
    id: 1,
    label: "Phone:",
    value: "92 339 6363363",
    href: "https://www.instagram.com/6.3coffee/",
  },
  {
    id: 2,
    label: "Email:",
    value: "Visit our Instagram for inquiries",
    href: "https://www.instagram.com/6.3coffee/",
  },
  {
    id: 3,
    label: "Address:",
    value: "182 CCA, Block C, DHA Phase 6, Lahore, Pakistan",
    href: "https://www.google.com/maps/search/?api=1&query=6.3+Coffee+182+CCA+DHA+Phase+6+Lahore",
  },
];

const socials = [
  {
    id: 1,
    name: "Facebook",
    icon: FacebookIcon,
    href: "https://www.facebook.com/",
    color: "text-blue-600",
  },
  {
    id: 2,
    name: "Instagram",
    icon: InstagramIcon,
    href: "https://www.instagram.com/6.3coffee/",
    color: "text-pink-600",
  },
];

const links = [
  { id: 1, label: "Privacy Policy", href: "/privacy" },
  { id: 2, label: "FAQs", href: "/faqs" },
];

const Footer = () => {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="w-full bg-white px-4 sm:px-8 lg:px-14 pt-25">
      <div className="mx-auto max-w-[1200px] grid gap-6 md:grid-cols-[auto_1fr_auto] md:gap-10 items-start">
        {/* Logo */}
  <div className="size-24 sm:size-28 md:size-32 mx-auto md:mx-0">
  <img
    src={logo}
    alt="Costa Coffee Logo"
    className="w-full h-full rounded-full object-contain"
  />
</div>

        {/* Contact */}
        <div className="text-center md:text-left">
          <h3 className="text-base sm:text-lg font-bold text-slate-800">Costa Coffee</h3>
          <ul className="mt-2 space-y-1.5 text-xs sm:text-sm">
            {contactInfo.map(({ id, label, value, href }) => (
              <li key={id}>
                <span className="mr-1.5 font-bold text-slate-800">{label}</span>
                {href ? (
                  <a href={href} className="text-slate-600 hover:text-[var(--color-primary-600)]">
                    {value}
                  </a>
                ) : (
                  <span className="text-slate-600">{value}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Follow + links */}
        <div className="text-center md:text-left">
          <h3 className="text-base sm:text-lg font-bold text-slate-800">Follow Us:</h3>

          <div className="mt-2 flex justify-center md:justify-start gap-3">
            {socials.map(({ id, name, icon: Icon, href, color }) => (
              <a key={id} href={href} aria-label={name} className={`${color} transition hover:scale-110`}>
                <Icon className="size-6 sm:size-7" />
              </a>
            ))}
          </div>

          <div className="mt-4 flex justify-center md:justify-start gap-4 text-xs sm:text-sm">
            {links.map(({ id, label, href }) => (
              <a
                key={id}
                href={href}
                className="text-slate-600 underline hover:text-[var(--color-primary-600)]"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto mt-6 max-w-[1200px] border-t border-gray-200 py-4 text-center text-xs sm:text-sm text-slate-600">
        © 2026 Powered by <span className="font-extrabold text-slate-900">Bizvoro</span>
      </div>

      {/* Scroll to top */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed bottom-28 right-5 z-40 grid place-items-center size-11 sm:size-12 rounded-xl text-white shadow-lg transition-all duration-300 hover:brightness-110 active:scale-95 ${
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
        style={{ background: "var(--gradient-primary)" }}
      >
        <ChevronUp className="size-6" strokeWidth={2.5} />
      </button>
    </footer>
  );
};

export default Footer;