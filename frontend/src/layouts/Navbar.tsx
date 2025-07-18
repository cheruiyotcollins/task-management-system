import { Disclosure, Menu, Transition, Dialog } from "@headlessui/react";
import MobileMenu from "./MobileMenu";
import Swal from "sweetalert2";
import {
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  KeyIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../store/hook";
import { Link, matchPath, useLocation, useNavigate } from "react-router-dom";
import {
  logOut,
  fetchCurrentUser,
  CustomApiError,
  attemptRefreshtoken,
} from "../store/auth/actions";
import { RootState } from "../store/reducers";
import { AdminMenuItems } from "./AdminMenuItems";
import { UserMenuItems } from "./UserMenuItems";
import { AdminProfileMenuItems } from "./AdminProfileMenuItems";
import { UserProfileMenuItems } from "./UserProfileMenuItems";
import { IUser } from "../interfaces/Auth";

const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(" ");
};

const Navbar: React.FC = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSessionExpiredDialog, setShowSessionExpiredDialog] =
    useState(false);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return !!matchPath(path, location.pathname);
  };

  const isAdmin = isLoggedIn && !isLoading && user?.roles === "ADMIN";
  const isUser = isLoggedIn && !isLoading && user?.roles === "USER";

  const handleLogOut = async () => {
    const result = await Swal.fire({
      title: "Log out?",
      text: "Are you sure you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(logOut());
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        navigate("/login");
      } catch (error) {
        console.error("Logout error:", error);
        Swal.fire("Oops!", "Something went wrong while logging out.", "error");
      }
    }
  };

  const getInitials = (username?: string) => {
    if (!username) return "U";
    return username.charAt(0).toUpperCase();
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      if (token && refreshToken) {
        try {
          setIsLoading(true);

          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser) as IUser;
              setUser(parsedUser);
            } catch (error) {
              console.error("Error parsing stored user:", error);
            }
          }

          await dispatch(
            fetchCurrentUser(
              (data) => {
                setUser(data);
                localStorage.setItem("user", JSON.stringify(data));
                setIsLoading(false);
              },
              async (err: CustomApiError) => {
                if (err?.status === 401) {
                  await dispatch(
                    attemptRefreshtoken(
                      refreshToken,
                      async () => {
                        await dispatch(
                          fetchCurrentUser(
                            (data) => {
                              setUser(data);
                              localStorage.setItem(
                                "user",
                                JSON.stringify(data)
                              );
                              setIsLoading(false);
                            },
                            (refreshErr: CustomApiError) => {
                              handleAuthError(refreshErr);
                            }
                          )
                        );
                      },
                      (refreshError: CustomApiError) => {
                        handleAuthError(refreshError);
                      }
                    )
                  );
                } else {
                  handleAuthError(err);
                }
              }
            )
          );
        } catch (error) {
          handleAuthError(error);
        }
      } else {
        setIsLoading(false);
      }
    };

    const handleAuthError = (error: any) => {
      console.error("Authentication error:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      setShowSessionExpiredDialog(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [dispatch, navigate]);

  const handleDialogLogin = () => {
    setShowSessionExpiredDialog(false);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleDialogGoHome = () => {
    setShowSessionExpiredDialog(false);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (isLoading && isLoggedIn) {
    return (
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 shadow-xl h-16 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="animate-pulse bg-blue-600 h-8 w-32 rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Disclosure
        as="nav"
        className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 shadow-xl sticky top-0 z-40"
      >
        {({ open, close }) => (
          <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative flex items-center justify-between h-16">
                {/* Mobile menu button and logo */}
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-600/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-all duration-200">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                  <div className="ml-12">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      TaskFlow
                    </h1>
                  </div>
                </div>

                {/* Desktop logo and menu */}
                <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="flex-shrink-0 flex items-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent hidden sm:block">
                      TaskFlow
                    </h1>
                  </div>
                  <div className="hidden sm:block sm:ml-6">
                    <div className="flex space-x-1">
                      <Link
                        to="/dashboard"
                        className={classNames(
                          isActive("/dashboard")
                            ? "bg-white/10 text-white shadow-inner"
                            : "text-blue-100 hover:bg-white/5 hover:text-white",
                          "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center"
                        )}
                      >
                        <span className="relative">
                          Dashboard
                          {isActive("/dashboard") && (
                            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-300 rounded-full"></span>
                          )}
                        </span>
                      </Link>

                      {!isLoading && (
                        <>
                          {isAdmin && <AdminMenuItems isActive={isActive} />}
                          {isUser && <UserMenuItems isActive={isActive} />}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side icons */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 space-x-3">
                  {isLoggedIn ? (
                    <>
                      <button
                        type="button"
                        className="p-2 rounded-full text-blue-200 hover:text-white hover:bg-white/10 focus:outline-none transition-all duration-200 group"
                      >
                        <BellIcon
                          className="h-6 w-6 group-hover:scale-110 transition-transform"
                          aria-hidden="true"
                        />
                        <span className="sr-only">View notifications</span>
                      </button>

                      {/* Profile dropdown */}
                      <Menu as="div" className="relative">
                        <div>
                          <Menu.Button className="bg-white/10 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900 transition-all duration-200 hover:bg-white/20">
                            {user?.profileImagePath ? (
                              <img
                                className="h-8 w-8 rounded-full border-2 border-white/30 hover:border-white/50"
                                src={user.profileImagePath}
                                alt={user.username}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full border-2 border-white/30 hover:border-white/50 bg-blue-600 flex items-center justify-center text-white font-medium hover:bg-blue-700">
                                {getInitials(user?.username)}
                              </div>
                            )}
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50 divide-y divide-gray-100">
                            <div className="px-4 py-3">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.username}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {user?.email}
                              </p>
                            </div>

                            <div className="py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    to="/profile"
                                    className={classNames(
                                      active
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700",
                                      "group flex items-center px-4 py-2 text-sm hover:text-blue-600 transition-colors"
                                    )}
                                  >
                                    <UserIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                                    Your Profile
                                  </Link>
                                )}
                              </Menu.Item>

                              {isUser && <UserProfileMenuItems />}
                              {isAdmin && <AdminProfileMenuItems />}
                            </div>

                            <div className="py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    to="/settings/profile"
                                    className={classNames(
                                      active
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700",
                                      "group flex items-center px-4 py-2 text-sm hover:text-blue-600 transition-colors"
                                    )}
                                  >
                                    <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                                    Profile Settings
                                  </Link>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    to="/settings/password"
                                    className={classNames(
                                      active
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700",
                                      "group flex items-center px-4 py-2 text-sm hover:text-blue-600 transition-colors"
                                    )}
                                  >
                                    <KeyIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                                    Change Password
                                  </Link>
                                )}
                              </Menu.Item>
                            </div>

                            <div className="py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={handleLogOut}
                                    className={classNames(
                                      active
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700",
                                      "w-full text-left group flex items-center px-4 py-2 text-sm hover:text-blue-600 transition-colors"
                                    )}
                                  >
                                    <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                                    Sign out
                                  </button>
                                )}
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </>
                  ) : (
                    <>
                      <Menu as="div" className="relative">
                        <div>
                          <Menu.Button className="bg-white/10 p-2 rounded-full text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-900 focus:ring-white transition-all duration-200">
                            <UserIcon className="h-6 w-6" aria-hidden="true" />
                            <span className="sr-only">User menu</span>
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50 divide-y divide-gray-100">
                            <div className="py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    to="/login"
                                    className={classNames(
                                      active
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700",
                                      "block px-4 py-2 text-sm hover:text-blue-600 transition-colors"
                                    )}
                                  >
                                    Login
                                  </Link>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    to="/register"
                                    className={classNames(
                                      active
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700",
                                      "block px-4 py-2 text-sm hover:text-blue-600 transition-colors"
                                    )}
                                  >
                                    Register
                                  </Link>
                                )}
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </>
                  )}
                </div>
              </div>
            </div>

            <MobileMenu
              isAdmin={isAdmin}
              isUser={isUser}
              closeMobileMenu={close}
              getInitials={getInitials}
              isLoggedIn={isLoggedIn}
              user={user}
              handleLogOut={handleLogOut}
              isActive={isActive}
            />
          </>
        )}
      </Disclosure>

      {/* Session Expired Dialog */}
      <Transition appear show={showSessionExpiredDialog} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => {
            /* Prevent closing on backdrop click for security */
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                      <ArrowRightOnRectangleIcon
                        className="h-6 w-6 text-red-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        Session Expired
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Your session has expired. Please log in again to
                          continue, or go to the home page.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-base font-medium text-white shadow-sm hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm transition-all duration-200"
                      onClick={handleDialogLogin}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm transition-all duration-200"
                      onClick={handleDialogGoHome}
                    >
                      Go to Home
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Navbar;
