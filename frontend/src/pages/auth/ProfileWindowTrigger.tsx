import React from "react";

interface ProfileWindowTriggerProps {
  avatar?: string;
  loading: boolean;
  onClick?: () => void;
}

const ProfileWindowTrigger: React.FC<ProfileWindowTriggerProps> = ({
  avatar,
  loading,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-full overflow-hidden border-2 border-white focus:outline-none"
    >
      {loading ? (
        <div className="w-full h-full bg-gray-300 animate-pulse" />
      ) : avatar ? (
        <img
          src={avatar}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
          ?
        </div>
      )}
    </button>
  );
};

export default ProfileWindowTrigger;
