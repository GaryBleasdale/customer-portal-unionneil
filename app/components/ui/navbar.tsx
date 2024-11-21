import { Form, Link } from "@remix-run/react";
import PortalUNLogo from "/PortalUNLogo_2.png";

type User = {
  id: string;
  email: string;
  name?: string;
  role: "ADMIN" | "CUSTOMER";
};

type NavbarProps = {
  user: User | null;
};

export function Navbar({ user }: NavbarProps) {
  return (
    <nav className="bg-white shadow fixed w-full top-0">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex justify-between">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">
                <img
                  src={PortalUNLogo}
                  alt="PortalUN Logo"
                  className="ml-2 w-[60px] md:w-[90px]"
                />
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{user.name || user.email}</span>
                <Form action="/logout" method="post">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Logout
                  </button>
                </Form>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-gray-900">
                  Login
                </Link>
                <Link
                  to="/cadastro"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Cadastro
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
