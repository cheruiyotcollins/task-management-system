import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon, FunnelIcon } from "@heroicons/react/24/solid";
import React, { Dispatch, Fragment, SetStateAction, useState } from "react";
import { sortOptions } from "../config";

interface SortOption {
  name: string;
  label: string;
}

interface SortOptionsProps {
  setMobileFiltersOpen: Dispatch<SetStateAction<boolean>>;
  handleSort: (sortBy: string) => void;
  currentSort?: string;
}

/**
 * A utility function to conditionally join Tailwind CSS classes.
 * It's a common pattern to keep your JSX clean.
 */
function classNames(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}

const SortOptions: React.FC<SortOptionsProps> = ({
  setMobileFiltersOpen,
  handleSort,
  currentSort = "",
}) => {
  return (
    <div className="flex items-center gap-4">
      {/* Sort Menu */}
      <Menu as="div" className="relative inline-block text-left z-30">
        <div>
          <Menu.Button className="group inline-flex justify-center items-center gap-2 px-5 py-2.5 text-base font-semibold text-gray-800 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-[1.02]">
            Sort by
            <ChevronDownIcon
              className="h-6 w-6 text-gray-500 group-hover:text-indigo-600 transition-colors duration-200"
              aria-hidden="true"
            />
          </Menu.Button>
        </div>

        {/* Dropdown Menu Items */}
        <Transition
          as={Fragment}
          enter="transition ease-out duration-150"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-100"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="origin-top-right absolute right-0 mt-3 w-72 rounded-2xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none p-4 animate-fadeIn">
            {/* Sort Options Section */}
            <div className="py-1">
              <p className="text-sm font-bold text-gray-600 mb-2 px-3">
                Sort by:
              </p>
              {sortOptions.map((option: SortOption) => (
                <Menu.Item key={option.name}>
                  {({ active }) => (
                    <button
                      onClick={() => handleSort(option.name)}
                      className={classNames(
                        currentSort === option.name
                          ? "font-bold text-indigo-700 bg-indigo-50"
                          : "text-gray-800",
                        active ? "bg-gray-100" : "",
                        "block px-5 py-3 text-base w-full text-left rounded-lg transition-all duration-200 ease-in-out hover:bg-gray-100 hover:text-indigo-600"
                      )}
                    >
                      {option.label}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      {/* Mobile Filters Button */}
      <button
        type="button"
        className="lg:hidden p-3 -m-3 text-gray-600 bg-gray-100 rounded-lg shadow-sm hover:text-indigo-600 hover:bg-gray-200 transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={() => setMobileFiltersOpen(true)}
      >
        <span className="sr-only">Filters</span>
        <FunnelIcon className="w-6 h-6" aria-hidden="true" />
      </button>
    </div>
  );
};

export default SortOptions;
