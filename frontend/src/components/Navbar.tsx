import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


export default function Navbar() {

  const {
    user,
    logout,
  } = useAuth();


  const navigate = useNavigate();



  async function handleLogout() {

    await logout();

    navigate("/login", { replace: true });

  }

  const publicProfileUrl = `${window.location.origin}/users/${user.id}`;

  async function handleShareProfile() {
    await navigator.clipboard.writeText(publicProfileUrl);
  }


  return (
    <nav className="flex items-center justify-between bg-black px-8 py-4 text-white">

      <h1 className="text-xl font-bold">
        Trackiny
      </h1>


      <div className="flex items-center gap-4">

        <span>
          {user?.email}
        </span>

        <button
          onClick={handleShareProfile}
          className="rounded-lg bg-white px-4 py-2 text-black transition hover:bg-gray-200"
        >
          Share profile
        </button>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-white px-4 py-2 text-black"
        >
          Logout
        </button>

      </div>


    </nav>
  );
}