import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "./firebase";
import { AnimatePresence, motion } from 'framer-motion'
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Cargando...</div>;
    }

       return (
           <AnimatePresence mode="wait">
             {!user ? (
               <motion.div
                 key="login"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.5 }}
               >
                 <Login />
               </motion.div>
             ) : (
                <motion.div
                 key="dashboard"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.5 }}
               >
                 <Dashboard
                   user={user?.email ?? ''}
                   onLogout={() => signOut(auth)}
                 />
               </motion.div>
             )}
           </AnimatePresence>
       );
}

export default App;
