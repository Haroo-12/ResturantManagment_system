
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabas.js";

const panelEmails = {
  owner: "ownerpanel123@gmail.com",
  manager: "managerpanel123@gmail.com",
};

const ProtectedRoute = ({ role, children }) => {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;

    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      const userEmail = data?.user?.email?.toLowerCase();
      const requiredEmail = panelEmails[role];

      if (active) {
        setAllowed(
          !error &&
          Boolean(userEmail) &&
          userEmail === requiredEmail
        );
        setLoading(false);
      }
    };

    checkUser();

    return () => {
      active = false;
    };
  }, [role]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        Checking access...
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;
