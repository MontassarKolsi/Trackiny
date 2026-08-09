import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { authApi } from "../services/authApi";
import axios from "axios";


interface User {
    id: string;
    email: string;
}


interface AuthContextType {
    user: User | null;
    loading: boolean;
    loadUser: () => Promise<void>;
    logout: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | null>(null);



export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    const [user, setUser] = useState<User | null>(null);

    const [loading, setLoading] = useState(true);

    async function loadUser() {

        try {

            const response = await axios.get(
                "http://localhost:3000/auth/me",
                {
                    withCredentials: true,
                }
            );


            setUser(response.data);


        } catch (error) {

            setUser(null);

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {
        loadUser();
    }, []);


    async function logout() {

        await authApi.logout();

        setUser(null);

    }



    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                loadUser,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );

}



export function useAuth() {

    const context = useContext(AuthContext);


    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }


    return context;

}