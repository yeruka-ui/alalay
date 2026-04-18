import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

const REMEMBERED_KEY = "@alalay/remembered_identifier";

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error };
}

export async function saveRememberedIdentifier(value: string | null) {
  if (value) {
    await AsyncStorage.setItem(REMEMBERED_KEY, value);
  } else {
    await AsyncStorage.removeItem(REMEMBERED_KEY);
  }
}

export async function getRememberedIdentifier(): Promise<string> {
  return (await AsyncStorage.getItem(REMEMBERED_KEY)) ?? "";
}
