import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { supabase } from "../utils/supabase";

export default function Index() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setReady(true);
    });
  }, []);

  if (!ready) return <View style={{ flex: 1 }} />;
  return <Redirect href={authed ? "/dashboard" : "/login"} />;
}
