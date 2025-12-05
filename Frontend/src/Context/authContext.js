import { createContext } from "react";


const AuthContext=createContext(null);

export const AuthProvider=({children})=>{
    const [user,setUser]=useState(null);
    const [token,setToken]=useState(null);

    useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

return (
    <AuthContext.Provider value={{ user, token}}>
      {children}
    </AuthContext.Provider>
  );
  
}

export default AuthContext;