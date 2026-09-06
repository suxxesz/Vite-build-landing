import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const isDarkThemeAtom = atomWithStorage<boolean>("isDarkTheme", true)
export const songAtom = atom<HTMLAudioElement | null>(null)

export const iconSizeAtom = atom<number>(16)

export const sessionIdAtom = atomWithStorage<string | null>("session_id", null)