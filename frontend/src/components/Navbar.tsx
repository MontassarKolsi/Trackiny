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
          onClick={handleLogout}
          className="rounded-lg bg-white px-4 py-2 text-black"
        >
          Logout
        </button>

      </div>


    </nav>
  );
}