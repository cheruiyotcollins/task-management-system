/**
 * Converts an order status string (e.g., "PENDING_PAYMENT") into a human-readable display string
 * (e.g., "Pending Payment").
 *
 * @param status The raw order status string from the backend.
 * @returns A formatted, human-readable string for the order status.
 */
export const getStatusDisplay = (status: string): string => {
  if (!status) {
    return "Unknown Status";
  }
  return status
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Returns a Tailwind CSS text color class based on the order status.
 * Optimized for dark backgrounds.
 *
 * @param status The raw order status string from the backend.
 * @returns A Tailwind CSS class string (e.g., "text-green-300").
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "DELIVERED":
      return "text-green-300";
    case "SHIPPED":
      return "text-blue-300";
    case "CANCELLED":
      return "text-red-300";
    case "PENDING_PAYMENT":
    case "PAYMENT_CONFIRMED":
    case "PROCESSING":
      return "text-yellow-300";
    default:
      return "text-gray-300";
  }
};

/**
 * Returns a Tailwind CSS background color class for the status badge.
 * Optimized for dark backgrounds.
 *
 * @param status The raw order status string from the backend.
 * @returns A Tailwind CSS class string (e.g., "bg-green-800").
 */
export const getStatusBgColor = (status: string): string => {
  switch (status) {
    case "DELIVERED":
      return "bg-green-800";
    case "SHIPPED":
      return "bg-blue-800";
    case "CANCELLED":
      return "bg-red-800";
    case "PENDING_PAYMENT":
    case "PAYMENT_CONFIRMED":
    case "PROCESSING":
      return "bg-yellow-800";
    default:
      return "bg-gray-800";
  }
};
