"use client";
import { getClient } from "@/lib/supabase/client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "./Button";
import { Menu, X } from "./Icons";

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setIsLoading(false);
    };
    checkAuth();

    const supabase = getClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navLinks = [
    { name: "Como Funciona", href: "#como-funciona" },
    { name: "Recursos", href: "#recursos" },
    { name: "Preços", href: "#precos" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md border-zinc-200 py-3"
          : "bg-transparent border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <a
              href="#"
              className="text-xl font-bold tracking-tighter text-zinc-900 font-display"
            >
              Procedura<span className="text-orange-600">AI</span>
            </a>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-zinc-500 hover:text-black transition-colors"
              >
                {link.name}
              </a>
            ))}
            {!isLoading &&
              (isAuthenticated ? (
                <Link href="/dashboard">
                  <Button variant="primary" size="sm">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="primary" size="sm">
                    Login
                  </Button>
                </Link>
              ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-zinc-900 hover:text-zinc-600"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-zinc-100">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-4 text-base font-medium text-zinc-600 hover:text-black border-b border-zinc-50"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 px-3">
              {!isLoading &&
                (isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button fullWidth variant="primary">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button fullWidth variant="primary">
                      Login
                    </Button>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
