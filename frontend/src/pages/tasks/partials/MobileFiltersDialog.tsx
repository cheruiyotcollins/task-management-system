import { Dialog, Disclosure, Transition } from "@headlessui/react";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { MinusSmallIcon, PlusSmallIcon } from "@heroicons/react/24/solid";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ITaskFilterParams, TaskStatus } from "../../../interfaces/Task";
import { useAppDispatch, useAppSelector } from "../../../store/hook";
import { RootState } from "../../../store/reducers";
import { debounce } from "lodash";

interface Props {
  filterParams: ITaskFilterParams;
  mobileFiltersOpen: boolean;
  setMobileFiltersOpen: (open: boolean) => void;
  handleSearch: (query: string) => void;
  handleStatusChange: (status: TaskStatus) => void;
  handleAssigneeChange: (assigneeId: string) => void;
  handleReset: () => void;
  isAdmin?: boolean;
}

const MobileFiltersDialog: React.FC<Props> = ({
  filterParams,
  mobileFiltersOpen,
  setMobileFiltersOpen,
  handleSearch,
  handleStatusChange,
  handleAssigneeChange,
  handleReset,
  isAdmin = false,
}) => {
  const dispatch = useAppDispatch();
  const users = useAppSelector((state: RootState) => state.auth.currentUser);
  const currentUser = useAppSelector(
    (state: RootState) => state.auth.currentUser
  );

  const [searchValue, setSearchValue] = useState<string>(filterParams.q || "");

  const closeModal = useCallback(
    () => setMobileFiltersOpen(false),
    [setMobileFiltersOpen]
  );

  const debouncedSearch = useMemo(
    () => debounce((query: string) => handleSearch(query), 300),
    [handleSearch]
  );

  useEffect(() => {
    if (filterParams.q !== searchValue) {
      setSearchValue(filterParams.q || "");
    }
  }, [filterParams.q]);

  const handleSearchInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchValue(query);
      debouncedSearch(query);
    },
    [debouncedSearch]
  );

  const applyAllFilters = () => {
    closeModal();
  };

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const statusOptions = [
    { value: "TODO", label: "To Do" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "DONE", label: "Done" },
  ];

  return (
    <Transition.Root show={mobileFiltersOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 flex z-50 lg:hidden"
        onClose={closeModal}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="transform transition ease-in-out duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition ease-in-out duration-300"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <Dialog.Panel className="ml-auto relative w-full max-w-xs h-full bg-white shadow-2xl flex flex-col overflow-y-auto rounded-l-2xl">
            <div className="sticky top-0 z-10 bg-white px-5 py-4 flex items-center justify-between border-b border-gray-100 shadow-sm">
              <Dialog.Title className="text-xl font-bold text-gray-900">
                Task Filters
              </Dialog.Title>
              <button
                type="button"
                className="rounded-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                onClick={closeModal}
              >
                <span className="sr-only">Close filters</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-20">
              <form className="space-y-8 divide-y divide-gray-100">
                <div className="px-5 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Search Tasks
                  </h3>
                  <label htmlFor="mobile-search" className="sr-only">
                    Search tasks
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="mobile-search"
                      name="search"
                      type="search"
                      className="block w-full rounded-full border-gray-200 pl-10 pr-4 py-2.5 text-sm placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                      placeholder="Search tasks..."
                      value={searchValue}
                      onChange={handleSearchInputChange}
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <Disclosure as="div" className="px-5 py-6" defaultOpen>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-center justify-between text-gray-900 transition-colors duration-200 hover:text-indigo-600">
                        <span className="font-semibold text-lg">Status</span>
                        <span className="ml-6 flex items-center text-gray-500">
                          {open ? (
                            <MinusSmallIcon className="h-5 w-5" />
                          ) : (
                            <PlusSmallIcon className="h-5 w-5" />
                          )}
                        </span>
                      </Disclosure.Button>
                      <Disclosure.Panel className="pt-5">
                        <div className="space-y-4">
                          {statusOptions.map((status) => (
                            <div
                              key={status.value}
                              className="flex items-center group cursor-pointer"
                            >
                              <input
                                id={`filter-mobile-status-${status.value}`}
                                name="status"
                                type="radio"
                                checked={filterParams.status === status.value}
                                onChange={() =>
                                  handleStatusChange(status.value as TaskStatus)
                                }
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label
                                htmlFor={`filter-mobile-status-${status.value}`}
                                className="ml-3 text-sm font-medium text-gray-700 group-hover:text-indigo-600"
                              >
                                {status.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>

                {/* Assignee Filter - Only for admins */}
                {isAdmin && (
                  <Disclosure as="div" className="px-5 py-6" defaultOpen>
                    {({ open }) => (
                      <>
                        <Disclosure.Button className="flex w-full items-center justify-between text-gray-900 transition-colors duration-200 hover:text-indigo-600">
                          <span className="font-semibold text-lg">
                            Assignee
                          </span>
                          <span className="ml-6 flex items-center text-gray-500">
                            {open ? (
                              <MinusSmallIcon className="h-5 w-5" />
                            ) : (
                              <PlusSmallIcon className="h-5 w-5" />
                            )}
                          </span>
                        </Disclosure.Button>
                        <Disclosure.Panel className="pt-5">
                          <div className="space-y-4">
                            <div className="flex items-center group cursor-pointer">
                              <input
                                id="filter-mobile-assignee-all"
                                name="assignee"
                                type="radio"
                                checked={!filterParams.assigneeId}
                                onChange={() => handleAssigneeChange("")}
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label
                                htmlFor="filter-mobile-assignee-all"
                                className="ml-3 text-sm font-medium text-gray-700 group-hover:text-indigo-600"
                              >
                                All Users
                              </label>
                            </div>
                            {users.map(
                              (user: {
                                id: React.Key | null | undefined;
                                username:
                                  | string
                                  | number
                                  | bigint
                                  | boolean
                                  | React.ReactElement<
                                      unknown,
                                      string | React.JSXElementConstructor<any>
                                    >
                                  | Iterable<React.ReactNode>
                                  | React.ReactPortal
                                  | Promise<
                                      | string
                                      | number
                                      | bigint
                                      | boolean
                                      | React.ReactPortal
                                      | React.ReactElement<
                                          unknown,
                                          | string
                                          | React.JSXElementConstructor<any>
                                        >
                                      | Iterable<React.ReactNode>
                                      | null
                                      | undefined
                                    >
                                  | null
                                  | undefined;
                              }) => (
                                <div
                                  key={user.id}
                                  className="flex items-center group cursor-pointer"
                                >
                                  <input
                                    id={`filter-mobile-assignee-${user.id}`}
                                    name="assignee"
                                    type="radio"
                                    checked={
                                      filterParams.assigneeId === user.id
                                    }
                                    onChange={() =>
                                      handleAssigneeChange(String(user.id))
                                    }
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <label
                                    htmlFor={`filter-mobile-assignee-${user.id}`}
                                    className="ml-3 text-sm font-medium text-gray-700 group-hover:text-indigo-600"
                                  >
                                    {String(user.username)}
                                  </label>
                                </div>
                              )
                            )}
                          </div>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                )}

                {/* My Tasks Filter - For regular users */}
                {!isAdmin && currentUser && (
                  <Disclosure as="div" className="px-5 py-6" defaultOpen>
                    {({ open }) => (
                      <>
                        <Disclosure.Button className="flex w-full items-center justify-between text-gray-900 transition-colors duration-200 hover:text-indigo-600">
                          <span className="font-semibold text-lg">
                            Task Ownership
                          </span>
                          <span className="ml-6 flex items-center text-gray-500">
                            {open ? (
                              <MinusSmallIcon className="h-5 w-5" />
                            ) : (
                              <PlusSmallIcon className="h-5 w-5" />
                            )}
                          </span>
                        </Disclosure.Button>
                        <Disclosure.Panel className="pt-5">
                          <div className="space-y-4">
                            <div className="flex items-center group cursor-pointer">
                              <input
                                id="filter-mobile-assignee-all"
                                name="assignee"
                                type="radio"
                                checked={!filterParams.assigneeId}
                                onChange={() => handleAssigneeChange("")}
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label
                                htmlFor="filter-mobile-assignee-all"
                                className="ml-3 text-sm font-medium text-gray-700 group-hover:text-indigo-600"
                              >
                                All Tasks
                              </label>
                            </div>
                            <div className="flex items-center group cursor-pointer">
                              <input
                                id="filter-mobile-assignee-me"
                                name="assignee"
                                type="radio"
                                checked={
                                  filterParams.assigneeId === currentUser.id
                                }
                                onChange={() =>
                                  handleAssigneeChange(currentUser.id)
                                }
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label
                                htmlFor="filter-mobile-assignee-me"
                                className="ml-3 text-sm font-medium text-gray-700 group-hover:text-indigo-600"
                              >
                                My Tasks
                              </label>
                            </div>
                          </div>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                )}
              </form>
            </div>

            <div className="absolute bottom-0 w-full bg-white border-t border-gray-200 px-5 py-4 space-y-3 shadow-lg">
              <button
                type="button"
                className="w-full rounded-lg border border-transparent bg-indigo-600 py-3 px-4 text-base font-semibold text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.01]"
                onClick={applyAllFilters}
              >
                Apply Filters
              </button>
              <button
                type="button"
                className="w-full rounded-lg border border-gray-300 py-3 px-4 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                onClick={() => {
                  handleReset();
                  setSearchValue("");
                  closeModal();
                }}
              >
                Reset Filters
              </button>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  );
};

export default React.memo(MobileFiltersDialog);
